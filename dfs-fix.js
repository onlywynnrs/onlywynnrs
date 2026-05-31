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
    players.forEach(function (p) {
      var wp = p.winProb || 0.5, lev = p.leverage || 0, own = p.fieldOwn || 0, fe = p.finishEquity || 0, val = p.value || 0, sal = (p.sal && p.sal.dk) || p.salary || 0, t, why;
      var levBar = clustered ? 2.0 : 2.5;
      var W = Math.round(wp * 100), O = Math.round(own), opp = (p.opp || '').replace(/^vs\s*/i, ''), mv = p.lineMove || 0;
      // fighter-specific detail clause built from real numbers
      var bits = [];
      bits.push(W + '% to win vs ' + (opp || 'opp'));
      if (fe >= 0.6) bits.push('strong finish threat'); else if (fe <= 0.4) bits.push('decision-leaning');
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
      } else if (wp >= 0.60 && val >= valMed && lev > -1.5) {
        t = 'anchor'; p.gtTag = 'anchor'; why = 'ANCHOR — ' + detail + ' Reliable favorite at fair value; build-around stability.';
      } else if (lev >= levBar) {
        t = 'leverage'; p.gtTag = 'leverage'; why = 'LEVERAGE — ' + detail + ' Underowned (' + O + '%) vs merit; differentiates your build when they hit.';
      } else if (fe >= finHi && wp >= 0.42 && own < 32) {
        t = 'ceiling'; p.gtTag = 'ceiling'; why = 'CEILING — ' + detail + ' High finish equity at ' + O + '% own; this is where GPP-winning points come from.';
      } else if (own >= 30 && lev <= -1) {
        t = 'chalk'; p.gtTag = 'chalk'; why = 'CHALK — ' + detail + ' High-owned (' + O + '%) and fairly priced; safe but ties you to the field, needs a finish to pay off.';
      } else if (val >= valP60 && sal <= 8300) {
        t = 'value'; p.gtTag = 'value'; why = 'VALUE — ' + detail + ' Salary saver that frees cap for anchors.';
      } else if (own < 12 || wp < 0.32) {
        t = 'contrarian'; p.gtTag = 'contrarian'; why = 'CONTRARIAN — ' + detail + ' Lowest-owned dart (' + O + '%); highest variance, large-GPP moonshot only.';
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
  var _origLoad = window.loadDfsSlates;
  if (typeof _origLoad === 'function') window.loadDfsSlates = async function () { var o = await _origLoad.apply(this, arguments); await stampRecompute(); return o; };
  [1500, 3000].forEach(function (t) { setTimeout(stampRecompute, t); });

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

  console.log('[dfs-fix v15] active — GPP/cash mode differentiation + mode-aware strategy read.');
})();
