const _SURL='https://nkqnzyipztancnskshsw.supabase.co';
const _SKEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW56eWlwenRhbmNuc2tzaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTcxNjAsImV4cCI6MjA5Mjc5MzE2MH0.CyiRaPPPhDwnCzIqxHF0ZpgGmTsh53TUMOvre93wLpo';

const STRIPE_PK = 'pk_test_51TOSmaRpuoMp8x76YvBeVKF3v4Fx9YOXwv75AvewAzdnc7HwJ3HRIGeOqksfjWQjRBY8Q1tcwz06HjPshV76wVny00cGKdC8ol';
const STRIPE_PRICES = {
  optimizer: 'price_1TTPDKRpuoMp8x76CCxiLvGe',
  wynnr:     'price_1TTPE4RpuoMp8x76pTFVPfK2',
  elite:     'price_1TTPEORpuoMp8x76Fy9tJVqN',
};

const PICKS = [];

const FM_PICKS = [];


const BI_TIERS = [
  {badge:'FREE\nMONEY',color:'#4db874',bg:'rgba(58,148,96,.14)',border:'rgba(58,148,96,.28)',name:'Free Money',desc:'High positive EV. Line is statistically off, sharp money confirms, CLV is strong. Max bet territory.',stats:[['Win rate','58%+'],['Bet size','2-3 units'],['EV','+8% or higher']]},
  {badge:'HIGH\nVALUE',color:'#c9a84c',bg:'rgba(201,168,76,.13)',border:'rgba(201,168,76,.28)',name:'High Value',desc:'Strong positive EV with data backing. Sharp money present. Your bread and butter plays.',stats:[['Win rate','54-58%'],['Bet size','1-2 units'],['EV','+3-8%']]},
  {badge:'STANDARD\nPLAY',color:'#4a88d8',bg:'rgba(48,96,160,.13)',border:'rgba(48,96,160,.28)',name:'Standard Play',desc:'Slightly positive EV. Worth a standard unit as part of a diversified approach.',stats:[['Win rate','52-54%'],['Bet size','1 unit'],['EV','+1-3%']]},
  {badge:'PARLAY\nPIECE',color:'#e09050',bg:'rgba(192,88,32,.13)',border:'rgba(192,88,32,.28)',name:'Parlay Piece',desc:'Good angle but too much juice alone. Use as a leg in small parlays only.',stats:[['Implied','65%+'],['Bet size','0.5 units'],['Use','Parlay only']]},
  {badge:'LOTTERY\nTICKET',color:'#d94040',bg:'rgba(176,48,48,.12)',border:'rgba(176,48,48,.26)',name:'Lottery Ticket',desc:'Negative EV but meaningful upset potential. Entertainment only. Never chase.',stats:[['Win rate','18-22%'],['Bet size','0.25 units max'],['EV','Negative']]},
];

const SHARP_DATA = [];


const LV_DATA = [];


const TODAY = new Date();
const todayDay = TODAY.getDay(); // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat

const BOOKS = {
  dk: { name:'DraftKings', cap:50000, sizes:{ufc:6,nba:8,nfl:9,mlb:10,nba_showdown:6}, minSal:4000 },
  fd: { name:'FanDuel',    cap:60000, sizes:{ufc:5,nba:7,nfl:9,mlb:9,nba_showdown:5},  minSal:4800 },
};

const SLATE_SCHEDULE = {
  ufc:[
    {id:'ufc_macau_530', label:'UFC Macau — May 30', name:'UFC Macau — May 30', date:'Sat 5/30 3:00 AM ET', book:'dk',
     fights:['Song Yadong vs Deiveson Figueiredo','Sergei Pavlovich vs Tallison Teixeira','Cody Haddon vs Aori Qileng','Jake Matthews vs Carlston Harris','Kai Asakura vs Cameron Smotherman','Zhang Mingyang vs Alonzo Menifield','Rei Tsuruya vs Luis Gurule','Jingnan Xiong vs Angela Hill','Luis Felipe Dias vs Yi Sak Lee','Alex Perez vs Su Mudaerji','Ding Meng vs Jose Henrique Souza','Rodrigo Vera vs Kangjie Zhu','Jaqueline Amorim vs Loma Lookboonmee']}
  ],
  nba:[{id:'nba_playoffs_26', label:'NBA Playoffs 2026', name:'NBA Playoffs 2026', date:'Various', book:'dk', fights:[]}],
  mlb:[{id:'mlb_today', label:'MLB Today', name:'MLB Today', date:'Tonight', book:'dk', fights:[]}],
};

