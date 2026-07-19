# Arcade Floor

A neon, player-built arcade you host yourself. Play a floor full of mini-games, install your own cabinets, and challenge real people to **live online matches** — all backed by a small Node server so leaderboards, cabinets, and duels are shared across everyone connected.

![status](https://img.shields.io/badge/multiplayer-live-5cffb1)

## Features

- **15 built-in games** — Reflex Tap, Memory Match, Math Blitz, Tic-Tac-Toe Duel, Dino Run, Geometry Jump, Neon Obby (parkour obstacle course), Neon Snake, 2048, Flappy Neon, Neon Pong (online 1v1), Blade Ball (online reflex duel), Fireboy & Watergirl (2-player co-op), Color Rush, and Mole Smash.
- **Real-time online multiplayer** — Neon Pong and Blade Ball are server-authoritative 1v1 games with quick match and private room codes; Tic-Tac-Toe Duel is turn-based online. Fireboy & Watergirl is 2-player co-op on one keyboard.
- **Real online multiplayer** — Tic-Tac-Toe Duel now plays against real people over the network:
  - **Quick Match** — get paired with the next person looking for a game.
  - **Private rooms** — create a 4-letter code and share it with a friend.
  - **Rematch** with the same opponent (sides swap each game).
  - Still includes a solo **vs. the Oracle AI** mode.
- **Shared, live leaderboards** — every score is stored server-side and pushed to all connected players instantly.
- **Shared cabinets** — cabinets players install (paste HTML or link out) appear for everyone on the floor in real time.
- **Live presence** — an online-player counter in the header updates as people come and go.
- **Coins, prize wheel, and themes** — per-player progress saved locally in the browser.
- **The Oracle** — answer a few questions and get matched to a cabinet.

## Tech

- **Backend:** Node.js, [Express](https://expressjs.com/) (static hosting + REST API), [Socket.IO](https://socket.io/) (presence + real-time multiplayer).
- **Frontend:** vanilla HTML/CSS/JS (no build step). Game data persists to a JSON file (`data/store.json`).

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:3000. Open a second browser tab (or send the link to a friend) and start a Quick Match to duel.

For auto-reload during development:

```bash
npm run dev
```

### Configuration

| Env var | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Port the server listens on. |
| `FLOOR_PASSWORD` | `jasmine` | Password required to delete a player-submitted cabinet. |

## Project layout

```
server/
  index.js        Express + Socket.IO server, REST API, presence
  store.js        JSON-file persistence for leaderboards + cabinets
  multiplayer.js  Real-time Tic-Tac-Toe rooms + matchmaking
public/
  index.html      Page shell
  css/styles.css  Styles
  js/net.js       Networking layer (REST + Socket.IO, offline fallback)
  js/app.js       Arcade UI + all game logic
data/
  store.json      Created at runtime (git-ignored)
```

## Adding a cabinet with a leaderboard

When you submit a "Paste my own code" cabinet, it runs sandboxed in its own iframe. Report a score to the shared leaderboard from your game with:

```js
parent.postMessage({ type: 'arcade-score', score: yourScore }, '*');
```

## Notes

- Player progress (coins, unlocked games/themes, chosen theme, name) is stored in `localStorage` per browser.
- Opened directly from disk (without the server) the built-in single-player games still work, but online features are disabled.

## Lint

```bash
npm run lint
```

## License

MIT
