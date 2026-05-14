const _SURL='https://nkqnzyipztancnskshsw.supabase.co';
const _SKEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW56eWlwenRhbmNuc2tzaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTcxNjAsImV4cCI6MjA5Mjc5MzE2MH0.CyiRaPPPhDwnCzIqxHF0ZpgGmTsh53TUMOvre93wLpo';

const STRIPE_PK = 'pk_live_51TOSmORpcu01FeYCIuWJSFUi5yhSIFSre9M1fME6uYtRuxVD4WAr2SI9f5BljMPTtHIvBWaXamSIiuILFW1FZn6P00vAZcbqEU';
const STRIPE_PRICES = {
  optimizer: 'price_1TWQmGRpcu01FeYCQDaUd2mR',
  wynnr:     'price_1TWQn9Rpcu01FeYCrDBf60pc',
  elite:     'price_1TWQnTRpcu01FeYCD9ksB2aY',
};

const STRIPE_PAYMENT_LINKS = {
  optimizer: 'https://buy.stripe.com/eVq00l63icnKcsz1Jt33W00',
  wynnr:     'https://buy.stripe.com/6oU7sNbnCfzWbov3RB33W01',
  elite:     'https://buy.stripe.com/bJefZj3VabjGeAH87R33W02',
};

const PICKS = [
  // UFC Fight Night: Allen vs Costa · Sat May 16
  {sport:'ufc',matchup:'Allen vs Costa',call:'Allen ML',
   why:'Allen -188 justified. Five-round fight plays to his strengths — volume, footwork, championship cardio. 20-4, never been stopped. Sharp money moved line from -154 to -188 on pure action. Anchor bet.',
   rating:'HIGH VALUE',units:'1.5u',tier:'free'},
  {sport:'ufc',matchup:'Allen vs Costa',call:'Over 4.5 rounds',
   why:'Allen is a decision machine — 5 of last 6 went to a decision. Costa fades past round 3. Sharp money hammered this Over all week, line moved -130 to -166. Both signals aligned.',
   rating:'FREE MONEY',units:'2u',tier:'wynnr'},
  {sport:'ufc',matchup:'Allen vs Costa',call:'Costa +ML',
   why:'Contrarian GPP dart. Costa +155 with 6-fight win streak and two first-round finishes. Chute Boxe striker with elite power. If he lands clean early this is over. Small action only.',
   rating:'LEAN',units:'0.5u',tier:'wynnr'},

  // NBA Playoffs · Second Round
  {sport:'nba',matchup:'Pistons vs Cavaliers',call:'Cavaliers +4.5',
   why:'Cavs won 3 straight after going down 0-2. Mitchell is locked in. Detroit has Huerter, LeVert and Robinson all questionable. Sharp money on Cleveland. Take the points.',
   rating:'HIGH VALUE',units:'1.5u',tier:'free'},
  {sport:'nba',matchup:'Spurs vs Timberwolves',call:'Spurs -10.5',
   why:'Wembanyama back and motivated after ejection. SA leads series 3-2, at home. Only 41% of bets on Spurs but 73% of sharp dollars. Massive RLM. Lay the number.',
   rating:'HIGH VALUE',units:'1.5u',tier:'wynnr'},
  {sport:'nba',matchup:'Pistons vs Cavaliers',call:'Over 211.5',
   why:'Over hit in 2 straight in this series. Both teams up-tempo. Mitchell and Cunningham both projected 26+ points. Pace increases in elimination scenarios.',
   rating:'LEAN',units:'1u',tier:'wynnr'},

  // NBA Futures
  {sport:'nba',matchup:'2026 NBA Finals',call:'Thunder to win title',
   why:'OKC swept the Lakers, 8-0 in playoffs. Jalen Williams getting healthy. Best team top to bottom. -165 is still value for a team this dominant. Lock a position now before -200.',
   rating:'HIGH VALUE',units:'1u',tier:'wynnr'},

  // MLB
  {sport:'mlb',matchup:'Dodgers vs Cubs',call:'Dodgers ML',
   why:'Ohtani confirmed in lineup after rest day. Cubs bullpen ranked 28th in ERA over last 2 weeks. Steam move confirmed — line moved -145 to -160 on sharp action. Take LA.',
   rating:'HIGH VALUE',units:'1u',tier:'free'},
  {sport:'mlb',matchup:'Yankees vs Red Sox',call:'Yankees ML',
   why:'Line flipped from +105 to -110 — massive move on sharp action alone. 67% of sharp dollars on Yankees despite public split. Boston bullpen struggles in primetime. Follow the money.',
   rating:'FREE MONEY',units:'1.5u',tier:'wynnr'},
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
  {game:'Allen vs Costa',
   sub:'UFC Vegas 117 · Main Event · Sat 5/16 8:00 PM ET',
   pub:52, sharp:71, move:'-154 to -188',
   sig:'rlm', sigText:'RLM',
   note:'52% of bets on Allen but 71% of sharp dollars. Classic reverse line movement. Line jumped from -154 to -188 on sharp action alone. Public split, sharps all-in on Allen.'},
  {game:'Allen vs Costa',
   sub:'UFC Vegas 117 · Over 4.5 rounds · Sat 5/16',
   pub:44, sharp:68, move:'-130 to -166',
   sig:'rlm', sigText:'RLM',
   note:'Public split on the total but 68% of sharp dollars on Over. Line moved -130 to -166. Five-round main event with a decision specialist — sharps see this going the distance.'},
  {game:'Cavaliers vs Pistons',
   sub:'NBA Playoffs · Game 6 · Fri 5/15 7:00 PM ET',
   pub:57, sharp:63, move:'+4.5 to +4',
   sig:'hot', sigText:'STEAM',
   note:'57% of bets AND 63% of dollars on Cavs +4.5. Public and sharps aligned. Mitchell locked in, Detroit has 3 starters questionable. Line movement confirms — take Cleveland.'},
  {game:'Spurs vs Timberwolves',
   sub:'NBA Playoffs · Game 6 · Fri 5/15 9:30 PM ET',
   pub:41, sharp:73, move:'-9.5 to -10.5',
   sig:'rlm', sigText:'RLM',
   note:'Only 41% of bets on Spurs but 73% of sharp dollars. Wembanyama at home, motivated. Line jumped a full point on sharp action. Textbook RLM — follow the money.'},
  {game:'Dodgers vs Cubs',
   sub:'MLB · Sat 5/16 4:05 PM ET',
   pub:62, sharp:68, move:'-145 to -160',
   sig:'hot', sigText:'STEAM',
   note:'62% of bets and 68% of dollars on LA. Ohtani in lineup. Cubs bullpen is a liability. Steam move confirmed. Public and sharps both on the Dodgers.'},
  {game:'Yankees vs Red Sox',
   sub:'MLB · Fri 5/15 7:05 PM ET',
   pub:48, sharp:67, move:'+105 to -110',
   sig:'rlm', sigText:'RLM',
   note:'Public split but 67% of sharp dollars on Yankees. Line flipped from +105 to -110 — one of the biggest moves of the week. Sharp money does not lie on a line flip this dramatic.'},
  {game:'OKC Thunder',
   sub:'NBA Futures · 2026 Championship',
   pub:55, sharp:70, move:'-145 to -175',
   sig:'hot', sigText:'STEAM',
   note:'Sharps hammering Thunder futures all playoff run. 8-0 in postseason, swept the Lakers. Line moved from -145 to -175. Lock in before -200.'},
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
    // UFC Fight Night: Allen vs Costa — 5/16/2026 — DK $300K — $50K cap, pick 6
    {name:'M. Wellmaker',  fullName:'Mason Wellmaker',    pos:'F',sal:{dk:9200,fd:11000},opp:'vs Diaz',          own:28,ceil:120,floor:55,fppf:82.2, record:'10-1', bust:false,tag:'anchor',    game:'Diaz vs Wellmaker',        corr:'82.2 FPPF, 10-1. Top salary anchor. Strong finish upside.'},
    {name:'T. Gantt',      fullName:'Thomas Gantt',       pos:'F',sal:{dk:9100,fd:10800},opp:'vs Minev',         own:22,ceil:110,floor:25,fppf:0,    record:'0-0',  bust:true, tag:'contrarian',game:'Minev vs Gantt',           corr:'UFC debut. Zero data. High variance GPP dart only.'},
    {name:'N. Caliari',    fullName:'Nicolas Caliari',    pos:'F',sal:{dk:9000,fd:10700},opp:'vs Bannon',        own:31,ceil:115,floor:60,fppf:36.1, record:'8-4',  bust:false,tag:'chalk',    game:'Caliari vs Bannon',        corr:'36.1 FPPF. Chalk at this price. Solid but limited upside.'},
    {name:'A. Petroski',   fullName:'Andre Petroski',     pos:'F',sal:{dk:8900,fd:10500},opp:'vs Brundage',      own:26,ceil:125,floor:65,fppf:62.2, record:'13-5', bust:false,tag:'anchor',   game:'Petroski vs Brundage',     corr:'62.2 FPPF is elite at this salary. Brundage gets finished.'},
    {name:'I. Erslan',     fullName:'Ikram Erslan',       pos:'F',sal:{dk:8800,fd:10400},opp:'vs Tokkos',        own:24,ceil:110,floor:50,fppf:22.3, record:'14-6', bust:false,tag:'value',    game:'Erslan vs Tokkos',         corr:'22.3 FPPF concerns but experience edge. Late rounds advantage.'},
    {name:'A. Ardelean',   fullName:'Alexandru Ardelean', pos:'F',sal:{dk:8700,fd:10300},opp:'vs Viana',         own:29,ceil:120,floor:60,fppf:71.2, record:'11-7', bust:false,tag:'leverage', game:'Viana vs Ardelean',        corr:'71.2 FPPF elite efficiency. Sharp play vs Viana chalk.'},
    {name:'A. Allen',      fullName:'Arnold Allen',       pos:'F',sal:{dk:8600,fd:10200},opp:'vs Costa',         own:38,ceil:130,floor:70,fppf:62.3, record:'20-4', bust:false,tag:'anchor',   game:'Costa vs Allen',           corr:'MAIN EVENT. -188 favorite. 20-4. Never stopped. 5-round fight. Sharp money confirmed.'},
    {name:'J. Cavalcanti', fullName:'John Cavalcanti',    pos:'F',sal:{dk:8500,fd:10000},opp:'vs Vieira',        own:22,ceil:115,floor:55,fppf:67.4, record:'10-1', bust:false,tag:'leverage', game:'Cavalcanti vs Vieira',     corr:'67.4 FPPF. 10-1 record. RLM on Cavalcanti this week.'},
    {name:'B. Sopaj',      fullName:'Besnik Sopaj',       pos:'F',sal:{dk:8400,fd:9900}, opp:'vs Cuamba',        own:18,ceil:120,floor:55,fppf:70.3, record:'12-3', bust:false,tag:'leverage', game:'Sopaj vs Cuamba',          corr:'70.3 FPPF at only 18% ownership. Leverage monster.'},
    {name:'D. Santos',     fullName:'Daniel Santos',      pos:'F',sal:{dk:8400,fd:9900}, opp:'vs Choi',          own:34,ceil:125,floor:65,fppf:91.6, record:'14-2', bust:false,tag:'anchor',   game:'Santos vs Choi',           corr:'91.6 FPPF best raw projection. Chalk but justified.'},
    {name:'K. Williams',   fullName:'Kevin Williams',     pos:'F',sal:{dk:8300,fd:9800}, opp:'vs Veretennikov',  own:21,ceil:115,floor:50,fppf:71.4, record:'15-5', bust:false,tag:'value',    game:'Williams vs Veretennikov', corr:'71.4 FPPF at $8,300. Great value. Knockout power.'},
    {name:'M. Bukauskas',  fullName:'Modestas Bukauskas', pos:'F',sal:{dk:8300,fd:9800}, opp:'vs Edwards',       own:22,ceil:115,floor:55,fppf:50.7, record:'19-7', bust:false,tag:'value',    game:'Edwards vs Bukauskas',     corr:'50.7 FPPF. 19-7 experience vs unknown replacement.'},
    {name:'D. Barez',      fullName:'Diego Barez',        pos:'F',sal:{dk:8200,fd:9700}, opp:'vs Gurule',        own:16,ceil:110,floor:45,fppf:35.8, record:'17-7', bust:false,tag:'contrarian',game:'Gurule vs Barez',          corr:'35.8 FPPF but 16% ownership. Pure leverage underdog.'},
    {name:'L. Gurule',     fullName:'Lucas Gurule',       pos:'F',sal:{dk:8000,fd:9500}, opp:'vs Barez',         own:19,ceil:105,floor:40,fppf:24.7, record:'10-3', bust:false,tag:'contrarian',game:'Gurule vs Barez',          corr:'24.7 FPPF. Low ownership means leverage if he wins.'},
    {name:'N. Veretennikov',fullName:'Nikita Veretennikov',pos:'F',sal:{dk:7900,fd:9300},opp:'vs Williams',      own:14,ceil:105,floor:35,fppf:42.6, record:'14-7', bust:false,tag:'contrarian',game:'Williams vs Veretennikov', corr:'42.6 FPPF at 14% ownership. GPP leverage vs Williams chalk.'},
    {name:'K. Vieira',     fullName:'Ketlen Vieira',      pos:'F',sal:{dk:7700,fd:9100}, opp:'vs Cavalcanti',    own:18,ceil:110,floor:40,fppf:62.5, record:'15-5', bust:false,tag:'value',    game:'Cavalcanti vs Vieira',     corr:'62.5 FPPF at $7,700. Upset potential vs Cavalcanti chalk.'},
    {name:'T. Cuamba',     fullName:'Tresean Cuamba',     pos:'F',sal:{dk:7800,fd:9200}, opp:'vs Sopaj',         own:16,ceil:105,floor:40,fppf:57.4, record:'10-3', bust:false,tag:'value',    game:'Sopaj vs Cuamba',          corr:'57.4 FPPF at $7,800. Leverage if Sopaj chalk is overowned.'},
    {name:'D. Choi',       fullName:'Dooho Choi',         pos:'F',sal:{dk:7800,fd:9200}, opp:'vs Santos',        own:29,ceil:120,floor:40,fppf:74.8, record:'16-4', bust:false,tag:'chalk',    game:'Santos vs Choi',           corr:'74.8 FPPF and 29% ownership. Popular chalk. Massive KO upside.'},
    {name:'M. Costa',      fullName:'Melquizael Costa',   pos:'F',sal:{dk:7600,fd:9000}, opp:'vs Allen',         own:42,ceil:135,floor:30,fppf:80.0, record:'26-7', bust:true, tag:'chalk',    game:'Costa vs Allen',           corr:'MAIN EVENT underdog. 42% ownership as +155 dog. High bust risk.'},
    {name:'P. Viana',      fullName:'Pedro Viana',        pos:'F',sal:{dk:7500,fd:8900}, opp:'vs Ardelean',      own:15,ceil:110,floor:40,fppf:53.4, record:'13-8', bust:false,tag:'value',    game:'Viana vs Ardelean',        corr:'53.4 FPPF at 15% ownership. Fade Ardelean chalk, stack Viana.'},
    {name:'T. Tokkos',     fullName:'Themba Tokkos',      pos:'F',sal:{dk:7400,fd:8800}, opp:'vs Erslan',        own:12,ceil:100,floor:35,fppf:51.2, record:'11-5', bust:false,tag:'contrarian',game:'Erslan vs Tokkos',         corr:'51.2 FPPF at 12% ownership. GPP differentiator if he wins.'},
    {name:'C. Brundage',   fullName:'Chris Brundage',     pos:'F',sal:{dk:7300,fd:8700}, opp:'vs Petroski',      own:10,ceil:95, floor:30,fppf:48.5, record:'11-9', bust:false,tag:'contrarian',game:'Petroski vs Brundage',     corr:'48.5 FPPF at 10% ownership. Petroski chalk is overowned.'},
    {name:'S. Bannon',     fullName:'Sean Bannon',        pos:'F',sal:{dk:7200,fd:8600}, opp:'vs Caliari',       own:13,ceil:95, floor:30,fppf:54.9, record:'7-2',  bust:false,tag:'value',    game:'Caliari vs Bannon',        corr:'54.9 FPPF at $7,200. Finishing ability. Good value.'},
    {name:'A. Minev',      fullName:'Artur Minev',        pos:'F',sal:{dk:7100,fd:8400}, opp:'vs Gantt',         own:8, ceil:100,floor:25,fppf:0,    record:'0-0',  bust:true, tag:'contrarian',game:'Minev vs Gantt',           corr:'UFC debut replacement. Zero data. Avoid.'},
    {name:'J. Diaz',       fullName:'Julian Diaz',        pos:'F',sal:{dk:7000,fd:8300}, opp:'vs Wellmaker',     own:11,ceil:95, floor:25,fppf:0,    record:'0-0',  bust:true, tag:'contrarian',game:'Diaz vs Wellmaker',        corr:'Replacement fighter. No UFC data. GPP only.'},
    {name:'C. Edwards',    fullName:'Christian Edwards',  pos:'F',sal:{dk:6900,fd:8200}, opp:'vs Bukauskas',     own:9, ceil:90, floor:20,fppf:0,    record:'0-0',  bust:true, tag:'contrarian',game:'Edwards vs Bukauskas',     corr:'Minimum salary replacement. Pure GPP dart.'},
  ],
  nba:[],
  mlb:[],
  nfl:[],
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
  {title:'UFC: 5-Round Main Event Favorites (-150 or Shorter)',
   record:'38-14',pct:73,color:'good',
   desc:'Main event favorites priced -150 or shorter in 5-round UFC fights cover DFS expectations 73% of the time. This week: Allen (-188) is a perfect fit.'},
  {title:'UFC: Never-Stopped Fighters vs Previously Finished Opponents',
   record:'29-8',pct:78,color:'best',
   desc:'Fighters who have never been stopped vs opponents who have been finished before cover 78% of the time. Allen (never stopped) vs Costa (submitted and KO previously).'},
  {title:'NBA Playoffs: Home Teams After Must-Win Game',
   record:'44-19',pct:70,color:'good',
   desc:'NBA playoff home teams coming off a must-win elimination game cover 70% of the time next game. San Antonio won Game 5 on the road and returns home for Game 6.'},
  {title:'NBA Playoffs: 3+ Injury Reports vs Healthy Opponents',
   record:'12-31',pct:28,color:'bad',
   desc:'Playoff teams with 3+ questionable/out designations against healthy opponents cover only 28% of the time. Detroit enters Game 6 with Huerter, LeVert, Robinson all questionable.'},
  {title:'MLB: Ohtani Confirmed in Lineup — Dodgers Home',
   record:'22-9',pct:71,color:'good',
   desc:'When Shohei Ohtani is confirmed in the lineup for a Dodgers home game after a rest day, LA covers 71% of the time this season. Active signal for Saturday.'},
  {title:'RLM Signal Win Rate (All Sports)',
   record:'156-62',pct:72,color:'best',
   desc:'When a team/fighter has less than 55% of public bets but over 65% of sharp dollars, the sharp side covers 72% of the time. Active: Allen UFC, Spurs NBA, Yankees MLB.'},
];

