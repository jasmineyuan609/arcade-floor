(function(){

/* ================= DATA ================= */

const BUILTIN_GAMES = [
  { id:'reflex-tap', title:'Reflex Tap', creator:'The Floor', pitch:'Wait for green, then tap the instant it flips. Milliseconds decide the winner.', emoji:'⚡', pace:'fast', type:'reflex', players:'solo', difficulty:'easy', accent:'cyan', builtin:true },
  { id:'memory-match', title:'Memory Match', creator:'The Floor', pitch:'Sixteen cards, eight pairs. Clear the board in as few flips as you can manage.', emoji:'🧠', pace:'slow', type:'puzzle', players:'solo', difficulty:'medium', accent:'yellow', builtin:true },
  { id:'math-blitz', title:'Math Blitz', creator:'The Floor', pitch:'Thirty seconds on the clock. Fire off as many correct answers as you can.', emoji:'🔢', pace:'fast', type:'trivia', players:'solo', difficulty:'medium', accent:'green', builtin:true },
  { id:'tic-tac-toe', title:'Tic-Tac-Toe Duel', creator:'The Floor', pitch:'Three-in-a-row against a real player online — quick match or private room — or take on the Oracle AI.', emoji:'❌', pace:'slow', type:'strategy', players:'multi', difficulty:'hard', accent:'pink', builtin:true },
  { id:'dino-run', title:'Dino Run', creator:'The Floor', pitch:"An endless dash across the wasteland — jump the cacti, don't look back.", emoji:'🦖', pace:'fast', type:'reflex', players:'solo', difficulty:'easy', accent:'green', builtin:true },
  { id:'geo-jump', title:'Geometry Jump', creator:'The Floor', pitch:'An auto-runner over spikes with a margin for error that keeps shrinking. Timing is everything.', emoji:'🔺', pace:'fast', type:'reflex', players:'solo', difficulty:'hard', accent:'pink', builtin:true },
  { id:'neon-obby', title:'Neon Obby', creator:'The Floor', pitch:'A parkour obstacle course — run, jump the pits and spikes, and reach the flag. Clear a stage to unlock a harder one.', emoji:'🟩', pace:'fast', type:'reflex', players:'solo', difficulty:'hard', accent:'green', builtin:true },
  { id:'snake', title:'Neon Snake', creator:'The Floor', pitch:'Eat the pellets, grow the tail, and don\'t crush yourself. The classic, with a neon glow.', emoji:'🐍', pace:'fast', type:'reflex', players:'solo', difficulty:'medium', accent:'green', builtin:true },
  { id:'twenty48', title:'2048', creator:'The Floor', pitch:'Slide the tiles, merge matching numbers, and chase the elusive 2048 tile.', emoji:'🧮', pace:'slow', type:'puzzle', players:'solo', difficulty:'medium', accent:'yellow', builtin:true },
  { id:'flappy', title:'Flappy Neon', creator:'The Floor', pitch:'One button, endless pipes. Tap to flap and thread the gaps for as long as your nerves hold.', emoji:'🐤', pace:'fast', type:'reflex', players:'solo', difficulty:'hard', accent:'cyan', builtin:true },
  { id:'pong', title:'Neon Pong', creator:'The Floor', pitch:'Real-time online 1v1. Quick match or share a room code, then rally past your friend to 7.', emoji:'🏓', pace:'fast', type:'reflex', players:'multi', difficulty:'medium', accent:'cyan', builtin:true },
  { id:'blade', title:'Blade Ball', creator:'The Floor', pitch:'Online reflex duel — the ball rockets between you two, parry in time or you\'re out. It speeds up every hit.', emoji:'⚔️', pace:'fast', type:'reflex', players:'multi', difficulty:'hard', accent:'pink', builtin:true },
  { id:'firewater', title:'Fireboy & Watergirl', creator:'The Floor', pitch:'Two-player co-op on one keyboard. Fireboy (arrows) and Watergirl (WASD) grab the gems and reach their doors.', emoji:'🔥', pace:'slow', type:'strategy', players:'multi', difficulty:'medium', accent:'yellow', builtin:true },
  { id:'brick', title:'Brick Breaker', creator:'The Floor', pitch:'Bounce the ball off your paddle to shatter every brick. Glowing particles, power bricks, and rising speed.', emoji:'🧱', pace:'fast', type:'reflex', players:'solo', difficulty:'medium', accent:'cyan', builtin:true },
  { id:'shooter', title:'Star Blaster', creator:'The Floor', pitch:'A neon space shooter — dodge and blast waves of invaders before they reach you. Explosions included.', emoji:'🚀', pace:'fast', type:'reflex', players:'solo', difficulty:'hard', accent:'pink', builtin:true },
  { id:'hoops', title:'Hoops', creator:'The Floor', pitch:'Flick to shoot with real arc physics. Drain as many buckets as you can before the clock runs out.', emoji:'🏀', pace:'fast', type:'reflex', players:'solo', difficulty:'medium', accent:'yellow', builtin:true },
  { id:'racer', title:'Traffic Racer', creator:'The Floor', pitch:'Weave your car through endless traffic at increasing speed. One crash ends the run.', emoji:'🏎️', pace:'fast', type:'reflex', players:'solo', difficulty:'hard', accent:'green', builtin:true },
  { id:'color-rush', title:'Color Rush', creator:'The Floor', pitch:'A color flashes, four buttons appear — smash the right one before the clock runs out.', emoji:'🎨', pace:'fast', type:'reflex', players:'solo', difficulty:'medium', accent:'yellow', builtin:true, lockable:true },
  { id:'mole-smash', title:'Mole Smash', creator:'The Floor', pitch:'Nine holes, one mole, nowhere near enough time. Tap it before it ducks.', emoji:'🐹', pace:'fast', type:'reflex', players:'solo', difficulty:'medium', accent:'cyan', builtin:true, lockable:true },
];

const THEMES = [
  { id:'classic', name:'Classic Neon', preview:['#4deeea','#ff4d94','#ffcc33'] },
  { id:'sunset', name:'Sunset Strip', preview:['#ff6f59','#ffb347','#ff3864'] },
  { id:'vapor', name:'Vaporwave', preview:['#7afcff','#fe75fe','#b967ff'] },
  { id:'mono', name:'Mono Cabinet', preview:['#ffffff','#a3a3a3','#e5e5e5'] },
];



const QUESTIONS = [
  { key:'pace', prompt:'Pick your pace.', options:[
    { label:'Fast and frantic', value:'fast' },
    { label:'Slow and thoughtful', value:'slow' } ] },
  { key:'type', prompt:"What's the challenge you're after?", options:[
    { label:'Test my reflexes', value:'reflex' },
    { label:'Solve a puzzle', value:'puzzle' },
    { label:'Outsmart an opponent', value:'strategy' },
    { label:'Know things, fast', value:'trivia' } ] },
  { key:'players', prompt:'Who else is playing?', options:[
    { label:'Just me', value:'solo' },
    { label:'Me against a rival', value:'multi' } ] },
  { key:'difficulty', prompt:'How much of a fight do you want?', options:[
    { label:'Easy does it', value:'easy' },
    { label:'Give me a workout', value:'medium' },
    { label:'Bring the pain', value:'hard' } ] },
];

const state = { submittedGames: [], leaderboards: {} };
const player = { coins: 0, unlockedGames: [], unlockedThemes: ['classic'], theme: 'classic' };

/* ================= UTIL ================= */

function escapeHTML(str){
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function uid(){ return 'g_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function allGames(){ return [...BUILTIN_GAMES, ...state.submittedGames]; }
function gameById(id){ return allGames().find(g => g.id === id); }
function diffLevel(d){ return { easy:1, medium:2, hard:3 }[d] || 1; }

/* ================= STORAGE ================= */

const PLAYER_KEY = 'arcade-floor-player';

async function loadData(){
  // Shared floor data (cabinets + leaderboards) comes from the backend.
  try {
    const floor = await ArcadeNet.fetchFloor();
    state.submittedGames = Array.isArray(floor.cabinets) ? floor.cabinets : [];
    state.leaderboards = floor.leaderboards && typeof floor.leaderboards === 'object' ? floor.leaderboards : {};
  } catch(e){ state.submittedGames = []; state.leaderboards = {}; }
  // Per-player progress (coins/unlocks/theme) stays local to this browser.
  try {
    const saved = JSON.parse(localStorage.getItem(PLAYER_KEY));
    if(saved) Object.assign(player, saved);
  } catch(e){ /* fresh player, defaults stand */ }
}

async function persistPlayerState(){
  try { localStorage.setItem(PLAYER_KEY, JSON.stringify(player)); }
  catch(e){ console.error('Could not save player progress', e); }
}

function applyTheme(){
  document.body.className = 'theme-' + player.theme;
}

function renderCoinBadge(){
  const el = document.getElementById('coinBadge');
  if(el) el.textContent = `\u{1FA99} ${player.coins}`;
}

async function awardCoins(amount, reason){
  if(amount <= 0) return;
  player.coins += amount;
  renderCoinBadge();
  await persistPlayerState();
  return amount;
}

function coinToastHTML(amount){
  return amount > 0 ? `<p class="toast" style="color:var(--yellow);">+${amount} &#127161; earned</p>` : '';
}

async function saveScore(gameId, name, score, lowerBetter){
  const updated = await ArcadeNet.postScore(gameId, name, score, lowerBetter);
  if(updated){
    state.leaderboards[gameId] = updated;
  } else {
    // Network hiccup — keep an optimistic local copy so the UI still updates.
    const list = state.leaderboards[gameId] ? [...state.leaderboards[gameId]] : [];
    list.push({ name: String(name).slice(0,16), score, date: Date.now() });
    list.sort((a,b) => lowerBetter ? a.score - b.score : b.score - a.score);
    state.leaderboards[gameId] = list.slice(0,10);
  }
  refreshLiveLeaderboards();
}

function refreshLiveLeaderboards(){
  document.querySelectorAll('.lb-live').forEach(el => {
    const id = el.dataset.game;
    const unit = el.dataset.unit || '';
    el.innerHTML = leaderboardHTML(id, unit);
  });
}

function isNewRecord(gameId, score, lowerBetter){
  const list = state.leaderboards[gameId] || [];
  if(!list.length) return true;
  const top = list[0].score;
  return lowerBetter ? score < top : score > top;
}

const MEDALS = ['&#129351;','&#129352;','&#129353;'];
function leaderboardHTML(gameId, unit){
  const list = state.leaderboards[gameId] || [];
  if(!list.length) return '<p class="lb-empty">No scores yet. Set the first one.</p>';
  return '<ol class="leaderboard">' + list.map((e,i) =>
    `<li class="${i<3?'lb-top':''}"><span class="lb-rank">${MEDALS[i] || (i+1)+'.'}</span><span class="lb-name">${escapeHTML(e.name)}</span><span class="lb-score">${e.score}${unit ? ' ' + unit : ''}</span></li>`
  ).join('') + '</ol>';
}

/* ================= HERO FLICKER ================= */

function renderHero(){
  const title = 'ARCADE FLOOR';
  const el = document.getElementById('heroTitle');
  el.innerHTML = title.split('').map((ch,i) =>
    `<span style="animation-delay:${i*45}ms">${ch === ' ' ? '&nbsp;' : ch}</span>`
  ).join('');
}

/* ================= GAMES GRID ================= */

function renderGrid(){
  const grid = document.getElementById('gamesGrid');
  const games = allGames();
  document.getElementById('floorCount').textContent = `${games.length} cabinet${games.length===1?'':'s'} on the floor`;
  grid.innerHTML = games.map(g => cabinetCard(g)).join('');
  grid.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', () => playGame(btn.dataset.id));
  });
  grid.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDeletePrompt(btn.dataset.id);
    });
  });
}

function isLocked(g){
  return !!g.lockable && !player.unlockedGames.includes(g.id);
}

function cabinetCard(g){
  const locked = isLocked(g);
  const diffN = diffLevel(g.difficulty);
  const pips = [1,2,3].map(n => `<span class="pip ${n<=diffN?'on':''}" style="--c:var(--${g.accent})"></span>`).join('');
  const playLabel = locked ? 'Locked' : (g.builtin || g.url || g.code) ? 'Play' : 'Coming soon';
  const codeBadge = g.code ? '<span class="tag" style="color:var(--yellow);">player-coded</span>' : '';
  const deleteBtn = g.builtin ? '' : `<button class="delete-btn" data-id="${g.id}" title="Delete this cabinet" aria-label="Delete this cabinet">&#10005;</button>`;
  const lockBadge = locked ? '<div class="lock-badge">&#128274;</div>' : '';
  return `
  <div class="cabinet ${locked?'locked':''}" data-game-id="${g.id}">
    ${deleteBtn}
    ${lockBadge}
    <div class="marquee-strip" style="--c:var(--${g.accent})"></div>
    <div class="cabinet-body">
      <div class="cabinet-top">
        <div class="cabinet-emoji">${g.emoji}</div>
        <div>
          <p class="cabinet-title">${escapeHTML(g.title)}</p>
          <p class="cabinet-creator">by ${escapeHTML(g.creator)}</p>
        </div>
      </div>
      <p class="cabinet-pitch">${locked ? 'Locked cabinet — win it from the Wheel.' : escapeHTML(g.pitch)}</p>
      <div class="tag-row">
        <span class="tag">${g.pace}</span>
        <span class="tag">${g.type}</span>
        <span class="tag">${g.players}</span>
        ${codeBadge}
      </div>
      <div class="cabinet-footer">
        <div class="diff-row">${pips}<span>${g.difficulty}</span></div>
        <button class="btn btn-small btn-primary play-btn" data-id="${g.id}">${playLabel}</button>
      </div>
    </div>
  </div>`;
}

function openDeletePrompt(id){
  const g = gameById(id);
  if(!g) return;
  openModal(`
    <h3>Remove Cabinet</h3>
    <p class="ttt-status">Enter the floor password to remove "${escapeHTML(g.title)}". This can't be undone.</p>
    <div class="field">
      <input type="password" id="deletePw" placeholder="Password" autocomplete="off" />
    </div>
    <p class="toast error" id="deleteError" style="min-height:16px;"></p>
    <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
      <button class="btn btn-small btn-ghost" id="deleteCancel">Cancel</button>
      <button class="btn btn-small btn-primary" id="deleteConfirm">Delete Cabinet</button>
    </div>
  `);
  const pwInput = document.getElementById('deletePw');
  pwInput.focus();
  document.getElementById('deleteCancel').addEventListener('click', closeModal);
  document.getElementById('deleteConfirm').addEventListener('click', () => attemptDelete(id));
  pwInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') attemptDelete(id); });
}

async function attemptDelete(id){
  const pwInput = document.getElementById('deletePw');
  const err = document.getElementById('deleteError');
  const res = await ArcadeNet.deleteCabinet(id, pwInput.value);
  if(!res || res.forbidden){
    err.textContent = 'Wrong password.';
    pwInput.value = '';
    pwInput.focus();
    return;
  }
  if(res.removed){
    state.submittedGames = state.submittedGames.filter(g => g.id !== id);
  }
  closeModal();
  renderGrid();
}

function playGame(id){
  const g = gameById(id);
  if(!g) return;
  if(isLocked(g)){ openWheel(); return; }
  if(g.builtin){
    openBuiltinGame(id);
  } else if(g.code){
    openCustomCodeGame(g);
  } else if(g.url){
    window.open(g.url, '_blank', 'noopener');
  } else {
    highlightCard(id);
  }
}

function highlightCard(id){
  const el = document.querySelector(`.cabinet[data-game-id="${id}"]`);
  if(!el) return;
  el.scrollIntoView({ behavior:'smooth', block:'center' });
  el.classList.add('highlight');
  setTimeout(() => el.classList.remove('highlight'), 2200);
}

/* ================= MODAL ================= */

let activeGameCleanup = null;

function openModal(html){
  activeGameCleanup = null;
  document.getElementById('modalRoot').innerHTML = `
    <div class="modal-overlay" id="overlay">
      <div class="modal-box">
        <button class="modal-close" id="modalCloseBtn">&#10005;</button>
        ${html}
      </div>
    </div>`;
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('overlay').addEventListener('click', (e) => {
    if(e.target.id === 'overlay') closeModal();
  });
}
function closeModal(){
  if(activeGameCleanup){ activeGameCleanup(); activeGameCleanup = null; }
  document.getElementById('modalRoot').innerHTML = '';
}

function openBuiltinGame(id){
  if(id === 'reflex-tap') return openReflexTap();
  if(id === 'memory-match') return openMemoryMatch();
  if(id === 'math-blitz') return openMathBlitz();
  if(id === 'tic-tac-toe') return openTicTacToe();
  if(id === 'dino-run') return openDinoRun();
  if(id === 'geo-jump') return openGeometryJump();
  if(id === 'neon-obby') return openNeonObby();
  if(id === 'snake') return openSnake();
  if(id === 'twenty48') return openTwenty48();
  if(id === 'flappy') return openFlappy();
  if(id === 'pong') return openPong();
  if(id === 'blade') return openBladeBall();
  if(id === 'firewater') return openFireWater();
  if(id === 'brick') return openBrickBreaker();
  if(id === 'shooter') return openStarBlaster();
  if(id === 'hoops') return openHoops();
  if(id === 'racer') return openRacer();
  if(id === 'color-rush') return openColorRush();
  if(id === 'mole-smash') return openMoleSmash();
}

/* ---------- Reflex Tap ---------- */
function openReflexTap(){
  const TOTAL_ROUNDS = 5;
  openModal(`
    <h3>&#9889; Reflex Tap</h3>
    <div class="reflex-pad" id="reflexPad">Tap to start</div>
    <p id="reflexStatus">Round 1 of ${TOTAL_ROUNDS}</p>
    <div id="reflexResults"></div>
    <h4>Top 10 — lowest average wins</h4>
    <div id="reflexLB" class="lb-live" data-game="reflex-tap" data-unit="ms">${leaderboardHTML('reflex-tap','ms')}</div>
  `);

  let phase = 'idle', round = 0, times = [], timer = null, readyAt = 0;
  const pad = document.getElementById('reflexPad');
  const status = document.getElementById('reflexStatus');

  pad.addEventListener('click', () => {
    if(phase === 'idle'){
      phase = 'waiting';
      pad.textContent = 'Wait for green...';
      pad.className = 'reflex-pad waiting';
      // later rounds add fake-out flashes to raise the difficulty
      let decoysLeft = round >= 2 ? Math.floor(Math.random()*2) + (round >= 4 ? 1 : 0) : 0;
      const scheduleNext = () => {
        const delay = 500 + Math.random()*1600;
        timer = setTimeout(() => {
          if(phase !== 'waiting') return;
          if(decoysLeft > 0){
            decoysLeft--;
            pad.textContent = 'Almost...';
            pad.className = 'reflex-pad decoy';
            setTimeout(() => {
              if(phase === 'waiting'){
                pad.textContent = 'Wait for green...';
                pad.className = 'reflex-pad waiting';
                scheduleNext();
              }
            }, 220);
          } else {
            phase = 'ready';
            readyAt = Date.now();
            pad.textContent = 'TAP!';
            pad.className = 'reflex-pad go';
          }
        }, delay);
      };
      scheduleNext();
    } else if(phase === 'waiting'){
      clearTimeout(timer);
      phase = 'idle';
      pad.textContent = 'Too soon — tap to retry';
      pad.className = 'reflex-pad too-soon';
    } else if(phase === 'ready'){
      const rt = Date.now() - readyAt;
      times.push(rt);
      round++;
      if(round < TOTAL_ROUNDS){
        phase = 'idle';
        pad.textContent = `${rt}ms — tap for round ${round+1}`;
        pad.className = 'reflex-pad';
        status.textContent = `Round ${round+1} of ${TOTAL_ROUNDS}${round>=2 ? ' — watch for fake-outs' : ''}`;
      } else {
        finish();
      }
    }
  });

  function finish(){
    const avg = Math.round(times.reduce((a,b)=>a+b,0) / times.length);
    pad.textContent = `Average: ${avg}ms`;
    pad.className = 'reflex-pad done';
    const flavor = avg < 220 ? 'Lightning reflexes.' : avg < 300 ? 'Sharp.' : avg < 400 ? 'Solid.' : 'Warming up — try again.';
    status.textContent = flavor + ' Enter your name to save it:';
    const record = isNewRecord('reflex-tap', avg, true);
    const coins = avg < 220 ? 15 : avg < 300 ? 10 : avg < 400 ? 6 : 3;
    awardCoins(coins);
    document.getElementById('reflexResults').innerHTML =
      (record ? '<p class="record-banner">&#9889; NEW RECORD PACE &#9889;</p>' : '') +
      coinToastHTML(coins) +
      `<input id="reflexName" placeholder="Your name" maxlength="16" />
       <button class="btn btn-small btn-primary" id="reflexSave">Save Score</button>`;
    document.getElementById('reflexSave').addEventListener('click', async () => {
      const name = document.getElementById('reflexName').value.trim() || 'Anonymous';
      await saveScore('reflex-tap', name, avg, true);
      document.getElementById('reflexLB').innerHTML = leaderboardHTML('reflex-tap','ms');
      document.getElementById('reflexResults').innerHTML = '<p class="toast">Saved to the leaderboard.</p>';
    });
  }
}

