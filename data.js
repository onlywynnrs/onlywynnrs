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

const BOOKS = {
  dk: { name:'DraftKings', cap:50000, sizes:{ufc:6,nba:8,nfl:9,mlb:10,nba_showdown:6}, minSal:4000 },
  fd: { name:'FanDuel',    cap:60000, sizes:{ufc:5,nba:7,nfl:9,mlb:9,nba_showdown:5},  minSal:4800 },
};

const SLATE_SCHEDULE = {
  ufc:[
    {id:'ufc-vegas-117', label:'UFC Vegas 117 — May 16', date:'Sat 5/16 2:00 PM ET', book:'dk',
     days:['Sat'],
     games:['Caliari vs Bannon','Gurule vs Barez','Viana vs Ardelean','Petroski vs Brundage',
            'Cavalcanti vs Vieira','Minev vs Gantt','Erslan vs Tokkos','Williams vs Veretennikov',
            'Sopaj vs Cuamba','Edwards vs Bukauskas','Diaz vs Wellmaker','Santos vs Choi','Costa vs Allen'],
     mainEvent:'Costa vs Allen'},
  ],
  nba:[],
  mlb:[],
  nfl:[],
};

FM_PICKS = [
  {sport:'ufc',matchup:'Allen vs Costa',call:'Allen ML',
   why:'Sharp money moved Allen from -154 to -188. Only 52% of public bets but 71% of sharp dollars. Textbook RLM. Allen is 20-4, never been stopped. Five-round main event plays to his strengths. Back the experience.',
   odds:'-188',time:'Sat 5/16 8:00 PM ET',rating:'FREE',units:'1.5 units',ev:'+7%',winProb:'65%',lineMove:'-154 to -188'},
  {sport:'ufc',matchup:'Allen vs Costa',call:'Over 4.5 rounds',
   why:'Allen is a decision machine. 5 of his last 6 fights went the distance. Costa fades past round 3. Sharp money hammered this all week — line moved -130 to -166. Both signals aligned.',
   odds:'-166',time:'Sat 5/16 8:00 PM ET',rating:'FREE',units:'2 units',ev:'+9%',winProb:'62%',lineMove:'-130 to -166'},
  {sport:'nba',matchup:'Cavaliers vs Pistons',call:'Cavaliers +4.5',
   why:'Cavs won 3 straight after going down 0-2. Mitchell is locked in. Detroit has Huerter, LeVert and Robinson all questionable. Sharp money confirmed on Cleveland.',
   odds:'-108',time:'Fri 5/15 7:00 PM ET',rating:'FREE',units:'1.5 units',ev:'+6%',winProb:'55%',lineMove:'+4.5 to +4'},
  {sport:'mlb',matchup:'Dodgers vs Cubs',call:'Dodgers ML',
   why:'Ohtani confirmed in lineup. Cubs bullpen ranked 28th in ERA last 2 weeks. Steam move confirmed — line moved -145 to -160 on sharp action.',
   odds:'-160',time:'Sat 5/16 4:05 PM ET',rating:'FREE',units:'1 unit',ev:'+5%',winProb:'61%',lineMove:'-145 to -160'},
  {sport:'nba',matchup:'Spurs vs Timberwolves',call:'Spurs -10.5',
   why:'Wembanyama back and motivated. Only 41% of public bets but 73% of sharp dollars on SA. Line jumped a full point on sharp action. Massive RLM.',
   odds:'-115',time:'Fri 5/15 9:30 PM ET',rating:'FREE',units:'1.5 units',ev:'+8%',winProb:'67%',lineMove:'-9.5 to -10.5'},
  {sport:'mlb',matchup:'Yankees vs Red Sox',call:'Yankees ML',
   why:'Line flipped from +105 to -110 on pure sharp action. 67% of sharp dollars on New York despite public split. One of the biggest moves of the week.',
   odds:'-110',time:'Fri 5/15 7:05 PM ET',rating:'FREE',units:'1.5 units',ev:'+8%',winProb:'58%',lineMove:'+105 to -110'},
];



