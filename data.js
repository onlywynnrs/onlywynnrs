const _SURL='https://nkqnzyipztancnskshsw.supabase.co';
const _SKEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW56eWlwenRhbmNuc2tzaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTcxNjAsImV4cCI6MjA5Mjc5MzE2MH0.CyiRaPPPhDwnCzIqxHF0ZpgGmTsh53TUMOvre93wLpo';

const STRIPE_PK = 'pk_test_51TOSmaRpuoMp8x76YvBeVKF3v4Fx9YOXwv75AvewAzdnc7HwJ3HRIGeOqksfjWQjRBY8Q1tcwz06HjPshV76wVny00cGKdC8ol';
const STRIPE_PRICES = {
  optimizer: 'price_1TTPDKRpuoMp8x76CCxiLvGe',
  wynnr:     'price_1TTPE4RpuoMp8x76pTFVPfK2',
  elite:     'price_1TTPEORpuoMp8x76Fy9tJVqN',
};

const PICKS = [
  // UFC VEGAS 117 — May 16, 2026 — Meta Apex, Las Vegas
  {sport:'ufc',matchup:'Allen vs Costa',call:'Costa ML',
   why:'Costa +140 on a 6-fight win streak with 4 finishes. Allen is 1-3 in his last 4. Sharp money has been moving toward Costa all week — line opened Allen -165, now closer to -130. The market is telling you something. Costa\'s power and pressure will be too much for a fading Allen.',
   odds:'+140',time:'Sat 5/17 8:00 PM ET',rating:'HIGH',units:'1 unit'},

  {sport:'ufc',matchup:'Choi vs Santos',call:'Santos ML',
   why:'Santos on a 4-fight win streak, finished Joo-sang Yoo by KO at UFC 320. Choi hasn\'t fought since December 2024 — 18 months of ring rust. 52% of public bets on Choi but sharp money drifting to Santos. Rust + opponent on a roll = value.',
   odds:'+120',time:'Sat 5/17 8:00 PM ET',rating:'HIGH',units:'1 unit'},

  {sport:'ufc',matchup:'Bukauskas vs Edwards',call:'Bukauskas ML',
   why:'Free square situation. Bukauskas was -130 vs Bellato. Opponent changed to debutant Christian Edwards ($6,900 DK). Bukauskas now -325. Price barely moved at most books. This is mispriced — use as a parlay leg.',
   odds:'-325',time:'Sat 5/17 8:00 PM ET',rating:'STD',units:'0.5 units'},

  {sport:'ufc',matchup:'Wellmaker vs Diaz',call:'Wellmaker ML',
   why:'Back-to-back 1R KO wins before his first career loss. Diaz is making his UFC debut. Experience gap is significant. Wellmaker hungry to prove the Ewing loss was a blip.',
   odds:'-150',time:'Sat 5/17 8:00 PM ET',rating:'STD',units:'1 unit'},

  {sport:'ufc',matchup:'Vieira vs Cavalcanti',call:'Vieira ML',
   why:'Sharp fade on the chalk. Cavalcanti is -175 but 5-0 in UFC against limited competition. Vieira is a proven top-10 fighter. Value at +145. Sharp money has been taking Vieira all week — 74% of dollars on her.',
   odds:'+145',time:'Sat 5/17 5:00 PM ET',rating:'FREE',units:'1 unit'},

  {sport:'ufc',matchup:'Ardelean vs Viana',call:'Ardelean ML',
   why:'Ardelean -200 is justified. 7.35 sig strikes per minute vs Viana\'s 2.74. Viana\'s takedown defense is 35% — Ardelean can keep it standing. Steam confirmed. Safe chalk.',
   odds:'-200',time:'Sat 5/17 5:00 PM ET',rating:'STD',units:'1 unit'},

  {sport:'ufc',matchup:'Gurule vs Barez',call:'Gurule ML',
   why:'Gurule -110 vs a 37-year-old Barez who lost to Andre Lima over a year ago. Activity edge clear at 4.47 vs 3.65 sig strikes per minute. Line moved 22 cents toward Gurule on sharp action. Value at near pick-em.',
   odds:'-110',time:'Sat 5/17 5:00 PM ET',rating:'HIGH',units:'1 unit'},

  {sport:'ufc',matchup:'Minev vs Gantt',call:'Minev ML',
   why:'Minev is 7-0 with 6 stoppages — 4 of those knockouts inside round 1. He is a late replacement but his finishing rate at -198 represents real value. Sharp money and steam both confirmed on Minev.',
   odds:'-198',time:'Sat 5/17 5:00 PM ET',rating:'STD',units:'0.75 units'},

  // NBA PLAYOFFS
  {sport:'nba',matchup:'SA Spurs vs OKC Thunder',call:'Thunder ML',
   why:'Steam confirmed across 3 books overnight. Line moved from -265 to -280. OKC closing out at home in WCF. SGA still averaging 34+ ppg. 62% of sharp dollars on Thunder.',
   odds:'-275',time:'Mon 5/19',rating:'STD',units:'0.5 units'},

  {sport:'nba',matchup:'Cleveland Cavaliers vs Detroit Pistons',call:'Cavaliers ML',
   why:'Steam confirmed — 3 books moved simultaneously on Cavs. 61% of sharp dollars on Cleveland despite Pistons getting public action. Detroit missing rotation pieces.',
   odds:'-190',time:'Mon 5/18',rating:'STD',units:'0.5 units'},

  // MLB
  {sport:'mlb',matchup:'SF Giants vs Athletics',call:'Giants ML',
   why:'Line moved from -130 to -142 on reverse line movement. 66% of sharp dollars on San Francisco despite only 38% of public bets. Athletics bullpen taxed this week.',
   odds:'-140',time:'Sun 5/17',rating:'HIGH',units:'1 unit'},
];

const FM_PICKS = [
  {sport:'ufc',matchup:'Allen vs Costa',call:'Costa ML',
   why:'Costa +140 on a 6-fight win streak. Line opened Allen -165, steam has moved it to -130. That is 35 cents of movement driven by sharp money. When a line moves a dog from +165 toward even money — you follow it.',
   odds:'+140',time:'Sat 5/17 8:00 PM ET',rating:'HIGH',units:'1 unit',ev:'+9%',winProb:'42%',lineMove:'-165 → -130'},
  {sport:'ufc',matchup:'Vieira vs Cavalcanti',call:'Vieira ML',
   why:'Proven top-10 fighter as +145 underdog vs unproven prospect. Sharp money has been taking Vieira all week — 74% of sharp dollars on her. The line is wrong.',
   odds:'+145',time:'Sat 5/17 5:00 PM ET',rating:'FREE',units:'1 unit',ev:'+11%',winProb:'41%',lineMove:'+165 → +145'},
  {sport:'ufc',matchup:'Gurule vs Barez',call:'Gurule ML',
   why:'Essentially a pick-em at -110. Younger, more active fighter vs a 37-year-old fading vet. Sharp money has moved 22 cents in Gurule\'s direction. Activity edge and age advantage at flat pricing.',
   odds:'-110',time:'Sat 5/17 5:00 PM ET',rating:'HIGH',units:'1 unit',ev:'+8%',winProb:'54%',lineMove:'-132 → -110'},
  {sport:'ufc',matchup:'Choi vs Santos',call:'Santos ML',
   why:'Santos on a roll, Choi hasn\'t fought in 18 months. Public is on Choi because of name value. Sharp money reads the ring rust. Line has drifted 27 cents toward Santos.',
   odds:'+120',time:'Sat 5/17 8:00 PM ET',rating:'HIGH',units:'1 unit',ev:'+7%',winProb:'45%',lineMove:'+145 → +120'},
  {sport:'nba',matchup:'SA Spurs vs OKC Thunder',call:'Thunder ML',
   why:'Steam confirmed across 3 books overnight. OKC closing out at home. SGA in playoff mode. 62% of sharp dollars on Thunder despite heavy chalk price.',
   odds:'-275',time:'Mon 5/19',rating:'STD',units:'0.5 units',ev:'+4%',winProb:'74%',lineMove:'-265 → -280'},
];