/* ---------- Memory Match ---------- */
function openMemoryMatch(){
  const symbols = ['🎮','🕹️','👾','🏆','⚡','🔥','💎','🚀'];
  let deck = [...symbols, ...symbols]
    .map(s => ({ s, id: Math.random() }))
    .sort(() => Math.random() - 0.5);

  openModal(`
    <h3>&#129504; Memory Match</h3>
    <div class="memory-stats"><span id="memMoves">Moves: 0</span><span id="memTime">Time: 0s</span></div>
    <div class="memory-grid" id="memGrid"></div>
    <div id="memResult"></div>
    <h4>Top 10 — fewest moves wins</h4>
    <div id="memLB" class="lb-live" data-game="memory-match" data-unit="moves">${leaderboardHTML('memory-match','moves')}</div>
  `);

  const grid = document.getElementById('memGrid');
  grid.innerHTML = deck.map((c,i) => `<div class="memory-card" data-i="${i}" data-s="${c.s}">❔</div>`).join('');

  let first = null, second = null, lock = false, moves = 0, matched = 0, seconds = 0;
  const timerInt = setInterval(() => {
    seconds++;
    document.getElementById('memTime').textContent = `Time: ${seconds}s`;
  }, 1000);

  grid.querySelectorAll('.memory-card').forEach(card => {
    card.addEventListener('click', () => {
      if(lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      card.textContent = card.dataset.s;
      card.classList.add('flipped');
      if(!first){ first = card; return; }
      second = card;
      lock = true;
      moves++;
      document.getElementById('memMoves').textContent = `Moves: ${moves}`;
      if(first.dataset.s === second.dataset.s){
        first.classList.add('matched'); second.classList.add('matched');
        matched++;
        first = null; second = null; lock = false;
        if(matched === symbols.length) finish();
      } else {
        setTimeout(() => {
          first.textContent = '❔'; second.textContent = '❔';
          first.classList.remove('flipped'); second.classList.remove('flipped');
          first = null; second = null; lock = false;
        }, 700);
      }
    });
  });

  function finish(){
    clearInterval(timerInt);
    const record = isNewRecord('memory-match', moves, true);
    const coins = moves <= 10 ? 15 : moves <= 16 ? 10 : moves <= 24 ? 6 : 3;
    awardCoins(coins);
    document.getElementById('memResult').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + coinToastHTML(coins) + `
      <p class="toast">Cleared in ${moves} moves, ${seconds}s. Enter your name to save it:</p>
      <div style="display:flex; gap:8px;">
        <input id="memName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="memSave">Save Score</button>
      </div>`;
    document.getElementById('memSave').addEventListener('click', async () => {
      const name = document.getElementById('memName').value.trim() || 'Anonymous';
      await saveScore('memory-match', name, moves, true);
      document.getElementById('memLB').innerHTML = leaderboardHTML('memory-match','moves');
      document.getElementById('memResult').innerHTML = '<p class="toast">Saved to the leaderboard.</p>';
    });
  }
}

/* ---------- Math Blitz ---------- */
function openMathBlitz(){
  openModal(`
    <h3>&#128290; Math Blitz</h3>
    <div class="blitz-panel">
      <div class="blitz-timer" id="blitzTimer">30s left</div>
      <div class="blitz-problem" id="blitzProblem">Ready?</div>
      <input id="blitzInput" type="number" placeholder="answer" />
      <div class="blitz-score" id="blitzScore">Score: 0 &nbsp; Streak: 0</div>
      <button class="btn btn-small btn-primary" id="blitzStart" style="margin-top:14px;">Start</button>
      <div id="blitzResult"></div>
    </div>
    <h4>Top 10 — most correct wins</h4>
    <div id="blitzLB" class="lb-live" data-game="math-blitz" data-unit="correct">${leaderboardHTML('math-blitz','correct')}</div>
  `);

  let score = 0, streak = 0, timeLeft = 30, timer = null, answer = 0, running = false;
  const problemEl = document.getElementById('blitzProblem');
  const input = document.getElementById('blitzInput');
  const timerEl = document.getElementById('blitzTimer');
  const scoreEl = document.getElementById('blitzScore');

  document.getElementById('blitzStart').addEventListener('click', start);

  function start(){
    if(running) return;
    running = true;
    score = 0; streak = 0; timeLeft = 30;
    scoreEl.textContent = 'Score: 0 \u00a0 Streak: 0';
    document.getElementById('blitzStart').style.display = 'none';
    nextProblem();
    input.disabled = false;
    input.value = '';
    input.focus();
    timer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `${timeLeft}s left`;
      if(timeLeft <= 0) finish();
    }, 1000);
  }

  function nextProblem(){
    const ops = score < 4 ? ['+','-'] : score < 10 ? ['+','-','×'] : ['+','-','×','÷'];
    const op = ops[Math.floor(Math.random()*ops.length)];
    const maxOperand = Math.min(30, 10 + score);
    let a, b;
    if(op === '÷'){
      b = Math.floor(Math.random()*10)+2;
      answer = Math.floor(Math.random()*10)+1;
      a = b*answer;
      problemEl.textContent = `${a} ${op} ${b}`;
      return;
    }
    a = Math.floor(Math.random()*maxOperand)+1;
    b = Math.floor(Math.random()* (op === '×' ? Math.min(12, maxOperand) : maxOperand))+1;
    if(op === '-' && b > a){ [a,b] = [b,a]; }
    answer = op === '+' ? a+b : op === '-' ? a-b : a*b;
    problemEl.textContent = `${a} ${op} ${b}`;
  }

  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && running){
      if(parseInt(input.value,10) === answer){
        score++; streak++;
        problemEl.style.color = 'var(--green)';
        scoreEl.textContent = `Score: ${score} \u00a0 Streak: ${streak}${streak>=5 ? ' \u{1f525}' : ''}`;
      } else {
        streak = 0;
        problemEl.style.color = 'var(--pink)';
        scoreEl.textContent = `Score: ${score} \u00a0 Streak: 0`;
      }
      setTimeout(() => { problemEl.style.color = ''; }, 200);
      input.value = '';
      nextProblem();
    }
  });

  function finish(){
    clearInterval(timer);
    running = false;
    input.disabled = true;
    problemEl.textContent = 'Time!';
    const record = isNewRecord('math-blitz', score, false);
    const coins = Math.min(30, score);
    awardCoins(coins);
    document.getElementById('blitzResult').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + coinToastHTML(coins) + `
      <p class="toast">Final score: ${score}. Enter your name to save it:</p>
      <div style="display:flex; gap:8px; justify-content:center;">
        <input id="blitzName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="blitzSave">Save Score</button>
      </div>`;
    document.getElementById('blitzSave').addEventListener('click', async () => {
      const name = document.getElementById('blitzName').value.trim() || 'Anonymous';
      await saveScore('math-blitz', name, score, false);
      document.getElementById('blitzLB').innerHTML = leaderboardHTML('math-blitz','correct');
      document.getElementById('blitzResult').innerHTML = '<p class="toast">Saved to the leaderboard.</p>';
    });
  }
}

/* ---------- Tic Tac Toe ---------- */
function getSavedName(){
  try { return localStorage.getItem('arcade-floor-name') || ''; }
  catch(e){ return ''; }
}
function saveName(name){
  try { localStorage.setItem('arcade-floor-name', name); } catch(e){ /* ignore */ }
}

function openTicTacToe(){
  const canOnline = ArcadeNet.mp.available;
  openModal(`
    <h3>&#10060; Tic-Tac-Toe Duel</h3>
    ${canOnline ? `
    <div class="field" style="margin-bottom:16px;">
      <label for="tttName">Your name</label>
      <input type="text" id="tttName" maxlength="16" placeholder="Player" value="${escapeHTML(getSavedName())}" />
    </div>
    <p class="ttt-status">Play a real person online:</p>
    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
      <button class="btn btn-small btn-primary" id="tttQuick">&#9889; Quick Match</button>
      <button class="btn btn-small btn-ghost" id="tttCreate">&#128274; Create Private Room</button>
      <div style="display:flex; gap:8px;">
        <input type="text" id="tttCode" maxlength="4" placeholder="CODE" style="flex:1; text-transform:uppercase; background:var(--void); border:1px solid var(--panel-edge); border-radius:8px; padding:9px 12px; color:var(--text); font-family:var(--font-mono);" />
        <button class="btn btn-small btn-ghost" id="tttJoin">Join</button>
      </div>
    </div>
    <p class="ttt-status" style="border-top:1px solid var(--panel-edge); padding-top:14px;">Or go solo:</p>
    <div style="text-align:center;"><button class="btn btn-small btn-ghost" id="tttAI">&#129302; Play vs The Oracle (AI)</button></div>
    ` : `
    <p class="ttt-status">The floor server isn't connected, so online duels are unavailable. Take on the Oracle AI instead:</p>
    <div style="text-align:center;"><button class="btn btn-small btn-primary" id="tttAI">&#129302; Play vs The Oracle (AI)</button></div>
    `}
  `);

  if(canOnline){
    const nameInput = document.getElementById('tttName');
    const getName = () => { const n = nameInput.value.trim() || 'Player'; saveName(n); return n; };
    document.getElementById('tttQuick').addEventListener('click', () => openTicTacToeOnline('quick', getName()));
    document.getElementById('tttCreate').addEventListener('click', () => openTicTacToeOnline('create', getName()));
    document.getElementById('tttJoin').addEventListener('click', () => {
      const code = document.getElementById('tttCode').value.trim().toUpperCase();
      if(code.length < 4) return;
      openTicTacToeOnline('join', getName(), code);
    });
  }
  document.getElementById('tttAI').addEventListener('click', openTicTacToeAI);
}

function openTicTacToeOnline(mode, name, code){
  openModal(`
    <h3>&#10060; Online Duel</h3>
    <p class="ttt-status" id="tttStatus">Connecting...</p>
    <div id="tttRoomInfo" style="text-align:center; margin-bottom:10px;"></div>
    <div class="ttt-grid" id="tttGrid"></div>
    <div class="ttt-stats" id="tttStats"></div>
    <div id="tttCoinMsg" style="text-align:center;"></div>
    <div style="text-align:center; margin-top:14px;">
      <button class="btn btn-small btn-primary" id="tttRematch" style="display:none;">Rematch</button>
      <button class="btn btn-small btn-ghost" id="tttBack">Leave</button>
    </div>
  `);

  const grid = document.getElementById('tttGrid');
  const statusEl = document.getElementById('tttStatus');
  const roomInfo = document.getElementById('tttRoomInfo');
  const rematchBtn = document.getElementById('tttRematch');
  let mySymbol = null, opponent = null, board = Array(9).fill(null), myTurn = false, over = false, awarded = false;

  function drawBoard(){
    grid.innerHTML = board.map((v,i) =>
      `<div class="ttt-cell ${v==='X'?'x':v==='O'?'o':''}" data-i="${i}">${v||''}</div>`
    ).join('');
    grid.querySelectorAll('.ttt-cell').forEach(c => c.addEventListener('click', () => {
      const i = parseInt(c.dataset.i, 10);
      if(over || !myTurn || board[i] || !mySymbol) return;
      ArcadeNet.mp.move(i);
    }));
  }
  drawBoard();

  const unsubs = [];
  unsubs.push(ArcadeNet.on('mp:waiting', (d) => {
    if(d && d.mode === 'room' && d.code){
      statusEl.textContent = 'Share this code with a friend:';
      roomInfo.innerHTML = `<span style="font-family:var(--font-display); font-size:22px; color:var(--yellow); letter-spacing:4px;">${escapeHTML(d.code)}</span>`;
    } else {
      statusEl.textContent = 'Searching for an opponent...';
      roomInfo.innerHTML = '<span class="lb-empty">Waiting for another player to join.</span>';
    }
  }));
  unsubs.push(ArcadeNet.on('mp:matched', (d) => {
    mySymbol = d.symbol; opponent = d.opponent; over = false; awarded = false;
    board = Array(9).fill(null);
    rematchBtn.style.display = 'none';
    document.getElementById('tttCoinMsg').innerHTML = '';
    roomInfo.innerHTML = `You're <strong style="color:var(--${mySymbol==='X'?'cyan':'pink'});">${mySymbol}</strong> vs <strong>${escapeHTML(opponent)}</strong>`;
    drawBoard();
  }));
  unsubs.push(ArcadeNet.on('mp:state', (d) => {
    board = d.board;
    over = d.over;
    myTurn = !over && d.turn === mySymbol;
    drawBoard();
    if(d.result){
      handleResult(d.result);
    } else {
      statusEl.textContent = myTurn ? 'Your move.' : `${escapeHTML(opponent || 'Opponent')}'s move...`;
    }
  }));
  unsubs.push(ArcadeNet.on('mp:opponent_left', () => {
    over = true; myTurn = false;
    statusEl.textContent = 'Your opponent left the duel.';
    rematchBtn.style.display = 'none';
  }));
  unsubs.push(ArcadeNet.on('mp:error', (d) => {
    statusEl.textContent = (d && d.message) || 'Something went wrong.';
    roomInfo.innerHTML = '';
  }));
  unsubs.push(ArcadeNet.on('mp:rematch_vote', (d) => {
    if(d && d.count === 1) statusEl.textContent = 'Waiting for your opponent to accept the rematch...';
  }));

  function handleResult(result){
    const line = result.line;
    if(line){
      line.forEach(i => {
        const cell = grid.querySelector(`.ttt-cell[data-i="${i}"]`);
        if(cell) cell.classList.add('ttt-win');
      });
    }
    let coins = 0;
    if(result.symbol === 'draw'){ statusEl.textContent = 'Draw — even match.'; coins = 3; }
    else if(result.symbol === mySymbol){ statusEl.textContent = 'You win! The floor takes note.'; coins = 12; }
    else { statusEl.textContent = `${escapeHTML(opponent || 'Opponent')} wins this one.`; coins = 0; }
    if(coins > 0 && !awarded){ awarded = true; awardCoins(coins); document.getElementById('tttCoinMsg').innerHTML = coinToastHTML(coins); }
    rematchBtn.style.display = 'inline-flex';
  }

  rematchBtn.addEventListener('click', () => {
    ArcadeNet.mp.rematch();
    statusEl.textContent = 'Rematch requested...';
    rematchBtn.style.display = 'none';
  });
  document.getElementById('tttBack').addEventListener('click', () => { openTicTacToe(); });

  activeGameCleanup = () => {
    unsubs.forEach(u => u());
    ArcadeNet.mp.leave();
  };

  if(mode === 'quick') ArcadeNet.mp.quickMatch(name);
  else if(mode === 'create') ArcadeNet.mp.createRoom(name);
  else if(mode === 'join') ArcadeNet.mp.joinRoom(code, name);
}

function openTicTacToeAI(){
  openModal(`
    <h3>&#129302; Duel With The Oracle</h3>
    <p class="ttt-status" id="tttStatus">Your move — you're X.</p>
    <div class="ttt-grid" id="tttGrid"></div>
    <div class="ttt-stats" id="tttStats">Session — Wins: 0 &nbsp;Losses: 0 &nbsp;Draws: 0</div>
    <div id="tttCoinMsg" style="text-align:center;"></div>
    <div style="text-align:center; margin-top:14px;">
      <button class="btn btn-small btn-ghost" id="tttReset">New Game</button>
      <button class="btn btn-small btn-ghost" id="tttBack">Back</button>
    </div>
  `);

  document.getElementById('tttBack').addEventListener('click', () => { openTicTacToe(); });

  let board = Array(9).fill(null);
  let over = false;
  let stats = { w:0, l:0, d:0 };
  const grid = document.getElementById('tttGrid');
  const statusEl = document.getElementById('tttStatus');
  const statsEl = document.getElementById('tttStats');
  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function draw(){
    grid.innerHTML = board.map((v,i) =>
      `<div class="ttt-cell ${v==='X'?'x':v==='O'?'o':''}" data-i="${i}">${v||''}</div>`
    ).join('');
    grid.querySelectorAll('.ttt-cell').forEach(c => c.addEventListener('click', onCell));
  }

  function winner(b){
    for(const [a,b1,c] of LINES){
      if(b[a] && b[a]===b[b1] && b[a]===b[c]) return b[a];
    }
    return b.every(x=>x) ? 'draw' : null;
  }

  function winningLine(b){
    for(const line of LINES){
      const [a,b1,c] = line;
      if(b[a] && b[a]===b[b1] && b[a]===b[c]) return line;
    }
    return null;
  }

  function onCell(e){
    if(over) return;
    const i = parseInt(e.currentTarget.dataset.i, 10);
    if(board[i]) return;
    board[i] = 'X';
    draw();
    let w = winner(board);
    if(w){ return endGame(w); }
    setTimeout(aiMove, 350);
  }

  function aiMove(){
    if(over) return;
    let move = findBestMove();
    board[move] = 'O';
    draw();
    let w = winner(board);
    if(w) endGame(w);
    else statusEl.textContent = "Your move — you're X.";
  }

  function findBestMove(){
    const empty = board.map((v,i)=>v?null:i).filter(v=>v!==null);
    // 1. win if possible
    for(const i of empty){ board[i]='O'; if(winner(board)==='O'){ board[i]=null; return i; } board[i]=null; }
    // 2. block player win
    for(const i of empty){ board[i]='X'; if(winner(board)==='X'){ board[i]=null; return i; } board[i]=null; }
    // 3. center
    if(!board[4]) return 4;
    // 4. corner
    const corners = [0,2,6,8].filter(i=>!board[i]);
    if(corners.length) return corners[Math.floor(Math.random()*corners.length)];
    // 5. random
    return empty[Math.floor(Math.random()*empty.length)];
  }

  function endGame(w){
    over = true;
    let coins = 0;
    if(w==='X'){ stats.w++; statusEl.textContent = 'You win. The floor takes note.'; coins = 8; }
    else if(w==='O'){ stats.l++; statusEl.textContent = 'The Oracle takes this one.'; coins = 0; }
    else { stats.d++; statusEl.textContent = 'Draw — even match.'; coins = 3; }
    statsEl.textContent = `Session — Wins: ${stats.w}  Losses: ${stats.l}  Draws: ${stats.d}`;
    if(coins > 0){ awardCoins(coins); document.getElementById('tttCoinMsg').innerHTML = coinToastHTML(coins); }
    const line = winningLine(board);
    if(line){
      line.forEach(i => {
        const cell = grid.querySelector(`.ttt-cell[data-i="${i}"]`);
        if(cell) cell.classList.add('ttt-win');
      });
    }
  }

  document.getElementById('tttReset').addEventListener('click', () => {
    board = Array(9).fill(null); over = false;
    statusEl.textContent = "Your move — you're X.";
    document.getElementById('tttCoinMsg').innerHTML = '';
    draw();
  });

  draw();
}

/* ---------- Shared runner helpers ---------- */

const COLOR_SWATCHES = [
  { name:'green', hex:'#5cffb1' }, { name:'cyan', hex:'#4deeea' },
  { name:'pink', hex:'#ff4d94' }, { name:'yellow', hex:'#ffcc33' },
  { name:'orange', hex:'#ff8c42' }, { name:'white', hex:'#f5f0ff' },
];

function colorRowHTML(id, selectedHex){
  return `<div class="color-row" id="${id}">${COLOR_SWATCHES.map(c =>
    `<button type="button" class="swatch ${c.hex===selectedHex?'active':''}" data-hex="${c.hex}" style="--sw:${c.hex}" title="${c.name}"></button>`
  ).join('')}</div>`;
}

function wireColorRow(id, onPick){
  const row = document.getElementById(id);
  row.querySelectorAll('.swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      row.querySelectorAll('.swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onPick(btn.dataset.hex);
    });
  });
}

function drawStar(ctx, cx, cy, points, outerR, innerR){
  ctx.beginPath();
  for(let i=0;i<points*2;i++){
    const r = i%2===0 ? outerR : innerR;
    const a = (Math.PI/points)*i - Math.PI/2;
    const px = cx + Math.cos(a)*r, py = cy + Math.sin(a)*r;
    if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  }
  ctx.closePath();
  ctx.fill();
}

/* ---------- Dino Run ---------- */

function drawDino(ctx, x, y, w, h, color, legFrame){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y+h*0.38);
  ctx.lineTo(x-w*0.3, y+h*0.5);
  ctx.lineTo(x, y+h*0.64);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(x, y+h*0.22, w*0.62, h*0.6);
  ctx.fillRect(x+w*0.5, y, w*0.44, h*0.44);
  const legUp = Math.floor(legFrame/6)%2===0;
  ctx.fillRect(x+w*0.12, y+h*0.82, w*0.14, legUp ? h*0.18 : h*0.28);
  ctx.fillRect(x+w*0.4, y+h*0.82, w*0.14, legUp ? h*0.28 : h*0.18);
  ctx.fillStyle = '#12091f';
  ctx.fillRect(x+w*0.8, y+h*0.1, w*0.08, h*0.08);
}