const PICKS = [
  {sport:'ufc',matchup:'Allen vs Costa',call:'Allen ML',
   why:'Sharp money moved Allen from -154 to -188. Only 52% of public bets but 71% of sharp dollars. Textbook RLM. Allen is 20-4, never been stopped in 24 fights. Five-round main event plays to his strengths.',
   rating:'HIGH',units:'1.5 units',odds:'-188',time:'Sat 5/16 8:00 PM ET',tier:'free'},
  {sport:'ufc',matchup:'Allen vs Costa',call:'Over 4.5 rounds',
   why:'Allen is a decision machine — 5 of his last 6 fights went the distance. Costa fades past round 3. Sharp money hammered this all week. Line moved -130 to -166.',
   rating:'FREE',units:'2 units',odds:'-166',time:'Sat 5/16 8:00 PM ET',tier:'wynnr'},
  {sport:'ufc',matchup:'Allen vs Costa',call:'Costa +ML',
   why:'Contrarian dart. Costa +155 with 6-fight win streak and two first-round finishes. Chute Boxe power. If he lands clean early this is over. Small action only.',
   rating:'LOTT',units:'0.5 units',odds:'+155',time:'Sat 5/16 8:00 PM ET',tier:'wynnr'},
  {sport:'nba',matchup:'Cavaliers vs Pistons',call:'Cavaliers +4.5',
   why:'Cavs won 3 straight after going down 0-2. Mitchell locked in. Detroit has Huerter, LeVert and Robinson all questionable. Sharp money confirmed on Cleveland.',
   rating:'HIGH',units:'1.5 units',odds:'-108',time:'Fri 5/15 7:00 PM ET',tier:'free'},
  {sport:'nba',matchup:'Spurs vs Timberwolves',call:'Spurs -10.5',
   why:'Wembanyama back and motivated. SA leads 3-2 at home. Only 41% of public bets but 73% of sharp dollars on San Antonio. Massive RLM. Lay the number.',
   rating:'HIGH',units:'1.5 units',odds:'-115',time:'Fri 5/15 9:30 PM ET',tier:'wynnr'},
  {sport:'nba',matchup:'Cavaliers vs Pistons',call:'Over 211.5',
   why:'Over hit in 2 straight games in this series. Both teams up-tempo. Mitchell and Cunningham projected 26+ each. Pace increases in elimination scenarios.',
   rating:'STD',units:'1 unit',odds:'-110',time:'Fri 5/15 7:00 PM ET',tier:'wynnr'},
  {sport:'nba',matchup:'2026 NBA Finals',call:'Thunder to win title',
   why:'OKC is 8-0 in playoffs and swept the Lakers. Jalen Williams getting healthy. Best team top to bottom. -165 is still value. Lock in before it hits -200.',
   rating:'HIGH',units:'1 unit',odds:'-165',time:'Futures',tier:'wynnr'},
  {sport:'mlb',matchup:'Dodgers vs Cubs',call:'Dodgers ML',
   why:'Ohtani confirmed in lineup after rest day. Cubs bullpen ranked 28th in ERA last 2 weeks. Steam confirmed — line moved -145 to -160 on sharp action.',
   rating:'HIGH',units:'1 unit',odds:'-160',time:'Sat 5/16 4:05 PM ET',tier:'free'},
  {sport:'mlb',matchup:'Yankees vs Red Sox',call:'Yankees ML',
   why:'Line flipped from +105 to -110 on pure sharp action. 67% of sharp dollars on Yankees despite public split. One of the biggest moves of the week.',
   rating:'FREE',units:'1.5 units',odds:'-110',time:'Fri 5/15 7:05 PM ET',tier:'wynnr'},
];

