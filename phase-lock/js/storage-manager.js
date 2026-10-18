/**
 * StorageManager - Versioned offline persistence and local leaderboard engine for PHASE LOCK
 * Handles player callsign, independent map progression, local leaderboards, and JSON backup.
 */

class StorageManager {
  static STORAGE_KEY = 'PHASELOCK_STORAGE_V2';

  constructor() {
    this.memoryFallback = null;
    this.data = this._loadData();
  }

  _getDefaultData() {
    return {
      version: 2,
      profile: {
        callsign: 'OPERATOR-01',
        audioMuted: false
      },
      mapProgress: {
        neon: { unlockedLevel: 1, completed: [], bestStreak: 0 },
        quantum: { unlockedLevel: 1, completed: [], bestStreak: 0 },
        void: { unlockedLevel: 1, completed: [], bestStreak: 0 }
      },
      levelRecords: {}, // levelId -> { personalBest, leaderboard: [] }
      activeStreak: {
        mapId: 'neon',
        count: 0
      }
    };
  }

  _loadData() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(StorageManager.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.version === 2) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, defaulting to memory store:', e);
    }
    const fresh = this._getDefaultData();
    this._saveData(fresh);
    return fresh;
  }

  _saveData(dataToSave = this.data) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(StorageManager.STORAGE_KEY, JSON.stringify(dataToSave));
      }
    } catch (e) {
      console.warn('Failed saving to localStorage:', e);
    }
    this.data = dataToSave;
  }

  // Callsign Profile
  getCallsign() {
    return this.data.profile.callsign || 'OPERATOR-01';
  }

  setCallsign(rawName) {
    if (!rawName) return this.getCallsign();
    const clean = rawName.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 16);
    this.data.profile.callsign = clean.length >= 3 ? clean : 'OPERATOR-01';
    this._saveData();
    return this.data.profile.callsign;
  }

  // Audio mute preference
  getAudioMuted() {
    return !!this.data.profile.audioMuted;
  }

  setAudioMuted(muted) {
    this.data.profile.audioMuted = !!muted;
    this._saveData();
  }

  // Map progression
  getMapProgress(mapId) {
    if (!this.data.mapProgress[mapId]) {
      this.data.mapProgress[mapId] = { unlockedLevel: 1, completed: [], bestStreak: 0 };
    }
    return this.data.mapProgress[mapId];
  }

  isLevelUnlocked(mapId, levelNum) {
    const prog = this.getMapProgress(mapId);
    return levelNum <= prog.unlockedLevel;
  }

  getActiveStreak(mapId) {
    if (this.data.activeStreak.mapId !== mapId) {
      return 0;
    }
    return this.data.activeStreak.count || 0;
  }

  incrementStreak(mapId) {
    if (this.data.activeStreak.mapId !== mapId) {
      this.data.activeStreak = { mapId, count: 1 };
    } else {
      this.data.activeStreak.count = (this.data.activeStreak.count || 0) + 1;
    }

    const prog = this.getMapProgress(mapId);
    if (this.data.activeStreak.count > prog.bestStreak) {
      prog.bestStreak = this.data.activeStreak.count;
    }
    this._saveData();
    return this.data.activeStreak.count;
  }

  breakStreak(mapId) {
    if (this.data.activeStreak.mapId === mapId) {
      this.data.activeStreak.count = 0;
      this._saveData();
    }
  }

  // Level record & Leaderboard
  getLevelRecord(levelId) {
    if (!this.data.levelRecords[levelId]) {
      this.data.levelRecords[levelId] = {
        personalBest: null,
        leaderboard: []
      };
    }
    return this.data.levelRecords[levelId];
  }

  /**
   * Records a completed level run into local leaderboards and personal bests
   */
  recordCompletion(mapId, levelId, levelNum, attemptData) {
    const recordStore = this.getLevelRecord(levelId);
    const callsign = this.getCallsign();
    const timestamp = Date.now();

    const newEntry = {
      callsign,
      score: attemptData.score,
      actions: attemptData.actions,
      parMoves: attemptData.parMoves,
      time: attemptData.time,
      streak: attemptData.streak,
      date: new Date(timestamp).toLocaleDateString(),
      timestamp
    };

    // Check personal best
    let isNewPersonalBest = false;
    const currentPB = recordStore.personalBest;
    if (!currentPB || attemptData.score > currentPB.score ||
       (attemptData.score === currentPB.score && attemptData.actions < currentPB.actions)) {
      recordStore.personalBest = { ...newEntry };
      isNewPersonalBest = true;
    }

    // Insert into local top 5 leaderboard with tie-breaking:
    // 1. Score (descending)
    // 2. Actions (ascending)
    // 3. Time (ascending)
    // 4. Timestamp (ascending)
    const list = recordStore.leaderboard || [];
    list.push(newEntry);
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.actions !== b.actions) return a.actions - b.actions;
      if (a.time !== b.time) return a.time - b.time;
      return a.timestamp - b.timestamp;
    });

    // Keep top 5
    recordStore.leaderboard = list.slice(0, 5);
    const isNewLeaderboardRecord = recordStore.leaderboard.some(e => e.timestamp === timestamp);

    // Update map progression
    const prog = this.getMapProgress(mapId);
    if (!prog.completed.includes(levelNum)) {
      prog.completed.push(levelNum);
      prog.completed.sort((a, b) => a - b);
    }
    if (levelNum === prog.unlockedLevel && levelNum < 5) {
      prog.unlockedLevel = levelNum + 1;
    }

    this._saveData();

    return {
      isNewPersonalBest,
      isNewLeaderboardRecord,
      personalBest: recordStore.personalBest,
      leaderboard: recordStore.leaderboard
    };
  }

  getLeaderboard(levelId) {
    return this.getLevelRecord(levelId).leaderboard || [];
  }

  getPersonalBest(levelId) {
    return this.getLevelRecord(levelId).personalBest || null;
  }

  /**
   * Computes aggregated stats for a map
   */
  getMapSummary(mapId, mapLevels) {
    const prog = this.getMapProgress(mapId);
    let totalScore = 0;
    let completedCount = 0;
    let bestScore = 0;
    let fastestTime = Infinity;

    mapLevels.forEach(lvl => {
      const pb = this.getPersonalBest(lvl.id);
      if (pb) {
        totalScore += pb.score;
        completedCount++;
        if (pb.score > bestScore) bestScore = pb.score;
        if (pb.time < fastestTime) fastestTime = pb.time;
      }
    });

    return {
      completedCount,
      totalLevels: mapLevels.length,
      completionPercent: Math.round((completedCount / mapLevels.length) * 100),
      totalScore,
      bestScore,
      fastestTime: fastestTime === Infinity ? 0 : fastestTime,
      bestStreak: prog.bestStreak || 0,
      unlockedLevel: prog.unlockedLevel
    };
  }

  // Backup & Import
  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || parsed.version !== 2 || !parsed.mapProgress || !parsed.levelRecords) {
        throw new Error('Invalid Phase Lock save data schema');
      }
      this.data = parsed;
      this._saveData();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetAllData() {
    const fresh = this._getDefaultData();
    this._saveData(fresh);
    return fresh;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