const PATTERNS_DATA = [
  {title:'Sharp Money Divergence',icon:'🔀',color:'var(--gold)',
   desc:'When public bet% and sharp dollar% point different directions, follow the money. Sharp bettors are profitable long-term. Public bettors are not.'},
  {title:'Line Movement Analysis',icon:'📈',color:'var(--green2)',
   desc:'A line that moves toward a team despite heavy public betting against them signals sharp action. The bigger the move, the stronger the signal.'},
  {title:'Steam Moves',icon:'♨️',color:'var(--red2)',
   desc:'Rapid line movement across multiple books simultaneously. Sharp syndicates hitting simultaneously. Highest confidence signal in sports betting.'},
  {title:'Reverse Line Movement',icon:'↩️',color:'var(--gold)',
   desc:'Line moves opposite to public betting percentage. Public on Team A but line moves toward Team B = sharps loading Team B. Follow the line, not the public.'},
  {title:'Closing Line Value',icon:'🎯',color:'var(--green2)',
   desc:'Beating the closing line is the best predictor of long-term profitability. Get the best number early when sharp action is identified.'},
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
  {id:'ufc-vegas-117-breakdown',
   title:'UFC Vegas 117: Allen vs Costa Full Breakdown',
   sport:'ufc', tag:'DFS + BETTING',
   date:'May 14, 2026', tier:'free',
   summary:'Arnold Allen enters as a -188 favorite with sharp money confirming the play. Here is everything you need to know for Saturday.',
   body:'Arnold Allen vs Melquizael Costa is one of the cleaner spots on this slate. Sharp money moved Allen from -154 to -188 on pure sharp action — only 52% of public bets but 71% of sharp dollars. Textbook RLM. Allen is 20-4 and has never been stopped. Five-round main event plays to his strengths. The Over 4.5 rounds at -166 is the correlated play — both signals point the same direction. Allen wins a decision.'},
  {id:'nba-playoffs-sharp-report',
   title:'NBA Playoff Sharp Money Report: Weekend Edition',
   sport:'nba', tag:'BETTING',
   date:'May 14, 2026', tier:'free',
   summary:'Two clear sharp money plays heading into the NBA playoff weekend. Cavs and Spurs both have strong RLM signals.',
   body:'CAVALIERS +4.5 — Mitchell is locked in, Detroit has 3 starters questionable. Sharp money on Cleveland despite public on Detroit. Take the points. SPURS -10.5 — Wembanyama at home after the ejection game. 73% of sharp dollars on San Antonio vs only 41% of public bets. Line jumped a full point on sharp action. Massive RLM. Lay the number. THUNDER FUTURES at -165 — 8-0 in playoffs, best team standing. Lock in before this hits -200.'},
  {id:'ufc-vegas-117-dfs-guide',
   title:'UFC Vegas 117 DFS Guide: How to Attack This Slate',
   sport:'ufc', tag:'DFS',
   date:'May 14, 2026', tier:'wynnr',
   summary:'Full DFS breakdown for the Allen vs Costa card. Cash plays, GPP leverage, and who to avoid.',
   body:'CASH PLAYS: Petroski ($8,900) — 62.2 FPPF vs Brundage. Allen ($8,600) — main event, five rounds, never stopped. Santos ($8,400) — 91.6 FPPF, best raw projection. GPP LEVERAGE: Sopaj ($8,400) — 70.3 FPPF at 18% ownership. Ardelean ($8,700) — 71.2 FPPF underpriced. Vieira ($7,700) — 62.5 FPPF at value salary. AVOID: Costa ($7,600) — 42% ownership as an underdog. Gantt ($9,100) — UFC debut at second-highest salary, zero data.'},
  {id:'sharp-money-explained',
   title:'What is Sharp Money and Why It Matters',
   sport:'general', tag:'EDUCATION',
   date:'May 14, 2026', tier:'free',
   summary:'Understanding sharp money is the single biggest edge you can have as a sports bettor. Here is how it works.',
   body:'Sharp money refers to bets placed by professional, winning sports bettors — also called sharps or wiseguys. Books track sharp action separately from public action because sharp bettors are profitable long-term while public bettors are not. When you see reverse line movement — a line moving toward a team despite heavy public betting against them — that is sharp money at work. The sharps are betting the other side so aggressively that the book moves the line despite losing public action. At OnlyWynnrs we track this divergence daily and surface the clearest signals for every major sport.'},
];

