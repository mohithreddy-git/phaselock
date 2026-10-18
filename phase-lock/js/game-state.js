/**
 * GameState - Authoritative state machine for PHASE LOCK
 * Powered by RulesEngine. Enforces attempt accounting, streak tracking, and undo integrity.
 */

const _RulesEngine = typeof RulesEngine !== 'undefined' ? RulesEngine : (typeof require !== 'undefined' ? require('./rules-engine.js') : null);
const _ScoreCalculator = typeof ScoreCalculator !== 'undefined' ? ScoreCalculator : (typeof require !== 'undefined' ? require('./score-calculator.js') : null);

class GameState {
  constructor(levelManager, storageManager) {
    this.levelManager = levelManager;
    this.storageManager = storageManager;

    // Current selection
    this.currentMapId = 'neon';
    this.currentLevelNumber = 1;
    this.levelData = null;

    // Authoritative game state
    this.player = { x: 1, y: 1 };
    this.blocks = [];
    this.plates = [];
    this.exit = { x: 0, y: 0 };
    this.realm = 'alpha';

    // Move & Attempt metrics
    this.moves = 0;              // Visual board moves (restored by undo)
    this.scoringActions = 0;     // Total successful actions in current attempt (NOT refunded by undo)
    this.undoCount = 0;          // Number of undos in this attempt
    this.restartCount = 0;       // Number of restarts in this attempt
    this.history = [];           // Snapshots for undo
    this.won = false;

    // Plates & Gateway status
    this.plateAActive = false;
    this.plateBActive = false;
    this.platesActive = false;

    // Timer tracking
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.isPaused = false;

    // Event system
    this.listeners = {
      stateChange: [],
      moveReject: [],
      plateTriggered: [],
      phaseShift: [],
      victory: []
    };
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch (e) { console.error(e); }
      });
    }
  }

  startTimer() {
    this.stopTimer();
    this.isPaused = false;
    this.startTime = Date.now() - (this.elapsedSeconds * 1000);
    this.timerInterval = setInterval(() => {
      if (!this.won && !this.isPaused) {
        this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        this.emit('stateChange', { type: 'timer', seconds: this.elapsedSeconds });
      }
    }, 500);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  pauseTimer() {
    this.isPaused = true;
  }

  resumeTimer() {
    if (this.isPaused && !this.won) {
      this.isPaused = false;
      this.startTime = Date.now() - (this.elapsedSeconds * 1000);
    }
  }

  loadLevel(mapId, levelNumber) {
    const raw = this.levelManager.getLevel(mapId, levelNumber);
    if (!raw) return false;

    this.currentMapId = mapId;
    this.currentLevelNumber = levelNumber;
    this.levelData = raw;

    this.player = { x: raw.player.x, y: raw.player.y };
    this.blocks = raw.blocks.map(b => ({ id: b.id, x: b.x, y: b.y }));
    this.plates = raw.plates.map(p => ({ id: p.id, x: p.x, y: p.y }));
    this.exit = { x: raw.exit.x, y: raw.exit.y };
    this.realm = raw.realm || 'alpha';

    // Reset attempt statistics
    this.moves = 0;
    this.scoringActions = 0;
    this.undoCount = 0;
    this.history = [];
    this.won = false;
    this.elapsedSeconds = 0;

    this._updatePlateStatus(false);
    this.startTimer();
    this.emit('stateChange', { type: 'levelLoaded', mapId, levelNumber });
    return true;
  }

  resetCurrentLevel() {
    if (!this.levelData) return;
    this.restartCount++;

    // Breaking streak on manual reset
    if (this.storageManager) {
      this.storageManager.breakStreak(this.currentMapId);
    }

    this.loadLevel(this.currentMapId, this.currentLevelNumber);
    this.emit('stateChange', { type: 'reset' });
  }

  _saveSnapshot() {
    this.history.push({
      player: { x: this.player.x, y: this.player.y },
      blocks: this.blocks.map(b => ({ id: b.id, x: b.x, y: b.y })),
      realm: this.realm,
      moves: this.moves
      // Note: scoringActions is NOT saved into snapshot so undo cannot refund actions spent!
    });
  }

  undo() {
    if (this.won || this.history.length === 0) {
      return false;
    }

    const previous = this.history.pop();
    this.player = { x: previous.player.x, y: previous.player.y };
    this.blocks = previous.blocks.map(b => ({ id: b.id, x: b.x, y: b.y }));
    this.realm = previous.realm;
    this.moves = previous.moves;
    this.undoCount++;

    this._updatePlateStatus(false);
    this.emit('stateChange', { type: 'undo' });
    return true;
  }

  phaseShift() {
    if (this.won) return false;

    const res = _RulesEngine.applyPhaseShift(this.player, this.realm, this.levelData);
    if (!res.success) {
      this.emit('moveReject', {
        x: this.player.x,
        y: this.player.y,
        action: 'phaseShift',
        reason: res.reason
      });
      return false;
    }

    // Valid Shift
    this._saveSnapshot();
    const prevRealm = this.realm;
    this.realm = res.newRealm;
    this.moves++;
    this.scoringActions++;

    this.emit('phaseShift', { from: prevRealm, to: this.realm, player: { ...this.player } });
    this.emit('stateChange', { type: 'move' });
    return true;
  }

  move(dx, dy) {
    if (this.won) return false;

    const res = _RulesEngine.applyMove(this.player, this.blocks, this.realm, this.levelData, dx, dy);
    if (!res.success) {
      this.emit('moveReject', {
        x: this.player.x + dx,
        y: this.player.y + dy,
        action: res.pushed ? 'push' : 'move',
        reason: res.reason
      });
      return false;
    }

    // Valid Move / Push
    this._saveSnapshot();
    this.player = res.player;
    this.blocks = res.blocks;
    this.moves++;
    this.scoringActions++;

    const platesChanged = this._updatePlateStatus(true);
    this.emit('stateChange', { type: 'move', pushed: res.pushed, blockId: res.pushedBlockId, platesChanged });

    this._checkVictory();
    return true;
  }

  _updatePlateStatus(triggerEvent = false) {
    const wasActive = this.platesActive;
    const { plateA, plateB, allActive } = _RulesEngine.checkPlates(this.blocks, this.plates);

    this.plateAActive = plateA;
    this.plateBActive = plateB;
    this.platesActive = allActive;

    if (triggerEvent && !wasActive && this.platesActive) {
      this.emit('plateTriggered', { p1: this.plates[0], p2: this.plates[1] });
      return true;
    }
    return false;
  }

  _checkVictory() {
    if (this.won) return;

    if (_RulesEngine.isVictory(this.player, this.blocks, this.plates, this.exit)) {
      this.won = true;
      this.stopTimer();

      // Retrieve current streak from storage
      const currentStreak = this.storageManager ? this.storageManager.getActiveStreak(this.currentMapId) : 0;

      // Calculate Authoritative Score
      const scoreResult = _ScoreCalculator.calculate(
        this.levelData.parMoves,
        this.scoringActions,
        this.levelData.targetTimeSeconds,
        this.elapsedSeconds,
        currentStreak
      );

      // Record in storage manager
      let recordResult = { isNewPersonalBest: false, isNewLeaderboardRecord: false };
      if (this.storageManager) {
        recordResult = this.storageManager.recordCompletion(
          this.currentMapId,
          this.levelData.id,
          this.currentLevelNumber,
          {
            score: scoreResult.totalScore,
            actions: this.scoringActions,
            parMoves: this.levelData.parMoves,
            time: this.elapsedSeconds,
            streak: currentStreak
          }
        );
        // Advance streak after successful clear
        this.storageManager.incrementStreak(this.currentMapId);
      }

      this.emit('victory', {
        mapId: this.currentMapId,
        levelNumber: this.currentLevelNumber,
        levelId: this.levelData.id,
        levelName: this.levelData.name,
        parMoves: this.levelData.parMoves,
        moves: this.moves,
        scoringActions: this.scoringActions,
        time: this.elapsedSeconds,
        targetTime: this.levelData.targetTimeSeconds,
        undoCount: this.undoCount,
        scoreResult,
        recordResult,
        streak: currentStreak + 1
      });
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameState;
}
