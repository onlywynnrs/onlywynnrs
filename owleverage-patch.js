/* ============================================================================
 * OnlyWynnrs — OWLeverage patch
 * Load AFTER app.js. Touches nothing in app.js on disk — it wraps three
 * functions at runtime so the DFS pipeline computes real ownership/tags/
 * leverage (via owleverage.js) and adds ML + Finish-lean inputs to the
 * Intel Override Editor.
 *
 * index.html load order:
 *   <script src="data.js"></script>
 *   <script src="owleverage.js"></script>
 *   <script src="app.js"></script>
 *   <script src="owleverage-patch.js"></script>   <-- this file, last
 * ==========================================================================*/
(function () {
  "use strict";
  if (!window.OWLeverage) { console.warn("[OWLeverage] owleverage.js not loaded — patch inactive."); return; }

  function curBook()  { return (document.getElementById('adminPlatform') || {}).value || 'dk'; }
  function curSport() { return (document.getElementById('adminSport') || {}).value || 'ufc'; }
  function leanToWord(v){ return (v >= 0.7) ? 'high' : (v <= 0.4) ? 'low' : 'med'; }
  function wordToLean(w){ return ({ low: 0.35, med: 0.55, high: 0.75 })[w] || 0.55; }

  /* ---- 1) parseDkCsv: recover moneyline from the odds lookup, then compute -- */
  var _origParseDk = window.parseDkCsv;
  if (typeof _origParseDk === 'function') {
    window.parseDkCsv = function (text) {
      var r = _origParseDk(text);
      if (r && r.players && r.players.length) {
        var lookup = window._ufcOddsLookup || {};
        r.players.forEach(function (p) {
          var ln = (p.name || '').split(/\s+/).pop().toLowerCase();
          if (lookup[ln] && lookup[ln].odds != null) p.ml = lookup[ln].odds;
        });
        try { window.OWLeverage.computeSlate(r.players, { book: curBook(), sport: curSport() }); } catch (e) { console.warn('[OWLeverage] parse compute failed', e); }
      }
      return r;
    };
  }

  /* ---- 2) loadDfsSlates: enrich POOLS after the original populates it ----- */
  var _origLoad = window.loadDfsSlates;
  function enrichPools() {
    if (!window.POOLS) return;
    Object.keys(window.POOLS).forEach(function (sport) {
      var arr = window.POOLS[sport];
      if (Array.isArray(arr) && arr.length) {
        try { window.OWLeverage.computeSlate(arr, { book: 'dk', sport: sport }); } catch (e) {}
      }
    });
    var dfsPage = document.getElementById('page-dfs');
    if (dfsPage && dfsPage.style.display !== 'none') {
      if (typeof window.renderPlayerPool === 'function') window.renderPlayerPool();
      if (typeof window.refreshLeverage === 'function') window.refreshLeverage();
    }
  }
  if (typeof _origLoad === 'function') {
    window.loadDfsSlates = async function () {
      var out = await _origLoad.apply(this, arguments);
      enrichPools();
      return out;
    };
  }
  // catch the first auto-load that app.js scheduled with the original reference
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(enrichPools, 1400); });
  } else {
    setTimeout(enrichPools, 1400);
  }

  /* ---- 3) Intel Override Editor: add ML + FIN columns -------------------- */
  window.renderOverrideEditor = function (slate) {
    var table = document.getElementById('overrideEditorTable');
    if (!table) return;
    if (!Array.isArray(slate.players) || !slate.players.length) {
      table.innerHTML = '<div style="color:var(--muted2);padding:20px;text-align:center;">This slate has no players.</div>';
      return;
    }
    var sorted = slate.players.slice().sort(function (a, b) {
      var as = (a.sal && typeof a.sal === 'object') ? a.sal.dk : (a.sal || 0);
      var bs = (b.sal && typeof b.sal === 'object') ? b.sal.dk : (b.sal || 0);
      return bs - as;
    });
    window._editPlayerOrder = sorted.map(function (p) {
      return slate.players.findIndex(function (o) { return o.name === p.name; });
    });

    var COLS = '1.4fr 66px 66px 62px 78px 44px 92px 64px 48px';
    var h = '<div style="background:var(--dark2);border:1px solid var(--border);border-radius:var(--r2);padding:18px;margin-bottom:16px;">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">';
    h += '<div><div style="font-family:var(--fd);font-size:16px;letter-spacing:1px;">EDIT SLATE INTEL</div>';
    h += '<div style="font-size:11px;color:var(--muted2);margin-top:3px;">Type moneylines (powers win-prob + leverage), set finish lean, fix ownership after weigh-ins, mark 5-round main events, flag injuries.</div></div>';
    h += '<button class="btn btn-gold btn-sm" onclick="saveSlateOverrides()" style="font-weight:700;">💾 Save All Changes</button></div>';
    h += '<div style="font-size:11px;color:var(--muted);letter-spacing:1px;margin-bottom:8px;padding:8px 0;border-bottom:1px solid var(--border);display:grid;grid-template-columns:' + COLS + ';gap:9px;align-items:center;">';
    h += '<div>FIGHTER</div><div>SAL</div><div>ML</div><div>PROJ</div><div>OWN %</div><div>5RD</div><div>TAG</div><div>FIN</div><div>OUT</div></div>';

    sorted.forEach(function (p, i) {
      var dk = (p.sal && typeof p.sal === 'object') ? p.sal.dk : (p.sal || 0);
      var out = p.bust === true;
      var rs = out ? 'opacity:.4;text-decoration:line-through;' : '';
      var lean = (typeof p.finishLean === 'number') ? leanToWord(p.finishLean) : 'med';
      h += '<div style="display:grid;grid-template-columns:' + COLS + ';gap:9px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);' + rs + '">';
      h += '<div style="font-size:13px;">' + p.name + '<div style="font-size:10px;color:var(--muted);">' + (p.opp || '—') + (p.winProb ? ' · ' + Math.round(p.winProb * 100) + '% win' : '') + '</div></div>';
      h += '<div style="font-family:var(--fm);font-size:12px;">$' + dk.toLocaleString() + '</div>';
      h += '<input type="number" id="edit_ml_' + i + '" value="' + (p.ml != null ? p.ml : '') + '" placeholder="ML" step="5" style="width:60px;background:var(--dark3);border:1px solid var(--border2);border-radius:4px;padding:5px 6px;color:var(--parch);font-size:12px;"/>';
      h += '<input type="number" id="edit_proj_' + i + '" value="' + (p.proj || 0) + '" step="0.5" style="width:54px;background:var(--dark3);border:1px solid var(--border2);border-radius:4px;padding:5px 6px;color:var(--parch);font-size:12px;"/>';
      h += '<input type="number" id="edit_own_' + i + '" value="' + (p.own || 0) + '" min="0" max="100" style="width:56px;background:var(--dark3);border:1px solid var(--border2);border-radius:4px;padding:5px 6px;color:var(--gold);font-size:12px;font-weight:700;"/>';
      h += '<input type="checkbox" id="edit_main_' + i + '" ' + (p.isMainEvent || p.fightFormat === 5 ? 'checked' : '') + ' style="width:18px;height:18px;cursor:pointer;"/>';
      h += '<select id="edit_tag_' + i + '" style="background:var(--dark3);border:1px solid var(--border2);border-radius:4px;padding:5px 6px;color:var(--parch);font-size:11px;">' +
        ['', 'chalk', 'anchor', 'value', 'leverage', 'contrarian', 'trap'].map(function (t) {
          return '<option value="' + t + '" ' + (p.tag === t ? 'selected' : '') + '>' + (t || '—') + '</option>';
        }).join('') + '</select>';
      h += '<select id="edit_fin_' + i + '" title="Finish lean — drives leverage" style="background:var(--dark3);border:1px solid var(--border2);border-radius:4px;padding:5px 6px;color:var(--parch);font-size:11px;">' +
        [['low', 'Low'], ['med', 'Med'], ['high', 'High']].map(function (o) {
          return '<option value="' + o[0] + '" ' + (lean === o[0] ? 'selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select>';
      h += '<input type="checkbox" id="edit_out_' + i + '" ' + (out ? 'checked' : '') + ' style="width:18px;height:18px;cursor:pointer;" title="Mark OUT (injured/withdrawn)"/>';
      h += '</div>';
    });

    h += '<div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">';
    h += '<div style="font-size:11px;color:var(--muted2);">ML powers de-vigged win probability. FIN (finish lean) is what separates leverage plays from chalk. Saving recomputes ownership, tags, and the leverage board.</div>';
    h += '<button class="btn btn-gold btn-sm" onclick="saveSlateOverrides()" style="font-weight:700;">💾 Save All Changes</button></div></div>';
    table.innerHTML = h;
  };

  /* ---- 4) saveSlateOverrides: read ML/FIN, recompute, persist ------------ */
  window.saveSlateOverrides = async function () {
    var slate = window._currentEditingSlate;
    if (!slate || !slate.id) { alert('No slate loaded.'); return; }
    var order = window._editPlayerOrder || [];
    var updated = slate.players.slice();

    order.forEach(function (origIdx, i) {
      if (origIdx < 0 || origIdx >= updated.length) return;
      var p = Object.assign({}, updated[origIdx]);
      var g = function (id) { return document.getElementById(id + i); };
      var projEl = g('edit_proj_'), ownEl = g('edit_own_'), mainEl = g('edit_main_'),
          tagEl = g('edit_tag_'), outEl = g('edit_out_'), mlEl = g('edit_ml_'), finEl = g('edit_fin_');

      if (projEl) p.proj = parseFloat(projEl.value) || 0;
      if (mlEl)   p.ml = (mlEl.value === '' ? null : parseFloat(mlEl.value));
      if (finEl)  p.finishLean = wordToLean(finEl.value);
      if (ownEl)  { p.own = parseInt(ownEl.value) || 0; p.ownEst = false; p.ownConfirmed = true; }
      if (mainEl) {
        p.isMainEvent = mainEl.checked;
        p.fightFormat = mainEl.checked ? 5 : 3;
        p.ceil = Math.round(p.proj * (mainEl.checked ? 1.65 : 1.40) * 10) / 10;
        p.floor = Math.round(p.proj * (mainEl.checked ? 0.75 : 0.65) * 10) / 10;
      }
      if (tagEl) p.tag = tagEl.value;
      if (outEl) p.bust = outEl.checked;
      p.fppf = p.proj;
      updated[origIdx] = p;
    });

    // recompute the whole slate so own (where not confirmed), tags, leverage, signal are consistent
    try { window.OWLeverage.computeSlate(updated, { book: 'dk', sport: (slate.sport || 'ufc') }); } catch (e) { console.warn('[OWLeverage] save compute failed', e); }

    try {
      var res = await window._sbFetch('/rest/v1/dfs_slates?id=eq.' + slate.id, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ players: updated, updated_at: new Date().toISOString() })
      });
      if (res.ok || res.status === 204) {
        alert('✓ Saved! ' + updated.length + ' fighters recomputed.\n\nRefresh the DFS page to see the optimizer + leverage board update.');
        window._currentEditingSlate.players = updated;
        if (typeof window.loadDfsSlates === 'function') window.loadDfsSlates();
      } else {
        alert('Save failed (HTTP ' + res.status + ').');
      }
    } catch (e) { alert('Save error: ' + e.message); }
  };

  console.log('[OWLeverage] patch active — DFS ownership/tags/leverage now engine-computed.');
})();