const BI_TIERS = [
  {badge:'FREE\nMONEY',color:'#4db874',bg:'rgba(58,148,96,.14)',border:'rgba(58,148,96,.28)',name:'Free Money',desc:'High positive EV. Line is statistically off, sharp money confirms, CLV is strong. Max bet territory.',stats:[['Win rate','58%+'],['Bet size','2-3 units'],['EV','+8% or higher']]},
  {badge:'HIGH\nVALUE',color:'#c9a84c',bg:'rgba(201,168,76,.13)',border:'rgba(201,168,76,.28)',name:'High Value',desc:'Strong positive EV with data backing. Sharp money present. Your bread and butter plays.',stats:[['Win rate','54-58%'],['Bet size','1-2 units'],['EV','+3-8%']]},
  {badge:'STANDARD\nPLAY',color:'#4a88d8',bg:'rgba(48,96,160,.13)',border:'rgba(48,96,160,.28)',name:'Standard Play',desc:'Slightly positive EV. Worth a standard unit as part of a diversified approach.',stats:[['Win rate','52-54%'],['Bet size','1 unit'],['EV','+1-3%']]},
  {badge:'PARLAY\nPIECE',color:'#e09050',bg:'rgba(192,88,32,.13)',border:'rgba(192,88,32,.28)',name:'Parlay Piece',desc:'Good angle but too much juice alone. Use as a leg in small parlays only.',stats:[['Implied','65%+'],['Bet size','0.5 units'],['Use','Parlay only']]},
  {badge:'LOTTERY\nTICKET',color:'#d94040',bg:'rgba(176,48,48,.12)',border:'rgba(176,48,48,.26)',name:'Lottery Ticket',desc:'Negative EV but meaningful upset potential. Entertainment only. Never chase.',stats:[['Win rate','18-22%'],['Bet size','0.25 units max'],['EV','Negative']]},
];

const SHARP_DATA = [
  {game:'Allen vs Costa',
   sub:'UFC Vegas 117 · Main Event · Sat 5/17 8:00 PM ET',
   pub:58, sharp:71, move:'-165 to -130 (Costa closing)',
   sig:'hot', sigText:'REVERSE LINE',
   note:'58% of public bets on Allen but sharp money has moved Costa from +165 to +140 and still closing. 35 cents of movement toward the underdog. Classic RLM — fade the favorite the public loves.'},

  {game:'Vieira vs Cavalcanti',
   sub:'UFC Vegas 117 · Prelims · Sat 5/17 5:00 PM ET',
   pub:62, sharp:74, move:'+165 to +145 (Vieira)',
   sig:'hot', sigText:'REVERSE LINE',
   note:'62% of public bets on Cavalcanti but 74% of sharp dollars on Vieira. Proven top-10 talent at +145 — sharps don\'t pass on that. Line compressed 20 cents all week on sharp action.'},

  {game:'Gurule vs Barez',
   sub:'UFC Vegas 117 · Prelims · Sat 5/17 5:00 PM ET',
   pub:45, sharp:63, move:'-132 to -110',
   sig:'hot', sigText:'SHARP ACTION',
   note:'Only 45% of public bets on Gurule but 63% of sharp dollars. Line moved 22 cents in Gurule\'s direction. Younger, more active fighter at near pick-em — the market is correctly pricing this closer.'},

  {game:'Choi vs Santos',
   sub:'UFC Vegas 117 · Co-Main · Sat 5/17 8:00 PM ET',
   pub:54, sharp:68, move:'+145 to +118',
   sig:'hot', sigText:'SHARP ACTION',
   note:'54% public on Choi (name recognition), 68% of sharp dollars on Santos. Choi hasn\'t fought in 18 months. Sharp money prices ring rust aggressively. 27 cents of movement toward Santos.'},

  {game:'Wellmaker vs Diaz',
   sub:'UFC Vegas 117 · Main Card · Sat 5/17 8:00 PM ET',
   pub:52, sharp:64, move:'-140 to -155',
   sig:'hot', sigText:'STEAM',
   note:'Steam confirmed — 3 books moved simultaneously on Wellmaker overnight. Coming off first career loss vs a UFC debutant. Sharp money pricing the Ewing loss as a blip, not a trend.'},

  {game:'Ardelean vs Viana',
   sub:'UFC Vegas 117 · Prelims · Sat 5/17 5:00 PM ET',
   pub:61, sharp:72, move:'-185 to -200',
   sig:'hot', sigText:'STEAM',
   note:'Ardelean steaming to -200. Both sharp and public aligned. 7.35 sig strikes per minute vs Viana\'s 2.74. The volume numbers don\'t lie. Two-way signal confirmed.'},

  {game:'Minev vs Gantt',
   sub:'UFC Vegas 117 · Featured Prelim · Sat 5/17 5:00 PM ET',
   pub:47, sharp:69, move:'-185 to -198',
   sig:'hot', sigText:'STEAM',
   note:'Minev is a late replacement but 7-0 with 6 stoppages. 69% of sharp dollars on Minev despite only 47% of public bets. Four R1 KOs means enormous DFS upside. Steam confirmed.'},

  {game:'SA Spurs vs OKC Thunder',
   sub:'NBA Western Conference Finals · Mon 5/19',
   pub:41, sharp:62, move:'-265 to -280',
   sig:'hot', sigText:'STEAM',
   note:'Steam confirmed across 3 books overnight. OKC line moved 20 cents on pure sharp action. 41% of public bets on Spurs but 62% of sharp dollars on Thunder. SGA closing out at home.'},

  {game:'Cleveland Cavaliers vs Detroit Pistons',
   sub:'NBA Eastern Conference Finals · Mon 5/18',
   pub:44, sharp:61, move:'-187 to -195',
   sig:'hot', sigText:'STEAM',
   note:'3-book simultaneous move on Cavaliers. 61% of sharp dollars on Cleveland. Detroit missing rotation pieces — sharp money pricing it in accurately.'},

  {game:'SF Giants vs Athletics',
   sub:'MLB · Sun 5/17',
   pub:38, sharp:66, move:'-130 to -142',
   sig:'hot', sigText:'REVERSE LINE',
   note:'Only 38% of public bets on Giants but 66% of sharp dollars. Textbook reverse line movement. A\'s bullpen taxed this week. Sharp money taking San Francisco on a depleted pen.'},

  {game:'Toronto Blue Jays vs Detroit Tigers',
   sub:'MLB · Sat 5/16',
   pub:42, sharp:61, move:'-112 to -129',
   sig:'hot', sigText:'STEAM',
   note:'27-cent steam across 3 books on Blue Jays. 61% of sharp dollars on Toronto despite split public. Detroit struggling and rotation matchup favors Toronto heavily.'},
];