function openDinoRun(){
  let dinoColor = COLOR_SWATCHES[0].hex;
  openModal(`
    <h3>&#129430; Dino Run</h3>
    <p class="form-note" style="text-align:center;">Pick your dino's color:</p>
    ${colorRowHTML('dinoColors', dinoColor)}
    <p class="ttt-status" id="runnerStatus">Press Space, tap, or click the game to jump. Gets faster the higher your score climbs.</p>
    <canvas id="runnerCanvas" width="460" height="200"
      style="width:100%; max-width:460px; display:block; margin:0 auto; background:var(--void); border:1px solid var(--panel-edge); border-radius:10px; touch-action:none; cursor:pointer;"></canvas>
    <div id="runnerControls" style="text-align:center; margin-top:14px;"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="runnerLB" class="lb-live" data-game="dino-run" data-unit="pts">${leaderboardHTML('dino-run','pts')}</div>
  `);
  wireColorRow('dinoColors', (hex) => { dinoColor = hex; });

  const canvas = document.getElementById('runnerCanvas');
  const ctx = canvas.getContext('2d');
  const W = 460, H = 200, groundY = 160;
  const playerW = 34, playerH = 34, playerX = 50;
  const obstacleColor = '#ffcc33', groundColor = '#3a2359';
  const baseSpeed = 3, maxSpeed = 9, gravity = 0.6, jumpVelocity = -11;

  let playerY, vy, grounded, obstacles, spawnTimer, frame, speed, score, started, running, rafId, particles, shake;

  function reset(){
    playerY = groundY - playerH; vy = 0; grounded = true;
    obstacles = []; spawnTimer = 60; frame = 0; speed = baseSpeed;
    score = 0; started = false; running = false; particles = []; shake = 0;
  }
  reset();

  function rectsOverlap(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }
  function burst(x,y,color,count){
    for(let i=0;i<count;i++) particles.push({ x, y, vx:(Math.random()-0.5)*4, vy:-Math.random()*3, life:22, color });
  }
  function spawnObstacle(){
    const height = 18 + Math.random()*(24 + Math.min(score,60)*0.3);
    const width = 14 + Math.random()*14;
    obstacles.push({ x: W, width, height });
  }

  function update(){
    frame++;
    score = Math.floor(frame/6);
    speed = Math.min(maxSpeed, baseSpeed + score*0.045);
    vy += gravity;
    playerY += vy;
    if(playerY >= groundY - playerH){ playerY = groundY - playerH; vy = 0; grounded = true; }

    spawnTimer--;
    if(spawnTimer <= 0){
      spawnObstacle();
      const tightness = Math.min(30, score*0.4);
      spawnTimer = Math.max(30, 55-tightness) + Math.random()*Math.max(35, 90-tightness);
    }
    obstacles.forEach(o => { o.x -= speed; });
    obstacles = obstacles.filter(o => o.x + o.width > 0);

    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--; });
    particles = particles.filter(p => p.life > 0);
    if(shake > 0.1) shake *= 0.85; else shake = 0;

    const playerRect = { x:playerX, y:playerY, w:playerW, h:playerH };
    for(const o of obstacles){
      const oRect = { x:o.x, y:groundY-o.height, w:o.width, h:o.height };
      if(rectsOverlap(playerRect, oRect)){
        shake = 8;
        burst(playerX+playerW/2, playerY+playerH/2, obstacleColor, 16);
        gameOver();
        break;
      }
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.save();
    if(shake > 0.1) ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);

    ctx.strokeStyle = groundColor;
    ctx.beginPath(); ctx.moveTo(0,groundY); ctx.lineTo(W,groundY); ctx.stroke();

    drawDino(ctx, playerX, playerY, playerW, playerH, dinoColor, grounded ? frame : 0);

    ctx.fillStyle = obstacleColor;
    obstacles.forEach(o => ctx.fillRect(o.x, groundY-o.height, o.width, o.height));

    particles.forEach(p => {
      ctx.globalAlpha = Math.max(p.life/22, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.fillStyle = '#f5f0ff';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('Score: ' + score, W-100, 20);

    if(!started){
      ctx.fillStyle = 'rgba(245,240,255,0.85)';
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillText('Click / tap / space to start', 90, H/2);
    }
    ctx.restore();
  }

  function loop(){
    if(!running) return;
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function jump(){
    if(!started){ started = true; running = true; document.getElementById('runnerStatus').textContent = 'Go!'; loop(); return; }
    if(!running) return;
    if(grounded){ vy = jumpVelocity; grounded = false; burst(playerX+playerW/2, groundY, dinoColor, 6); }
  }

  function gameOver(){
    running = false;
    cancelAnimationFrame(rafId);
    draw();
    document.getElementById('runnerStatus').textContent = 'Crashed — score: ' + score;
    const record = isNewRecord('dino-run', score, false);
    const coins = Math.min(40, Math.floor(score/3));
    awardCoins(coins);
    document.getElementById('runnerControls').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + coinToastHTML(coins) + `
      <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
        <input id="runnerName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="runnerSave">Save Score</button>
        <button class="btn btn-small btn-ghost" id="runnerRestart">Play Again</button>
      </div>`;
    document.getElementById('runnerSave').addEventListener('click', async () => {
      const name = document.getElementById('runnerName').value.trim() || 'Anonymous';
      await saveScore('dino-run', name, score, false);
      document.getElementById('runnerLB').innerHTML = leaderboardHTML('dino-run','pts');
      document.getElementById('runnerSave').disabled = true;
    });
    document.getElementById('runnerRestart').addEventListener('click', () => {
      reset();
      document.getElementById('runnerControls').innerHTML = '';
      document.getElementById('runnerStatus').textContent = 'Press Space, tap, or click the game to jump.';
      draw();
    });
  }

  function keyHandler(e){ if(e.code === 'Space' || e.code === 'ArrowUp'){ e.preventDefault(); jump(); } }
  document.addEventListener('keydown', keyHandler);
  canvas.addEventListener('mousedown', jump);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
  activeGameCleanup = () => { running = false; cancelAnimationFrame(rafId); document.removeEventListener('keydown', keyHandler); };

  draw();
}

/* ---------- Geometry Jump ---------- */

function drawBlockFace(ctx, x, y, w, h, style, fg){
  ctx.strokeStyle = fg; ctx.fillStyle = fg; ctx.lineWidth = 2;
  const cx = x+w/2, cy = y+h/2;
  if(style === 'happy'){
    ctx.beginPath(); ctx.arc(x+w*0.32, y+h*0.4, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+w*0.68, y+h*0.4, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, y+h*0.48, w*0.22, 0.15*Math.PI, 0.85*Math.PI); ctx.stroke();
  } else if(style === 'cool'){
    ctx.fillRect(x+w*0.18, y+h*0.32, w*0.64, h*0.12);
    ctx.beginPath(); ctx.moveTo(x+w*0.3, y+h*0.58); ctx.lineTo(x+w*0.7, y+h*0.58); ctx.stroke();
  } else if(style === 'star'){
    drawStar(ctx, cx, cy, 5, w*0.26, w*0.11);
  }
}

function openGeometryJump(){
  let blockColor = '#4deeea';
  let faceStyle = 'happy';
  const FACES = [ {v:'happy', label:'&#9786;'}, {v:'cool', label:'&#128526;'}, {v:'star', label:'&#9733;'}, {v:'blank', label:'&#8212;'} ];

  openModal(`
    <h3>&#128312; Geometry Jump</h3>
    <p class="form-note" style="text-align:center;">Pick your block's color:</p>
    ${colorRowHTML('geoColors', blockColor)}
    <p class="form-note" style="text-align:center;">Pick your block's face:</p>
    <div class="color-row" id="geoFaces">
      ${FACES.map(f => `<button type="button" class="chip ${f.v==='happy'?'active':''}" data-value="${f.v}">${f.label}</button>`).join('')}
    </div>
    <p class="ttt-status" id="runnerStatus">Press Space, tap, or click to jump. Land on platforms, clear the gaps.</p>
    <canvas id="runnerCanvas" width="460" height="220"
      style="width:100%; max-width:460px; display:block; margin:0 auto; background:var(--void); border:1px solid var(--panel-edge); border-radius:10px; touch-action:none; cursor:pointer;"></canvas>
    <div id="runnerControls" style="text-align:center; margin-top:14px;"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="runnerLB" class="lb-live" data-game="geo-jump" data-unit="pts">${leaderboardHTML('geo-jump','pts')}</div>
  `);
  wireColorRow('geoColors', (hex) => { blockColor = hex; });
  document.getElementById('geoFaces').querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#geoFaces .chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      faceStyle = btn.dataset.value;
    });
  });

  const canvas = document.getElementById('runnerCanvas');
  const ctx = canvas.getContext('2d');
  const W = 460, H = 220, groundY = 170;
  const playerW = 28, playerH = 28, playerX = 50;
  const spikeColor = '#ff4d94', platformColor = '#2a1747', platformEdge = '#3a2359';
  const baseSpeed = 3.6, maxSpeed = 9.5, gravity = 0.62, jumpVelocity = -12;
  const LEVELS = [groundY, groundY-45, groundY-85];

  let playerY, vy, grounded, platforms, spikes, worldEdge, levelIndex, frame, speed, score, started, running, rafId, particles, shake, rotation;

  function reset(){
    playerY = groundY - playerH; vy = 0; grounded = true;
    platforms = [{ x:0, width:W+140, y:groundY }];
    spikes = []; worldEdge = W+140; levelIndex = 0;
    frame = 0; speed = baseSpeed; score = 0;
    started = false; running = false; particles = []; shake = 0; rotation = 0;
  }
  reset();

  function rectsOverlap(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }
  function burst(x,y,color,count){
    for(let i=0;i<count;i++) particles.push({ x, y, vx:(Math.random()-0.5)*4, vy:-Math.random()*3, life:22, color });
  }

  function platformBelow(){
    const candidates = platforms.filter(p => playerX+playerW > p.x && playerX < p.x+p.width);
    if(!candidates.length) return null;
    return candidates.reduce((best,p) => p.y < best.y ? p : best);
  }

  function generateSegment(){
    const gapChance = Math.min(0.5, 0.2 + score*0.0025);
    const gap = Math.random() < gapChance ? 40 + Math.random()*40 : 0;
    let newIdx = Math.max(0, Math.min(LEVELS.length-1, levelIndex + (Math.floor(Math.random()*3)-1)));
    const width = 90 + Math.random()*120;
    const x = worldEdge + gap;
    const y = LEVELS[newIdx];
    platforms.push({ x, width, y });
    worldEdge = x + width;
    levelIndex = newIdx;
    const spikeChance = Math.min(0.55, 0.2 + score*0.003);
    if(gap === 0 && width > 70 && Math.random() < spikeChance){
      const sw = 18 + Math.random()*8;
      const sx = x + 26 + Math.random()*(width - 52 - sw);
      spikes.push({ x:sx, width:sw, height:20, y });
    }
  }

  function update(){
    frame++;
    score = Math.floor(frame/6);
    speed = Math.min(maxSpeed, baseSpeed + score*0.04);

    vy += gravity;
    playerY += vy;

    const plat = platformBelow();
    if(plat && playerY + playerH >= plat.y && vy >= 0){
      playerY = plat.y - playerH; vy = 0;
      if(!grounded) rotation = Math.round(rotation/90)*90;
      grounded = true;
    } else {
      grounded = false;
      rotation += 6;
      if(playerY > H + 40){ shake = 8; gameOver(); return; }
    }

    platforms.forEach(p => { p.x -= speed; });
    spikes.forEach(s => { s.x -= speed; });
    worldEdge -= speed;
    platforms = platforms.filter(p => p.x + p.width > 0);
    spikes = spikes.filter(s => s.x + s.width > 0);
    if(worldEdge < W + 60) generateSegment();

    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--; });
    particles = particles.filter(p => p.life > 0);
    if(shake > 0.1) shake *= 0.85; else shake = 0;

    const playerRect = { x:playerX, y:playerY, w:playerW, h:playerH };
    for(const s of spikes){
      const sRect = { x:s.x, y:s.y-s.height, w:s.width, h:s.height };
      if(rectsOverlap(playerRect, sRect)){
        shake = 8;
        burst(playerX+playerW/2, playerY+playerH/2, spikeColor, 16);
        gameOver();
        break;
      }
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.save();
    if(shake > 0.1) ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);

    platforms.forEach(p => {
      ctx.fillStyle = platformColor;
      ctx.fillRect(p.x, p.y, p.width, H - p.y);
      ctx.strokeStyle = platformEdge;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x+p.width, p.y); ctx.stroke();
    });

    ctx.fillStyle = spikeColor;
    spikes.forEach(s => {
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x+s.width/2, s.y-s.height);
      ctx.lineTo(s.x+s.width, s.y);
      ctx.closePath();
      ctx.fill();
    });

    ctx.save();
    ctx.translate(playerX+playerW/2, playerY+playerH/2);
    ctx.rotate(rotation*Math.PI/180);
    ctx.fillStyle = blockColor;
    ctx.fillRect(-playerW/2, -playerH/2, playerW, playerH);
    drawBlockFace(ctx, -playerW/2, -playerH/2, playerW, playerH, faceStyle, '#12091f');
    ctx.restore();

    particles.forEach(p => {
      ctx.globalAlpha = Math.max(p.life/22, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.fillStyle = '#f5f0ff';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('Score: ' + score, W-100, 20);

    if(!started){
      ctx.fillStyle = 'rgba(245,240,255,0.85)';
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillText('Click / tap / space to start', 90, H/2);
    }
    ctx.restore();
  }

  function loop(){
    if(!running) return;
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function jump(){
    if(!started){ started = true; running = true; document.getElementById('runnerStatus').textContent = 'Go!'; loop(); return; }
    if(!running) return;
    if(grounded){ vy = jumpVelocity; grounded = false; burst(playerX+playerW/2, playerY+playerH, blockColor, 6); }
  }

  function gameOver(){
    running = false;
    cancelAnimationFrame(rafId);
    draw();
    document.getElementById('runnerStatus').textContent = 'Crashed — score: ' + score;
    const record = isNewRecord('geo-jump', score, false);
    const coins = Math.min(45, Math.floor(score/2.5));
    awardCoins(coins);
    document.getElementById('runnerControls').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + coinToastHTML(coins) + `
      <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
        <input id="runnerName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="runnerSave">Save Score</button>
        <button class="btn btn-small btn-ghost" id="runnerRestart">Play Again</button>
      </div>`;
    document.getElementById('runnerSave').addEventListener('click', async () => {
      const name = document.getElementById('runnerName').value.trim() || 'Anonymous';
      await saveScore('geo-jump', name, score, false);
      document.getElementById('runnerLB').innerHTML = leaderboardHTML('geo-jump','pts');
      document.getElementById('runnerSave').disabled = true;
    });
    document.getElementById('runnerRestart').addEventListener('click', () => {
      reset();
      document.getElementById('runnerControls').innerHTML = '';
      document.getElementById('runnerStatus').textContent = 'Press Space, tap, or click to jump. Land on platforms, clear the gaps.';
      draw();
    });
  }

  function keyHandler(e){ if(e.code === 'Space' || e.code === 'ArrowUp'){ e.preventDefault(); jump(); } }
  document.addEventListener('keydown', keyHandler);
  canvas.addEventListener('mousedown', jump);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
  activeGameCleanup = () => { running = false; cancelAnimationFrame(rafId); document.removeEventListener('keydown', keyHandler); };

  draw();
}

/* ---------- Player-coded cabinets ---------- */

function openCustomCodeGame(g){
  openModal(`
    <h3>${g.emoji} ${escapeHTML(g.title)}</h3>
    <p class="ttt-status">Built by ${escapeHTML(g.creator)}. Runs sandboxed — isolated from the rest of the floor.</p>
    <iframe id="customFrame" sandbox="allow-scripts" style="width:100%; height:360px; border:1px solid var(--panel-edge); border-radius:10px; background:#000;"></iframe>
    <div id="customResult" style="margin-top:14px; text-align:center;"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="customLB" class="lb-live" data-game="${g.id}" data-unit="pts">${leaderboardHTML(g.id,'pts')}</div>
  `);

  const frame = document.getElementById('customFrame');
  frame.srcdoc = g.code;

  function onMessage(e){
    if(e.source !== frame.contentWindow) return;
    const data = e.data;
    if(!data || data.type !== 'arcade-score') return;
    const score = Number(data.score);
    if(!Number.isFinite(score)) return;
    const record = isNewRecord(g.id, score, false);
    const coins = Math.min(30, Math.max(1, Math.floor(score/5)));
    awardCoins(coins);
    document.getElementById('customResult').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + coinToastHTML(coins) + `
      <p class="toast">This cabinet reports a score of ${score}. Enter your name to save it:</p>
      <div style="display:flex; gap:8px; justify-content:center;">
        <input id="customName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="customSave">Save Score</button>
      </div>`;
    document.getElementById('customSave').addEventListener('click', async () => {
      const name = document.getElementById('customName').value.trim() || 'Anonymous';
      await saveScore(g.id, name, score, false);
      document.getElementById('customLB').innerHTML = leaderboardHTML(g.id,'pts');
      document.getElementById('customResult').innerHTML = '<p class="toast">Saved to the leaderboard.</p>';
    });
  }
  window.addEventListener('message', onMessage);

  activeGameCleanup = () => { window.removeEventListener('message', onMessage); };
}

/* ---------- Color Rush ---------- */

const RUSH_COLORS = [
  { name:'Cyan', hex:'#4deeea' }, { name:'Pink', hex:'#ff4d94' },
  { name:'Yellow', hex:'#ffcc33' }, { name:'Green', hex:'#5cffb1' },
];

function shuffle(arr){ return [...arr].sort(() => Math.random()-0.5); }

function openColorRush(){
  openModal(`
    <h3>&#127912; Color Rush</h3>
    <div class="blitz-timer" id="crTimer">20s left</div>
    <p class="form-note" style="text-align:center;">Tap the button that matches:</p>
    <div id="crTarget" style="width:56px; height:56px; border-radius:12px; margin:10px auto 18px auto; border:2px solid var(--panel-edge);"></div>
    <div class="color-row" id="crButtons"></div>
    <div class="blitz-score" id="crScore" style="text-align:center; margin-top:14px;">Score: 0</div>
    <div style="text-align:center; margin-top:14px;"><button class="btn btn-small btn-primary" id="crStart">Start</button></div>
    <div id="crResult"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="crLB" class="lb-live" data-game="color-rush" data-unit="pts">${leaderboardHTML('color-rush','pts')}</div>
  `);

  let score = 0, timeLeft = 20, timer = null, running = false, target = null;
  const targetEl = document.getElementById('crTarget');
  const buttonsEl = document.getElementById('crButtons');
  const scoreEl = document.getElementById('crScore');
  const timerEl = document.getElementById('crTimer');

  document.getElementById('crStart').addEventListener('click', start);

  function start(){
    if(running) return;
    running = true; score = 0; timeLeft = 20;
    scoreEl.textContent = 'Score: 0';
    document.getElementById('crStart').style.display = 'none';
    nextRound();
    timer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `${timeLeft}s left`;
      if(timeLeft <= 0) finish();
    }, 1000);
  }

  function nextRound(){
    target = RUSH_COLORS[Math.floor(Math.random()*RUSH_COLORS.length)];
    targetEl.style.background = target.hex;
    buttonsEl.innerHTML = shuffle(RUSH_COLORS).map(c =>
      `<button type="button" class="swatch" data-name="${c.name}" style="--sw:${c.hex}"></button>`
    ).join('');
    buttonsEl.querySelectorAll('.swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        if(!running) return;
        if(btn.dataset.name === target.name){ score++; scoreEl.textContent = `Score: ${score}`; }
        nextRound();
      });
    });
  }

  function finish(){
    clearInterval(timer);
    running = false;
    buttonsEl.innerHTML = '';
    const record = isNewRecord('color-rush', score, false);
    const coins = Math.min(25, score);
    awardCoins(coins);
    document.getElementById('crResult').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + coinToastHTML(coins) + `
      <p class="toast">Final score: ${score}. Enter your name to save it:</p>
      <div style="display:flex; gap:8px; justify-content:center;">
        <input id="crName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="crSave">Save Score</button>
      </div>`;
    document.getElementById('crSave').addEventListener('click', async () => {
      const name = document.getElementById('crName').value.trim() || 'Anonymous';
      await saveScore('color-rush', name, score, false);
      document.getElementById('crLB').innerHTML = leaderboardHTML('color-rush','pts');
      document.getElementById('crSave').disabled = true;
    });
  }
}

/* ---------- Mole Smash ---------- */

function openMoleSmash(){
  openModal(`
    <h3>&#128057; Mole Smash</h3>
    <div class="blitz-timer" id="msTimer">20s left</div>
    <div class="ttt-grid" id="msGrid" style="width:220px;"></div>
    <div class="blitz-score" id="msScore" style="text-align:center; margin-top:14px;">Score: 0</div>
    <div style="text-align:center; margin-top:14px;"><button class="btn btn-small btn-primary" id="msStart">Start</button></div>
    <div id="msResult"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="msLB" class="lb-live" data-game="mole-smash" data-unit="pts">${leaderboardHTML('mole-smash','pts')}</div>
  `);

  const grid = document.getElementById('msGrid');
  grid.innerHTML = Array(9).fill(0).map((_,i) => `<div class="ttt-cell mole-hole" data-i="${i}"></div>`).join('');

  let score = 0, timeLeft = 20, timer = null, moleTimer = null, running = false, activeIndex = -1;
  const scoreEl = document.getElementById('msScore');
  const timerEl = document.getElementById('msTimer');

  document.getElementById('msStart').addEventListener('click', start);

  function start(){
    if(running) return;
    running = true; score = 0; timeLeft = 20;
    scoreEl.textContent = 'Score: 0';
    document.getElementById('msStart').style.display = 'none';
    moveMole();
    timer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `${timeLeft}s left`;
      if(timeLeft <= 0) finish();
    }, 1000);
  }

  function moveMole(){
    if(!running) return;
    if(activeIndex >= 0){
      const prev = grid.querySelector(`[data-i="${activeIndex}"]`);
      if(prev){ prev.textContent = ''; prev.classList.remove('active'); }
    }
    let next;
    do { next = Math.floor(Math.random()*9); } while(next === activeIndex);
    activeIndex = next;
    const cell = grid.querySelector(`[data-i="${activeIndex}"]`);
    cell.textContent = '\u{1F439}';
    cell.classList.add('active');
    const upTime = Math.max(380, 950 - score*20);
    clearTimeout(moleTimer);
    moleTimer = setTimeout(moveMole, upTime);
  }

  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.mole-hole');
    if(!cell || !running) return;
    if(parseInt(cell.dataset.i,10) === activeIndex){
      score++; scoreEl.textContent = `Score: ${score}`;
      clearTimeout(moleTimer);
      moveMole();
    }
  });

  function finish(){
    clearInterval(timer);
    clearTimeout(moleTimer);
    running = false;
    if(activeIndex >= 0){
      const cell = grid.querySelector(`[data-i="${activeIndex}"]`);
      if(cell){ cell.textContent = ''; cell.classList.remove('active'); }
    }
    const record = isNewRecord('mole-smash', score, false);
    const coins = Math.min(30, score*2);
    awardCoins(coins);
    document.getElementById('msResult').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + coinToastHTML(coins) + `
      <p class="toast">Final score: ${score}. Enter your name to save it:</p>
      <div style="display:flex; gap:8px; justify-content:center;">
        <input id="msName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="msSave">Save Score</button>
      </div>`;
    document.getElementById('msSave').addEventListener('click', async () => {
      const name = document.getElementById('msName').value.trim() || 'Anonymous';
      await saveScore('mole-smash', name, score, false);
      document.getElementById('msLB').innerHTML = leaderboardHTML('mole-smash','pts');
      document.getElementById('msSave').disabled = true;
    });
  }

  activeGameCleanup = () => { clearInterval(timer); clearTimeout(moleTimer); running = false; };
}