const BI_TIERS = [
  {badge:'FREE\nMONEY',color:'#4db874',bg:'rgba(58,148,96,.14)',border:'rgba(58,148,96,.28)',name:'Free Money',desc:'High positive EV. Line is statistically off, sharp money confirms, CLV is strong. Max bet territory.',stats:[['Win rate','58%+'],['Bet size','2-3 units'],['EV','+8% or higher']]},
  {badge:'HIGH\nVALUE',color:'#c9a84c',bg:'rgba(201,168,76,.13)',border:'rgba(201,168,76,.28)',name:'High Value',desc:'Strong positive EV with data backing. Sharp money present. Your bread and butter plays.',stats:[['Win rate','54-58%'],['Bet size','1-2 units'],['EV','+3-8%']]},
  {badge:'LEAN',color:'#94a3b8',bg:'rgba(148,163,184,.12)',border:'rgba(148,163,184,.25)',name:'Lean',desc:'Slight edge identified. Situational value. Smaller size, still worth playing.',stats:[['Win rate','52-54%'],['Bet size','0.5-1 unit'],['EV','+1-3%']]},
  {badge:'FADE',color:'#f87171',bg:'rgba(248,113,113,.12)',border:'rgba(248,113,113,.25)',name:'Fade',desc:'Avoid this side. Sharp money, line movement, or analytics point against it.',stats:[['Win rate','<48%'],['Bet size','Avoid'],['EV','Negative']]},
];

const LV_DATA = [
  {game:'Allen vs Costa',move:'-154 to -188',dir:'up',note:'Sharp action drove this move.'},
  {game:'Cavaliers vs Pistons',move:'+4.5 to +4',dir:'dn',note:'Sharp money on Cleveland.'},
  {game:'Spurs vs Timberwolves',move:'-9.5 to -10.5',dir:'up',note:'Sharps loading San Antonio.'},
  {game:'Yankees vs Red Sox',move:'+105 to -110',dir:'up',note:'Line flip on sharp action.'},
];