const LV_DATA = [
  {game:'Costa ML', sub:'FD: +148 vs DK: +140 — take FD now',
   move:'+8c', dir:'up', note:'FanDuel 8 cents better on Costa. Line moving fast — grab FD before they catch up to DK.'},
  {game:'Vieira ML', sub:'Caesars: +155 vs DK: +145 — Caesars best',
   move:'+10c', dir:'up', note:'Ten cents of free money on Vieira. Caesars lagging on the sharp movement. Act now.'},
  {game:'Santos ML', sub:'FD: +125 vs DK: +118 — FD better',
   move:'+7c', dir:'up', note:'FanDuel pricing Santos 7 cents better. Worth the 30 seconds to check.'},
  {game:'Gurule ML', sub:'Caesars: -105 vs DK: -110 — Caesars best',
   move:'+5c', dir:'up', note:'Near pick-em — 5 cents matters a lot at this price range.'},
  {game:'Thunder (NBA WCF)', sub:'Two books still -9 — get the half-point',
   move:'+0.5pt', dir:'up', note:'Half-point in a WCF game is worth 1.5% ROI. Check all books before betting.'},
];

const TODAY = new Date();
const todayDay = TODAY.getDay(); // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat

const BOOKS = {
  dk: { name:'DraftKings', cap:50000, sizes:{ufc:6,nba:8,nfl:9,mlb:10,nba_showdown:6}, minSal:4000 },
  fd: { name:'FanDuel',    cap:60000, sizes:{ufc:5,nba:7,nfl:9,mlb:9,nba_showdown:5},  minSal:4800 },
};

const SLATE_SCHEDULE = {
  ufc:[
    {id:'ufc_vegas117', label:'UFC Vegas 117 — May 16', name:'UFC Vegas 117 — May 16', date:'Sat 5/16 5:00 PM ET', book:'dk',
     fights:['Barez vs Gurule','Bannon vs Caliari','Viana vs Ardelean','Brundage vs Petroski',
              'Gantt vs Minev','Erslan vs Tokkos','Vieira vs Cavalcanti',
              'Williams vs Veretennikov','Cuamba vs Sopaj',
              'Bukauskas vs Edwards','Diaz vs Wellmaker','Choi vs Santos','Allen vs Costa']}
  ],
  nba:[{id:'nba_playoffs_26', label:'NBA Playoffs 2026', name:'NBA Playoffs 2026', date:'Various', book:'dk', fights:[]}],
  mlb:[{id:'mlb_today', label:'MLB Today', name:'MLB Today', date:'Tonight', book:'dk', fights:[]}],
};

