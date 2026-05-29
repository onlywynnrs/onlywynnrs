// ============================================================================
// OnlyWynnrs — track-lines  (Supabase Edge Function, Deno)
// Server-side line-movement tracker. Cron-driven.
//  1. Pulls current MMA moneylines from The Odds API (key stays server-side).
//  2. Snapshots them into line_snapshots (accumulates opening -> current).
//  3. For the active UFC dfs_slates row, writes each fighter's current `ml`
//     and a normalized `lineMove` into players, then PATCHes the row.
// Matching is token-based (any shared name part), so it survives name-order
// differences like "Zhang Mingyang" vs "Mingyang Zhang".
// ============================================================================
const ODDS_KEY = Deno.env.get("ODDS_API_KEY")!;
const SB_URL    = Deno.env.get("SUPABASE_URL")!;
const SERVICE   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ODDS_URL  = `https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds/?regions=us&markets=h2h&oddsFormat=american&apiKey=${ODDS_KEY}`;

const sb = (path: string, init: RequestInit = {}) =>
  fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });

const STOP = new Set(["jr","sr","de","da","do","dos","das","del","la","le","van","von","el","al"]);
const tokens = (n: string) =>
  (n || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s'-]/g, "").split(/\s+/).filter(t => t.length > 1 && !STOP.has(t));

const impliedProb = (ml: number) => (ml < 0 ? -ml / (-ml + 100) : 100 / (ml + 100));

Deno.serve(async () => {
  try {
    const oddsRes = await fetch(ODDS_URL);
    if (!oddsRes.ok) return json({ ok: false, step: "odds", status: oddsRes.status }, 200);
    const events = await oddsRes.json();

    // collect current ml as a list of {tokens, ml} from first book's h2h per event
    const odds: { toks: string[]; ml: number; name: string }[] = [];
    for (const ev of events) {
      const bk = (ev.bookmakers || [])[0];
      const mkt = bk && (bk.markets || []).find((m: any) => m.key === "h2h");
      if (!mkt) continue;
      for (const o of mkt.outcomes || []) odds.push({ toks: tokens(o.name), ml: o.price, name: o.name });
    }

    // snapshot under a normalized key (sorted name tokens) so the same fighter
    // always maps to ONE history even if the API varies the name format.
    const normKey = (name: string) => tokens(name).sort().join("-");
    const snapRows = odds.map(o => ({ sport: "ufc", fighter: normKey(o.name), ml: o.ml }));
    if (snapRows.length) await sb("line_snapshots", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(snapRows) });

    // opening = earliest snapshot per normalized key
    const snapRes = await sb("line_snapshots?select=fighter,ml,captured_at&sport=eq.ufc&order=captured_at.asc&limit=8000");
    const snaps = snapRes.ok ? await snapRes.json() : [];
    const openingByKey: Record<string, number> = {};
    for (const s of snaps) if (openingByKey[s.fighter] == null) openingByKey[s.fighter] = s.ml;

    const slRes = await sb("dfs_slates?select=id,players&sport=eq.ufc&platform=eq.dk&order=slate_date.desc&limit=1");
    const slates = slRes.ok ? await slRes.json() : [];
    if (!slates.length) return json({ ok: true, note: "no ufc slate", tracked: odds.length }, 200);
    const slate = slates[0];

    // token-overlap match: a slate fighter matches an odds entry if they share
    // at least one name token (handles reversed name order & middle names).
    const matchOdds = (name: string) => {
      const t = tokens(name);
      let best: { ml: number; key: string } | null = null, bestScore = 0;
      for (const o of odds) {
        const shared = o.toks.filter(x => t.includes(x)).length;
        if (shared > bestScore) { bestScore = shared; best = { ml: o.ml, key: o.toks.slice().sort().join("-") }; }
      }
      return bestScore > 0 ? best : null;
    };

    let updated = 0; const misses: string[] = [];
    const players = (slate.players || []).map((p: any) => {
      const m = matchOdds(p.name);
      if (!m) { misses.push(p.name); return p; }
      updated++;
      const open = openingByKey[m.key] ?? m.ml;
      const move = Math.round((impliedProb(m.ml) - impliedProb(open)) * 100 * 10) / 10;
      return { ...p, ml: m.ml, lineMove: move };
    });

    await sb(`dfs_slates?id=eq.${slate.id}`, {
      method: "PATCH", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ players, updated_at: new Date().toISOString() }),
    });

    return json({ ok: true, tracked: odds.length, slate_players_updated: updated, unmatched: misses }, 200);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 200);
  }
});

function json(o: unknown, status: number) {
  return new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
}
