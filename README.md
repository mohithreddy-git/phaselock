# ⬡ PHASE LOCK — Dual-Realm Containment Protocol

> **CTRL + PLAY Hackathon Submission** — A competition-grade cyberpunk puzzle game built with zero external dependencies.

[![HTML5](https://img.shields.io/badge/HTML5-Canvas%202D-E34F26?style=flat-square&logo=html5)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![CSS3](https://img.shields.io/badge/CSS3-Glassmorphism-1572B6?style=flat-square&logo=css3)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PWA](https://img.shields.io/badge/PWA-100%25%20Offline-5A0FC8?style=flat-square)](https://web.dev/progressive-web-apps/)

---

## 🎮 About the Game

**Phase Lock** is a dual-dimension grid-based puzzle game where the player exists simultaneously in two realms — the **Alpha Realm** (Neon Cyan) and the **Omega Realm** (Magenta Violet). Solving each level requires mastering phase shifting between dimensions to maneuver through obstacles and activate pressure plates that unlock the exit gate.

### Core Mechanics
- **Dual Realms**: Move through two overlapping 8×8 grids. Walls in one realm are passable in the other.
- **Phase Shift**: Press `SPACEBAR` to instantly switch between Alpha and Omega dimension.
- **Block Pushing**: Shove movable blocks onto pressure plates to unlock the exit.
- **No External Libraries**: Pure HTML5 Canvas, CSS3, Vanilla ES6+ JavaScript, and Web Audio API.

---

## 🌍 Three Worlds · 15 Levels

| World | Theme | Levels | Par Range |
|---|---|---|---|
| 🏙️ **Neon City** | Futuristic cyberpunk cityscape | 5 | 16 – 32 moves |
| 🔮 **Crystal Caves** | Subterranean crystal caverns | 5 | 21 – 33 moves |
| ☁️ **Sky Islands** | Celestial floating platforms | 5 | 19 – 34 moves |

All 15 levels are **mathematically verified** using a dual-run Breadth-First Search (BFS) solver confirming:
1. Each level is **solvable** using Phase Shift mechanics.
2. Each level is **unsolvable** without Phase Shift (Phase Shift is always required).
3. The **Par move count** is the exact shortest action sequence.

---

## 🏆 Scoring System

```
Total Score = Move Points + Time Points + Streak Bonus  (Max: 1,200 pts)
```

| Component | Max | Formula |
|---|---|---|
| Move Efficiency | 700 pts | `700 × min(1, Par / ActualMoves)` |
| Time Efficiency | 250 pts | `250 × min(1, TargetTime / Elapsed)` |
| Win Streak Bonus | 250 pts | `50 × min(Streak, 5)` |

**Stars:** ★★★ at Par+2 moves · ★★ at Par×1.45+3 · ★ for any clear.

---

## 👾 Features

- ✅ **Entrance Landing Screen** with Click-to-Play and developer credits
- ✅ **SVG Map Selection** with offline-generated world illustrations
- ✅ **Adventure-style Circular Level Map** with locked/unlocked/completed node states
- ✅ **Per-Level Local Leaderboards** (top 5 runs with tie-breaking)
- ✅ **Anti-Exploit Undo System** (undo never erases scoring action count)
- ✅ **Synthesized Audio** via Web Audio API (no audio files)
- ✅ **60 FPS Particle Engine** for movement trails, shift bursts, and victory effects
- ✅ **100% Offline PWA** with Service Worker cache
- ✅ **Responsive Design** for desktop and mobile

---

## 🚀 Quick Launch

```bash
# Serve the game locally
cd phase-lock
python3 -m http.server 8080
# Open: http://localhost:8080
```

No build step, no `npm install`, no dependencies required.

---

## 🧪 Verification & Testing

```bash
# BFS dual-run solver — verifies all 15 levels
node verify_all_15_levels.js

# Full 96-test integration suite
node test_15_levels_engine.js
```

**Test Results:**
- ✅ BFS Solver: 15/15 levels pass dual-run verification
- ✅ Integration Suite: 96/96 tests pass (100%)

---

## 🗂️ Project Structure

```
phase-lock/
├── index.html              # Game entry point (entrance, views, modals)
├── manifest.json           # PWA web app manifest
├── sw.js                   # Service Worker (offline caching)
├── css/
│   └── style.css           # Cyberpunk theme, animations, responsive layout
└── js/
    ├── main.js             # View router, event binding, game loop
    ├── game-state.js       # Live state, undo stack, timer, move tracking
    ├── rules-engine.js     # Collision, push, plate, gate win logic
    ├── level-manager.js    # 15 handcrafted level definitions + par targets
    ├── renderer.js         # Canvas 2D dual-realm graphics engine
    ├── particle-engine.js  # 60 FPS particle effect system
    ├── audio-synthesizer.js# Web Audio API procedural sound synthesis
    ├── score-calculator.js # Scoring formulas and star rating calculator
    ├── storage-manager.js  # localStorage persistence and leaderboards
    ├── map-illustrations.js# Offline SVG world artwork generator
    └── input-controller.js # Keyboard, touch, and D-pad input handler
```

---

## 👨‍💻 Developed By

| # | Developer |
|---|---|
| 1 | **Mohith Reddy** |
| 2 | **Veera Reddy** |
| 3 | **Abdullah** |

---

## 📄 License

MIT — Free to use, modify, and distribute.