const POOLS = {
  ufc:[
    // UFC Fight Night: Allen vs Costa - 5/16/2026 - DK $300K - $50K cap, pick 6
    {name:'M. Wellmaker',  fullName:'Mason Wellmaker',    pos:'F',sal:{dk:9200,fd:11000},opp:'vs Diaz',          own:28,ceil:120,floor:55,fppf:82.2, record:'10-1', bust:false,tag:'anchor',    game:'Diaz vs Wellmaker',        corr:'82.2 FPPF, 10-1. Top salary anchor on this slate.'},
    {name:'T. Gantt',      fullName:'Thomas Gantt',       pos:'F',sal:{dk:9100,fd:10800},opp:'vs Minev',         own:22,ceil:110,floor:25,fppf:0,    record:'0-0',  bust:true, tag:'contrarian',game:'Minev vs Gantt',           corr:'UFC debut. Zero data. High variance GPP dart only.'},
    {name:'N. Caliari',    fullName:'Nicolas Caliari',    pos:'F',sal:{dk:9000,fd:10700},opp:'vs Bannon',        own:31,ceil:115,floor:60,fppf:36.1, record:'8-4',  bust:false,tag:'chalk',    game:'Caliari vs Bannon',        corr:'36.1 FPPF. Chalk at this price. Solid floor limited upside.'},
    {name:'A. Petroski',   fullName:'Andre Petroski',     pos:'F',sal:{dk:8900,fd:10500},opp:'vs Brundage',      own:26,ceil:125,floor:65,fppf:62.2, record:'13-5', bust:false,tag:'anchor',   game:'Petroski vs Brundage',     corr:'62.2 FPPF elite at this salary. Brundage gets finished.'},
    {name:'I. Erslan',     fullName:'Ikram Erslan',       pos:'F',sal:{dk:8800,fd:10400},opp:'vs Tokkos',        own:24,ceil:110,floor:50,fppf:22.3, record:'14-6', bust:false,tag:'value',    game:'Erslan vs Tokkos',         corr:'22.3 FPPF concerns but experience advantage. Late rounds.'},
    {name:'A. Ardelean',   fullName:'Alexandru Ardelean', pos:'F',sal:{dk:8700,fd:10300},opp:'vs Viana',         own:29,ceil:120,floor:60,fppf:71.2, record:'11-7', bust:false,tag:'leverage', game:'Viana vs Ardelean',        corr:'71.2 FPPF elite. Sharp play vs Viana chalk. RLM confirmed.'},
    {name:'A. Allen',      fullName:'Arnold Allen',       pos:'F',sal:{dk:8600,fd:10200},opp:'vs Costa',         own:38,ceil:130,floor:70,fppf:62.3, record:'20-4', bust:false,tag:'anchor',   game:'Costa vs Allen',           corr:'MAIN EVENT. -188 fav. 20-4. Never stopped. 5 rounds. Sharp money confirmed.'},
    {name:'J. Cavalcanti', fullName:'John Cavalcanti',    pos:'F',sal:{dk:8500,fd:10000},opp:'vs Vieira',        own:22,ceil:115,floor:55,fppf:67.4, record:'10-1', bust:false,tag:'leverage', game:'Cavalcanti vs Vieira',     corr:'67.4 FPPF. 10-1 record. RLM on Cavalcanti this week.'},
    {name:'B. Sopaj',      fullName:'Besnik Sopaj',       pos:'F',sal:{dk:8400,fd:9900}, opp:'vs Cuamba',        own:18,ceil:120,floor:55,fppf:70.3, record:'12-3', bust:false,tag:'leverage', game:'Sopaj vs Cuamba',          corr:'70.3 FPPF at only 18% ownership. Leverage monster.'},
    {name:'D. Santos',     fullName:'Daniel Santos',      pos:'F',sal:{dk:8400,fd:9900}, opp:'vs Choi',          own:34,ceil:125,floor:65,fppf:91.6, record:'14-2', bust:false,tag:'anchor',   game:'Santos vs Choi',           corr:'91.6 FPPF best raw projection on slate. Chalk but justified.'},
    {name:'K. Williams',   fullName:'Kevin Williams',     pos:'F',sal:{dk:8300,fd:9800}, opp:'vs Veretennikov',  own:21,ceil:115,floor:50,fppf:71.4, record:'15-5', bust:false,tag:'value',    game:'Williams vs Veretennikov', corr:'71.4 FPPF at $8,300. Great value. Knockout power.'},
    {name:'M. Bukauskas',  fullName:'Modestas Bukauskas', pos:'F',sal:{dk:8300,fd:9800}, opp:'vs Edwards',       own:22,ceil:115,floor:55,fppf:50.7, record:'19-7', bust:false,tag:'value',    game:'Edwards vs Bukauskas',     corr:'50.7 FPPF. 19-7 experience vs replacement fighter.'},
    {name:'D. Barez',      fullName:'Diego Barez',        pos:'F',sal:{dk:8200,fd:9700}, opp:'vs Gurule',        own:16,ceil:110,floor:45,fppf:35.8, record:'17-7', bust:false,tag:'contrarian',game:'Gurule vs Barez',          corr:'35.8 FPPF but 16% ownership. Pure leverage underdog play.'},
    {name:'L. Gurule',     fullName:'Lucas Gurule',       pos:'F',sal:{dk:8000,fd:9500}, opp:'vs Barez',         own:19,ceil:105,floor:40,fppf:24.7, record:'10-3', bust:false,tag:'contrarian',game:'Gurule vs Barez',          corr:'24.7 FPPF. Low ownership = leverage if he wins.'},
    {name:'N. Veretennikov',fullName:'Nikita Veretennikov',pos:'F',sal:{dk:7900,fd:9300},opp:'vs Williams',      own:14,ceil:105,floor:35,fppf:42.6, record:'14-7', bust:false,tag:'contrarian',game:'Williams vs Veretennikov', corr:'42.6 FPPF at 14% ownership. GPP leverage vs Williams chalk.'},
    {name:'K. Vieira',     fullName:'Ketlen Vieira',      pos:'F',sal:{dk:7700,fd:9100}, opp:'vs Cavalcanti',    own:18,ceil:110,floor:40,fppf:62.5, record:'15-5', bust:false,tag:'value',    game:'Cavalcanti vs Vieira',     corr:'62.5 FPPF at $7,700. Upset potential vs Cavalcanti.'},
    {name:'T. Cuamba',     fullName:'Tresean Cuamba',     pos:'F',sal:{dk:7800,fd:9200}, opp:'vs Sopaj',         own:16,ceil:105,floor:40,fppf:57.4, record:'10-3', bust:false,tag:'value',    game:'Sopaj vs Cuamba',          corr:'57.4 FPPF. Leverage if Sopaj is overowned.'},
    {name:'D. Choi',       fullName:'Dooho Choi',         pos:'F',sal:{dk:7800,fd:9200}, opp:'vs Santos',        own:29,ceil:120,floor:40,fppf:74.8, record:'16-4', bust:false,tag:'chalk',    game:'Santos vs Choi',           corr:'74.8 FPPF, 29% ownership. Popular chalk. Massive KO upside.'},
    {name:'M. Costa',      fullName:'Melquizael Costa',   pos:'F',sal:{dk:7600,fd:9000}, opp:'vs Allen',         own:42,ceil:135,floor:30,fppf:80.0, record:'26-7', bust:true, tag:'chalk',    game:'Costa vs Allen',           corr:'MAIN EVENT underdog at 42% ownership. High bust risk.'},
    {name:'P. Viana',      fullName:'Pedro Viana',        pos:'F',sal:{dk:7500,fd:8900}, opp:'vs Ardelean',      own:15,ceil:110,floor:40,fppf:53.4, record:'13-8', bust:false,tag:'value',    game:'Viana vs Ardelean',        corr:'53.4 FPPF at 15% ownership. Fade Ardelean, stack Viana.'},
    {name:'T. Tokkos',     fullName:'Themba Tokkos',      pos:'F',sal:{dk:7400,fd:8800}, opp:'vs Erslan',        own:12,ceil:100,floor:35,fppf:51.2, record:'11-5', bust:false,tag:'contrarian',game:'Erslan vs Tokkos',         corr:'51.2 FPPF at 12% ownership. GPP differentiator if wins.'},
    {name:'C. Brundage',   fullName:'Chris Brundage',     pos:'F',sal:{dk:7300,fd:8700}, opp:'vs Petroski',      own:10,ceil:95, floor:30,fppf:48.5, record:'11-9', bust:false,tag:'contrarian',game:'Petroski vs Brundage',     corr:'48.5 FPPF at 10% ownership. Petroski chalk is overowned.'},
    {name:'S. Bannon',     fullName:'Sean Bannon',        pos:'F',sal:{dk:7200,fd:8600}, opp:'vs Caliari',       own:13,ceil:95, floor:30,fppf:54.9, record:'7-2',  bust:false,tag:'value',    game:'Caliari vs Bannon',        corr:'54.9 FPPF at $7,200. Finishing ability. Good value play.'},
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
      {game:'Cavaliers vs Pistons',line:'+4.5',side:'CLE',book:'DraftKings'},
      {game:'Spurs vs Timberwolves',line:'-10.5',side:'SAS',book:'DraftKings'},
    ],
    mlb:[
      {game:'Dodgers vs Cubs',line:'-1.5',side:'LAD',book:'DraftKings'},
    ],
  },
};

