import http from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import {
  loadStore, getFloor, addScore, addCabinet, removeCabinet,
} from './store.js';
import { MultiplayerManager } from './multiplayer.js';
import { RealtimeManager, PaintballManager } from './realtime.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const PORT = process.env.PORT || 3000;
const FLOOR_PASSWORD = process.env.FLOOR_PASSWORD || 'jasmine';

const app = express();
app.use(express.json({ limit: '512kb' }));
app.use(express.static(PUBLIC_DIR));

const server = http.createServer(app);
const io = new Server(server);
const mp = new MultiplayerManager(io);
const rt = new RealtimeManager(io);
const paintball = new PaintballManager(io);

let online = 0;

function broadcastPresence() {
  io.emit('presence', { online });
}

// ---------- REST API ----------

app.get('/api/floor', (_req, res) => {
  res.json(getFloor());
});

app.post('/api/score', (req, res) => {
  const {
    gameId, name, score, lowerBetter,
  } = req.body || {};
  const board = addScore(gameId, name, score, !!lowerBetter);
  if (!board) {
    res.status(400).json({ error: 'Invalid score payload.' });
    return;
  }
  io.emit('score:update', { gameId, leaderboard: board });
  res.json({ leaderboard: board });
});

app.post('/api/cabinet', (req, res) => {
  const { game } = req.body || {};
  if (!game || typeof game.title !== 'string' || !game.id) {
    res.status(400).json({ error: 'Invalid cabinet payload.' });
    return;
  }
  const saved = addCabinet(game);
  io.emit('cabinet:update', getFloor().cabinets);
  res.json({ game: saved });
});

app.delete('/api/cabinet/:id', (req, res) => {
  const { password } = req.body || {};
  if (password !== FLOOR_PASSWORD) {
    res.status(403).json({ error: 'Wrong password.' });
    return;
  }
  const removed = removeCabinet(req.params.id);
  if (removed) io.emit('cabinet:update', getFloor().cabinets);
  res.json({ removed });
});

// ---------- Socket.IO ----------

io.on('connection', (socket) => {
  online += 1;
  broadcastPresence();
  mp.register(socket);
  rt.register(socket);
  paintball.register(socket);

  socket.on('disconnect', () => {
    online = Math.max(0, online - 1);
    broadcastPresence();
  });
});

async function start() {
  await loadStore();
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Arcade Floor running at http://localhost:${PORT}`);
  });
}

start();
