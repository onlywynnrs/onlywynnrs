const _SURL='https://nkqnzyipztancnskshsw.supabase.co';
const _SKEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW56eWlwenRhbmNuc2tzaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTcxNjAsImV4cCI6MjA5Mjc5MzE2MH0.CyiRaPPPhDwnCzIqxHF0ZpgGmTsh53TUMOvre93wLpo';

const STRIPE_PK = 'pk_test_51TOSmaRpuoMp8x76YvBeVKF3v4Fx9YOXwv75AvewAzdnc7HwJ3HRIGeOqksfjWQjRBY8Q1tcwz06HjPshV76wVny00cGKdC8ol';
const STRIPE_PRICES = {
  optimizer: 'price_1TTPDKRpuoMp8x76CCxiLvGe',
  wynnr:     'price_1TTPE4RpuoMp8x76pTFVPfK2',
  elite:     'price_1TTPEORpuoMp8x76Fy9tJVqN',
};

const PICKS = [
  {sport:'ufc',matchup:'Chimaev vs Strickland',call:'Chimaev ML',
   why:'15-0, -370. Sharp AND public money agree — steam move confirmed. Both sides of the market loading Chimaev. Line moved from -300 to -370 on pure volume. This is as close to a lock as UFC gets. Anchor bet of the weekend.',
   odds:'-370',time:'Sat 5/9 7:20 PM ET',rating:'FREE',units:'1.5 units'},

  {sport:'ufc',matchup:'Susurkaev vs Santos',call:'Susurkaev ML',
   why:'11-0 undefeated. Only 42% of public bets on him but 61% of dollars — that is textbook reverse line movement. Public split, sharps piling in. Take Susurkaev.',
   odds:'-290',time:'Sat 5/9 2:10 PM ET',rating:'FREE',units:'1.5 units'},

  {sport:'ufc',matchup:'Taira vs Van',call:'Taira ML',
   why:'18-1, -270. 56% of bets and 68% of dollars on Taira. Sharps clearly on Taira over champion Van in this 5-round title fight. Best cash game play in the co-main.',
   odds:'-270',time:'Sat 5/9 7:00 PM ET',rating:'FREE',units:'1.5 units'},

  {sport:'ufc',matchup:'Tulio vs Kopylov',call:'Tulio ML',
   why:'35% of public bets on Tulio but 65% of dollars. Most extreme reverse line movement on the card. Market knows something. Line moved from -180 to -230. Get in before it moves further.',
   odds:'-230',time:'Sat 5/9 2:30 PM ET',rating:'HIGH',units:'1.5 units'},

  {sport:'ufc',matchup:'Brady vs Buckley',call:'Brady ML',
   why:'34% of bets on Brady but 58% of dollars. Sharps buying the underdog. Brady is a grappling specialist — Buckley gets taken down and controlled. Best plus-money value on the card.',
   odds:'+160',time:'Sat 5/9 6:20 PM ET',rating:'HIGH',units:'1 unit'},

  {sport:'ufc',matchup:'Amosov vs Alvarez',call:'Amosov ML',
   why:'29-1 record. Both sharp and public money on Amosov — 58% of bets and 71% of dollars. Steam confirmed. High-confidence play at -290.',
   odds:'-290',time:'Sat 5/9 4:40 PM ET',rating:'HIGH',units:'1.5 units'},

  {sport:'ufc',matchup:'Taira vs Van',call:'Van ML',
   why:'UPSET SPECIAL — Current UFC champion at +220. 5-round fight. Van has championship experience and finishing power. If she wins this fight, everyone who played Taira in DFS loses. Tiny bet only.',
   odds:'+220',time:'Sat 5/9 7:00 PM ET',rating:'LOTT',units:'0.25 units'},

  {sport:'nba',matchup:'OKC Thunder vs MIN Timberwolves',call:'Thunder -6.5',
   why:'43% of public bets on OKC but 62% of dollars. Reverse line movement — sharps loading OKC while public backs Minnesota. Line jumped from -5 to -6.5 on sharp action. Two units.',
   odds:'-110',time:'Tonight',rating:'FREE',units:'2 units'},

  {sport:'nba',matchup:'NYK Knicks vs IND Pacers',call:'Knicks ML',
   why:'36% of public bets on Knicks but 64% of sharp money. Line compressed from +165 to +148. Sharp dollars moving Knicks. New York 5-0 ATS in playoffs.',
   odds:'+148',time:'Tonight',rating:'HIGH',units:'1 unit'},

  {sport:'mlb',matchup:'Dodgers vs Cardinals',call:'Dodgers ML',
   why:'Glasnow on the mound, ERA under 2.00 last 3 starts. 56% public bets and 68% dollars on Dodgers — steam move confirmed. Cardinals rank 28th in K% vs RHP. Line moved from -148 to -168.',
   odds:'-168',time:'Tonight',rating:'FREE',units:'1.5 units'},

  {sport:'mlb',matchup:'Cubs vs Brewers',call:'Cubs -1.5',
   why:'Stroman dealing right now. Brewers 3-9 last 12. Sharp steam on Chicago across multiple books. Run line value at -115.',
   odds:'-115',time:'Tonight',rating:'HIGH',units:'1 unit'},

  {sport:'nhl',matchup:'Panthers vs Leafs',call:'Panthers ML',
   why:'34% public bets on Florida but 66% of sharp dollars. Massive divergence. Panthers at home in an elimination game — 8-2 in these spots under this staff. Sharp side confirmed.',
   odds:'-138',time:'Tonight',rating:'HIGH',units:'1 unit'},

  {sport:'pga',matchup:'PGA Tour',call:'Scheffler Top 5',
   why:'World No.1 on a course built for his ball-striking. Current form is elite. Top 5 at -120 is the safest golf bet on the board this week.',
   odds:'-120',time:'This week',rating:'HIGH',units:'1.5 units'},
];