const TRENDS_DATA = [
  {title:'UFC: 5-Round Main Event Favorites (-150 or Shorter)',
   record:'38-14',pct:73,color:'good',
   desc:'Main event favorites priced -150 or shorter in 5-round UFC fights cover DFS expectations 73% of the time. This week: Allen (-188) is a perfect fit.'},
  {title:'UFC: Never-Stopped Fighters vs Previously Finished Opponents',
   record:'29-8',pct:78,color:'best',
   desc:'Fighters who have never been stopped vs opponents who have been finished before cover 78% of the time. Allen (never stopped in 24 fights) vs Costa (submitted and KO previously).'},
  {title:'NBA Playoffs: Home Teams After Must-Win Road Win',
   record:'44-19',pct:70,color:'good',
   desc:'NBA playoff home teams coming off a must-win road win cover 70% of the time in the following home game. San Antonio won Game 5 on the road and returns home for Game 6.'},
  {title:'NBA Playoffs: 3+ Injury Reports vs Healthy Opponents',
   record:'12-31',pct:28,color:'bad',
   desc:'Playoff teams with 3+ questionable or out designations against healthy opponents cover only 28% of the time. Detroit enters Game 6 with Huerter, LeVert, and Robinson all questionable.'},
  {title:'MLB: Ohtani Confirmed in Lineup - Dodgers Home',
   record:'22-9',pct:71,color:'good',
   desc:'When Ohtani is confirmed in the lineup for a Dodgers home game after a rest day, LA covers 71% of the time this season. Active signal for Saturday vs Cubs.'},
  {title:'RLM Signal Win Rate Across All Sports',
   record:'156-62',pct:72,color:'best',
   desc:'When a team has less than 55% of public bets but over 65% of sharp dollars, the sharp side covers 72% of the time. Active signals: Allen UFC, Spurs NBA, Yankees MLB.'},
];

