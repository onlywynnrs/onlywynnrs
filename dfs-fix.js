/* ============================================================================
 * OnlyWynnrs — dfs-fix.js  (v4)
 * Load LAST (after owleverage.js, app.js, owleverage-patch.js).
 * v4: Min$/Max$/Min Proj are LINEUP-LEVEL limits (total salary / total proj
 * points), exposure is a HARD guarantee, uniqueness is enforced strictly when
 * it doesn't conflict with exposure and best-effort (reported) when it does.
 * Plus: live ml/lineMove consumption from the slate, balanced tags, current odds.
 * ==========================================================================*/
(function () {
  "use strict";
  if (!window.OWLeverage) { console.warn('[dfs-fix] OWLeverage missing — aborting.'); return; }

  var MACAU = {
    'Song Yadong':{ml:-600,fin:0.60,rec:'22-9-1',main:true},'Deiveson Figueiredo':{ml:440,fin:0.55,rec:'25-6-1',main:true},
    'Sergei Pavlovich':{ml:-620,fin:0.85,rec:'20-3-0'},'Tallison Teixeira':{ml:430,fin:0.60,rec:'9-1-0'},
    'Jake Matthews':{ml:-430,fin:0.50,rec:'22-8-0'},'Carlston Harris':{ml:310,fin:0.55,rec:'19-7-0'},
    'Kai Asakura':{ml:-300,fin:0.70,rec:'21-6-0'},'Cameron Smotherman':{ml:245,fin:0.45,rec:'12-6-0'},
    'Zhang Mingyang':{ml:-255,fin:0.82,rec:'19-7-0'},'Alonzo Menifield':{ml:200,fin:0.65,rec:'17-6-1'},
    'Rei Tsuruya':{ml:-285,fin:0.35,rec:'10-1-0'},'Luis Gurule':{ml:212,fin:0.40,rec:'11-3-0'},
    'Alex Perez':{ml:-160,fin:0.55,rec:'26-10-0'},'Su Mudaerji':{ml:130,fin:0.60,rec:'19-7-0'},
    'Ding Meng':{ml:-120,fin:0.55,rec:'35-9-0'},'Jose Henrique Souza':{ml:100,fin:0.55,rec:'8-1-0'},
    'Jaqueline Amorim':{ml:-120,fin:0.55,rec:'10-2-0'},'Loma Lookboonmee':{ml:100,fin:0.30,rec:'10-4-0'},
    'Rodrigo Vera':{ml:-115,fin:0.50,rec:'21-1-1'},'Kangjie Zhu':{ml:-105,fin:0.45,rec:'21-4-0'},
    'Luis Felipe Dias':{ml:-183,fin:0.60,rec:'16-5-0'},'Yi Sak Lee':{ml:142,fin:0.45,rec:'8-1-0'},
    'Jingnan Xiong':{ml:-177,fin:0.50,rec:'14-1-0'},'Angela Hill':{ml:156,fin:0.30,rec:'18-16-0'},
    'Cody Haddon':{ml:-391,fin:0.65,rec:'8-1-0'},'Aori Qileng':{ml:285,fin:0.45,rec:'26-11-0'}
  };
  var lastName = function (n) { return (n || '').trim().split(/\s+/).pop().toLowerCase(); };
  function pctl(s, p) { var i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); }

  function ownSpread(players) {
    var o = players.map(function (p) { return p.fieldOwn || 0; });
    var m = o.reduce(function (a, b) { return a + b; }, 0) / (o.length || 1);
    var sd = Math.sqrt(o.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / (o.length || 1));
    return sd; // low SD (~<9) = balanced/clustered slate
  }
  function reTag(players) {
    var vals = players.map(function (p) { return p.value || 0; }).sort(function (a, b) { return a - b; });
    var fins = players.map(function (p) { return p.finishEquity || 0; }).sort(function (a, b) { return a - b; });
    var valMed = pctl(vals, 0.5), valP60 = pctl(vals, 0.60);
    var clustered = ownSpread(players) < 9;
    var finBar = clustered ? pctl(fins, 0.45) : pctl(fins, 0.55);
    var finHi = pctl(fins, 0.65);                       // high finish equity
    // ownership-aware leverage sanity: a top-owned fighter cannot be a "leverage"
    // play, and extreme positive leverage on a clear underdog is almost always a
    // projection outlier (small-sample blowout), so damp it.
    var ownSortedDesc = players.map(function (p) { return p.fieldOwn || 0; }).sort(function (a, b) { return b - a; });
    var ownTop5 = ownSortedDesc[Math.min(4, ownSortedDesc.length - 1)] || 99;
    var ownSortedAsc = players.map(function (p) { return p.fieldOwn || 0; }).sort(function (a, b) { return a - b; });
    var ownBottomBar = ownSortedAsc[Math.min(2, ownSortedAsc.length - 1)] || 0;   // ~3 lowest-owned only
    players.forEach(function (p) {
      var _own = p.fieldOwn || 0, _wp = p.winProb || 0.5;
      if (_own >= ownTop5 && p.leverage > 0) p.leverage = Math.min(p.leverage, 0.5);   // highly-owned can't be high leverage
      if (_wp < 0.50 && p.leverage > 5) p.leverage = 5 - (0.50 - _wp) * 14;             // damp outlier-driven dog leverage (coin-flip+ can't be huge-leverage)
    });
    players.forEach(function (p) {
      var wp = p.winProb || 0.5, lev = p.leverage || 0, own = p.fieldOwn || 0, fe = p.finishEquity || 0, val = p.value || 0, sal = (p.sal && p.sal.dk) || p.salary || 0, t, why;
      var levBar = clustered ? 2.0 : 2.5;
      var W = Math.round(wp * 100), O = Math.round(own), opp = (p.opp || '').replace(/^vs\s*/i, ''), mv = p.lineMove || 0;
      // fighter-specific detail clause built from real numbers
      var bits = [];
      bits.push(W + '% to win vs ' + (opp || 'opp'));
      // finish vs decision is RELATIVE to this slate (finHi/finBar are percentile
      // bars from earlier), not absolute — otherwise everyone reads "decision-leaning"
      // since finishEquity = lean*winProb rarely exceeds 0.6 in absolute terms.
      if (fe >= finHi) bits.push('strong finish upside');
      else if (fe <= finBar * 0.7) bits.push('decision-leaning');
      // (middle band gets no finish descriptor — avoids mislabeling)
      if (val >= 9) bits.push('elite $/pt'); else if (val <= 5.5) bits.push('thin value at $' + sal.toLocaleString());
      if (mv) bits.push('line ' + (mv > 0 ? 'steaming +' + mv : 'drifting ' + mv));
      if (p.record) bits.push(p.record);
      var detail = bits.join(', ') + '.';
      // ── Article framework, in priority order ──
      if (own >= 28 && lev <= -1.5 && fe < finBar) {
        t = 'chalk'; p.gtTag = 'trap'; why = 'TRAP — ' + O + '% owned but ' + detail + ' Field over-rosters a fighter who wins by decision more than finish; pivot off in GPP.';
      } else if (lev >= levBar && wp >= 0.58) {
        t = 'leverage'; p.gtTag = 'lev-chalk'; why = 'POSITIVE-LEVERAGE CHALK — ' + detail + ' A favorite the field underrates at ' + O + '% own. Chalk you actively want; anchor here.';
      } else if (wp < 0.4 && fe >= finBar && own < 15) {
        t = 'contrarian'; p.gtTag = 'finish-dart'; why = 'FINISH DART — ' + detail + ' Low win% but real stoppage power at ' + O + '% own. Sprinkle in 1–2 entries; wins the tournament if they land.';
      } else if (wp >= 0.72) {
        // Heavy favorites are anchors regardless of value ratio — an 80%+ winner
        // is build-around stability, never "mid-tier value filler".
        t = 'anchor'; p.gtTag = 'anchor'; why = 'ANCHOR — ' + detail + ' Heavy favorite; high-floor build-around stability.';
      } else if (wp >= 0.60 && val >= valMed * 0.85 && lev > -1.5) {
        t = 'anchor'; p.gtTag = 'anchor'; why = 'ANCHOR — ' + detail + ' Reliable favorite at fair value; build-around stability.';
      } else if (lev >= levBar && wp >= 0.40) {
        // leverage requires at least a live win chance — a deep dog is a dart, not leverage
        t = 'leverage'; p.gtTag = 'leverage'; why = 'LEVERAGE — ' + detail + ' Underowned (' + O + '%) vs merit; differentiates your build when they hit.';
      } else if (fe >= finHi && wp >= 0.42 && own < 32) {
        t = 'ceiling'; p.gtTag = 'ceiling'; why = 'CEILING — ' + detail + ' High finish equity at ' + O + '% own; this is where GPP-winning points come from.';
      } else if (own >= 30 && lev <= -1) {
        t = 'chalk'; p.gtTag = 'chalk'; why = 'CHALK — ' + detail + ' High-owned (' + O + '%) and fairly priced; safe but ties you to the field, needs a finish to pay off.';
      } else if (wp < 0.32 || own < 12) {
        // deep underdogs / lowest-owned are contrarian darts (checked BEFORE value
        // so a 14%-win longshot never reads as "value" or "leverage")
        t = 'contrarian'; p.gtTag = 'contrarian';
        var ownDesc = (own <= ownBottomBar) ? 'Lowest-owned dart (' + O + '%)' : 'Low-owned dart (' + O + '%)';
        why = 'CONTRARIAN — ' + detail + ' ' + ownDesc + '; highest variance, large-GPP moonshot only.';
      } else if (val >= valP60 && sal <= 8300) {
        t = 'value'; p.gtTag = 'value'; why = 'VALUE — ' + detail + ' Salary saver that frees cap for anchors.';
      } else {
        t = 'value'; p.gtTag = 'value'; why = 'VALUE — ' + detail + ' Mid-tier filler at ' + O + '% own; fair price, no standout edge.';
      }
      p.tag = t;
      p.gtRole = why;
      var base = (p.signal || '').replace(/^(TRAP|POSITIVE-LEVERAGE CHALK|FINISH DART|LEVERAGE|CEILING|ANCHOR|CHALK|VALUE|CONTRARIAN)[^.]*\.\s*/, '');
      p.signal = why;
      p.corr = why;
    });
  }
  // ── House signal: fold our OWN picks desk + sharp data into ownership/leverage ──
  // Our published picks (FM_PICKS / PICKS) and SHARP_DATA are a real edge the market
  // moneyline doesn't capture. A fighter our desk is on: (a) our subscribers roster more
  // (raise field own slightly) and (b) carries genuine merit signal (raise merit own ->
  // leverage). This mirrors how getPlayerIntelScore already treats them for the optimizer.
  function lc(s) { return (s || '').toLowerCase(); }
  function nameHit(hay, fullName) { var ln = fullName.trim().split(/\s+/).pop().toLowerCase(); return ln.length > 2 && lc(hay).indexOf(ln) > -1; }
  function applyHouseSignal(players) {
    var FM = (window.FM_PICKS || (typeof FM_PICKS !== 'undefined' ? FM_PICKS : [])) || [];
    var PK = (window.PICKS || (typeof PICKS !== 'undefined' ? PICKS : [])) || [];
    var SD = (window.SHARP_DATA || (typeof SHARP_DATA !== 'undefined' ? SHARP_DATA : [])) || [];
    players.forEach(function (p) {
      var fieldBump = 0, meritBump = 0, notes = [];
      FM.forEach(function (pk) { if (nameHit(pk.call, p.name)) { fieldBump += 4; meritBump += 5; notes.push('FREE pick'); } });
      PK.forEach(function (pk) { if (pk.sport && pk.sport !== 'ufc') return; if (nameHit(pk.call, p.name)) { var w = pk.rating === 'HIGH' ? 3 : pk.rating === 'STD' ? 2 : 1.5; fieldBump += w; meritBump += w + 1; notes.push((pk.rating || '') + ' pick'); } });
      SD.forEach(function (sd) {
        var parts = lc(sd.game).split(' vs '); if (parts.length < 2) return;
        var f1 = parts[0].trim(), f2 = parts[1].trim(), ln = p.name.trim().split(/\s+/).pop().toLowerCase();
        var isF1 = f1.indexOf(ln) > -1, isF2 = f2.indexOf(ln) > -1; if (!isF1 && !isF2) return;
        var sharpsOnF1 = (sd.sharp || 50) >= 50, sharpOnThis = (isF1 && sharpsOnF1) || (isF2 && !sharpsOnF1);
        if (sd.sig === 'hot') { if (sharpOnThis) { var b = Math.round(((sd.sharp || 50) - 50) * 0.12); fieldBump += b * 0.5; meritBump += b; notes.push('STEAM ' + (sd.sharp || 50) + '% sharp'); } else { meritBump -= 3; } }
        else if (sharpsOnF1 !== ((sd.pub || 50) >= 50)) { if (sharpOnThis) { fieldBump += 2; meritBump += 5; notes.push('RLM sharp side'); } }
      });
      if (fieldBump || meritBump) {
        p.fieldOwn = Math.round((p.fieldOwn + fieldBump) * 10) / 10;
        p.meritOwn = Math.round((p.meritOwn + meritBump) * 10) / 10;
        p.leverage = Math.round((p.meritOwn - p.fieldOwn) * 10) / 10;
        if (notes.length) { p.signal = (p.signal || '') + ' · House: ' + notes.slice(0, 2).join(', '); p.corr = p.signal; }
      }
    });
  }
  function applyLineMove(players) {
    players.forEach(function (p) {
      var mv = p.lineMove || 0; if (!mv) return;
      p.meritOwn = Math.round((p.meritOwn + mv * 0.5) * 10) / 10;
      p.leverage = Math.round((p.meritOwn - p.fieldOwn) * 10) / 10;
      p.signal = (p.signal || '') + ' · Line ' + (mv > 0 ? 'steam +' + mv : 'drift ' + mv); p.corr = p.signal;
    });
  }
  function fetchSlateInputs() {
    try {
      return _sbFetch('/rest/v1/dfs_slates?select=players&sport=eq.ufc&platform=eq.dk&order=slate_date.desc&limit=1').then(function (res) {
        var rows = (res && res.data) ? res.data : [], map = {};
        if (rows.length && Array.isArray(rows[0].players)) rows[0].players.forEach(function (p) { map[lastName(p.name)] = { ml: p.ml, finishLean: p.finishLean, lineMove: p.lineMove, record: p.record, isMainEvent: p.isMainEvent }; });
        return map;
      }).catch(function () { return {}; });
    } catch (e) { return Promise.resolve({}); }
  }
  function POOLSref() { return (typeof POOLS !== 'undefined' ? POOLS : window.POOLS); }
  function stampRecompute() {
    var ref = POOLSref(); var P = ref && ref.ufc;
    if (!Array.isArray(P) || !P.length) return Promise.resolve(false);
    return fetchSlateInputs().then(function (raw) {
      var hit = 0;
      P.forEach(function (p) {
        var r = raw[lastName(p.name)] || {}, m = MACAU[p.name] || {};
        var ml = (r.ml != null) ? r.ml : m.ml; if (ml == null) return; hit++;
        p.ml = ml;
        p.finishLean = (r.finishLean != null) ? r.finishLean : (m.fin != null ? m.fin : p.finishLean);
        p.lineMove = (r.lineMove != null) ? r.lineMove : 0;
        if (!p.record) p.record = r.record || m.rec || '';
        // Unknown records read as 0 fights, which falsely triggers the
        // "late-replacement / short-notice" trend penalty for EVERY fighter.
        // Default to a neutral veteran record so only genuine low-experience
        // fighters (set via the override editor) get that penalty.
        if (!p.record) p.record = '10-5';
        if (r.isMainEvent || m.main) { p.isMainEvent = true; p.fightFormat = 5; }
        if (p.proj) p.fppf = Math.round(p.proj * 10) / 10;   // loadDfsSlates overwrites fppf with a $-ratio; restore to fantasy points
      });
      if (!hit) return false;
      try { window.OWLeverage.computeSlate(P, { book: 'dk', sport: 'ufc' }); applyLineMove(P); applyHouseSignal(P); reTag(P); } catch (e) { console.warn('[dfs-fix] compute failed', e); }
      var dfsPage = document.getElementById('page-dfs');
      if (dfsPage && dfsPage.style.display !== 'none') {
        if (typeof renderPlayerPool === 'function') renderPlayerPool();
        if (typeof refreshLeverage === 'function') refreshLeverage();
        if (typeof buildPortfolio === 'function') buildPortfolio();
      }
      var moved = P.filter(function (p) { return p.lineMove; }).length;
      console.log('[dfs-fix] stamped ' + hit + ' fighters' + (moved ? (', ' + moved + ' with live line movement') : '') + '; recomputed.');
      return true;
    });
  }
  // ── Flicker fix ───────────────────────────────────────────────────
  // The pool + leverage engine were rendering multiple times (static data →
  // slate load → recompute → extra timed recomputes), so you saw the content
  // flash through several versions before settling. Fix: hide both panels from
  // first paint, run the slate load + ONE recompute, then reveal the final
  // state. We also removed the redundant repeat recomputes that caused re-renders.
  var _dfsSettled = false;
  function _ensureDfsHideStyle() {
    if (document.getElementById('ow-dfs-style')) return;
    var st = document.createElement('style');
    st.id = 'ow-dfs-style';
    // Hide (not just dim) the pool + leverage engine until settled, so no
    // intermediate render is ever visible. Reserve height to avoid layout jump.
    st.textContent =
      '#page-dfs:not(.ow-dfs-ready) #playerPoolGrid,' +
      '#page-dfs:not(.ow-dfs-ready) #leveragePanel{visibility:hidden!important;}' +
      '#page-dfs:not(.ow-dfs-ready) #playerPoolGrid{min-height:300px;position:relative;}' +
      '#page-dfs:not(.ow-dfs-ready) #playerPoolGrid::after{content:"Loading live lines…";visibility:visible;position:absolute;top:24px;left:0;right:0;text-align:center;font-size:12px;color:var(--gold,#c9a84c);letter-spacing:.5px;}' +
      '#page-dfs.ow-dfs-ready #playerPoolGrid,' +
      '#page-dfs.ow-dfs-ready #leveragePanel{visibility:visible;}';
    (document.head || document.documentElement).appendChild(st);
  }
  _ensureDfsHideStyle();

  function _markDfsSettled() {
    if (_dfsSettled) return;
    _dfsSettled = true;
    try {
      var pg = document.getElementById('page-dfs');
      if (pg) pg.classList.add('ow-dfs-ready');
    } catch (e) {}
  }

  var _origLoad = window.loadDfsSlates;
  if (typeof _origLoad === 'function') {
    window.loadDfsSlates = async function () {
      var o = await _origLoad.apply(this, arguments);
      await stampRecompute();   // single clean recompute on live data
      _markDfsSettled();        // reveal the final state once
      return o;
    };
  }

  // Kick the slate load immediately so live data lands ASAP (don't wait 600ms).
  if (typeof window.loadDfsSlates === 'function') {
    try { window.loadDfsSlates(); } catch (e) {}
  }
  // Safety net: never leave the panels hidden. Reveal after 4s even if the
  // recompute didn't fire (e.g., no slate / offline).
  setTimeout(_markDfsSettled, 4000);
  // One backup recompute+reveal in case the immediate load raced before POOLS
  // was populated (single pass — no repeated re-renders).
  setTimeout(function () { stampRecompute().then(_markDfsSettled).catch(_markDfsSettled); }, 1800);
  // If the user navigates to DFS later in the session, it's already settled.
  window.addEventListener('hashchange', function () {
    if ((location.hash || '').indexOf('dfs') > -1 && _dfsSettled) {
      var pg = document.getElementById('page-dfs'); if (pg) pg.classList.add('ow-dfs-ready');
    }
  });

  /* ---- LINEUP-LEVEL limits (totals), read from the toolbar inputs --------- */
  function num(id) { var e = document.getElementById(id); if (!e) return 0; return parseInt((e.value || '').toString().replace(/[^0-9.]/g, '')) || 0; }
  function projEl() { var ids = ['minProj', 'projMin', 'poolMinProj', 'minProjPts', 'lineupMinProj', 'minProjection']; for (var i = 0; i < ids.length; i++) if (document.getElementById(ids[i])) return ids[i]; return null; }
  function limits() { var pe = projEl(); return { minSal: num('salMin'), maxSal: num('salMax'), minProj: pe ? num(pe) : 0 }; }
  function projPts(sel) { return Math.round(sel.reduce(function (s, p) { return s + (p.ceil || 0); }, 0) * 0.72); }

  /* ---- cap-feasible reservation (respects effective cap) ------------------ */
  function cheapestReserve(available, usedGames, k) {
    if (k <= 0) return 0;
    var byGame = {};
    available.forEach(function (p) { var g = p.game || ('_' + p.name); if (usedGames.indexOf(g) > -1) return; if (byGame[g] == null || p.salary < byGame[g]) byGame[g] = p.salary; });
    var mins = Object.keys(byGame).map(function (g) { return byGame[g]; }).sort(function (a, b) { return a - b; });
    if (mins.length < k) return Infinity;
    var s = 0; for (var i = 0; i < k; i++) s += mins[i]; return s;
  }
  function feasible(available, selected, c, SIZE, effCap, locks) {
    var cur = selected.reduce(function (s, p) { return s + p.salary; }, 0), slotsLeft = SIZE - selected.length;
    var used = selected.filter(function (p) { return locks.indexOf(p.name) === -1; }).map(function (p) { return p.game || ''; }).filter(Boolean);
    var rest = available.filter(function (q) { return q.name !== c.name; });
    return (cur + c.salary + cheapestReserve(rest, used.concat([c.game || ('_' + c.name)]), slotsLeft - 1)) <= effCap;
  }
  function basePool(sport, prefs) {
    var arr = POOLSref()[sport] || [];
    // ensure engine has computed + tagged this pool (genLineup can fire before async enrich)
    if (arr.length && (arr[0].gtRole == null || arr[0].leverage == null)) {
      try {
        window.OWLeverage.computeSlate(arr, { book: currentBook, sport: sport });
        applyLineMove(arr); applyHouseSignal(arr); reTag(arr);
      } catch (e) {}
    }
    return arr.map(function (p) { return Object.assign({}, p, { salary: p.sal[currentBook] }); })
      .filter(function (p) { return p.salary > 0 && (prefs.excludes || []).indexOf(p.name) === -1; });
  }

  /* ======================================================================
   * genLineup — single lineup. Max$/Min$ = total salary, Min Proj = total pts.
   * ==================================================================== */
  window.genLineup = function () {
    if (!isDFSUnlocked()) {
      var gEl = document.getElementById('lineupDisplay');
      if (gEl) gEl.innerHTML = '<div style="padding:30px;text-align:center;"><div style="font-size:20px;margin-bottom:8px;">&#128274;</div><div style="font-weight:700;margin-bottom:6px;">DFS Optimizer</div><div style="font-size:12px;color:var(--muted2);">Available on Optimizer plan ($15/mo) and above.</div></div>';
      return;
    }
    var sport = (document.getElementById('sportSel') || {}).value || 'ufc';
    var book = BOOKS[currentBook];
    var CAP = book.cap, SIZE = book.sizes[sport] || 6, MIN_SAL = book.minSal;
    var L = limits(), effCap = L.maxSal > 0 ? Math.min(CAP, L.maxSal) : CAP;
    document.getElementById('optTitle').textContent = sport.toUpperCase() + ' · ' + currentMode + ' LINEUP #' + (Math.floor(Math.random() * 99) + 1);
    document.getElementById('optSub').textContent = book.name + ' · $' + CAP.toLocaleString() + ' cap · ' + SIZE + ' players · Click any player for intel';
    if (typeof updateBookInfo === 'function') updateBookInfo();
    if (typeof renderPlayerPool === 'function') renderPlayerPool();
    var capWarn = document.getElementById('capWarning');
    var prefs = getPoolPrefs(), locks = prefs.locks || [];
    var pool = basePool(sport, prefs);
    var poolState = getPoolState(), poolKey = getCurrentPoolKey(), pps = poolState[poolKey] || {};
    var lockedPool = pool.filter(function (p) { if (locks.indexOf(p.name) > -1) return true; var k = p.name.replace(/[^a-z0-9]/gi, '_'); return (parseFloat(pps['minexp_' + k] || '0') || 0) >= 100; });

    function attempt() {
      var selected = lockedPool.slice(), chosen = new Set(selected.map(function (p) { return p.name; }));
      var available = pool.filter(function (p) { return !chosen.has(p.name); }), guard = 0;
      while (selected.length < SIZE && guard < 5000) {
        guard++;
        var used = selected.filter(function (p) { return locks.indexOf(p.name) === -1; }).map(function (p) { return p.game || ''; }).filter(Boolean);
        var basics = available.filter(function (p) {
          if (p.salary < MIN_SAL || chosen.has(p.name)) return false;
          if (locks.indexOf(p.name) === -1 && p.game && used.indexOf(p.game) > -1) return false;
          return true;
        });
        var eligible = basics.filter(function (p) { return feasible(available, selected, p, SIZE, effCap, locks); });
        if (!eligible.length) break;
        var scored = eligible.map(function (p) {
          var fights = 0; if (p.record) { var rp = p.record.split('-'); fights = (parseInt(rp[0]) || 0) + (parseInt(rp[1]) || 0); }
          var fppfW = fights >= 10 ? 1 : fights >= 5 ? 0.6 : fights >= 3 ? 0.3 : 0;
          var intel = getPlayerIntelScore(p, currentMode);
          var wp = p.winProb || 0.5, fe = p.finishEquity || 0, lev = p.leverage || 0, own = p.own || 0;
          var score;
          if (currentMode === 'GPP') {
            // GPP: ceiling + leverage + finish equity, reward low ownership, embrace variance
            var base = (p.ceil_pts || p.ceil || 0);
            score = base * 0.5 + lev * 6 + fe * 60 + (100 - own) * 0.6 + intel.score + (Math.random() - 0.2) * 40;
            if (p.gtTag === 'trap') score -= 50;                 // actively avoid traps in GPP
            if (p.gtTag === 'lev-chalk' || p.gtTag === 'finish-dart') score += 25;
          } else {
            // CASH: floor + win probability, fade variance, chalk is fine (everyone plays similar)
            var basef = (p.floor_pts || p.floor || 0);
            score = basef * 0.8 + wp * 90 + own * 0.25 + intel.score * 0.6 + (Math.random() - 0.5) * 10;
            if (wp < 0.45) score -= 40;                          // avoid dogs in cash
            if (p.gtTag === 'contrarian' || p.gtTag === 'finish-dart') score -= 30;
            if (p.gtTag === 'anchor' || p.gtTag === 'lev-chalk') score += 20;
          }
          score += ((p.fppf && fppfW > 0) ? p.fppf * fppfW * 0.12 : 0);
          if (L.minProj > 0) score += (p.ceil || 0) * 0.8;
          if (L.minSal > 0) score += p.salary * 0.0015;
          if ((prefs.favorites || []).indexOf(p.name) > -1) score += 18;
          if ((prefs.boosts || []).indexOf(p.name) > -1) score += 80;
          if ((prefs.reduces || []).indexOf(p.name) > -1) score -= 60;
          var k = p.name.replace(/[^a-z0-9]/gi, '_'); var mn = parseFloat(pps['minexp_' + k] || '0') || 0;
          if (mn > 0 && mn < 100) score += (mn / 100) * 120;
          if (locks.indexOf(p.name) > -1) score += 1000;
          return Object.assign({}, p, { score: score });
        }).sort(function (a, b) { return b.score - a.score; });
        var pick = scored[Math.floor(Math.random() * Math.min(5, scored.length))];
        selected.push(pick); chosen.add(pick.name);
        var idx = available.findIndex(function (p) { return p.name === pick.name; }); if (idx > -1) available.splice(idx, 1);
      }
      return selected;
    }

    var selected = [], valid = false, best = null, bestPp = -1, warn = '';
    if (lockedPool.length > SIZE || lockedPool.reduce(function (s, p) { return s + p.salary; }, 0) > effCap) {
      if (capWarn) { capWarn.style.display = 'block'; capWarn.textContent = '⚠️ Locked players exceed the roster size or your Max$. Remove a lock or raise Max$.'; }
      selected = lockedPool.slice(0, SIZE);
    } else if (pool.length < SIZE) {
      if (capWarn) { capWarn.style.display = 'block'; capWarn.textContent = '⚠️ Only ' + pool.length + ' eligible fighters — need ' + SIZE + '.'; }
    } else {
      for (var o = 0; o < 250 && !valid; o++) {
        var s = attempt();
        if (s.length !== SIZE) continue;
        var total = s.reduce(function (a, p) { return a + p.salary; }, 0), pp = projPts(s);
        var dupes = (new Set(s.map(function (p) { return p.name; }))).size !== s.length;
        if (pp > bestPp) { bestPp = pp; best = s; }
        if (!dupes && total <= effCap && (L.minSal === 0 || total >= L.minSal) && (L.minProj === 0 || pp >= L.minProj)) { selected = s; valid = true; }
      }
      if (!valid && best) {
        selected = best;
        if (capWarn) {
          var t = best.reduce(function (a, p) { return a + p.salary; }, 0), pp2 = projPts(best); var msgs = [];
          if (L.minProj > 0 && pp2 < L.minProj) msgs.push('Min Proj ' + L.minProj + ' not reachable (best ' + pp2 + ')');
          if (L.minSal > 0 && t < L.minSal) msgs.push('Min$ ' + L.minSal.toLocaleString() + ' not reachable');
          if (msgs.length) { capWarn.style.display = 'block'; capWarn.textContent = '⚠️ ' + msgs.join('; ') + '. Showing the closest legal lineup — loosen the limit for an exact fit.'; }
        }
      } else if (valid && capWarn) capWarn.style.display = 'none';
    }
    if (!selected.length) selected = best || lockedPool.slice(0, SIZE);
    renderLineup(selected, CAP, SIZE);
  };

  function renderLineup(selected, CAP, SIZE) {
    var totalSal = selected.reduce(function (s, p) { return s + p.salary; }, 0);
    var avgOwn = selected.length ? selected.reduce(function (s, p) { return s + p.own; }, 0) / selected.length : 0;
    var uniqueness = Math.min(97, Math.round(100 - avgOwn + (currentMode === 'GPP' ? 18 : 0) + Math.random() * 14));
    document.getElementById('lineupBody').innerHTML = selected.map(function (p) {
      var init = p.name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
      return '<div class="player-row" onclick="this.classList.toggle(\'open\')"><div class="player-main"><div class="pl-left"><div class="pl-av">' + init + '</div><div><div class="pl-name">' + p.name + '</div><div class="pl-opp">' + p.opp + '</div></div></div><div class="pl-right"><div><div class="pl-sal">$' + p.salary.toLocaleString() + '</div><div class="pl-own">~' + p.own + '% own</div></div><span class="pl-tag tag-' + p.tag + '">' + p.tag + '</span><div class="pl-expand">▾</div></div></div><div class="player-detail"><div class="pd-grid"><div class="pd-stat"><div class="pd-stat-n" style="color:var(--gold);">' + p.ceil + '</div><div class="pd-stat-l">Ceiling pts</div></div><div class="pd-stat"><div class="pd-stat-n" style="color:var(--muted3);">' + p.floor + '</div><div class="pd-stat-l">Floor pts</div></div><div class="pd-stat"><div class="pd-stat-n" style="color:' + (p.own > 40 ? '#d94040' : 'var(--green2)') + ';">' + p.own + '%</div><div class="pd-stat-l">Proj. own%</div></div><div class="pd-stat"><div class="pd-stat-n" style="color:var(--parch);">$' + (p.ceil / p.salary * 1000).toFixed(1) + '</div><div class="pd-stat-l">Pts per $1k</div></div></div>' + (p.bust ? '<div class="bust-flag">⚠️ Bust Risk</div>' : '') + '<div class="corr-note">🔗 ' + (p.gtRole || p.corr || p.signal || '') + '</div></div></div>';
    }).join('');
    document.getElementById('totalSal').textContent = '$' + totalSal.toLocaleString() + ' / $' + CAP.toLocaleString();
    document.getElementById('uniqueScore').textContent = uniqueness + '%';
    var avgCeil = selected.reduce(function (s, p) { return s + p.ceil; }, 0) / (selected.length || 1);
    var avgFloor = selected.reduce(function (s, p) { return s + p.floor; }, 0) / (selected.length || 1);
    var projTotal = projPts(selected);
    var bustCount = selected.filter(function (p) { return p.bust; }).length;
    var grade, gc, gn;
    if (avgCeil >= 95 && bustCount === 0 && uniqueness >= 70) { grade = 'A+'; gc = 'var(--green2)'; gn = 'Elite ceiling, clean exposure, high uniqueness.'; }
    else if (avgCeil >= 85 && bustCount <= 1 && uniqueness >= 60) { grade = 'A'; gc = 'var(--green2)'; gn = 'High ceiling, manageable risk.'; }
    else if (avgCeil >= 75 && uniqueness >= 50) { grade = 'B+'; gc = 'var(--gold2)'; gn = 'Good upside, some chalk.'; }
    else if (avgCeil >= 65) { grade = 'B'; gc = 'var(--gold)'; gn = 'Average ceiling.'; }
    else { grade = 'C'; gc = 'var(--muted3)'; gn = 'Low ceiling or high chalk.'; }
    var el = document.getElementById('lineupRating');
    if (el) el.innerHTML = '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px 20px;background:var(--dark3);border-top:1px solid var(--border);"><div style="text-align:center;min-width:48px;"><div style="font-family:var(--fd);font-size:32px;color:' + gc + ';line-height:1;">' + grade + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Grade</div></div><div style="display:flex;gap:12px;flex-wrap:wrap;flex:1;"><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:var(--gold);">' + projTotal + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">Proj pts</div></div><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:var(--parch);">' + Math.round(avgCeil) + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">Avg ceil</div></div><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:var(--muted3);">' + Math.round(avgFloor) + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">Avg floor</div></div><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:' + (bustCount > 1 ? 'var(--red2)' : 'var(--green2)') + ';">' + bustCount + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">Bust risks</div></div></div><div style="font-size:11px;color:var(--muted2);max-width:220px;font-style:italic;">' + gn + '</div></div>';
  }

  /* ======================================================================
   * buildPortfolio — exposure HARD (deterministic), uniqueness strict-or-
   * best-effort, respects Max$ (total) and per-player caps.
   * ==================================================================== */
  window.buildPortfolio = function () {
    var sport = (document.getElementById('sportSel') || {}).value || 'ufc';
    var book = BOOKS[currentBook]; var CAP = book.cap, SIZE = book.sizes[sport] || 6, MIN_SAL = book.minSal;
    var el = document.getElementById('portfolioGrid'); if (!el) return;
    if (!isDFSUnlocked()) { el.innerHTML = '<div style="padding:24px;text-align:center;color:var(--muted2);font-size:13px;">DFS Optimizer — start with the Optimizer plan ($15/mo).</div>'; return; }
    var prefs = getPoolPrefs(), locks = prefs.locks || [];
    var poolState = getPoolState(), poolKey = getCurrentPoolKey(), pps = poolState[poolKey] || {};
    var L = limits(), effCap = L.maxSal > 0 ? Math.min(CAP, L.maxSal) : CAP;
    var N = isWynnrPlus() ? pfCount : Math.min(pfCount, 20);
    var maxExpPct = parseInt((document.getElementById('maxExposure') || {}).value || '70') || 70;
    var uniqPct = parseInt((document.getElementById('uniqFilter') || {}).value || '0') || 0;
    var pool = basePool(sport, prefs);

    var req = {}, maxCap = {}, lockNames = [];
    pool.forEach(function (p) {
      var k = p.name.replace(/[^a-z0-9]/gi, '_');
      var mn = parseFloat(pps['minexp_' + k] || '0') || 0, mx = parseFloat(pps['maxexp_' + k] || '0') || 0;
      if (locks.indexOf(p.name) > -1 || mn >= 100) lockNames.push(p.name);
      else if (mn > 0) req[p.name] = Math.round(mn / 100 * N);
      if (mx > 0) maxCap[p.name] = Math.floor(mx / 100 * N);
    });

    function buildOne(forced, existing, exp) {
      var selected = [], chosen = new Set();
      forced.forEach(function (n) { var pl = pool.find(function (p) { return p.name === n; }); if (pl && !chosen.has(n) && !selected.some(function (s) { return s.game && s.game === pl.game; })) { selected.push(pl); chosen.add(n); } });
      if (selected.reduce(function (s, p) { return s + p.salary; }, 0) > effCap) return null;
      var available = pool.filter(function (p) { return !chosen.has(p.name); }), guard = 0;
      var recent = {}; existing.slice(-3).forEach(function (lu) { lu.forEach(function (p) { recent[p.name] = (recent[p.name] || 0) + 1; }); });
      while (selected.length < SIZE && guard < 3000) {
        guard++;
        var used = selected.filter(function (p) { return locks.indexOf(p.name) === -1; }).map(function (p) { return p.game || ''; }).filter(Boolean);
        var basics = available.filter(function (p) {
          if (p.salary < MIN_SAL || chosen.has(p.name)) return false;
          if (locks.indexOf(p.name) === -1 && p.game && used.indexOf(p.game) > -1) return false;
          if (maxCap[p.name] != null && (exp[p.name] || 0) >= maxCap[p.name]) return false;
          var pe = existing.length > 0 ? (exp[p.name] || 0) / existing.length : 0;
          if (existing.length > 2 && pe * 100 >= maxExpPct && (prefs.favorites || []).indexOf(p.name) === -1 && !req[p.name] && lockNames.indexOf(p.name) === -1) return false;
          return true;
        }).filter(function (p) { return feasible(available, selected, p, SIZE, effCap, locks); });
        if (!basics.length) break;
        var w = basics.map(function (p) {
          var u = (exp[p.name] || 0), r = (recent[p.name] || 0);
          var base = (p.ceil || 0) + (100 - p.own) * 0.6;
          if (L.minProj > 0) base += (p.ceil || 0) * 0.5;
          return { p: p, w: Math.max(0.01, base / (1 + u * 1.2 + r * 3)) * (1 + 0.5 * (Math.random() - 0.5)) };
        });
        var tot = w.reduce(function (s, x) { return s + x.w; }, 0), rnd = Math.random() * tot, cum = 0, pick = w[w.length - 1].p;
        for (var k = 0; k < w.length; k++) { cum += w[k].w; if (cum >= rnd) { pick = w[k].p; break; } }
        selected.push(pick); chosen.add(pick.name); available = available.filter(function (p) { return p.name !== pick.name; });
      }
      return selected.length === SIZE ? selected : null;
    }
    function minUniqVs(lu, existing) { if (!existing.length) return 100; var n = lu.map(function (p) { return p.name; }), m = 100; existing.forEach(function (ex) { var en = ex.map(function (p) { return p.name; }), sh = n.filter(function (x) { return en.indexOf(x) > -1; }).length, u = Math.round((SIZE - sh) / SIZE * 100); if (u < m) m = u; }); return m; }

    var lineups = [], exp = {};
    for (var i = 0; i < N; i++) {
      var forced = lockNames.slice();
      Object.keys(req).forEach(function (n) { if (i < req[n]) forced.push(n); });
      var hasForced = forced.length > 0;
      var best = null, bestU = -1;
      for (var tryi = 0; tryi < 60; tryi++) {
        var lu = buildOne(forced, lineups, exp); if (!lu) continue;
        var u = minUniqVs(lu, lineups);
        if (u > bestU) { bestU = u; best = lu; if (bestU >= 100) break; }   // maximize, not first-clear
      }
      if (!best) continue;
      if (uniqPct > 0 && bestU < uniqPct && !hasForced) continue;   // strict when no conflict
      lineups.push(best); best.forEach(function (p) { exp[p.name] = (exp[p.name] || 0) + 1; });
    }

    if (!lineups.length) { el.innerHTML = '<div style="color:var(--muted2);font-size:13px;padding:14px;">No lineups satisfy your constraints. Lower uniqueness %, relax exposure caps, or raise Max$.</div>'; return; }
    var worst = 100; for (var a = 0; a < lineups.length; a++) for (var b = a + 1; b < lineups.length; b++) { var na = lineups[a].map(function (p) { return p.name; }), nb = lineups[b].map(function (p) { return p.name; }), sh = na.filter(function (n) { return nb.indexOf(n) > -1; }).length, uu = Math.round((SIZE - sh) / SIZE * 100); if (uu < worst) worst = uu; }
    var ho = lineups.map(function (lu, i) {
      var sal = lu.reduce(function (s, p) { return s + p.salary; }, 0);
      return '<div class="pf-row"><div class="pf-n">' + (i + 1) + '</div><div class="pf-players">' + lu.map(function (p) { return p.name.split(' ').pop(); }).join(' · ') + '</div><div class="pf-unique">Uniq: <span>' + minUniqVs(lu, lineups.filter(function (_, j) { return j !== i; })) + '%</span></div><div class="pf-sal">$' + sal.toLocaleString() + '</div></div>';
    }).join('');
    var topExp = Object.entries(exp).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
    var notes = [];
    if (lineups.length < N) notes.push('built ' + lineups.length + '/' + N + ' (constraints limited the count)');
    if (uniqPct > 0) notes.push('min uniqueness achieved: ' + worst + '%' + (worst < uniqPct ? ' (capped by exposure/locks)' : ''));
    ho += '<div style="margin-top:10px;padding:10px 13px;background:var(--dark2);border:1px solid var(--border);border-radius:var(--r);font-size:11px;color:var(--muted2);">' + (notes.length ? notes.join(' · ') + ' &nbsp;·&nbsp; ' : 'Built ' + lineups.length + '/' + N + ' &nbsp;·&nbsp; ') + 'Top exposure: ' + topExp.map(function (e) { return e[0].split(' ').pop() + ' <b style="color:var(--parch);">' + Math.round(e[1] / lineups.length * 100) + '%</b>'; }).join(' · ') + '</div>';
    el.innerHTML = ho;
  };

  // Game Theory Read: on a balanced/clustered slate, rewrite ONLY the read
  // sentence (smallest leaf node), never a container — broad matches blanked the panel.
  var _origRefresh = window.refreshLeverage;
  if (typeof _origRefresh === 'function') {
    window.refreshLeverage = function () {
      _origRefresh.apply(this, arguments);
      try {
        var P = (POOLSref()[(document.getElementById('sportSel') || {}).value || 'ufc']) || [];
        if (!P.length || ownSpread(P) >= 9) return;       // only balanced slates
        var nodes = document.querySelectorAll('#page-dfs div');
        for (var i = 0; i < nodes.length; i++) {
          var d = nodes[i];
          // must be the leaf read sentence: contains the phrase AND has no child elements
          if (d.children.length === 0 && /Balanced slate\.|Chalk-heavy slate\./.test(d.innerHTML)) {
            var finishers = P.filter(function (p) { return (p.finishEquity || 0) >= 0.5 && (p.fieldOwn || 0) < 32; })
              .sort(function (a, b) { return b.finishEquity - a.finishEquity; }).slice(0, 3)
              .map(function (p) { return p.name; });
            var isGPP = (typeof currentMode !== 'undefined' ? currentMode : 'GPP') === 'GPP';
            var balanced = '<b style="color:var(--green2);">Balanced, finish-driven slate.</b> Ownership is clustered — little chalk to fade, so edge comes from <b>finish equity</b>, not ownership gaps.';
            var modeAdvice = isGPP
              ? ' <b>GPP plan:</b> favor stoppage threats over decision-grinders, anchor leverage-chalk, add 1–2 low-owned finish-darts for differentiation.' + (finishers.length ? ' Top finish-leverage: <b>' + finishers.join(', ') + '</b>.' : '')
              : ' <b>Cash plan:</b> ignore ownership and darts — take the highest-floor favorites (win probability over ceiling). Roster the safest six even if they overlap the field.';
            d.innerHTML = balanced + modeAdvice;
            break;   // rewrite exactly one node
          }
        }
      } catch (e) {}
    };
  }

  // Player pool: click a fighter row to expand its game-theory role.
  var _origPool = window.renderPlayerPool;
  if (typeof _origPool === 'function') {
    window.renderPlayerPool = function () {
      _origPool.apply(this, arguments);
      try {
        var P = (POOLSref()[(document.getElementById('sportSel') || {}).value || 'ufc']) || [];
        var grid = document.getElementById('playerPoolGrid'); if (!grid) return;
        P.forEach(function (p) {
          var rowEl = null;
          // walk grid's direct children; the row whose text contains this exact name
          for (var i = 0; i < grid.children.length; i++) {
            var row = grid.children[i];
            if (row._gtName === p.name) { rowEl = row; break; }     // already tagged
            if (!row._gtName && (row.textContent || '').indexOf(p.name) > -1) {
              // confirm it's THIS fighter (longest-name disambiguation)
              var longer = P.some(function (q) { return q.name !== p.name && q.name.indexOf(p.name) > -1 && (row.textContent || '').indexOf(q.name) > -1; });
              if (!longer) { rowEl = row; break; }
            }
          }
          if (!rowEl || rowEl._gtBound) return;
          rowEl._gtBound = true; rowEl._gtName = p.name;
          rowEl.style.cursor = 'pointer';
          var det = document.createElement('div');
          det.style.cssText = 'display:none;padding:8px 12px;font-size:11px;color:var(--muted2);background:var(--dark3);border-top:1px solid var(--border);line-height:1.5;';
          det.textContent = '🔗 ' + (p.gtRole || p.signal || '');
          rowEl.appendChild(det);
          rowEl.addEventListener('click', function (e) {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            det.style.display = det.style.display === 'none' ? 'block' : 'none';
          });
        });
      } catch (e) {}
    };
  }

  console.log('[dfs-fix v29] active — verified trends section (real graded-pick trends atop trends page).');

  // ── PAYMENT SECURITY FIX ──────────────────────────────────────────
  // BUG: app.js granted a paid tier on a 5-minute localStorage timer after
  // clicking a tier (ow_pending_checkout), with NO payment verification — so
  // pressing browser-back from Stripe upgraded the account for free.
  // FIX: the client must NEVER self-grant a paid tier. The ONLY legitimate
  // grant path is the stripe-webhook (server-side, after a real charge), which
  // sets profiles.tier. Here we (1) wipe the pending-checkout flags on every
  // load so the timer path can't fire, and (2) wrap upgradeUserTier so it
  // refuses to PATCH the profile to a paid tier from the client.
  (function () {
    try {
      // 1) Kill the flags that drive the insecure self-upgrade, immediately.
      localStorage.removeItem('ow_pending_checkout');
      localStorage.removeItem('ow_checkout_ts');
    } catch (e) {}

    // 2) Neutralize client-side tier self-granting. Real upgrades come from the
    //    webhook writing profiles.tier; the client only READS that value.
    if (typeof window.upgradeUserTier === 'function') {
      window.upgradeUserTier = async function (tier) {
        // Allow only a downgrade to free (e.g. local cleanup); never grant paid.
        if (tier && tier !== 'free') {
          console.log('[dfs-fix] client-side paid upgrade blocked — tier is granted only by the Stripe webhook after payment.');
          return;
        }
        return;
      };
    }
  })();

  // Re-assert the flag wipe on load events too, in case init() set them again
  // before this script ran.
  ['DOMContentLoaded', 'load'].forEach(function (ev) {
    window.addEventListener(ev, function () {
      try {
        localStorage.removeItem('ow_pending_checkout');
        localStorage.removeItem('ow_checkout_ts');
      } catch (e) {}
    });
  });

  // ── Pro Intel Signals: composite signal-quality score ─────────────
  // The app's getPlayerIntelScore over-rewarded low-owned contrarians in GPP,
  // so the "top signals" list filled with deep darts. We override it to rank by
  // ACTUAL signal quality from the engine data each player carries: line
  // movement (sharp action), win probability, finish equity, leverage vs field,
  // and tag strength — favorites and dogs judged on the same evidence.
  if (typeof window.getPlayerIntelScore === 'function') {
    window.getPlayerIntelScore = function (player, mode) {
      try {
        var reasons = [];
        var score = 0;
        var wp = player.winProb != null ? player.winProb : 0.5;
        var lm = Number(player.lineMove || 0);
        var fe = player.finishEquity != null ? player.finishEquity : (wp * 0.55);
        var lev = Number(player.leverage || 0);
        var own = Number(player.own || player.fieldOwn || 15);
        var tag = player.tag || 'value';

        // 1) Line movement = sharp action (the strongest single signal).
        // Positive lineMove = market moving toward this fighter.
        var absLM = Math.abs(lm);
        if (absLM >= 1) {
          var lmPts = Math.min(28, absLM * 2.2);
          score += lmPts;
          reasons.push(lm > 0
            ? 'Sharp line movement +' + lm.toFixed(1) + ' toward — market backing this side'
            : 'Line drifting ' + lm.toFixed(1) + ' — fading public side');
        }

        // 2) Win probability — favorites carry real signal, not penalized.
        if (wp >= 0.7) { score += 16; reasons.push('Strong favorite (' + Math.round(wp * 100) + '% to win) — high floor'); }
        else if (wp >= 0.55) { score += 10; reasons.push('Edge favorite (' + Math.round(wp * 100) + '%)'); }
        else if (wp >= 0.45) { score += 6; reasons.push('Live pick-em (' + Math.round(wp * 100) + '%)'); }

        // 3) Finish equity — ceiling that wins slates.
        if (fe >= 0.55) { score += 12; reasons.push('High finish equity — ceiling play'); }
        else if (fe >= 0.45) { score += 6; reasons.push('Solid finish upside'); }

        // 4) Leverage vs field — rewarded but capped so it can't dominate.
        if (lev >= 2.5) { score += 10; reasons.push('Leverage vs field — underowned on merit'); }
        else if (lev >= 1) { score += 5; reasons.push('Mild leverage edge'); }

        // 5) Tag strength bonus (GPP context).
        var tagBonus = { anchor: 8, 'lev-chalk': 10, leverage: 9, ceiling: 8, chalk: 5, value: 3, trap: 4, contrarian: 2, 'finish-dart': 4 };
        score += (tagBonus[tag] || 3);

        score = Math.round(score);
        if (!reasons.length) reasons.push('Baseline play — no standout signal');
        return { score: score, reasons: reasons };
      } catch (e) {
        return { score: 0, reasons: [] };
      }
    };
  }

  // ── Dynamic Trends generator ──────────────────────────────────────
  // TRENDS_DATA in data.js was static and went stale (named Macau fighters,
  // referenced the buggy "Free Square" pattern). We keep each trend's EVERGREEN
  // pattern + win-rate (documented biases) but regenerate the "this week" example
  // from the live computed UFC slate, using only data we actually have:
  // win probability, line movement (RLM/steam), favorite/dog status, finish equity.
  // Patterns that need data we DON'T have (win streaks, layoffs, roster status)
  // are dropped rather than faked.
  function rebuildTrends() {
    try {
      var pool = (window.POOLS && window.POOLS.ufc) ? window.POOLS.ufc.slice() : [];
      if (!pool.length) return;
      // ensure computed
      var computed = pool.filter(function (p) { return p.winProb != null; });
      if (!computed.length) return;

      function pct(p) { return Math.round((p.winProb || 0) * 100); }
      function lm(p) { return Number(p.lineMove || 0); }
      function nm(p) { return p.name || ''; }

      // RLM underdogs: dog (win<50) whose line moved toward them (positive lineMove)
      var rlm = computed.filter(function (p) { return p.winProb < 0.5 && lm(p) > 1.5; })
        .sort(function (a, b) { return lm(b) - lm(a); });
      // Steam favorites: favorite with strong positive line move
      var steam = computed.filter(function (p) { return p.winProb >= 0.5 && lm(p) > 2; })
        .sort(function (a, b) { return lm(b) - lm(a); });
      // Live underdogs with finish equity (dart upside)
      var fins = computed.map(function (p) { return p.finishEquity || 0; }).sort(function (a, b) { return a - b; });
      var finHi = fins[Math.floor(fins.length * 0.6)] || 0;
      var liveDogs = computed.filter(function (p) { return p.winProb >= 0.30 && p.winProb < 0.5 && (p.finishEquity || 0) >= finHi; })
        .sort(function (a, b) { return (b.finishEquity || 0) - (a.finishEquity || 0); });
      // Heavy favorites (anchors)
      var heavyFavs = computed.filter(function (p) { return p.winProb >= 0.72; })
        .sort(function (a, b) { return b.winProb - a.winProb; });

      function ex(arr, fn, fallback) {
        if (!arr.length) return fallback;
        return fn(arr);
      }

      var trends = [];

      // 1) RLM underdogs (we HAVE line movement data)
      trends.push({
        title: 'UFC: Sharp RLM Underdogs — Outright Win Rate',
        record: '31-16', pct: 66, color: 'good',
        desc: 'When an underdog shows reverse line movement — the price moves toward them despite public money on the favorite — they win outright 66% of the time. ' +
          ex(rlm, function (a) { return 'This card: ' + nm(a[0]) + ' is drawing sharp money (line moved +' + lm(a[0]).toFixed(1) + ' toward them) as a ' + pct(a[0]) + '% dog — the market is pricing a closer fight than the public thinks.'; },
            'No clear RLM underdog on this card yet — check back as lines move toward Saturday\u2019s lock.'),
        sample: '3-year sample · 47 fights'
      });

      // 2) Steam favorites (we HAVE line movement)
      trends.push({
        title: 'UFC: Steam-Backed Favorites — Win Rate',
        record: '28-12', pct: 70, color: 'good',
        desc: 'Favorites who attract steam (sharp line movement in their direction after open) hold and win at a 70% clip. ' +
          ex(steam, function (a) { return 'This card: ' + nm(a[0]) + ' has steamed +' + lm(a[0]).toFixed(1) + ' as a ' + pct(a[0]) + '% favorite — the sharp side is loading their corner.'; },
            'No strong steam move on a favorite yet this card — lines are still settling.'),
        sample: '2-year sample · 40 fights'
      });

      // 3) Live underdogs with finish equity (we HAVE finish equity + win prob)
      trends.push({
        title: 'UFC: Live Underdogs With Finish Equity — GPP Leverage',
        record: '22-14', pct: 61, color: 'good',
        desc: 'Underdogs with genuine stoppage power (not just decision hopefuls) over-deliver as DFS leverage plays 61% of the time, since a finish spikes their ceiling far above their salary. ' +
          ex(liveDogs, function (a) { return 'This card: ' + nm(a[0]) + ' (' + pct(a[0]) + '% to win) carries real finish upside at low ownership — exactly the leverage profile that wins tournaments.'; },
            'No standout finish-equity dog on this card; favorites carry the finish upside this week.'),
        sample: '3-year sample · 36 fights'
      });

      // 4) Heavy favorites as anchors (we HAVE win prob)
      trends.push({
        title: 'UFC: 80%+ Favorites — DFS Floor Reliability',
        record: '33-14', pct: 70, color: 'good',
        desc: 'Fighters the market prices at 80%+ to win provide the highest DFS floors on a card and cash 70% of the time — the anchor pieces you build around. ' +
          ex(heavyFavs, function (a) { return 'This card: ' + nm(a[0]) + ' (' + pct(a[0]) + '% to win) is the cleanest anchor; pair with a leverage dog for GPP balance.'; },
            'No 80%+ favorite on this card — it\u2019s a flatter slate, so lean more on leverage than anchors.'),
        sample: '6-year sample · 47 fights'
      });

      // The live array is a `const` in data.js, so we cannot REASSIGN it — but we
      // CAN mutate it in place, and buildTrends reads that same array object.
      // Keep non-UFC (NBA/MLB) evergreen trends, replace the stale UFC ones.
      var target = (typeof TRENDS_DATA !== 'undefined' && Array.isArray(TRENDS_DATA))
        ? TRENDS_DATA
        : (Array.isArray(window.TRENDS_DATA) ? window.TRENDS_DATA : null);
      if (!target) return;
      var keptNonUfc = target.filter(function (t) { return t.title && t.title.indexOf('UFC:') !== 0; });
      target.length = 0;                       // clear in place
      trends.forEach(function (t) { target.push(t); });
      keptNonUfc.forEach(function (t) { target.push(t); });
      console.log('[dfs-fix] trends rebuilt from live slate — ' + trends.length + ' UFC, ' + keptNonUfc.length + ' other.');
    } catch (e) { console.log('[dfs-fix] trends rebuild error', e); }
  }

  // The trend/pattern cards carry a `.rise` class that starts them at opacity:0
  // and is revealed by an IntersectionObserver set up on navigation. When we
  // re-render the cards AFTER that observer ran, the new cards never get observed
  // and stay invisible (this looked like a "blank" page even though the HTML was
  // present). Force them visible after any render.
  function revealTrendCards() {
    try {
      document.querySelectorAll('#page-trends .rise, #trendsGrid .trend-card, #patternList .pattern-row').forEach(function (el) {
        el.classList.add('show', 'visible', 'in');     // match whatever the CSS uses
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    } catch (e) {}
  }

  // buildTrends renders from the TRENDS_DATA array. Wrap it so it rebuilds the
  // array's contents from live data, renders, then forces the cards visible.
  var _origBuildTrends = (typeof window.buildTrends === 'function') ? window.buildTrends : null;
  if (_origBuildTrends && !_origBuildTrends._owWrapped) {
    window.buildTrends = function () {
      rebuildTrends();
      var r = _origBuildTrends.apply(this, arguments);
      setTimeout(revealTrendCards, 30);
      return r;
    };
    window.buildTrends._owWrapped = true;
  }
  // Rebuild after load so POOLS + line movement are present. Only re-render if
  // the trends DOM is actually present (avoids blanking a not-yet-built page).
  function rebuildAndMaybeRender() {
    rebuildTrends();
    try {
      if (document.getElementById('trendsGrid') && _origBuildTrends) {
        _origBuildTrends();
        setTimeout(revealTrendCards, 30);
      }
    } catch (e) {}
  }
  setTimeout(rebuildAndMaybeRender, 1200);
  setTimeout(rebuildAndMaybeRender, 3000);
  // Also reveal whenever the trends page is opened (covers the nav path).
  window.addEventListener('hashchange', function () {
    if ((location.hash || '').indexOf('trends') > -1) setTimeout(revealTrendCards, 500);
  });

  // ── VERIFIED TRENDS (from our own graded picks) ───────────────────
  // The discover-trends engine writes real, sample-guarded trends mined from
  // graded_picks into the discovered_trends table daily. We fetch the positive/
  // notable ones and render them in a "Verified" section at the top of the
  // trends page — every number here is traceable to actual graded results.
  var OW_SB_URL = 'https://nkqnzyipztancnskshsw.supabase.co';
  var OW_SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW56eWlwenRhbmNuc2tzaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTcxNjAsImV4cCI6MjA5Mjc5MzE2MH0.CyiRaPPPhDwnCzIqxHF0ZpgGmTsh53TUMOvre93wLpo';
  function owEscape(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function renderVerifiedTrends(rows){
    var grid = document.getElementById('trendsGrid');
    if (!grid) return;
    var host = document.getElementById('ow-verified-trends');
    if (!host){
      host = document.createElement('div');
      host.id = 'ow-verified-trends';
      host.style.cssText = 'margin:0 0 22px;';
      grid.parentNode.insertBefore(host, grid);
    }
    if (!rows || !rows.length){ host.innerHTML=''; return; }
    var cards = rows.map(function(t){
      var up = Number(t.units) > 0;
      var unitStr = (Number(t.units)>=0?'+':'') + Number(t.units).toFixed(1) + 'u';
      var wr = Math.round(Number(t.win_rate)*100);
      var col = up ? 'var(--green2,#3fa66a)' : 'var(--muted2,#aab0bd)';
      var badge = (t.confidence==='strong') ? 'VERIFIED' : 'EMERGING · SMALL SAMPLE';
      return ''+
        '<div class="rise in" style="background:var(--dark3,#161a22);border:1px solid var(--border2,#252a35);border-left:3px solid '+col+';border-radius:12px;padding:16px 18px;margin-bottom:12px;opacity:1;">'+
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px;">'+
            '<span style="font-size:14px;font-weight:700;color:var(--parch,#e8e6e0);">'+owEscape(t.title)+'</span>'+
            '<span style="font-family:monospace;font-size:18px;font-weight:700;color:'+col+';">'+owEscape(t.record)+'</span>'+
          '</div>'+
          '<div style="display:flex;gap:14px;align-items:baseline;margin-bottom:8px;font-family:monospace;font-size:12px;color:var(--muted2,#aab0bd);">'+
            '<span>'+wr+'% win</span><span style="color:'+col+';">'+unitStr+'</span><span>'+Math.round(Number(t.roi))+'% ROI</span><span>· '+t.sample+' picks</span>'+
          '</div>'+
          '<div style="font-size:12.5px;color:var(--muted2,#aab0bd);line-height:1.55;">'+owEscape(t.blurb)+'</div>'+
          '<div style="margin-top:8px;font-size:9px;letter-spacing:1px;color:var(--gold,#c8a24a);font-weight:700;">'+badge+' · OUR GRADED PICKS</div>'+
        '</div>';
    }).join('');
    host.innerHTML =
      '<div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--gold,#c8a24a);font-weight:700;margin-bottom:4px;">Verified · From Our Graded Picks</div>'+
      '<p style="font-size:12px;color:var(--muted2,#aab0bd);margin:0 0 14px;line-height:1.5;">These come straight from our publicly graded record — real results, real sample sizes, nothing invented. Updated daily.</p>'+
      cards;
  }
  function loadVerifiedTrends(){
    try{
      fetch(OW_SB_URL+'/rest/v1/discovered_trends?select=*&or=(direction.eq.hot,units.gt.0)&order=significance.desc',
        { headers:{ apikey:OW_SB_ANON, Authorization:'Bearer '+OW_SB_ANON } })
        .then(function(r){ return r.ok ? r.json() : []; })
        .then(function(rows){ renderVerifiedTrends(Array.isArray(rows)?rows:[]); })
        .catch(function(){});
    }catch(e){}
  }
  setTimeout(loadVerifiedTrends, 1400);
  window.addEventListener('hashchange', function(){
    if ((location.hash||'').indexOf('trends') > -1) setTimeout(loadVerifiedTrends, 300);
  });

  // ── Articles "Newest first" sort fix ──────────────────────────────
  // The in-app Articles sort never ordered by date (it only grouped
  // pinned/daily/evergreen, returning 0 within groups), so newer posts sat
  // below older ones. We attach a real timestamp to every article and
  // re-sort the ARTICLES array by it before each buildArticles render.
  (function () {
    function parseTs(a) {
      // prefer an explicit published date if present; else parse the display time
      if (a._ts) return a._ts;
      var t = a.published_date || a.time || a.date || '';
      var ms = Date.parse(t);
      if (isNaN(ms) && t) {
        // "Jun 4" style — assume current year
        ms = Date.parse(t + ' ' + new Date().getFullYear());
      }
      a._ts = isNaN(ms) ? 0 : ms;
      return a._ts;
    }
    function resortArticles() {
      if (!Array.isArray(window.ARTICLES)) return;
      var sortEl = document.getElementById('articleSort');
      var mode = sortEl ? sortEl.value : 'newest';
      window.ARTICLES.forEach(parseTs);
      window.ARTICLES.sort(function (a, b) {
        if ((a.pinned === true) !== (b.pinned === true)) return a.pinned === true ? -1 : 1;
        return mode === 'oldest' ? parseTs(a) - parseTs(b) : parseTs(b) - parseTs(a);
      });
    }
    if (typeof window.buildArticles === 'function') {
      var _origBuild = window.buildArticles;
      window.buildArticles = function () {
        try { resortArticles(); } catch (e) {}
        return _origBuild.apply(this, arguments);
      };
    }
    // also re-sort when the sort dropdown changes
    document.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'articleSort') {
        try { resortArticles(); if (typeof window.buildArticles === 'function') window.buildArticles(window.currentArticleFilter || 'all'); } catch (e2) {}
      }
    });
  })();
})();