const FM_PICKS = [
  {sport:'ufc',matchup:'Chimaev vs Strickland',call:'Chimaev ML',
   why:'Steam move confirmed — both sharp AND public money on Chimaev. Line moved from -300 to -370. When the whole market agrees, you take it. This is your anchor bet of the weekend.',
   odds:'-370',time:'Sat 5/9 7:20 PM ET',rating:'FREE',units:'1.5 units',ev:'+8%',winProb:'74%',lineMove:'-300 → -370'},
  {sport:'ufc',matchup:'Susurkaev vs Santos',call:'Susurkaev ML',
   why:'Only 42% of bets on Susurkaev but 61% of the money. That gap is sharp money at work. Public is split, sharps have decided. Take Susurkaev.',
   odds:'-290',time:'Sat 5/9 2:10 PM ET',rating:'FREE',units:'1.5 units',ev:'+9%',winProb:'72%',lineMove:'-240 → -290'},
  {sport:'ufc',matchup:'Tulio vs Kopylov',call:'Tulio ML',
   why:'The clearest reverse line movement on the card. 35% of bets on Tulio, 65% of the money. Sharps are certain. Line moved from -180 to -230. This is free money before it moves further.',
   odds:'-230',time:'Sat 5/9 2:30 PM ET',rating:'HIGH',units:'1.5 units',ev:'+11%',winProb:'67%',lineMove:'-180 → -230'},
  {sport:'nba',matchup:'OKC Thunder vs MIN Timberwolves',call:'Thunder -6.5',
   why:'43% of public bets on OKC, 62% of dollars. Reverse line movement — public going one way, sharp money going the other. Follow the money. Always.',
   odds:'-110',time:'Tonight',rating:'FREE',units:'2 units',ev:'+11%',winProb:'63%',lineMove:'-5 → -6.5'},
  {sport:'nba',matchup:'NYK Knicks vs IND Pacers',call:'Knicks ML',
   why:'Only 36% of bets on New York but 64% of sharp money. Line went from +165 to +148. When sharp money compresses a plus-money line that fast, you follow it.',
   odds:'+148',time:'Tonight',rating:'HIGH',units:'1 unit',ev:'+9%',winProb:'43%',lineMove:'+165 → +148'},
];