/* ---------- Neon Obby ---------- */
function buildObbyLevel(n){
  const groundY = 236, groundH = 80;
  const platforms = [], spikes = [];
  let x = 0;
  const segs = 5 + n;
  const gapBase = 58 + n * 7;
  for(let i = 0; i < segs; i++){
    const w = 120 + Math.random() * 80;
    platforms.push({ x, y: groundY, w, h: groundH });
    if(i > 0 && Math.random() < 0.35 + n * 0.08){
      spikes.push({ x: x + w / 2 - 9, y: groundY - 14, w: 18, h: 14 });
    }
    x += w;
    if(i < segs - 1){
      const gap = Math.min(108, gapBase + Math.random() * 38);
      if(gap > 78 || Math.random() < 0.4){
        platforms.push({ x: x + gap / 2 - 32, y: groundY - 66 - Math.random() * 26, w: 64, h: 14 });
      }
      x += gap;
    }
  }
  platforms.push({ x, y: groundY, w: 190, h: groundH });
  return { platforms, spikes, goalX: x + 130, startX: 24, groundY };
}

function openNeonObby(){
  openModal(`
    <h3>&#129001; Neon Obby</h3>
    <p class="ttt-status" id="obbyStatus">Arrows / A&D to run, Space or &uarr; to jump. Reach the flag &#127937;. You have 3 lives.</p>
    <canvas id="obbyCanvas" width="460" height="260"
      style="width:100%; max-width:460px; display:block; margin:0 auto; background:var(--void); border:1px solid var(--panel-edge); border-radius:10px; touch-action:none; cursor:pointer;"></canvas>
    <div id="obbyControls" style="text-align:center; margin-top:14px;"></div>
    <h4>Top 10 — most stages cleared wins</h4>
    <div id="obbyLB" class="lb-live" data-game="neon-obby" data-unit="stages">${leaderboardHTML('neon-obby','stages')}</div>
  `);

  const canvas = document.getElementById('obbyCanvas');
  const ctx = canvas.getContext('2d');
  const W = 460, H = 260;
  const gravity = 0.62, moveSpeed = 3.3, jumpV = -11.4;
  const accent = '#4deeea', spikeColor = '#ff4d94', goalColor = '#ffcc33';
  const keys = {};
  let level, player, cam, lives, stages, started, running, rafId;

  function loadLevel(n){
    level = buildObbyLevel(n);
    player = { x: level.startX, y: level.groundY - 24, w: 20, h: 24, vx: 0, vy: 0, onGround: false };
    cam = 0;
  }
  function reset(){
    lives = 3; stages = 0; started = false; running = false;
    loadLevel(0);
  }
  reset();

  function overlap(a, b){ return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  function die(){
    lives--;
    if(lives <= 0){ gameOver(); return; }
    document.getElementById('obbyStatus').textContent = `Ouch! ${lives} ${lives===1?'life':'lives'} left — stage ${stages+1}.`;
    loadLevel(stages);
  }

  function nextStage(){
    stages++;
    awardCoins(6);
    document.getElementById('obbyStatus').textContent = `Stage cleared! Now on stage ${stages+1}.`;
    loadLevel(stages);
  }

  function update(){
    player.vx = 0;
    if(keys.left) player.vx = -moveSpeed;
    if(keys.right) player.vx = moveSpeed;
    player.vy += gravity;
    if(player.vy > 14) player.vy = 14;

    player.x += player.vx;
    for(const p of level.platforms){
      if(overlap(player, p)){
        if(player.vx > 0) player.x = p.x - player.w;
        else if(player.vx < 0) player.x = p.x + p.w;
      }
    }
    if(player.x < 0) player.x = 0;

    player.y += player.vy;
    player.onGround = false;
    for(const p of level.platforms){
      if(overlap(player, p)){
        if(player.vy > 0){ player.y = p.y - player.h; player.vy = 0; player.onGround = true; }
        else if(player.vy < 0){ player.y = p.y + p.h; player.vy = 0; }
      }
    }

    for(const s of level.spikes){ if(overlap(player, s)){ die(); return; } }
    if(player.y > H + 60){ die(); return; }
    if(player.x + player.w >= level.goalX){ nextStage(); return; }
  }

  function draw(){
    cam = Math.max(0, player.x - 150);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(-cam, 0);

    ctx.fillStyle = '#241539';
    for(const p of level.platforms) ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = accent; ctx.lineWidth = 2;
    for(const p of level.platforms) ctx.strokeRect(p.x, p.y, p.w, 3);

    ctx.fillStyle = spikeColor;
    for(const s of level.spikes){
      ctx.beginPath();
      ctx.moveTo(s.x, s.y + s.h);
      ctx.lineTo(s.x + s.w / 2, s.y);
      ctx.lineTo(s.x + s.w, s.y + s.h);
      ctx.closePath(); ctx.fill();
    }

    ctx.strokeStyle = goalColor; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(level.goalX, level.groundY); ctx.lineTo(level.goalX, level.groundY - 60); ctx.stroke();
    ctx.fillStyle = goalColor;
    ctx.fillRect(level.goalX, level.groundY - 60, 26, 18);

    ctx.fillStyle = accent;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.restore();

    ctx.fillStyle = '#f5f0ff';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('Stage ' + (stages + 1), 12, 20);
    ctx.fillText('Lives ' + '\u2665'.repeat(Math.max(0, lives)), 12, 38);
    if(!started){
      ctx.fillStyle = 'rgba(245,240,255,0.85)';
      ctx.fillText('Press \u2192 or Space to begin', 130, H / 2);
    }
  }

  function loop(){
    if(!running) return;
    update();
    if(running) draw();
    if(running) rafId = requestAnimationFrame(loop);
  }

  function begin(){
    if(started) return;
    started = true; running = true;
    document.getElementById('obbyStatus').textContent = 'Go! Reach the flag.';
    loop();
  }

  function jump(){
    begin();
    if(running && player.onGround){ player.vy = jumpV; player.onGround = false; }
  }

  function gameOver(){
    running = false;
    cancelAnimationFrame(rafId);
    document.getElementById('obbyStatus').textContent = 'Run over — stages cleared: ' + stages;
    const record = isNewRecord('neon-obby', stages, false);
    document.getElementById('obbyControls').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + `
      <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
        <input id="obbyName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="obbySave">Save Score</button>
        <button class="btn btn-small btn-ghost" id="obbyRestart">Play Again</button>
      </div>`;
    document.getElementById('obbySave').addEventListener('click', async () => {
      const name = document.getElementById('obbyName').value.trim() || 'Anonymous';
      await saveScore('neon-obby', name, stages, false);
      document.getElementById('obbyLB').innerHTML = leaderboardHTML('neon-obby','stages');
      document.getElementById('obbySave').disabled = true;
    });
    document.getElementById('obbyRestart').addEventListener('click', () => {
      reset();
      document.getElementById('obbyControls').innerHTML = '';
      document.getElementById('obbyStatus').textContent = 'Arrows / A&D to run, Space or \u2191 to jump. Reach the flag.';
      draw();
    });
  }

  function keyDown(e){
    if(e.code === 'ArrowLeft' || e.code === 'KeyA'){ keys.left = true; }
    else if(e.code === 'ArrowRight' || e.code === 'KeyD'){ keys.right = true; }
    else if(e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW'){ e.preventDefault(); jump(); }
  }
  function keyUp(e){
    if(e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    else if(e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  }
  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);
  canvas.addEventListener('mousedown', jump);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
  activeGameCleanup = () => { running = false; cancelAnimationFrame(rafId); document.removeEventListener('keydown', keyDown); document.removeEventListener('keyup', keyUp); };

  draw();
}

/* ---------- Neon Snake ---------- */
function openSnake(){
  openModal(`
    <h3>&#128013; Neon Snake</h3>
    <p class="ttt-status" id="snakeStatus">Arrow keys or WASD to steer. Eat the pellets, avoid the walls and your own tail.</p>
    <canvas id="snakeCanvas" width="440" height="300"
      style="width:100%; max-width:440px; display:block; margin:0 auto; background:var(--void); border:1px solid var(--panel-edge); border-radius:10px; touch-action:none; cursor:pointer;"></canvas>
    <div id="snakeControls" style="text-align:center; margin-top:14px;"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="snakeLB" class="lb-live" data-game="snake" data-unit="pts">${leaderboardHTML('snake','pts')}</div>
  `);

  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');
  const cell = 20, cols = 22, rows = 15;
  const headColor = '#4deeea', bodyColor = '#2bb6b2', foodColor = '#ff4d94';
  let snake, dir, nextDir, food, score, running, started, timer, speed;

  function placeFood(){
    let ok = false;
    while(!ok){
      food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
      ok = !snake.some(s => s.x === food.x && s.y === food.y);
    }
  }
  function reset(){
    snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }];
    dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
    score = 0; running = false; started = false; speed = 130;
    placeFood();
  }
  reset();

  function step(){
    if(!running) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if(head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows || snake.some(s => s.x === head.x && s.y === head.y)){
      gameOver(); return;
    }
    snake.unshift(head);
    if(head.x === food.x && head.y === food.y){
      score++;
      awardCoins(1);
      placeFood();
      if(speed > 70) { speed -= 3; clearInterval(timer); timer = setInterval(step, speed); }
    } else {
      snake.pop();
    }
    draw();
  }

  function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = foodColor;
    ctx.beginPath();
    ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? headColor : bodyColor;
      ctx.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2);
    });
    ctx.fillStyle = '#f5f0ff';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('Score: ' + score, canvas.width - 90, 18);
    if(!started){
      ctx.fillStyle = 'rgba(245,240,255,0.85)';
      ctx.fillText('Press an arrow key to start', 110, canvas.height / 2);
    }
  }

  function begin(){
    if(started) return;
    started = true; running = true;
    timer = setInterval(step, speed);
  }

  function gameOver(){
    running = false;
    clearInterval(timer);
    document.getElementById('snakeStatus').textContent = 'Game over — score: ' + score;
    const record = isNewRecord('snake', score, false);
    document.getElementById('snakeControls').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + `
      <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
        <input id="snakeName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="snakeSave">Save Score</button>
        <button class="btn btn-small btn-ghost" id="snakeRestart">Play Again</button>
      </div>`;
    document.getElementById('snakeSave').addEventListener('click', async () => {
      const name = document.getElementById('snakeName').value.trim() || 'Anonymous';
      await saveScore('snake', name, score, false);
      document.getElementById('snakeLB').innerHTML = leaderboardHTML('snake','pts');
      document.getElementById('snakeSave').disabled = true;
    });
    document.getElementById('snakeRestart').addEventListener('click', () => {
      reset();
      document.getElementById('snakeControls').innerHTML = '';
      document.getElementById('snakeStatus').textContent = 'Arrow keys or WASD to steer.';
      draw();
    });
  }

  function keyHandler(e){
    let nd = null;
    if(e.code === 'ArrowUp' || e.code === 'KeyW') nd = { x: 0, y: -1 };
    else if(e.code === 'ArrowDown' || e.code === 'KeyS') nd = { x: 0, y: 1 };
    else if(e.code === 'ArrowLeft' || e.code === 'KeyA') nd = { x: -1, y: 0 };
    else if(e.code === 'ArrowRight' || e.code === 'KeyD') nd = { x: 1, y: 0 };
    if(!nd) return;
    e.preventDefault();
    begin();
    if(nd.x !== -dir.x || nd.y !== -dir.y){ nextDir = nd; }
  }
  document.addEventListener('keydown', keyHandler);
  activeGameCleanup = () => { running = false; clearInterval(timer); document.removeEventListener('keydown', keyHandler); };

  draw();
}

