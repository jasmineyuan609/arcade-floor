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