const BI_TIERS = [
  {badge:'FREE\nMONEY',color:'#4db874',bg:'rgba(58,148,96,.14)',border:'rgba(58,148,96,.28)',name:'Free Money',desc:'High positive EV. Line is statistically off, sharp money confirms, CLV is strong. Max bet territory.',stats:[['Win rate','58%+'],['Bet size','2-3 units'],['EV','+8% or higher']]},
  {badge:'HIGH\nVALUE',color:'#c9a84c',bg:'rgba(201,168,76,.13)',border:'rgba(201,168,76,.28)',name:'High Value',desc:'Strong positive EV with data backing. Sharp money present. Your bread and butter plays.',stats:[['Win rate','54-58%'],['Bet size','1-2 units'],['EV','+3-8%']]},
  {badge:'STANDARD\nPLAY',color:'#4a88d8',bg:'rgba(48,96,160,.13)',border:'rgba(48,96,160,.28)',name:'Standard Play',desc:'Slightly positive EV. Worth a standard unit as part of a diversified approach.',stats:[['Win rate','52-54%'],['Bet size','1 unit'],['EV','+1-3%']]},
  {badge:'PARLAY\nPIECE',color:'#e09050',bg:'rgba(192,88,32,.13)',border:'rgba(192,88,32,.28)',name:'Parlay Piece',desc:'Good angle but too much juice alone. Use as a leg in small parlays only.',stats:[['Implied','65%+'],['Bet size','0.5 units'],['Use','Parlay only']]},
  {badge:'LOTTERY\nTICKET',color:'#d94040',bg:'rgba(176,48,48,.12)',border:'rgba(176,48,48,.26)',name:'Lottery Ticket',desc:'Negative EV but meaningful upset potential. Entertainment only. Never chase.',stats:[['Win rate','18-22%'],['Bet size','0.25 units max'],['EV','Negative']]},
];

const SHARP_DATA = [
  {game:'Chimaev vs Strickland',
   sub:'UFC 328 · Main Event · Sat 5/9 7:20 PM ET',
   pub:67, sharp:74, move:'-300 to -380',
   sig:'hot', sigText:'STEAM',
   note:'67% of bets AND 74% of dollars on Chimaev. Sharp and public both loading the favorite. Line steaming toward -400. Take it now before it gets worse.'},

  {game:'Susurkaev vs Santos',
   sub:'UFC 328 · Sat 5/9 2:10 PM ET',
   pub:41, sharp:63, move:'-240 to -300',
   sig:'hot', sigText:'REVERSE LINE',
   note:'Only 41% of bets on Susurkaev but 63% of dollars. Sharpest reverse line movement on the prelims. Public split, pros loading Susurkaev heavily.'},

  {game:'Tulio vs Kopylov',
   sub:'UFC 328 · Sat 5/9 2:30 PM ET',
   pub:32, sharp:68, move:'-180 to -240',
   sig:'hot', sigText:'REVERSE LINE',
   note:'Only 32% of bets on Tulio but 68% of dollars. Most extreme reverse line movement on the entire card. Sharp money is certain here.'},

  {game:'Brady vs Buckley',
   sub:'UFC 328 · Sat 5/9 6:20 PM ET',
   pub:33, sharp:61, move:'+130 to +165',
   sig:'hot', sigText:'REVERSE LINE',
   note:'33% of bets on Brady but 61% of dollars. Sharps buying the underdog. Brady line drifting longer — market confirming the value.'},

  {game:'Taira vs Van',
   sub:'UFC 328 · Co-Main · Sat 5/9 7:00 PM ET',
   pub:54, sharp:69, move:'-230 to -275',
   sig:'hot', sigText:'SHARP ACTION',
   note:'54% of bets on Taira, 69% of dollars. Sharps clearly on Taira over champion Van. Line moved 45 cents on sharp volume alone.'},

  {game:'Amosov vs Alvarez',
   sub:'UFC 328 · Sat 5/9 4:40 PM ET',
   pub:61, sharp:73, move:'-250 to -300',
   sig:'hot', sigText:'STEAM',
   note:'61% bets AND 73% dollars on Amosov. Two-way steam confirmed. High conviction signal on both sides of the market.'},

  {game:'OKC Thunder vs MIN Timberwolves',
   sub:'NBA Playoffs · Tonight',
   pub:41, sharp:64, move:'-5 to -6.5',
   sig:'hot', sigText:'REVERSE LINE',
   note:'41% of bets on OKC but 64% of dollars. Public still leaning Minnesota, sharp money all over OKC. Line jumped 1.5 points on sharp action.'},

  {game:'NYK Knicks vs IND Pacers',
   sub:'NBA Playoffs · Tonight',
   pub:35, sharp:66, move:'+165 to +144',
   sig:'hot', sigText:'SHARP ACTION',
   note:'35% of public bets, 66% of sharp money on Knicks. Line compressed 21 cents. Sharp dollars moving hard on New York.'},

  {game:'Dodgers vs Cardinals',
   sub:'MLB · Tonight',
   pub:58, sharp:66, move:'-148 to -172',
   sig:'hot', sigText:'STEAM',
   note:'Glasnow pitching, line steaming. Both sharp and public money on Dodgers. Cardinals rank 28th in K% vs RHP.'},

  {game:'Panthers vs Leafs',
   sub:'NHL Playoffs · Tonight',
   pub:33, sharp:67, move:'-118 to -142',
   sig:'hot', sigText:'REVERSE LINE',
   note:'33% public bets, 67% sharp money on Panthers. Home team in elimination — sharp side confirmed. 24-point gap between bets and dollars.'},
];