/* ---------- 2048 ---------- */
function openTwenty48(){
  openModal(`
    <h3>&#129718; 2048</h3>
    <p class="ttt-status" id="t48Status">Arrow keys or WASD to slide. Merge matching tiles to reach 2048.</p>
    <canvas id="t48Canvas" width="300" height="300"
      style="width:100%; max-width:300px; display:block; margin:0 auto; background:var(--void); border:1px solid var(--panel-edge); border-radius:10px; touch-action:none;"></canvas>
    <div id="t48Controls" style="text-align:center; margin-top:14px;"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="t48LB" class="lb-live" data-game="twenty48" data-unit="pts">${leaderboardHTML('twenty48','pts')}</div>
  `);

  const canvas = document.getElementById('t48Canvas');
  const ctx = canvas.getContext('2d');
  const N = 4, pad = 8, size = (300 - pad * (N + 1)) / N;
  const COLORS = {
    2:'#3a2359', 4:'#4a2d70', 8:'#6a2d70', 16:'#8a2d6a', 32:'#b3306e',
    64:'#ff4d94', 128:'#e0a800', 256:'#f0b400', 512:'#ffcc33', 1024:'#4deeea', 2048:'#7afcff'
  };
  let grid, score, over;

  function reset(){
    grid = Array.from({ length: N }, () => Array(N).fill(0));
    score = 0; over = false;
    addTile(); addTile();
    draw();
  }
  function addTile(){
    const empty = [];
    for(let r = 0; r < N; r++) for(let c = 0; c < N; c++) if(grid[r][c] === 0) empty.push([r, c]);
    if(!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
  function slide(row){
    let arr = row.filter(v => v !== 0);
    for(let i = 0; i < arr.length - 1; i++){
      if(arr[i] === arr[i + 1]){ arr[i] *= 2; score += arr[i]; arr[i + 1] = 0; }
    }
    arr = arr.filter(v => v !== 0);
    while(arr.length < N) arr.push(0);
    return arr;
  }
  function rotate(g){
    const n = g.length;
    const res = Array.from({ length: n }, () => Array(n).fill(0));
    for(let r = 0; r < n; r++) for(let c = 0; c < n; c++) res[c][n - 1 - r] = g[r][c];
    return res;
  }
  function move(dir){
    if(over) return;
    let g = grid.map(row => row.slice());
    const rot = { left: 0, up: 3, right: 2, down: 1 }[dir];
    for(let i = 0; i < rot; i++) g = rotate(g);
    g = g.map(row => slide(row));
    for(let i = 0; i < (4 - rot) % 4; i++) g = rotate(g);
    const changed = JSON.stringify(g) !== JSON.stringify(grid);
    if(changed){
      grid = g;
      addTile();
      draw();
      if(isOver()){ over = true; endGame(); }
    }
  }
  function isOver(){
    for(let r = 0; r < N; r++) for(let c = 0; c < N; c++){
      if(grid[r][c] === 0) return false;
      if(c < N - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if(r < N - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
    return true;
  }
  function draw(){
    ctx.clearRect(0, 0, 300, 300);
    for(let r = 0; r < N; r++){
      for(let c = 0; c < N; c++){
        const x = pad + c * (size + pad), y = pad + r * (size + pad);
        const v = grid[r][c];
        ctx.fillStyle = v ? (COLORS[v] || '#7afcff') : 'rgba(255,255,255,0.05)';
        ctx.fillRect(x, y, size, size);
        if(v){
          ctx.fillStyle = v <= 4 ? '#f5f0ff' : '#12091f';
          ctx.font = 'bold ' + (v >= 1024 ? 20 : 26) + 'px "JetBrains Mono", monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(v, x + size / 2, y + size / 2 + 1);
        }
      }
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    document.getElementById('t48Status').textContent = 'Score: ' + score;
  }

  function endGame(){
    document.getElementById('t48Status').textContent = 'No moves left — score: ' + score;
    const record = isNewRecord('twenty48', score, false);
    awardCoins(Math.min(40, Math.floor(score / 40)));
    document.getElementById('t48Controls').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + `
      <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
        <input id="t48Name" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="t48Save">Save Score</button>
        <button class="btn btn-small btn-ghost" id="t48Restart">Play Again</button>
      </div>`;
    document.getElementById('t48Save').addEventListener('click', async () => {
      const name = document.getElementById('t48Name').value.trim() || 'Anonymous';
      await saveScore('twenty48', name, score, false);
      document.getElementById('t48LB').innerHTML = leaderboardHTML('twenty48','pts');
      document.getElementById('t48Save').disabled = true;
    });
    document.getElementById('t48Restart').addEventListener('click', () => {
      document.getElementById('t48Controls').innerHTML = '';
      reset();
    });
  }

  function keyHandler(e){
    let dir = null;
    if(e.code === 'ArrowUp' || e.code === 'KeyW') dir = 'up';
    else if(e.code === 'ArrowDown' || e.code === 'KeyS') dir = 'down';
    else if(e.code === 'ArrowLeft' || e.code === 'KeyA') dir = 'left';
    else if(e.code === 'ArrowRight' || e.code === 'KeyD') dir = 'right';
    if(!dir) return;
    e.preventDefault();
    move(dir);
  }
  document.addEventListener('keydown', keyHandler);
  activeGameCleanup = () => { document.removeEventListener('keydown', keyHandler); };

  reset();
}

/* ---------- Flappy Neon ---------- */
function openFlappy(){
  openModal(`
    <h3>&#128036; Flappy Neon</h3>
    <p class="ttt-status" id="flapStatus">Click, tap, or press Space to flap. Thread the gaps.</p>
    <canvas id="flapCanvas" width="320" height="360"
      style="width:100%; max-width:320px; display:block; margin:0 auto; background:var(--void); border:1px solid var(--panel-edge); border-radius:10px; touch-action:none; cursor:pointer;"></canvas>
    <div id="flapControls" style="text-align:center; margin-top:14px;"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="flapLB" class="lb-live" data-game="flappy" data-unit="pts">${leaderboardHTML('flappy','pts')}</div>
  `);

  const canvas = document.getElementById('flapCanvas');
  const ctx = canvas.getContext('2d');
  const W = 320, H = 360;
  const gravity = 0.5, flapV = -7.4, pipeW = 46, gapH = 120, pipeSpeed = 2.2;
  const birdColor = '#ffcc33', pipeColor = '#4deeea';
  let birdY, vy, pipes, score, started, running, rafId, spawnTimer;

  function reset(){
    birdY = H / 2; vy = 0; pipes = []; score = 0;
    started = false; running = false; spawnTimer = 0;
  }
  reset();

  function spawnPipe(){
    const gapY = 50 + Math.random() * (H - gapH - 100);
    pipes.push({ x: W, gapY, passed: false });
  }

  function update(){
    vy += gravity;
    birdY += vy;
    spawnTimer--;
    if(spawnTimer <= 0){ spawnPipe(); spawnTimer = 95; }
    pipes.forEach(p => { p.x -= pipeSpeed; });
    pipes = pipes.filter(p => p.x + pipeW > 0);

    const bx = 70, br = 12;
    for(const p of pipes){
      if(!p.passed && p.x + pipeW < bx){ p.passed = true; score++; awardCoins(1); }
      const inX = bx + br > p.x && bx - br < p.x + pipeW;
      if(inX && (birdY - br < p.gapY || birdY + br > p.gapY + gapH)){ gameOver(); return; }
    }
    if(birdY + br > H || birdY - br < 0){ gameOver(); }
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = pipeColor;
    for(const p of pipes){
      ctx.fillRect(p.x, 0, pipeW, p.gapY);
      ctx.fillRect(p.x, p.gapY + gapH, pipeW, H - p.gapY - gapH);
    }
    ctx.fillStyle = birdColor;
    ctx.beginPath(); ctx.arc(70, birdY, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f5f0ff';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText(score, W / 2 - 5, 30);
    if(!started){
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(245,240,255,0.85)';
      ctx.fillText('Tap / Space to start', 90, H / 2 - 30);
    }
  }

  function loop(){
    if(!running) return;
    update();
    if(running) draw();
    if(running) rafId = requestAnimationFrame(loop);
  }

  function flap(){
    if(!started){ started = true; running = true; loop(); }
    if(running){ vy = flapV; }
  }

  function gameOver(){
    running = false;
    cancelAnimationFrame(rafId);
    draw();
    document.getElementById('flapStatus').textContent = 'Down — score: ' + score;
    const record = isNewRecord('flappy', score, false);
    document.getElementById('flapControls').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + `
      <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
        <input id="flapName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="flapSave">Save Score</button>
        <button class="btn btn-small btn-ghost" id="flapRestart">Play Again</button>
      </div>`;
    document.getElementById('flapSave').addEventListener('click', async () => {
      const name = document.getElementById('flapName').value.trim() || 'Anonymous';
      await saveScore('flappy', name, score, false);
      document.getElementById('flapLB').innerHTML = leaderboardHTML('flappy','pts');
      document.getElementById('flapSave').disabled = true;
    });
    document.getElementById('flapRestart').addEventListener('click', () => {
      reset();
      document.getElementById('flapControls').innerHTML = '';
      document.getElementById('flapStatus').textContent = 'Click, tap, or press Space to flap.';
      draw();
    });
  }

  function keyHandler(e){ if(e.code === 'Space' || e.code === 'ArrowUp'){ e.preventDefault(); flap(); } }
  document.addEventListener('keydown', keyHandler);
  canvas.addEventListener('mousedown', flap);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); });
  activeGameCleanup = () => { running = false; cancelAnimationFrame(rafId); document.removeEventListener('keydown', keyHandler); };

  draw();
}

/* ---------- Realtime online lobby (shared by Pong & Blade Ball) ---------- */
function openRealtimeLobby(cfg){
  if(!ArcadeNet.rt.available){
    openModal(`
      <h3>${cfg.emoji} ${escapeHTML(cfg.title)}</h3>
      <p class="ttt-status">The floor server isn't connected, so online play is unavailable. Open the hosted link (or run the app with <code>npm start</code>) to duel a friend.</p>
    `);
    return;
  }
  openModal(`
    <h3>${cfg.emoji} ${escapeHTML(cfg.title)}</h3>
    <div class="field" style="margin-bottom:16px;">
      <label for="rtName">Your name</label>
      <input type="text" id="rtName" maxlength="16" placeholder="Player" value="${escapeHTML(getSavedName())}" />
    </div>
    <p class="ttt-status">${escapeHTML(cfg.blurb)}</p>
    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:8px;">
      <button class="btn btn-small btn-primary" id="rtQuick">&#9889; Quick Match</button>
      <button class="btn btn-small btn-ghost" id="rtCreate">&#128274; Create Private Room</button>
      <div style="display:flex; gap:8px;">
        <input type="text" id="rtCode" maxlength="4" placeholder="CODE" style="flex:1; text-transform:uppercase; background:var(--void); border:1px solid var(--panel-edge); border-radius:8px; padding:9px 12px; color:var(--text); font-family:var(--font-mono);" />
        <button class="btn btn-small btn-ghost" id="rtJoin">Join</button>
      </div>
    </div>
    <p class="lb-empty" style="text-align:center;">Two players needed — open the link on another device/tab.</p>
  `);
  const nameInput = document.getElementById('rtName');
  const getName = () => { const n = nameInput.value.trim() || 'Player'; saveName(n); return n; };
  document.getElementById('rtQuick').addEventListener('click', () => cfg.play('quick', getName()));
  document.getElementById('rtCreate').addEventListener('click', () => cfg.play('create', getName()));
  document.getElementById('rtJoin').addEventListener('click', () => {
    const code = document.getElementById('rtCode').value.trim().toUpperCase();
    if(code.length < 4) return;
    cfg.play('join', getName(), code);
  });
}

/* ---------- Neon Pong (real-time online 1v1) ---------- */
function openPong(){
  openRealtimeLobby({
    game:'pong', title:'Neon Pong', emoji:'🏓',
    blurb:'Real-time 1v1 — first to 7 wins. Move with your mouse or the arrow keys.',
    play:(mode,name,code) => openPongOnline(mode,name,code),
  });
}
function openPongOnline(mode, name, code){
  const W = 600, H = 360, PADDLE_H = 74, PADDLE_W = 12, BALL_R = 8;
  openModal(`
    <h3>&#127955; Neon Pong</h3>
    <p class="ttt-status" id="pgStatus">Connecting...</p>
    <div id="pgRoom" style="text-align:center; margin-bottom:8px;"></div>
    <div style="display:flex; justify-content:center;">
      <canvas id="pgCanvas" width="${W}" height="${H}" style="max-width:100%; background:var(--void); border:1px solid var(--panel-edge); border-radius:10px; cursor:none;"></canvas>
    </div>
    <div id="pgCoin" style="text-align:center;"></div>
    <div style="text-align:center; margin-top:12px;">
      <button class="btn btn-small btn-ghost" id="pgBack">Leave</button>
    </div>
  `);
  const canvas = document.getElementById('pgCanvas');
  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('pgStatus');
  const roomEl = document.getElementById('pgRoom');
  let mySide = null, opponent = null, over = false, awarded = false;
  let st = { ball:{x:W/2,y:H/2}, paddles:{left:H/2,right:H/2}, score:{left:0,right:0}, serving:true };

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.setLineDash([8,12]); ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = mySide === 'left' ? '#22d3ee' : '#64748b';
    ctx.fillRect(20, st.paddles.left - PADDLE_H/2, PADDLE_W, PADDLE_H);
    ctx.fillStyle = mySide === 'right' ? '#22d3ee' : '#64748b';
    ctx.fillRect(W-20-PADDLE_W, st.paddles.right - PADDLE_H/2, PADDLE_W, PADDLE_H);
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.arc(st.ball.x, st.ball.y, BALL_R, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '28px monospace'; ctx.textAlign = 'center';
    ctx.fillText(st.score.left, W/2 - 40, 40);
    ctx.fillText(st.score.right, W/2 + 40, 40);
  }
  draw();

  function sendPaddle(clientY){
    if(over || !mySide) return;
    const rect = canvas.getBoundingClientRect();
    const y = (clientY - rect.top) * (H / rect.height);
    ArcadeNet.rt.input({ paddle: Math.max(0, Math.min(H, y)) });
  }
  function onMove(e){ sendPaddle(e.clientY); }
  function onTouch(e){ e.preventDefault(); if(e.touches[0]) sendPaddle(e.touches[0].clientY); }
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('touchmove', onTouch, { passive:false });
  let keyDir = 0;
  function keyDown(e){ if(e.key==='ArrowUp'){keyDir=-1;e.preventDefault();} else if(e.key==='ArrowDown'){keyDir=1;e.preventDefault();} }
  function keyUp(e){ if(e.key==='ArrowUp'||e.key==='ArrowDown') keyDir=0; }
  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);
  let keyTimer = setInterval(() => {
    if(keyDir && mySide && !over){
      const cur = st.paddles[mySide] + keyDir * 14;
      ArcadeNet.rt.input({ paddle: Math.max(0, Math.min(H, cur)) });
    }
  }, 40);

  const unsubs = [];
  unsubs.push(ArcadeNet.on('rt:waiting', (d) => {
    if(d && d.mode === 'room' && d.code){
      statusEl.textContent = 'Share this code with a friend:';
      roomEl.innerHTML = `<span style="font-family:var(--font-display); font-size:22px; color:var(--yellow); letter-spacing:4px;">${escapeHTML(d.code)}</span>`;
    } else { statusEl.textContent = 'Searching for an opponent...'; }
  }));
  unsubs.push(ArcadeNet.on('rt:matched', (d) => {
    mySide = d.side; opponent = d.opponent; over = false; awarded = false;
    roomEl.innerHTML = `You're <strong style="color:var(--cyan);">${mySide === 'left' ? 'left' : 'right'}</strong> vs <strong>${escapeHTML(opponent)}</strong>`;
    statusEl.textContent = 'First to 7. Go!';
  }));
  unsubs.push(ArcadeNet.on('rt:state', (d) => { st = d; draw(); }));
  unsubs.push(ArcadeNet.on('rt:over', (d) => {
    over = true;
    const iWon = d.winner === mySide;
    statusEl.textContent = iWon ? 'You win the match! 🏆' : `${escapeHTML(opponent || 'Opponent')} takes it.`;
    if(iWon && !awarded){ awarded = true; awardCoins(d.coins || 0); document.getElementById('pgCoin').innerHTML = coinToastHTML(d.coins || 0); }
  }));
  unsubs.push(ArcadeNet.on('rt:opponent_left', () => { over = true; statusEl.textContent = 'Your opponent left.'; }));
  unsubs.push(ArcadeNet.on('rt:error', (d) => { statusEl.textContent = (d && d.message) || 'Something went wrong.'; }));

  document.getElementById('pgBack').addEventListener('click', () => openPong());
  activeGameCleanup = () => {
    unsubs.forEach(u => u());
    clearInterval(keyTimer);
    document.removeEventListener('keydown', keyDown);
    document.removeEventListener('keyup', keyUp);
    ArcadeNet.rt.leave();
  };

  if(mode === 'quick') ArcadeNet.rt.quickMatch('pong', name);
  else if(mode === 'create') ArcadeNet.rt.createRoom('pong', name);
  else if(mode === 'join') ArcadeNet.rt.joinRoom('pong', code, name);
}

/* ---------- Blade Ball (real-time online reflex duel) ---------- */
function openBladeBall(){
  openRealtimeLobby({
    game:'blade', title:'Blade Ball', emoji:'⚔️',
    blurb:'The ball rockets between you two. When it comes at you, PARRY (Space / click) in time — miss and you lose.',
    play:(mode,name,code) => openBladeOnline(mode,name,code),
  });
}
function openBladeOnline(mode, name, code){
  const W = 560, H = 170;
  openModal(`
    <h3>&#9876;&#65039; Blade Ball</h3>
    <p class="ttt-status" id="blStatus">Connecting...</p>
    <div id="blRoom" style="text-align:center; margin-bottom:8px;"></div>
    <div style="display:flex; justify-content:center;">
      <canvas id="blCanvas" width="${W}" height="${H}" style="max-width:100%; background:var(--void); border:1px solid var(--panel-edge); border-radius:10px;"></canvas>
    </div>
    <div style="text-align:center; margin-top:10px;">
      <button class="btn btn-primary" id="blParry" style="display:none;">&#9876;&#65039; PARRY!</button>
    </div>
    <div id="blCoin" style="text-align:center;"></div>
    <div style="text-align:center; margin-top:12px;">
      <button class="btn btn-small btn-ghost" id="blBack">Leave</button>
    </div>
  `);
  const canvas = document.getElementById('blCanvas');
  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('blStatus');
  const roomEl = document.getElementById('blRoom');
  const parryBtn = document.getElementById('blParry');
  let mySide = null, opponent = null, over = false, awarded = false;
  let st = { t:0.5, dir:1, hits:0, danger:null, started:false };

  const LX = 60, RX = W - 60;
  function draw(){
    ctx.clearRect(0,0,W,H);
    // track
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(LX, H/2); ctx.lineTo(RX, H/2); ctx.stroke();
    // avatars
    const drawFighter = (x, side) => {
      const mine = side === mySide;
      const inDanger = st.danger === side;
      ctx.fillStyle = inDanger ? '#f43f5e' : (mine ? '#22d3ee' : '#a3a3a3');
      ctx.beginPath(); ctx.arc(x, H/2, 22, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(mine ? 'YOU' : (side === 'left' ? 'L' : 'R'), x, H/2 + 42);
    };
    drawFighter(LX, 'left');
    drawFighter(RX, 'right');
    // ball
    const bx = LX + st.t * (RX - LX);
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(bx, H/2, 12, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '13px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Rally: ' + st.hits, W/2, 24);
  }
  draw();

  let raf = null;
  function loop(){ draw(); raf = requestAnimationFrame(loop); }
  loop();

  function parry(){ if(!over && st.danger === mySide) ArcadeNet.rt.input({ type:'parry' }); }
  parryBtn.addEventListener('click', parry);
  function keyHandler(e){ if(e.code === 'Space'){ e.preventDefault(); parry(); } }
  document.addEventListener('keydown', keyHandler);
  canvas.addEventListener('mousedown', parry);

  const unsubs = [];
  unsubs.push(ArcadeNet.on('rt:waiting', (d) => {
    if(d && d.mode === 'room' && d.code){
      statusEl.textContent = 'Share this code with a friend:';
      roomEl.innerHTML = `<span style="font-family:var(--font-display); font-size:22px; color:var(--yellow); letter-spacing:4px;">${escapeHTML(d.code)}</span>`;
    } else { statusEl.textContent = 'Searching for an opponent...'; }
  }));
  unsubs.push(ArcadeNet.on('rt:matched', (d) => {
    mySide = d.side; opponent = d.opponent; over = false; awarded = false;
    roomEl.innerHTML = `You're the <strong style="color:var(--cyan);">${mySide}</strong> fighter vs <strong>${escapeHTML(opponent)}</strong>`;
    statusEl.textContent = 'Get ready...';
  }));
  unsubs.push(ArcadeNet.on('rt:state', (d) => {
    st = d;
    if(over) return;
    if(st.danger === mySide){ parryBtn.style.display = 'inline-flex'; statusEl.textContent = 'PARRY NOW!'; }
    else { parryBtn.style.display = 'none'; statusEl.textContent = st.started ? (st.dir === (mySide==='left'?1:-1) ? 'You sent it — watch out for the return.' : 'Incoming...') : 'Get ready...'; }
  }));
  unsubs.push(ArcadeNet.on('rt:over', (d) => {
    over = true; parryBtn.style.display = 'none';
    const iWon = d.winner === mySide;
    statusEl.textContent = iWon ? 'You win the duel! 🏆' : `${escapeHTML(opponent || 'Opponent')} wins — you got hit.`;
    if(iWon && !awarded){ awarded = true; awardCoins(d.coins || 0); document.getElementById('blCoin').innerHTML = coinToastHTML(d.coins || 0); }
  }));
  unsubs.push(ArcadeNet.on('rt:opponent_left', () => { over = true; parryBtn.style.display = 'none'; statusEl.textContent = 'Your opponent left.'; }));
  unsubs.push(ArcadeNet.on('rt:error', (d) => { statusEl.textContent = (d && d.message) || 'Something went wrong.'; }));

  document.getElementById('blBack').addEventListener('click', () => openBladeBall());
  activeGameCleanup = () => {
    unsubs.forEach(u => u());
    cancelAnimationFrame(raf);
    document.removeEventListener('keydown', keyHandler);
    ArcadeNet.rt.leave();
  };

  if(mode === 'quick') ArcadeNet.rt.quickMatch('blade', name);
  else if(mode === 'create') ArcadeNet.rt.createRoom('blade', name);
  else if(mode === 'join') ArcadeNet.rt.joinRoom('blade', code, name);
}

/* ---------- Fireboy & Watergirl (faithful co-op clone) ---------- */
const FW_W = 720, FW_H = 460;
function fwLevels(){
  // Mechanics: platforms [x,y,w,h]; pools {x,y,w,h,type:fire|water|goo};
  // gates {x,y,w,h,ctrl}; buttons {x,y,ctrl} (hold); levers {x,y,ctrl} (walk-in toggle);
  // movers {x,y,w,h, x1,y1, ctrl, sp}; diamonds {x,y,type:fire|water}; doors + starts.
  // Layouts are staircases verified reachable by a physics simulation, so every
  // platform, diamond, and door is guaranteed reachable with the jump arc.
  return [
    {
      name:'Forest Temple',
      platforms:[[0,434,720,26],[0,0,16,460],[704,0,16,460],
        [70,365,140,16],[510,365,140,16],
        [290,300,140,16],
        [70,235,140,16],[510,235,140,16]],
      pools:[{x:300,y:418,w:120,h:16,type:'goo'}],
      gates:[], buttons:[], levers:[], movers:[],
      diamonds:[{x:120,y:345,type:'fire'},{x:560,y:345,type:'water'},
        {x:320,y:280,type:'fire'},{x:360,y:280,type:'water'},
        {x:120,y:215,type:'fire'},{x:560,y:215,type:'water'}],
      fireStart:{x:44,y:406}, waterStart:{x:652,y:406},
      fireDoor:{x:95,y:187}, waterDoor:{x:565,y:187},
    },
    {
      name:'Light Temple',
      platforms:[[0,434,720,26],[0,0,16,460],[704,0,16,460],
        [70,365,140,16],[510,365,140,16],
        [290,300,140,16],
        [70,235,140,16],[510,235,140,16],
        [290,170,140,16]],
      pools:[{x:300,y:418,w:120,h:16,type:'goo'}],
      gates:[], buttons:[], levers:[], movers:[],
      diamonds:[{x:120,y:345,type:'fire'},{x:560,y:345,type:'water'},
        {x:120,y:215,type:'fire'},{x:560,y:215,type:'water'},
        {x:320,y:150,type:'water'},{x:360,y:150,type:'fire'}],
      fireStart:{x:44,y:406}, waterStart:{x:652,y:406},
      fireDoor:{x:300,y:122}, waterDoor:{x:360,y:122},
    },
    {
      name:'Crystal Temple',
      platforms:[[0,434,720,26],[0,0,16,460],[704,0,16,460],
        [70,365,140,16],[510,365,140,16],
        [290,300,140,16],
        [70,235,140,16],[510,235,140,16]],
      pools:[{x:230,y:418,w:120,h:16,type:'fire'},{x:370,y:418,w:120,h:16,type:'water'}],
      gates:[], buttons:[], levers:[], movers:[],
      diamonds:[{x:120,y:345,type:'fire'},{x:560,y:345,type:'water'},
        {x:320,y:280,type:'fire'},{x:360,y:280,type:'water'},
        {x:120,y:215,type:'fire'},{x:560,y:215,type:'water'}],
      fireStart:{x:44,y:406}, waterStart:{x:652,y:406},
      fireDoor:{x:95,y:187}, waterDoor:{x:565,y:187},
    },
    {
      name:'Grand Temple',
      platforms:[[0,434,720,26],[0,0,16,460],[704,0,16,460],
        [70,365,140,16],[510,365,140,16],
        [290,300,140,16],
        [70,235,140,16],[510,235,140,16],
        [290,170,140,16]],
      pools:[{x:150,y:418,w:110,h:16,type:'water'},{x:460,y:418,w:110,h:16,type:'fire'},
        {x:300,y:418,w:120,h:16,type:'goo'}],
      gates:[], buttons:[], levers:[], movers:[],
      diamonds:[{x:120,y:345,type:'fire'},{x:560,y:345,type:'water'},
        {x:320,y:280,type:'water'},{x:360,y:280,type:'fire'},
        {x:120,y:215,type:'fire'},{x:560,y:215,type:'water'}],
      fireStart:{x:44,y:406}, waterStart:{x:652,y:406},
      fireDoor:{x:300,y:122}, waterDoor:{x:360,y:122},
    },
  ];
}

function openFireWater(levelIdx){
  const W = FW_W, H = FW_H;
  const levels = fwLevels();
  const li = Math.max(0, Math.min(levels.length - 1, levelIdx || 0));
  const L = levels[li];
  openModal(`
    <h3>&#128293;&#128167; Fireboy & Watergirl</h3>
    <p class="ttt-status" id="fwStatus">Level ${li+1}/${levels.length}: ${escapeHTML(L.name)} — Fireboy = Arrow keys, Watergirl = W A D. Climb the temple, grab your matching diamonds, and get each character to their own door. The wrong liquid (or green goo) is deadly.</p>
    <div style="display:flex; justify-content:center;">
      <canvas id="fwCanvas" width="${W}" height="${H}" style="max-width:100%; background:#0b0712; border:1px solid var(--panel-edge); border-radius:10px;"></canvas>
    </div>
    <div id="fwEnd" style="text-align:center; margin-top:12px;"></div>
  `);
  const canvas = document.getElementById('fwCanvas');
  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('fwStatus');

  const platforms = L.platforms.map(p => ({ x:p[0], y:p[1], w:p[2], h:p[3] }));
  const pools = L.pools.map(p => ({ ...p }));
  const gates = L.gates.map(g => ({ ...g, open:false }));
  const buttons = L.buttons.map(b => ({ ...b, w:36, h:9, pressed:false }));
  const levers = L.levers.map(v => ({ ...v, w:26, h:14, on:false, occ:false }));
  const movers = L.movers.map(m => ({ ...m, x0:m.x, y0:m.y, t:0, dx:0, dy:0 }));
  let diamonds = L.diamonds.map(d => ({ ...d }));
  const totalFire = diamonds.filter(d => d.type === 'fire').length;
  const totalWater = diamonds.filter(d => d.type === 'water').length;
  const startTime = performance.now();
  let elapsed = 0;
  let parts = [];

  function emit(x, y, color, n, opt){
    opt = opt || {};
    for(let i = 0; i < n; i++){
      parts.push({ x, y, vx:(Math.random()-0.5)*(opt.spread||2), vy:(opt.vy0||-1)-Math.random()*(opt.vyr||1.5),
        life:1, decay:opt.decay||0.03, grav:opt.grav==null?0.06:opt.grav, size:opt.size||3, color });
    }
  }

  function mkPlayer(s, type){ return { x:s.x, y:s.y, w:20, h:28, vx:0, vy:0, onGround:false, type, alive:true,
    atDoor:false, face:1, anim:0, coyote:0, jumpBuf:0, jumpHeld:false, squash:1, emitT:0 }; }
  const fire = mkPlayer(L.fireStart, 'fire');
  const water = mkPlayer(L.waterStart, 'water');
  const keys = {};
  function kd(e){ keys[e.key.toLowerCase()] = true; if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase())) e.preventDefault(); }
  function ku(e){ keys[e.key.toLowerCase()] = false; }
  document.addEventListener('keydown', kd);
  document.addEventListener('keyup', ku);

  let running = true, raf = null, deathReason = '';
  const GRAV = 0.68, ACCEL = 0.9, FRICTION = 0.78, MAXV = 3.7, JUMP = 12.6, COYOTE = 7, BUF = 7;

  function overlap(a, b){ return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function active(id){ return buttons.some(b => b.ctrl === id && b.pressed) || levers.some(v => v.ctrl === id && v.on); }
  function solids(){
    const s = platforms.slice();
    for(const g of gates) if(!g.open) s.push({ x:g.x, y:g.y, w:g.w, h:g.h });
    for(const m of movers) s.push({ x:m.x, y:m.y, w:m.w, h:m.h, mover:m });
    return s;
  }

  function updateMechanisms(){
    for(const b of buttons){ const box = { x:b.x, y:b.y-4, w:b.w, h:14 }; b.pressed = overlap(fire, box) || overlap(water, box); }
    for(const v of levers){
      const box = { x:v.x-4, y:v.y-6, w:v.w+8, h:v.h+10 };
      const touch = overlap(fire, box) || overlap(water, box);
      if(touch && !v.occ) v.on = !v.on;
      v.occ = touch;
    }
    for(let i = 0; i < gates.length; i++) gates[i].open = active(gates[i].ctrl);
    for(const m of movers){
      const prevX = m.x, prevY = m.y;
      const target = active(m.ctrl) ? 1 : 0;
      m.t += Math.max(-m.sp, Math.min(m.sp, target - m.t));
      m.x = m.x0 + (m.x1 - m.x0) * m.t;
      m.y = m.y0 + (m.y1 - m.y0) * m.t;
      m.dx = m.x - prevX; m.dy = m.y - prevY;
    }
    for(const p of [fire, water]){ if(p.ride && movers.includes(p.ride)){ p.x += p.ride.dx; p.y += p.ride.dy; } }
  }

  function movePlayer(p, left, right, up){
    if(!p.alive) return;
    if(p.coyote > 0) p.coyote--;
    if(p.jumpBuf > 0) p.jumpBuf--;
    const wl = keys[left], wr = keys[right];
    if(wl){ p.vx -= ACCEL; p.face = -1; }
    if(wr){ p.vx += ACCEL; p.face = 1; }
    if(!wl && !wr) p.vx *= FRICTION;
    p.vx = Math.max(-MAXV, Math.min(MAXV, p.vx));
    if(keys[up] && !p.jumpHeld) p.jumpBuf = BUF;
    if(p.jumpBuf > 0 && p.coyote > 0){ p.vy = -JUMP; p.coyote = 0; p.jumpBuf = 0; p.onGround = false; p.squash = 0.7; emit(p.x+p.w/2, p.y+p.h, p.type==='fire'?'#ffb27a':'#9be3ff', 6, {vy0:0, vyr:1, spread:3, grav:0.12, size:2.5}); }
    if(!keys[up] && p.vy < -4) p.vy *= 0.86;
    p.jumpHeld = keys[up];
    p.vy += GRAV;
    const sol = solids();
    p.x += p.vx;
    for(const box of sol){ if(overlap(p, box)){ if(p.vx > 0) p.x = box.x - p.w; else if(p.vx < 0) p.x = box.x + box.w; p.vx = 0; } }
    const wasAir = !p.onGround;
    p.y += p.vy; p.onGround = false; p.ride = null;
    for(const box of sol){
      if(overlap(p, box)){
        if(p.vy > 0){ p.y = box.y - p.h; if(wasAir && p.vy > 8){ p.squash = 0.72; emit(p.x+p.w/2, p.y+p.h, p.type==='fire'?'#ffb27a':'#9be3ff', 5, {vy0:0, vyr:0.6, spread:3, grav:0.1, size:2}); } p.vy = 0; p.onGround = true; if(box.mover) p.ride = box.mover; }
        else if(p.vy < 0){ p.y = box.y + box.h; p.vy = 0; }
      }
    }
    if(p.onGround) p.coyote = COYOTE;
    // animation + trail
    p.anim += Math.abs(p.vx) * 0.12 + (p.onGround ? 0 : 0.02);
    p.squash += (1 - p.squash) * 0.2;
    p.emitT += 1;
    if(p.emitT > 4){ p.emitT = 0; emit(p.x + p.w/2 + (Math.random()-0.5)*8, p.y + (p.type==='fire'?2:6), p.type==='fire'?'#ff7a3c':'#5cc8ff', 1, {vy0:-0.6, vyr:0.8, spread:1, grav:p.type==='fire'?-0.02:0.05, size:2.5, decay:0.05}); }
    for(const hz of pools){
      if(overlap(p, { x:hz.x, y:hz.y-4, w:hz.w, h:hz.h+4 })){
        if(hz.type === 'goo'){ p.alive = false; deathReason = 'the green goo'; }
        else if(hz.type !== p.type){ p.alive = false; deathReason = hz.type === 'water' ? 'the water' : 'the lava'; }
        if(!p.alive) emit(p.x+p.w/2, p.y+p.h/2, hz.type==='water'?'#7dd3fc':hz.type==='goo'?'#a3e635':'#fca5a5', 18, {spread:4, vy0:-1, vyr:3, grav:0.1, size:3});
      }
    }
    const before = diamonds.length;
    diamonds = diamonds.filter(gm => !(gm.type === p.type && overlap(p, { x:gm.x, y:gm.y, w:16, h:16 })));
    if(diamonds.length < before) emit(p.x+p.w/2, p.y+p.h/2, p.type==='fire'?'#ff8a5a':'#7dd3fc', 12, {spread:3, vy0:-1.5, vyr:2, grav:0.08, size:2.5});
    const door = p.type === 'fire' ? L.fireDoor : L.waterDoor;
    p.atDoor = overlap(p, { x:door.x, y:door.y, w:36, h:48 });
  }

  function updateParts(){
    for(const q of parts){ q.x += q.vx; q.y += q.vy; q.vy += q.grav; q.life -= q.decay; }
    parts = parts.filter(q => q.life > 0);
    // ambient bubbles from liquids
    if(Math.random() < 0.5){ const hz = pools[Math.floor(Math.random()*pools.length)]; if(hz) emit(hz.x + Math.random()*hz.w, hz.y, hz.type==='water'?'#bae6fd':hz.type==='goo'?'#bef264':'#fdba74', 1, {vy0:-0.5, vyr:0.6, spread:0.4, grav:0.01, size:2, decay:0.04}); }
  }

  function endGame(win){
    running = false;
    cancelAnimationFrame(raf);
    if(win){
      const gotF = totalFire - diamonds.filter(d => d.type === 'fire').length;
      const gotW = totalWater - diamonds.filter(d => d.type === 'water').length;
      const all = diamonds.length === 0;
      const bonus = 10 + (gotF + gotW) * 2 + (all ? 8 : 0);
      awardCoins(bonus);
      const last = li >= levels.length - 1;
      statusEl.textContent = (last ? 'All temples cleared — flawless teamwork! 🎉 ' : `Temple ${li+1} cleared! `) + `Diamonds ${gotF+gotW}/${totalFire+totalWater} • Time ${elapsed.toFixed(1)}s`;
      document.getElementById('fwEnd').innerHTML = coinToastHTML(bonus) +
        (last ? '<button class="btn btn-small btn-primary" id="fwAgain">Play from start</button>'
              : '<button class="btn btn-small btn-primary" id="fwNext">Next temple &rarr;</button> <button class="btn btn-small btn-ghost" id="fwAgain">Replay temple</button>');
      const nxt = document.getElementById('fwNext');
      if(nxt) nxt.addEventListener('click', () => { cleanup(); openFireWater(li + 1); });
      const again = document.getElementById('fwAgain');
      if(again) again.addEventListener('click', () => { cleanup(); openFireWater(last ? 0 : li); });
    } else {
      statusEl.textContent = `${deathReason ? 'Someone fell in ' + deathReason : 'Someone touched the wrong element'} — try again!`;
      document.getElementById('fwEnd').innerHTML = '<button class="btn btn-small btn-primary" id="fwAgain">Try again</button>';
      const again = document.getElementById('fwAgain');
      if(again) again.addEventListener('click', () => { cleanup(); openFireWater(li); });
    }
  }

  // ---------- rendering ----------
  function bg(){
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1a1030'); g.addColorStop(1, '#0a0714');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // pillars
    ctx.fillStyle = 'rgba(70,50,110,0.25)';
    for(let x = 70; x < W; x += 150){ ctx.fillRect(x, 0, 40, H); ctx.fillStyle = 'rgba(90,65,140,0.18)'; ctx.fillRect(x-6, 0, 52, 16); ctx.fillStyle = 'rgba(70,50,110,0.25)'; }
    // brick lines
    ctx.strokeStyle = 'rgba(120,90,160,0.08)'; ctx.lineWidth = 1;
    for(let y = 0; y < H; y += 32){ for(let x = (Math.floor(y/32)%2)*32; x < W; x += 64) ctx.strokeRect(x, y, 64, 32); }
    // wall torches with flicker
    const t = performance.now()/120;
    for(const tx of [40, W-40]){
      for(const ty of [90, 250]){
        const fl = 8 + Math.sin(t + tx + ty) * 3;
        const rg = ctx.createRadialGradient(tx, ty, 2, tx, ty, 40);
        rg.addColorStop(0, 'rgba(255,180,80,0.35)'); rg.addColorStop(1, 'rgba(255,180,80,0)');
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(tx, ty, 40, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.moveTo(tx-5, ty+6); ctx.quadraticCurveTo(tx, ty-fl, tx+5, ty+6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.moveTo(tx-2, ty+4); ctx.quadraticCurveTo(tx, ty-fl*0.5, tx+2, ty+4); ctx.closePath(); ctx.fill();
      }
    }
  }
  function drawPool(hz){
    const c = hz.type === 'fire' ? ['#ff7a2f','#7f1d1d'] : hz.type === 'water' ? ['#38bdf8','#0c4a6e'] : ['#84cc16','#365314'];
    const t = performance.now()/260;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(hz.x, hz.y + hz.h);
    ctx.lineTo(hz.x, hz.y + 3);
    const step = 8;
    for(let x = hz.x; x <= hz.x + hz.w; x += step){ const wave = Math.sin((x*0.15) + t*2) * 2.5; ctx.lineTo(x, hz.y + 3 + wave); }
    ctx.lineTo(hz.x + hz.w, hz.y + hz.h); ctx.closePath();
    const g = ctx.createLinearGradient(0, hz.y, 0, hz.y + hz.h);
    g.addColorStop(0, c[0]); g.addColorStop(1, c[1]);
    ctx.fillStyle = g; ctx.shadowColor = c[0]; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
    // surface highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for(let x = hz.x; x <= hz.x + hz.w; x += step){ const wave = Math.sin((x*0.15) + t*2) * 2.5; if(x===hz.x) ctx.moveTo(x, hz.y+3+wave); else ctx.lineTo(x, hz.y+3+wave); }
    ctx.stroke(); ctx.restore();
  }
  function drawPlatform(pl){
    ctx.fillStyle = '#4b3a63'; ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
    ctx.fillStyle = 'rgba(200,170,240,0.4)'; ctx.fillRect(pl.x, pl.y, pl.w, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(pl.x, pl.y + pl.h - 3, pl.w, 3);
  }
  function drawChar(p){
    const base = p.type === 'fire' ? '#ff5a3c' : '#3ec6ff';
    const dark = p.type === 'fire' ? '#c2371b' : '#1f88c4';
    const glow = p.type === 'fire' ? '#ffd08a' : '#bff0ff';
    const cx = p.x + p.w/2, feet = p.y + p.h;
    const swing = p.onGround ? Math.sin(p.anim) * (Math.abs(p.vx) > 0.4 ? 5 : 0) : 4;
    ctx.save(); ctx.globalAlpha = p.alive ? 1 : 0.25;
    // squash/stretch around feet
    ctx.translate(cx, feet); ctx.scale(1/Math.max(0.6,p.squash), p.squash); ctx.translate(-cx, -feet);
    ctx.shadowColor = base; ctx.shadowBlur = 14;
    // legs
    ctx.strokeStyle = dark; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx-4, feet-10); ctx.lineTo(cx-4+swing, feet); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+4, feet-10); ctx.lineTo(cx+4-swing, feet); ctx.stroke();
    // arms
    ctx.strokeStyle = base;
    ctx.beginPath(); ctx.moveTo(cx-5, p.y+16); ctx.lineTo(cx-9, p.y+16-swing*0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+5, p.y+16); ctx.lineTo(cx+9, p.y+16+swing*0.6); ctx.stroke();
    // body
    ctx.fillStyle = base;
    ctx.beginPath(); ctx.moveTo(cx-6, feet-8); ctx.lineTo(cx-6, p.y+12);
    ctx.quadraticCurveTo(cx, p.y+2, cx+6, p.y+12); ctx.lineTo(cx+6, feet-8); ctx.closePath(); ctx.fill();
    // head
    ctx.beginPath(); ctx.arc(cx, p.y+9, 7, 0, Math.PI*2); ctx.fill();
    // crown: flame / water
    ctx.fillStyle = glow;
    const t = performance.now()/90;
    if(p.type === 'fire'){
      for(let i = -1; i <= 1; i++){ const fx = cx + i*4; const fh = 8 + Math.sin(t + i) * 3; ctx.beginPath(); ctx.moveTo(fx-3, p.y+4); ctx.quadraticCurveTo(fx, p.y+2-fh, fx+3, p.y+4); ctx.closePath(); ctx.fill(); }
    } else {
      for(let i = -1; i <= 1; i++){ const dx = cx + i*4; const dy = p.y + 2 + Math.sin(t + i)*1.5; ctx.beginPath(); ctx.arc(dx, dy, 2.6, 0, Math.PI*2); ctx.fill(); }
    }
    ctx.shadowBlur = 0;
    // eyes
    ctx.fillStyle = '#fff'; ctx.fillRect(cx-4+p.face, p.y+6, 3, 5); ctx.fillRect(cx+1+p.face, p.y+6, 3, 5);
    ctx.fillStyle = '#0b0712'; ctx.fillRect(cx-3+p.face*2, p.y+8, 1.6, 3); ctx.fillRect(cx+2+p.face*2, p.y+8, 1.6, 3);
    ctx.restore();
  }
  function drawDoor(d, type, ready){
    const c = type === 'fire' ? '#ff5a3c' : '#3ec6ff';
    ctx.fillStyle = ready ? (type === 'fire' ? 'rgba(255,90,60,0.5)' : 'rgba(62,198,255,0.5)') : 'rgba(255,255,255,0.06)';
    ctx.fillRect(d.x, d.y, 36, 48);
    ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.shadowColor = c; ctx.shadowBlur = ready ? 16 : 5;
    ctx.strokeRect(d.x, d.y, 36, 48);
    ctx.beginPath(); ctx.arc(d.x + 18, d.y, 18, Math.PI, 0); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(d.x + 18, d.y + 26, 5, 0, Math.PI*2); ctx.fill();
  }
  function drawDiamond(gm){
    const col = gm.type === 'fire' ? '#ff8a5a' : '#7dd3fc';
    const b = Math.sin(performance.now()/300 + gm.x) * 2;
    ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 14;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(gm.x+8, gm.y+b); ctx.lineTo(gm.x+16, gm.y+8+b); ctx.lineTo(gm.x+8, gm.y+16+b); ctx.lineTo(gm.x, gm.y+8+b); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.moveTo(gm.x+8, gm.y+b+2); ctx.lineTo(gm.x+12, gm.y+7+b); ctx.lineTo(gm.x+8, gm.y+9+b); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function drawParts(){
    for(const q of parts){ ctx.globalAlpha = Math.max(0, q.life); ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(q.x, q.y, q.size * q.life, 0, Math.PI*2); ctx.fill(); }
    ctx.globalAlpha = 1;
  }

  function draw(){
    bg();
    for(const pl of platforms) drawPlatform(pl);
    for(const m of movers){ drawPlatform(m); ctx.strokeStyle = 'rgba(250,204,21,0.5)'; ctx.setLineDash([5,4]); ctx.strokeRect(m.x, m.y, m.w, m.h); ctx.setLineDash([]); }
    for(const hz of pools) drawPool(hz);
    for(const g of gates){
      if(!g.open){ ctx.fillStyle = '#9aa6b2'; ctx.fillRect(g.x, g.y, g.w, g.h); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; for(let y=g.y; y<g.y+g.h; y+=8) ctx.strokeRect(g.x, y, g.w, 8); }
      else { ctx.fillStyle = 'rgba(154,166,178,0.18)'; ctx.fillRect(g.x, g.y, g.w, 6); }
    }
    for(const b of buttons){
      ctx.fillStyle = b.pressed ? '#facc15' : '#fde68a';
      ctx.fillRect(b.x, b.y + (b.pressed ? 3 : 0), b.w, b.pressed ? 6 : 9);
      ctx.fillStyle = 'rgba(250,204,21,0.3)'; ctx.fillRect(b.x - 3, b.y + 9, b.w + 6, 3);
    }
    for(const v of levers){
      ctx.fillStyle = '#3b3355'; ctx.fillRect(v.x, v.y + 8, v.w, 6);
      ctx.strokeStyle = v.on ? '#4ade80' : '#f87171'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(v.x + v.w/2, v.y + 10); ctx.lineTo(v.x + v.w/2 + (v.on ? 9 : -9), v.y); ctx.stroke();
      ctx.fillStyle = v.on ? '#4ade80' : '#f87171'; ctx.beginPath(); ctx.arc(v.x + v.w/2 + (v.on ? 9 : -9), v.y, 4, 0, Math.PI*2); ctx.fill();
    }
    for(const gm of diamonds) drawDiamond(gm);
    drawDoor(L.fireDoor, 'fire', fire.atDoor);
    drawDoor(L.waterDoor, 'water', water.atDoor);
    drawParts();
    drawChar(fire); drawChar(water);
    // HUD
    const gotF = totalFire - diamonds.filter(d => d.type === 'fire').length;
    const gotW = totalWater - diamonds.filter(d => d.type === 'water').length;
    ctx.font = '13px monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = '#ff8a5a'; ctx.fillText('◆ ' + gotF + '/' + totalFire, 22, 24);
    ctx.fillStyle = '#7dd3fc'; ctx.fillText('◆ ' + gotW + '/' + totalWater, 90, 24);
    ctx.fillStyle = 'rgba(245,240,255,0.85)'; ctx.textAlign = 'right'; ctx.fillText(elapsed.toFixed(1) + 's', W - 22, 24); ctx.textAlign = 'left';
  }

  function tick(){
    if(!running) return;
    elapsed = (performance.now() - startTime) / 1000;
    updateMechanisms();
    movePlayer(fire, 'arrowleft', 'arrowright', 'arrowup');
    movePlayer(water, 'a', 'd', 'w');
    updateParts();
    if(!fire.alive || !water.alive){ draw(); endGame(false); return; }
    if(fire.atDoor && water.atDoor){ draw(); endGame(true); return; }
    draw();
    raf = requestAnimationFrame(tick);
  }
  tick();

  function cleanup(){
    running = false;
    cancelAnimationFrame(raf);
    document.removeEventListener('keydown', kd);
    document.removeEventListener('keyup', ku);
  }
  activeGameCleanup = cleanup;
}

/* ---------- Brick Breaker ---------- */
function openBrickBreaker(){
  const W = 480, H = 420;
  openModal(`
    <h3>&#129521; Brick Breaker</h3>
    <p class="ttt-status" id="brStatus">Move with the mouse or arrow keys. Clear every brick.</p>
    <div style="display:flex; justify-content:center;">
      <canvas id="brCanvas" width="${W}" height="${H}" style="max-width:100%; background:radial-gradient(circle at 50% 0,#141826,#080a12); border:1px solid var(--panel-edge); border-radius:10px; cursor:none;"></canvas>
    </div>
    <div id="brControls" style="text-align:center; margin-top:12px;"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="brLB" class="lb-live" data-game="brick" data-unit="pts">${leaderboardHTML('brick','pts')}</div>
  `);
  const canvas = document.getElementById('brCanvas');
  const ctx = canvas.getContext('2d');
  const COLORS = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#a78bfa'];
  const PADDLE_W = 84, PADDLE_H = 12, R = 7;
  let paddleX, ball, bricks, score, lives, running, started, particles, speed, raf;

  function buildBricks(){
    bricks = [];
    const cols = 9, rows = 6, bw = 46, bh = 18, gap = 4, offX = (W - (cols * (bw + gap) - gap)) / 2, offY = 46;
    for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++){
      bricks.push({ x: offX + c*(bw+gap), y: offY + r*(bh+gap), w: bw, h: bh, color: COLORS[r % COLORS.length], hp: r < 2 ? 2 : 1 });
    }
  }
  function reset(){
    paddleX = W/2 - PADDLE_W/2;
    speed = 4.4;
    ball = { x: W/2, y: H - 60, vx: speed * 0.6, vy: -speed };
    score = 0; lives = 3; running = false; started = false; particles = [];
    buildBricks();
  }
  reset();

  function burst(x, y, color){
    for(let i = 0; i < 10; i++){
      const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 3;
      particles.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 1, color });
    }
  }

  function update(){
    if(!running) return;
    ball.x += ball.vx; ball.y += ball.vy;
    if(ball.x < R){ ball.x = R; ball.vx = Math.abs(ball.vx); }
    if(ball.x > W - R){ ball.x = W - R; ball.vx = -Math.abs(ball.vx); }
    if(ball.y < R){ ball.y = R; ball.vy = Math.abs(ball.vy); }
    // paddle
    if(ball.vy > 0 && ball.y + R >= H - 24 && ball.y + R <= H - 10 && ball.x >= paddleX && ball.x <= paddleX + PADDLE_W){
      ball.vy = -Math.abs(ball.vy);
      const hit = (ball.x - (paddleX + PADDLE_W/2)) / (PADDLE_W/2);
      ball.vx = hit * speed * 1.1;
    }
    if(ball.y > H + 20){
      lives--;
      if(lives <= 0){ gameOver(); return; }
      ball = { x: W/2, y: H - 60, vx: speed * 0.6, vy: -speed };
    }
    // bricks
    for(let i = 0; i < bricks.length; i++){
      const b = bricks[i];
      if(ball.x > b.x && ball.x < b.x + b.w && ball.y - R < b.y + b.h && ball.y + R > b.y){
        ball.vy = -ball.vy;
        b.hp--;
        burst(ball.x, ball.y, b.color);
        if(b.hp <= 0){ bricks.splice(i, 1); score += 10; awardCoins(1); speed = Math.min(8, speed + 0.04); }
        else { score += 4; }
        break;
      }
    }
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.03; });
    particles = particles.filter(p => p.life > 0);
    if(bricks.length === 0){ win(); return; }
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    bricks.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color; ctx.shadowBlur = b.hp > 1 ? 14 : 6;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });
    ctx.shadowBlur = 0;
    particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 3, 3); });
    ctx.globalAlpha = 1;
    const grd = ctx.createLinearGradient(paddleX, 0, paddleX + PADDLE_W, 0);
    grd.addColorStop(0, '#22d3ee'); grd.addColorStop(1, '#a78bfa');
    ctx.fillStyle = grd; ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 12;
    ctx.fillRect(paddleX, H - 24, PADDLE_W, PADDLE_H);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(245,240,255,0.9)'; ctx.font = '13px monospace'; ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 12, 22);
    ctx.textAlign = 'right'; ctx.fillText('Lives: ' + '❤'.repeat(Math.max(0, lives)), W - 12, 22);
    if(!started){ ctx.fillStyle = 'rgba(245,240,255,0.9)'; ctx.textAlign = 'center'; ctx.fillText('Click or press a key to launch', W/2, H/2); }
  }

  function frame(){ update(); draw(); raf = requestAnimationFrame(frame); }

  function endPanel(message){
    running = false; cancelAnimationFrame(raf);
    document.getElementById('brStatus').textContent = message + ' — score: ' + score;
    const record = isNewRecord('brick', score, false);
    document.getElementById('brControls').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + `
      <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
        <input id="brName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="brSave">Save Score</button>
        <button class="btn btn-small btn-ghost" id="brRestart">Play Again</button>
      </div>`;
    document.getElementById('brSave').addEventListener('click', async () => {
      const name = document.getElementById('brName').value.trim() || 'Anonymous';
      await saveScore('brick', name, score, false);
      document.getElementById('brLB').innerHTML = leaderboardHTML('brick','pts');
      document.getElementById('brSave').disabled = true;
    });
    document.getElementById('brRestart').addEventListener('click', () => {
      reset(); document.getElementById('brControls').innerHTML = '';
      document.getElementById('brStatus').textContent = 'Move with the mouse or arrow keys. Clear every brick.';
      raf = requestAnimationFrame(frame);
    });
  }
  function gameOver(){ endPanel('Game over'); }
  function win(){ awardCoins(10); endPanel('You cleared the board! 🎉'); }

  function begin(){ if(!started){ started = true; running = true; } }
  function movePaddle(clientX){
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (W / rect.width);
    paddleX = Math.max(0, Math.min(W - PADDLE_W, x - PADDLE_W/2));
  }
  function onMove(e){ movePaddle(e.clientX); }
  function onTouch(e){ e.preventDefault(); if(e.touches[0]){ begin(); movePaddle(e.touches[0].clientX); } }
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mousedown', begin);
  canvas.addEventListener('touchmove', onTouch, { passive:false });
  canvas.addEventListener('touchstart', onTouch, { passive:false });
  let keyDir = 0;
  function keyDown(e){ if(e.key==='ArrowLeft'){keyDir=-1;begin();e.preventDefault();} else if(e.key==='ArrowRight'){keyDir=1;begin();e.preventDefault();} else if(e.key===' '){begin();e.preventDefault();} }
  function keyUp(e){ if(e.key==='ArrowLeft'||e.key==='ArrowRight') keyDir=0; }
  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);
  const keyTimer = setInterval(() => { if(keyDir) paddleX = Math.max(0, Math.min(W - PADDLE_W, paddleX + keyDir * 8)); }, 16);

  raf = requestAnimationFrame(frame);
  activeGameCleanup = () => {
    running = false; cancelAnimationFrame(raf); clearInterval(keyTimer);
    document.removeEventListener('keydown', keyDown); document.removeEventListener('keyup', keyUp);
  };
}

