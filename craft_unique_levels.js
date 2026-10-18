const RulesEngine = require('./phase-lock/js/rules-engine.js');
const fs = require('fs');

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

const B = getBorders();

function solveBFS(levelData, allowPhaseShift = true) {
  const p = levelData.player;
  const realm = levelData.realm || 'alpha';
  const b1 = levelData.blocks[0];
  const b2 = levelData.blocks[1];

  function normalizeState(px, py, r, bx1, by1, bx2, by2) {
    if (bx1 > bx2 || (bx1 === bx2 && by1 > by2)) {
      return `${px},${py},${r},${bx2},${by2},${bx1},${by1}`;
    }
    return `${px},${py},${r},${bx1},${by1},${bx2},${by2}`;
  }

  const startKey = normalizeState(p.x, p.y, realm, b1.x, b1.y, b2.x, b2.y);
  const queue = [{
    player: { x: p.x, y: p.y },
    realm,
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

  let exploredStates = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    exploredStates++;

    if (RulesEngine.isVictory(current.player, current.blocks, levelData.plates, levelData.exit)) {
      return {
        solvable: true,
        movesCount: current.depth,
        path: current.path,
        exploredStates
      };
    }

    for (const m of moves) {
      const res = RulesEngine.applyMove(current.player, current.blocks, current.realm, levelData, m.dx, m.dy);
      if (res.success) {
        const nextKey = normalizeState(
          res.player.x, res.player.y, current.realm,
          res.blocks[0].x, res.blocks[0].y, res.blocks[1].x, res.blocks[1].y
        );

        if (!visited.has(nextKey)) {
          visited.add(nextKey);
          queue.push({
            player: res.player,
            realm: current.realm,
            blocks: res.blocks,
            depth: current.depth + 1,
            path: current.path.concat([m.name])
          });
        }
      }
    }

    if (allowPhaseShift) {
      const shiftRes = RulesEngine.applyPhaseShift(current.player, current.realm, levelData);
      if (shiftRes.success) {
        const nextKey = normalizeState(
          current.player.x, current.player.y, shiftRes.newRealm,
          current.blocks[0].x, current.blocks[0].y, current.blocks[1].x, current.blocks[1].y
        );

        if (!visited.has(nextKey)) {
          visited.add(nextKey);
          queue.push({
            player: { ...current.player },
            realm: shiftRes.newRealm,
            blocks: current.blocks.map(b => ({ ...b })),
            depth: current.depth + 1,
            path: current.path.concat(['PHASE_SHIFT'])
          });
        }
      }
    }
  }

  return {
    solvable: false,
    movesCount: 0,
    path: [],
    exploredStates
  };
}

function testLevel(lvl) {
  const normal = solveBFS(lvl, true);
  const noShift = solveBFS(lvl, false);
  return {
    id: lvl.id,
    name: lvl.name,
    solvable: normal.solvable,
    noShiftSolvable: noShift.solvable,
    par: normal.movesCount,
    explored: normal.exploredStates,
    path: normal.path,
    valid: normal.solvable && !noShift.solvable
  };
}

module.exports = { B, solveBFS, testLevel };