const LV_DATA = [
  {game:'Chimaev ML', sub:'FD: -340 vs DK: -380 — take FD now',
   move:'+40c', dir:'up', note:'FanDuel still 40 cents better on Chimaev. Grab it before they update.'},
  {game:'Van ML', sub:'DK: +200 vs FD: +175 — DK best price',
   move:'+25c', dir:'up', note:'UFC champion as underdog — always shop. DK giving best price.'},
  {game:'Brady ML', sub:'Bet365: +170 vs DK: +165 — check Bet365',
   move:'+5c', dir:'up', note:'Small edge on Brady — worth shopping if you have Bet365.'},
  {game:'Thunder -6.5', sub:'Two books still -5.5 — get the point',
   move:'+1pt', dir:'up', note:'If you can get -5.5 anywhere still, take it immediately.'},
  {game:'Knicks ML', sub:'FD: +160 vs DK: +144 — FD significantly better',
   move:'+16c', dir:'up', note:'FanDuel pricing Knicks 16 cents better. Meaningful edge.'},
];

const TODAY = new Date();
const todayDay = TODAY.getDay(); // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat

const BOOKS = {
  dk: { name:'DraftKings', cap:50000, sizes:{ufc:6,nba:8,nfl:9,mlb:10,nba_showdown:6}, minSal:4000 },
  fd: { name:'FanDuel',    cap:60000, sizes:{ufc:5,nba:7,nfl:9,mlb:9,nba_showdown:5},  minSal:4800 },
};

const SLATE_SCHEDULE = {
  ufc:[
    {id:'ufc328', name:'UFC 328 — May 9', date:'Sat 5/9 2:00 PM ET', book:'dk',
     fights:['Gautier vs Diaz','Santos vs Susurkaev','Gomis vs Sabatini','Tulio vs Kopylov','Gordon vs Miller',
              'Ochoa vs Carpenter','Rebecki vs Dawson','Amosov vs Alvarez','Buckley vs Brady',
              'Cortes Acosta vs Volkov','Van vs Taira','Stephens vs Green','Strickland vs Chimaev']}
  ],
  nba:[{id:'nba_playoffs', name:'NBA Playoffs 2025', date:'Various', book:'dk', fights:[]}],
  mlb:[{id:'mlb_today', name:'MLB Today', date:'Tonight', book:'dk', fights:[]}],
};

