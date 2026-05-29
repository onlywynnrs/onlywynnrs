/* ============================================================================
 * OnlyWynnrs — dfs-fix.js
 * Load LAST (after owleverage.js, app.js, owleverage-patch.js).
 * Fixes, without editing app.js:
 *  1. loadDfsSlates strips moneylines -> ownership/leverage went flat.
 *     We re-stamp ml + finishLean + records onto the live pool and recompute.
 *  2. The lineup optimizer (genLineup) could pick studs without reserving
 *     enough cap for all 6 seats -> "Rebuilding — previous attempt was invalid".
 *  3. The portfolio builder had the same salary bug AND never refreshed after
 *     the real slate loaded (showed stale demo names).
 * ==========================================================================*/
(function () {
  "use strict";
  if (!window.OWLeverage) { console.warn('[dfs-fix] OWLeverage missing — aborting.'); return; }

  /* ---- UFC Macau real inputs (moneyline / finish lean / record / 5-rounder) */
  var MACAU = {
    'Song Yadong':{ml:-550,fin:0.60,rec:'22-9-1',main:true},
    'Deiveson Figueiredo':{ml:390,fin:0.62,rec:'24-4-0',main:true},
    'Sergei Pavlovich':{ml:-625,fin:0.85,rec:'20-3-0'},
    'Tallison Teixeira':{ml:430,fin:0.60,rec:'9-1-0'},
    'Jake Matthews':{ml:-350,fin:0.50,rec:'22-8-0'},
    'Carlston Harris':{ml:275,fin:0.55,rec:'19-7-0'},
    'Kai Asakura':{ml:-285,fin:0.70,rec:'21-6-0'},
    'Cameron Smotherman':{ml:235,fin:0.45,rec:'12-6-0'},
    'Zhang Mingyang':{ml:-270,fin:0.80,rec:'19-7-0'},
    'Alonzo Menifield':{ml:220,fin:0.65,rec:'17-6-1'},
    'Rei Tsuruya':{ml:-235,fin:0.35,rec:'10-1-0'},
    'Luis Gurule':{ml:195,fin:0.40,rec:'11-3-0'},
    'Alex Perez':{ml:-145,fin:0.55,rec:'26-10-0'},
    'Su Mudaerji':{ml:125,fin:0.60,rec:'19-7-0'},
    'Ding Meng':{ml:-125,fin:0.55,rec:'35-9-0'},
    'Jose Henrique Souza':{ml:105,fin:0.55,rec:'8-1-0'},
    'Jaqueline Amorim':{ml:-120,fin:0.55,rec:'10-2-0'},
    'Loma Lookboonmee':{ml:100,fin:0.30,rec:'10-4-0'},
    'Rodrigo Vera':{ml:-115,fin:0.50,rec:'21-1-1'},
    'Kangjie Zhu':{ml:-105,fin:0.45,rec:'21-4-0'},
    'Luis Felipe Dias':{ml:-170,fin:0.60,rec:'16-5-0'},
    'Yi Sak Lee':{ml:145,fin:0.45,rec:'8-1-0'},
    'Jingnan Xiong':{ml:-177,fin:0.50,rec:'14-1-0'},
    'Angela Hill':{ml:153,fin:0.30,rec:'18-16-0'},
    'Cody Haddon':{ml:-370,fin:0.65,rec:'8-1-0'},
    'Aori Qileng':{ml:285,fin:0.45,rec:'26-11-0'}
  };

  function stampRecompute() {
    var P = window.POOLS && window.POOLS.ufc;
    if (!Array.isArray(P) || !P.length) return false;
    var hit = 0;
    P.forEach(function (p) {
      var m = MACAU[p.name];
      if (!m) return;
      hit++;
      p.ml = m.ml;
      p.finishLean = m.fin;
      if (!p.record) p.record = m.rec;
      if (m.main) { p.isMainEvent = true; p.fightFormat = 5; }
    });
    if (!hit) return false;                      // not the Macau slate; leave it alone
    try { window.OWLeverage.computeSlate(P, { book: 'dk', sport: 'ufc' }); } catch (e) { console.warn('[dfs-fix] compute failed', e); }
    var dfsPage = document.getElementById('page-dfs');
    if (dfsPage && dfsPage.style.display !== 'none') {
      if (typeof window.renderPlayerPool === 'function') window.renderPlayerPool();
      if (typeof window.refreshLeverage === 'function') window.refreshLeverage();
      if (typeof window.buildPortfolio === 'function') window.buildPortfolio();   // refresh the stale portfolio
    }
    console.log('[dfs-fix] stamped moneylines on ' + hit + ' fighters; ownership/leverage/portfolio recomputed.');
    return true;
  }

  // run after slate loads (wrap) + a couple of delayed attempts for the initial async load
  var _origLoad = window.loadDfsSlates;
  if (typeof _origLoad === 'function') {
    window.loadDfsSlates = async function () {
      var out = await _origLoad.apply(this, arguments);
      stampRecompute();
      return out;
    };
  }
  [1500, 3000].forEach(function (t) { setTimeout(stampRecompute, t); });

  /* ======================================================================
   * Shared: cap-feasible reservation.
   * Returns the cheapest cost to fill `k` more seats using distinct bouts
   * not already used. If it can't, returns Infinity (caller treats as
   * infeasible). This is what the original builders were missing — they
   * reserved a flat MIN_SAL per seat, but on a UFC slate the cheapest
   * fighter ($6,700) is far above MIN_SAL, so they ran out of cap.
   * ==================================================================== */
  function cheapestReserve(available, usedGames, k) {
    if (k <= 0) return 0;
    var byGame = {};
    available.forEach(function (p) {
      var g = p.game || ('_' + p.name);
      if (usedGames.indexOf(g) > -1) return;
      if (byGame[g] == null || p.salary < byGame[g]) byGame[g] = p.salary;
    });
    var mins = Object.keys(byGame).map(function (g) { return byGame[g]; }).sort(function (a, b) { return a - b; });
    if (mins.length < k) return Infinity;
    var s = 0; for (var i = 0; i < k; i++) s += mins[i];
    return s;
  }

  // keep only candidates that still leave a buildable lineup after being added
  function feasible(available, selected, candidate, SIZE, CAP, locks) {
    var currentSal = selected.reduce(function (s, p) { return s + p.salary; }, 0);
    var slotsLeft = SIZE - selected.length;
    var usedGames = selected.filter(function (p) { return locks.indexOf(p.name) === -1; }).map(function (p) { return p.game || ''; }).filter(Boolean);
    var cg = candidate.game || ('_' + candidate.name);
    var rest = available.filter(function (q) { return q.name !== candidate.name; });
    var reserve = cheapestReserve(rest, usedGames.concat([cg]), slotsLeft - 1);
    return (currentSal + candidate.salary + reserve) <= CAP;
  }

  /* ======================================================================
   * 2) genLineup — corrected single-lineup builder.
   *    Selection logic is feasibility-aware; render/grade block is unchanged.
   * ==================================================================== */
  window.genLineup = function () {
    if (!window.isDFSUnlocked || !window.isDFSUnlocked()) {
      var gEl = document.getElementById('lineupDisplay');
      if (gEl) {
        gEl.innerHTML = '';
        var gDiv = document.createElement('div');
        gDiv.style.cssText = 'padding:30px;text-align:center;';
        gDiv.innerHTML = '<div style="font-size:20px;margin-bottom:8px;">&#128274;</div><div style="font-weight:700;margin-bottom:6px;">DFS Optimizer</div><div style="font-size:12px;color:var(--muted2);margin-bottom:14px;">Available on Optimizer plan ($15/mo) and above.</div>';
        var gb = document.createElement('button'); gb.className = 'btn btn-gold btn-sm'; gb.textContent = 'Get Optimizer';
        gb.onclick = function () { window.stripeCheckout && window.stripeCheckout('optimizer'); };
        gDiv.appendChild(gb); gEl.appendChild(gDiv);
      }
      return;
    }
    var sport = (document.getElementById('sportSel') || {}).value || 'ufc';
    var book = BOOKS[currentBook];
    var CAP = book.cap, SIZE = book.sizes[sport] || 6, MIN_SAL = book.minSal;
    document.getElementById('optTitle').textContent = sport.toUpperCase() + ' · ' + currentMode + ' LINEUP #' + (Math.floor(Math.random() * 99) + 1);
    document.getElementById('optSub').textContent = book.name + ' · $' + CAP.toLocaleString() + ' cap · ' + SIZE + ' players · Click any player for intel';
    if (window.updateBookInfo) window.updateBookInfo();
    if (window.renderPlayerPool) window.renderPlayerPool();

    var capWarn = document.getElementById('capWarning');
    var prefs = window.getPoolPrefs();
    var locks = prefs.locks || [];
    var salMin = parseInt((document.getElementById('salMin') || {}).value || '0') || 0;
    var salMax = parseInt((document.getElementById('salMax') || {}).value || '0') || 0;

    var pool = window.POOLS[sport].map(function (p) { return Object.assign({}, p, { salary: p.sal[currentBook] }); })
      .filter(function (p) { return p.salary > 0 && (prefs.excludes || []).indexOf(p.name) === -1; });

    var poolState = window.getPoolState(), poolKey = window.getCurrentPoolKey();
    var pps = poolState[poolKey] || {};
    var lockedPool = pool.filter(function (p) {
      if (locks.indexOf(p.name) > -1) return true;
      var pKey = p.name.replace(/[^a-z0-9]/gi, '_');
      return (parseFloat(pps['minexp_' + pKey] || '0') || 0) >= 100;
    });

    var selected = [], valid = false, outer = 0;
    var lockSalary = lockedPool.reduce(function (s, p) { return s + p.salary; }, 0);

    if (lockedPool.length > SIZE || lockSalary > CAP) {
      if (capWarn) { capWarn.style.display = 'block'; capWarn.textContent = '⚠️ Locked players exceed the active roster size or salary cap. Remove a lock and rebuild.'; }
      selected = lockedPool.slice(0, SIZE);
    } else {
      while (!valid && outer < 60) {
        outer++;
        selected = lockedPool.slice();
        var chosen = new Set(selected.map(function (p) { return p.name; }));
        var available = pool.filter(function (p) { return !chosen.has(p.name); });
        var guard = 0;
        while (selected.length < SIZE && guard < 5000) {
          guard++;
          var usedGames = selected.filter(function (p) { return locks.indexOf(p.name) === -1; }).map(function (p) { return p.game || ''; }).filter(Boolean);
          var basics = available.filter(function (p) {
            if (p.salary < MIN_SAL) return false;
            if (chosen.has(p.name)) return false;
            var isLocked = locks.indexOf(p.name) > -1;
            if (!isLocked && p.game && usedGames.indexOf(p.game) > -1) return false;
            return true;
          });
          // feasibility filter — the actual fix
          var eligible = basics.filter(function (p) { return feasible(available, selected, p, SIZE, CAP, locks); });
          if (!eligible.length) break;

          var scored = eligible.map(function (p) {
            var isFav = (prefs.favorites || []).indexOf(p.name) > -1;
            var isBoost = (prefs.boosts || []).indexOf(p.name) > -1;
            var isReduce = (prefs.reduces || []).indexOf(p.name) > -1;
            var isLocked = locks.indexOf(p.name) > -1;
            var base = currentMode === 'GPP' ? (p.ceil_pts || p.ceil) : (p.floor_pts || p.floor);
            var fights = 0; if (p.record) { var rp = p.record.split('-'); fights = (parseInt(rp[0]) || 0) + (parseInt(rp[1]) || 0); }
            var fppfW = fights >= 10 ? 1.0 : fights >= 5 ? 0.6 : fights >= 3 ? 0.3 : 0.0;
            var fppfBonus = (p.fppf && fppfW > 0) ? p.fppf * fppfW * 0.12 : 0;
            var intel = window.getPlayerIntelScore(p, currentMode);
            var modeScore = currentMode === 'GPP'
              ? (100 - p.own) * 0.85 + base * 0.3 + (Math.random() - 0.2) * 45
              : (p.floor_pts || p.floor) * 0.7 + p.own * 0.1 + (Math.random() - 0.5) * 12;
            var score = base + fppfBonus + intel.score + modeScore;
            if (isFav) score += 18;
            if (isBoost) score += 80;
            if (isReduce) score -= 60;
            var pKey = p.name.replace(/[^a-z0-9]/gi, '_');
            var minExp = parseFloat(pps['minexp_' + pKey] || '0') || 0;
            if (minExp > 0 && minExp < 100) score += (minExp / 100) * 120;
            if (isLocked) score += 1000;
            return Object.assign({}, p, { score: score, intelReasons: intel.reasons });
          }).sort(function (a, b) { return b.score - a.score; });

          var pick = scored[Math.floor(Math.random() * Math.min(5, scored.length))];
          selected.push(pick); chosen.add(pick.name);
          var idx = available.findIndex(function (p) { return p.name === pick.name; });
          if (idx > -1) available.splice(idx, 1);
        }
        var total = selected.reduce(function (s, p) { return s + p.salary; }, 0);
        var dupes = (new Set(selected.map(function (p) { return p.name; }))).size !== selected.length;
        var smin = salMin === 0 || total >= salMin, smax = salMax === 0 || total <= salMax;
        valid = selected.length === SIZE && total <= CAP && !dupes && smin && smax;
      }
    }

    // deterministic completion if randomized passes failed: cheapest feasible fill
    if (!valid || selected.length !== SIZE) {
      selected = lockedPool.slice();
      var chosen2 = new Set(selected.map(function (p) { return p.name; }));
      var avail2 = pool.filter(function (p) { return !chosen2.has(p.name); }).sort(function (a, b) { return (b.ceil_pts || b.ceil) - (a.ceil_pts || a.ceil); });
      var loops = 0;
      while (selected.length < SIZE && loops < 400) {
        loops++;
        var used = selected.filter(function (p) { return locks.indexOf(p.name) === -1; }).map(function (p) { return p.game || ''; }).filter(Boolean);
        var pick2 = null;
        for (var i = 0; i < avail2.length; i++) {
          var c = avail2[i];
          if (chosen2.has(c.name)) continue;
          if (c.game && used.indexOf(c.game) > -1) continue;
          if (feasible(avail2.filter(function (q) { return !chosen2.has(q.name); }), selected, c, SIZE, CAP, locks)) { pick2 = c; break; }
        }
        if (!pick2) break;
        selected.push(pick2); chosen2.add(pick2.name);
      }
      if (capWarn) {
        if (selected.length === SIZE) { capWarn.style.display = 'none'; }
        else { capWarn.style.display = 'block'; capWarn.textContent = '⚠️ Not enough cap-legal fighters to fill ' + SIZE + ' seats with current locks/excludes.'; }
      }
    } else if (capWarn) { capWarn.style.display = 'none'; }

    // ----- render (faithful to original) -----
    var totalSal = selected.reduce(function (s, p) { return s + p.salary; }, 0);
    var avgOwn = selected.length ? selected.reduce(function (s, p) { return s + p.own; }, 0) / selected.length : 0;
    var uniqueness = Math.min(97, Math.round(100 - avgOwn + (currentMode === 'GPP' ? 18 : 0) + Math.random() * 14));
    document.getElementById('lineupBody').innerHTML = selected.map(function (p) {
      var init = p.name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
      return '<div class="player-row" onclick="this.classList.toggle(\'open\')"><div class="player-main"><div class="pl-left"><div class="pl-av">' + init + '</div><div><div class="pl-name">' + p.name + '</div><div class="pl-opp">' + p.opp + '</div></div></div><div class="pl-right"><div><div class="pl-sal">$' + p.salary.toLocaleString() + '</div><div class="pl-own">~' + p.own + '% own</div></div><span class="pl-tag tag-' + p.tag + '">' + p.tag + '</span><div class="pl-expand">▾</div></div></div><div class="player-detail"><div class="pd-grid"><div class="pd-stat"><div class="pd-stat-n" style="color:var(--gold);">' + p.ceil + '</div><div class="pd-stat-l">Ceiling pts</div></div><div class="pd-stat"><div class="pd-stat-n" style="color:var(--muted3);">' + p.floor + '</div><div class="pd-stat-l">Floor pts</div></div><div class="pd-stat"><div class="pd-stat-n" style="color:' + (p.own > 40 ? '#d94040' : 'var(--green2)') + ';">' + p.own + '%</div><div class="pd-stat-l">Proj. own%</div></div><div class="pd-stat"><div class="pd-stat-n" style="color:var(--parch);">$' + (p.ceil / p.salary * 1000).toFixed(1) + '</div><div class="pd-stat-l">Pts per $1k</div></div></div>' + (p.bust ? '<div class="bust-flag">⚠️ Bust Risk — ' + (p.bustReason || '') + '</div>' : '') + '<div class="corr-note">🔗 ' + p.corr + '</div></div></div>';
    }).join('');
    document.getElementById('totalSal').textContent = '$' + totalSal.toLocaleString() + ' / $' + CAP.toLocaleString();
    document.getElementById('uniqueScore').textContent = uniqueness + '%';

    var avgCeil = selected.reduce(function (s, p) { return s + p.ceil; }, 0) / (selected.length || 1);
    var avgFloor = selected.reduce(function (s, p) { return s + p.floor; }, 0) / (selected.length || 1);
    var projTotal = Math.round(selected.reduce(function (s, p) { return s + p.ceil; }, 0) * 0.72);
    var bustCount = selected.filter(function (p) { return p.bust; }).length;
    var grade, gradeColor, gradeNote;
    if (avgCeil >= 95 && bustCount === 0 && uniqueness >= 70) { grade = 'A+'; gradeColor = 'var(--green2)'; gradeNote = 'Elite ceiling, clean exposure, high uniqueness. Strong tournament entry.'; }
    else if (avgCeil >= 85 && bustCount <= 1 && uniqueness >= 60) { grade = 'A'; gradeColor = 'var(--green2)'; gradeNote = 'High ceiling with manageable risk. Solid GPP lineup.'; }
    else if (avgCeil >= 75 && uniqueness >= 50) { grade = 'B+'; gradeColor = 'var(--gold2)'; gradeNote = 'Good upside with some chalk exposure. Play in mid-sized fields.'; }
    else if (avgCeil >= 65) { grade = 'B'; gradeColor = 'var(--gold)'; gradeNote = 'Average ceiling. Better suited for cash games or small GPP.'; }
    else { grade = 'C'; gradeColor = 'var(--muted3)'; gradeNote = 'Low ceiling or high chalk exposure. Regenerate for better tournament exposure.'; }
    var ratingEl = document.getElementById('lineupRating');
    if (ratingEl) ratingEl.innerHTML = '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px 20px;background:var(--dark3);border-top:1px solid var(--border);"><div style="text-align:center;min-width:48px;"><div style="font-family:var(--fd);font-size:32px;color:' + gradeColor + ';line-height:1;">' + grade + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Grade</div></div><div style="display:flex;gap:12px;flex-wrap:wrap;flex:1;"><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:var(--gold);">' + projTotal + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Proj pts</div></div><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:var(--parch);">' + Math.round(avgCeil) + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Avg ceil</div></div><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:var(--muted3);">' + Math.round(avgFloor) + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Avg floor</div></div><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:' + (bustCount > 1 ? 'var(--red2)' : 'var(--green2)') + ';">' + bustCount + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Bust risks</div></div></div><div style="font-size:11px;color:var(--muted2);max-width:220px;font-style:italic;">' + gradeNote + '</div></div>';
  };

  /* ======================================================================
   * 3) buildPortfolio — same feasibility fix; builds from the LIVE pool.
   * ==================================================================== */
  window.buildPortfolio = function () {
    var sport = (document.getElementById('sportSel') || {}).value || 'ufc';
    var book = BOOKS[currentBook];
    var CAP = book.cap, SIZE = book.sizes[sport] || 6, MIN_SAL = book.minSal;
    var prefs = window.getPoolPrefs();
    var poolState = window.getPoolState(), poolKey = window.getCurrentPoolKey();
    var pps = poolState[poolKey] || {};
    var locks = prefs.locks || [];
    if (!window.isDFSUnlocked || !window.isDFSUnlocked()) {
      var el2 = document.getElementById('portfolioGrid');
      if (el2) el2.innerHTML = '<div style="padding:24px;text-align:center;color:var(--muted2);font-size:13px;">DFS Optimizer — start with the Optimizer plan ($15/mo).</div>';
      return;
    }
    var maxLineups = window.isWynnrPlus() ? pfCount : Math.min(pfCount, 20);
    var target = maxLineups;
    var maxExpPct = parseInt((document.getElementById('maxExposure') || {}).value || '70') || 70;
    var uniqPct = parseInt((document.getElementById('uniqFilter') || {}).value || '0') || 0;

    var fullPool = (window.POOLS[sport] || []).map(function (p) { return Object.assign({}, p, { salary: p.sal[currentBook || 'dk'] || 0 }); })
      .filter(function (p) { return p.salary > 0 && (prefs.excludes || []).indexOf(p.name) === -1; });
    var lockedPool = fullPool.filter(function (p) {
      if (locks.indexOf(p.name) > -1) return true;
      var pKey = p.name.replace(/[^a-z0-9]/gi, '_');
      return (parseFloat(pps['minexp_' + pKey] || '0') || 0) >= 100;
    });

    var intelScores = {};
    fullPool.forEach(function (p) {
      var base = p.fppf || p.ceil || 40;
      var salEff = p.salary > 0 ? (base / (p.salary / 1000)) : 0;
      var sc = base * 1.5 + salEff * 3;
      if (p.tag === 'anchor') sc += 40; if (p.tag === 'leverage') sc += 35; if (p.tag === 'value') sc += 25;
      if (p.tag === 'contrarian') sc += 15; if (p.tag === 'chalk') sc += 10;
      if (p.bust) sc -= 120;
      if (p.own >= 10 && p.own <= 35) sc += 30; if (p.own > 50) sc -= 20; if (p.own > 60) sc -= 30;
      if ((prefs.favorites || []).indexOf(p.name) > -1) sc += 60;
      if (p.record) { var pr = p.record.split('-'); var w = parseInt(pr[0]) || 0, l = parseInt(pr[1]) || 0; if (w + l > 0) sc += (w / (w + l)) * 20; }
      intelScores[p.name] = Math.max(1, sc);
    });

    var lineups = [], expCount = {}, attempts = 0, maxAttempts = target * 60;
    while (lineups.length < target && attempts < maxAttempts) {
      attempts++;
      var selected = lockedPool.slice();
      if (selected.reduce(function (s, p) { return s + p.salary; }, 0) > CAP || selected.length > SIZE) continue;
      var chosen = new Set(selected.map(function (p) { return p.name; }));
      var available = fullPool.filter(function (p) { return !chosen.has(p.name); });
      var guard = 0;
      while (selected.length < SIZE && guard < 2000) {
        guard++;
        var usedGames = selected.filter(function (p) { return locks.indexOf(p.name) === -1; }).map(function (p) { return p.game || ''; }).filter(Boolean);
        var basics = available.filter(function (p) {
          if (p.salary < MIN_SAL || chosen.has(p.name)) return false;
          var isLocked = locks.indexOf(p.name) > -1;
          if (!isLocked && p.game && usedGames.indexOf(p.game) > -1) return false;
          var pExp = lineups.length > 0 ? (expCount[p.name] || 0) / lineups.length : 0;
          var pKey = p.name.replace(/[^a-z0-9]/gi, '_');
          var pMax = parseFloat(pps['maxexp_' + pKey] || '0') || 0;
          if (pMax > 0 && pExp * 100 >= pMax) return false;
          if (lineups.length > 2 && pExp * 100 >= maxExpPct && (prefs.favorites || []).indexOf(p.name) === -1) return false;
          return true;
        });
        var eligible = basics.filter(function (p) { return feasible(available, selected, p, SIZE, CAP, locks); });
        if (!eligible.length) break;
        var diversity = Math.min(0.4, target / 50);
        var totalScore = eligible.reduce(function (s, p) { return s + intelScores[p.name]; }, 0);
        var rand = Math.random() * totalScore, cum = 0, pick = eligible[eligible.length - 1];
        for (var pi = 0; pi < eligible.length; pi++) {
          cum += intelScores[eligible[pi].name] * (1 + diversity * (Math.random() - 0.5));
          if (cum >= rand) { pick = eligible[pi]; break; }
        }
        selected.push(pick); chosen.add(pick.name);
        expCount[pick.name] = (expCount[pick.name] || 0) + 1;
        available = available.filter(function (p) { return p.name !== pick.name; });
      }
      var total = selected.reduce(function (s, p) { return s + p.salary; }, 0);
      if (selected.length !== SIZE || total > CAP || (new Set(selected.map(function (p) { return p.name; }))).size !== SIZE) {
        // roll back the exposure counts from a failed attempt
        selected.forEach(function (p) { if (locks.indexOf(p.name) === -1 && expCount[p.name]) expCount[p.name]--; });
        continue;
      }
      if (window.isWynnrPlus() && uniqPct > 0 && lineups.length > 0) {
        var names = selected.map(function (p) { return p.name; });
        var tooSim = lineups.some(function (ex) {
          var exN = ex.map(function (p) { return p.name; });
          var shared = names.filter(function (n) { return exN.indexOf(n) > -1; }).length;
          return Math.round(((SIZE - shared) / SIZE) * 100) < uniqPct;
        });
        if (tooSim && attempts < maxAttempts * 0.8) {
          selected.forEach(function (p) { if (locks.indexOf(p.name) === -1 && expCount[p.name]) expCount[p.name]--; });
          continue;
        }
      }
      lineups.push(selected.slice());
    }

    var el = document.getElementById('portfolioGrid');
    if (!el) return;
    if (!lineups.length) { el.innerHTML = '<div style="color:var(--muted2);font-size:13px;padding:14px;">Could not build lineups. Try fewer lineups, lower uniqueness %, or reset the pool.</div>'; return; }
    var ho = lineups.map(function (lu, i) {
      var sal = lu.reduce(function (s, p) { return s + p.salary; }, 0);
      var avgOwn = Math.round(lu.reduce(function (s, p) { return s + p.own; }, 0) / lu.length);
      var uniq = Math.min(96, Math.round(100 - avgOwn + (Math.random() * 12)));
      return '<div class="pf-row"><div class="pf-n">' + (i + 1) + '</div><div class="pf-players">' + lu.map(function (p) { return p.name.split(' ').pop(); }).join(' · ') + '</div><div class="pf-unique">Uniq: <span>' + uniq + '%</span></div><div class="pf-sal">$' + sal.toLocaleString() + '</div></div>';
    }).join('');
    var topExp = Object.entries(expCount).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
    ho += '<div style="margin-top:10px;padding:10px 13px;background:var(--dark2);border:1px solid var(--border);border-radius:var(--r);font-size:11px;color:var(--muted2);">Built ' + lineups.length + '/' + target + ' lineups &nbsp;·&nbsp; Top exposure: ' + topExp.map(function (e) { return e[0].split(' ').pop() + ' <b style="color:var(--parch);">' + Math.round(e[1] / lineups.length * 100) + '%</b>'; }).join(' · ') + '</div>';
    el.innerHTML = ho;
  };

  console.log('[dfs-fix] active — optimizer + portfolio salary logic corrected, moneylines re-injected.');
})();