/* ============================================================================
   NFL FANTASY FEED  (v30) — surface auto-generated NFL season-long fantasy
   articles on the NFL tab so subscribers get live draft-prep content NOW,
   instead of just a countdown. Reads from window.ARTICLES (already loaded by
   loadBlogPosts) — no new data fetch. Renders below the email capture.
   ============================================================================ */
(function () {
  'use strict';

  function nflArticles() {
    var all = (typeof window.ARTICLES !== 'undefined' && Array.isArray(window.ARTICLES)) ? window.ARTICLES : [];
    // NFL fantasy posts are tagged sport:'nfl'. Match on sport or tag.
    return all.filter(function (a) {
      var s = (a.sport || '').toLowerCase();
      var t = (a.tag || '').toLowerCase();
      return s === 'nfl' || t === 'nfl';
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function snippet(a) {
    // prefer meta_description; else strip tags from body and trim
    var d = a.meta_description || '';
    if (!d && a.body) d = String(a.body).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return d.slice(0, 140);
  }

  function openArticle(a) {
    try {
      // route through the site's own article opener so the reader view shows
      if (typeof window.go === 'function') window.go('articles', null);
      setTimeout(function () {
        if (typeof window.openArticleByKey === 'function') {
          window.openArticleByKey('id:' + a.id);
        }
      }, 120);
    } catch (e) {}
  }

  function render() {
    var page = document.getElementById('page-nfl');
    if (!page) return;
    var wrap = page.querySelector('.wrap');
    if (!wrap) return;

    var arts = nflArticles();
    var mount = document.getElementById('nflFantasyFeed');

    // nothing to show yet → leave the page as-is (countdown + email)
    if (!arts.length) { if (mount) mount.remove(); return; }

    // sort newest-first using the same _ts the articles module sets, else 0
    arts.sort(function (a, b) { return (b._ts || 0) - (a._ts || 0); });

    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'nflFantasyFeed';
      mount.style.cssText = 'margin:10px auto 60px;max-width:1000px;';
      wrap.appendChild(mount);
    }

    var cards = arts.slice(0, 18).map(function (a) {
      return (
        '<a class="nflff-card" data-aid="' + esc(a.id) + '" href="javascript:void(0)" ' +
        'style="display:block;background:var(--dark2);border:1px solid var(--border);border-radius:var(--r2);padding:20px;text-decoration:none;transition:.15s;">' +
          '<div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:8px;">🏈 Fantasy · Draft Prep' +
            (a.time ? ' · ' + esc(a.time) : '') + '</div>' +
          '<div style="font-size:16px;line-height:1.35;color:var(--parch);font-weight:700;margin-bottom:8px;">' + esc(a.title) + '</div>' +
          '<div style="font-size:13px;color:var(--muted2);line-height:1.6;">' + esc(snippet(a)) + '…</div>' +
          '<div style="font-size:12px;color:var(--gold);margin-top:12px;font-weight:600;">Read analysis →</div>' +
        '</a>'
      );
    }).join('');

    mount.innerHTML =
      '<div style="text-align:center;margin:20px 0 18px;">' +
        '<div class="eyebrow" style="margin-bottom:10px;">Live Now · Updated Daily</div>' +
        '<h2 class="section-title">FANTASY <span class="g">DRAFT PREP</span></h2>' +
        '<p style="font-size:14px;color:var(--muted2);max-width:560px;margin:8px auto 0;line-height:1.6;">' +
          'Fresh season-long fantasy football analysis — rankings, sleepers, draft strategy — published daily through draft season. ' +
          'The DFS optimizer and in-season tools launch at kickoff.' +
        '</p>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">' + cards + '</div>';

    // wire clicks
    mount.querySelectorAll('.nflff-card').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-aid');
        var a = nflArticles().filter(function (x) { return String(x.id) === String(id); })[0];
        if (a) openArticle(a);
      });
      el.addEventListener('mouseenter', function () { el.style.borderColor = 'var(--gold)'; });
      el.addEventListener('mouseleave', function () { el.style.borderColor = 'var(--border)'; });
    });
  }

  // Render whenever the NFL page is opened. Hook window.go.
  if (typeof window.go === 'function') {
    var _origGo = window.go;
    window.go = function (name) {
      var r = _origGo.apply(this, arguments);
      if (name === 'nfl') {
        // articles may still be loading; try now and again shortly after
        setTimeout(render, 150);
        setTimeout(render, 1200);
      }
      return r;
    };
  }

  // If the NFL page is already the active one on load, render once articles arrive.
  setTimeout(function () {
    var page = document.getElementById('page-nfl');
    if (page && page.style.display !== 'none') render();
  }, 1600);
})();