const POOLS = {
  ufc:[
    // UFC Vegas 117 — May 16, 2026 — DK $50K cap, pick 6
    // REAL DK salaries confirmed from DraftKings lobby screenshots
    // FPPF/W-L confirmed from DK player pool
    // Bellato and Ogden WITHDRAWN — removed from pool
    {name:'M. Wellmaker',    pos:'F',sal:{dk:9200,fd:11000},opp:'vs Diaz',          own:44,ceil:116,floor:62,fppf:82.2, record:'10-1',  bust:false,tag:'anchor',    game:'Diaz vs Wellmaker',      corr:'82.2 FPPF. Top salary anchor. Back-to-back 1R KOs. Debutant opponent. Strong anchor with KO ceiling.'},
    {name:'T. Gantt',        pos:'F',sal:{dk:9100,fd:10900},opp:'vs Minev',         own:18,ceil:90, floor:40,fppf:0,    record:'11-0-1',bust:false,tag:'leverage',  game:'Gantt vs Minev',         corr:'UFC debut. 11-0-1 late replacement. Upset value at high salary if he survives Minev\'s early pressure.'},
    {name:'N. Caliari',      pos:'F',sal:{dk:9000,fd:10800},opp:'vs Bannon',        own:48,ceil:106,floor:62,fppf:36.1, record:'8-4',   bust:false,tag:'chalk',     game:'Bannon vs Caliari',      corr:'36.1 FPPF (limited UFC sample). -205 favorite. High ownership. Cash game staple.'},
    {name:'A. Petroski',     pos:'F',sal:{dk:8900,fd:10700},opp:'vs Brundage',      own:26,ceil:98, floor:50,fppf:62.2, record:'13-5',  bust:false,tag:'anchor',    game:'Brundage vs Petroski',   corr:'62.2 FPPF. Petroski has real finishing ability. Solid anchor at this salary.'},
    {name:'I. Erslan',       pos:'F',sal:{dk:8800,fd:10600},opp:'vs Tokkos',        own:22,ceil:96, floor:46,fppf:22.3, record:'14-6',  bust:false,tag:'value',     game:'Erslan vs Tokkos',       corr:'22.3 FPPF (limited UFC sample). 0-3 UFC but desperate must-win energy. Value at this salary.'},
    {name:'A. Ardelean',     pos:'F',sal:{dk:8700,fd:10400},opp:'vs Viana',         own:54,ceil:112,floor:66,fppf:71.2, record:'11-7',  bust:false,tag:'chalk',     game:'Viana vs Ardelean',      corr:'71.2 FPPF. -200 favorite. 7.35 sig strikes/min vs Viana\'s 2.74. Steam confirmed. Heavy but justified chalk.'},
    {name:'A. Allen',        pos:'F',sal:{dk:8600,fd:10300},opp:'vs Costa',         own:42,ceil:108,floor:60,fppf:62.3, record:'20-4',  bust:false,tag:'chalk',     game:'Allen vs Costa',         corr:'62.3 FPPF. Main event 5-rounder. 1-3 in last 4 fights. High ownership but questionable recent form.'},
    {name:'J. Cavalcanti',   pos:'F',sal:{dk:8500,fd:10200},opp:'vs Vieira',        own:46,ceil:112,floor:64,fppf:67.4, record:'10-1',  bust:false,tag:'chalk',     game:'Vieira vs Cavalcanti',   corr:'67.4 FPPF. 5-0 UFC. -175 favorite. 10-1 overall. Never faced Vieira\'s level. Chalk with upset bust risk.'},
    {name:'B. Sopaj',        pos:'F',sal:{dk:8400,fd:10100},opp:'vs Cuamba',        own:30,ceil:98, floor:48,fppf:70.3, record:'12-3',  bust:false,tag:'anchor',    game:'Cuamba vs Sopaj',        corr:'70.3 FPPF. 12-3 record. Solid value anchor at this price.'},
    {name:'D. Santos',       pos:'F',sal:{dk:8400,fd:10100},opp:'vs Choi',          own:24,ceil:112,floor:50,fppf:91.6, record:'14-2',  bust:false,tag:'leverage',  game:'Choi vs Santos',         corr:'91.6 FPPF at only 24% own. 4-fight win streak with KO finishes. Sharp money on him vs rusty Choi. Elite leverage.'},
    {name:'M. Bukauskas',    pos:'F',sal:{dk:8300,fd:9900}, opp:'vs Edwards',       own:62,ceil:124,floor:72,fppf:50.7, record:'19-7',  bust:false,tag:'chalk',     game:'Bukauskas vs Edwards',   corr:'FREE SQUARE — priced vs Bellato (-130), now -325 vs UFC debutant Edwards at same $8,300. Justified chalk. Lock in cash.'},
    {name:'K. Williams',     pos:'F',sal:{dk:8300,fd:9900}, opp:'vs Veretennikov',  own:32,ceil:102,floor:54,fppf:71.4, record:'15-5',  bust:false,tag:'anchor',    game:'Williams vs Veretennikov',corr:'71.4 FPPF. Khaos Williams — pure KO power. If he lands clean, instant 100+ pts. RLM signal confirmed.'},
    {name:'D. Barez',        pos:'F',sal:{dk:8200,fd:9800}, opp:'vs Gurule',        own:26,ceil:88, floor:44,fppf:35.8, record:'17-7',  bust:false,tag:'value',     game:'Barez vs Gurule',        corr:'35.8 FPPF. 37-year-old vet. Even matchup — value if he grinds it out.'},
    {name:'L. Gurule',       pos:'F',sal:{dk:8000,fd:9600}, opp:'vs Barez',         own:22,ceil:90, floor:46,fppf:24.7, record:'10-3',  bust:false,tag:'value',     game:'Barez vs Gurule',        corr:'24.7 FPPF. Sharp money moved 22 cents toward Gurule. Active fighter vs aging vet. Near pick-em value.'},
    {name:'N. Veretennikov', pos:'F',sal:{dk:7900,fd:9500}, opp:'vs Williams',      own:14,ceil:88, floor:42,fppf:42.6, record:'14-7',  bust:false,tag:'leverage',  game:'Williams vs Veretennikov',corr:'42.6 FPPF at 14% own. Underdog vs Williams chalk. Kazakhstan striker with real KO power.'},
    {name:'D. Choi',         pos:'F',sal:{dk:7800,fd:9400}, opp:'vs Santos',        own:38,ceil:104,floor:58,fppf:74.8, record:'16-4',  bust:false,tag:'chalk',     game:'Choi vs Santos',         corr:'74.8 FPPF. Korean Superboy. 18 months ring rust. High name-recognition ownership but real bust risk.'},
    {name:'T. Cuamba',       pos:'F',sal:{dk:7800,fd:9400}, opp:'vs Sopaj',         own:18,ceil:86, floor:40,fppf:57.4, record:'10-3',  bust:false,tag:'value',     game:'Cuamba vs Sopaj',        corr:'57.4 FPPF at 18% own. Competitive matchup. Value filler.'},
    {name:'K. Vieira',       pos:'F',sal:{dk:7700,fd:9200}, opp:'vs Cavalcanti',    own:22,ceil:104,floor:58,fppf:62.5, record:'15-5',  bust:false,tag:'leverage',  game:'Vieira vs Cavalcanti',   corr:'62.5 FPPF at 22% own. Proven top-10 fighter at +145. 74% of sharp dollars on her. Best leverage in women\'s fights.'},
    {name:'M. Costa',        pos:'F',sal:{dk:7600,fd:9100}, opp:'vs Allen',         own:28,ceil:118,floor:52,fppf:80.0, record:'26-7',  bust:false,tag:'leverage',  game:'Allen vs Costa',         corr:'80.0 FPPF. 6-fight win streak, 4 finishes. Sharp RLM — line moved 35 cents toward him. Best leverage in main event.'},
    {name:'P. Viana',        pos:'F',sal:{dk:7500,fd:9000}, opp:'vs Ardelean',      own:18,ceil:88, floor:44,fppf:53.4, record:'13-8',  bust:false,tag:'contrarian',game:'Viana vs Ardelean',      corr:'53.4 FPPF at 18% own. +165 dog. Grappling specialist — if she gets the takedown, different fight.'},
    {name:'T. Tokkos',       pos:'F',sal:{dk:7400,fd:8900}, opp:'vs Erslan',        own:20,ceil:86, floor:42,fppf:51.2, record:'11-5',  bust:false,tag:'value',     game:'Erslan vs Tokkos',       corr:'51.2 FPPF. Favorite vs must-win Erslan. Solid filler on salary-constrained builds.'},
    {name:'C. Brundage',     pos:'F',sal:{dk:7300,fd:8800}, opp:'vs Petroski',      own:22,ceil:90, floor:44,fppf:48.5, record:'11-9',  bust:false,tag:'value',     game:'Brundage vs Petroski',   corr:'48.5 FPPF. Competitive matchup at discount salary vs $8,900 Petroski. Value filler.'},
    {name:'S. Bannon',       pos:'F',sal:{dk:7200,fd:8600}, opp:'vs Caliari',       own:12,ceil:84, floor:36,fppf:54.9, record:'7-2',   bust:false,tag:'contrarian',game:'Bannon vs Caliari',      corr:'54.9 FPPF at 12% own. +170 dog vs -205 Caliari. Submit win candidate. GPP only.'},
    {name:'A. Minev',        pos:'F',sal:{dk:7100,fd:8500}, opp:'vs Gantt',         own:34,ceil:120,floor:48,fppf:0,    record:'7-0',   bust:false,tag:'anchor',    game:'Gantt vs Minev',         corr:'UFC debut. 7-0 with 6 stoppages — 4 R1 KOs. Late replacement. Discounted salary. Elite DFS ceiling.'},
    {name:'J. Diaz',         pos:'F',sal:{dk:7000,fd:8400}, opp:'vs Wellmaker',     own:16,ceil:92, floor:40,fppf:0,    record:'15-1-1',bust:false,tag:'contrarian',game:'Diaz vs Wellmaker',      corr:'UFC debut via DWCS KO win. Minimum salary. If he finishes early, GPP gold. Very high variance.'},
    {name:'C. Edwards',      pos:'F',sal:{dk:6900,fd:8300}, opp:'vs Bukauskas',     own:8, ceil:74, floor:28,fppf:0,    record:'8-4',   bust:false,tag:'contrarian',game:'Bukauskas vs Edwards',   corr:'UFC debut against -325 favorite Bukauskas. Massive upset only. GPP lottery dart.'},
  ],
  nba:[],mlb:[],nfl:[],
};