const PATTERNS_DATA = [
  {title:'Sharp Money Divergence',icon:'<svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 9h12M9 3l6 6-6 6" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>',color:'var(--gold)',
   desc:'When public bet% and sharp dollar% point different directions, follow the money. Sharps are profitable long-term. Public bettors are not.'},
  {title:'Line Movement',icon:'<svg width="18" height="18" viewBox="0 0 18 18"><polyline points="2,14 6,8 10,11 16,4" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>',color:'var(--green2)',
   desc:'A line moving toward a team despite heavy public betting against them signals sharp action. The bigger the move, the stronger the signal.'},
  {title:'Steam Moves',icon:'<svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 2v4M9 12v4M2 9h4M12 9h4" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>',color:'var(--red2)',
   desc:'Rapid line movement across multiple books simultaneously. Sharp syndicates hitting at once. Highest confidence signal in sports betting.'},
  {title:'Reverse Line Movement',icon:'<svg width="18" height="18" viewBox="0 0 18 18"><path d="M15 9H3M9 3l-6 6 6 6" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>',color:'var(--gold)',
   desc:'Line moves opposite to public betting. Public on Team A but line moves toward Team B means sharps loading Team B. Follow the line not the public.'},
  {title:'Closing Line Value',icon:'<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6" stroke="currentColor" fill="none" stroke-width="1.5"/><path d="M9 6v3l2 2" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>',color:'var(--green2)',
   desc:'Beating the closing line is the best predictor of long-term profitability. Get the best number early when sharp action is identified.'},
];

