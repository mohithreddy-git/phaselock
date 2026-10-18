/**
 * Comprehensive Integration Test for Phase Lock 15-Level Upgrade
 * Tests RulesEngine, GameState, ScoreCalculator, and StorageManager.
 */

const RulesEngine = require('./phase-lock/js/rules-engine.js');
const LevelManager = require('./phase-lock/js/level-manager.js');
const ScoreCalculator = require('./phase-lock/js/score-calculator.js');
const StorageManager = require('./phase-lock/js/storage-manager.js');
const GameState = require('./phase-lock/js/game-state.js');
const fs = require('fs');

console.log("================================================================================");
console.log("RUNNING COMPREHENSIVE INTEGRATION SUITE (15 LEVELS, SCORING, LEADERBOARDS)");
console.log("================================================================================");

let total = 0;
let passed = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Level Definitions & Maps
const levelManager = new LevelManager();
const maps = levelManager.getMaps();
assert(maps.length === 3, "3 distinct maps exist (Neon, Quantum, Void)");
assert(maps[0].id === 'neon' && maps[1].id === 'quantum' && maps[2].id === 'void', "Map IDs are neon, quantum, void");

const allLevels = levelManager.getAllLevels();
assert(allLevels.length === 15, "15 distinct levels exist");
const neonLevels = levelManager.getLevelsByMap('neon');
const quantumLevels = levelManager.getLevelsByMap('quantum');
const voidLevels = levelManager.getLevelsByMap('void');
assert(neonLevels.length === 5, "Neon City has exactly 5 levels");
assert(quantumLevels.length === 5, "Crystal Caves has exactly 5 levels");
assert(voidLevels.length === 5, "Sky Islands has exactly 5 levels");

// 2. ScoreCalculator Verification
console.log("\nTesting ScoreCalculator Formulas:");
// Case A: Perfect par, perfect time, 5+ streak
const maxScore = ScoreCalculator.calculate(20, 20, 30, 25, 5);
assert(maxScore.movePoints === 700, "Max move points is 700 at par");
assert(maxScore.timePoints === 250, "Max time points is 250 when under target time");
assert(maxScore.streakBonus === 250, "Max streak bonus is 250 at 5+ streak");
assert(maxScore.totalScore === 1200, "Nominal max score is 1,200");
assert(maxScore.stars === 3, "3 stars awarded at optimal par");

// Case B: Twice as many actions (half efficiency)
const halfMoveScore = ScoreCalculator.calculate(20, 40, 30, 60, 2);
assert(halfMoveScore.movePoints === 350, "Half efficiency gives 350 points (700 * 20/40)");
assert(halfMoveScore.timePoints === 125, "Double time gives 125 points (250 * 30/60)");
assert(halfMoveScore.streakBonus === 100, "Streak of 2 gives 100 points (50 * 2)");
assert(halfMoveScore.totalScore === 575, "Total score is 350 + 125 + 100 = 575");

// 3. StorageManager Verification
console.log("\nTesting StorageManager & Leaderboards:");
const storage = new StorageManager();
storage.setCallsign('NEON_RUNNER');
assert(storage.getCallsign() === 'NEON_RUNNER', "Callsign updated and retrieved");

// Callsign sanitization
storage.setCallsign('bad!@#$%^&*()name_123');
assert(storage.getCallsign() === 'BADNAME_123', "Callsign sanitized to uppercase alphanumeric");

// Initial unlocks
assert(storage.isLevelUnlocked('neon', 1) === true, "Level 1 is unlocked initially");
assert(storage.isLevelUnlocked('neon', 2) === false, "Level 2 is locked initially");
assert(storage.isLevelUnlocked('quantum', 1) === true, "Quantum Level 1 is unlocked initially");
assert(storage.isLevelUnlocked('void', 1) === true, "Void Level 1 is unlocked initially");

// Progression on completion
const res = storage.recordCompletion('neon', 'neon-1', 1, {
  score: 1150,
  actions: 21,
  parMoves: 21,
  time: 20,
  streak: 0
});
assert(res.isNewPersonalBest === true, "First completion is new personal best");
assert(res.isNewLeaderboardRecord === true, "First completion entered leaderboard");
assert(storage.isLevelUnlocked('neon', 2) === true, "Level 2 unlocked after clearing Level 1");