const ODDS_DATA = {
  spreads:{
    nba:[
      {game:'Thunder vs Suns',   time:'7:00 PM ET', dk:'-8.5 -110',fd:'-8 -110',  mgm:'-8.5 -112',cae:'-8 -108', edge:'FREE',move:'up'},
      {game:'Celtics vs 76ers',  time:'7:30 PM ET', dk:'-5.5 -110',fd:'-5 -110',  mgm:'-5.5 -108',cae:'-5 -112', edge:'HIGH',move:'up'},
      {game:'Nuggets vs Lakers', time:'10:00 PM ET',dk:'-6 -110',  fd:'-5.5 -108',mgm:'-6 -112',  cae:'-5.5 -110',edge:'STD',move:'neut'},
    ],
    mlb:[
      {game:'Dodgers vs Giants', time:'9:40 PM ET', dk:'ML -148',  fd:'ML -144',  mgm:'ML -150',  cae:'ML -146', edge:'FREE',move:'up'},
      {game:'Yankees vs Red Sox',time:'7:05 PM ET', dk:'-1.5 -125',fd:'-1.5 -128',mgm:'-1.5 -122',cae:'-1.5 -125',edge:'HIGH',move:'up'},
      {game:'Braves vs Mets',    time:'7:10 PM ET', dk:'U8.5 -112',fd:'U8.5 -115',mgm:'U9 -108',  cae:'U8.5 -112',edge:'STD',move:'neut'},
    ],
    nhl:[
      {game:'Rangers vs Bruins', time:'7:00 PM ET', dk:'-130 ML',  fd:'-128 ML',  mgm:'-132 ML',  cae:'-128 ML', edge:'HIGH',move:'up'},
      {game:'Oilers vs Canucks', time:'10:00 PM ET',dk:'+108 ML',  fd:'+112 ML',  mgm:'+105 ML',  cae:'+110 ML', edge:'STD',move:'neut'},
    ],
    tennis:[
      {game:'Djokovic - Madrid', time:'TBD',        dk:'-200 ML',  fd:'-195 ML',  mgm:'-205 ML',  cae:'-198 ML', edge:'PARL',move:'neut'},
    ],
  },
  totals:{
    nba:[
      {game:'Thunder vs Suns',   time:'7:00 PM ET', dk:'O228.5 -110',fd:'O229 -112',  mgm:'O228 -108',  cae:'O228.5 -110',edge:'STD',move:'neut'},
      {game:'Nuggets vs Lakers', time:'10:00 PM ET',dk:'O232 -110',  fd:'O231.5 -108',mgm:'O232 -112',  cae:'O231.5 -110',edge:'STD',move:'neut'},
    ],
    mlb:[
      {game:'Dodgers vs Giants', time:'9:40 PM ET', dk:'U7.5 -115', fd:'U7.5 -118',  mgm:'U7 -110',    cae:'U7.5 -115',  edge:'HIGH',move:'up'},
      {game:'Braves vs Mets',    time:'7:10 PM ET', dk:'U8.5 -112', fd:'U8.5 -115',  mgm:'U9 -108',    cae:'U8.5 -112',  edge:'STD',move:'neut'},
    ],
    nhl:[
      {game:'Rangers vs Bruins', time:'7:00 PM ET', dk:'U5.5 -120', fd:'U5.5 -122',  mgm:'U5.5 -118',  cae:'U5 -108',    edge:'HIGH',move:'up'},
    ],
    tennis:[],
  },
  ml:{
    nba:[
      {game:'Thunder vs Suns',   time:'7:00 PM ET', dk:'-380',fd:'-370',mgm:'-390',cae:'-375',edge:'STD',move:'neut'},
      {game:'Celtics vs 76ers',  time:'7:30 PM ET', dk:'-220',fd:'-215',mgm:'-225',cae:'-218',edge:'HIGH',move:'up'},
    ],
    mlb:[
      {game:'Dodgers vs Giants', time:'9:40 PM ET', dk:'-148',fd:'-144',mgm:'-150',cae:'-146',edge:'FREE',move:'up'},
      {game:'Yankees vs Red Sox',time:'7:05 PM ET', dk:'-165',fd:'-162',mgm:'-168',cae:'-164',edge:'HIGH',move:'up'},
    ],
    nhl:[
      {game:'Rangers vs Bruins', time:'7:00 PM ET', dk:'-130',fd:'-128',mgm:'-132',cae:'-128',edge:'HIGH',move:'up'},
      {game:'Oilers vs Canucks', time:'10:00 PM ET',dk:'+108',fd:'+112',mgm:'+105',cae:'+110',edge:'STD',move:'neut'},
    ],
    tennis:[
      {game:'Djokovic - Madrid', time:'TBD',        dk:'-200',fd:'-195',mgm:'-205',cae:'-198',edge:'PARL',move:'neut'},
    ],
  },
};

const TRENDS_DATA = [
  {title:'UFC: Underdogs on Active 6+ Win Streaks — Outright Win Rate',
   record:'24-12',pct:67,color:'good',
   desc:'Fighters on active 6+ fight win streaks win outright 67% of the time even when listed as underdogs. This week: Costa is on a 6-fight streak with 4 finishes at +140. Allen is 1-3 in his last 4. The streak data heavily supports Costa.',
   sample:'3-year sample · 36 fights'},

  {title:'UFC: Late Replacement Free Square — DFS Score Distribution',
   record:'41-14',pct:75,color:'good',
   desc:'When a fighter\'s opponent is swapped to a significantly easier matchup after salaries are set, they deliver 90th-percentile DFS scores 75% of the time. Bukauskas this week: priced vs Bellator\'s Bellato (-130), now vs debutant Edwards at same salary. Classic free square situation.',
   sample:'4-year sample · 55 situations'},

  {title:'UFC: Ring Rust (12+ Months Off) vs Active Fighter — Win Rate',
   record:'21-29',pct:42,color:'bad',
   desc:'Fighters returning from 12+ months off win only 42% of the time against opponents with recent activity, regardless of their record. Doo Ho Choi returns from 18 months off this week vs Santos who fought in October. Sharp money is pricing this rust factor aggressively.',
   sample:'3-year sample · 50 fights'},

  {title:'UFC: Sharp RLM Underdogs in Main Events — Outright Win Rate',
   record:'31-16',pct:66,color:'good',
   desc:'When a main event underdog shows reverse line movement — the line moves toward them despite public backing the favorite — they win outright 66% of the time. Costa has clear RLM this week. Line moved 35 cents toward him. The market is pricing a closer fight than the public thinks.',
   sample:'3-year sample · 47 fights'},

  {title:'NBA Playoffs: Home Teams -6 or Better in Conference Finals',
   record:'33-14',pct:70,color:'good',
   desc:'Home teams favored by 6+ points in the Conference Finals cover the spread 70% of the time. OKC is at -9.5 tonight at home in the WCF. SGA averaging 34+ ppg this postseason. Spurs have no answer for OKC\'s depth and athleticism.',
   sample:'6 playoff cycles · 47 games'},

  {title:'NBA Playoffs: Teams Facing Elimination — Cover Rate',
   record:'38-19',pct:67,color:'good',
   desc:'Teams playing in elimination games cover the spread 67% of the time regardless of home/away status. The desperation factor produces above-normal effort and game-planning. Both Cavs and Spurs are facing potential elimination this week.',
   sample:'8 playoff cycles · 57 games'},

  {title:'MLB: Steam Move Teams vs Taxed Bullpen — Win Rate',
   record:'28-12',pct:70,color:'good',
   desc:'When a MLB steam move fires AND the opponent\'s bullpen has thrown 30+ innings in the prior 7 days, the steam side wins 70% of the time. Giants vs Athletics tonight fits exactly — steam on SF, Oakland pen is exhausted.',
   sample:'2 seasons · 40 situations'},

  {title:'UFC: Must-Win Bubble Fighters (0-2 or 0-3 UFC) — Upset Rate',
   record:'22-14',pct:61,color:'good',
   desc:'Fighters needing a win to keep their UFC roster spot overperform as underdogs 61% of the time. Elevated preparation, desperation, and nothing-to-lose mentality produces results. Erslan and Gurule both fit this week. Gurule especially — -110 with real finish ability.',
   sample:'3-year sample · 36 fights'},
];

const PATTERNS_DATA = [
  {icon:'🏈',title:'Revenge Games',body:'A team that was blown out (15+ pts) by an opponent and faces them again within the same season covers ATS 64% of the time. The line rarely fully prices in motivation and preparation adjustments.',edge:'STRONG EDGE',eClass:'pe-strong'},
  {icon:'🏀',title:'First Game Off Suspension',body:'NBA players returning from suspension on the first game back average 4.2 points over their prop line. They are motivated, fresh-legged, and opponents are unprepared for their return.',edge:'STRONG EDGE',eClass:'pe-strong'},
  {icon:'⚾',title:'Pitcher on Extra Rest vs Tired Rotation',body:'Starting pitchers on 6+ days rest facing a team using their 4th or 5th starter cover the run line at a 61% rate historically. The rest/depth gap creates systematic value.',edge:'MODERATE EDGE',eClass:'pe-moderate'},
  {icon:'🥊',title:'Knockout Artist vs Defensive Fighter',body:'Fighters with 70%+ KO rate facing decision-style opponents are profitable to back by decision — the KO threat changes opponent game plans in ways that favor grinding out rounds.',edge:'MODERATE EDGE',eClass:'pe-moderate'},
  {icon:'🏈',title:'NFL Division Underdogs',body:'Division underdogs of 7+ points cover at a 58% rate over the last 6 seasons. Familiarity eliminates talent gaps, and books overweight regular season results.',edge:'STRONG EDGE',eClass:'pe-strong'},
  {icon:'🏀',title:'Total After High-Scoring Game',body:'When both teams scored 120+ in their previous game, the next game total goes UNDER 63% of the time. Books set the line too high reacting to the previous game\'s pace.',edge:'MODERATE EDGE',eClass:'pe-moderate'},
];