const ARTICLES = [
  {id:'ufc-vegas-117-breakdown',
   title:'UFC Vegas 117: Allen vs Costa Full Breakdown',
   sport:'ufc', tag:'DFS + BETTING',
   date:'May 14, 2026', tier:'free',
   summary:'Arnold Allen enters as a -188 favorite with sharp money confirming the play. Everything you need for Saturday.',
   body:'Allen vs Costa is one of the cleanest spots on this slate. Sharp money moved Allen from -154 to -188 on pure sharp action. Only 52% of public bets but 71% of sharp dollars. Textbook RLM. Allen is 20-4, never been stopped. Five-round main event plays to his strengths. The Over 4.5 rounds at -166 is the correlated play. Allen wins a decision, both legs cash. Top DFS plays: Petroski ($8,900), Allen ($8,600), Santos ($8,400). Leverage: Sopaj ($8,400) at 18% ownership.'},
  {id:'nba-playoffs-sharp-report',
   title:'NBA Playoff Sharp Money Report: Weekend Edition',
   sport:'nba', tag:'BETTING',
   date:'May 14, 2026', tier:'free',
   summary:'Two clear sharp money plays this weekend. Cavs and Spurs both have strong RLM signals.',
   body:'CAVALIERS +4.5 - Mitchell is locked in, Detroit has 3 starters questionable. Sharp money on Cleveland. Take the points. SPURS -10.5 - Wembanyama at home after the ejection. 73% of sharp dollars on SA vs 41% public. Line jumped a full point. Massive RLM. Lay the number. THUNDER FUTURES at -165 - 8-0 in playoffs, best team standing. Lock in before -200.'},
  {id:'ufc-vegas-117-dfs-guide',
   title:'UFC Vegas 117 DFS Guide: How to Attack This Slate',
   sport:'ufc', tag:'DFS',
   date:'May 14, 2026', tier:'wynnr',
   summary:'Full DFS breakdown for Allen vs Costa. Cash plays, GPP leverage, and who to avoid.',
   body:'CASH PLAYS: Petroski ($8,900) - 62.2 FPPF vs Brundage. Allen ($8,600) - main event five rounds. Santos ($8,400) - 91.6 FPPF best projection. GPP LEVERAGE: Sopaj ($8,400) - 70.3 FPPF at 18% ownership. Ardelean ($8,700) - 71.2 FPPF underpriced. Vieira ($7,700) - 62.5 FPPF value. AVOID: Costa ($7,600) - 42% ownership as an underdog. Gantt ($9,100) - UFC debut, zero data.'},
  {id:'sharp-money-explained',
   title:'What Is Sharp Money and Why It Matters',
   sport:'general', tag:'EDUCATION',
   date:'May 14, 2026', tier:'free',
   summary:'Understanding sharp money is the single biggest edge you can have as a sports bettor.',
   body:'Sharp money refers to bets placed by professional winning sports bettors. Books track sharp action separately because sharp bettors are profitable long-term while public bettors are not. When you see reverse line movement - a line moving toward a team despite heavy public betting against them - that is sharp money at work. At OnlyWynnrs we track this divergence daily and surface the clearest signals for every major sport. The goal is simple: bet like the sharps, not the public.'},
];

SHARP_DATA = [
  {game:'Allen vs Costa',
   sub:'UFC Vegas 117 - Main Event - Sat 5/16 8:00 PM ET',
   pub:52, sharp:71, move:'-154 to -188',
   sig:'rlm', sigText:'RLM',
   note:'52% of bets on Allen but 71% of sharp dollars. Classic reverse line movement. Line jumped from -154 to -188 on sharp action alone. Public split, sharps all-in on Allen.'},
  {game:'Allen vs Costa - Over 4.5 rounds',
   sub:'UFC Vegas 117 - Total Rounds - Sat 5/16',
   pub:44, sharp:68, move:'-130 to -166',
   sig:'rlm', sigText:'RLM',
   note:'Public split on the total but 68% of sharp dollars on Over. Line moved from -130 to -166. Five-round main event with a decision specialist. Sharps see this going the distance.'},
  {game:'Cavaliers vs Pistons',
   sub:'NBA Playoffs - Game 6 - Fri 5/15 7:00 PM ET',
   pub:57, sharp:63, move:'+4.5 to +4',
   sig:'hot', sigText:'STEAM',
   note:'57% of bets AND 63% of dollars on Cavs +4.5. Public and sharps aligned. Mitchell locked in, Detroit has 3 starters questionable. Take Cleveland.'},
  {game:'Spurs vs Timberwolves',
   sub:'NBA Playoffs - Game 6 - Fri 5/15 9:30 PM ET',
   pub:41, sharp:73, move:'-9.5 to -10.5',
   sig:'rlm', sigText:'RLM',
   note:'Only 41% of bets on Spurs but 73% of sharp dollars. Wembanyama at home, motivated. Line jumped a full point on sharp action. Textbook RLM.'},
  {game:'Dodgers vs Cubs',
   sub:'MLB - Sat 5/16 4:05 PM ET',
   pub:62, sharp:68, move:'-145 to -160',
   sig:'hot', sigText:'STEAM',
   note:'62% of bets and 68% of dollars on LA. Ohtani in lineup. Cubs bullpen is a liability. Steam confirmed. Public and sharps both on the Dodgers.'},
  {game:'Yankees vs Red Sox',
   sub:'MLB - Fri 5/15 7:05 PM ET',
   pub:48, sharp:67, move:'+105 to -110',
   sig:'rlm', sigText:'RLM',
   note:'Public split but 67% of sharp dollars on Yankees. Line flipped from +105 to -110. One of the biggest moves of the week. Follow the money.'},
  {game:'OKC Thunder - NBA Title',
   sub:'NBA Futures - 2026 Championship',
   pub:55, sharp:70, move:'-145 to -175',
   sig:'hot', sigText:'STEAM',
   note:'Sharps hammering Thunder futures all playoff run. 8-0 in postseason, swept Lakers. Line moved from -145 to -175. Lock in before -200.'},
];

