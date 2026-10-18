/**
 * Main - Screen Navigation, State Orchestration, and UI Binding for PHASE LOCK
 * Seamlessly manages World Select, Level Select, Game Arena, Leaderboard, and Offline PWA.
 */

(function () {
  'use strict';

  // Core Instances
  const storage = new StorageManager();
  const levelManager = new LevelManager();
  const audio = new AudioSynthesizer();
  const particles = new ParticleEngine(220);
  const gameState = new GameState(levelManager, storage);

  // Global DOM Views
  const viewEntrance = document.getElementById('view-entrance');
  const btnClickToPlay = document.getElementById('btn-click-to-play');
  const viewWorlds = document.getElementById('view-worlds');
  const viewLevels = document.getElementById('view-levels');
  const viewGame = document.getElementById('view-game');
  const viewLeaderboard = document.getElementById('view-leaderboard');

  // Header Elements
  const headerHomeBtn = document.getElementById('btn-header-home');
  const gameHudGroup = document.getElementById('game-hud-group');
  const hudRealm = document.getElementById('hud-realm');
  const hudLevel = document.getElementById('hud-level');
  const hudActions = document.getElementById('hud-actions');
  const hudTimer = document.getElementById('hud-timer');
  const hudStreak = document.getElementById('hud-streak');
  const headerCallsign = document.getElementById('header-callsign-display');
  const btnProfileCallsign = document.getElementById('btn-profile-callsign');
  const btnAudioToggle = document.getElementById('btn-audio-toggle');
  const audioIcon = document.getElementById('audio-icon');
  const btnHelp = document.getElementById('btn-help');
  const liveRegion = document.getElementById('aria-live-announcements');

  const SVG_AUDIO_ON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  const SVG_AUDIO_OFF = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

  // View: Worlds Elements
  const worldsGridContainer = document.getElementById('worlds-grid-container');

  // View: Levels Elements
  const btnLevelsBack = document.getElementById('btn-levels-back-worlds');
  const levelsMapTitle = document.getElementById('levels-map-title');
  const levelsMapSubtitle = document.getElementById('levels-map-subtitle');
  const btnOpenLeaderboardFromLevels = document.getElementById('btn-open-leaderboard-from-levels');
  const progressionMapWrapper = document.getElementById('progression-map-wrapper');
  const progressionSvgBg = document.getElementById('progression-svg-bg');
  const progressionNodesContainer = document.getElementById('progression-nodes-container');
  const selectedLevelCard = document.getElementById('selected-level-card');
  const slcBadge = document.getElementById('slc-badge');
  const slcTitle = document.getElementById('slc-title');
  const slcDesc = document.getElementById('slc-desc');
  const slcDiff = document.getElementById('slc-diff');
  const slcPar = document.getElementById('slc-par');
  const slcBest = document.getElementById('slc-best');
  const btnPlaySelectedLevel = document.getElementById('btn-play-selected-level');

  let selectedNodeLevelNumber = 1;

  // View: Game Arena Elements
  const canvas = document.getElementById('game-canvas');
  const renderer = new Renderer(canvas, gameState, particles);
  const input = new InputController(gameState, audio, canvas, renderer);
  const btnGameBackLevels = document.getElementById('btn-game-back-levels');
  const btnGameToWorlds = document.getElementById('btn-game-to-worlds');
  const crumbMapName = document.getElementById('crumb-map-name');
  const crumbLevelName = document.getElementById('crumb-level-name');
  const objPlateA = document.getElementById('obj-plate-a');
  const objPlateB = document.getElementById('obj-plate-b');
  const objExit = document.getElementById('obj-exit');
  const fieldIntel = document.getElementById('field-intel-text');
  const intelParMoves = document.getElementById('intel-par-moves');

  // View: Leaderboard Elements
  const btnLbBack = document.getElementById('btn-lb-back');
  const lbWorldTabs = document.getElementById('lb-world-tabs');
  const lbLevelPills = document.getElementById('lb-level-pills');
  const lbPbCard = document.getElementById('lb-pb-card');
  const lbRecordsTbody = document.getElementById('lb-records-tbody');
  const btnExportRecords = document.getElementById('btn-export-records');
  const btnImportRecords = document.getElementById('btn-import-records');
  const inputImportFile = document.getElementById('input-import-file');
  const btnResetScores = document.getElementById('btn-reset-scores');

  // Modals
  const modalCallsign = document.getElementById('modal-callsign');
  const inputCallsignField = document.getElementById('input-callsign-field');
  const btnSaveCallsign = document.getElementById('btn-save-callsign');
  const btnCancelCallsign = document.getElementById('btn-cancel-callsign');

  const modalInstructions = document.getElementById('modal-instructions');
  const btnCloseInstructions = document.getElementById('btn-close-instructions');

  const modalVictory = document.getElementById('modal-victory');
  const victoryStars = document.getElementById('victory-stars');
  const victoryScoreTotal = document.getElementById('victory-score-total');
  const victoryRecordBadge = document.getElementById('victory-record-badge');
  const breakdownMovePts = document.getElementById('breakdown-move-pts');
  const victoryActualActions = document.getElementById('victory-actual-actions');
  const victoryParMoves = document.getElementById('victory-par-moves');
  const breakdownTimePts = document.getElementById('breakdown-time-pts');
  const victoryElapsedTime = document.getElementById('victory-elapsed-time');
  const victoryTargetTime = document.getElementById('victory-target-time');
  const breakdownStreakPts = document.getElementById('breakdown-streak-pts');
  const victoryStreakCount = document.getElementById('victory-streak-count');
  const victoryMessage = document.getElementById('victory-message');
  const btnVictoryReplay = document.getElementById('btn-victory-replay');
  const btnVictoryLevelSelect = document.getElementById('btn-victory-levelselect');
  const btnVictoryNext = document.getElementById('btn-victory-next');
  const victoryLbTitleName = document.getElementById('victory-lb-title-name');
  const victoryLbTbody = document.getElementById('victory-lb-tbody');

  const modalWorldComplete = document.getElementById('modal-world-complete');
  const wcMapName = document.getElementById('wc-map-name');
  const wcTotalScore = document.getElementById('wc-total-score');
  const wcBestStreak = document.getElementById('wc-best-streak');
  const btnWcLeaderboard = document.getElementById('btn-wc-leaderboard');
  const btnWcWorlds = document.getElementById('btn-wc-worlds');

  const modalMasterComplete = document.getElementById('modal-master-complete');
  const masterGrandScore = document.getElementById('master-grand-score');
  const btnMasterClose = document.getElementById('btn-master-close');

  const modalWipeConfirm = document.getElementById('modal-wipe-confirm');
  const btnCancelWipe = document.getElementById('btn-cancel-wipe');
  const btnConfirmWipe = document.getElementById('btn-confirm-wipe');

  // Navigation State
  let currentView = 'worlds';
  let activeMapId = 'neon';
  let activeLevelNumber = 1;
  let lbSelectedMapId = 'neon';
  let lbSelectedLevelNum = 1;

  // Animation Loop State
  let lastTimestamp = 0;

  function announce(message) {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // =========================================================================
  // VIEW ROUTER
  // =========================================================================

  function switchView(viewName, params = {}) {
    currentView = viewName;

    // Hide all views
    if (viewEntrance) viewEntrance.style.display = 'none';
    viewWorlds.style.display = 'none';
    viewLevels.style.display = 'none';
    viewGame.style.display = 'none';
    viewLeaderboard.style.display = 'none';

    // HUD visibility
    gameHudGroup.style.display = viewName === 'game' ? 'flex' : 'none';

    if (viewName === 'entrance') {
      input.setEnabled(false);
      if (viewEntrance) viewEntrance.style.display = 'flex';
      announce('Phase Lock. Dual-Realm Containment Protocol. Developed by ARCTECH. Click to play.');
    } else if (viewName === 'worlds') {
      input.setEnabled(false);
      viewWorlds.style.display = 'flex';
      renderWorldsView();
      announce('Choose Your World. Select one of the three dimensional maps.');
    } else if (viewName === 'levels') {
      input.setEnabled(false);
      activeMapId = params.mapId || activeMapId;
      viewLevels.style.display = 'flex';
      renderLevelsView(activeMapId);
      announce(`Viewing level selection for ${levelManager.getMap(activeMapId).name}.`);
    } else if (viewName === 'game') {
      activeMapId = params.mapId || activeMapId;
      activeLevelNumber = params.levelNumber || activeLevelNumber;
      viewGame.style.display = 'flex';

      // Load game state
      gameState.loadLevel(activeMapId, activeLevelNumber);
      renderer.resize();
      input.setEnabled(true);
      updateGameUI();
      announce(`Commencing ${gameState.levelData.name}. Dimensional containment protocol active.`);
    } else if (viewName === 'leaderboard') {
      input.setEnabled(false);
      lbSelectedMapId = params.mapId || activeMapId;
      lbSelectedLevelNum = params.levelNumber || 1;
      viewLeaderboard.style.display = 'flex';
      renderLeaderboardView();
      announce('Viewing local device leaderboards.');
    }
  }

  // =========================================================================
  // RENDER: VIEW 1 (WORLDS)
  // =========================================================================

  // =========================================================================
  // RENDER: VIEW 1 (WORLDS / CHOOSE A MAP)
  // =========================================================================

  function renderWorldsView() {
    worldsGridContainer.innerHTML = '';
    const maps = levelManager.getMaps();

    maps.forEach((m, idx) => {
      const summary = storage.getMapSummary(m.id, levelManager.getLevelsByMap(m.id));
      const card = document.createElement('article');
      card.className = `world-card card-${m.id}`;
      card.setAttribute('aria-label', `${m.name} map`);
      card.tabIndex = 0;

      const mapNum = String(idx + 1).padStart(2, '0');
      card.innerHTML = `
        <div class="world-card-image-wrap">
          ${MapIllustrations.getMapIllustration(m.id)}
          <div class="world-card-badge">MAP ${mapNum}</div>
        </div>
        <div class="world-card-content">
          <div class="world-card-header-row">
            <h3 class="world-card-title">${m.name}</h3>
            <span class="world-diff-tag">${m.difficultyRange}</span>
          </div>
          <p class="world-card-subtitle">${m.subtitle}</p>
          <div class="world-card-footer-row">
            <span class="world-progress-badge">${summary.completedCount} / 5 completed</span>
            <button class="btn-play-map" data-map="${m.id}" aria-label="Play ${m.name}">PLAY ▶</button>
          </div>
        </div>
      `;

      const handleSelect = () => {
        audio.init();
        audio.playMove();
        switchView('levels', { mapId: m.id });
      };

      const playBtn = card.querySelector('.btn-play-map');
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSelect();
      });

      card.addEventListener('click', handleSelect);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      });

      worldsGridContainer.appendChild(card);
    });
  }

  // =========================================================================
  // RENDER: VIEW 2 (CIRCULAR LEVEL PROGRESSION MAP)
  // =========================================================================

  function renderLevelsView(mapId) {
    const mapInfo = levelManager.getMap(mapId);
    levelsMapTitle.textContent = mapInfo.name;
    levelsMapSubtitle.textContent = mapInfo.subtitle;

    const mapLevels = levelManager.getLevelsByMap(mapId);
    const progress = storage.getMapProgress(mapId);
    const config = MapIllustrations.getProgressionMapConfig(mapId);

    // 1. Render SVG Background Path
    progressionSvgBg.innerHTML = config.pathSvg;

    // 2. Clear & Render Circular Nodes
    progressionNodesContainer.innerHTML = '';

    // Determine initial recommended or default level
    let defaultLvlNum = 1;
    for (let i = 1; i <= 5; i++) {
      if (storage.isLevelUnlocked(mapId, i) && !progress.completed.includes(i)) {
        defaultLvlNum = i;
        break;
      }
    }
    if (progress.completed.length >= 5) {
      defaultLvlNum = 1;
    }
    selectedNodeLevelNumber = defaultLvlNum;

    function updateSelectedLevelCard(lvlNum) {
      selectedNodeLevelNumber = lvlNum;
      const lvl = levelManager.getLevel(mapId, lvlNum);
      if (!lvl) return;

      const isUnlocked = storage.isLevelUnlocked(mapId, lvlNum);
      const isCompleted = progress.completed.includes(lvlNum);
      const pb = storage.getPersonalBest(lvl.id);

      slcBadge.textContent = `LEVEL 0${lvl.levelNumber}`;
      slcTitle.textContent = lvl.name;
      slcDesc.textContent = lvl.subtitle || lvl.description;
      slcDiff.textContent = lvl.difficulty;
      slcPar.textContent = `${lvl.parMoves} moves`;

      if (pb) {
        slcBest.textContent = `${pb.score.toLocaleString()} pts (${pb.actions} actions)`;
        slcBest.className = 'slc-stat-val text-accent';
      } else if (isUnlocked) {
        slcBest.textContent = 'READY TO PLAY';
        slcBest.className = 'slc-stat-val text-success';
      } else {
        slcBest.textContent = 'LOCKED 🔒';
        slcBest.className = 'slc-stat-val text-danger';
      }

      btnPlaySelectedLevel.disabled = !isUnlocked;
      btnPlaySelectedLevel.textContent = !isUnlocked ? 'LOCKED' : (isCompleted ? 'REPLAY LEVEL ▶' : 'PLAY LEVEL ▶');

      // Update active styling on nodes
      const allNodes = progressionNodesContainer.querySelectorAll('.progression-node-btn');
      allNodes.forEach((btn) => {
        const num = parseInt(btn.dataset.lvl, 10);
        btn.classList.toggle('selected-node', num === lvlNum);
      });
    }

    mapLevels.forEach((lvl, idx) => {
      const isUnlocked = storage.isLevelUnlocked(mapId, lvl.levelNumber);
      const isCompleted = progress.completed.includes(lvl.levelNumber);
      const isRecommended = isUnlocked && !isCompleted && (lvl.levelNumber === progress.unlockedLevel);
      const coord = config.nodeCoords[idx] || { x: 20 * idx, y: 50 };
      const pb = storage.getPersonalBest(lvl.id);

      const nodeBtn = document.createElement('button');
      nodeBtn.dataset.lvl = String(lvl.levelNumber);

      let statusClass = 'status-locked';
      if (isUnlocked) statusClass = 'status-unlocked';
      if (isCompleted) statusClass = 'status-completed';
      if (isRecommended) statusClass = 'status-recommended';

      nodeBtn.className = `progression-node-btn ${statusClass} ${lvl.levelNumber === selectedNodeLevelNumber ? 'selected-node' : ''}`;
      nodeBtn.style.left = `${coord.x}%`;
      nodeBtn.style.top = `${coord.y}%`;
      nodeBtn.setAttribute('aria-label', `Level ${lvl.levelNumber}: ${lvl.name}`);
      nodeBtn.title = `${lvl.name} (${lvl.difficulty})`;

      let innerContent = `<span class="node-num">${lvl.levelNumber}</span>`;
      let badgeHtml = '';

      if (isCompleted) {
        innerContent = `<span class="node-icon">★</span>`;
        if (pb) {
          badgeHtml = `<div class="node-score-tag">${pb.score.toLocaleString()}</div>`;
        }
      } else if (!isUnlocked) {
        innerContent = `<span class="node-lock-icon">🔒</span>`;
      } else if (isRecommended) {
        badgeHtml = `<div class="node-play-next-tag">PLAY NEXT</div>`;
      }

      nodeBtn.innerHTML = `
        <div class="node-halo-ring"></div>
        <div class="node-inner-circle">
          ${innerContent}
        </div>
        <div class="node-label-plate">
          <span class="nlp-name">${lvl.name}</span>
          ${badgeHtml}
        </div>
      `;

      nodeBtn.addEventListener('click', () => {
        audio.init();
        audio.playMove();
        updateSelectedLevelCard(lvl.levelNumber);
        if (isUnlocked && selectedNodeLevelNumber === lvl.levelNumber) {
          // Quick double-tap start
        }
      });

      progressionNodesContainer.appendChild(nodeBtn);
    });

    // Wire up Selected Level Card play button
    btnPlaySelectedLevel.onclick = () => {
      audio.init();
      audio.playMove();
      switchView('game', { mapId, levelNumber: selectedNodeLevelNumber });
    };

    // Initialize selection on recommended or first level
    updateSelectedLevelCard(selectedNodeLevelNumber);
  }

  // =========================================================================
  // RENDER: VIEW 3 (GAME ARENA HUD & BREADCRUMBS)
  // =========================================================================

  function updateGameUI() {
    if (!gameState.levelData) return;

    // Breadcrumbs
    const mapInfo = levelManager.getMap(gameState.currentMapId);
    crumbMapName.textContent = mapInfo ? mapInfo.name : 'WORLD';
    crumbLevelName.textContent = `LEVEL ${gameState.currentLevelNumber}: ${gameState.levelData.name}`;

    // Header HUD Stats
    hudLevel.textContent = `0${gameState.currentLevelNumber} / 05`;
    hudActions.textContent = String(gameState.scoringActions);

    const isAlpha = gameState.realm === 'alpha';
    hudRealm.textContent = isAlpha ? 'ALPHA' : 'OMEGA';
    hudRealm.className = `realm-badge ${isAlpha ? 'realm-alpha' : 'realm-omega'}`;

    // Streak
    const currentStreak = storage.getActiveStreak(gameState.currentMapId);
    hudStreak.textContent = String(currentStreak);

    // Objectives status
    if (objPlateA) {
      objPlateA.className = `obj-item ${gameState.plateAActive ? 'status-active' : 'status-pending'}`;
      const statusA = objPlateA.querySelector('.obj-status');
      if (statusA) statusA.textContent = gameState.plateAActive ? 'LOCKED' : 'ARMING';
    }
    if (objPlateB) {
      objPlateB.className = `obj-item ${gameState.plateBActive ? 'status-active' : 'status-pending'}`;
      const statusB = objPlateB.querySelector('.obj-status');
      if (statusB) statusB.textContent = gameState.plateBActive ? 'LOCKED' : 'ARMING';
    }
    if (objExit) {
      objExit.className = `obj-item ${gameState.platesActive ? 'status-active' : 'status-pending'}`;
      const statusExit = objExit.querySelector('.obj-status');
      if (statusExit) statusExit.textContent = gameState.platesActive ? 'UNLOCKED' : 'SEALED';
    }

    // Field intel
    if (fieldIntel) {
      fieldIntel.textContent = gameState.levelData.hint || 'Contain both crates on the dual pressure plates.';
    }
    if (intelParMoves) {
      intelParMoves.textContent = String(gameState.levelData.parMoves);
    }
  }

  function updateTimerUI(seconds) {
    if (hudTimer) {
      hudTimer.textContent = formatTime(seconds);
    }
  }

  // Hook GameState Events
  gameState.on('stateChange', (data) => {
    if (data.type === 'timer') {
      updateTimerUI(data.seconds);
    } else {
      updateGameUI();
      if (data.type === 'undo') {
        announce('Move undone. Restored previous grid position. Attempt scoring actions preserved.');
      }
    }
  });

  gameState.on('moveReject', (data) => {
    announce(data.reason);
  });

  gameState.on('phaseShift', (data) => {
    updateGameUI();
    announce(`Phase shift engaged. Active dimension is now ${data.to.toUpperCase()}.`);
  });

  gameState.on('plateTriggered', () => {
    audio.playPlateActivated();
    updateGameUI();
    announce('Containment lock achieved! Dual pressure plates armed. Extraction gateway unlocked.');
  });

  gameState.on('victory', (data) => {
    audio.playVictory();
    showVictoryModal(data);
    announce(`Sector Cleared! Final score: ${data.scoreResult.totalScore}. Rating: ${data.scoreResult.stars} stars.`);
  });

  // =========================================================================
  // MODALS & COMPLETION FLOWS
  // =========================================================================

  function showVictoryModal(data) {
    input.setEnabled(false);

    // Stars
    let starsHtml = '';
    for (let i = 1; i <= 3; i++) {
      starsHtml += `<span class="star-icon ${i <= data.scoreResult.stars ? 'filled' : 'empty'}">★</span>`;
    }
    victoryStars.innerHTML = starsHtml;

    // Score & record
    victoryScoreTotal.textContent = data.scoreResult.totalScore.toLocaleString();
    victoryRecordBadge.style.display = data.recordResult.isNewPersonalBest ? 'inline-block' : 'none';

    // Breakdown
    breakdownMovePts.textContent = `+${data.scoreResult.movePoints} pts`;
    victoryActualActions.textContent = String(data.scoringActions);
    victoryParMoves.textContent = String(data.parMoves);

    breakdownTimePts.textContent = `+${data.scoreResult.timePoints} pts`;
    victoryElapsedTime.textContent = formatTime(data.time);
    victoryTargetTime.textContent = `${data.targetTime}s`;

    breakdownStreakPts.textContent = `+${data.scoreResult.streakBonus} pts`;
    victoryStreakCount.textContent = String(data.streak);

    if (data.scoreResult.stars === 3) {
      victoryMessage.textContent = 'Flawless efficiency! Optimal par achieved.';
    } else if (data.scoreResult.stars === 2) {
      victoryMessage.textContent = 'Solid execution. Replay to optimize move efficiency.';
    } else {
      victoryMessage.textContent = 'Containment secured. Shorter routes will yield higher scores.';
    }

    // Auto-populate exact level's local top 5 leaderboard
    if (victoryLbTitleName) {
      victoryLbTitleName.textContent = `${data.levelName.toUpperCase()} (LEVEL 0${data.levelNumber})`;
    }
    if (victoryLbTbody) {
      victoryLbTbody.innerHTML = '';
      const records = storage.getLeaderboard(data.levelId);
      if (records.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" style="text-align:center; padding: 12px; color: var(--text-secondary);">No prior records logged. First score posted!</td>`;
        victoryLbTbody.appendChild(tr);
      } else {
        records.forEach((rec, idx) => {
          const tr = document.createElement('tr');
          const isCurrentRun = rec.score === data.scoreResult.totalScore &&
                               rec.actions === data.scoringActions &&
                               rec.time === data.time;
          if (isCurrentRun) {
            tr.className = 'highlight-current-run';
          }
          const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#0${idx + 1}`;
          tr.innerHTML = `
            <td><strong>${rankMedal}</strong></td>
            <td><strong style="color: ${isCurrentRun ? 'var(--alpha)' : 'inherit'};">${rec.callsign} ${isCurrentRun ? '<span class="you-badge">YOU</span>' : ''}</strong></td>
            <td><strong style="color: #FFFFFF;">${rec.score.toLocaleString()}</strong></td>
            <td>${rec.actions}</td>
            <td>${formatTime(rec.time)}</td>
            <td><span class="text-success">+${rec.streak}</span></td>
          `;
          victoryLbTbody.appendChild(tr);
        });
      }
    }

    // Button labels
    const isLastLevelOfMap = data.levelNumber >= 5;
    btnVictoryNext.textContent = isLastLevelOfMap ? 'CHOOSE ANOTHER MAP ▶' : 'NEXT LEVEL ▶';
    btnVictoryLevelSelect.textContent = 'LEVEL MAP';
    btnVictoryReplay.textContent = 'REPLAY LEVEL';

    modalVictory.classList.add('visible');
    modalVictory.setAttribute('aria-hidden', 'false');
  }

  btnVictoryReplay.addEventListener('click', () => {
    modalVictory.classList.remove('visible');
    modalVictory.setAttribute('aria-hidden', 'true');
    input.setEnabled(true);
    gameState.resetCurrentLevel();
  });

  btnVictoryLevelSelect.addEventListener('click', () => {
    modalVictory.classList.remove('visible');
    modalVictory.setAttribute('aria-hidden', 'true');
    switchView('levels', { mapId: gameState.currentMapId });
  });

  btnVictoryNext.addEventListener('click', () => {
    modalVictory.classList.remove('visible');
    modalVictory.setAttribute('aria-hidden', 'true');

    if (gameState.currentLevelNumber >= 5) {
      // Completed map! Show World Cleared modal
      showWorldCompleteModal(gameState.currentMapId);
    } else {
      // Advance to next level
      switchView('game', {
        mapId: gameState.currentMapId,
        levelNumber: gameState.currentLevelNumber + 1
      });
    }
  });

  function showWorldCompleteModal(mapId) {
    const mapInfo = levelManager.getMap(mapId);
    const summary = storage.getMapSummary(mapId, levelManager.getLevelsByMap(mapId));

    wcMapName.textContent = mapInfo.name;
    wcTotalScore.textContent = summary.totalScore.toLocaleString();
    wcBestStreak.textContent = String(summary.bestStreak);

    modalWorldComplete.classList.add('visible');
    modalWorldComplete.setAttribute('aria-hidden', 'false');

    // Check if ALL 15 levels are complete!
    const allMaps = levelManager.getMaps();
    const allFinished = allMaps.every((m) => {
      const prog = storage.getMapProgress(m.id);
      return prog.completed.length >= 5;
    });

    if (allFinished) {
      setTimeout(() => {
        modalWorldComplete.classList.remove('visible');
        showMasterCompleteModal();
      }, 2500);
    }
  }

  function showMasterCompleteModal() {
    let grandTotal = 0;
    levelManager.getAllLevels().forEach((lvl) => {
      const pb = storage.getPersonalBest(lvl.id);
      if (pb) grandTotal += pb.score;
    });
    masterGrandScore.textContent = grandTotal.toLocaleString();
    modalMasterComplete.classList.add('visible');
    modalMasterComplete.setAttribute('aria-hidden', 'false');
  }

  btnMasterClose.addEventListener('click', () => {
    modalMasterComplete.classList.remove('visible');
    modalMasterComplete.setAttribute('aria-hidden', 'true');
    switchView('worlds');
  });

  btnWcLeaderboard.addEventListener('click', () => {
    modalWorldComplete.classList.remove('visible');
    modalWorldComplete.setAttribute('aria-hidden', 'true');
    switchView('leaderboard', { mapId: gameState.currentMapId, levelNumber: 5 });
  });

  btnWcWorlds.addEventListener('click', () => {
    modalWorldComplete.classList.remove('visible');
    modalWorldComplete.setAttribute('aria-hidden', 'true');
    switchView('worlds');
  });

  // =========================================================================
  // RENDER: VIEW 4 (LEADERBOARD)
  // =========================================================================

  function renderLeaderboardView() {
    // Highlight world tab
    const tabs = lbWorldTabs.querySelectorAll('.lb-world-tab');
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.map === lbSelectedMapId);
    });

    // Highlight level pill
    const pills = lbLevelPills.querySelectorAll('.lb-level-pill');
    pills.forEach((pill) => {
      pill.classList.toggle('active', parseInt(pill.dataset.lvl, 10) === lbSelectedLevelNum);
    });

    const levelData = levelManager.getLevel(lbSelectedMapId, lbSelectedLevelNum);
    if (!levelData) return;

    // Personal Best Card
    const pb = storage.getPersonalBest(levelData.id);
    if (pb) {
      lbPbCard.innerHTML = `
        <div>
          <span style="font-size: 0.65rem; color: var(--text-secondary); font-family: var(--font-mono);">YOUR RECORD (${pb.callsign})</span>
          <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 800; color: #FFFFFF;">
            ${pb.score.toLocaleString()} <span style="font-size: 0.75rem; color: var(--alpha);">PTS</span>
          </div>
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.78rem; text-align: right; color: var(--text-secondary);">
          <div>Actions: <strong>${pb.actions}</strong> (Par: ${levelData.parMoves})</div>
          <div>Time: <strong>${formatTime(pb.time)}</strong> | Streak: <strong>${pb.streak}</strong></div>
        </div>
      `;
    } else {
      lbPbCard.innerHTML = `
        <div>
          <span style="font-size: 0.65rem; color: var(--text-secondary); font-family: var(--font-mono);">YOUR RECORD</span>
          <div style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 700; color: var(--text-secondary);">
            NO SECTOR RECORD YET
          </div>
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary);">
          Par: <strong>${levelData.parMoves} moves</strong> | Target: <strong>${levelData.targetTimeSeconds}s</strong>
        </div>
      `;
    }

    // Top 5 Table
    const records = storage.getLeaderboard(levelData.id);
    lbRecordsTbody.innerHTML = '';

    if (records.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 18px;">No local records logged for this sector yet. Clear it to set the first score!</td>`;
      lbRecordsTbody.appendChild(tr);
    } else {
      records.forEach((rec, idx) => {
        const tr = document.createElement('tr');
        const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#0${idx + 1}`;
        tr.innerHTML = `
          <td><strong>${rankMedal}</strong></td>
          <td><span style="color: ${idx === 0 ? 'var(--alpha)' : 'inherit'}; font-weight: 700;">${rec.callsign}</span></td>
          <td><strong style="color: #FFFFFF;">${rec.score.toLocaleString()}</strong></td>
          <td>${rec.actions}</td>
          <td>${formatTime(rec.time)}</td>
          <td><span class="text-success">+${rec.streak}</span></td>
          <td style="color: var(--text-secondary); font-size: 0.72rem;">${rec.date}</td>
        `;
        lbRecordsTbody.appendChild(tr);
      });
    }
  }

  // Leaderboard Tab Clicks
  lbWorldTabs.addEventListener('click', (e) => {
    if (e.target.dataset.map) {
      lbSelectedMapId = e.target.dataset.map;
      audio.playMove();
      renderLeaderboardView();
    }
  });

  lbLevelPills.addEventListener('click', (e) => {
    if (e.target.dataset.lvl) {
      lbSelectedLevelNum = parseInt(e.target.dataset.lvl, 10);
      audio.playMove();
      renderLeaderboardView();
    }
  });

  btnLbBack.addEventListener('click', () => {
    audio.playMove();
    switchView('levels', { mapId: lbSelectedMapId });
  });

  // Export / Import Backup JSON
  btnExportRecords.addEventListener('click', () => {
    const jsonStr = storage.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phaselock-local-records-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    announce('Local records backup exported successfully.');
  });

  btnImportRecords.addEventListener('click', () => {
    inputImportFile.click();
  });

  inputImportFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = storage.importJSON(event.target.result);
      if (res.success) {
        alert('Records backup successfully restored!');
        renderLeaderboardView();
      } else {
        alert(`Failed to import backup: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Wipe Records Confirmation
  btnResetScores.addEventListener('click', () => {
    modalWipeConfirm.classList.add('visible');
    modalWipeConfirm.setAttribute('aria-hidden', 'false');
  });

  btnCancelWipe.addEventListener('click', () => {
    modalWipeConfirm.classList.remove('visible');
    modalWipeConfirm.setAttribute('aria-hidden', 'true');
  });

  btnConfirmWipe.addEventListener('click', () => {
    storage.resetAllData();
    modalWipeConfirm.classList.remove('visible');
    modalWipeConfirm.setAttribute('aria-hidden', 'true');
    renderLeaderboardView();
    announce('All local records have been wiped.');
  });

  // =========================================================================
  // CALLSIGN PROFILE MODAL
  // =========================================================================

  function openCallsignModal() {
    input.setEnabled(false);
    inputCallsignField.value = storage.getCallsign();
    modalCallsign.classList.add('visible');
    modalCallsign.setAttribute('aria-hidden', 'false');
    inputCallsignField.focus();
  }

  function closeCallsignModal() {
    modalCallsign.classList.remove('visible');
    modalCallsign.setAttribute('aria-hidden', 'true');
    input.setEnabled(currentView === 'game');
  }

  btnProfileCallsign.addEventListener('click', openCallsignModal);
  btnCancelCallsign.addEventListener('click', closeCallsignModal);

  btnSaveCallsign.addEventListener('click', () => {
    const saved = storage.setCallsign(inputCallsignField.value);
    headerCallsign.textContent = saved;
    closeCallsignModal();
    if (currentView === 'leaderboard') renderLeaderboardView();
    announce(`Operator callsign updated to ${saved}.`);
  });

  // =========================================================================
  // MANUAL & AUDIO TOGGLE
  // =========================================================================

  btnHelp.addEventListener('click', () => {
    input.setEnabled(false);
    modalInstructions.classList.add('visible');
    modalInstructions.setAttribute('aria-hidden', 'false');
  });

  btnCloseInstructions.addEventListener('click', () => {
    modalInstructions.classList.remove('visible');
    modalInstructions.setAttribute('aria-hidden', 'true');
    input.setEnabled(currentView === 'game');
  });

  btnAudioToggle.addEventListener('click', () => {
    const isMuted = audio.toggleMute();
    storage.setAudioMuted(isMuted);
    btnAudioToggle.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
    btnAudioToggle.classList.toggle('muted', isMuted);
    audioIcon.innerHTML = isMuted ? SVG_AUDIO_OFF : SVG_AUDIO_ON;
  });

  // Navigation Buttons
  headerHomeBtn.addEventListener('click', () => {
    audio.playMove();
    if (currentView === 'worlds') {
      switchView('entrance');
    } else {
      switchView('worlds');
    }
  });

  btnLevelsBack.addEventListener('click', () => {
    audio.playMove();
    switchView('worlds');
  });

  btnOpenLeaderboardFromLevels.addEventListener('click', () => {
    audio.playMove();
    switchView('leaderboard', { mapId: activeMapId, levelNumber: 1 });
  });

  btnGameBackLevels.addEventListener('click', () => {
    audio.playMove();
    switchView('levels', { mapId: gameState.currentMapId });
  });

  btnGameToWorlds.addEventListener('click', () => {
    audio.playMove();
    switchView('worlds');
  });

  // Mobile virtual buttons
  const btnMobileShift = document.getElementById('btn-mobile-shift');
  if (btnMobileShift) {
    btnMobileShift.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      audio.init();
      const shiftBtn = document.getElementById('btn-action-shift');
      if (shiftBtn) shiftBtn.dispatchEvent(new Event('pointerdown'));
    });
  }

  const btnMobileUndo = document.getElementById('btn-mobile-undo');
  if (btnMobileUndo) {
    btnMobileUndo.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      audio.init();
      const undoBtn = document.getElementById('btn-action-undo');
      if (undoBtn) undoBtn.dispatchEvent(new Event('pointerdown'));
    });
  }

  const btnMobileReset = document.getElementById('btn-mobile-reset');
  if (btnMobileReset) {
    btnMobileReset.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      audio.init();
      const resetBtn = document.getElementById('btn-action-reset');
      if (resetBtn) resetBtn.dispatchEvent(new Event('pointerdown'));
    });
  }

  // Resize & Visibility
  window.addEventListener('resize', () => {
    if (currentView === 'game') {
      renderer.resize();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      gameState.pauseTimer();
    } else {
      gameState.resumeTimer();
      lastTimestamp = performance.now();
    }
  });

  // Main 60 FPS Render Loop
  function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    let dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    if (dt > 0.1) dt = 0.1;

    if (currentView === 'game') {
      renderer.update(dt);
      renderer.render();
    }

    requestAnimationFrame(gameLoop);
  }

  // Bootstrap
  function init() {
    headerCallsign.textContent = storage.getCallsign();
    const muted = storage.getAudioMuted();
    audio.setMute(muted);
    btnAudioToggle.setAttribute('aria-pressed', muted ? 'true' : 'false');
    btnAudioToggle.classList.toggle('muted', muted);
    audioIcon.innerHTML = muted ? SVG_AUDIO_OFF : SVG_AUDIO_ON;

    // Entrance Screen Click-to-Play
    function handleEntranceStart() {
      audio.init();
      audio.playVictory();
      switchView('worlds');
    }

    if (btnClickToPlay) {
      btnClickToPlay.addEventListener('click', handleEntranceStart);
    }

    if (viewEntrance) {
      viewEntrance.addEventListener('keydown', (e) => {
        if (currentView === 'entrance' && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleEntranceStart();
        }
      });
    }

    // Start on Entrance screen
    switchView('entrance');

    requestAnimationFrame(gameLoop);

    // Register service worker if supported
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('Service Worker registration skipped:', err);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