/* ---------- Star Blaster (space shooter) ---------- */
function openStarBlaster(){
  const W = 460, H = 480;
  openModal(`
    <h3>&#128640; Star Blaster</h3>
    <p class="ttt-status" id="sbStatus">Move: &larr; &rarr; or A/D &nbsp;•&nbsp; Fire: Space (hold). Don't let them land.</p>
    <div style="display:flex; justify-content:center;">
      <canvas id="sbCanvas" width="${W}" height="${H}" style="max-width:100%; background:radial-gradient(circle at 50% 30%,#0b1030,#04060f); border:1px solid var(--panel-edge); border-radius:10px; cursor:crosshair;"></canvas>
    </div>
    <div id="sbControls" style="text-align:center; margin-top:12px;"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="sbLB" class="lb-live" data-game="shooter" data-unit="pts">${leaderboardHTML('shooter','pts')}</div>
  `);
  const canvas = document.getElementById('sbCanvas');
  const ctx = canvas.getContext('2d');
  const stars = Array.from({ length: 60 }, () => ({ x: Math.random()*W, y: Math.random()*H, s: Math.random()*1.5+0.3 }));
  let ship, bullets, enemies, boom, score, lives, running, tick, raf, spawnEvery, sinceSpawn, sinceShot;

  function reset(){
    ship = { x: W/2, w: 30, h: 20, speed: 5 };
    bullets = []; enemies = []; boom = []; score = 0; lives = 3; running = true;
    tick = 0; spawnEvery = 50; sinceSpawn = 0; sinceShot = 0;
  }
  reset();

  function spawn(){
    const x = 24 + Math.random() * (W - 48);
    enemies.push({ x, y: -20, w: 26, h: 20, vy: 1 + Math.random()*0.8 + score/2000, wob: Math.random()*Math.PI*2 });
  }
  function explode(x, y, color){
    for(let i = 0; i < 14; i++){ const a = Math.random()*Math.PI*2, sp = 1+Math.random()*3.5; boom.push({ x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:1, color }); }
  }

  const keys = {};
  function kd(e){ const k = e.key.toLowerCase(); if(['arrowleft','arrowright','a','d',' '].includes(k)){ keys[k]=true; e.preventDefault(); } }
  function ku(e){ keys[e.key.toLowerCase()] = false; }
  document.addEventListener('keydown', kd);
  document.addEventListener('keyup', ku);

  function update(){
    if(!running) return;
    tick++;
    if(keys['arrowleft'] || keys['a']) ship.x -= ship.speed;
    if(keys['arrowright'] || keys['d']) ship.x += ship.speed;
    ship.x = Math.max(ship.w/2, Math.min(W - ship.w/2, ship.x));
    sinceShot++;
    if(keys[' '] && sinceShot > 9){ bullets.push({ x: ship.x, y: H - 44 }); sinceShot = 0; }
    bullets.forEach(b => b.y -= 8);
    bullets = bullets.filter(b => b.y > -10);
    sinceSpawn++;
    if(sinceSpawn >= spawnEvery){ spawn(); sinceSpawn = 0; if(spawnEvery > 20) spawnEvery -= 0.5; }
    enemies.forEach(en => { en.y += en.vy; en.x += Math.sin(tick/30 + en.wob) * 0.8; });
    // collisions bullet-enemy
    for(let i = enemies.length - 1; i >= 0; i--){
      const en = enemies[i];
      for(let j = bullets.length - 1; j >= 0; j--){
        const b = bullets[j];
        if(Math.abs(b.x - en.x) < en.w/2 + 3 && Math.abs(b.y - en.y) < en.h/2 + 6){
          explode(en.x, en.y, '#f472b6'); enemies.splice(i, 1); bullets.splice(j, 1);
          score += 15; awardCoins(1);
          break;
        }
      }
    }
    for(let i = enemies.length - 1; i >= 0; i--){
      if(enemies[i].y > H - 20){ const ex = enemies[i].x; enemies.splice(i, 1); lives--; explode(ex, H - 20, '#f43f5e'); if(lives <= 0){ gameOver(); return; } }
    }
    boom.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.03; });
    boom = boom.filter(p => p.life > 0);
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    stars.forEach(s => { s.y += s.s; if(s.y > H) s.y = 0; ctx.fillRect(s.x, s.y, s.s, s.s); });
    // bullets
    ctx.fillStyle = '#22d3ee'; ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 8;
    bullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 12));
    ctx.shadowBlur = 0;
    // enemies
    enemies.forEach(en => {
      ctx.fillStyle = '#f472b6'; ctx.shadowColor = '#f472b6'; ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(en.x, en.y + en.h/2); ctx.lineTo(en.x - en.w/2, en.y - en.h/2); ctx.lineTo(en.x + en.w/2, en.y - en.h/2);
      ctx.closePath(); ctx.fill();
    });
    ctx.shadowBlur = 0;
    boom.forEach(p => { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 3, 3); });
    ctx.globalAlpha = 1;
    // ship
    ctx.fillStyle = '#4ade80'; ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(ship.x, H - 46); ctx.lineTo(ship.x - ship.w/2, H - 22); ctx.lineTo(ship.x + ship.w/2, H - 22);
    ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(245,240,255,0.9)'; ctx.font = '13px monospace'; ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 12, 22);
    ctx.textAlign = 'right'; ctx.fillText('Lives: ' + '❤'.repeat(Math.max(0, lives)), W - 12, 22);
  }

  function frame(){ update(); draw(); raf = requestAnimationFrame(frame); }

  function gameOver(){
    running = false; cancelAnimationFrame(raf);
    document.getElementById('sbStatus').textContent = 'Game over — score: ' + score;
    const record = isNewRecord('shooter', score, false);
    document.getElementById('sbControls').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + `
      <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
        <input id="sbName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="sbSave">Save Score</button>
        <button class="btn btn-small btn-ghost" id="sbRestart">Play Again</button>
      </div>`;
    document.getElementById('sbSave').addEventListener('click', async () => {
      const name = document.getElementById('sbName').value.trim() || 'Anonymous';
      await saveScore('shooter', name, score, false);
      document.getElementById('sbLB').innerHTML = leaderboardHTML('shooter','pts');
      document.getElementById('sbSave').disabled = true;
    });
    document.getElementById('sbRestart').addEventListener('click', () => {
      reset(); document.getElementById('sbControls').innerHTML = '';
      document.getElementById('sbStatus').textContent = 'Move: ← → or A/D • Fire: Space (hold).';
      raf = requestAnimationFrame(frame);
    });
  }

  raf = requestAnimationFrame(frame);
  activeGameCleanup = () => {
    running = false; cancelAnimationFrame(raf);
    document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku);
  };
}

