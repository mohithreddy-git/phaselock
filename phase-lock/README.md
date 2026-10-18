# PHASE LOCK — Dual-Realm Containment Protocol

> Built for the **CTRL + PLAY Hackathon**. A competition-grade cyberpunk puzzle game featuring dual-dimension spatial reasoning, 3 distinct worlds, 15 handcrafted and solver-verified levels, competitive efficiency/time/streak scoring, and 100% offline-ready local leaderboards.

---

## 1. Quick Launch Instructions

PHASE LOCK requires zero external dependencies, no API keys, and no build pipeline.

### Option A: Local HTTP Server (Recommended for PWA & Audio Context)
```bash
# Navigate to the phase-lock folder
cd phase-lock

# Start using Python's built-in server
python3 -m http.server 8080

# Or start using Node.js
npx serve .
```
Open your browser to: **`http://localhost:8080`**

### Option B: Direct Local File Execution
You can also directly double-click or open `index.html` in modern Chromium, Firefox, or Safari browsers via the `file://` protocol.

---

## 2. Three Themed Worlds & 15 Handcrafted Levels

The opening screen (**"CHOOSE YOUR WORLD"**) allows immediate selection across three distinct dimensional sectors:

### MAP 01 — NEON DISTRICT (Cyberpunk City Grid)
- **Theme**: Cyan/teal neon signage (`#00F3FF`), digital billboards, and energy grids.
- **Difficulty**: Beginner → Intermediate.
1. **First Signal** (Level 1) — Introduces basic dimensional movement, crate pushing, and dual-realm power plates.
2. **Cross-Street Lock** (Level 2) — Navigate blocked intersections by changing dimensions at safe waypoints.
3. **Substation Relay** (Level 3) — Coordinate two energy blocks and activate separated power plates.
4. **Neon Overpass** (Level 4) — Work around walls that obstruct different paths in the two realms.
5. **District Reboot** (Level 5) — Multi-stage power routing puzzle combining all previous concepts.

### MAP 02 — QUANTUM LAB (Dimensional Research Facility)
- **Theme**: Synthetic magenta/violet energy fields (`#FF007F`), containment chambers, and reactor rings.
- **Difficulty**: Intermediate → Advanced.
1. **Calibration Chamber** (Level 1) — Check both dimensions before committing matter pushes.
2. **Mirror Protocol** (Level 2) — Navigate differently shaped corridors across synchronized realms.
3. **Split Containment** (Level 3) — Coordinate block placement around mutual dimension obstacles.
4. **Reactor Bypass** (Level 4) — Plan constrained routes while preserving access to block positions.
5. **Dual-Core Lock** (Level 5) — Complex reactor puzzle requiring precise block positioning and timed shifts.

### MAP 03 — VOID NEXUS (Fractured Cosmic Edge)
- **Theme**: Deep space midnight, electric purple (`#A855F7`), cold cyan, and fractured realities.
- **Difficulty**: Advanced → Expert.
1. **Rift Entry** (Level 1) — Apply familiar mechanics in a heavily constrained void.
2. **Shattered Bridge** (Level 2) — Navigate fragmented routes and locate narrow phase-shift pockets.
3. **Null Corridor** (Level 3) — Tight layout where a single premature push permanently obstructs passage.
4. **Paradox Chamber** (Level 4) — Coordinate both blocks through a sequence of alternate pushes.
5. **Singularity Gate** (Level 5) — The ultimate spatial reasoning master puzzle.

---

## 3. Mandatory Dual-Run BFS Solvability Verification

Every level has been algorithmically verified via automated Breadth-First Search (`verify_all_15_levels.js`) under two independent searches:
1. **Normal BFS**: Finds the exact shortest winning action sequence (**Optimal Par**).
2. **Disabled Phase Shift BFS**: Confirms that the puzzle is **strictly unsolvable** without dimension shifting.

### Official 15-Level Verification Report:

| ID | Sector Name | World | Difficulty | Optimal Par | Target Time | Explored States | Solvable No-Shift? | Replay Status |
|---|---|---|---|---|---|---|---|---|
| `neon-1` | **First Signal** | Neon | Cadet | **21** | 25s | 6,115 | **FALSE (Unsolvable)** | **100% PASS** |
| `neon-2` | **Cross-Street Lock** | Neon | Cadet | **19** | 30s | 6,470 | **FALSE (Unsolvable)** | **100% PASS** |
| `neon-3` | **Substation Relay** | Neon | Operator | **24** | 35s | 5,525 | **FALSE (Unsolvable)** | **100% PASS** |
| `neon-4` | **Neon Overpass** | Neon | Operator | **16** | 30s | 2,886 | **FALSE (Unsolvable)** | **100% PASS** |
| `neon-5` | **District Reboot** | Neon | Specialist | **32** | 50s | 3,986 | **FALSE (Unsolvable)** | **100% PASS** |
| `quantum-1`| **Calibration Chamber**| Quantum | Operator | **22** | 35s | 16,090| **FALSE (Unsolvable)** | **100% PASS** |
| `quantum-2`| **Mirror Protocol** | Quantum | Operator | **21** | 35s | 6,841 | **FALSE (Unsolvable)** | **100% PASS** |
| `quantum-3`| **Split Containment** | Quantum | Specialist | **33** | 50s | 22,210| **FALSE (Unsolvable)** | **100% PASS** |
| `quantum-4`| **Reactor Bypass** | Quantum | Specialist | **25** | 40s | 3,745 | **FALSE (Unsolvable)** | **100% PASS** |
| `quantum-5`| **Dual-Core Lock** | Quantum | Architect | **23** | 45s | 8,038 | **FALSE (Unsolvable)** | **100% PASS** |
| `void-1` | **Rift Entry** | Void | Specialist | **34** | 50s | 12,423| **FALSE (Unsolvable)** | **100% PASS** |
| `void-2` | **Shattered Bridge** | Void | Architect | **19** | 35s | 8,310 | **FALSE (Unsolvable)** | **100% PASS** |
| `void-3` | **Null Corridor** | Void | Architect | **26** | 45s | 3,892 | **FALSE (Unsolvable)** | **100% PASS** |
| `void-4` | **Paradox Chamber** | Void | Architect | **33** | 50s | 3,876 | **FALSE (Unsolvable)** | **100% PASS** |
| `void-5` | **Singularity Gate** | Void | Grandmaster | **33** | 65s | 2,316 | **FALSE (Unsolvable)** | **100% PASS** |

