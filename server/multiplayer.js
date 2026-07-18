// Real-time 1v1 Tic-Tac-Toe: quick matchmaking + private room codes.

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { symbol: board[a], line: [a, b, c] };
    }
  }
  if (board.every((v) => v)) return { symbol: 'draw', line: null };
  return null;
}

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export class MultiplayerManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // code -> room
    this.queue = []; // sockets waiting for a quick match
    this.socketRoom = new Map(); // socketId -> code
  }

  register(socket) {
    socket.on('mp:quickmatch', ({ name } = {}) => this.quickMatch(socket, name));
    socket.on('mp:create', ({ name } = {}) => this.createRoom(socket, name));
    socket.on('mp:join', ({ code, name } = {}) => this.joinRoom(socket, code, name));
    socket.on('mp:move', ({ index } = {}) => this.handleMove(socket, index));
    socket.on('mp:rematch', () => this.handleRematch(socket));
    socket.on('mp:leave', () => this.leave(socket));
    socket.on('disconnect', () => this.leave(socket));
  }

  cleanName(name) {
    return String(name || 'Player').trim().slice(0, 16) || 'Player';
  }

  quickMatch(socket, name) {
    this.leave(socket);
    socket.data.mpName = this.cleanName(name);
    // Drop stale/duplicate queue entries.
    this.queue = this.queue.filter((s) => s.connected && s.id !== socket.id);
    if (this.queue.length > 0) {
      const opponent = this.queue.shift();
      this.startGame(opponent, socket, false);
    } else {
      this.queue.push(socket);
      socket.emit('mp:waiting', { mode: 'quick' });
    }
  }

  createRoom(socket, name) {
    this.leave(socket);
    socket.data.mpName = this.cleanName(name);
    let code = makeCode();
    while (this.rooms.has(code)) code = makeCode();
    const room = {
      code,
      players: [{ id: socket.id, name: socket.data.mpName, symbol: 'X' }],
      board: Array(9).fill(null),
      turn: 'X',
      over: false,
      rematch: new Set(),
    };
    this.rooms.set(code, room);
    this.socketRoom.set(socket.id, code);
    socket.join(code);
    socket.emit('mp:waiting', { mode: 'room', code });
  }

  joinRoom(socket, code, name) {
    const key = String(code || '').trim().toUpperCase();
    const room = this.rooms.get(key);
    if (!room) {
      socket.emit('mp:error', { message: 'No room with that code.' });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit('mp:error', { message: 'That room is already full.' });
      return;
    }
    this.leave(socket);
    socket.data.mpName = this.cleanName(name);
    const host = this.io.sockets.sockets.get(room.players[0].id);
    if (!host) {
      this.rooms.delete(key);
      socket.emit('mp:error', { message: 'That room is no longer available.' });
      return;
    }
    this.startGame(host, socket, false, room);
  }

  startGame(socketX, socketO, _unused, existingRoom) {
    let room = existingRoom;
    if (!room) {
      let code = makeCode();
      while (this.rooms.has(code)) code = makeCode();
      room = {
        code,
        players: [],
        board: Array(9).fill(null),
        turn: 'X',
        over: false,
        rematch: new Set(),
      };
      this.rooms.set(code, room);
    }
    room.board = Array(9).fill(null);
    room.turn = 'X';
    room.over = false;
    room.rematch = new Set();
    room.players = [
      { id: socketX.id, name: socketX.data.mpName || 'Player', symbol: 'X' },
      { id: socketO.id, name: socketO.data.mpName || 'Player', symbol: 'O' },
    ];

    this.socketRoom.set(socketX.id, room.code);
    this.socketRoom.set(socketO.id, room.code);
    socketX.join(room.code);
    socketO.join(room.code);

    const [pX, pO] = room.players;
    socketX.emit('mp:matched', { code: room.code, symbol: 'X', opponent: pO.name });
    socketO.emit('mp:matched', { code: room.code, symbol: 'O', opponent: pX.name });
    this.broadcastState(room);
  }

  broadcastState(room) {
    const result = winner(room.board);
    this.io.to(room.code).emit('mp:state', {
      board: room.board,
      turn: room.turn,
      over: room.over,
      result: result ? { symbol: result.symbol, line: result.line } : null,
    });
  }

  handleMove(socket, index) {
    const code = this.socketRoom.get(socket.id);
    if (!code) return;
    const room = this.rooms.get(code);
    if (!room || room.over) return;
    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;
    const i = Number(index);
    if (!Number.isInteger(i) || i < 0 || i > 8) return;
    if (room.turn !== player.symbol) return;
    if (room.board[i]) return;

    room.board[i] = player.symbol;
    const result = winner(room.board);
    if (result) {
      room.over = true;
    } else {
      room.turn = room.turn === 'X' ? 'O' : 'X';
    }
    this.broadcastState(room);
  }

  handleRematch(socket) {
    const code = this.socketRoom.get(socket.id);
    if (!code) return;
    const room = this.rooms.get(code);
    if (!room || room.players.length < 2) return;
    room.rematch.add(socket.id);
    this.io.to(room.code).emit('mp:rematch_vote', { count: room.rematch.size });
    if (room.rematch.size >= 2) {
      room.board = Array(9).fill(null);
      // Loser/second player starts the rematch: swap who is X.
      room.players.reverse();
      room.players[0].symbol = 'X';
      room.players[1].symbol = 'O';
      room.turn = 'X';
      room.over = false;
      room.rematch = new Set();
      for (const p of room.players) {
        const s = this.io.sockets.sockets.get(p.id);
        if (s) {
          const opp = room.players.find((o) => o.id !== p.id);
          s.emit('mp:matched', { code: room.code, symbol: p.symbol, opponent: opp ? opp.name : 'Player' });
        }
      }
      this.broadcastState(room);
    }
  }

  leave(socket) {
    this.queue = this.queue.filter((s) => s.id !== socket.id);
    const code = this.socketRoom.get(socket.id);
    if (!code) return;
    this.socketRoom.delete(socket.id);
    socket.leave(code);
    const room = this.rooms.get(code);
    if (!room) return;
    room.players = room.players.filter((p) => p.id !== socket.id);
    if (room.players.length === 0) {
      this.rooms.delete(code);
      return;
    }
    // Tell the remaining player their opponent bailed.
    this.io.to(code).emit('mp:opponent_left');
    room.over = true;
  }
}
