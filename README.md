# Arcade Floor

A neon, player-built arcade you host yourself. Play a floor full of mini-games, install your own cabinets, and challenge real people to **live online matches** — all backed by a small Node server so leaderboards, cabinets, and duels are shared across everyone connected.

![status](https://img.shields.io/badge/multiplayer-live-5cffb1)

## Features

- **26 built-in games** — Reflex Tap, Memory Match, Math Blitz, Tic-Tac-Toe Duel, Dino Run, Geometry Jump, Neon Obby (parkour obstacle course), Neon Snake, 2048, Flappy Neon, Neon Pong (online 1v1), Blade Ball (online reflex duel), Fireboy & Watergirl (2-player co-op, level-select map + saved progress), Brick Breaker, Star Blaster (space shooter), Hoops (basketball), Traffic Racer, Tower Stack, Neon Simon, Sky Tower (Roblox-style vertical obby climb), Cash Clicker (idle simulator with upgrades, saves progress), Color Rush, Mole Smash, Neon Blocks (falling-block puzzle), Astro Drift, and Disaster Dash (natural-disaster survival). The coin-locked ones (unlock from the Wheel): Color Rush, Mole Smash, Neon Blocks, Astro Drift, Disaster Dash.
- **Real-time online multiplayer** — Neon Pong and Blade Ball are server-authoritative 1v1 games with quick match and private room codes; Tic-Tac-Toe Duel is turn-based online. Fireboy & Watergirl is 2-player co-op on one keyboard.
- **Real online multiplayer** — Tic-Tac-Toe Duel now plays against real people over the network:
  - **Quick Match** — get paired with the next person looking for a game.
  - **Private rooms** — create a 4-letter code and share it with a friend.
  - **Rematch** with the same opponent (sides swap each game).
  - Still includes a solo **vs. the Oracle AI** mode.
- **Shared, live leaderboards** — every score is stored server-side and pushed to all connected players instantly.
- **Shared cabinets** — cabinets players install (paste HTML or link out) appear for everyone on the floor in real time.
- **Live presence** — an online-player counter in the header updates as people come and go.
- **Customizable avatars** — build a blocky character (skin, shirt, pants, hat, face) + display name; saved locally and shown on your Spin/score panels.
- **Coins, prize wheels, and themes** — three wheel tiers (Spin / Mega / Diamond) with rising cost and far better theme/game odds; per-player progress saved locally in the browser.
- **The Oracle** — answer a few questions and get matched to a cabinet.

## Get a permanent link (deploy for free)

The `trycloudflare` link is temporary. For an always-on URL that never changes, deploy the repo — this repo ships a `render.yaml` blueprint:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jasmineyuan609/arcade-floor)

1. Click the button, sign in to [Render](https://render.com) (free), and approve the blueprint.
2. Render builds and hosts it, giving you a fixed URL like `https://arcade-floor.onrender.com` that you can share any time.
3. (Optional) Point a custom domain (e.g. one you buy from Namecheap/Cloudflare) at the Render service to get a name like `arcade-time.com`.

Railway/Fly.io work too — any host that runs `npm install` + `npm start` and provides a `PORT` env var.

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