/* ---------- Hoops (basketball) ---------- */
function openHoops(){
  const W = 420, H = 520;
  openModal(`
    <h3>&#127936; Hoops</h3>
    <p class="ttt-status" id="hpStatus">Drag back from the ball and release to shoot — the dotted line previews the arc. 30 seconds.</p>
    <div style="display:flex; justify-content:center;">
      <canvas id="hpCanvas" width="${W}" height="${H}" style="max-width:100%; background:linear-gradient(#12203a,#0a0f1c); border:1px solid var(--panel-edge); border-radius:10px; cursor:grab; touch-action:none;"></canvas>
    </div>
    <div id="hpControls" style="text-align:center; margin-top:12px;"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="hpLB" class="lb-live" data-game="hoops" data-unit="pts">${leaderboardHTML('hoops','pts')}</div>
  `);
  const canvas = document.getElementById('hpCanvas');
  const ctx = canvas.getContext('2d');
  const R = 16, GRAV = 0.4, MAXPULL = 150, LAUNCH = 0.16;
  const rim = { x: W/2, y: 130, w: 74 };
  let ball, flying, score, timeLeft, running, raf, timer, dragging, aim, scoredThisShot, moveHoop, hoopDir, swish, splash;

  function resetBall(){ ball = { x: W/2, y: H - 130, vx: 0, vy: 0 }; flying = false; scoredThisShot = false; aim = null; }
  function reset(){ resetBall(); score = 0; timeLeft = 30; running = true; moveHoop = false; hoopDir = 1; dragging = false; swish = 0; splash = []; }
  reset();

  // Clamp the pointer to a max pull distance from the ball so aiming can never leave the court.
  function setAim(p){
    let dx = p.cx - ball.x, dy = p.cy - ball.y;
    const len = Math.hypot(dx, dy);
    if(len > MAXPULL){ dx = dx / len * MAXPULL; dy = dy / len * MAXPULL; }
    aim = { dx, dy, power: Math.min(1, len / MAXPULL) };
  }
  function shotVel(){ return { vx: -aim.dx * LAUNCH, vy: -aim.dy * LAUNCH }; }

  function tickClock(){
    if(!running) return;
    timeLeft--;
    document.getElementById('hpStatus').textContent = 'Time: ' + timeLeft + 's  •  Score: ' + score;
    if(timeLeft <= 0) endGame();
  }

  function update(){
    if(!running) return;
    if(moveHoop){ rim.x += hoopDir * 1.4; if(rim.x < 90 || rim.x > W - 90) hoopDir *= -1; }
    if(flying){
      ball.x += ball.vx; ball.y += ball.vy; ball.vy += GRAV;
      if(ball.x < R || ball.x > W - R) ball.vx *= -0.7;
      // score: passing down through rim plane within rim width
      if(!scoredThisShot && ball.vy > 0 && Math.abs(ball.x - rim.x) < rim.w/2 - 6 && ball.y > rim.y && ball.y < rim.y + 18){
        scoredThisShot = true; score += 2; awardCoins(1);
        // guide the ball cleanly through the rim so it visibly drops in
        ball.x = rim.x; ball.vx *= 0.25; if(ball.vy < 3) ball.vy = 3;
        swish = 32;
        for(let i = 0; i < 14; i++){ splash.push({ x: rim.x, y: rim.y + 4, vx: (Math.random()-0.5)*4, vy: Math.random()*2+1, life: 1 }); }
        if(score >= 10 && !moveHoop) moveHoop = true;
      }
      if(ball.y > H + 40 || (ball.y > H - R && Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 0.2)) resetBall();
    }
    if(swish > 0) swish--;
    splash.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 0.04; });
    splash = splash.filter(p => p.life > 0);
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    // backboard
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(rim.x - 4, rim.y - 60, 8, 60);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3; ctx.strokeRect(rim.x - 46, rim.y - 58, 92, 56);
    // rim
    ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 5; ctx.shadowColor = '#fb7185'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.moveTo(rim.x - rim.w/2, rim.y); ctx.lineTo(rim.x + rim.w/2, rim.y); ctx.stroke();
    // net (bulges + sways during a swish)
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1;
    const bulge = swish > 0 ? 16 * Math.sin((swish/32) * Math.PI) : 0;
    const sway = swish > 0 ? Math.sin(swish * 0.9) * 4 : 0;
    const netLen = 26 + bulge;
    for(let i = 0; i <= 6; i++){
      const x = rim.x - rim.w/2 + i*(rim.w/6);
      const bx = rim.x - rim.w/4 + i*(rim.w/12) + sway;
      ctx.beginPath(); ctx.moveTo(x, rim.y); ctx.quadraticCurveTo((x+bx)/2, rim.y + netLen*0.6, bx, rim.y + netLen); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    // aim: pull-back marker + trajectory preview + power meter
    if(dragging && aim){
      // pull-back handle (where you dragged to, clamped)
      ctx.strokeStyle = 'rgba(148,163,184,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(ball.x + aim.dx, ball.y + aim.dy); ctx.stroke(); ctx.setLineDash([]);
      // predicted arc
      const v = shotVel(); let px = ball.x, py = ball.y, pvx = v.vx, pvy = v.vy;
      ctx.fillStyle = 'rgba(250,204,21,0.85)';
      for(let i = 0; i < 45; i++){
        px += pvx; py += pvy; pvy += GRAV;
        if(px < 0 || px > W || py > H) break;
        if(i % 2 === 0){ ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI*2); ctx.fill(); }
      }
      // power meter
      const pw = 120, ph = 10, pxm = (W - pw)/2, pym = H - 22;
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(pxm, pym, pw, ph);
      ctx.fillStyle = aim.power > 0.85 ? '#f43f5e' : '#facc15'; ctx.fillRect(pxm, pym, pw * aim.power, ph);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1; ctx.strokeRect(pxm, pym, pw, ph);
    }
    // ball
    const g = ctx.createRadialGradient(ball.x-5, ball.y-5, 3, ball.x, ball.y, R);
    g.addColorStop(0, '#fdba74'); g.addColorStop(1, '#ea580c');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ball.x - R, ball.y); ctx.lineTo(ball.x + R, ball.y); ctx.moveTo(ball.x, ball.y - R); ctx.lineTo(ball.x, ball.y + R); ctx.stroke();
    // splash particles
    for(const p of splash){ ctx.fillStyle = 'rgba(251,113,133,' + Math.max(0, p.life) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill(); }
    // SWISH! banner
    if(swish > 0){
      ctx.globalAlpha = Math.min(1, swish/16);
      ctx.fillStyle = '#fde047'; ctx.font = 'bold 26px monospace'; ctx.textAlign = 'center';
      ctx.fillText('SWISH! +2', rim.x, rim.y - 24 - (32 - swish) * 0.6);
      ctx.globalAlpha = 1; ctx.textAlign = 'left';
    }
  }

  function frame(){ update(); draw(); raf = requestAnimationFrame(frame); }

  function pos(e){ const rect = canvas.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { cx: (t.clientX-rect.left)*(W/rect.width), cy: (t.clientY-rect.top)*(H/rect.height) }; }
  function down(e){ if(flying || !running) return; const p = pos(e); if(Math.hypot(p.cx-ball.x, p.cy-ball.y) < 80){ dragging = true; setAim(p); } }
  function moveD(e){ if(dragging){ e.preventDefault(); setAim(pos(e)); } }
  function up(){
    if(!dragging || !aim){ dragging = false; return; }
    if(aim.power > 0.12){ const v = shotVel(); ball.vx = v.vx; ball.vy = v.vy; flying = true; }
    dragging = false; aim = null;
  }
  canvas.addEventListener('mousedown', down);
  window.addEventListener('mousemove', moveD);
  window.addEventListener('mouseup', up);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); down(e); }, { passive:false });
  canvas.addEventListener('touchmove', moveD, { passive:false });
  canvas.addEventListener('touchend', up);

  function endGame(){
    running = false; cancelAnimationFrame(raf); clearInterval(timer);
    document.getElementById('hpStatus').textContent = "Time's up — score: " + score;
    const record = isNewRecord('hoops', score, false);
    document.getElementById('hpControls').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + `
      <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
        <input id="hpName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="hpSave">Save Score</button>
        <button class="btn btn-small btn-ghost" id="hpRestart">Play Again</button>
      </div>`;
    document.getElementById('hpSave').addEventListener('click', async () => {
      const name = document.getElementById('hpName').value.trim() || 'Anonymous';
      await saveScore('hoops', name, score, false);
      document.getElementById('hpLB').innerHTML = leaderboardHTML('hoops','pts');
      document.getElementById('hpSave').disabled = true;
    });
    document.getElementById('hpRestart').addEventListener('click', () => {
      reset(); document.getElementById('hpControls').innerHTML = '';
      timer = setInterval(tickClock, 1000);
      raf = requestAnimationFrame(frame);
    });
  }

  timer = setInterval(tickClock, 1000);
  raf = requestAnimationFrame(frame);
  activeGameCleanup = () => {
    running = false; cancelAnimationFrame(raf); clearInterval(timer);
    canvas.removeEventListener('mousedown', down); window.removeEventListener('mousemove', moveD); window.removeEventListener('mouseup', up);
  };
}

/* ---------- Traffic Racer ---------- */
const RACER_CARS = [
  { id:'blaze', name:'Blaze', body:'#4ade80', roof:'#166534', emoji:'\uD83D\uDE97' },
  { id:'viper', name:'Viper', body:'#f43f5e', roof:'#7f1d1d', emoji:'\uD83C\uDFCE\uFE0F' },
  { id:'bolt',  name:'Bolt',  body:'#facc15', roof:'#854d0e', emoji:'\uD83D\uDE95' },
  { id:'aqua',  name:'Aqua',  body:'#22d3ee', roof:'#155e75', emoji:'\uD83D\uDE99' },
];

function openRacer(){
  openModal(`
    <h3>&#127950;&#65039; Traffic Racer</h3>
    <p class="ttt-status">Pick your ride, then dodge the traffic. Grab power-ups: &#128737;&#65039; shield &nbsp; &#9203; slow-mo &nbsp; &#129689; coins.</p>
    <div id="rcSelect" style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin:16px 0;">
      ${RACER_CARS.map(c => `
        <button class="btn btn-ghost rc-pick" data-car="${c.id}" style="display:flex; flex-direction:column; align-items:center; gap:6px; padding:14px 18px;">
          <span style="font-size:34px;">${c.emoji}</span>
          <span style="color:${c.body}; font-weight:700;">${c.name}</span>
        </button>`).join('')}
    </div>
    <h4>Top 10 — highest score wins</h4>
    <div id="rcLB" class="lb-live" data-game="racer" data-unit="m">${leaderboardHTML('racer','m')}</div>
  `);
  document.querySelectorAll('.rc-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      const car = RACER_CARS.find(c => c.id === btn.getAttribute('data-car'));
      runRacer(car);
    });
  });
}

