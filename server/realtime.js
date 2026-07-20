// Real-time 1v1 games (Pong, Blade Ball): server-authoritative simulation
// with quick matchmaking and private room codes. Uses an `rt:` event namespace
// so it never collides with the turn-based Tic-Tac-Toe manager.

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ---------- Pong ----------
const PONG = {
  W: 600, H: 360, paddleH: 74, paddleW: 12, ballR: 8,
  baseSpeed: 5, maxSpeed: 12, winScore: 7, tick: 1000 / 45,
};

function pongInit() {
  return {
    ball: { x: PONG.W / 2, y: PONG.H / 2, vx: 0, vy: 0 },
    paddles: { left: PONG.H / 2, right: PONG.H / 2 },
    score: { left: 0, right: 0 },
    serving: true,
    serveAt: Date.now() + 800,
  };
}
function pongServe(g, dir) {
  g.ball.x = PONG.W / 2;
  g.ball.y = PONG.H / 2;
  const angle = (Math.random() * 0.6 - 0.3);
  g.ball.vx = dir * PONG.baseSpeed * Math.cos(angle);
  g.ball.vy = PONG.baseSpeed * Math.sin(angle);
  g.serving = false;
}
function pongStep(room) {
  const g = room.game;
  if (g.serving) {
    if (Date.now() >= g.serveAt) pongServe(g, Math.random() < 0.5 ? 1 : -1);
    return null;
  }
  const b = g.ball;
  b.x += b.vx;
  b.y += b.vy;
  if (b.y < PONG.ballR) { b.y = PONG.ballR; b.vy = Math.abs(b.vy); }
  if (b.y > PONG.H - PONG.ballR) { b.y = PONG.H - PONG.ballR; b.vy = -Math.abs(b.vy); }

  const speedUp = (paddleY, side) => {
    const dy = (b.y - paddleY) / (PONG.paddleH / 2);
    const speed = Math.min(PONG.maxSpeed, Math.hypot(b.vx, b.vy) + 0.6);
    const dir = side === 'left' ? 1 : -1;
    const angle = dy * 0.9;
    b.vx = dir * speed * Math.cos(angle);
    b.vy = speed * Math.sin(angle);
  };

  // left paddle
  if (b.vx < 0 && b.x - PONG.ballR <= 20 + PONG.paddleW && b.x > 20) {
    if (Math.abs(b.y - g.paddles.left) <= PONG.paddleH / 2 + PONG.ballR) {
      b.x = 20 + PONG.paddleW + PONG.ballR;
      speedUp(g.paddles.left, 'left');
    }
  }
  // right paddle
  if (b.vx > 0 && b.x + PONG.ballR >= PONG.W - 20 - PONG.paddleW && b.x < PONG.W - 20) {
    if (Math.abs(b.y - g.paddles.right) <= PONG.paddleH / 2 + PONG.ballR) {
      b.x = PONG.W - 20 - PONG.paddleW - PONG.ballR;
      speedUp(g.paddles.right, 'right');
    }
  }

  if (b.x < -20) {
    g.score.right += 1;
    if (g.score.right >= PONG.winScore) return { winner: 'right' };
    g.serving = true; g.serveAt = Date.now() + 700;
  } else if (b.x > PONG.W + 20) {
    g.score.left += 1;
    if (g.score.left >= PONG.winScore) return { winner: 'left' };
    g.serving = true; g.serveAt = Date.now() + 700;
  }
  return null;
}
function pongInput(room, side, data) {
  const g = room.game;
  if (data && typeof data.paddle === 'number') {
    const y = Math.max(PONG.paddleH / 2, Math.min(PONG.H - PONG.paddleH / 2, data.paddle));
    g.paddles[side] = y;
  }
}
function pongState(room) {
  const g = room.game;
  return {
    ball: { x: Math.round(g.ball.x), y: Math.round(g.ball.y) },
    paddles: { left: Math.round(g.paddles.left), right: Math.round(g.paddles.right) },
    score: g.score,
    serving: g.serving,
  };
}