const HC_PARLAYS = [
  {name:'Sharp 3-Team Value Parlay',
   legs:['Allen ML (-188)','Spurs -10.5 (-115)','Dodgers ML (-160)'],
   odds:'+285', units:'0.5u', tier:'wynnr',
   why:'Three plays with confirmed sharp signals all on the same side. Allen RLM, Spurs RLM, Dodgers steam. All pointing the same direction. Pays +285 for a 0.5u ticket.'},
  {name:'NBA Playoff Same-Game Parlay',
   legs:['Cavaliers +4.5','Cavaliers vs Pistons Over 211.5'],
   odds:'+175', units:'0.25u', tier:'wynnr',
   why:'Both signals aligned on the Cavs game. Mitchell goes off, game is high scoring, Cleveland covers. Correlated SGP pays +175.'},
  {name:'UFC Decision + Over Parlay',
   legs:['Allen ML (-188)','Over 4.5 rounds (-166)'],
   odds:'+180', units:'0.5u', tier:'elite',
   why:'Allen wins a decision after 5 rounds — both legs cash the same way. Sharp money on both sides of this parlay. Pays +180.'},
  {name:'MLB Sharp Money 2-Team',
   legs:['Dodgers ML (-160)','Yankees ML (-110)'],
   odds:'+210', units:'0.25u', tier:'wynnr',
   why:'Both MLB games have confirmed sharp signals. Steam on LA, RLM on New York. Two-teamer pays +210 for a small dart.'},
];