const TICKER_DATA=[
  {s:'UFC',p:'Costa ML +140 RLM', r:'LIVE'},
  {s:'UFC',p:'Vieira +145 Sharp', r:'LIVE'},
  {s:'UFC',p:'Bukauskas FREE SQ', r:'LIVE'},
  {s:'UFC',p:'Santos ML +120',    r:'LIVE'},
  {s:'UFC',p:'Gurule ML -110',    r:'LIVE'},
  {s:'NBA',p:'Thunder STEAM',     r:'LIVE'},
  {s:'NBA',p:'Cavs -190 STEAM',   r:'LIVE'},
  {s:'MLB',p:'Giants RLM',        r:'LIVE'},
  {s:'UFC',p:'Chimaev ML -370',   r:'WIN'},
  {s:'UFC',p:'Tulio ML RLM',      r:'WIN'},
  {s:'NBA',p:'Thunder -6.5',      r:'WIN'},
  {s:'MLB',p:'Dodgers ML',        r:'WIN'},
];

const ARTICLES = [
{sport:'ufc',type:'ufc',locked:false,
   tag:'SLATE BREAKDOWN',time:'Today · 7 min read',
   title:'UFC Vegas 117 Full Betting Guide — Allen vs Costa + Every Sharp Signal',
   body:'<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">Main Event: Costa ML (+140) — The Sharp Fade</h3><p>Arnold Allen is the public\'s pick. He\'s ranked #7, he\'s the hometown-style fan favorite, and people remember his 10-fight win streak. But Allen is 1-3 in his last four fights and just returned from over a year off. Costa, by contrast, is on a 6-fight winning streak with four finishes including a spinning back kick TKO of Dan Ige. The line opened Allen -165. It has moved 35 cents toward Costa. That is reverse line movement. Sharp money does not lie. Bet Costa ML at +140.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Free Money Play: Vieira ML (+145)</h3><p>This is the clearest mispriced line on the card. Ketlen Vieira is a proven UFC top-10 fighter. Jaqueline Cavalcanti is 5-0 in the UFC but has never faced anyone at Vieira\'s level. How is Vieira +145? 74% of sharp dollars this week have been on Vieira. The line has compressed 20 cents from +165 to +145 on sharp action alone. This is the definition of free money — a sharp fade on a prospect at the wrong price.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Best Value: Gurule ML (-110)</h3><p>Gurule is 0-3 in the UFC but every fight has been close. He faces Daniel Barez — a 37-year-old fighter who lost to Andre Lima over a year ago and is 1-2 in the UFC himself. This is essentially a pick-em at -110. Gurule is younger, more active at 4.47 significant strikes per minute, and has real finishing ability. The line moved 22 cents toward Gurule. The market agrees.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Steam Play: Santos ML (+120)</h3><p>Doo Ho Choi has not fought since December 2024. That is 18 months of ring rust. Daniel Santos has fought recently and is on a four-fight winning streak with KO finishes. 68% of sharp dollars are on Santos despite 54% of public bets going to Choi because of name recognition. Sharp money is pricing the rust factor heavily. Line has moved 27 cents toward Santos.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">DFS Free Square: Bukauskas ML (-325)</h3><p>This is not a bet — it is a DFS decision. Bukauskas was priced at $8,300 as a -130 favorite against Bellato. His opponent was changed to UFC debutant Christian Edwards ($6,900). Bukauskas is now -325 at the same salary. This situation is called a free square and it is the best DFS play on the slate. He will be 60%+ owned. That is justified. Build around him in cash, pair with leverage plays in GPP.</p>'},

  {sport:'betting',type:'betting',locked:false,
   tag:'EDUCATION',time:'Today · 5 min read',
   title:'How to Read Sharp Money: The Complete Beginner Guide',
   body:'<p><b style="color:var(--green2);">This is the most important skill in sports betting.</b> Once you understand it, you will never look at a betting line the same way.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Two Numbers, One Signal</h3><p>Every bet has two numbers that matter: the percentage of total bets placed on each side, and the percentage of total dollars wagered on each side. Bets are casual bettors — $20 here, $50 there. Dollars are sharp bettors — $5,000, $20,000, sometimes more. When those two numbers point in different directions, that gap is the signal.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Reverse Line Movement — The Most Powerful Signal</h3><p>Reverse line movement happens when a betting line moves in the OPPOSITE direction of where the public money is going. Example: 65% of bets are on Team A but the line moves in favor of Team B. That means large amounts of money — sharp money — came in on Team B and moved the line despite the public. That is your bet.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Steam Moves</h3><p>A steam move is rapid, coordinated betting action from multiple sharp groups hitting a number at the same time. The line moves fast and does not come back. When you see a line move 20-30 cents in minutes, that is a steam move. Get on the same side immediately.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">The Simple Rule</h3><p>Check the gap between bet percentage and dollar percentage. A gap of 15 points or more is significant. A gap of 25 points or more is a strong signal. A gap of 30+ points is rare and highly actionable. On our Sharp Money page, we calculate this for you and label every signal clearly. All you have to do is follow THE PLAY on each card.</p>'},

  {sport:'nba',type:'nba',locked:false,
   tag:'FREE MONEY',time:'Today · 3 min read',
   title:'NBA Playoffs Sharp Report: Thunder and Knicks Tonight',
   body:'<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">Thunder -6.5 (-110) — 2 Units</h3><p>OKC has 62% of sharp dollars vs only 43% of public bets. That 19-point gap is reverse line movement. The line jumped from -5 to -6.5 on sharp action. Public is backing Minnesota, sharps are loading OKC. SGA is playing at an MVP level. Two units.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Knicks ML (+148) — 1 Unit</h3><p>36% of public bets on New York but 64% of sharp money. Line compressed from +165 to +148. When a plus-money line moves shorter, sharp money is buying it. Knicks are 5-0 ATS in these playoffs. One unit.</p>'},

  {sport:'betting',type:'betting',locked:true,
   tag:'FOUNDATION',time:'Today · 5 min read',
   title:'Bankroll Management: The System Every Sharp Bettor Uses',
   body:'<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">The Unit System</h3><p>One unit equals 1-2% of your total bankroll. If you have $1,000, one unit is $10-20. You never bet more than 3 units on any single game. This sounds conservative. It is. That is the point. Sports betting is a volume game — you need to survive a losing streak to benefit from a winning one.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Never Chase Losses</h3><p>The single most destructive thing a bettor can do is increase bet size after a loss to recover. It feels logical. It is fatal to your bankroll. Sharp bettors bet the same unit size whether they are up 20 units or down 10. The size never changes based on recent results.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Track Everything</h3><p>You cannot improve what you do not measure. Track every bet: the sport, the line you got, the result, your unit size. After 100 bets you will see patterns — which sports you beat, which you do not, which bet types hit and which miss. This data is worth more than any tip.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">The Kelly Criterion (Advanced)</h3><p>The Kelly Criterion tells you the mathematically optimal bet size based on your edge and odds. For a bet with 60% win probability at -110 odds, Kelly says bet 6.4% of bankroll. Most sharp bettors use half-Kelly (3.2%) to reduce variance. Our My Tools page calculates this for you automatically.</p>'},

  {sport:'dfs',type:'dfs',locked:true,
   tag:'DFS STRATEGY',time:'Today · 6 min read',
   title:'UFC DFS Complete Guide: From Pool to Lineup in 10 Minutes',
   body:'<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">Step 1: Identify Your Anchors</h3><p>Anchors are fighters with 90+ FPPF who are favorites in their fight. They are the foundation of every lineup. This week your anchors are Chimaev (126.7), Amosov (102.9), Susurkaev (103.7), and Taira (99.5). Start every lineup with at least two of these.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Step 2: Find Your Leverage Play</h3><p>A leverage play is a fighter with high FPPF but low projected ownership — meaning most lineups will NOT have them. If they win, you immediately separate from the field. This week: Tulio (95.5 FPPF, 22% own) and Brady (93.4 FPPF, 20% own) are both leverage plays. Building Tulio over Kopylov while the field plays Kopylov gives you massive separation.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Step 3: Build for Cash vs GPP Differently</h3><p>In cash games (50/50s, double-ups), use your highest-floor players — Chimaev, Amosov, Taira, Susurkaev. No underdogs. No risky plays. You just need to beat the median score. In GPP tournaments, you need differentiation. Replace one anchor with a leverage play or underdog. Van at +220 with 52% ownership means everyone who plays Taira has the same lineup — Van breaks the field apart.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Step 4: Use Our Optimizer</h3><p>Our DFS Optimizer runs the Intel Scoring Engine on every fighter — combining FPPF, salary efficiency, ownership projections, sharp signals, and tag classifications to build you an intel-weighted lineup. Set your max exposure, add locks and excludes, and hit Build Portfolio. Export directly to DraftKings CSV when done.</p>'},

  {sport:'dfs',type:'dfs',locked:true,
   tag:'DFS BASICS',time:'2 days ago · 4 min read',
   title:'GPP vs Cash Games: Which Format Should You Play?',
   body:'<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">Cash Games — Floor is Everything</h3><p>50/50s and double-ups pay the top half of the field. Your goal is to beat the median score. Play your highest-floor fighters — the ones who score consistently regardless of outcome. Chimaev, Amosov, Susurkaev. No underdogs. No swing plays. Just reliable production.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">GPP Tournaments — Ceiling is Everything</h3><p>Large GPP tournaments pay the top 10-20% with massive upside for first place. You need high-ceiling plays, leverage, and differentiation. If everyone has the same lineup, even if the picks are right, no one profits above the field. You need players others do not have. Van at 52% ownership is chalk — Taira is the sharper play. But in GPP, Van at +220 winning changes everything.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">The Simple Rule for Beginners</h3><p>Start in cash games. Build your bankroll. Learn which fighters you identify correctly. Once you are cashing in cash games consistently, add one GPP lineup per slate. Do not go all-in on GPP until you understand the game.</p>'},
];