To re-run the solver suite at any time:
```bash
node verify_all_15_levels.js
```

---

## 4. Competitive Scoring System & Anti-Exploit Design

Calculated authoritatively in `js/score-calculator.js`:

1. **Move Efficiency (Max 700 pts)**:
   $$\text{movePoints} = \text{round}\left(700 \times \min\left(1, \frac{\text{parMoves}}{\max(\text{scoringActions}, 1)}\right)\right)$$
2. **Time Score (Max 250 pts)**:
   $$\text{timePoints} = \text{round}\left(250 \times \min\left(1, \frac{\text{targetTimeSeconds}}{\max(\text{elapsedSeconds}, 1)}\right)\right)$$
3. **Clear Streak Bonus (Max 250 pts)**:
   $$\text{streakBonus} = 50 \times \min(\text{currentStreak}, 5)$$
4. **Total Score**: $\text{movePoints} + \text{timePoints} + \text{streakBonus}$ (Nominal max 1,200 points).

### Anti-Exploit Attempt Accounting:
- **Board Moves vs. Scoring Actions**:
  - `moves`: Visual grid moves displayed to the user; decremented by Undo (`U`).
  - `scoringActions`: Cumulative successful moves spent during the active attempt; **never refunded by Undo**. This prevents exploiting Undo to fabricate artificial par scores.
- **Level Resets (`R`)**:
  - Resets attempt metrics (`scoringActions = 0`, `elapsedSeconds = 0`).
  - **Breaks active uninterrupted streak**; never grants a free streak.
- **Wall Collisions & Invalid Shifts**:
  - Rejected attempts do **not** increment move or scoring counters.

---

## 5. Local Device Leaderboards & Persistence

- **15 Independent Tracked Leaderboards**:
  - Each level across all three maps maintains its own dedicated Top 5 record table and Personal Best record.
- **Strict Tie-Breaking Hierarchy**:
  1. Final Score (descending)
  2. Scoring Actions (ascending)
  3. Elapsed Time (ascending)
  4. Timestamp (ascending)
- **Local & Offline Transparency**:
  - All records are saved in browser `localStorage` under versioned schema `PHASELOCK_STORAGE_V2`.
  - Honestly labeled as a **LOCAL DEVICE LEADERBOARD** without fabricated online players.
- **JSON Backup Utility**:
  - **EXPORT**: Downloads a verified JSON backup of local records.
  - **IMPORT**: Validates schema and restores local records with confirmation.
  - **WIPE**: Deletes records after user confirmation.

---

## 6. Controls & Accessibility

| Action | Keyboard | Mobile Touch | On-Screen Deck |
|---|---|---|---|
| Move Up / Down / Left / Right | `W`/`A`/`S`/`D` or `Arrow Keys` | Virtual D-Pad | — |
| Phase Shift | `Spacebar` | Phase Shift Button | `PHASE SHIFT` |
| Undo Vector | `U` | Undo Button | `UNDO VECTOR` |
| Reset Sector | `R` | Reset Button | `RESET SECTOR` |
| Callsign Profile | — | Header Callsign Badge | `OPERATOR [👤]` |
| Audio Mute Toggle | — | Header Audio Button | `🔊 / 🔇` |
| Tactical Manual | — | Header Help Button | `?` |

- **Screen Reader Support**: Live updates dispatched to an accessible ARIA live region (`#aria-live-announcements`).
- **Reduced Motion**: Full support for `prefers-reduced-motion` (disables screen shake, glitch effects, and particle bursts).

---

## 7. Procedural Web Audio API

All audio is procedurally synthesized via the native Web Audio API (`js/audio-synthesizer.js`):
- **Movement Click**: Bandpass-filtered frequency drop (260Hz → 75Hz).
- **Phase Shift Swoop**: Dual oscillator system pairing sub-bass sawtooth dive (175Hz → 42Hz) with high-Q resonant bandpass filter sweep (400Hz → 1800Hz).
- **Invalid Action Buzz**: Dissonant square wave pair (84Hz + 118Hz) through a 450Hz lowpass filter.
- **Plate Activated Chime**: Resonant pentatonic arpeggio (E5, G#5, B5, E6) with crystal envelope decays.
- **Victory Fanfare**: Multi-stage retro synth arpeggio (C4, G4, C5, E5, G5, C6).