// ---------- Blade Ball ----------
const BLADE = {
  tick: 1000 / 40, baseSpeed: 0.011, speedUp: 0.0016, maxSpeed: 0.05, zone: 0.24,
};
function bladeInit() {
  return {
    t: 0.5,
    dir: Math.random() < 0.5 ? 1 : -1,
    speed: BLADE.baseSpeed,
    hits: 0,
    startAt: Date.now() + 900,
    started: false,
  };
}
function bladeStep(room) {
  const g = room.game;
  if (!g.started) {
    if (Date.now() >= g.startAt) g.started = true;
    return null;
  }
  g.t += g.dir * g.speed;
  if (g.t >= 1) return { winner: 'left' }; // right player failed to parry
  if (g.t <= 0) return { winner: 'right' }; // left player failed to parry
  return null;
}
function bladeInput(room, side, data) {
  const g = room.game;
  if (!g.started || !data || data.type !== 'parry') return;
  // A player can only parry when the ball is approaching them within the zone.
  const approachingRight = g.dir > 0 && g.t >= 1 - BLADE.zone;
  const approachingLeft = g.dir < 0 && g.t <= BLADE.zone;
  if (side === 'right' && approachingRight) {
    g.dir = -1; g.hits += 1; g.speed = Math.min(BLADE.maxSpeed, g.speed + BLADE.speedUp);
  } else if (side === 'left' && approachingLeft) {
    g.dir = 1; g.hits += 1; g.speed = Math.min(BLADE.maxSpeed, g.speed + BLADE.speedUp);
  }
}
function bladeState(room) {
  const g = room.game;
  let danger = null;
  if (g.started) {
    if (g.dir > 0 && g.t >= 1 - BLADE.zone) danger = 'right';
    else if (g.dir < 0 && g.t <= BLADE.zone) danger = 'left';
  }
  return {
    t: Math.round(g.t * 1000) / 1000, dir: g.dir, hits: g.hits, danger, started: g.started,
  };
}

const GAMES = {
  pong: {
    init: pongInit, step: pongStep, input: pongInput, state: pongState, tick: PONG.tick, coins: 15,
  },
  blade: {
    init: bladeInit, step: bladeStep, input: bladeInput, state: bladeState, tick: BLADE.tick, coins: 15,
  },
};

