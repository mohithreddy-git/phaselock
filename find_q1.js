/**
 * Find quantum-1 configuration
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

function check(lvl) {
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
  if (!normal.solvable) return null;
  const noShift = solve(false);
  if (noShift.solvable) return null;

  return { moves: normal.moves, path: normal.path };
}

// Search for Quantum 1
// We want an introductory level for Quantum Lab:
// Alpha has a wall divider, Omega has a wall on the other side, or blocks must be routed.
const playerPosList = [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }];
const blocksList = [
  [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 4, y: 2 }],
  [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 5, y: 2 }],
  [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 3 }]
];
const platesList = [
  [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 5, y: 5 }],
  [{ id: "p1", x: 2, y: 5 }, { id: "p2", x: 5, y: 5 }],
  [{ id: "p1", x: 2, y: 6 }, { id: "p2", x: 5, y: 4 }]
];
const exits = [{ x: 6, y: 1 }, { x: 5, y: 1 }, { x: 3, y: 6 }, { x: 1, y: 6 }];

let found = false;
for (const p of playerPosList) {
  if (found) break;
  for (const bl of blocksList) {
    if (found) break;
    for (const pl of platesList) {
      if (found) break;
      for (const ex of exits) {
        if (found) break;
        // Alpha wall configurations
        const aWalls = [
          [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }],
          [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }],
          [{ x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }]
        ];
        const oWalls = [
          [{ x: 4, y: 3 }, { x: 4, y: 4 }, { x: 1, y: 4 }],
          [{ x: 3, y: 4 }, { x: 3, y: 5 }, { x: 5, y: 3 }],
          [{ x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }]
        ];

        for (const aw of aWalls) {
          if (found) break;
          for (const ow of oWalls) {
            const lvl = {
              player: p,
              realm: 'alpha',
              blocks: bl,
              plates: pl,
              exit: ex,
              alphaWalls: BORDERS.concat(aw),
              omegaWalls: BORDERS.concat(ow)
            };
            const res = check(lvl);
            if (res) {
              console.log("FOUND QUANTUM 1!");
              console.log(JSON.stringify({ ...lvl, parMoves: res.moves }, null, 2));
              found = true;
              break;
            }
          }
        }
      }
    }
  }
}
