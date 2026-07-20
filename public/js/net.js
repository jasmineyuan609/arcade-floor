/* Networking layer for Arcade Floor.
   Talks to the Express/Socket.IO backend for shared leaderboards, shared
   cabinets, live presence, and real-time multiplayer. Falls back to
   localStorage when opened without the server (e.g. straight from disk). */
window.ArcadeNet = (function () {
  const hasServer = typeof io !== 'undefined' && location.protocol.startsWith('http');
  const socket = hasServer ? io() : null;
  const listeners = {};

  function on(evt, fn) {
    (listeners[evt] = listeners[evt] || []).push(fn);
    return () => {
      listeners[evt] = (listeners[evt] || []).filter((f) => f !== fn);
    };
  }
  function fire(evt, data) {
    (listeners[evt] || []).forEach((fn) => {
      try { fn(data); } catch (e) { console.error(e); }
    });
  }

  if (socket) {
    ['presence', 'score:update', 'cabinet:update',
      'mp:waiting', 'mp:matched', 'mp:state', 'mp:opponent_left',
      'mp:error', 'mp:rematch_vote',
      'rt:waiting', 'rt:matched', 'rt:state', 'rt:over',
      'rt:opponent_left', 'rt:error'].forEach((evt) => {
      socket.on(evt, (data) => fire(evt, data));
    });
  }

  /* ---------- local fallback store ---------- */
  const LS_KEY = 'arcade-floor-local';
  function localStore() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || { leaderboards: {}, cabinets: [] }; }
    catch { return { leaderboards: {}, cabinets: [] }; }
  }
  function saveLocal(s) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  }

  async function fetchFloor() {
    if (!hasServer) return localStore();
    try {
      const r = await fetch('/api/floor');
      if (!r.ok) throw new Error('bad status');
      return await r.json();
    } catch {
      return localStore();
    }
  }

  async function postScore(gameId, name, score, lowerBetter) {
    if (!hasServer) {
      const s = localStore();
      const list = s.leaderboards[gameId] ? [...s.leaderboards[gameId]] : [];
      list.push({ name: String(name).slice(0, 16), score, date: Date.now() });
      list.sort((a, b) => (lowerBetter ? a.score - b.score : b.score - a.score));
      s.leaderboards[gameId] = list.slice(0, 10);
      saveLocal(s);
      return s.leaderboards[gameId];
    }
    try {
      const r = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, name, score, lowerBetter }),
      });
      const data = await r.json();
      return data.leaderboard || [];
    } catch {
      return null;
    }
  }

  async function postCabinet(game) {
    if (!hasServer) {
      const s = localStore();
      s.cabinets.push(game);
      saveLocal(s);
      return game;
    }
    try {
      const r = await fetch('/api/cabinet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game }),
      });
      const data = await r.json();
      return data.game || null;
    } catch {
      return null;
    }
  }

  async function deleteCabinet(id, password) {
    if (!hasServer) {
      const s = localStore();
      s.cabinets = s.cabinets.filter((g) => g.id !== id);
      saveLocal(s);
      return { removed: true };
    }
    try {
      const r = await fetch(`/api/cabinet/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (r.status === 403) return { removed: false, forbidden: true };
      const data = await r.json();
      return data;
    } catch {
      return { removed: false };
    }
  }

  const mp = {
    available: !!socket,
    quickMatch(name) { if (socket) socket.emit('mp:quickmatch', { name }); },
    createRoom(name) { if (socket) socket.emit('mp:create', { name }); },
    joinRoom(code, name) { if (socket) socket.emit('mp:join', { code, name }); },
    move(index) { if (socket) socket.emit('mp:move', { index }); },
    rematch() { if (socket) socket.emit('mp:rematch'); },
    leave() { if (socket) socket.emit('mp:leave'); },
  };

  const rt = {
    available: !!socket,
    quickMatch(game, name) { if (socket) socket.emit('rt:quickmatch', { game, name }); },
    createRoom(game, name) { if (socket) socket.emit('rt:create', { game, name }); },
    joinRoom(game, code, name) { if (socket) socket.emit('rt:join', { game, code, name }); },
    input(data) { if (socket) socket.emit('rt:input', data); },
    leave() { if (socket) socket.emit('rt:leave'); },
  };

  return {
    hasServer, on, fetchFloor, postScore, postCabinet, deleteCabinet, mp, rt,
  };
}());