const EVERGREEN_ARTICLES = [
  {
    id:'ev1', sport:'education', type:'education', locked:false,
    tag:'BETTING 101', time:'Evergreen · 6 min read', pinned:true,
    title:'What Is Sharp Money? A Complete Guide to Reading Line Movement',
    body:`<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">Sharp Money vs Public Money</h3>
<p>Sharp money is professional betting money. It comes from individuals or syndicates who bet for a living, have large bankrolls, and move lines when they bet. Public money is recreational — the majority of tickets placed by casual bettors, usually on favorites and well-known teams.</p>
<p>The key insight: sportsbooks set lines to balance action, not to predict outcomes. When sharp bettors identify a mispriced line, they bet it hard — and the book moves the line to limit exposure. That movement is the signal. You are reading the book's reaction to professional money, not the professional money itself.</p>
<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">How to Identify Sharp Action</h3>
<p><strong>Reverse Line Movement (RLM):</strong> The strongest signal. 70% of bets are on Team A but the line moves toward Team B. The 30% on Team B are professionals placing larger bets. The book moves toward the money, not the tickets. Always follow reverse line movement.</p>
<p><strong>Steam Moves:</strong> Multiple sportsbooks move the same line within minutes of each other. This happens when a sharp syndicate places large bets at many books simultaneously. When you see a steam move, the window to get the old number closes in minutes.</p>
<p><strong>Line Freeze:</strong> A line stops moving despite heavy public action on one side. The book is holding the line because sharp money is balanced against the public. This tells you sharps are on the other side.</p>
<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">How to Use Sharp Signals</h3>
<p>Sharp signals are not guarantees — professionals lose too. What they tell you is that the line is probably mispriced and the odds available to you represent positive expected value. Over a large sample, betting with the sharp money side when the signal is confirmed adds 3-5% ROI versus betting randomly. That is the entire edge in sports betting.</p>`
  },
  {
    id:'ev2', sport:'education', type:'education', locked:false,
    tag:'BETTING 101', time:'Evergreen · 5 min read', pinned:true,
    title:'How to Read Odds — American, Decimal, and What They Actually Mean',
    body:`<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">American Odds Explained</h3>
<p>American odds come in two forms. A negative number (-150) means you must bet that amount to win $100. A positive number (+130) means a $100 bet wins that amount. The favorite always has negative odds. The underdog always has positive odds.</p>
<p>Example: -150 means bet $150 to win $100 profit. +130 means bet $100 to win $130 profit. The key number is the implied probability — what the market thinks the chance of winning is.</p>
<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Implied Probability</h3>
<p>To convert American odds to implied probability: For negative odds, divide the odds by (odds + 100). So -150 becomes 150/250 = 60%. For positive odds, divide 100 by (odds + 100). So +130 becomes 100/230 = 43.5%.</p>
<p>The vig (juice) is the book's cut. If you add up both sides of a game, the total implied probability exceeds 100%. That excess is the sportsbook's edge. A standard -110/-110 line has about 4.5% vig baked in. Your job is to find spots where the true probability exceeds the implied probability by enough to overcome the vig.</p>
<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">What Is Closing Line Value?</h3>
<p>The closing line — the final odds before a game starts — is the most accurate price the market produces. It incorporates all available information. If you consistently bet at better odds than the closing line, you have a real edge. If you consistently get worse odds than the closing line, the market is correcting against you. Track your CLV on every bet. It is the single best predictor of long-term profitability.</p>`
  },
  {
    id:'ev3', sport:'education', type:'education', locked:false,
    tag:'BANKROLL', time:'Evergreen · 7 min read', pinned:true,
    title:'Bankroll Management — The Only Thing That Keeps You in the Game',
    body:`<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">Why Bankroll Management Matters More Than Picks</h3>
<p>A bettor with mediocre picks and disciplined bankroll management will outperform a bettor with excellent picks and no discipline over the long run. Variance in sports betting is extreme. You will have losing streaks of 8-10 games even when you are making the right bets. Bankroll management is what keeps you alive long enough for the edge to manifest.</p>
<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">The Flat Betting Model</h3>
<p>Bet the same amount on every game regardless of confidence level. This is called flat betting and it is the foundation of sustainable sports betting. A standard unit is 1-2% of your total bankroll. On a $1,000 bankroll, one unit is $10-$20. This sounds small. That is the point. At 1% per unit, you can lose 50 bets in a row and still have half your bankroll.</p>
<p>Avoid the trap of "I'm really confident in this one" and betting 5-10% of your roll on a single game. Every sharp bettor has a story about the game they were certain about that destroyed their bankroll. Certainty is an illusion in sports betting. Flat betting removes the emotional decision from sizing.</p>
<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Unit Sizing by Signal Strength</h3>
<p>The OnlyWynnrs system uses three unit sizes: 0.5 units for standard plays, 1 unit for high-confidence plays, and 1.5 units for free money plays with confirmed sharp signals. Never exceed 2 units on any single game. The sizing difference between a 1-unit play and a 1.5-unit play is small. The discipline of never going above 2 units is what separates sustainable bettors from people who blow up their bankrolls.</p>
<p>The goal of bankroll management is not to maximize any single winning streak. It is to still be betting in six months. Protect the bankroll and the edge takes care of itself.</p>`
  },
  {
    id:'ev4', sport:'dfs', type:'dfs', locked:false,
    tag:'DFS 101', time:'Evergreen · 8 min read', pinned:true,
    title:'UFC DFS — How the Scoring Works and How to Build a Winning Lineup',
    body:`<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">DraftKings UFC Scoring</h3>
<p>Understanding the scoring system is the foundation of building winning lineups. DraftKings UFC scoring rewards finishing ability above everything else. A first-round KO win scores approximately 130+ points. A decision win scores around 60-70 points. This gap is enormous — it means a $7,000 fighter who finishes in round 1 outscores a $9,500 fighter who wins a boring decision almost every time.</p>
<p>Key scoring events: Significant strike landed = 0.2 pts. Knockdown = 3 pts. Takedown = 5 pts. Submission attempt = 5 pts. Fighter win = 30 pts. Finish bonus = 30 pts for KO/TKO, 30 pts for submission. Quality win bonus = 10 pts for dominant performance. These bonuses are where the points are made.</p>
<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">The Two Types of Value</h3>
<p><strong>Salary efficiency:</strong> A fighter priced at $7,500 who projects for 85 points provides more value per dollar than a fighter priced at $9,500 projecting for 90 points. Always calculate points per thousand dollars — divide projected points by salary in thousands. Anything above 10 pts/$1K is strong value.</p>
<p><strong>Ownership leverage:</strong> In GPP tournaments, being right on a low-owned fighter matters more than being right on a high-owned fighter. If 60% of lineups have Fighter A and he wins, you gain nothing on those lineups. If 15% of lineups have Fighter B and she wins by first-round KO, you immediately beat 85% of the field from that one slot.</p>
<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">The Free Square</h3>
<p>A free square is the highest-value play in UFC DFS. It happens when a fighter's opponent is changed to a significantly easier matchup after salaries are locked. The site does not reprice immediately. You get a fighter priced for a hard fight who is now a massive favorite. Always identify free squares before building any lineup — they are the anchor of the slate.</p>`
  },
  {
    id:'ev5', sport:'dfs', type:'dfs', locked:false,
    tag:'DFS STRATEGY', time:'Evergreen · 6 min read', pinned:true,
    title:'Cash Games vs GPP — Two Completely Different Games on the Same Slate',
    body:`<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">Cash Games — 50/50s and Double-Ups</h3>
<p>In a cash game, the top 50% of entries win approximately double their money. Your goal is to beat the median score, not the top score. This changes everything about how you build. Cash lineups prioritize floor — the minimum score a fighter is likely to achieve. You want 6 fighters who all have a reasonable floor and are likely to score consistently. Volatile, low-owned upside plays hurt cash game lineups.</p>
<p>Cash game principles: Take all confirmed chalk plays (free squares, steam moves, heavy favorites in favorable matchups). Avoid upset plays and high-variance fighters. Target volume strikers who go the distance and accumulate significant strikes — they score consistently regardless of outcome. Own 55-65% of the field on your most correlated fighters.</p>
<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">GPP Tournaments — Top 20% Pays</h3>
<p>In a tournament, the top 20% of entries cash, with first place paying a massive premium. Your goal is ceiling — the maximum possible score. You need at least one fighter who can go nuclear (130+ points from a first-round finish) at low ownership. Building a safe, chalk-heavy lineup in a tournament gives you a 20% chance to cash at small money. Building an aggressive, differentiated lineup gives you a small chance to win big money.</p>
<p>GPP principles: Identify your win condition before picking a single player. Accept that most GPP lineups lose — that is the format. One correct low-owned underdog who finishes early beats hundreds of chalk-heavy lineups. Use cash games to fund your GPP entries, not the other way around.</p>
<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">The Simple Rule</h3>
<p>Put 70% of your DFS budget in cash games and 30% in GPP. The cash games pay the bills. The GPP entries are where you win life-changing scores. Never reverse this ratio.</p>`
  },
];