function runRacer(car){
  const W = 360, H = 520, LANES = 4;
  openModal(`
    <h3>&#127950;&#65039; Traffic Racer &mdash; ${car.emoji} ${escapeHTML(car.name)}</h3>
    <p class="ttt-status" id="rcStatus">&larr; &rarr; or A/D to switch lanes. Don't crash.</p>
    <div style="display:flex; justify-content:center;">
      <canvas id="rcCanvas" width="${W}" height="${H}" style="max-width:100%; background:#1f2937; border:1px solid var(--panel-edge); border-radius:10px; touch-action:none;"></canvas>
    </div>
    <div id="rcControls" style="text-align:center; margin-top:12px;"></div>
    <h4>Top 10 — highest score wins</h4>
    <div id="rcLB" class="lb-live" data-game="racer" data-unit="m">${leaderboardHTML('racer','m')}</div>
  `);
  const canvas = document.getElementById('rcCanvas');
  const ctx = canvas.getContext('2d');
  const laneW = W / LANES, carW = laneW * 0.6, carH = 74;
  const CARCOL = [['#f43f5e','#7f1d1d'], ['#facc15','#854d0e'], ['#22d3ee','#155e75'], ['#a78bfa','#4c1d95'], ['#fb923c','#7c2d12']];
  const PU = { shield:'#38bdf8', slow:'#a78bfa', coin:'#facc15' };
  let lane, playerX, traffic, powerups, dist, speed, running, raf, roadY, sinceSpawn, sincePU;
  let shield, slowTimer, boostFlash;

  function laneCenter(l){ return l * laneW + laneW/2; }
  function reset(){
    lane = 1; playerX = laneCenter(lane); traffic = []; powerups = []; dist = 0; speed = 5;
    running = true; roadY = 0; sinceSpawn = 0; sincePU = 0; shield = false; slowTimer = 0; boostFlash = 0;
  }
  reset();

  function laneClear(l, limit){ return !traffic.some(t => t.lane === l && t.y < limit) && !powerups.some(p => p.lane === l && p.y < limit); }
  function spawn(){
    const l = Math.floor(Math.random() * LANES);
    if(!laneClear(l, 130)) return;
    traffic.push({ lane: l, y: -carH, color: CARCOL[Math.floor(Math.random()*CARCOL.length)] });
  }
  function spawnPU(){
    const types = Object.keys(PU);
    const type = types[Math.floor(Math.random()*types.length)];
    const l = Math.floor(Math.random() * LANES);
    if(!laneClear(l, 140)) return;
    powerups.push({ lane: l, y: -30, type });
  }

  function update(){
    if(!running) return;
    const eff = slowTimer > 0 ? speed * 0.5 : speed;
    if(slowTimer > 0) slowTimer--;
    if(boostFlash > 0) boostFlash--;
    dist += eff / 12;
    speed = Math.min(13, 5 + dist/220);
    roadY = (roadY + eff) % 60;
    const target = laneCenter(lane);
    playerX += (target - playerX) * 0.25;
    sinceSpawn += eff; sincePU += eff;
    if(sinceSpawn > 150){ spawn(); sinceSpawn = 0; }
    if(sincePU > 620){ spawnPU(); sincePU = 0; }
    const py = H - carH - 16;
    traffic.forEach(t => { t.y += eff; });
    powerups.forEach(p => { p.y += eff; });
    for(let i = traffic.length - 1; i >= 0; i--){
      const t = traffic[i];
      if(t.lane === lane && t.y + carH > py && t.y < py + carH && Math.abs(laneCenter(t.lane) - playerX) < carW*0.8){
        if(shield){ shield = false; traffic.splice(i, 1); boostFlash = 12; continue; }
        gameOver(); return;
      }
    }
    for(let i = powerups.length - 1; i >= 0; i--){
      const p = powerups[i];
      if(p.lane === lane && p.y + 24 > py && p.y < py + carH && Math.abs(laneCenter(p.lane) - playerX) < carW){
        if(p.type === 'shield') shield = true;
        else if(p.type === 'slow') slowTimer = 240;
        else if(p.type === 'coin'){ awardCoins(3); dist += 40; }
        boostFlash = 14; powerups.splice(i, 1);
      }
    }
    traffic = traffic.filter(t => t.y < H + carH);
    powerups = powerups.filter(p => p.y < H + 30);
  }

  function roundRect(x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function drawCar(x, y, body, roof){
    const bw = carW, bh = carH, lx = x - bw/2;
    // wheels
    ctx.fillStyle = '#0b0f19';
    roundRect(lx - 3, y + 10, 6, 18, 3); ctx.fill(); roundRect(lx + bw - 3, y + 10, 6, 18, 3); ctx.fill();
    roundRect(lx - 3, y + bh - 28, 6, 18, 3); ctx.fill(); roundRect(lx + bw - 3, y + bh - 28, 6, 18, 3); ctx.fill();
    // body
    ctx.fillStyle = body; ctx.shadowColor = body; ctx.shadowBlur = 8;
    roundRect(lx, y, bw, bh, 10); ctx.fill(); ctx.shadowBlur = 0;
    // cabin / windshield
    ctx.fillStyle = roof; roundRect(lx + 4, y + 16, bw - 8, 22, 5); ctx.fill();
    ctx.fillStyle = 'rgba(180,220,255,0.75)'; roundRect(lx + 6, y + 18, bw - 12, 9, 3); ctx.fill();
    ctx.fillStyle = 'rgba(180,220,255,0.55)'; roundRect(lx + 6, y + bh - 30, bw - 12, 8, 3); ctx.fill();
    // lights
    ctx.fillStyle = '#fde68a'; ctx.fillRect(lx + 4, y + 3, 8, 4); ctx.fillRect(lx + bw - 12, y + 3, 8, 4);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(lx + 4, y + bh - 5, 8, 3); ctx.fillRect(lx + bw - 12, y + bh - 5, 8, 3);
  }
  function drawPU(p){
    const x = laneCenter(p.lane), y = p.y + 12, col = PU[p.type];
    ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#0b0f19'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.type === 'shield' ? 'S' : p.type === 'slow' ? 'T' : '$', x, y + 1);
    ctx.textBaseline = 'alphabetic';
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#111827'; ctx.fillRect(laneW*0.15, 0, W - laneW*0.3, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 4; ctx.setLineDash([28, 32]); ctx.lineDashOffset = -roadY;
    for(let i = 1; i < LANES; i++){ ctx.beginPath(); ctx.moveTo(i*laneW, 0); ctx.lineTo(i*laneW, H); ctx.stroke(); }
    ctx.setLineDash([]);
    powerups.forEach(drawPU);
    traffic.forEach(t => drawCar(laneCenter(t.lane), t.y, t.color[0], t.color[1]));
    const py = H - carH - 16;
    drawCar(playerX, py, car.body, car.roof);
    if(shield){ ctx.strokeStyle = 'rgba(56,189,248,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(playerX, py + carH/2, carW*0.9, 0, Math.PI*2); ctx.stroke(); }
    if(boostFlash > 0){ ctx.fillStyle = 'rgba(250,204,21,' + (boostFlash/28) + ')'; ctx.fillRect(0,0,W,H); }
    // HUD
    ctx.fillStyle = 'rgba(245,240,255,0.95)'; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'left';
    ctx.fillText(Math.floor(dist) + ' m', 14, 26);
    let hy = 46;
    if(shield){ ctx.fillStyle = PU.shield; ctx.fillText('🛡️ shield', 14, hy); hy += 20; }
    if(slowTimer > 0){ ctx.fillStyle = PU.slow; ctx.fillText('⏳ slow ' + Math.ceil(slowTimer/60) + 's', 14, hy); }
  }

  function frame(){ update(); draw(); raf = requestAnimationFrame(frame); }

  function gameOver(){
    running = false; cancelAnimationFrame(raf);
    const score = Math.floor(dist);
    awardCoins(Math.floor(score / 50));
    document.getElementById('rcStatus').textContent = 'Crashed — distance: ' + score + ' m';
    const record = isNewRecord('racer', score, false);
    document.getElementById('rcControls').innerHTML =
      (record ? '<p class="record-banner">&#127942; NEW RECORD &#127942;</p>' : '') + `
      <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
        <input id="rcName" placeholder="Your name" maxlength="16" />
        <button class="btn btn-small btn-primary" id="rcSave">Save Score</button>
        <button class="btn btn-small btn-ghost" id="rcRestart">Play Again</button>
        <button class="btn btn-small btn-ghost" id="rcGarage">Change Car</button>
      </div>`;
    document.getElementById('rcSave').addEventListener('click', async () => {
      const name = document.getElementById('rcName').value.trim() || 'Anonymous';
      await saveScore('racer', name, score, false);
      document.getElementById('rcLB').innerHTML = leaderboardHTML('racer','m');
      document.getElementById('rcSave').disabled = true;
    });
    document.getElementById('rcRestart').addEventListener('click', () => {
      reset(); document.getElementById('rcControls').innerHTML = '';
      document.getElementById('rcStatus').textContent = '← → or A/D to switch lanes. Don\'t crash.';
      raf = requestAnimationFrame(frame);
    });
    document.getElementById('rcGarage').addEventListener('click', () => { cleanup(); openRacer(); });
  }

  function keyHandler(e){
    const k = e.key.toLowerCase();
    if(k === 'arrowleft' || k === 'a'){ lane = Math.max(0, lane - 1); e.preventDefault(); }
    else if(k === 'arrowright' || k === 'd'){ lane = Math.min(LANES - 1, lane + 1); e.preventDefault(); }
  }
  document.addEventListener('keydown', keyHandler);
  function onTap(e){ const rect = canvas.getBoundingClientRect(); const x = ((e.touches ? e.touches[0].clientX : e.clientX) - rect.left) * (W/rect.width); if(x < playerX) lane = Math.max(0, lane - 1); else lane = Math.min(LANES - 1, lane + 1); }
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onTap(e); }, { passive:false });
  canvas.addEventListener('mousedown', onTap);

  function cleanup(){ running = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', keyHandler); }
  raf = requestAnimationFrame(frame);
  activeGameCleanup = cleanup;
}

/* ---------- Spin The Wheel ---------- */

const WHEEL_COST = 20;
const WHEEL_SEGMENTS = [
  { type:'coins', value:10, label:'+10' },
  { type:'coins', value:25, label:'+25' },
  { type:'nothing', label:'BUST' },
  { type:'coins', value:50, label:'+50' },
  { type:'game', label:'GAME' },
  { type:'nothing', label:'BUST' },
  { type:'theme', label:'THEME' },
  { type:'coins', value:15, label:'+15' },
];

function cssVar(name){
  return getComputedStyle(document.body).getPropertyValue(name).trim() || '#4deeea';
}

function drawWheel(canvas){
  const ctx = canvas.getContext('2d');
  const cx = 120, cy = 120, r = 108;
  const segAngle = (Math.PI*2) / WHEEL_SEGMENTS.length;
  const palette = [cssVar('--cyan'), cssVar('--pink'), cssVar('--yellow'), cssVar('--green')];
  ctx.clearRect(0,0,240,240);
  WHEEL_SEGMENTS.forEach((seg,i) => {
    const start = i*segAngle - Math.PI/2;
    const end = start + segAngle;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,start,end);
    ctx.closePath();
    ctx.globalAlpha = seg.type === 'nothing' ? 0.3 : 0.92;
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#12091f';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(start + segAngle/2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#12091f';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(seg.label, r-16, 4);
    ctx.restore();
  });
  ctx.beginPath();
  ctx.arc(cx,cy,18,0,Math.PI*2);
  ctx.fillStyle = cssVar('--void');
  ctx.fill();
  ctx.strokeStyle = palette[0];
  ctx.lineWidth = 2;
  ctx.stroke();
}

function openWheel(){
  openModal(`
    <h3>&#127920; Spin The Wheel</h3>
    <div class="wheel-wrap">
      <div class="wheel-pointer"></div>
      <canvas id="wheelCanvas" width="240" height="240"></canvas>
    </div>
    <p class="wheel-cost">Costs ${WHEEL_COST} &#129689; per spin. You have <span id="wheelCoins">${player.coins}</span> &#129689;.</p>
    <div style="text-align:center;"><button class="btn btn-primary btn-small" id="spinBtn">Spin (${WHEEL_COST} &#129689;)</button></div>
    <p class="wheel-result" id="wheelResult"></p>
  `);

  const canvas = document.getElementById('wheelCanvas');
  drawWheel(canvas);
  let spinning = false;
  let currentRotation = 0;

  document.getElementById('spinBtn').addEventListener('click', async () => {
    if(spinning) return;
    if(player.coins < WHEEL_COST){
      document.getElementById('wheelResult').textContent = "Not enough coins — play a cabinet to earn more.";
      return;
    }
    spinning = true;
    document.getElementById('spinBtn').disabled = true;
    document.getElementById('wheelResult').textContent = '';
    player.coins -= WHEEL_COST;
    renderCoinBadge();
    document.getElementById('wheelCoins').textContent = player.coins;
    await persistPlayerState();

    const segAngle = 360 / WHEEL_SEGMENTS.length;
    const targetIndex = Math.floor(Math.random()*WHEEL_SEGMENTS.length);
    const buffer = segAngle*0.18;
    const targetAngle = targetIndex*segAngle + buffer + Math.random()*(segAngle-2*buffer);
    const fullSpins = 6 + Math.floor(Math.random()*3);
    currentRotation += fullSpins*360 + ((360-targetAngle) - (currentRotation % 360) + 360) % 360;
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => resolveSpin(targetIndex), 4150);
  });

  async function resolveSpin(i){
    const seg = WHEEL_SEGMENTS[i];
    let resultText = '';
    if(seg.type === 'coins'){
      player.coins += seg.value;
      resultText = `+${seg.value} coins!`;
    } else if(seg.type === 'nothing'){
      resultText = 'Nothing this time — spin again later.';
    } else if(seg.type === 'game'){
      const lockedGames = BUILTIN_GAMES.filter(g => g.lockable && !player.unlockedGames.includes(g.id));
      if(lockedGames.length){
        const pick = lockedGames[Math.floor(Math.random()*lockedGames.length)];
        player.unlockedGames.push(pick.id);
        resultText = `Unlocked ${pick.title}!`;
      } else {
        player.coins += 25;
        resultText = 'Every game is already unlocked — +25 coins instead!';
      }
    } else if(seg.type === 'theme'){
      const lockedThemes = THEMES.filter(t => !player.unlockedThemes.includes(t.id));
      if(lockedThemes.length){
        const pick = lockedThemes[Math.floor(Math.random()*lockedThemes.length)];
        player.unlockedThemes.push(pick.id);
        resultText = `Unlocked the ${pick.name} theme!`;
      } else {
        player.coins += 25;
        resultText = 'Every theme is already unlocked — +25 coins instead!';
      }
    }
    renderCoinBadge();
    await persistPlayerState();
    renderGrid();
    const resultEl = document.getElementById('wheelResult');
    if(resultEl){
      resultEl.textContent = resultText;
      const coinsEl = document.getElementById('wheelCoins');
      if(coinsEl) coinsEl.textContent = player.coins;
      document.getElementById('spinBtn').disabled = false;
    }
    spinning = false;
  }
}

/* ---------- Themes ---------- */

function openThemes(){
  openModal(`
    <h3>&#127912; Themes</h3>
    <div class="theme-grid">
      ${THEMES.map(t => {
        const unlocked = player.unlockedThemes.includes(t.id);
        const selected = player.theme === t.id;
        return `<div class="theme-card ${selected?'selected':''} ${unlocked?'':'locked'}" data-id="${t.id}">
          <div class="theme-swatches">${t.preview.map(c => `<span style="background:${c}"></span>`).join('')}</div>
          <div class="theme-card-name">${escapeHTML(t.name)}${unlocked?'':' &#128274;'}</div>
        </div>`;
      }).join('')}
    </div>
    <p class="form-note" style="text-align:center; margin-top:14px;">Locked themes can be won from the Wheel.</p>
  `);
  document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', async () => {
      const id = card.dataset.id;
      if(!player.unlockedThemes.includes(id)) return;
      player.theme = id;
      applyTheme();
      await persistPlayerState();
      document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

/* ================= SUBMIT FORM ================= */

function setupChips(){
  document.querySelectorAll('.chip-group').forEach(group => {
    group.addEventListener('click', (e) => {
      if(!e.target.classList.contains('chip')) return;
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      if(group.id === 'chipMode') updateModeFields(e.target.dataset.value);
    });
  });
}

function updateModeFields(mode){
  document.getElementById('modeUrlField').style.display = mode === 'link' ? 'flex' : 'none';
  document.getElementById('modeCodeField').style.display = mode === 'code' ? 'flex' : 'none';
}

function chipValue(groupId){
  const active = document.querySelector(`#${groupId} .chip.active`);
  return active ? active.dataset.value : null;
}

function setupSubmitForm(){
  document.getElementById('submitForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const toast = document.getElementById('submitToast');
    const title = document.getElementById('gTitle').value.trim();
    const creator = document.getElementById('gCreator').value.trim();
    const pitch = document.getElementById('gPitch').value.trim();
    const mode = chipValue('chipMode');
    const url = document.getElementById('gUrl').value.trim();
    const code = document.getElementById('gCode').value;
    const pace = chipValue('chipPace');
    const players = chipValue('chipPlayers');
    const type = chipValue('chipType');
    const difficulty = chipValue('chipDifficulty');
    const accent = chipValue('chipAccent') || 'cyan';

    if(!title || !creator || !pitch || !pace || !players || !type || !difficulty || !mode){
      toast.textContent = 'Fill in every field and pick one option from each row.';
      toast.classList.add('error');
      return;
    }
    if(mode === 'link' && !url){
      toast.textContent = 'Add the link, or switch to "Paste my own code" / "Not playable yet".';
      toast.classList.add('error');
      return;
    }
    if(mode === 'code' && !code.trim()){
      toast.textContent = 'Paste your game\'s code, or pick a different option above.';
      toast.classList.add('error');
      return;
    }
    toast.classList.remove('error');

    const emojiByType = { reflex:'⚡', puzzle:'🧩', strategy:'♟️', trivia:'🎯' };

    const newGame = {
      id: uid(), title, creator, pitch,
      emoji: emojiByType[type] || '🎮',
      pace, players, type, difficulty, accent,
      url: mode === 'link' ? url : null,
      code: mode === 'code' ? code : null,
      builtin: false,
    };

    document.getElementById('submitBtn').disabled = true;
    toast.textContent = 'Installing cabinet...';
    const saved = await ArcadeNet.postCabinet(newGame);
    document.getElementById('submitBtn').disabled = false;
    if(!saved){
      toast.textContent = 'Could not reach the floor — try again.';
      toast.classList.add('error');
      return;
    }
    if(!state.submittedGames.some(g => g.id === newGame.id)){
      state.submittedGames.push(newGame);
    }
    toast.textContent = 'Cabinet installed on the floor.';
    renderGrid();
    e.target.reset();
    document.querySelectorAll('.chip.active').forEach(c => c.classList.remove('active'));
    updateModeFields(null);
    setTimeout(() => { highlightCard(newGame.id); }, 300);
  });
}

/* ================= ORACLE ================= */

let oracleStep = 0;
let oracleAnswers = {};

function renderOracle(){
  oracleStep = 0;
  oracleAnswers = {};
  renderOracleQuestion();
}

function bulbRow(){
  return `<div class="bulb-row">${QUESTIONS.map((_,i) =>
    `<span class="bulb ${i<oracleStep?'lit':i===oracleStep?'current':''}"></span>`
  ).join('')}</div>`;
}

function renderOracleQuestion(){
  const q = QUESTIONS[oracleStep];
  const box = document.getElementById('oracleBox');
  box.innerHTML = `
    ${bulbRow()}
    <p class="q-prompt">${q.prompt}</p>
    <div class="q-options">
      ${q.options.map(o => `<button class="q-option" data-value="${o.value}">${o.label}</button>`).join('')}
    </div>
    <div class="oracle-nav">
      ${oracleStep > 0 ? '<button class="btn btn-ghost btn-small" id="oracleBack">Back</button>' : '<span></span>'}
      <span></span>
    </div>
  `;
  box.querySelectorAll('.q-option').forEach(btn => {
    btn.addEventListener('click', () => {
      oracleAnswers[q.key] = btn.dataset.value;
      box.querySelectorAll('.q-option').forEach(b => b.classList.remove('chosen'));
      btn.classList.add('chosen');
      setTimeout(() => {
        if(oracleStep < QUESTIONS.length - 1){
          oracleStep++;
          renderOracleQuestion();
        } else {
          revealMatch();
        }
      }, 350);
    });
  });
  const back = document.getElementById('oracleBack');
  if(back) back.addEventListener('click', () => { oracleStep--; renderOracleQuestion(); });
}

function scoreGame(g, answers){
  let score = 0;
  if(g.pace === answers.pace) score += 3;
  if(g.type === answers.type) score += 4;
  if(g.players === answers.players) score += 2;
  score += 2 - Math.abs(diffLevel(g.difficulty) - diffLevel(answers.difficulty));
  return score;
}

function revealMatch(){
  const games = allGames().filter(g => !isLocked(g));
  let best = -Infinity, top = [];
  games.forEach(g => {
    const s = scoreGame(g, oracleAnswers);
    if(s > best){ best = s; top = [g]; }
    else if(s === best){ top.push(g); }
  });
  const match = top[Math.floor(Math.random() * top.length)];

  const labelMap = {
    pace: { fast:'fast and frantic', slow:'slow and thoughtful' },
    type: { reflex:'reflex-testing', puzzle:'puzzle-solving', strategy:'strategic', trivia:'knowledge-based' },
    players: { solo:'solo', multi:'head-to-head' },
    difficulty: { easy:'easygoing', medium:'a real workout', hard:'brutal' },
  };

  const reasons = [
    `You want something ${labelMap.pace[oracleAnswers.pace]}.`,
    `You're after a ${labelMap.type[oracleAnswers.type]} challenge.`,
    `You're playing ${labelMap.players[oracleAnswers.players]}.`,
    `You want the difficulty to feel ${labelMap.difficulty[oracleAnswers.difficulty]}.`,
  ];

  const box = document.getElementById('oracleBox');
  box.innerHTML = `
    <div class="ticket">
      <p class="ticket-eyebrow">The Oracle Says</p>
      <div class="ticket-emoji">${match.emoji}</div>
      <h3 class="ticket-title">${escapeHTML(match.title)}</h3>
      <p class="ticket-pitch">${escapeHTML(match.pitch)}</p>
      <ul class="reasoning">${reasons.map(r=>`<li>${r}</li>`).join('')}</ul>
      <div class="ticket-actions">
        <button class="btn btn-primary btn-small" id="ticketPlay">Play This Cabinet</button>
        <button class="btn btn-ghost btn-small" id="ticketAgain">Ask Again</button>
      </div>
    </div>
  `;
  document.getElementById('ticketPlay').addEventListener('click', () => {
    playGame(match.id);
    highlightCard(match.id);
  });
  document.getElementById('ticketAgain').addEventListener('click', renderOracle);
}

/* ================= INIT ================= */

function checkOfflineMode(){
  if(!ArcadeNet.hasServer){
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#3a1030; color:#f5f0ff; text-align:center; padding:10px 16px; font-family:var(--font-mono); font-size:12px; border-bottom:1px solid var(--panel-edge);';
    banner.innerHTML = 'Offline mode — the built-in games work, but cabinets, leaderboards, and live multiplayer need the Arcade Floor server. Run <code>npm start</code> and open http://localhost:3000.';
    document.body.insertBefore(banner, document.body.firstChild);
    const badge = document.getElementById('onlineBadge');
    if(badge) badge.style.display = 'none';
    return true;
  }
  return false;
}

function setupLiveSync(){
  ArcadeNet.on('presence', (d) => {
    const el = document.getElementById('onlineCount');
    if(el && d && typeof d.online === 'number') el.textContent = d.online;
  });
  ArcadeNet.on('score:update', (d) => {
    if(!d || !d.gameId) return;
    state.leaderboards[d.gameId] = d.leaderboard || [];
    refreshLiveLeaderboards();
  });
  ArcadeNet.on('cabinet:update', (cabinets) => {
    if(!Array.isArray(cabinets)) return;
    state.submittedGames = cabinets;
    renderGrid();
  });
}

async function init(){
  renderHero();
  setupChips();
  setupSubmitForm();
  checkOfflineMode();
  setupLiveSync();
  await loadData();
  applyTheme();
  renderCoinBadge();
  renderGrid();
  renderOracle();
  document.getElementById('wheelBtn').addEventListener('click', openWheel);
  document.getElementById('themesBtn').addEventListener('click', openThemes);
}

init();

})();