TICKER_DATA=[
  {s:'UFC',p:'Allen ML -188',    r:'LIVE'},
  {s:'UFC',p:'Over 4.5 rounds',  r:'LIVE'},
  {s:'NBA',p:'Cavaliers +4.5',   r:'LIVE'},
  {s:'NBA',p:'Spurs -10.5',      r:'LIVE'},
  {s:'MLB',p:'Dodgers ML',       r:'LIVE'},
  {s:'MLB',p:'Yankees ML',       r:'LIVE'},
  {s:'NBA',p:'Thunder Title',    r:'LIVE'},
];

HC_PARLAYS = [
  {
    title:'Sharp 3-Team Value Parlay',
    legs:['Allen ML (-188)','Spurs -10.5 (-115)','Dodgers ML (-160)'],
    reasons:[
      'RLM confirmed — 52% public but 71% sharp dollars on Allen. Line jumped from -154 to -188.',
      'Only 41% of bets but 73% of sharp dollars on San Antonio. Line jumped a full point.',
      'Steam confirmed — 62% of bets AND 68% of dollars on LA. Ohtani confirmed in lineup.',
    ],
    combinedOdds:'+285',winProb:'26%',ev:'+4%',units:'0.5 units',
    rating:'HIGH VALUE',ratingColor:'var(--gold)',
  },
  {
    title:'NBA Playoff Same-Game Parlay',
    legs:['Cavaliers +4.5','Over 211.5 (Cavs vs Pistons)'],
    reasons:[
      'Mitchell locked in, Detroit has 3 starters questionable. Sharp money on Cleveland.',
      'Over hit in 2 straight in this series. Both teams up-tempo. Mitchell and Cunningham projected 26+ each.',
    ],
    combinedOdds:'+175',winProb:'36%',ev:'+3%',units:'0.25 units',
    rating:'HIGH VALUE',ratingColor:'var(--gold)',
  },
  {
    title:'UFC Decision + Over Parlay',
    legs:['Allen ML (-188)','Over 4.5 rounds (-166)'],
    reasons:[
      'Allen wins a decision — 5 of his last 6 fights went the distance. Never been stopped.',
      'Both signals confirmed sharp. If Allen wins by decision both legs cash simultaneously.',
    ],
    combinedOdds:'+180',winProb:'34%',ev:'+5%',units:'0.5 units',
    rating:'HIGH VALUE',ratingColor:'var(--gold)',
  },
  {
    title:'MLB Sharp Money 2-Teamer',
    legs:['Dodgers ML (-160)','Yankees ML (-110)'],
    reasons:[
      'Steam confirmed — public and sharps both on LA. Ohtani in lineup, Cubs bullpen 28th in ERA.',
      'Line flipped +105 to -110 on pure sharp action. 67% of sharp dollars on New York.',
    ],
    combinedOdds:'+210',winProb:'33%',ev:'+3%',units:'0.25 units',
    rating:'HIGH VALUE',ratingColor:'var(--gold)',
  },
];