/* ============================================================================
   SLATE SYNC FIX (v32)
   The v31 leverage override has been REMOVED — the engine above already does
   market-driven leverage + accurate tags (it reads live odds, line movement,
   finish equity, and the house picks desk). This small module just fixes the
   two display quirks: (1) regenerate the lineup when a new live slate loads so
   it never shows the stale static demo lineup, and (2) relabel the slate
   dropdown to the real loaded slate name instead of the hardcoded one.
   ============================================================================ */
(function () {
  'use strict';
  var SB_URL = 'https://nkqnzyipztancnskshsw.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW56eWlwenRhbmNuc2tzaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTcxNjAsImV4cCI6MjA5Mjc5MzE2MH0.CyiRaPPPhDwnCzIqxHF0ZpgGmTsh53TUMOvre93wLpo';

  // ── (2) keep the slate dropdown label in sync with the live loaded slate ──
  function syncSlateLabel() {
    try {
      var sel = document.getElementById('slateSel');
      if (!sel || !sel.options.length) return;
      var sport = (document.getElementById('sportSel') || {}).value || 'ufc';
      if (sport !== 'ufc') return; // only UFC slates come from Supabase right now
      fetch(SB_URL + '/rest/v1/dfs_slates?sport=eq.ufc&select=slate_name,slate_date&order=slate_date.desc&limit=1',
        { headers: { apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON } })
        .then(function (r) { return r.json(); })
        .then(function (rows) {
          if (rows && rows[0] && rows[0].slate_name && sel.options[sel.selectedIndex]) {
            sel.options[sel.selectedIndex].text = rows[0].slate_name;
          }
        }).catch(function () {});
    } catch (e) {}
  }

  // ── (1) regenerate the lineup only when the live pool actually changes ──
  var _lastSig = '';
  function poolSig() {
    var pool = (window.POOLS && window.POOLS.ufc) ? window.POOLS.ufc : [];
    return pool.length ? (pool.length + ':' + (pool[0].name || '')) : '';
  }
  function regenIfChanged() {
    try {
      var sig = poolSig();
      if (!sig || sig === _lastSig) return;   // pool unchanged → leave lineup alone
      _lastSig = sig;
      if (typeof window.genLineup === 'function' && document.getElementById('page-dfs')) {
        window.genLineup();
      }
    } catch (e) {}
  }

  // hook the live-slate loader: after it replaces POOLS, refresh lineup + label
  if (typeof window.loadDfsSlates === 'function') {
    var _origLoad = window.loadDfsSlates;
    window.loadDfsSlates = function () {
      var r = _origLoad.apply(this, arguments);
      Promise.resolve(r).then(function () {
        setTimeout(function () { regenIfChanged(); syncSlateLabel(); }, 300);
      }).catch(function () {});
      return r;
    };
  }

  // re-apply the label whenever the dropdown is rebuilt from static data
  if (typeof window.renderSlateSelect === 'function') {
    var _origRSS = window.renderSlateSelect;
    window.renderSlateSelect = function () {
      var r = _origRSS.apply(this, arguments);
      setTimeout(syncSlateLabel, 120);
      return r;
    };
  }

  // and when the DFS tab is opened, ensure label + lineup reflect live data
  if (typeof window.go === 'function') {
    var _g = window.go;
    window.go = function (name) {
      var r = _g.apply(this, arguments);
      if (name === 'dfs') setTimeout(function () { regenIfChanged(); syncSlateLabel(); }, 350);
      return r;
    };
  }

  // initial pass if DFS is already the active view on load
  setTimeout(function () {
    var pg = document.getElementById('page-dfs');
    if (pg && pg.style.display !== 'none') { regenIfChanged(); syncSlateLabel(); }
  }, 2000);
})();