// Leaderboard tie-breaking
storage.recordCompletion('neon', 'neon-1', 1, { score: 1000, actions: 24, parMoves: 21, time: 25, streak: 1 });
storage.recordCompletion('neon', 'neon-1', 1, { score: 1200, actions: 21, parMoves: 21, time: 18, streak: 2 });
storage.recordCompletion('neon', 'neon-1', 1, { score: 1200, actions: 21, parMoves: 21, time: 15, streak: 2 }); // faster
storage.recordCompletion('neon', 'neon-1', 1, { score: 900, actions: 30, parMoves: 21, time: 35, streak: 0 });
storage.recordCompletion('neon', 'neon-1', 1, { score: 850, actions: 32, parMoves: 21, time: 40, streak: 0 });
storage.recordCompletion('neon', 'neon-1', 1, { score: 800, actions: 35, parMoves: 21, time: 45, streak: 0 });

const top5 = storage.getLeaderboard('neon-1');
assert(top5.length === 5, "Leaderboard caps at top 5 entries");
assert(top5[0].score === 1200 && top5[0].time === 15, "Top record is highest score with fastest time (1200 pts, 15s)");
assert(top5[1].score === 1200 && top5[1].time === 18, "Second record is 1200 pts at 18s");

// 4. GameState Attempt Accounting & Anti-Exploit
console.log("\nTesting GameState Attempt Accounting:");
const gameState = new GameState(levelManager, storage);
gameState.loadLevel('neon', 1);

assert(gameState.moves === 0, "Initial board moves is 0");
assert(gameState.scoringActions === 0, "Initial scoring actions is 0");
assert(gameState.undoCount === 0, "Initial undo count is 0");

// Move and Push
gameState.move(0, -1); // move up
assert(gameState.moves === 1, "Valid move increments board moves");
assert(gameState.scoringActions === 1, "Valid move increments scoring actions");

// Undo operation
gameState.undo();
assert(gameState.moves === 0, "Undo restores visual board moves to 0");
assert(gameState.scoringActions === 1, "Undo preserves scoring actions at 1 (ANTI-EXPLOIT)");
assert(gameState.undoCount === 1, "Undo count incremented to 1");

// Rejected move
const beforeActions = gameState.scoringActions;
const rejectRes = gameState.move(0, -1); // to (1, 1) - valid
gameState.move(0, -1); // into wall - rejected
assert(gameState.scoringActions === beforeActions + 1, "Rejected wall move does NOT increment scoring actions");

// 5. Solution Replay for All 15 Levels through GameState
console.log("\nTesting End-to-End GameState Replay for All 15 Levels:");
const verifiedData = JSON.parse(fs.readFileSync('./phase-lock/js/verified_levels_data.json', 'utf8'));

verifiedData.forEach((lvl) => {
  gameState.loadLevel(lvl.mapId, lvl.levelNumber);
  assert(!gameState.won, `[${lvl.id}] Initialized in unwon state`);

  for (const step of lvl.solution) {
    if (step === 'UP') gameState.move(0, -1);
    else if (step === 'DOWN') gameState.move(0, 1);
    else if (step === 'LEFT') gameState.move(-1, 0);
    else if (step === 'RIGHT') gameState.move(1, 0);
    else if (step === 'PHASE_SHIFT') gameState.phaseShift();
  }

  assert(gameState.won === true, `[${lvl.id}] Completed and marked WON`);
  assert(gameState.scoringActions === lvl.parMoves, `[${lvl.id}] Scoring actions matches exact par (${gameState.scoringActions} === ${lvl.parMoves})`);
  assert(gameState.platesActive === true, `[${lvl.id}] Dual pressure plates active`);
});

console.log("\n================================================================================");
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log("================================================================================");

if (total === passed) {
  console.log(">>> ALL INTEGRATION AND GAME ENGINE TESTS PASSED WITH 100% SUCCESS! <<<");
} else {
  process.exit(1);
}
