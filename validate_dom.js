const fs = require('fs');

const indexHtml = fs.readFileSync('./phase-lock/index.html', 'utf8');

// Check that required IDs and classes are present
const requiredIds = [
  'view-worlds',
  'view-levels',
  'view-game',
  'view-leaderboard',
  'worlds-grid-container',
  'progression-map-wrapper',
  'progression-svg-bg',
  'progression-nodes-container',
  'selected-level-card',
  'btn-play-selected-level',
  'modal-victory',
  'victory-lb-container',
  'victory-lb-tbody',
  'btn-victory-replay',
  'btn-victory-levelselect',
  'btn-victory-next'
];

let allFound = true;
for (const id of requiredIds) {
  if (!indexHtml.includes(`id="${id}"`)) {
    console.error(`Missing ID in index.html: ${id}`);
    allFound = false;
  }
}

if (allFound) {
  console.log('>>> All critical DOM elements exist in index.html! <<<');
} else {
  process.exitCode = 1;
}
