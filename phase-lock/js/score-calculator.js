/**
 * ScoreCalculator - Authoritative scoring and efficiency engine for PHASE LOCK
 * Centralizes move-efficiency, elapsed time points, streak bonus, and star calculations.
 */

class ScoreCalculator {
  static MAX_MOVE_POINTS = 700;
  static MAX_TIME_POINTS = 250;
  static STREAK_UNIT_BONUS = 50;
  static MAX_STREAK_UNITS = 5; // Max 250 pts

  /**
   * Calculates breakdown and total score for a level completion
   * @param {number} parMoves - Optimal action count verified by BFS solver
   * @param {number} actualActions - Total successful actions in current attempt
   * @param {number} targetTimeSeconds - Configured target completion time
   * @param {number} elapsedSeconds - Actual elapsed time in seconds
   * @param {number} currentStreak - Uninterrupted sequential level clear streak
   * @returns {{ movePoints: number, timePoints: number, streakBonus: number, totalScore: number, stars: number }}
   */
  static calculate(parMoves, actualActions, targetTimeSeconds, elapsedSeconds, currentStreak = 0) {
    const validPar = Math.max(1, Math.floor(parMoves || 1));
    const validActions = Math.max(1, Math.floor(actualActions || 1));
    const validTargetTime = Math.max(1, targetTimeSeconds || 30);
    const validElapsed = Math.max(1, elapsedSeconds || 1);
    const validStreak = Math.max(0, Math.floor(currentStreak || 0));

    // 1. Move efficiency: up to 700 points
    const moveRatio = Math.min(1.0, validPar / validActions);
    const movePoints = Math.round(ScoreCalculator.MAX_MOVE_POINTS * moveRatio);

    // 2. Time points: up to 250 points
    const timeRatio = Math.min(1.0, validTargetTime / validElapsed);
    const timePoints = Math.round(ScoreCalculator.MAX_TIME_POINTS * timeRatio);

    // 3. Streak bonus: up to 250 points (50 * min(streak, 5))
    const cappedStreak = Math.min(validStreak, ScoreCalculator.MAX_STREAK_UNITS);
    const streakBonus = ScoreCalculator.STREAK_UNIT_BONUS * cappedStreak;

    // Total final score (nominal max 1,200)
    const totalScore = movePoints + timePoints + streakBonus;

    // Star rating
    const stars = ScoreCalculator.getStars(validPar, validActions);

    return {
      movePoints,
      timePoints,
      streakBonus,
      totalScore,
      stars,
      parMoves: validPar,
      actualActions: validActions,
      targetTimeSeconds: validTargetTime,
      elapsedSeconds: validElapsed,
      currentStreak: validStreak
    };
  }

  /**
   * Deterministic star rating derived from verified par moves
   */
  static getStars(parMoves, actualActions) {
    if (actualActions <= parMoves + 2) return 3;
    if (actualActions <= Math.floor(parMoves * 1.45) + 3) return 2;
    return 1;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreCalculator;
}