const HC_PARLAYS = [
  {
    title:'UFC Vegas 117 Sharp RLM Trio',
    legs:['Costa ML (+140)','Vieira ML (+145)','Santos ML (+120)'],
    reasons:[
      'RLM confirmed — 35-cent move toward Costa despite public on Allen.',
      'Proven top-10 fighter at +145 vs unproven prospect. 74% sharp dollars.',
      'Sharp action on Santos vs ring-rusty Choi. 27-cent move toward Santos.',
    ],
    combinedOdds:'+680',winProb:'14%',ev:'+6%',units:'0.1 units',
    rating:'HIGH VALUE',ratingColor:'var(--gold)',sport:'ufc',
    note:'Three RLM underdogs on the same card. When sharp money backs all three dogs, combined EV is positive. Strictly 0.1u.',
  },
  {
    title:'UFC Vegas 117 Best Two-Leg Sharp Play',
    legs:['Costa ML (+140)','Vieira ML (+145)'],
    reasons:[
      'Steam and RLM — 35-cent move toward Costa all week. Sharp money is certain.',
      '74% of sharp dollars on proven top-10 Vieira vs unproven prospect. 20-cent compression.',
    ],
    combinedOdds:'+360',winProb:'22%',ev:'+8%',units:'0.25 units',
    rating:'HIGH VALUE',ratingColor:'var(--gold)',sport:'ufc',
    note:'Best two-dog combo on the card. Both confirmed RLM. Combined EV is positive at 0.25u.',
  },
  {
    title:'Safe Chalk Parlay — Free Square + Steam',
    legs:['Bukauskas ML (-325)','Ardelean ML (-200)','Wellmaker ML (-150)'],
    reasons:[
      'Free square — priced vs Bellato (-130), now -325 vs debutant Edwards. Market mispriced.',
      'Steam confirmed. 7.35 sig strikes/min vs 2.74. Volume finisher. Two-way signal.',
      'Steam confirmed across 3 books. Debutant opponent. Sharp money sizing up.',
    ],
    combinedOdds:'+185',winProb:'40%',ev:'+5%',units:'0.5 units',
    rating:'HIGH VALUE',ratingColor:'var(--gold)',sport:'ufc',
    note:'Three confirmed chalk plays with steam/free square backing. Best safe parlay. 0.5u max.',
  },
  {
    title:'NBA Playoff Steam Double',
    legs:['OKC Thunder ML (-275)','Cleveland Cavaliers ML (-190)'],
    reasons:[
      'Steam confirmed — 3 books moved simultaneously overnight. 62% sharp dollars on OKC.',
      '3-book simultaneous move on Cavs. 61% sharp dollars. Detroit missing rotation pieces.',
    ],
    combinedOdds:'+190',winProb:'38%',ev:'+4%',units:'0.5 units',
    rating:'HIGH VALUE',ratingColor:'var(--gold)',sport:'nba',
    note:'Two confirmed steam moves on the same NBA night. Both closing heavy. 0.5u.',
  },
];
