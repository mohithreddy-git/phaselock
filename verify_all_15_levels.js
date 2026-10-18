/**
 * Authoritative 15-Level Definitions and Verification Suite for PHASE LOCK.
 * Runs dual-run BFS (normal vs disabled phase shift) and full replay on all 15 levels.
 */

const RulesEngine = require('./phase-lock/js/rules-engine.js');
const LevelManager = require('./phase-lock/js/level-manager.js');
const fs = require('fs');

const levelManager = new LevelManager();
const ALL_15_LEVELS = levelManager.getAllLevels();

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

function replaySolution(levelData, solutionPath) {
  let p = { ...levelData.player };
  let r = levelData.realm || 'alpha';
  let b = levelData.blocks.map(x => ({ ...x }));

  for (let i = 0; i < solutionPath.length; i++) {
    const act = solutionPath[i];
    if (act === 'PHASE_SHIFT') {
      const res = RulesEngine.applyPhaseShift(p, r, levelData);
      if (!res.success) return { success: false, step: i, reason: res.reason };
      r = res.newRealm;
    } else {
      let dx = 0, dy = 0;
      if (act === 'UP') dy = -1;
      else if (act === 'DOWN') dy = 1;
      else if (act === 'LEFT') dx = -1;
      else if (act === 'RIGHT') dx = 1;

      const res = RulesEngine.applyMove(p, b, r, levelData, dx, dy);
      if (!res.success) return { success: false, step: i, reason: res.reason };
      p = res.player;
      b = res.blocks;
    }
  }

  const won = RulesEngine.isVictory(p, b, levelData.plates, levelData.exit);
  return { success: won, finalPlayer: p, finalBlocks: b };
}

console.log("================================================================================");
console.log("PHASE LOCK: OFFICIAL DUAL-RUN BFS VERIFICATION REPORT (15 LEVELS)");
console.log("================================================================================");

const finalVerifiedLevels = [];
let overallPass = true;

for (const lvl of ALL_15_LEVELS) {
  const normalRes = solveBFS(lvl, true);
  const noShiftRes = solveBFS(lvl, false);

  const passesSolvability = normalRes.solvable && !noShiftRes.solvable;
  const replay = replaySolution(lvl, normalRes.path);
  const levelPass = passesSolvability && replay.success;

  if (!levelPass) {
    overallPass = false;
    console.error(`FAILED: ${lvl.id} (${lvl.name}) - Normal:${normalRes.solvable}, NoShift:${noShiftRes.solvable}, Replay:${replay.success}`);
  } else {
    console.log(`[PASS] ${lvl.id.padEnd(10)} | ${lvl.name.padEnd(20)} | Normal: TRUE | NoShift: FALSE | Par: ${String(normalRes.movesCount).padStart(2)} | Explored: ${String(normalRes.exploredStates).padStart(5)} | Replay: 100%`);
    finalVerifiedLevels.push({
      ...lvl,
      parMoves: normalRes.movesCount,
      solution: normalRes.path,
      exploredStates: normalRes.exploredStates
    });
  }
}

console.log("================================================================================");
if (overallPass && finalVerifiedLevels.length === 15) {
  console.log(">>> SUCCESS: ALL 15 LEVELS PASS DUAL-RUN BFS & 100% REPLAY! <<<");
  fs.writeFileSync('./phase-lock/js/verified_levels_data.json', JSON.stringify(finalVerifiedLevels, null, 2));
} else {
  console.error(">>> ERROR: ONE OR MORE LEVELS FAILED VERIFICATION <<<");
  process.exitCode = 1;
}