export class RealtimeManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // code -> room
    this.queues = {}; // gameId -> [sockets]
    this.socketRoom = new Map(); // socketId -> code
  }

  register(socket) {
    socket.on('rt:quickmatch', ({ game, name } = {}) => this.quickMatch(socket, game, name));
    socket.on('rt:create', ({ game, name } = {}) => this.createRoom(socket, game, name));
    socket.on('rt:join', ({ game, code, name } = {}) => this.joinRoom(socket, game, code, name));
    socket.on('rt:input', (data) => this.handleInput(socket, data));
    socket.on('rt:leave', () => this.leave(socket));
    socket.on('disconnect', () => this.leave(socket));
  }

  cleanName(name) {
    return String(name || 'Player').trim().slice(0, 16) || 'Player';
  }

  quickMatch(socket, game, name) {
    if (!GAMES[game]) { socket.emit('rt:error', { message: 'Unknown game.' }); return; }
    this.leave(socket);
    socket.data.rtName = this.cleanName(name);
    const q = (this.queues[game] = (this.queues[game] || []).filter((s) => s.connected && s.id !== socket.id));
    if (q.length > 0) {
      const opponent = q.shift();
      this.startGame(game, opponent, socket);
    } else {
      q.push(socket);
      socket.emit('rt:waiting', { mode: 'quick' });
    }
  }

  createRoom(socket, game, name) {
    if (!GAMES[game]) { socket.emit('rt:error', { message: 'Unknown game.' }); return; }
    this.leave(socket);
    socket.data.rtName = this.cleanName(name);
    let code = makeCode();
    while (this.rooms.has(code)) code = makeCode();
    const room = {
      code, game, gameId: game, players: [{ id: socket.id, name: socket.data.rtName, side: 'left' }],
      pending: true, loop: null,
    };
    this.rooms.set(code, room);
    this.socketRoom.set(socket.id, code);
    socket.join(code);
    socket.emit('rt:waiting', { mode: 'room', code });
  }

  joinRoom(socket, game, code, name) {
    const key = String(code || '').trim().toUpperCase();
    const room = this.rooms.get(key);
    if (!room || !room.pending) { socket.emit('rt:error', { message: 'No open room with that code.' }); return; }
    if (room.gameId !== game) { socket.emit('rt:error', { message: 'That room is a different game.' }); return; }
    const host = this.io.sockets.sockets.get(room.players[0].id);
    if (!host) { this.rooms.delete(key); socket.emit('rt:error', { message: 'That room is no longer available.' }); return; }
    this.leave(socket);
    socket.data.rtName = this.cleanName(name);
    this.startGame(game, host, socket, room);
  }

  startGame(gameId, sockL, sockR, existingRoom) {
    let room = existingRoom;
    if (!room) {
      let code = makeCode();
      while (this.rooms.has(code)) code = makeCode();
      room = { code, gameId, players: [], loop: null };
      this.rooms.set(code, room);
    }
    room.gameId = gameId;
    room.pending = false;
    room.over = false;
    room.players = [
      { id: sockL.id, name: sockL.data.rtName || 'Player', side: 'left' },
      { id: sockR.id, name: sockR.data.rtName || 'Player', side: 'right' },
    ];
    room.game = GAMES[gameId].init();

    this.socketRoom.set(sockL.id, room.code);
    this.socketRoom.set(sockR.id, room.code);
    sockL.join(room.code);
    sockR.join(room.code);

    const [pL, pR] = room.players;
    sockL.emit('rt:matched', { code: room.code, game: gameId, side: 'left', opponent: pR.name });
    sockR.emit('rt:matched', { code: room.code, game: gameId, side: 'right', opponent: pL.name });

    this.startLoop(room);
  }

  startLoop(room) {
    const def = GAMES[room.gameId];
    if (room.loop) clearInterval(room.loop);
    room.loop = setInterval(() => {
      if (room.over) return;
      const result = def.step(room);
      this.io.to(room.code).emit('rt:state', def.state(room));
      if (result) this.endGame(room, result.winner);
    }, def.tick);
  }

  handleInput(socket, data) {
    const code = this.socketRoom.get(socket.id);
    if (!code) return;
    const room = this.rooms.get(code);
    if (!room || room.over || room.pending) return;
    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;
    GAMES[room.gameId].input(room, player.side, data);
  }

  endGame(room, winnerSide) {
    if (room.over) return;
    room.over = true;
    if (room.loop) { clearInterval(room.loop); room.loop = null; }
    const winner = room.players.find((p) => p.side === winnerSide);
    this.io.to(room.code).emit('rt:over', {
      winner: winnerSide,
      winnerName: winner ? winner.name : 'Player',
      coins: GAMES[room.gameId].coins,
    });
  }

  leave(socket) {
    Object.keys(this.queues).forEach((g) => {
      this.queues[g] = (this.queues[g] || []).filter((s) => s.id !== socket.id);
    });
    const code = this.socketRoom.get(socket.id);
    if (!code) return;
    this.socketRoom.delete(socket.id);
    socket.leave(code);
    const room = this.rooms.get(code);
    if (!room) return;
    room.players = room.players.filter((p) => p.id !== socket.id);
    if (room.loop) { clearInterval(room.loop); room.loop = null; }
    if (room.players.length === 0) { this.rooms.delete(code); return; }
    if (!room.over) {
      room.over = true;
      this.io.to(code).emit('rt:opponent_left');
    }
  }
}
