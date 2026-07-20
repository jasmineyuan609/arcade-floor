import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const STORE_PATH = join(DATA_DIR, 'store.json');

const MAX_LEADERBOARD = 10;
const MAX_CABINETS = 500;

const empty = () => ({ leaderboards: {}, cabinets: [] });

let data = empty();
let writeTimer = null;
let writing = false;

export async function loadStore() {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    data = {
      leaderboards: parsed.leaderboards && typeof parsed.leaderboards === 'object' ? parsed.leaderboards : {},
      cabinets: Array.isArray(parsed.cabinets) ? parsed.cabinets : [],
    };
  } catch {
    data = empty();
  }
  return data;
}

function scheduleSave() {
  if (writeTimer) return;
  writeTimer = setTimeout(async () => {
    writeTimer = null;
    if (writing) {
      scheduleSave();
      return;
    }
    writing = true;
    try {
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(STORE_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Failed to persist store:', err);
    } finally {
      writing = false;
    }
  }, 400);
}

export function getFloor() {
  return { leaderboards: data.leaderboards, cabinets: data.cabinets };
}

export function getLeaderboard(gameId) {
  return data.leaderboards[gameId] || [];
}

export function addScore(gameId, name, score, lowerBetter) {
  const cleanName = String(name || 'Anonymous').slice(0, 16) || 'Anonymous';
  const numeric = Number(score);
  if (!gameId || !Number.isFinite(numeric)) return null;
  const list = data.leaderboards[gameId] ? [...data.leaderboards[gameId]] : [];
  list.push({ name: cleanName, score: numeric, date: Date.now() });
  list.sort((a, b) => (lowerBetter ? a.score - b.score : b.score - a.score));
  data.leaderboards[gameId] = list.slice(0, MAX_LEADERBOARD);
  scheduleSave();
  return data.leaderboards[gameId];
}

export function addCabinet(game) {
  if (!game || typeof game !== 'object') return null;
  if (data.cabinets.length >= MAX_CABINETS) {
    data.cabinets.shift();
  }
  data.cabinets.push(game);
  scheduleSave();
  return game;
}

export function removeCabinet(id) {
  const before = data.cabinets.length;
  data.cabinets = data.cabinets.filter((g) => g.id !== id);
  const removed = data.cabinets.length !== before;
  if (removed) scheduleSave();
  return removed;
}