const POOLS = {
  ufc:[
    {name:'Song Yadong', pos:'F',sal:{dk:9500,fd:11200},opp:'vs Deiveson Figueiredo',own:15,ceil:139.3,floor:64.7,fppf:99.52,record:'',bust:false,tag:'value',game:'Deiveson Figueiredo vs Song Yadong',corr:''},
    {name:'Sergei Pavlovich', pos:'F',sal:{dk:9400,fd:11100},opp:'vs Tallison Teixeira',own:15,ceil:137.1,floor:63.6,fppf:97.92,record:'',bust:false,tag:'value',game:'Sergei Pavlovich vs Tallison Teixeira',corr:''},
    {name:'Cody Haddon', pos:'F',sal:{dk:9300,fd:11000},opp:'vs Aori Qileng',own:15,ceil:130.6,floor:60.6,fppf:93.28,record:'',bust:false,tag:'value',game:'Aori Qileng vs Cody Haddon',corr:''},
    {name:'Jake Matthews', pos:'F',sal:{dk:9200,fd:10900},opp:'vs Carlston Harris',own:15,ceil:119.7,floor:55.6,fppf:85.49,record:'',bust:false,tag:'value',game:'Carlston Harris vs Jake Matthews',corr:''},
    {name:'Kai Asakura', pos:'F',sal:{dk:9000,fd:10600},opp:'vs Cameron Smotherman',own:15,ceil:120.8,floor:56.1,fppf:86.3,record:'',bust:false,tag:'value',game:'Cameron Smotherman vs Kai Asakura',corr:''},
    {name:'Zhang Mingyang', pos:'F',sal:{dk:8900,fd:10500},opp:'vs Alonzo Menifield',own:15,ceil:121.1,floor:56.2,fppf:86.52,record:'',bust:false,tag:'value',game:'Alonzo Menifield vs Zhang Mingyang',corr:''},
    {name:'Rei Tsuruya', pos:'F',sal:{dk:8800,fd:10400},opp:'vs Luis Gurule',own:15,ceil:114.7,floor:53.2,fppf:81.92,record:'',bust:false,tag:'value',game:'Luis Gurule vs Rei Tsuruya',corr:''},
    {name:'Jingnan Xiong', pos:'F',sal:{dk:8700,fd:10300},opp:'vs Angela Hill',own:15,ceil:116.5,floor:54.1,fppf:83.22,record:'',bust:false,tag:'value',game:'Angela Hill vs Jingnan Xiong',corr:''},
    {name:'Luis Felipe Dias', pos:'F',sal:{dk:8600,fd:10100},opp:'vs Yi Sak Lee',own:15,ceil:115.2,floor:53.5,fppf:82.27,record:'',bust:false,tag:'value',game:'Luis Felipe Dias vs Yi Sak Lee',corr:''},
    {name:'Alex Perez', pos:'F',sal:{dk:8500,fd:10000},opp:'vs Su Mudaerji',own:15,ceil:112.1,floor:52.1,fppf:80.08,record:'',bust:false,tag:'value',game:'Alex Perez vs Su Mudaerji',corr:''},
    {name:'Ding Meng', pos:'F',sal:{dk:8400,fd:9900},opp:'vs Jose Henrique Souza',own:15,ceil:105.5,floor:49.0,fppf:75.37,record:'',bust:false,tag:'value',game:'Ding Meng vs Jose Henrique Souza',corr:''},
    {name:'Rodrigo Vera', pos:'F',sal:{dk:8300,fd:9800},opp:'vs Kangjie Zhu',own:15,ceil:103.7,floor:48.1,fppf:74.07,record:'',bust:false,tag:'value',game:'Kangjie Zhu vs Rodrigo Vera',corr:''},
    {name:'Jaqueline Amorim', pos:'F',sal:{dk:8200,fd:9700},opp:'vs Loma Lookboonmee',own:15,ceil:95.9,floor:44.5,fppf:68.47,record:'',bust:false,tag:'value',game:'Jaqueline Amorim vs Loma Lookboonmee',corr:''},
    {name:'Loma Lookboonmee', pos:'F',sal:{dk:8000,fd:9400},opp:'vs Jaqueline Amorim',own:15,ceil:92.6,floor:43.0,fppf:66.13,record:'',bust:false,tag:'value',game:'Jaqueline Amorim vs Loma Lookboonmee',corr:''},
    {name:'Kangjie Zhu', pos:'F',sal:{dk:7900,fd:9300},opp:'vs Rodrigo Vera',own:15,ceil:93.9,floor:43.6,fppf:67.09,record:'',bust:false,tag:'value',game:'Kangjie Zhu vs Rodrigo Vera',corr:''},
    {name:'Jose Henrique Souza', pos:'F',sal:{dk:7800,fd:9200},opp:'vs Ding Meng',own:15,ceil:87.6,floor:40.7,fppf:62.57,record:'',bust:false,tag:'value',game:'Ding Meng vs Jose Henrique Souza',corr:''},
    {name:'Su Mudaerji', pos:'F',sal:{dk:7700,fd:9100},opp:'vs Alex Perez',own:15,ceil:81.9,floor:38.0,fppf:58.49,record:'',bust:false,tag:'value',game:'Alex Perez vs Su Mudaerji',corr:''},
    {name:'Yi Sak Lee', pos:'F',sal:{dk:7600,fd:9000},opp:'vs Luis Felipe Dias',own:15,ceil:77.2,floor:35.9,fppf:55.17,record:'',bust:false,tag:'value',game:'Luis Felipe Dias vs Yi Sak Lee',corr:''},
    {name:'Angela Hill', pos:'F',sal:{dk:7500,fd:8800},opp:'vs Jingnan Xiong',own:15,ceil:66.0,floor:30.7,fppf:47.17,record:'',bust:false,tag:'value',game:'Angela Hill vs Jingnan Xiong',corr:''},
    {name:'Luis Gurule', pos:'F',sal:{dk:7400,fd:8700},opp:'vs Rei Tsuruya',own:15,ceil:53.5,floor:24.8,fppf:38.22,record:'',bust:false,tag:'value',game:'Luis Gurule vs Rei Tsuruya',corr:''},
    {name:'Alonzo Menifield', pos:'F',sal:{dk:7300,fd:8600},opp:'vs Zhang Mingyang',own:15,ceil:50.4,floor:23.4,fppf:36.02,record:'',bust:false,tag:'value',game:'Alonzo Menifield vs Zhang Mingyang',corr:''},
    {name:'Cameron Smotherman', pos:'F',sal:{dk:7200,fd:8500},opp:'vs Kai Asakura',own:15,ceil:53.6,floor:24.9,fppf:38.3,record:'',bust:false,tag:'value',game:'Cameron Smotherman vs Kai Asakura',corr:''},
    {name:'Carlston Harris', pos:'F',sal:{dk:7000,fd:8300},opp:'vs Jake Matthews',own:15,ceil:50.5,floor:23.4,fppf:36.07,record:'',bust:false,tag:'value',game:'Carlston Harris vs Jake Matthews',corr:''},
    {name:'Aori Qileng', pos:'F',sal:{dk:6900,fd:8100},opp:'vs Cody Haddon',own:15,ceil:46.6,floor:21.7,fppf:33.32,record:'',bust:false,tag:'value',game:'Aori Qileng vs Cody Haddon',corr:''},
    {name:'Tallison Teixeira', pos:'F',sal:{dk:6800,fd:8000},opp:'vs Sergei Pavlovich',own:15,ceil:47.6,floor:22.1,fppf:34.03,record:'',bust:false,tag:'value',game:'Sergei Pavlovich vs Tallison Teixeira',corr:''},
    {name:'Deiveson Figueiredo', pos:'F',sal:{dk:6700,fd:7900},opp:'vs Song Yadong',own:15,ceil:45.3,floor:21.0,fppf:32.35,record:'',bust:false,tag:'value',game:'Deiveson Figueiredo vs Song Yadong',corr:''},
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

const TICKER_DATA=[];

// Daily articles are now loaded from Supabase (daily_content.articles).
// Evergreen strategy articles live in EVERGREEN_ARTICLES below.
// SEO blog posts are loaded from Supabase (blog_posts table).
const ARTICLES = [];

const EVERGREEN_ARTICLES = [
  {
    id:'ev_dfs_gpp', sport:'education', type:'education', locked:false,
    tag:'DFS STRATEGY', time:'Evergreen · 9 min read', pinned:true,
    title:'How to Build a Winning GPP Lineup in MMA DFS: A Game-Theory Walkthrough (UFC Macau)',
    body:`<h3 style="margin:0 0 10px;font-size:15px;font-weight:700;">Tournaments Are Won by Being Different, Not by Being Right</h3>
<p>The single biggest mistake in MMA DFS is building the lineup you think is most likely to score well. In a large-field GPP (guaranteed prize pool), thousands of entries are doing the same thing — which means the "best" lineup is also the most common one, and finishing where everyone else finishes wins nothing. The goal is not to be right. The goal is to be right in a way the field is wrong. That is game theory, and it is the entire foundation of tournament DFS.</p>
<p>Every fighter has two numbers that matter more than their projection: how often the field will roster them (field ownership) and how often they actually deserve to be rostered (merit ownership). The gap between those two is leverage. A fighter the field underrates is positive leverage — rostering them differentiates you when they hit. A fighter the field overrates is negative leverage — rostering them ties you to the pack. We will use the UFC Macau card as a live example throughout.</p>

<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Step 1: Read the Slate Before You Read the Fighters</h3>
<p>Start by asking what kind of slate this is. A card stacked with heavy favorites priced as studs is a "chalky" slate — ownership concentrates on a few obvious anchors, and edges are thin. A card full of pick-em fights is a "leverage-rich" slate — ownership spreads out and contrarian builds pay off. Macau is firmly the former: Song Yadong (-600), Sergei Pavlovich (-620), Cody Haddon (-391) and Jake Matthews (-430) are all both heavy favorites and high-salary. When the chalk is genuinely good, you do not blindly fade it — you anchor to it and find your differentiation elsewhere.</p>
<p>This is the first game-theory decision: on a chalky slate, your leverage comes from <em>how you fill the cheap and mid-tier spots</em>, not from fading the obvious studs. Fading a 82% favorite to be different is how you lose a tournament, not win one.</p>

<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Step 2: Turn Odds Into Win Probability (De-Vig)</h3>
<p>A moneyline is not a probability — it includes the book's margin (the "vig"). To get a fighter's true implied win chance, you de-vig the pair. Take both fighters' implied probabilities and normalize them so they sum to 100%. Pavlovich at -620 implies roughly 86%, but after removing the vig against Teixeira's price, his true win probability lands near 82%. That 82% is the number that should drive your thinking, not the raw -620.</p>
<p>Why it matters for DFS: win probability is the backbone of both scoring (you cannot score fantasy points if you lose) and ownership (the field over-rosters favorites by name recognition, not by de-vigged equity). The fighters where true probability and public perception diverge are where leverage lives.</p>

<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Step 3: Find the Leverage Plays</h3>
<p>On the Macau slate, the engine flags Sergei Pavlovich as the top leverage play — and notice he is a heavy favorite. That is not a contradiction. He projects as the single most reliable anchor (82% win, elite finishing rate), yet his ownership is not as high as his merit deserves because the field spreads money across several big favorites. He is chalk you actively want, which is rare and valuable.</p>
<p>Contrast that with the pure contrarian dart: Alonzo Menifield sits around 8% owned at roughly 30% to win. He will lose most of the time. But he carries real one-punch knockout power, and in the ~30% of worlds where he lands, almost no one else has him — that is tournament-winning leverage. You do not build around Menifield; you sprinkle him into one or two of your GPP entries as the differentiator that wins the whole thing when chalk busts.</p>

<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Step 4: Identify the Traps (Negative Leverage)</h3>
<p>Just as important as who to roster is who to avoid. On Macau, Rei Tsuruya and Loma Lookboonmee grade as the biggest fades: moderately high ownership but low finishing equity. The field rosters them because they are favored or familiar, but they win by decision more often than by finish — and in MMA DFS, finishes are where the ceiling points come from. A favorite who grinds out a decision can still tank your lineup relative to the field that paid up for finish upside elsewhere. These are negative-leverage chalk: high owned, low ceiling. Pivot off them.</p>

<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Step 5: Factor In Finish Equity (The MMA-Specific Edge)</h3>
<p>MMA scoring rewards finishes disproportionately — a first-round knockout can double the points of a decision win. So a fighter's ceiling is not just "will they win" but "will they finish." Finish equity combines win probability with finishing lean. Zhang Mingyang is the textbook case on this card: a heavy favorite who has finished all three of his prior UFC opponents. His finish equity is elite, which lifts both his ceiling and his leverage above what salary alone suggests. Always weight finishers over decision-grinders in GPP.</p>

<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Step 6: Read the Line Movement Into Lock</h3>
<p>Odds are not static. In the hours before lock, sharp money moves lines, and that movement is information. If a fighter is being steamed (line moving toward them across multiple books), the market is gaining confidence — that supports both their win probability and their merit ownership. If a line drifts the other way, the market is cooling on them. Tracking opening versus current line tells you which way the smart money leans right up to the deadline. On a card this chalky, a late steam toward an underdog is exactly the kind of signal that turns a contrarian dart into a justified leverage play.</p>

<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">Step 7: Build the Portfolio, Not the Lineup</h3>
<p>A single lineup is a bet on one outcome. A portfolio of lineups lets you express conviction while staying diversified. Anchor most entries to the leverage chalk (Pavlovich, Zhang, Asakura — favorites who are also good values), then differentiate the cheap and mid spots across entries. Reserve one or two entries for the contrarian shots (Menifield and similar) so that if chalk busts, you have a ticket that wins. Control your exposure: no single fighter should appear in so many entries that one bad result sinks your whole slate, unless you have genuine conviction.</p>

<h3 style="margin:16px 0 10px;font-size:15px;font-weight:700;">The Mental Model, Summarized</h3>
<p>Read the slate type first. De-vig the odds to get true probability. Roster favorites the field underrates (positive-leverage chalk). Sprinkle contrarian darts with real finish upside. Fade high-owned, low-finish decision fighters. Weight finishers. Read late line movement as a tiebreaker. Then build a portfolio that wins both when chalk holds and when it busts. Being different is not the goal — being correctly different is, and that is where game theory turns DFS from gambling into edge.</p>`
  },
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


const HC_PARLAYS = [];
