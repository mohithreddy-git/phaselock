/**
 * Comprehensive Node.js Test Suite for Phase Lock Game Engine
 * Replays verified solutions directly against GameState class.
 */

const LevelManager = require('./phase-lock/js/level-manager.js');
const GameState = require('./phase-lock/js/game-state.js');
const fs = require('fs');

const verifiedSolutions = JSON.parse(fs.readFileSync('./verified_solutions.json', 'utf8'));

console.log("==================================================");
console.log("RUNNING GAME ENGINE INTEGRATION TESTS");
console.log("==================================================");

const levelManager = new LevelManager();
const gameState = new GameState(levelManager);

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// Test 1: Replay verified solutions on all 3 levels
verifiedSolutions.forEach((solData) => {
  console.log(`\nTesting Level ${solData.id}: ${solData.name}`);
  gameState.loadLevel(solData.id - 1);

  assert(gameState.level === solData.id, `Level initialized to ${solData.id}`);
  assert(gameState.moves === 0, `Initial moves is 0`);
  assert(gameState.won === false, `Initial won is false`);
  assert(gameState.realm === 'alpha', `Initial realm is alpha`);

  let rejected = false;
  gameState.on('moveReject', (r) => {
    console.error("Unexpected rejection during replay:", r);
    rejected = true;
  });

  // Execute all steps in solution
  for (const step of solData.solution) {
    if (step === 'UP') gameState.move(0, -1);
    else if (step === 'DOWN') gameState.move(0, 1);
    else if (step === 'LEFT') gameState.move(-1, 0);
    else if (step === 'RIGHT') gameState.move(1, 0);
    else if (step === 'PHASE_SHIFT') gameState.phaseShift();
  }

  assert(!rejected, `Solution executed with zero rejections`);
  assert(gameState.won === true, `Level marked as WON upon completing solution`);
  assert(gameState.moves === solData.optimalMoves, `Move count matches optimal (${gameState.moves} == ${solData.optimalMoves})`);
  assert(gameState.platesActive === true, `Pressure plates are both active`);
});

// Test 2: Rejection rules
console.log("\nTesting Rejection Logic:");
gameState.loadLevel(0); // Level 1
// In Level 1, player starts at (1, 2). Alpha wall is at (4, 1)-(4, 6) and (0,0)-(7,0)
let rejectCount = 0;
gameState.on('moveReject', () => { rejectCount++; });

// Try moving into outer wall: (1, 2) -> UP -> (1, 1) -> UP -> (1, 0) (outer wall)
gameState.move(0, -1); // to (1, 1) - valid
assert(gameState.moves === 1, "Valid move increments moves");
const prevMoves = gameState.moves;
const pushedWall = gameState.move(0, -1); // into (1, 0) - outer wall
assert(pushedWall === false, "Moving into outer wall returns false");
assert(gameState.moves === prevMoves, "Rejected move does NOT increment move counter");
assert(rejectCount === 1, "Reject event fired");

// Test 3: Phase shift rejection when alternate realm has a wall at player coordinate
console.log("\nTesting Phase Shift Rejection:");
gameState.loadLevel(0);
// In Level 1, Omega has a wall at (1, 4), while Alpha is open at (1, 4)!
// Let's move player to (1, 4) in Alpha: (1,2) -> DOWN -> (1,3) -> DOWN -> (1,4)
gameState.move(0, 1); // (1, 3)
gameState.move(0, 1); // (1, 4)
assert(gameState.player.x === 1 && gameState.player.y === 4, "Player moved to (1, 4) in Alpha");
const shiftResult = gameState.phaseShift();
assert(shiftResult === false, "Phase shift at (1,4) rejected because Omega contains a wall at (1,4)");
assert(gameState.realm === 'alpha', "Realm remains Alpha after rejection");

// Test 4: Undo functionality
console.log("\nTesting Undo Stack:");
const movesBefore = gameState.moves;
const xBefore = gameState.player.x;
const yBefore = gameState.player.y;
gameState.move(1, 0); // move to (2, 4)
assert(gameState.player.x === 2, "Player moved to (2, 4)");
assert(gameState.moves === movesBefore + 1, "Move count increased");

const undoSuccess = gameState.undo();
assert(undoSuccess === true, "Undo returned true");
assert(gameState.player.x === xBefore && gameState.player.y === yBefore, "Player position restored to (1, 4)");
assert(gameState.moves === movesBefore, "Move count restored to previous value");

// Test 5: Reset Level preserves current level
console.log("\nTesting Level Reset:");
gameState.loadLevel(1); // Load Level 2
gameState.move(0, -1);
assert(gameState.moves > 0, "Made a move on Level 2");
gameState.resetCurrentLevel();
assert(gameState.level === 2, "Reset maintained Level 2 (did not reset to Level 1)");
assert(gameState.moves === 0, "Reset cleared move counter to 0");
assert(gameState.history.length === 0, "Reset cleared history stack");

console.log("\n==================================================");
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log("==================================================");

if (totalTests === passedTests) {
  console.log(">>> ALL GAME ENGINE INTEGRATION TESTS PASSED! <<<");
} else {
  process.exit(1);
}
