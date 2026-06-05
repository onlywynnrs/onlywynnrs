/* ============================================================================
 * OnlyWynnrs — OWLeverage (slate computation layer)
 * ----------------------------------------------------------------------------
 * Drop-in that fixes "tags / ownership / FPP / chalk / leverage not auto-
 * populating." Computes proper win prob (de-vigged moneyline), value, a
 * field-vs-merit ownership model, leverage, a play tag (in YOUR vocabulary),
 * and a one-line signal — for an ENTIRE slate at once (ownership needs the
 * whole field to normalize to 600%).
 *
 * It MUTATES each player object IN PLACE, writing the same field names your
 * app already reads (own, tag, ceil/ceil_pts, floor/floor_pts, fppf,
 * leverageScore, corr) PLUS new ones (winProb, fieldOwn, meritOwn, leverage,
 * tier). Your refreshLeverage()/getPlayerIntelScore()/optimizer keep working —
 * they just get good numbers now.
 *
 * INPUTS PER PLAYER (already in your players jsonb after the small edits):
 *   sal {dk,fd} | proj | ml (moneyline) | finishLean (0..1, optional)
 * Everything else is derived. No Supabase schema change required.
 * ==========================================================================*/
(function (root) {
  "use strict";

  var W = {
    // FIELD = how the public actually drafts: chases favorites (win) and
    // big-salary studs/names (sal), NOT value (value-hunting is the sharp edge).
    field: { win: 1.30, sal: 0.95, proj: 0.55, value: 0.20 },
    // MERIT = what SHOULD be owned: value efficiency + finish ceiling.
    merit: { value: 1.15, win: 0.55, finish: 1.30 },
    slope: 9.5, ownFloor: 3, ownCap: 50
  };

  function impliedProb(ml){ ml = Number(ml); return ml < 0 ? (-ml)/(-ml+100) : 100/(ml+100); }
  function devigPair(a,b){ var ia=impliedProb(a), ib=impliedProb(b), s=ia+ib; return [ia/s, ib/s]; }
  function clamp(x,lo,hi){ return Math.max(lo, Math.min(hi, x)); }
  function mean(a){ return a.reduce(function(x,y){return x+y;},0)/(a.length||1); }
  function std(a){ var m=mean(a); return Math.sqrt(mean(a.map(function(x){return (x-m)*(x-m);})))||1; }
  function z(a){ var m=mean(a), s=std(a); return a.map(function(x){return (x-m)/s;}); }
  function pctl(sorted,p){ var i=(sorted.length-1)*p, lo=Math.floor(i), hi=Math.ceil(i); return sorted[lo]+(sorted[hi]-sorted[lo])*(i-lo); }
  function ownModel(scores,total,slope,floor,cap){
    var zz=z(scores), m=total/(scores.length||1);
    var own=zz.map(function(v){ return clamp(m+slope*v, floor, cap); });
    var s=own.reduce(function(a,b){return a+b;},0)||1;
    return own.map(function(v){ return v*total/s; });
  }
  // win prob fallback from favTier when no moneyline present
  function favTierWin(t){ return ({heavy:.80,moderate:.66,pickem:.5,dog:.34,heavydog:.22})[t] || 0.5; }
  function salOf(p, book){
    if (p.sal && typeof p.sal === 'object') return p.sal[book] || p.sal.dk || 0;
    return Number(p.salary || p.sal || 0);
  }
  function rosterSpots(sport){ return ({ufc:6, nba:8, nfl:9, mlb:10})[sport] || 6; }

  // map engine tier -> YOUR existing tag vocabulary so current UI/badges work
  function tagFor(tier, flags){
    if (tier === 'CORE') return flags.indexOf('FADE') >= 0 ? 'chalk' : 'anchor';
    if (tier === 'LEVERAGE') return 'leverage';
    if (tier === 'VALUE') return 'value';
    if (tier === 'PUNT') return 'contrarian';
    if (tier === 'FADE') return 'trap';
    return 'value';
  }

  function signalText(p){
    var odds = (p.ml > 0 ? '+' : '') + (p.ml != null ? p.ml : '?');
    var wp = Math.round((p.winProb||0)*100);
    var own = p.fieldOwn.toFixed(0)+'% field / '+p.meritOwn.toFixed(0)+'% merit';
    switch (p.tier){
      case 'CORE': return (p.leverage>=2?'Anchor+leverage':'Anchor')+'. '+odds+' ('+wp+'%), '+p.value.toFixed(1)+'x. '+own+'.';
      case 'LEVERAGE': return 'Leverage. Underowned vs equity ('+own+') at '+odds+'.';
      case 'VALUE': return 'Value. '+p.value.toFixed(1)+'x frees cap. '+own+'.';
      case 'PUNT': return 'Cheap dart. '+odds+' ('+wp+'%) naked-ceiling GPP play. '+own+'.';
      case 'FADE': return 'Chalk fade. Field over-rosters ('+own+'); thin edge. Pivot off.';
      default: return odds+' ('+wp+'%). '+own+'.';
    }
  }

  /* MAIN: compute the whole slate, mutate players in place ----------------- */
  function computeSlate(players, opts){
    opts = opts || {};
    if (!Array.isArray(players) || !players.length) return players;
    var book = opts.book || 'dk';
    var sport = opts.sport || 'ufc';
    var total = rosterSpots(sport) * 100;

    // 1) win prob: de-vig within each bout (group by game/matchup), else fallback
    var groups = {};
    players.forEach(function(p){
      var k = p.game || p.matchup || ('_'+p.name);
      (groups[k] = groups[k] || []).push(p);
    });
    Object.keys(groups).forEach(function(k){
      var g = groups[k];
      if (g.length === 2 && g[0].ml != null && g[1].ml != null){
        var pr = devigPair(g[0].ml, g[1].ml);
        g[0].winProb = pr[0]; g[1].winProb = pr[1];
      } else {
        g.forEach(function(p){ p.winProb = (p.ml != null) ? impliedProb(p.ml) : favTierWin(p.favTier); });
      }
    });

    // 2) per-player primitives
    // Cap projection outliers: a fighter only scores big if they WIN, so blend
    // the raw (often small-sample) projection toward a win-probability-supported
    // expectation. Prevents a single past blowout from faking elite value/leverage.
    var projs = players.map(function(p){ return Number((p._rawProj != null ? p._rawProj : (p.proj || p.fppf)) || 0); });
    var projMean = projs.reduce(function(a,b){return a+b;},0) / (projs.length||1);
    players.forEach(function(p){
      var sal = salOf(p, book);
      // remember the original projection once, so repeated computeSlate calls
      // don't re-cap an already-capped value (which would drift downward).
      if (p._rawProj == null) p._rawProj = Number(p.proj || p.fppf || 0);
      var rawProj = p._rawProj;
      var wp = p.winProb || 0.5;
      // expected pts if we trust win prob: scale around slate mean by how likely they are to win
      var wpExpected = projMean * (0.45 + 0.9 * wp);
      // blend 60% raw / 40% win-supported, then clamp extreme highs toward the blend
      var proj = 0.6 * rawProj + 0.4 * wpExpected;
      // Hard cap: no single fighter realistically projects above ~1.6x the slate
      // mean. CSV small-sample blowouts (e.g. 124/118 raw) get reined in here so
      // the DISPLAYED projection and the value calc both stay believable.
      var projCap = projMean * 1.6;
      if (proj > projCap) proj = projCap;
      p.proj = Math.round(proj * 10) / 10;        // overwrite displayed projection with the capped value
      p.fppf = p.proj;
      p.value = sal ? proj / (sal/1000) : 0;
      // finishLean may arrive as a word ('Low'/'Med'/'High') from the slate/CSV;
      // coerce to a number or fall back to a win-prob proxy. A string here was
      // producing NaN finishEquity for the whole slate.
      if (typeof p.finishLean === 'string') {
        var _fl = ({ low: 0.35, med: 0.55, high: 0.75 })[p.finishLean.toLowerCase()];
        p.finishLean = (_fl != null) ? _fl : null;
      }
      if (p.finishLean == null) p.finishLean = clamp(0.35 + 0.45*(p.winProb||0.5), 0.3, 0.85); // proxy until set in editor
      p.finishEquity = (p.itdProb != null) ? p.itdProb : p.finishLean * (p.winProb || 0.5);
      p._sal = sal; p._proj = proj;
    });

    // 3) z-scores
    var zVal = z(players.map(function(p){return p.value;}));
    var zWin = z(players.map(function(p){return p.winProb||0.5;}));
    var zChp = z(players.map(function(p){return -(p._sal||0);}));
    var zFin = z(players.map(function(p){return p.finishEquity||0;}));
    var zSal = z(players.map(function(p){return (p._sal||0);}));      // high salary = stud/name the public chases
    var zPrj = z(players.map(function(p){return (p._proj||0);}));     // big projection = public chases points

    // 4) field vs merit ownership -> 600%
    // FIELD: public chases favorites + studs (NOT value). MERIT: value + finish ceiling.
    var fieldScore = players.map(function(_,i){ return W.field.win*zWin[i] + W.field.sal*zSal[i] + W.field.proj*zPrj[i] + W.field.value*zVal[i]; });
    var meritScore = players.map(function(_,i){ return W.merit.value*zVal[i] + W.merit.win*zWin[i] + W.merit.finish*zFin[i]; });
    var fieldOwn = ownModel(fieldScore, total, W.slope, W.ownFloor, W.ownCap);
    var meritOwn = ownModel(meritScore, total, W.slope, W.ownFloor, W.ownCap);

    players.forEach(function(p,i){
      p.fieldOwn = Math.round(fieldOwn[i]*10)/10;
      p.meritOwn = Math.round(meritOwn[i]*10)/10;
      p.leverage = Math.round((p.meritOwn - p.fieldOwn)*10)/10;
    });

    // 5) tiers + your-vocabulary tag + signal + your existing fields
    var valSorted = players.map(function(p){return p.value;}).sort(function(a,b){return a-b;});
    var ownSorted = players.map(function(p){return p.fieldOwn;}).sort(function(a,b){return a-b;});
    var valMed = pctl(valSorted,0.5), valP75 = pctl(valSorted,0.75), valP35 = pctl(valSorted,0.35), ownP75 = pctl(ownSorted,0.75);

    players.forEach(function(p){
      var tier='NEUTRAL', flags=[];
      if (p.winProb>=0.62 && p.value>=valMed) tier='CORE';
      else if (p.leverage>=2.0 && p.value>=valP35) tier='LEVERAGE';
      else if (p.value>=valP75 && p._sal<=8000) tier='VALUE';
      else if (p.winProb<0.35 && p.finishLean>=0.55 && p._sal<=7400) tier='PUNT';
      else if (p.fieldOwn>=ownP75 && p.leverage<=-2.0) tier='FADE';
      if (tier!=='FADE' && p.fieldOwn>=ownP75 && p.leverage<=-2.0) flags.push('FADE');
      p.tier = tier;

      // write YOUR fields so existing UI + optimizer + intel engine consume good data
      // respect ownership the owner confirmed in the Intel Override Editor; otherwise fill it
      p.own = (p.ownConfirmed === true && typeof p.own === 'number') ? p.own : Math.round(p.fieldOwn);
      p.ownEst = (p.ownConfirmed === true) ? false : true;   // stays "EST" until override editor confirms
      p.tag = tagFor(tier, flags);
      p.leverageScore = Math.round(p.value/Math.max(p.fieldOwn,1)*10)/10;
      var ceilMult = (p.fightFormat===5) ? 1.65 : 1.40;
      var floorMult = (p.fightFormat===5) ? 0.75 : 0.65;
      // Always recompute ceil/floor from the (capped) projection. Previously this
      // only ran when ceil was missing, so stale inflated ceil values from the
      // slate data (e.g. 193/183) survived and showed in the breakdown while the
      // pool rows showed the capped number — an inconsistency. Now they agree.
      p.ceil = Math.round(p._proj*ceilMult*10)/10;
      p.ceil_pts = p.ceil;
      p.floor = Math.round(p._proj*floorMult*10)/10;
      p.floor_pts = p.floor;
      if (!p.fppf || opts.recomputeFppf) p.fppf = p._sal ? Math.round(p.value*100)/100 : (p.fppf||0);
      p.signal = signalText(p);
      p.corr = p.signal;   // shows in the optimizer player-detail "🔗" note

      delete p._sal; delete p._proj;
    });

    return players;
  }

  root.OWLeverage = { computeSlate: computeSlate, impliedProb: impliedProb, devigPair: devigPair };
})(typeof window !== 'undefined' ? window : this);

if (typeof module !== 'undefined') module.exports = (typeof window!=='undefined'?window:this).OWLeverage;
