const { B, solveBFS, testLevel } = require('./craft_unique_levels.js');

// Candidate levels with distinct architectural features:
// World A (Neon City): Streets, crossroads, alleys, city blocks
// World B (Crystal Caves): Winding corridors, irregular caverns, narrow rock pockets
// World C (Sky Islands): Platform islands, void gaps, narrow bridges

const CANDIDATES = [
  // ==========================================
  // NEON CITY (Straight streets, crossroads, city blocks, dead ends)
  // ==========================================
  {
    id: "neon-1",
    mapId: "neon",
    levelNumber: 1,
    name: "First Street",
    subtitle: "A straight avenue divided by dimensional roadblocks",
    difficulty: "Cadet",
    targetTimeSeconds: 25,
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 5, y: 2 }],
    plates: [{ id: "p1", x: 2, y: 5 }, { id: "p2", x: 5, y: 5 }],
    exit: { x: 6, y: 1 },
    alphaWalls: B.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 },
      { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 1 }, { x: 4, y: 5 }, { x: 4, y: 6 },
      { x: 1, y: 4 }, { x: 2, y: 6 }, { x: 6, y: 4 }
    ]),
    hint: "The central avenue is blocked in Alpha. Shift into Omega to bypass the roadblock."
  },
  {
    id: "neon-2",
    mapId: "neon",
    levelNumber: 2,
    name: "Alley Turn",
    subtitle: "A 90-degree corner with alternate dimensional shortcuts",
    difficulty: "Cadet",
    targetTimeSeconds: 30,
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 4, y: 2 }],
    plates: [{ id: "p1", x: 2, y: 6 }, { id: "p2", x: 5, y: 5 }],
    exit: { x: 1, y: 6 },
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
      { x: 3, y: 5 }, { x: 3, y: 6 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 },
      { x: 6, y: 2 }, { x: 6, y: 3 }
    ]),
    hint: "Navigate the narrow corner alley by alternating dimensions at the turn."
  },
  {
    id: "neon-3",
    mapId: "neon",
    levelNumber: 3,
    name: "Crossroads",
    subtitle: "A busy 4-way intersection with opposing directional barriers",
    difficulty: "Operator",
    targetTimeSeconds: 35,
    player: { x: 1, y: 1 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 5, y: 3 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 4 }],
    exit: { x: 2, y: 6 },
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 5 }, { x: 5, y: 5 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 2, y: 5 }, { x: 5, y: 2 }
    ]),
    hint: "The intersection locks one avenue per realm. Coordinate traffic across both lanes."
  },
  {
    id: "neon-4",
    mapId: "neon",
    levelNumber: 4,
    name: "Power Block",
    subtitle: "A solid rectangular building complex surrounded by perimeter streets",
    difficulty: "Operator",
    targetTimeSeconds: 30,
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 3, y: 2 }, { id: "b2", x: 4, y: 4 }],
    plates: [{ id: "p1", x: 2, y: 5 }, { id: "p2", x: 5, y: 2 }],
    exit: { x: 6, y: 6 },
    alphaWalls: B.concat([
      { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }
    ]),
    omegaWalls: B.concat([
      { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 1, y: 4 }, { x: 6, y: 3 }
    ]),
    hint: "Loop around the power substation block before pushing the second battery."
  },
  {
    id: "neon-5",
    mapId: "neon",
    levelNumber: 5,
    name: "City Escape",
    subtitle: "Navigate through the downtown high-rise maze to the exit highway",
    difficulty: "Specialist",
    targetTimeSeconds: 50,
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 3 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 5 }],
    exit: { x: 4, y: 6 },
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 4 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 4 }
    ]),
    hint: "Weave between the two city sectors by switching dimensions at mid-block."
  },

  // ==========================================
  // CRYSTAL CAVES (Winding corridors, uneven chambers, narrow crystal tunnels, dead-end pockets)
  // ==========================================
  {
    id: "quantum-1",
    mapId: "quantum",
    levelNumber: 1,
    name: "Cave Entrance",
    subtitle: "A narrowing cave mouth opening into jagged stalagmites",
    difficulty: "Operator",
    targetTimeSeconds: 35,
    player: { x: 1, y: 1 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 4, y: 2 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 5, y: 5 }],
    exit: { x: 6, y: 1 },
    // Cave mouth walls: Jagged teeth from top and left
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 1, y: 4 }
    ]),
    hint: "Enter the cave by slipping between crystal pillars in the alternate realm."
  },
  {
    id: "quantum-2",
    mapId: "quantum",
    levelNumber: 2,
    name: "Crystal Path",
    subtitle: "A serpentine winding tunnel flanked by sharp crystal shards",
    difficulty: "Operator",
    targetTimeSeconds: 35,
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 5, y: 3 }],
    plates: [{ id: "p1", x: 2, y: 5 }, { id: "p2", x: 5, y: 5 }],
    exit: { x: 3, y: 6 },
    alphaWalls: B.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }
    ]),
    omegaWalls: B.concat([
      { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 5, y: 2 }, { x: 1, y: 5 }
    ]),
    hint: "Follow the curving crystal path. When a wall blocks the tunnel, shift realms."
  },
  {
    id: "quantum-3",
    mapId: "quantum",
    levelNumber: 3,
    name: "Hidden Chamber",
    subtitle: "A secluded cavern alcove guarded by crystalline barriers",
    difficulty: "Specialist",
    targetTimeSeconds: 50,
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 4, y: 2 }],
    plates: [{ id: "p1", x: 2, y: 6 }, { id: "p2", x: 5, y: 4 }],
    exit: { x: 1, y: 6 },
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 5 }, { x: 5, y: 2 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 2, y: 4 }
    ]),
    hint: "Push the first crystal into the hidden pocket before clearing the main cavern passage."
  },
  {
    id: "quantum-4",
    mapId: "quantum",
    levelNumber: 4,
    name: "Deep Tunnel",
    subtitle: "Constrained subterranean shafts where careless pushes cause cave-ins",
    difficulty: "Specialist",
    targetTimeSeconds: 40,
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 2 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 5 }],
    exit: { x: 4, y: 6 },
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 5, y: 3 }
    ]),
    hint: "Deep inside the cavern, avoid pinning crystal crates against dead-end rock faces."
  },
  {
    id: "quantum-5",
    mapId: "quantum",
    levelNumber: 5,
    name: "Crystal Heart",
    subtitle: "The resonant core of the crystal labyrinth with interlinked veins",
    difficulty: "Architect",
    targetTimeSeconds: 45,
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 3 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 5, y: 5 }],
    exit: { x: 3, y: 6 },
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 4 }
    ]),
    hint: "The crystal heart pulses between dimensions. Carefully route both resonant crystals to the core."
  },

  // ==========================================
  // SKY ISLANDS (Isolated platform sections, bridges, open air/chasms)
  // ==========================================
  {
    id: "void-1",
    mapId: "void",
    levelNumber: 1,
    name: "First Island",
    subtitle: "Two floating landmasses connected across an open abyss",
    difficulty: "Specialist",
    targetTimeSeconds: 50,
    player: { x: 1, y: 1 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 2 }, { id: "b2", x: 5, y: 2 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 5, y: 5 }],
    exit: { x: 6, y: 1 },
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }
    ]),
    omegaWalls: B.concat([
      { x: 2, y: 4 }, { x: 5, y: 3 }, { x: 6, y: 2 }
    ]),
    hint: "Cross the chasm separating the two islands by shifting dimensions at the bridgehead."
  },
  {
    id: "void-2",
    mapId: "void",
    levelNumber: 2,
    name: "Cloud Bridge",
    subtitle: "A suspended walkway that only solidifies in the alternate realm",
    difficulty: "Architect",
    targetTimeSeconds: 35,
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 4, y: 2 }],
    plates: [{ id: "p1", x: 2, y: 5 }, { id: "p2", x: 5, y: 5 }],
    exit: { x: 1, y: 6 },
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 5 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 6, y: 2 }
    ]),
    hint: "The cloud bridge dissolves in Alpha. Shift into Omega to tread across the span."
  },
  {
    id: "void-3",
    mapId: "void",
    levelNumber: 3,
    name: "Broken Crossing",
    subtitle: "Fragmented stepping stones floating over an endless sky drop",
    difficulty: "Architect",
    targetTimeSeconds: 45,
    player: { x: 2, y: 1 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 2 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 4 }],
    exit: { x: 3, y: 6 },
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 5, y: 3 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 4 }
    ]),
    hint: "Stepping stones are scattered between dimensions. Move each cargo crate step by step."
  },
  {
    id: "void-4",
    mapId: "void",
    levelNumber: 4,
    name: "High Passage",
    subtitle: "Narrow platforms hovering in high altitude winds",
    difficulty: "Architect",
    targetTimeSeconds: 50,
    player: { x: 1, y: 1 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 2 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 5 }],
    exit: { x: 4, y: 6 },
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 4 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 4 }
    ]),
    hint: "Use the elevated high passage to position crates without boxing yourself into the sky drop."
  },
  {
    id: "void-5",
    mapId: "void",
    levelNumber: 5,
    name: "Sky Gate",
    subtitle: "The celestial portal floating at the pinnacle of the islands",
    difficulty: "Grandmaster",
    targetTimeSeconds: 65,
    player: { x: 1, y: 2 },
    realm: "alpha",
    blocks: [{ id: "b1", x: 2, y: 3 }, { id: "b2", x: 5, y: 3 }],
    plates: [{ id: "p1", x: 1, y: 5 }, { id: "p2", x: 6, y: 5 }],
    exit: { x: 3, y: 6 },
    alphaWalls: B.concat([
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 2, y: 1 }
    ]),
    omegaWalls: B.concat([
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 5, y: 2 }
    ]),
    hint: "Reach the zenith Sky Gate. Every phase shift must be calculated with zero tolerance for error."
  }
];

console.log("Testing 15 candidate levels...");
let allPass = true;
for (const cand of CANDIDATES) {
  const res = testLevel(cand);
  if (res.valid) {
    console.log(`[PASS] ${res.id.padEnd(10)} | ${res.name.padEnd(20)} | Par: ${res.par} | States: ${res.explored}`);
  } else {
    allPass = false;
    console.error(`[FAIL] ${res.id} (${res.name}): Solvable=${res.solvable}, NoShiftSolvable=${res.noShiftSolvable}`);
  }
}

if (allPass) {
  console.log(">>> ALL 15 THEMATIC LEVELS PASSED! <<<");
}