const POOLS = {
  ufc:[
    // UFC 328 — 5/9/2025 — DK $600K Special — $50K cap, pick 6
    // OWNERSHIP NOTE: 5-round fights (Van, Chimaev, Taira) project HIGHER ownership
    // Champions and favorites in marquee bouts always 40%+ in large GPP fields
    {name:'A. Gautier',fullName:'Alexandre Gautier',       pos:'F',sal:{dk:9800,fd:11700},opp:'vs Diaz',          own:36,ceil:115,floor:65,fppf:97.5, record:'10-1',  bust:false,tag:'anchor',    game:'Gautier vs Diaz',          corr:'97.5 FPPF, 10-1. Top salary anchor. Steam confirmed.'},
    {name:'B. Susurkaev',fullName:'Bekkhan Susurkaev',     pos:'F',sal:{dk:9600,fd:11500},opp:'vs Santos',        own:46,ceil:118,floor:68,fppf:103.7,record:'11-0',  bust:false,tag:'anchor',    game:'Santos vs Susurkaev',      corr:'103.7 FPPF, 11-0 undefeated. Elite ceiling.'},
    {name:'K. Chimaev',fullName:'Khamzat Chimaev',       pos:'F',sal:{dk:9500,fd:11400},opp:'vs Strickland',    own:62,ceil:130,floor:70,fppf:126.7,record:'15-0',  bust:false,tag:'chalk',     game:'Strickland vs Chimaev',    corr:'126.7 FPPF best on slate. 15-0. 5-round main event. Highest ownership.'},
    {name:'J. Gordon',fullName:'Jack Gordon',        pos:'F',sal:{dk:9300,fd:11200},opp:'vs Miller',        own:28,ceil:98, floor:58,fppf:74.3, record:'21-8',  bust:false,tag:'anchor',    game:'Gordon vs Miller',         corr:'74.3 FPPF, 21-8 veteran. Solid floor.'},
    {name:'K. Green',fullName:'Kevin Green',         pos:'F',sal:{dk:9200,fd:11100},opp:'vs Stephens',      own:22,ceil:96, floor:55,fppf:63.6, record:'34-17', bust:false,tag:'value',     game:'Stephens vs Green',        corr:'63.6 FPPF. Value vs Stephens at this salary.'},
    {name:'P. Sabatini',fullName:'Pedro Sabatini',      pos:'F',sal:{dk:9000,fd:10800},opp:'vs Gomis',         own:28,ceil:102,floor:60,fppf:81.6, record:'21-5',  bust:false,tag:'anchor',    game:'Gomis vs Sabatini',        corr:'81.6 FPPF, 21-5. Solid anchor mid-salary.'},
    {name:'M. Tulio',fullName:'Mauricio Tulio',         pos:'F',sal:{dk:8900,fd:10700},opp:'vs Kopylov',       own:22,ceil:106,floor:58,fppf:95.5, record:'14-2',  bust:false,tag:'leverage',  game:'Tulio vs Kopylov',         corr:'95.5 FPPF at 22% own. Best leverage upper mid.'},
    {name:'J. Ochoa',fullName:'Jesus Ochoa',         pos:'F',sal:{dk:8800,fd:10600},opp:'vs Carpenter',     own:12,ceil:88, floor:48,fppf:51.7, record:'8-2',   bust:false,tag:'value',     game:'Ochoa vs Carpenter',       corr:'51.7 FPPF. Upside play at low ownership.'},
    {name:'T. Taira',fullName:'Tatsuro Taira',         pos:'F',sal:{dk:8700,fd:10500},opp:'vs Van',           own:48,ceil:112,floor:64,fppf:99.5, record:'18-1',  bust:false,tag:'chalk',     game:'Taira vs Van',             corr:'99.5 FPPF, 18-1. 5-round fight vs champion. Heavy chalk.'},
    {name:'A. Volkov',fullName:'Alexander Volkov',        pos:'F',sal:{dk:8600,fd:10400},opp:'vs Cortes Acosta', own:24,ceil:92, floor:52,fppf:74.5, record:'39-11', bust:false,tag:'value',     game:'Cortes Acosta vs Volkov',  corr:'74.5 FPPF, 39-11 veteran. Value at price.'},
    {name:'Y. Amosov',fullName:'Yaroslav Amosov',        pos:'F',sal:{dk:8500,fd:10200},opp:'vs Alvarez',       own:34,ceil:108,floor:62,fppf:102.9,record:'29-1',  bust:false,tag:'anchor',    game:'Amosov vs Alvarez',        corr:'102.9 FPPF, 29-1. Elite anchor mid-salary.'},
    {name:'S. Brady',fullName:'Sean Brady',         pos:'F',sal:{dk:8400,fd:10100},opp:'vs Buckley',       own:20,ceil:98, floor:54,fppf:93.4, record:'18-2',  bust:false,tag:'leverage',  game:'Buckley vs Brady',         corr:'93.4 FPPF at 20% own vs 36% Buckley. Best leverage.'},
    {name:'G. Dawson',fullName:'Gunnar Dawson',        pos:'F',sal:{dk:8300,fd:10000},opp:'vs Rebecki',       own:26,ceil:94, floor:52,fppf:86.8, record:'23-3',  bust:false,tag:'value',     game:'Rebecki vs Dawson',        corr:'86.8 FPPF, 23-3. Good value at salary.'},
    {name:'M. Rebecki',fullName:'Mateusz Rebecki',       pos:'F',sal:{dk:7900,fd:9500}, opp:'vs Dawson',        own:18,ceil:90, floor:48,fppf:86.8, record:'20-4',  bust:false,tag:'leverage',  game:'Rebecki vs Dawson',        corr:'86.8 FPPF at 18% own vs 26% Dawson. Underpriced.'},
    {name:'J. Buckley',fullName:'Joaquin Buckley',       pos:'F',sal:{dk:7800,fd:9400}, opp:'vs Brady',         own:36,ceil:88, floor:48,fppf:69.7, record:'21-7',  bust:false,tag:'chalk',     game:'Buckley vs Brady',         corr:'69.7 FPPF. Popular pick vs Brady underdog.'},
    {name:'J. Alvarez',fullName:'Jose Alvarez',       pos:'F',sal:{dk:7700,fd:9300}, opp:'vs Amosov',        own:10,ceil:86, floor:42,fppf:81.4, record:'23-3',  bust:false,tag:'contrarian',game:'Amosov vs Alvarez',        corr:'81.4 FPPF at 10% own vs Amosov chalk. Real upset.'},
    {name:'W. Cortes Acosta',fullName:'Williams Cortes Acosta', pos:'F',sal:{dk:7600,fd:9100}, opp:'vs Volkov',        own:16,ceil:88, floor:44,fppf:80.8, record:'17-2',  bust:false,tag:'leverage',  game:'Cortes Acosta vs Volkov',  corr:'80.8 FPPF, 17-2 at 16% own vs 24% Volkov.'},
    {name:'J. Van',fullName:'Josh Van',           pos:'F',sal:{dk:9100,fd:10900},opp:'vs Taira',         own:52,ceil:108,floor:52,fppf:100.7,record:'16-2',  bust:false,tag:'chalk',     game:'Taira vs Van',             corr:'100.7 FPPF. CHAMPION in 5-round fight. 44%+ ownership. Not a leverage play — this is justified chalk. Pair with Taira faders for leverage.'},
    {name:'C. Carpenter',fullName:'Cody Carpenter',     pos:'F',sal:{dk:7400,fd:8900}, opp:'vs Ochoa',         own:12,ceil:80, floor:38,fppf:61.9, record:'8-2',   bust:false,tag:'value',     game:'Ochoa vs Carpenter',       corr:'61.9 FPPF at low own. GPP underdog.'},
    {name:'R. Kopylov',fullName:'Roman Kopylov',       pos:'F',sal:{dk:7300,fd:8800}, opp:'vs Tulio',         own:14,ceil:82, floor:40,fppf:65.1, record:'14-5',  bust:false,tag:'contrarian',game:'Tulio vs Kopylov',         corr:'65.1 FPPF at 14% own. Upset dart vs Tulio.'},
    {name:'W. Gomis',fullName:'William Gomis',         pos:'F',sal:{dk:7200,fd:8600}, opp:'vs Sabatini',      own:12,ceil:80, floor:36,fppf:61.0, record:'15-3',  bust:false,tag:'contrarian',game:'Gomis vs Sabatini',        corr:'61.0 FPPF at 12% own. GPP only.'},
    {name:'J. Stephens',fullName:'Jeremy Stephens',      pos:'F',sal:{dk:7000,fd:8400}, opp:'vs Green',         own:8, ceil:76, floor:32,fppf:53.2, record:'29-22', bust:false,tag:'contrarian',game:'Stephens vs Green',        corr:'53.2 FPPF. Veteran at minimum. GPP dart.'},
    {name:'J. Miller',fullName:'Jim Miller',        pos:'F',sal:{dk:6900,fd:8300}, opp:'vs Gordon',        own:10,ceil:78, floor:34,fppf:63.0, record:'38-19', bust:false,tag:'contrarian',game:'Gordon vs Miller',         corr:'63.0 FPPF, 38-19 at discount. GPP only.'},
    {name:'S. Strickland',fullName:'Sean Strickland',    pos:'F',sal:{dk:6700,fd:8000}, opp:'vs Chimaev',       own:18,ceil:82, floor:38,fppf:78.9, record:'30-7',  bust:false,tag:'contrarian',game:'Strickland vs Chimaev',    corr:'78.9 FPPF. 5-round main event underdog. If Strickland wins = massive leverage. 18% ownership justified.'},
    {name:'D. Santos',fullName:'Diego Santos',        pos:'F',sal:{dk:6600,fd:7900}, opp:'vs Susurkaev',     own:8, ceil:74, floor:30,fppf:66.9, record:'11-2',  bust:false,tag:'contrarian',game:'Santos vs Susurkaev',      corr:'66.9 FPPF at 8% own vs Susurkaev. Large dog.'},
    {name:'O. Diaz',fullName:'Ozzy Diaz',          pos:'F',sal:{dk:6400,fd:7700}, opp:'vs Gautier',       own:6, ceil:72, floor:28,fppf:43.9, record:'10-3',  bust:false,tag:'contrarian',game:'Gautier vs Diaz',          corr:'43.9 FPPF. Min salary. GPP only.'},
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
  {title:'UFC: Favorites -250 or Heavier with 90+ FPPF',
   record:'43-16',pct:73,color:'good',
   desc:'When a UFC fighter is priced at -250 or shorter AND has 90+ career FPPF, they cover DFS expectations 73% of the time. This week: Chimaev (126.7 FPPF, -370), Susurkaev (103.7 FPPF, -290), Taira (99.5 FPPF, -270), Amosov (102.9 FPPF, -290). All four fit this profile.',
   sample:'3-year sample · 59 fights'},

  {title:'UFC: Reverse Line Movement — Sharp Side Win Rate',
   record:'38-18',pct:68,color:'good',
   desc:'When sharp money percentage significantly exceeds public bet percentage (15+ point gap), the sharp side wins outright 68% of the time. This week the clearest signals are Tulio (30-point gap), Brady (24-point gap), and Susurkaev (19-point gap). Follow the money, not the crowd.',
   sample:'2-year sample · 56 fights'},

  {title:'UFC: 5-Round Fights — Higher Variance, Higher Upside',
   record:'N/A',pct:0,color:'neutral',
   desc:'Championship and main event 5-round fights score 40% more fantasy points on average than 3-round fights because of more round scoring, more significant strikes recorded, and longer potential for finish bonuses. This week: Chimaev vs Strickland and Van vs Taira are both 5-round bouts — weight your anchors from these fights.',
   sample:'Informational · not a win rate'},

  {title:'NBA Playoffs: Reverse Line Movement Cover Rate',
   record:'37-18',pct:67,color:'good',
   desc:'In the NBA playoffs, when the sharp money percentage exceeds the public bet percentage by 15+ points, the sharp side covers 67% of the time. Tonight: Thunder have 62% of dollars vs only 43% of bets. Knicks have 64% of dollars vs only 36% of bets. Both are strong RLM signals.',
   sample:'5 playoff cycles · 55 games'},

  {title:'NBA Playoffs: Teams 5+ ATS in Last 5 Playoff Games',
   record:'29-11',pct:73,color:'good',
   desc:'Teams on a 5-game ATS streak in the playoffs continue to cover 73% of the time in their next game. The market consistently underadjusts for playoff momentum. The Knicks enter tonight on exactly this streak.',
   sample:'5 playoff cycles · 40 situations'},

  {title:'MLB: Elite Starter ERA Under 2.00 Last 3 Starts',
   record:'34-15',pct:69,color:'good',
   desc:'When a starting pitcher carries an ERA under 2.00 over his last 3 starts, his team covers the moneyline 69% of the time. Glasnow enters tonight in this exact form against a Cardinals lineup that ranks 28th in strikeout rate vs right-handed pitching.',
   sample:'2 seasons · 49 games'},

  {title:'NHL Playoffs: Sharp Money on Road Dogs in Elimination',
   record:'22-10',pct:69,color:'good',
   desc:'When sharp money (60%+) loads on a team in an NHL playoff elimination game, that team covers 69% of the time regardless of public perception. Panthers tonight have 66% of sharp dollars — one of the highest readings of the playoffs.',
   sample:'5 playoff cycles · 32 games'},

  {title:'UFC: Underdog with 80+ FPPF — Outright Win Rate',
   record:'19-9',pct:68,color:'good',
   desc:'UFC underdogs priced between +130 and +220 who have 80+ career FPPF win outright 68% of the time across this sample. Brady (+160, 93.4 FPPF) and Van (+220, 108.2 FPPF) both fit this profile this week. Small bet on both is the correct play.',
   sample:'2-year sample · 28 fights'},
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
  {s:'UFC',p:'Chimaev ML -380', r:'LIVE'},
  {s:'UFC',p:'Susurkaev ML',    r:'LIVE'},
  {s:'UFC',p:'Tulio ML RLM',    r:'LIVE'},
  {s:'UFC',p:'Brady +165',      r:'LIVE'},
  {s:'NBA',p:'Thunder -6.5',    r:'WIN'},
  {s:'NBA',p:'Knicks ML +144',  r:'WIN'},
  {s:'MLB',p:'Dodgers ML',      r:'WIN'},
  {s:'NHL',p:'Panthers ML',     r:'WIN'},
  {s:'PGA',p:'Scheffler Top 5', r:'WIN'},
];

const ARTICLES = [
  {sport:'ufc',type:'ufc',locked:false,
   tag:'SLATE BREAKDOWN',time:'Today · 6 min read',
   title:'UFC 328 Full Betting Guide — Every Sharp Signal Explained',
   body:'<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">Main Event: Chimaev ML (-370)</h3><p>Khamzat Chimaev is 15-0 and the most dominant fighter in the sport right now. Both sharp money (72% of dollars) and public money (65% of bets) are aligned on him. When the whole market agrees, you take it and move on. Steam confirmed from -300 to -370. Bet 1.5 units.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Best Reverse Line Movement: Tulio ML (-230)</h3><p>This is the sharpest signal on the card. Only 35% of public bets are on Tulio but 65% of the dollars are on him. That 30-point gap between bets and money is the clearest indicator of sharp action on this slate. The public is fading Tulio, the sharps are not. Line moved from -180 to -230. Take it before it moves further.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Best Underdog Value: Brady ML (+160)</h3><p>Sean Brady is a grappling specialist. Buckley gets knocked out and struggles on the ground. Brady takes him down and controls the fight. 34% of bets on Brady but 58% of the money — sharps loading the underdog. Best plus-money value on the card.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Co-Main: Taira ML (-270) over Champion Van</h3><p>Tatsuro Taira is 18-1 and the sharp choice in this 5-round title fight. 56% of bets and 68% of dollars are on Taira. The market is clear. Van at +220 is the DFS leverage play — not the betting play. Bet Taira.</p><h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Safe Anchor: Amosov ML (-290)</h3><p>29-1 record. Both sharp and public aligned. Steam confirmed. Amosov should win this fight without much drama. Treat it like a short-priced chalk and size accordingly.</p>'},

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

const HC_PARLAYS = [
  {
    title:'UFC 328 Three-Fight Steam Parlay',
    legs:['Chimaev ML (-370)','Amosov ML (-290)','Susurkaev ML (-290)'],
    reasons:[
      'Steam confirmed — sharp AND public both on Chimaev. Market fully aligned.',
      '58% of bets AND 71% of dollars on Amosov. Two-way signal confirmed.',
      'Reverse line movement — only 42% of bets but 61% of dollars on Susurkaev.',
    ],
    combinedOdds:'+290',winProb:'27%',ev:'+5%',units:'0.25 units',
    rating:'HIGH VALUE',ratingColor:'var(--gold)',sport:'ufc',
    note:'Three independently confirmed sharp signals. All favorites. Small size — this is for upside, not your main bankroll.',
  },
  {
    title:'UFC 328 Best Two-Leg',
    legs:['Chimaev ML (-370)','Tulio ML (-230)'],
    reasons:[
      'Steam move — both sharp and public loading Chimaev.',
      'Most extreme reverse line movement on the card. 35% bets, 65% dollars.',
    ],
    combinedOdds:'+195',winProb:'41%',ev:'+7%',units:'0.5 units',
    rating:'HIGH VALUE',ratingColor:'var(--gold)',sport:'ufc',
    note:'Two strongest sharp signals on the card combined. Best two-leg UFC parlay.',
  },
  {
    title:'Sharp Reverse Line Movement Double',
    legs:['Thunder -6.5 (-110)','Knicks ML (+148)'],
    reasons:[
      'Classic RLM — 43% bets, 62% dollars on OKC. Public on Minnesota, sharps on OKC.',
      'Sharp steam — 36% bets, 64% dollars on Knicks. Line compressed +165 to +148.',
    ],
    combinedOdds:'+215',winProb:'34%',ev:'+8%',units:'0.5 units',
    rating:'HIGH VALUE',ratingColor:'var(--gold)',sport:'nba',
    note:'Two of the cleanest reverse line movement signals tonight. When you have two on the same night, parlay them.',
  },
  {
    title:'Upset Special — Underdogs Only',
    legs:['Brady ML (+160)','Van ML (+220)'],
    reasons:[
      '34% of bets but 58% of dollars on Brady. Sharps love the underdog here.',
      'Current UFC champion at +220 in a 5-round title fight. Real upset value.',
    ],
    combinedOdds:'+640',winProb:'11%',ev:'+2%',units:'0.1 units',
    rating:'LOTTERY TICKET',ratingColor:'var(--red2)',sport:'ufc',
    note:'Both underdogs with sharp backing. Minimum bet only — pure GPP separation play.',
  },
];
