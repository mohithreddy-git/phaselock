/**
 * Automated Grid Perturbation Searcher to find valid configurations
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

// Helper to test if configuration is valid
function check(lvl) {
  // same logic as tune_levels
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

// 1. Search for quantum-1
console.log("Searching for quantum-1...");
function searchQ1() {
  const p = { x: 1, y: 1 };
  const blocks = [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 5, y: 2 }];
  const plates = [{ id: "p1", x: 2, y: 5 }, { id: "p2", x: 5, y: 5 }];
  const exitCandidates = [{ x: 6, y: 1 }, { x: 1, y: 6 }, { x: 4, y: 6 }];

  for (const ex of exitCandidates) {
    // Alpha divider with wall at col 3 or col 4
    for (let gapY = 2; gapY <= 5; gapY++) {
      const alphaWalls = BORDERS.concat([
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }
      ]);
      // Omega has gap at gapY
      const omegaWalls = BORDERS.concat([
        { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 }
      ].filter(w => w.y !== gapY && w.y !== gapY + 1));

      const lvl = {
        player: p,
        realm: 'alpha',
        blocks,
        plates,
        exit: ex,
        alphaWalls,
        omegaWalls
      };

      const res = check(lvl);
      if (res) {
        console.log(`FOUND quantum-1! Moves=${res.moves}, exit=(${ex.x},${ex.y}), gap=${gapY}`);
        return { ...lvl, parMoves: res.moves, solution: res.path };
      }
    }
  }
  return null;
}

// 2. Search for quantum-3
console.log("Searching for quantum-3...");
function searchQ3() {
  const p = { x: 1, y: 2 };
  const blocks = [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 4, y: 2 }];
  const plates = [{ id: "p1", x: 2, y: 6 }, { id: "p2", x: 5, y: 4 }];
  const exits = [{ x: 1, y: 6 }, { x: 6, y: 1 }, { x: 3, y: 6 }];

  for (const ex of exits) {
    for (const aExtra of [
      [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 5, y: 3 }],
      [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 5 }, { x: 5, y: 2 }],
      [{ x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 5, y: 3 }]
    ]) {
      for (const oExtra of [
        [{ x: 4, y: 3 }, { x: 4, y: 4 }, { x: 1, y: 3 }],
        [{ x: 4, y: 3 }, { x: 4, y: 5 }, { x: 6, y: 3 }],
        [{ x: 4, y: 4 }, { x: 4, y: 5 }, { x: 2, y: 4 }]
      ]) {
        const lvl = {
          player: p,
          realm: 'alpha',
          blocks,
          plates,
          exit: ex,
          alphaWalls: BORDERS.concat(aExtra),
          omegaWalls: BORDERS.concat(oExtra)
        };
        const res = check(lvl);
        if (res) {
          console.log(`FOUND quantum-3! Moves=${res.moves}`);
          return { ...lvl, parMoves: res.moves, solution: res.path };
        }
      }
    }
  }
  return null;
}

// 3. Search for quantum-5
console.log("Searching for quantum-5...");
function searchQ5() {
  const p = { x: 1, y: 2 };
  const blocks = [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 3 }];
  const plates = [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 5, y: 5 }];
  const exits = [{ x: 3, y: 6 }, { x: 4, y: 6 }, { x: 6, y: 1 }];

  for (const ex of exits) {
    for (const aExtra of [
      [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }],
      [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 4 }, { x: 5, y: 4 }]
    ]) {
      for (const oExtra of [
        [{ x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 4 }],
        [{ x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }]
      ]) {
        const lvl = {
          player: p,
          realm: 'alpha',
          blocks,
          plates,
          exit: ex,
          alphaWalls: BORDERS.concat(aExtra),
          omegaWalls: BORDERS.concat(oExtra)
        };
        const res = check(lvl);
        if (res) {
          console.log(`FOUND quantum-5! Moves=${res.moves}`);
          return { ...lvl, parMoves: res.moves, solution: res.path };
        }
      }
    }
  }
  return null;
}

// 4. Search for void-1
console.log("Searching for void-1...");
function searchV1() {
  const p = { x: 1, y: 1 };
  const blocks = [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 5, y: 2 }];
  const plates = [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 5, y: 5 }];
  const exits = [{ x: 6, y: 1 }, { x: 3, y: 6 }];

  for (const ex of exits) {
    for (const aExtra of [
      [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }],
      [{ x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }]
    ]) {
      for (const oExtra of [
        [{ x: 2, y: 4 }, { x: 5, y: 3 }, { x: 6, y: 2 }],
        [{ x: 3, y: 4 }, { x: 3, y: 5 }, { x: 5, y: 3 }]
      ]) {
        const lvl = {
          player: p,
          realm: 'alpha',
          blocks,
          plates,
          exit: ex,
          alphaWalls: BORDERS.concat(aExtra),
          omegaWalls: BORDERS.concat(oExtra)
        };
        const res = check(lvl);
        if (res) {
          console.log(`FOUND void-1! Moves=${res.moves}`);
          return { ...lvl, parMoves: res.moves, solution: res.path };
        }
      }
    }
  }
  return null;
}

// 5. Search for void-2
console.log("Searching for void-2...");
function searchV2() {
  const p = { x: 1, y: 2 };
  const blocks = [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 4, y: 2 }];
  const plates = [{ id: "p1", x: 2, y: 5 }, { id: "p2", x: 5, y: 5 }];
  const exits = [{ x: 1, y: 6 }, { x: 6, y: 1 }];

  for (const ex of exits) {
    for (const aExtra of [
      [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 5 }],
      [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 5, y: 3 }]
    ]) {
      for (const oExtra of [
        [{ x: 4, y: 4 }, { x: 4, y: 5 }, { x: 6, y: 2 }],
        [{ x: 4, y: 3 }, { x: 4, y: 4 }, { x: 2, y: 4 }]
      ]) {
        const lvl = {
          player: p,
          realm: 'alpha',
          blocks,
          plates,
          exit: ex,
          alphaWalls: BORDERS.concat(aExtra),
          omegaWalls: BORDERS.concat(oExtra)
        };
        const res = check(lvl);
        if (res) {
          console.log(`FOUND void-2! Moves=${res.moves}`);
          return { ...lvl, parMoves: res.moves, solution: res.path };
        }
      }
    }
  }
  return null;
}

// 6. Search for void-3
console.log("Searching for void-3...");
function searchV3() {
  const p = { x: 2, y: 1 };
  const blocks = [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 2 }];
  const plates = [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 4 }];
  const exits = [{ x: 3, y: 6 }, { x: 4, y: 6 }];

  for (const ex of exits) {
    // Make sure no-shift cannot solve it: block alpha with a wall that must be bypassed in omega!
    for (const aExtra of [
      [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 5, y: 3 }],
      [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 3 }]
    ]) {
      for (const oExtra of [
        [{ x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 4 }],
        [{ x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }]
      ]) {
        const lvl = {
          player: p,
          realm: 'alpha',
          blocks,
          plates,
          exit: ex,
          alphaWalls: BORDERS.concat(aExtra),
          omegaWalls: BORDERS.concat(oExtra)
        };
        const res = check(lvl);
        if (res) {
          console.log(`FOUND void-3! Moves=${res.moves}`);
          return { ...lvl, parMoves: res.moves, solution: res.path };
        }
      }
    }
  }
  return null;
}

// 7. Search for void-4
console.log("Searching for void-4...");
function searchV4() {
  const p = { x: 1, y: 1 };
  const blocks = [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 2 }];
  const plates = [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 5 }];
  const exits = [{ x: 4, y: 6 }, { x: 3, y: 6 }];

  for (const ex of exits) {
    for (const aExtra of [
      [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 4 }],
      [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 5, y: 4 }]
    ]) {
      for (const oExtra of [
        [{ x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 4 }],
        [{ x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }]
      ]) {
        const lvl = {
          player: p,
          realm: 'alpha',
          blocks,
          plates,
          exit: ex,
          alphaWalls: BORDERS.concat(aExtra),
          omegaWalls: BORDERS.concat(oExtra)
        };
        const res = check(lvl);
        if (res) {
          console.log(`FOUND void-4! Moves=${res.moves}`);
          return { ...lvl, parMoves: res.moves, solution: res.path };
        }
      }
    }
  }
  return null;
}

const q1 = searchQ1();
const q3 = searchQ3();
console.log("Q3_DATA:" + JSON.stringify(q3));
const q5 = searchQ5();
const v1 = searchV1();
const v2 = searchV2();
const v3 = searchV3();
const v4 = searchV4();
