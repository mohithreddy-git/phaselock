/**
 * Level Tuner for Quantum Lab and Void Nexus
 */

const RulesEngine = require('./phase-lock/js/rules-engine.js');

function getBorders() {
  const borders = [];
  for (let i = 0; i < 8; i++) {
    borders.push({ x: i, y: 0 });
    borders.push({ x: i, y: 7 });
    borders.push({ x: 0, y: i });
    borders.push({ x: 7, y: i });
  }
  const unique = [];
  const seen = new Set();
  for (const b of borders) {
    const key = `${b.x},${b.y}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(b);
    }
  }
  return unique;
}

const BORDERS = getBorders();

function testLevel(lvl) {
  function normalizeState(px, py, r, bx1, by1, bx2, by2) {
    if (bx1 > bx2 || (bx1 === bx2 && by1 > by2)) {
      return `${px},${py},${r},${bx2},${by2},${bx1},${by1}`;
    }
    return `${px},${py},${r},${bx1},${by1},${bx2},${by2}`;
  }

  function solve(allowPhaseShift) {
    const p = lvl.player;
    const r = lvl.realm || 'alpha';
    const b1 = lvl.blocks[0];
    const b2 = lvl.blocks[1];

    const startKey = normalizeState(p.x, p.y, r, b1.x, b1.y, b2.x, b2.y);
    const queue = [{
      player: { x: p.x, y: p.y },
      realm: r,
      blocks: [{ id: b1.id, x: b1.x, y: b1.y }, { id: b2.id, x: b2.x, y: b2.y }],
      depth: 0,
      path: []
    }];
    const visited = new Set([startKey]);
    const moves = [
      { name: 'UP', dx: 0, dy: -1 },
      { name: 'DOWN', dx: 0, dy: 1 },
      { name: 'LEFT', dx: -1, dy: 0 },
      { name: 'RIGHT', dx: 1, dy: 0 }
    ];

    while (queue.length > 0) {
      const cur = queue.shift();
      if (RulesEngine.isVictory(cur.player, cur.blocks, lvl.plates, lvl.exit)) {
        return { solvable: true, moves: cur.depth, path: cur.path };
      }

      for (const m of moves) {
        const res = RulesEngine.applyMove(cur.player, cur.blocks, cur.realm, lvl, m.dx, m.dy);
        if (res.success) {
          const k = normalizeState(res.player.x, res.player.y, cur.realm, res.blocks[0].x, res.blocks[0].y, res.blocks[1].x, res.blocks[1].y);
          if (!visited.has(k)) {
            visited.add(k);
            queue.push({ player: res.player, realm: cur.realm, blocks: res.blocks, depth: cur.depth + 1, path: cur.path.concat([m.name]) });
          }
        }
      }

      if (allowPhaseShift) {
        const sRes = RulesEngine.applyPhaseShift(cur.player, cur.realm, lvl);
        if (sRes.success) {
          const k = normalizeState(cur.player.x, cur.player.y, sRes.newRealm, cur.blocks[0].x, cur.blocks[0].y, cur.blocks[1].x, cur.blocks[1].y);
          if (!visited.has(k)) {
            visited.add(k);
            queue.push({ player: { ...cur.player }, realm: sRes.newRealm, blocks: cur.blocks.map(b => ({ ...b })), depth: cur.depth + 1, path: cur.path.concat(['PHASE_SHIFT']) });
          }
        }
      }
    }
    return { solvable: false, moves: 0, path: [] };
  }

  const normal = solve(true);
  const noShift = solve(false);
  return {
    valid: normal.solvable && !noShift.solvable,
    normalMoves: normal.moves,
    normalPath: normal.path,
    noShiftSolvable: noShift.solvable
  };
}

// Let's test candidate designs for Quantum Lab and Void Nexus
const candidates = [
  // Quantum 1: Calibration Chamber
  {
    key: "quantum-1",
    player: { x: 1, y: 1 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 4, y: 2 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 4 }],
    exit: { x: 5, y: 1 },
    alphaWalls: BORDERS.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 4 }
    ]),
    omegaWalls: BORDERS.concat([
      { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }, { x: 6, y: 2 }
    ])
  },
  // Quantum 2: Mirror Protocol
  {
    key: "quantum-2",
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 5, y: 3 }],
    plates: [{ id: "p1", x: 2, y: 5 }, { id: "p2", x: 5, y: 5 }],
    exit: { x: 3, y: 6 },
    alphaWalls: BORDERS.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }
    ]),
    omegaWalls: BORDERS.concat([
      { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 5, y: 2 }, { x: 1, y: 5 }
    ])
  },
  // Quantum 3: Split Containment
  {
    key: "quantum-3",
    player: { x: 2, y: 1 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 4, y: 2 }],
    plates: [{ id: "p1", x: 2, y: 6 }, { id: "p2", x: 5, y: 4 }],
    exit: { x: 1, y: 5 },
    alphaWalls: BORDERS.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 3, y: 5 }
    ]),
    omegaWalls: BORDERS.concat([
      { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 1, y: 3 }, { x: 6, y: 3 }
    ])
  },
  // Quantum 4: Reactor Bypass
  {
    key: "quantum-4",
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 2 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 5 }],
    exit: { x: 4, y: 6 },
    alphaWalls: BORDERS.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }
    ]),
    omegaWalls: BORDERS.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 5, y: 3 }
    ])
  },
  // Quantum 5: Dual-Core Lock
  {
    key: "quantum-5",
    player: { x: 1, y: 1 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 4, y: 2 }],
    plates: [{ id: "p1", x: 2, y: 5 }, { id: "p2", x: 5, y: 4 }],
    exit: { x: 6, y: 1 },
    alphaWalls: BORDERS.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 3 }
    ]),
    omegaWalls: BORDERS.concat([
      { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 2, y: 4 }, { x: 6, y: 3 }
    ])
  },
  // Void 1: Rift Entry
  {
    key: "void-1",
    player: { x: 1, y: 1 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 5, y: 2 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 4 }],
    exit: { x: 5, y: 1 },
    alphaWalls: BORDERS.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 1, y: 3 }
    ]),
    omegaWalls: BORDERS.concat([
      { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 5, y: 3 }, { x: 2, y: 4 }
    ])
  },
  // Void 2: Shattered Bridge
  {
    key: "void-2",
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 4, y: 2 }],
    plates: [{ id: "p1", x: 2, y: 6 }, { id: "p2", x: 5, y: 5 }],
    exit: { x: 1, y: 6 },
    alphaWalls: BORDERS.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 5, y: 4 }
    ]),
    omegaWalls: BORDERS.concat([
      { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 2, y: 4 }, { x: 6, y: 3 }
    ])
  },
  // Void 3: Null Corridor
  {
    key: "void-3",
    player: { x: 2, y: 1 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 2 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 4 }],
    exit: { x: 3, y: 6 },
    alphaWalls: BORDERS.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 4 }, { x: 5, y: 3 }
    ]),
    omegaWalls: BORDERS.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 4 }
    ])
  },
  // Void 4: Paradox Chamber
  {
    key: "void-4",
    player: { x: 1, y: 1 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 2 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 5 }],
    exit: { x: 4, y: 6 },
    alphaWalls: BORDERS.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }
    ]),
    omegaWalls: BORDERS.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }, { x: 1, y: 3 }
    ])
  }
];

candidates.forEach(c => {
  const res = testLevel(c);
  console.log(`Candidate [${c.key}]: Valid=${res.valid} | NormalMoves=${res.normalMoves} | NoShiftSolvable=${res.noShiftSolvable}`);
});
