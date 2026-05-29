/* ============================================================================
 * OnlyWynnrs — dfs-fix.js  (v2)
 * Load LAST (after owleverage.js, app.js, owleverage-patch.js).
 * v2 adds: working pool filters (Min$/Max$/Min Proj), strict portfolio
 * uniqueness, min/max exposure enforcement, a balanced tag spread, and
 * refreshed Macau moneylines (current market).
 * ==========================================================================*/
(function () {
  "use strict";
  if (!window.OWLeverage) { console.warn('[dfs-fix] OWLeverage missing — aborting.'); return; }

  /* ---- UFC Macau inputs — moneylines refreshed to current market ---------- */
  var MACAU = {
    'Song Yadong':{ml:-600,fin:0.60,rec:'22-9-1',main:true},
    'Deiveson Figueiredo':{ml:440,fin:0.55,rec:'25-6-1',main:true},
    'Sergei Pavlovich':{ml:-620,fin:0.85,rec:'20-3-0'},
    'Tallison Teixeira':{ml:430,fin:0.60,rec:'9-1-0'},
    'Jake Matthews':{ml:-430,fin:0.50,rec:'22-8-0'},
    'Carlston Harris':{ml:310,fin:0.55,rec:'19-7-0'},
    'Kai Asakura':{ml:-300,fin:0.70,rec:'21-6-0'},
    'Cameron Smotherman':{ml:245,fin:0.45,rec:'12-6-0'},
    'Zhang Mingyang':{ml:-255,fin:0.82,rec:'19-7-0'},
    'Alonzo Menifield':{ml:200,fin:0.65,rec:'17-6-1'},
    'Rei Tsuruya':{ml:-285,fin:0.35,rec:'10-1-0'},
    'Luis Gurule':{ml:212,fin:0.40,rec:'11-3-0'},
    'Alex Perez':{ml:-160,fin:0.55,rec:'26-10-0'},
    'Su Mudaerji':{ml:130,fin:0.60,rec:'19-7-0'},
    'Ding Meng':{ml:-120,fin:0.55,rec:'35-9-0'},
    'Jose Henrique Souza':{ml:100,fin:0.55,rec:'8-1-0'},
    'Jaqueline Amorim':{ml:-120,fin:0.55,rec:'10-2-0'},
    'Loma Lookboonmee':{ml:100,fin:0.30,rec:'10-4-0'},
    'Rodrigo Vera':{ml:-115,fin:0.50,rec:'21-1-1'},
    'Kangjie Zhu':{ml:-105,fin:0.45,rec:'21-4-0'},
    'Luis Felipe Dias':{ml:-183,fin:0.60,rec:'16-5-0'},
    'Yi Sak Lee':{ml:142,fin:0.45,rec:'8-1-0'},
    'Jingnan Xiong':{ml:-177,fin:0.50,rec:'14-1-0'},
    'Angela Hill':{ml:156,fin:0.30,rec:'18-16-0'},
    'Cody Haddon':{ml:-391,fin:0.65,rec:'8-1-0'},
    'Aori Qileng':{ml:285,fin:0.45,rec:'26-11-0'}
  };

  /* ---- balanced re-tagging so leverage/ceiling/chalk actually surface ----- */
  function pctl(sortedAsc, p) { var i = (sortedAsc.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (i - lo); }
  function reTag(players) {
    var vals = players.map(function (p) { return p.value || 0; }).sort(function (a, b) { return a - b; });
    var fins = players.map(function (p) { return p.finishEquity || 0; }).sort(function (a, b) { return a - b; });
    var valMed = pctl(vals, 0.5), valP60 = pctl(vals, 0.60), finP55 = pctl(fins, 0.55);
    players.forEach(function (p) {
      var wp = p.winProb || 0.5, lev = p.leverage || 0, own = p.fieldOwn || 0, fe = p.finishEquity || 0, val = p.value || 0;
      var sal = (p.sal && p.sal.dk) || p.salary || 0, t;
      if (wp >= 0.60 && val >= valMed && lev > -2) t = 'anchor';            // build-around favorites
      else if (own >= 30 && lev <= -2) t = 'chalk';                          // overowned vs merit — fade-lean
      else if (lev >= 2) t = 'leverage';                                     // underowned vs merit — the edge
      else if (fe >= finP55 && wp >= 0.42 && own < 30) t = 'ceiling';        // high-upside finisher, ownable
      else if (val >= valP60 && sal <= 8300) t = 'value';                    // salary saver
      else if (own < 12 || wp < 0.32) t = 'contrarian';                      // low-owned dart
      else t = 'value';
      p.tag = t;
      p.corr = (p.signal || p.corr || '');
    });
  }

  function stampRecompute() {
    var P = window.POOLS && window.POOLS.ufc;
    if (!Array.isArray(P) || !P.length) return false;
    var hit = 0;
    P.forEach(function (p) {
      var m = MACAU[p.name]; if (!m) return; hit++;
      p.ml = m.ml; p.finishLean = m.fin;
      if (!p.record) p.record = m.rec;
      if (m.main) { p.isMainEvent = true; p.fightFormat = 5; }
    });
    if (!hit) return false;
    try { window.OWLeverage.computeSlate(P, { book: 'dk', sport: 'ufc' }); reTag(P); } catch (e) { console.warn('[dfs-fix] compute failed', e); }
    var dfsPage = document.getElementById('page-dfs');
    if (dfsPage && dfsPage.style.display !== 'none') {
      if (typeof renderPlayerPool === 'function') renderPlayerPool();
      if (typeof refreshLeverage === 'function') refreshLeverage();
      if (typeof buildPortfolio === 'function') buildPortfolio();
    }
    console.log('[dfs-fix] stamped ' + hit + ' fighters; ownership/tags/leverage/portfolio recomputed.');
    return true;
  }
  var _origLoad = window.loadDfsSlates;
  if (typeof _origLoad === 'function') {
    window.loadDfsSlates = async function () { var o = await _origLoad.apply(this, arguments); stampRecompute(); return o; };
  }
  [1500, 3000].forEach(function (t) { setTimeout(stampRecompute, t); });

  /* ---- pool filters: Min$ / Max$ / Min Proj (per-fighter) ----------------- */
  function num(id) { var e = document.getElementById(id); if (!e) return 0; var v = parseInt((e.value || '').toString().replace(/[^0-9.]/g, '')) || 0; return v; }
  function projFilterEl() { var ids = ['minProj', 'poolMinProj', 'projMin', 'poolProjMin', 'minProjection']; for (var i = 0; i < ids.length; i++) if (document.getElementById(ids[i])) return ids[i]; return null; }
  function poolBounds() {
    var pid = projFilterEl();
    return { min$: num('salMin'), max$: num('salMax'), minProj: pid ? num(pid) : 0 };
  }
  function passesFilters(p, b) {
    if (b.min$ && p.salary < b.min$) return false;
    if (b.max$ && p.salary > b.max$) return false;
    if (b.minProj && (p.proj || 0) < b.minProj) return false;
    return true;
  }

  // make the displayed pool reflect the salary filters (original renderPlayerPool ignores them).
  // Salary is parsed straight from each row's "$X,XXX" text — robust, no name collisions.
  // (Min Proj is enforced in lineup/portfolio generation, where the real proj value is available.)
  var _origRPP = window.renderPlayerPool;
  if (typeof _origRPP === 'function') {
    window.renderPlayerPool = function () {
      _origRPP.apply(this, arguments);
      try {
        var b = poolBounds();
        if (!b.min$ && !b.max$) return;
        var grid = document.getElementById('playerPoolGrid'); if (!grid) return;
        var shown = 0;
        Array.prototype.forEach.call(grid.children, function (row) {
          var m = (row.textContent || '').match(/\$([\d,]+)/);
          if (!m) return;
          var salary = parseInt(m[1].replace(/,/g, '')) || 0;
          var keep = (!b.min$ || salary >= b.min$) && (!b.max$ || salary <= b.max$);
          row.style.display = keep ? '' : 'none';
          if (keep) shown++;
        });
        var label = document.getElementById('poolCountLabel');
        if (label) label.textContent = shown + ' players (filtered)';
      } catch (e) {}
    };
  }

  /* ---- shared cap-feasible reservation (fixes "can't fill 6 seats") ------- */
  function cheapestReserve(available, usedGames, k) {
    if (k <= 0) return 0;
    var byGame = {};
    available.forEach(function (p) { var g = p.game || ('_' + p.name); if (usedGames.indexOf(g) > -1) return; if (byGame[g] == null || p.salary < byGame[g]) byGame[g] = p.salary; });
    var mins = Object.keys(byGame).map(function (g) { return byGame[g]; }).sort(function (a, b) { return a - b; });
    if (mins.length < k) return Infinity;
    var s = 0; for (var i = 0; i < k; i++) s += mins[i]; return s;
  }
  function feasible(available, selected, candidate, SIZE, CAP, locks) {
    var cur = selected.reduce(function (s, p) { return s + p.salary; }, 0);
    var slotsLeft = SIZE - selected.length;
    var used = selected.filter(function (p) { return locks.indexOf(p.name) === -1; }).map(function (p) { return p.game || ''; }).filter(Boolean);
    var rest = available.filter(function (q) { return q.name !== candidate.name; });
    return (cur + candidate.salary + cheapestReserve(rest, used.concat([candidate.game || ('_' + candidate.name)]), slotsLeft - 1)) <= CAP;
  }
  function buildPool(sport, prefs, bounds) {
    return POOLS[sport].map(function (p) { return Object.assign({}, p, { salary: p.sal[currentBook] }); })
      .filter(function (p) { return p.salary > 0 && (prefs.excludes || []).indexOf(p.name) === -1 && passesFilters(p, bounds); });
  }

  /* ======================================================================
   * genLineup — single lineup, feasibility-correct, respects pool filters
   * ==================================================================== */
  window.genLineup = function () {
    if (!isDFSUnlocked()) {
      var gEl = document.getElementById('lineupDisplay');
      if (gEl) { gEl.innerHTML = '<div style="padding:30px;text-align:center;"><div style="font-size:20px;margin-bottom:8px;">&#128274;</div><div style="font-weight:700;margin-bottom:6px;">DFS Optimizer</div><div style="font-size:12px;color:var(--muted2);">Available on Optimizer plan ($15/mo) and above.</div></div>'; }
      return;
    }
    var sport = (document.getElementById('sportSel') || {}).value || 'ufc';
    var book = BOOKS[currentBook];
    var CAP = book.cap, SIZE = book.sizes[sport] || 6, MIN_SAL = book.minSal;
    document.getElementById('optTitle').textContent = sport.toUpperCase() + ' · ' + currentMode + ' LINEUP #' + (Math.floor(Math.random() * 99) + 1);
    document.getElementById('optSub').textContent = book.name + ' · $' + CAP.toLocaleString() + ' cap · ' + SIZE + ' players · Click any player for intel';
    if (typeof updateBookInfo === 'function') updateBookInfo();
    if (typeof renderPlayerPool === 'function') renderPlayerPool();

    var capWarn = document.getElementById('capWarning');
    var prefs = getPoolPrefs();
    var locks = prefs.locks || [];
    var bounds = poolBounds();
    var pool = buildPool(sport, prefs, bounds);
    var poolState = getPoolState(), poolKey = getCurrentPoolKey();
    var pps = poolState[poolKey] || {};
    var lockedPool = pool.filter(function (p) { if (locks.indexOf(p.name) > -1) return true; var k = p.name.replace(/[^a-z0-9]/gi, '_'); return (parseFloat(pps['minexp_' + k] || '0') || 0) >= 100; });

    if (pool.length < SIZE) {
      if (capWarn) { capWarn.style.display = 'block'; capWarn.textContent = '⚠️ Only ' + pool.length + ' fighters pass your filters — need ' + SIZE + '. Loosen Min$/Max$/Min Proj.'; }
    }

    var selected = [], valid = false, outer = 0;
    var lockSal = lockedPool.reduce(function (s, p) { return s + p.salary; }, 0);
    if (lockedPool.length > SIZE || lockSal > CAP) {
      if (capWarn) { capWarn.style.display = 'block'; capWarn.textContent = '⚠️ Locked players exceed the roster size or cap. Remove a lock.'; }
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
          var used = selected.filter(function (p) { return locks.indexOf(p.name) === -1; }).map(function (p) { return p.game || ''; }).filter(Boolean);
          var basics = available.filter(function (p) {
            if (p.salary < MIN_SAL || chosen.has(p.name)) return false;
            if (locks.indexOf(p.name) === -1 && p.game && used.indexOf(p.game) > -1) return false;
            return true;
          });
          var eligible = basics.filter(function (p) { return feasible(available, selected, p, SIZE, CAP, locks); });
          if (!eligible.length) break;
          var scored = eligible.map(function (p) {
            var base = currentMode === 'GPP' ? (p.ceil_pts || p.ceil) : (p.floor_pts || p.floor);
            var fights = 0; if (p.record) { var rp = p.record.split('-'); fights = (parseInt(rp[0]) || 0) + (parseInt(rp[1]) || 0); }
            var fppfW = fights >= 10 ? 1 : fights >= 5 ? 0.6 : fights >= 3 ? 0.3 : 0;
            var intel = getPlayerIntelScore(p, currentMode);
            var modeScore = currentMode === 'GPP' ? (100 - p.own) * 0.85 + base * 0.3 + (Math.random() - 0.2) * 45 : (p.floor_pts || p.floor) * 0.7 + p.own * 0.1 + (Math.random() - 0.5) * 12;
            var score = base + ((p.fppf && fppfW > 0) ? p.fppf * fppfW * 0.12 : 0) + intel.score + modeScore;
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
        var total = selected.reduce(function (s, p) { return s + p.salary; }, 0);
        var dupes = (new Set(selected.map(function (p) { return p.name; }))).size !== selected.length;
        valid = selected.length === SIZE && total <= CAP && !dupes;
      }
    }
    if (!valid || selected.length !== SIZE) {
      selected = lockedPool.slice();
      var c2 = new Set(selected.map(function (p) { return p.name; }));
      var av2 = pool.filter(function (p) { return !c2.has(p.name); }).sort(function (a, b) { return (b.ceil_pts || b.ceil) - (a.ceil_pts || a.ceil); });
      var loops = 0;
      while (selected.length < SIZE && loops < 400) {
        loops++;
        var used2 = selected.filter(function (p) { return locks.indexOf(p.name) === -1; }).map(function (p) { return p.game || ''; }).filter(Boolean);
        var p2 = null;
        for (var i = 0; i < av2.length; i++) { var c = av2[i]; if (c2.has(c.name)) continue; if (c.game && used2.indexOf(c.game) > -1) continue; if (feasible(av2.filter(function (q) { return !c2.has(q.name); }), selected, c, SIZE, CAP, locks)) { p2 = c; break; } }
        if (!p2) break; selected.push(p2); c2.add(p2.name);
      }
      if (capWarn && pool.length >= SIZE) { capWarn.style.display = selected.length === SIZE ? 'none' : 'block'; if (selected.length !== SIZE) capWarn.textContent = '⚠️ Not enough cap-legal fighters to fill ' + SIZE + ' seats with current locks/filters.'; }
    } else if (capWarn && pool.length >= SIZE) { capWarn.style.display = 'none'; }

    renderLineup(selected, CAP, SIZE);
  };

  function renderLineup(selected, CAP, SIZE) {
    var totalSal = selected.reduce(function (s, p) { return s + p.salary; }, 0);
    var avgOwn = selected.length ? selected.reduce(function (s, p) { return s + p.own; }, 0) / selected.length : 0;
    var uniqueness = Math.min(97, Math.round(100 - avgOwn + (currentMode === 'GPP' ? 18 : 0) + Math.random() * 14));
    document.getElementById('lineupBody').innerHTML = selected.map(function (p) {
      var init = p.name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
      return '<div class="player-row" onclick="this.classList.toggle(\'open\')"><div class="player-main"><div class="pl-left"><div class="pl-av">' + init + '</div><div><div class="pl-name">' + p.name + '</div><div class="pl-opp">' + p.opp + '</div></div></div><div class="pl-right"><div><div class="pl-sal">$' + p.salary.toLocaleString() + '</div><div class="pl-own">~' + p.own + '% own</div></div><span class="pl-tag tag-' + p.tag + '">' + p.tag + '</span><div class="pl-expand">▾</div></div></div><div class="player-detail"><div class="pd-grid"><div class="pd-stat"><div class="pd-stat-n" style="color:var(--gold);">' + p.ceil + '</div><div class="pd-stat-l">Ceiling pts</div></div><div class="pd-stat"><div class="pd-stat-n" style="color:var(--muted3);">' + p.floor + '</div><div class="pd-stat-l">Floor pts</div></div><div class="pd-stat"><div class="pd-stat-n" style="color:' + (p.own > 40 ? '#d94040' : 'var(--green2)') + ';">' + p.own + '%</div><div class="pd-stat-l">Proj. own%</div></div><div class="pd-stat"><div class="pd-stat-n" style="color:var(--parch);">$' + (p.ceil / p.salary * 1000).toFixed(1) + '</div><div class="pd-stat-l">Pts per $1k</div></div></div>' + (p.bust ? '<div class="bust-flag">⚠️ Bust Risk</div>' : '') + '<div class="corr-note">🔗 ' + (p.corr || p.signal || '') + '</div></div></div>';
    }).join('');
    document.getElementById('totalSal').textContent = '$' + totalSal.toLocaleString() + ' / $' + CAP.toLocaleString();
    document.getElementById('uniqueScore').textContent = uniqueness + '%';
    var avgCeil = selected.reduce(function (s, p) { return s + p.ceil; }, 0) / (selected.length || 1);
    var avgFloor = selected.reduce(function (s, p) { return s + p.floor; }, 0) / (selected.length || 1);
    var projTotal = Math.round(selected.reduce(function (s, p) { return s + p.ceil; }, 0) * 0.72);
    var bustCount = selected.filter(function (p) { return p.bust; }).length;
    var grade, gc, gn;
    if (avgCeil >= 95 && bustCount === 0 && uniqueness >= 70) { grade = 'A+'; gc = 'var(--green2)'; gn = 'Elite ceiling, clean exposure, high uniqueness. Strong tournament entry.'; }
    else if (avgCeil >= 85 && bustCount <= 1 && uniqueness >= 60) { grade = 'A'; gc = 'var(--green2)'; gn = 'High ceiling with manageable risk. Solid GPP lineup.'; }
    else if (avgCeil >= 75 && uniqueness >= 50) { grade = 'B+'; gc = 'var(--gold2)'; gn = 'Good upside with some chalk exposure.'; }
    else if (avgCeil >= 65) { grade = 'B'; gc = 'var(--gold)'; gn = 'Average ceiling. Better for cash or small GPP.'; }
    else { grade = 'C'; gc = 'var(--muted3)'; gn = 'Low ceiling or high chalk. Regenerate for better exposure.'; }
    var el = document.getElementById('lineupRating');
    if (el) el.innerHTML = '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px 20px;background:var(--dark3);border-top:1px solid var(--border);"><div style="text-align:center;min-width:48px;"><div style="font-family:var(--fd);font-size:32px;color:' + gc + ';line-height:1;">' + grade + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Grade</div></div><div style="display:flex;gap:12px;flex-wrap:wrap;flex:1;"><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:var(--gold);">' + projTotal + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">Proj pts</div></div><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:var(--parch);">' + Math.round(avgCeil) + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">Avg ceil</div></div><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:var(--muted3);">' + Math.round(avgFloor) + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">Avg floor</div></div><div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;"><div style="font-family:var(--fd);font-size:20px;color:' + (bustCount > 1 ? 'var(--red2)' : 'var(--green2)') + ';">' + bustCount + '</div><div style="font-size:9px;color:var(--muted);text-transform:uppercase;">Bust risks</div></div></div><div style="font-size:11px;color:var(--muted2);max-width:220px;font-style:italic;">' + gn + '</div></div>';
  }

  /* ======================================================================
   * buildPortfolio — feasibility + filters + STRICT uniqueness + min/max exp
   * ==================================================================== */
  window.buildPortfolio = function () {
    var sport = (document.getElementById('sportSel') || {}).value || 'ufc';
    var book = BOOKS[currentBook];
    var CAP = book.cap, SIZE = book.sizes[sport] || 6, MIN_SAL = book.minSal;
    var prefs = getPoolPrefs(), locks = prefs.locks || [];
    var poolState = getPoolState(), poolKey = getCurrentPoolKey(), pps = poolState[poolKey] || {};
    var el = document.getElementById('portfolioGrid'); if (!el) return;
    if (!isDFSUnlocked()) { el.innerHTML = '<div style="padding:24px;text-align:center;color:var(--muted2);font-size:13px;">DFS Optimizer — start with the Optimizer plan ($15/mo).</div>'; return; }

    var target = isWynnrPlus() ? pfCount : Math.min(pfCount, 20);
    var maxExpPct = parseInt((document.getElementById('maxExposure') || {}).value || '70') || 70;
    var uniqPct = parseInt((document.getElementById('uniqFilter') || {}).value || '0') || 0;
    var bounds = poolBounds();
    var fullPool = buildPool(sport, prefs, bounds);

    var scores = {};
    fullPool.forEach(function (p) {
      var base = p.fppf || p.ceil || 40, salEff = p.salary > 0 ? base / (p.salary / 1000) : 0, sc = base * 1.5 + salEff * 3;
      sc += ({ anchor: 40, leverage: 35, ceiling: 30, value: 25, contrarian: 15, chalk: 10 })[p.tag] || 0;
      if (p.bust) sc -= 120;
      if (p.own >= 10 && p.own <= 35) sc += 30; if (p.own > 50) sc -= 20; if (p.own > 60) sc -= 30;
      if ((prefs.favorites || []).indexOf(p.name) > -1) sc += 60;
      if (p.record) { var rp = p.record.split('-'); var w = parseInt(rp[0]) || 0, l = parseInt(rp[1]) || 0; if (w + l > 0) sc += (w / (w + l)) * 20; }
      scores[p.name] = Math.max(1, sc);
    });

    // min/max exposure targets (counts)
    var minTarget = {}, maxCap = {};
    fullPool.forEach(function (p) {
      var k = p.name.replace(/[^a-z0-9]/gi, '_');
      var mn = parseFloat(pps['minexp_' + k] || '0') || 0, mx = parseFloat(pps['maxexp_' + k] || '0') || 0;
      if (mn > 0 && mn < 100) minTarget[p.name] = Math.ceil(mn / 100 * target);
      if (mx > 0) maxCap[p.name] = Math.floor(mx / 100 * target);
    });

    var lineups = [], exp = {}, attempts = 0, maxA = target * 200, builtShort = false;
    while (lineups.length < target && attempts < maxA) {
      attempts++;
      var remaining = target - lineups.length;
      var selected = [], chosen = new Set(), bail = false;
      // hard locks first
      lockedPoolNames().forEach(function (n) { var pl = fullPool.find(function (p) { return p.name === n; }); if (pl && !chosen.has(n)) { if (selected.some(function (s) { return s.game === pl.game; })) bail = true; selected.push(pl); chosen.add(n); } });
      // min-exposure players who MUST appear now to still hit their target
      Object.keys(minTarget).forEach(function (n) {
        if (chosen.has(n)) return;
        var need = minTarget[n] - (exp[n] || 0);
        if (need >= remaining && need > 0) { var pl = fullPool.find(function (p) { return p.name === n; }); if (pl) { if (selected.some(function (s) { return s.game === pl.game; })) bail = true; else { selected.push(pl); chosen.add(n); } } }
      });
      if (bail || selected.reduce(function (s, p) { return s + p.salary; }, 0) > CAP || selected.length > SIZE) continue;
      var available = fullPool.filter(function (p) { return !chosen.has(p.name); });
      var guard = 0;
      while (selected.length < SIZE && guard < 2000) {
        guard++;
        var used = selected.filter(function (p) { return locks.indexOf(p.name) === -1; }).map(function (p) { return p.game || ''; }).filter(Boolean);
        var basics = available.filter(function (p) {
          if (p.salary < MIN_SAL || chosen.has(p.name)) return false;
          if (locks.indexOf(p.name) === -1 && p.game && used.indexOf(p.game) > -1) return false;
          if (maxCap[p.name] != null && (exp[p.name] || 0) >= maxCap[p.name]) return false;
          var pExp = lineups.length > 0 ? (exp[p.name] || 0) / lineups.length : 0;
          if (lineups.length > 2 && pExp * 100 >= maxExpPct && (prefs.favorites || []).indexOf(p.name) === -1 && !minTarget[p.name]) return false;
          return true;
        }).filter(function (p) { return feasible(available, selected, p, SIZE, CAP, locks); });
        if (!basics.length) break;
        var weighted = basics.map(function (p) {
          var w = scores[p.name];
          if (minTarget[p.name]) { var need = minTarget[p.name] - (exp[p.name] || 0); if (need > 0) w *= (1 + need / Math.max(1, remaining) * 4); }
          return { p: p, w: w * (1 + 0.35 * (Math.random() - 0.5)) };
        });
        var tot = weighted.reduce(function (s, x) { return s + x.w; }, 0), rnd = Math.random() * tot, cum = 0, pick = weighted[weighted.length - 1].p;
        for (var wi = 0; wi < weighted.length; wi++) { cum += weighted[wi].w; if (cum >= rnd) { pick = weighted[wi].p; break; } }
        selected.push(pick); chosen.add(pick.name);
        available = available.filter(function (p) { return p.name !== pick.name; });
      }
      if (selected.length !== SIZE) continue;
      var total = selected.reduce(function (s, p) { return s + p.salary; }, 0);
      if (total > CAP || (new Set(selected.map(function (p) { return p.name; }))).size !== SIZE) continue;
      // STRICT real uniqueness vs every existing lineup
      var names = selected.map(function (p) { return p.name; }), minU = 100;
      lineups.forEach(function (ex2) { var en = ex2.map(function (p) { return p.name; }); var sh = names.filter(function (n) { return en.indexOf(n) > -1; }).length; var u = Math.round((SIZE - sh) / SIZE * 100); if (u < minU) minU = u; });
      if (lineups.length > 0 && uniqPct > 0 && minU < uniqPct) continue;
      lineups.push(selected.slice());
      selected.forEach(function (p) { exp[p.name] = (exp[p.name] || 0) + 1; });
    }
    if (lineups.length < target) builtShort = true;

    function lineupRealUniq(idx) {
      if (lineups.length < 2) return 100;
      var names = lineups[idx].map(function (p) { return p.name; }), minU = 100;
      lineups.forEach(function (ex2, j) { if (j === idx) return; var en = ex2.map(function (p) { return p.name; }); var sh = names.filter(function (n) { return en.indexOf(n) > -1; }).length; var u = Math.round((SIZE - sh) / SIZE * 100); if (u < minU) minU = u; });
      return minU;
    }
    if (!lineups.length) { el.innerHTML = '<div style="color:var(--muted2);font-size:13px;padding:14px;">No lineups satisfy your constraints. Lower the uniqueness %, relax exposure caps, or loosen pool filters.</div>'; return; }
    var ho = lineups.map(function (lu, i) {
      var sal = lu.reduce(function (s, p) { return s + p.salary; }, 0);
      return '<div class="pf-row"><div class="pf-n">' + (i + 1) + '</div><div class="pf-players">' + lu.map(function (p) { return p.name.split(' ').pop(); }).join(' · ') + '</div><div class="pf-unique">Uniq: <span>' + lineupRealUniq(i) + '%</span></div><div class="pf-sal">$' + sal.toLocaleString() + '</div></div>';
    }).join('');
    var topExp = Object.entries(exp).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
    ho += '<div style="margin-top:10px;padding:10px 13px;background:var(--dark2);border:1px solid var(--border);border-radius:var(--r);font-size:11px;color:var(--muted2);">Built ' + lineups.length + '/' + target + ' lineups' + (builtShort ? ' (constraints limited the count — loosen uniqueness/filters for more)' : '') + ' &nbsp;·&nbsp; Top exposure: ' + topExp.map(function (e) { return e[0].split(' ').pop() + ' <b style="color:var(--parch);">' + Math.round(e[1] / lineups.length * 100) + '%</b>'; }).join(' · ') + '</div>';
    el.innerHTML = ho;

    function lockedPoolNames() { return fullPool.filter(function (p) { if (locks.indexOf(p.name) > -1) return true; var k = p.name.replace(/[^a-z0-9]/gi, '_'); return (parseFloat(pps['minexp_' + k] || '0') || 0) >= 100; }).map(function (p) { return p.name; }); }
  };

  console.log('[dfs-fix v2] active — filters, strict uniqueness, exposure caps, tag spread, refreshed odds.');
})();
