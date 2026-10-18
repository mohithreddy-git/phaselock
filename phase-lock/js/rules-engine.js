/**
 * RulesEngine - Authoritative, deterministic pure game logic for PHASE LOCK
 * Zero DOM or Canvas dependencies. Reusable in browser and automated Node.js tests.
 */

class RulesEngine {
  static GRID_SIZE = 8;

  /**
   * Helper to check if a coordinate is within 0..7 grid
   */
  static inBounds(x, y) {
    return x >= 0 && x < RulesEngine.GRID_SIZE && y >= 0 && y < RulesEngine.GRID_SIZE;
  }

  /**
   * Checks if coordinate matches any wall in the specified realm list
   */
  static isWall(walls, x, y) {
    for (let i = 0; i < walls.length; i++) {
      if (walls[i].x === x && walls[i].y === y) return true;
    }
    return false;
  }

  /**
   * Finds block at (x, y) if any
   */
  static findBlock(blocks, x, y) {
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].x === x && blocks[i].y === y) return blocks[i];
    }
    return null;
  }

  /**
   * Checks pressure plate status
   */
  static checkPlates(blocks, plates) {
    if (!plates || plates.length < 2) return { plateA: false, plateB: false, allActive: false };
    const p1 = plates[0];
    const p2 = plates[1];

    const plateA = blocks.some(b => b.x === p1.x && b.y === p1.y);
    const plateB = blocks.some(b => b.x === p2.x && b.y === p2.y);
    return { plateA, plateB, allActive: plateA && plateB };
  }

  /**
   * Checks if current state achieves victory: both plates active AND player on exit
   */
  static isVictory(player, blocks, plates, exit) {
    if (!exit) return false;
    const { allActive } = RulesEngine.checkPlates(blocks, plates);
    return allActive && player.x === exit.x && player.y === exit.y;
  }

  /**
   * Validates and applies a player move or block push
   * @returns {{ success: boolean, reason?: string, pushed?: boolean, pushedBlockId?: string, player?: {x, y}, blocks?: Array }}
   */
  static applyMove(player, blocks, realm, levelData, dx, dy) {
    const tx = player.x + dx;
    const ty = player.y + dy;

    // 1. Grid bounds check
    if (!RulesEngine.inBounds(tx, ty)) {
      return { success: false, reason: "Boundary limit reached" };
    }

    // 2. Active realm wall check
    const currentWalls = realm === 'alpha' ? levelData.alphaWalls : levelData.omegaWalls;
    if (RulesEngine.isWall(currentWalls, tx, ty)) {
      return { success: false, reason: `Spatial barrier impassable in ${realm.toUpperCase()} realm` };
    }

    // 3. Block push check
    const block = RulesEngine.findBlock(blocks, tx, ty);
    if (block) {
      const bx = tx + dx;
      const by = ty + dy;

      // Block boundary check
      if (!RulesEngine.inBounds(bx, by)) {
        return { success: false, reason: "Cannot push crate outside perimeter" };
      }

      // Block cannot enter a wall in ALPHA realm
      if (RulesEngine.isWall(levelData.alphaWalls, bx, by)) {
        return { success: false, reason: "Crate trajectory obstructed by ALPHA wall" };
      }

      // Block cannot enter a wall in OMEGA realm
      if (RulesEngine.isWall(levelData.omegaWalls, bx, by)) {
        return { success: false, reason: "Crate trajectory obstructed by OMEGA wall" };
      }

      // Block cannot collide with second block
      const otherBlock = RulesEngine.findBlock(blocks, bx, by);
      if (otherBlock && otherBlock.id !== block.id) {
        return { success: false, reason: "Crate path obstructed by secondary crate" };
      }

      // Valid Push
      const newBlocks = blocks.map(b => (b.id === block.id ? { id: b.id, x: bx, y: by } : { id: b.id, x: b.x, y: b.y }));
      return {
        success: true,
        pushed: true,
        pushedBlockId: block.id,
        player: { x: tx, y: ty },
        blocks: newBlocks
      };
    }

    // Valid Player Movement without push
    return {
      success: true,
      pushed: false,
      player: { x: tx, y: ty },
      blocks: blocks.map(b => ({ id: b.id, x: b.x, y: b.y }))
    };
  }

  /**
   * Validates and applies a phase shift
   * @returns {{ success: boolean, reason?: string, newRealm?: string }}
   */
  static applyPhaseShift(player, realm, levelData) {
    const targetRealm = realm === 'alpha' ? 'omega' : 'alpha';
    const targetWalls = targetRealm === 'alpha' ? levelData.alphaWalls : levelData.omegaWalls;

    if (RulesEngine.isWall(targetWalls, player.x, player.y)) {
      return {
        success: false,
        reason: "Phase shift rejected: Destination coordinate contains a solid wall in alternate realm"
      };
    }

    return {
      success: true,
      newRealm: targetRealm
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RulesEngine;
}
