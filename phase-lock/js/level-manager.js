/**
 * LevelManager - Authoritative Handcrafted Level & World Data for PHASE LOCK
 * Defines 3 distinct environments: NEON CITY, CRYSTAL CAVES, and SKY ISLANDS.
 * All 15 levels are uniquely designed and BFS-verified with deterministic par values.
 */

class LevelManager {
  constructor() {
    this.maps = [
      {
        id: 'neon',
        name: 'NEON CITY',
        subtitle: 'Bright streets and hidden paths',
        description: 'Navigate straight avenues, narrow alleyways, and power blocks through an illuminated cyberpunk city.',
        difficultyRange: 'Beginner → Intermediate',
        accent: '#00F3FF',
        secondaryAccent: '#FF007F',
        themeClass: 'theme-neon',
        levelCount: 5
      },
      {
        id: 'quantum',
        name: 'CRYSTAL CAVES',
        subtitle: 'Find your way through the caves',
        description: 'Explore an organic underground labyrinth of winding tunnels, glowing crystal clusters, and secluded rock chambers.',
        difficultyRange: 'Intermediate → Advanced',
        accent: '#00FFCC',
        secondaryAccent: '#A855F7',
        themeClass: 'theme-caves',
        levelCount: 5
      },
      {
        id: 'void',
        name: 'SKY ISLANDS',
        subtitle: 'Cross the floating paths',
        description: 'Traverse floating celestial landmasses connected by glowing energy bridges suspended high above the clouds.',
        difficultyRange: 'Advanced → Expert',
        accent: '#C084FC',
        secondaryAccent: '#FBBF24',
        themeClass: 'theme-sky',
        levelCount: 5
      }
    ];

    const B = this._generateBorders();

    this.levels = [
      // ==========================================
      // MAP 01 — NEON CITY (Urban streets, alleys, crossroads, power blocks)
      // ==========================================
      {
        id: 'neon-1',
        mapId: 'neon',
        levelNumber: 1,
        name: 'First Street',
        subtitle: 'A straight avenue divided by dimensional roadblocks',
        description: 'Learn basic dimensional movement, crate pushing, and dual-realm power plates.',
        difficulty: 'Cadet',
        targetTimeSeconds: 25,
        parMoves: 21,
        player: { x: 1, y: 2 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 2 }, { id: 'b2', x: 5, y: 2 }],
        plates: [{ id: 'p1', x: 2, y: 5 }, { id: 'p2', x: 5, y: 5 }],
        exit: { x: 6, y: 1 },
        alphaWalls: B.concat([
          { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 },
          { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 1 }, { x: 4, y: 5 }, { x: 4, y: 6 },
          { x: 1, y: 4 }, { x: 2, y: 6 }, { x: 6, y: 4 }
        ]),
        hint: 'Alpha realm blocks the central avenue. Shift into Omega to navigate through the barrier.'
      },
      {
        id: 'neon-2',
        mapId: 'neon',
        levelNumber: 2,
        name: 'Alley Turn',
        subtitle: 'A 90-degree corner with alternate dimensional shortcuts',
        description: 'Navigate a blocked street intersection by changing dimensions at safe waypoints.',
        difficulty: 'Cadet',
        targetTimeSeconds: 30,
        parMoves: 19,
        player: { x: 1, y: 2 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 3 }, { id: 'b2', x: 4, y: 2 }],
        plates: [{ id: 'p1', x: 2, y: 6 }, { id: 'p2', x: 5, y: 5 }],
        exit: { x: 1, y: 6 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
          { x: 3, y: 5 }, { x: 3, y: 6 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 },
          { x: 6, y: 2 }, { x: 6, y: 3 }
        ]),
        hint: "Watch out for Omega's wall at (4,4) when positioning Block 2 into the alley."
      },
      {
        id: 'neon-3',
        mapId: 'neon',
        levelNumber: 3,
        name: 'Crossroads',
        subtitle: 'A busy 4-way intersection with opposing directional barriers',
        description: 'Coordinate two energy blocks and activate separated power plates at the crossroads.',
        difficulty: 'Operator',
        targetTimeSeconds: 35,
        parMoves: 24,
        player: { x: 1, y: 1 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 2 }, { id: 'b2', x: 5, y: 3 }],
        plates: [{ id: 'p1', x: 1, y: 5 }, { id: 'p2', x: 6, y: 4 }],
        exit: { x: 2, y: 6 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 5 }, { x: 5, y: 5 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 2, y: 5 }, { x: 5, y: 2 }
        ]),
        hint: 'Use Omega realm to access the upper corridor and maneuver behind crate 1.'
      },
      {
        id: 'neon-4',
        mapId: 'neon',
        levelNumber: 4,
        name: 'Power Block',
        subtitle: 'A solid rectangular building complex surrounded by perimeter streets',
        description: 'Work around walls that obstruct different paths in the two realms.',
        difficulty: 'Operator',
        targetTimeSeconds: 30,
        parMoves: 16,
        player: { x: 1, y: 2 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 3, y: 2 }, { id: 'b2', x: 4, y: 4 }],
        plates: [{ id: 'p1', x: 2, y: 5 }, { id: 'p2', x: 5, y: 2 }],
        exit: { x: 6, y: 6 },
        alphaWalls: B.concat([
          { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }
        ]),
        omegaWalls: B.concat([
          { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 1, y: 4 }, { x: 6, y: 3 }
        ]),
        hint: 'Crate 1 must be pushed into position before shifting to reach the overpass.'
      },
      {
        id: 'neon-5',
        mapId: 'neon',
        levelNumber: 5,
        name: 'City Escape',
        subtitle: 'Navigate through the downtown high-rise maze to the exit highway',
        description: 'Complete a multi-stage power-routing puzzle that combines all urban street concepts.',
        difficulty: 'Specialist',
        targetTimeSeconds: 50,
        parMoves: 32,
        player: { x: 1, y: 2 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 3 }, { id: 'b2', x: 5, y: 3 }],
        plates: [{ id: 'p1', x: 1, y: 5 }, { id: 'p2', x: 6, y: 5 }],
        exit: { x: 4, y: 6 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 4 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 4 }
        ]),
        hint: 'Master dual-phase positioning to route both power cells into terminal plates.'
      },

      // ==========================================
      // MAP 02 — CRYSTAL CAVES (Winding tunnels, crystal clusters, cavern chambers)
      // ==========================================
      {
        id: 'quantum-1',
        mapId: 'quantum',
        levelNumber: 1,
        name: 'Cave Entrance',
        subtitle: 'A narrowing cave mouth opening into jagged stalagmites',
        description: 'Enter the subterranean cavern and check both dimensions before pushing matter.',
        difficulty: 'Operator',
        targetTimeSeconds: 35,
        parMoves: 22,
        player: { x: 1, y: 1 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 2 }, { id: 'b2', x: 4, y: 2 }],
        plates: [{ id: 'p1', x: 1, y: 5 }, { id: 'p2', x: 5, y: 5 }],
        exit: { x: 6, y: 1 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 1, y: 4 }
        ]),
        hint: 'Check the minimap radar to spot hidden Omega crystal formations before committing a push.'
      },
      {
        id: 'quantum-2',
        mapId: 'quantum',
        levelNumber: 2,
        name: 'Crystal Path',
        subtitle: 'A serpentine winding tunnel flanked by sharp crystal shards',
        description: 'Navigate differently shaped cave corridors across synchronized realms.',
        difficulty: 'Operator',
        targetTimeSeconds: 35,
        parMoves: 21,
        player: { x: 1, y: 2 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 2 }, { id: 'b2', x: 5, y: 3 }],
        plates: [{ id: 'p1', x: 2, y: 5 }, { id: 'p2', x: 5, y: 5 }],
        exit: { x: 3, y: 6 },
        alphaWalls: B.concat([
          { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }
        ]),
        omegaWalls: B.concat([
          { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 5, y: 2 }, { x: 1, y: 5 }
        ]),
        hint: "Alpha's central crystal ridge is closed; Omega opens the central path but locks the wings."
      },
      {
        id: 'quantum-3',
        mapId: 'quantum',
        levelNumber: 3,
        name: 'Hidden Chamber',
        subtitle: 'A secluded cavern alcove guarded by crystalline barriers',
        description: 'Coordinate crystal placement around walls that make apparently easy pushes impossible.',
        difficulty: 'Specialist',
        targetTimeSeconds: 50,
        parMoves: 33,
        player: { x: 1, y: 2 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 3 }, { id: 'b2', x: 4, y: 2 }],
        plates: [{ id: 'p1', x: 2, y: 6 }, { id: 'p2', x: 5, y: 4 }],
        exit: { x: 1, y: 6 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 5 }, { x: 5, y: 2 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 2, y: 4 }
        ]),
        hint: 'Position crate 2 first to avoid blocking the narrow crystal chamber entryway.'
      },
      {
        id: 'quantum-4',
        mapId: 'quantum',
        levelNumber: 4,
        name: 'Deep Tunnel',
        subtitle: 'Constrained subterranean shafts where careless pushes cause cave-ins',
        description: 'Plan a constrained route while preserving access to remaining crystal positions.',
        difficulty: 'Specialist',
        targetTimeSeconds: 40,
        parMoves: 25,
        player: { x: 1, y: 2 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 3 }, { id: 'b2', x: 5, y: 2 }],
        plates: [{ id: 'p1', x: 1, y: 5 }, { id: 'p2', x: 6, y: 5 }],
        exit: { x: 4, y: 6 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 5, y: 3 }
        ]),
        hint: 'Bypass the deep cavern bottleneck by alternating between dimensions before pushing crate 2.'
      },
      {
        id: 'quantum-5',
        mapId: 'quantum',
        levelNumber: 5,
        name: 'Crystal Heart',
        subtitle: 'The resonant core of the crystal labyrinth with interlinked veins',
        description: 'Solve a complex cavern puzzle requiring precise crystal positioning and timed realm changes.',
        difficulty: 'Architect',
        targetTimeSeconds: 45,
        parMoves: 23,
        player: { x: 1, y: 2 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 3 }, { id: 'b2', x: 5, y: 3 }],
        plates: [{ id: 'p1', x: 1, y: 5 }, { id: 'p2', x: 5, y: 5 }],
        exit: { x: 3, y: 6 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 4 }
        ]),
        hint: 'Carefully stage both crystal cores; pushing one into an alcove too early causes irreversible phase lock.'
      },

      // ==========================================
      // MAP 03 — SKY ISLANDS (Platform islands, bridges, abyss chasms)
      // ==========================================
      {
        id: 'void-1',
        mapId: 'void',
        levelNumber: 1,
        name: 'First Island',
        subtitle: 'Two floating landmasses connected across an open abyss',
        description: 'Navigate separated aerial platforms across an open sky chasm.',
        difficulty: 'Specialist',
        targetTimeSeconds: 50,
        parMoves: 34,
        player: { x: 1, y: 1 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 2 }, { id: 'b2', x: 5, y: 2 }],
        plates: [{ id: 'p1', x: 1, y: 5 }, { id: 'p2', x: 5, y: 5 }],
        exit: { x: 6, y: 1 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }
        ]),
        omegaWalls: B.concat([
          { x: 2, y: 4 }, { x: 5, y: 3 }, { x: 6, y: 2 }
        ]),
        hint: 'Identify the dimensional bridge across column 3 to maneuver around the sky chasm.'
      },
      {
        id: 'void-2',
        mapId: 'void',
        levelNumber: 2,
        name: 'Cloud Bridge',
        subtitle: 'A suspended walkway that only solidifies in the alternate realm',
        description: 'Navigate fragmented cloud bridges and identify safe phase-shift positions.',
        difficulty: 'Architect',
        targetTimeSeconds: 35,
        parMoves: 19,
        player: { x: 1, y: 2 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 3 }, { id: 'b2', x: 4, y: 2 }],
        plates: [{ id: 'p1', x: 2, y: 5 }, { id: 'p2', x: 5, y: 5 }],
        exit: { x: 1, y: 6 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 5 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 6, y: 2 }
        ]),
        hint: 'The central cloud bridge exists in fragments; use phase shifts at column 4 to cross the gap.'
      },
      {
        id: 'void-3',
        mapId: 'void',
        levelNumber: 3,
        name: 'Broken Crossing',
        subtitle: 'Fragmented stepping stones floating over an endless sky drop',
        description: 'Solve a tight island crossing where a single premature push can drop a crate into the abyss.',
        difficulty: 'Architect',
        targetTimeSeconds: 45,
        parMoves: 26,
        player: { x: 2, y: 1 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 3 }, { id: 'b2', x: 5, y: 2 }],
        plates: [{ id: 'p1', x: 1, y: 5 }, { id: 'p2', x: 6, y: 4 }],
        exit: { x: 3, y: 6 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 5, y: 3 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 4 }
        ]),
        hint: 'Do not push block 1 into column 1 until block 2 has crossed the broken crossing.'
      },
      {
        id: 'void-4',
        mapId: 'void',
        levelNumber: 4,
        name: 'High Passage',
        subtitle: 'Narrow platforms hovering in high altitude winds',
        description: 'Coordinate both blocks across high altitude island platforms.',
        difficulty: 'Architect',
        targetTimeSeconds: 50,
        parMoves: 33,
        player: { x: 1, y: 1 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 3 }, { id: 'b2', x: 5, y: 2 }],
        plates: [{ id: 'p1', x: 1, y: 5 }, { id: 'p2', x: 6, y: 5 }],
        exit: { x: 4, y: 6 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 4 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 4 }
        ]),
        hint: 'A multi-island traversal puzzle. Alternate block pushes across Alpha and Omega to maintain free passage.'
      },
      {
        id: 'void-5',
        mapId: 'void',
        levelNumber: 5,
        name: 'Sky Gate',
        subtitle: 'The celestial portal floating at the pinnacle of the islands',
        description: 'The ultimate Phase Lock challenge across the pinnacle sky islands.',
        difficulty: 'Grandmaster',
        targetTimeSeconds: 65,
        parMoves: 33,
        player: { x: 1, y: 2 },
        realm: 'alpha',
        blocks: [{ id: 'b1', x: 2, y: 3 }, { id: 'b2', x: 5, y: 3 }],
        plates: [{ id: 'p1', x: 1, y: 5 }, { id: 'p2', x: 6, y: 5 }],
        exit: { x: 3, y: 6 },
        alphaWalls: B.concat([
          { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 2, y: 1 }
        ]),
        omegaWalls: B.concat([
          { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 5, y: 2 }
        ]),
        hint: 'The Sky Gate requires absolute precision. Plan your dimensional escapes before each crate push.'
      }
    ];
  }

  _generateBorders() {
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

  getMaps() {
    return JSON.parse(JSON.stringify(this.maps));
  }

  getMap(mapId) {
    const m = this.maps.find(x => x.id === mapId);
    return m ? JSON.parse(JSON.stringify(m)) : null;
  }

  getLevelsByMap(mapId) {
    return JSON.parse(JSON.stringify(this.levels.filter(l => l.mapId === mapId)));
  }

  getLevel(mapId, levelNumber) {
    const l = this.levels.find(x => x.mapId === mapId && x.levelNumber === levelNumber);
    return l ? JSON.parse(JSON.stringify(l)) : null;
  }

  getLevelById(levelId) {
    const l = this.levels.find(x => x.id === levelId);
    return l ? JSON.parse(JSON.stringify(l)) : null;
  }

  getAllLevels() {
    return JSON.parse(JSON.stringify(this.levels));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LevelManager;
}
