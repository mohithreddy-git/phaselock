/**
 * Renderer - 60 FPS HTML5 Canvas Renderer for PHASE LOCK
 * Handles high-DPI retina scaling, delta-time lerp interpolation,
 * realm neon lighting, interactive game board, and tactical alternate-realm radar.
 */

class Renderer {
  constructor(canvas, gameState, particleEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gameState = gameState;
    this.particleEngine = particleEngine;

    // Grid geometry
    this.gridSize = 8;
    this.boardPixelSize = 0;
    this.cellSize = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dpr = 1;

    // Smooth visual positions (for 60 FPS lerp)
    this.playerVisual = { x: 1, y: 1, angle: 0 };
    this.blocksVisual = new Map(); // blockId -> { x, y }

    // Screen Shake (Trauma model)
    this.trauma = 0;
    this.maxShakeAngle = 0.04;
    this.maxShakeOffset = 8;

    // Glitch & Phase shift transition
    this.glitchTime = 0;
    this.glitchDuration = 0.18; // ~180ms
    this.phaseShiftFrom = 'alpha';
    this.phaseShiftTo = 'omega';

    // Animation time
    this.animTime = 0;

    // Radar Minimap options
    this.showRadar = true;

    // Reduced motion flag
    this.reducedMotion = false;
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = mq.matches;
      mq.addEventListener('change', e => { this.reducedMotion = e.matches; });
    }

    this._setupStateHooks();
    this.resize();
  }

  _setupStateHooks() {
    this.gameState.on('moveReject', (data) => {
      this.addTrauma(0.55);
      const px = this.offsetX + (data.x + 0.5) * this.cellSize;
      const py = this.offsetY + (data.y + 0.5) * this.cellSize;
      this.particleEngine.emitRejection(px, py);
    });

    this.gameState.on('phaseShift', (data) => {
      this.glitchTime = this.glitchDuration;
      this.phaseShiftFrom = data.from;
      this.phaseShiftTo = data.to;
      const px = this.offsetX + (data.player.x + 0.5) * this.cellSize;
      const py = this.offsetY + (data.player.y + 0.5) * this.cellSize;
      const c1 = data.from === 'alpha' ? '#00F3FF' : '#FF007F';
      const c2 = data.to === 'alpha' ? '#00F3FF' : '#FF007F';
      this.particleEngine.emitPhaseShift(px, py, c1, c2);
    });

    this.gameState.on('plateTriggered', (data) => {
      const p1x = this.offsetX + (data.p1.x + 0.5) * this.cellSize;
      const p1y = this.offsetY + (data.p1.y + 0.5) * this.cellSize;
      const p2x = this.offsetX + (data.p2.x + 0.5) * this.cellSize;
      const p2y = this.offsetY + (data.p2.y + 0.5) * this.cellSize;
      this.particleEngine.emitPlateActivated(p1x, p1y, '#00F3FF');
      this.particleEngine.emitPlateActivated(p2x, p2y, '#FF007F');
    });

    this.gameState.on('stateChange', (data) => {
      if (data.type === 'levelLoaded' || data.type === 'reset') {
        this.syncVisualsInstant();
      }
    });
  }

  addTrauma(amount) {
    if (this.reducedMotion) return;
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  syncVisualsInstant() {
    this.playerVisual.x = this.gameState.player.x;
    this.playerVisual.y = this.gameState.player.y;
    this.blocksVisual.clear();
    for (const b of this.gameState.blocks) {
      this.blocksVisual.set(b.id, { x: b.x, y: b.y });
    }
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (width === 0 || height === 0) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.canvas.width = Math.floor(width * this.dpr);
    this.canvas.height = Math.floor(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Compute square board geometry
    const padding = 20;
    const availableSize = Math.min(width - padding * 2, height - padding * 2);
    this.boardPixelSize = Math.max(260, Math.min(availableSize, 640));
    this.cellSize = this.boardPixelSize / this.gridSize;

    this.offsetX = Math.floor((width - this.boardPixelSize) / 2);
    this.offsetY = Math.floor((height - this.boardPixelSize) / 2);
  }

  update(dt) {
    this.animTime += dt;

    // Decay trauma
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.2);
    }

    // Decay glitch
    if (this.glitchTime > 0) {
      this.glitchTime = Math.max(0, this.glitchTime - dt);
    }

    // Smooth Lerp for player visual position
    const lerpSpeed = 16 * dt; // fast, responsive ease
    const dx = this.gameState.player.x - this.playerVisual.x;
    const dy = this.gameState.player.y - this.playerVisual.y;
    this.playerVisual.x += dx * Math.min(1.0, lerpSpeed);
    this.playerVisual.y += dy * Math.min(1.0, lerpSpeed);

    // Calculate facing angle for player drone
    if (Math.abs(dx) > 0.02 || Math.abs(dy) > 0.02) {
      this.playerVisual.angle = Math.atan2(dy, dx);
    }

    // Smooth Lerp for blocks
    for (const b of this.gameState.blocks) {
      if (!this.blocksVisual.has(b.id)) {
        this.blocksVisual.set(b.id, { x: b.x, y: b.y });
      }
      const bv = this.blocksVisual.get(b.id);
      bv.x += (b.x - bv.x) * Math.min(1.0, lerpSpeed);
      bv.y += (b.y - bv.y) * Math.min(1.0, lerpSpeed);
    }

    // Ambient particle generation
    const realmColor = this.gameState.realm === 'alpha' ? '#00F3FF' : '#FF007F';
    this.particleEngine.spawnAmbient(this.canvas.width / this.dpr, this.canvas.height / this.dpr, realmColor);
    this.particleEngine.update(dt);
  }

  render() {
    const ctx = this.ctx;
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;

    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // Clear background
    ctx.fillStyle = '#0B0D17';
    ctx.fillRect(0, 0, width, height);

    // Apply Screen Shake
    if (this.trauma > 0 && !this.reducedMotion) {
      const shakePower = this.trauma * this.trauma;
      const shakeX = (Math.random() * 2 - 1) * this.maxShakeOffset * shakePower;
      const shakeY = (Math.random() * 2 - 1) * this.maxShakeOffset * shakePower;
      const shakeRot = (Math.random() * 2 - 1) * this.maxShakeAngle * shakePower;
      ctx.translate(shakeX, shakeY);
      ctx.translate(width / 2, height / 2);
      ctx.rotate(shakeRot);
      ctx.translate(-width / 2, -height / 2);
    }

    // Glitch chromatic displacement during phase shift
    if (this.glitchTime > 0 && !this.reducedMotion) {
      const glitchIntensity = (this.glitchTime / this.glitchDuration) * 6;
      ctx.translate((Math.random() - 0.5) * glitchIntensity, (Math.random() - 0.5) * glitchIntensity);
    }

    // Draw game elements
    this._drawBoardBackground(ctx);
    this._drawGridLines(ctx);
    this._drawPressurePlates(ctx);
    this._drawExitGate(ctx);
    this._drawWalls(ctx);
    this._drawBlocks(ctx);
    this._drawPlayer(ctx);

    // Particles render
    this.particleEngine.render(ctx);

    // Radar Minimap (Tactical Alternate Realm View)
    if (this.showRadar) {
      this._drawRadarMinimap(ctx, width, height);
    }

    // Glitch flash scanline
    if (this.glitchTime > 0 && !this.reducedMotion) {
      const alpha = (this.glitchTime / this.glitchDuration) * 0.35;
      ctx.fillStyle = this.phaseShiftTo === 'alpha' ? `rgba(0, 243, 255, ${alpha})` : `rgba(255, 0, 127, ${alpha})`;
      ctx.fillRect(this.offsetX, this.offsetY, this.boardPixelSize, this.boardPixelSize);
    }

    ctx.restore();
  }

  _drawBoardBackground(ctx) {
    const isAlpha = this.gameState.realm === 'alpha';
    const mapId = this.gameState.currentMapId || 'neon';
    let glowColor = isAlpha ? 'rgba(0, 243, 255, 0.08)' : 'rgba(255, 0, 127, 0.08)';
    let strokeColor = isAlpha ? 'rgba(0, 243, 255, 0.35)' : 'rgba(255, 0, 127, 0.35)';
    let bgColor = '#111729';

    if (mapId === 'quantum') {
      glowColor = isAlpha ? 'rgba(0, 255, 204, 0.09)' : 'rgba(168, 85, 247, 0.09)';
      strokeColor = isAlpha ? 'rgba(0, 255, 204, 0.4)' : 'rgba(168, 85, 247, 0.4)';
      bgColor = '#0a0e1a';
    } else if (mapId === 'void') {
      glowColor = isAlpha ? 'rgba(192, 132, 252, 0.09)' : 'rgba(251, 191, 36, 0.09)';
      strokeColor = isAlpha ? 'rgba(192, 132, 252, 0.4)' : 'rgba(251, 191, 36, 0.4)';
      bgColor = '#0e0b1f';
    }

    // Board container background
    ctx.fillStyle = bgColor;
    ctx.fillRect(this.offsetX, this.offsetY, this.boardPixelSize, this.boardPixelSize);

    // Ambient Board Glow Outline
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.offsetX, this.offsetY, this.boardPixelSize, this.boardPixelSize);

    // Vignette / subtle radial fill inside board
    const cx = this.offsetX + this.boardPixelSize / 2;
    const cy = this.offsetY + this.boardPixelSize / 2;
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, this.boardPixelSize * 0.7);
    grad.addColorStop(0, glowColor);
    grad.addColorStop(1, 'rgba(11, 13, 23, 0.65)');
    ctx.fillStyle = grad;
    ctx.fillRect(this.offsetX, this.offsetY, this.boardPixelSize, this.boardPixelSize);
  }

  _drawGridLines(ctx) {
    ctx.save();
    const mapId = this.gameState.currentMapId || 'neon';
    let lineStroke = 'rgba(166, 185, 230, 0.09)';
    if (mapId === 'quantum') {
      lineStroke = 'rgba(0, 255, 204, 0.08)';
    } else if (mapId === 'void') {
      lineStroke = 'rgba(192, 132, 252, 0.08)';
    }

    ctx.strokeStyle = lineStroke;
    ctx.lineWidth = 1;

    for (let i = 0; i <= this.gridSize; i++) {
      const pos = i * this.cellSize;
      // Verticals
      ctx.beginPath();
      ctx.moveTo(this.offsetX + pos, this.offsetY);
      ctx.lineTo(this.offsetX + pos, this.offsetY + this.boardPixelSize);
      ctx.stroke();

      // Horizontals
      ctx.beginPath();
      ctx.moveTo(this.offsetX, this.offsetY + pos);
      ctx.lineTo(this.offsetX + this.boardPixelSize, this.offsetY + pos);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawPressurePlates(ctx) {
    if (!this.gameState.plates) return;
    const isAlpha = this.gameState.realm === 'alpha';
    const time = this.animTime;

    this.gameState.plates.forEach((p, idx) => {
      const px = this.offsetX + p.x * this.cellSize;
      const py = this.offsetY + p.y * this.cellSize;
      const cx = px + this.cellSize / 2;
      const cy = py + this.cellSize / 2;
      const isOccupied = this.gameState.blocks.some(b => b.x === p.x && b.y === p.y);

      ctx.save();
      const baseColor = idx === 0 ? '#00F3FF' : '#FF007F';

      if (isOccupied) {
        // Active pulsing state
        const pulse = Math.sin(time * 6) * 2;
        ctx.fillStyle = idx === 0 ? 'rgba(0, 243, 255, 0.22)' : 'rgba(255, 0, 127, 0.22)';
        ctx.fillRect(px + 4, py + 4, this.cellSize - 8, this.cellSize - 8);

        ctx.strokeStyle = '#80FFB0'; // Success green accent on locked plates
        ctx.shadowColor = '#80FFB0';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.5;

        // Outer bracket
        ctx.strokeRect(px + 6, py + 6, this.cellSize - 12, this.cellSize - 12);

        // Core energy glyph
        ctx.beginPath();
        ctx.arc(cx, cy, (this.cellSize / 4) + pulse, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Inactive hollow state
        ctx.strokeStyle = baseColor;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 1.5;

        // Subtle corner brackets
        const bSize = this.cellSize * 0.22;
        const pad = 8;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(px + pad, py + pad + bSize);
        ctx.lineTo(px + pad, py + pad);
        ctx.lineTo(px + pad + bSize, py + pad);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(px + this.cellSize - pad, py + this.cellSize - pad - bSize);
        ctx.lineTo(px + this.cellSize - pad, py + this.cellSize - pad);
        ctx.lineTo(px + this.cellSize - pad - bSize, py + this.cellSize - pad);
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(cx, cy, this.cellSize * 0.18, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  _drawExitGate(ctx) {
    if (!this.gameState.exit) return;
    const ex = this.offsetX + this.gameState.exit.x * this.cellSize;
    const ey = this.offsetY + this.gameState.exit.y * this.cellSize;
    const cx = ex + this.cellSize / 2;
    const cy = ey + this.cellSize / 2;
    const isOpen = this.gameState.platesActive;
    const time = this.animTime;

    ctx.save();
    if (isOpen) {
      // Unlocked Gateway Vortex
      const pulse = Math.sin(time * 5) * 3;
      const rot = time * 2;

      ctx.fillStyle = 'rgba(128, 255, 176, 0.18)';
      ctx.fillRect(ex + 4, ey + 4, this.cellSize - 8, this.cellSize - 8);

      ctx.strokeStyle = '#80FFB0';
      ctx.shadowColor = '#80FFB0';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.5;

      // Outer gate frame
      ctx.strokeRect(ex + 4, ey + 4, this.cellSize - 8, this.cellSize - 8);

      // Rotating portal rings
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.arc(0, 0, (this.cellSize * 0.3) + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(-rot * 2);
      ctx.strokeStyle = '#00F3FF';
      ctx.beginPath();
      ctx.strokeRect(-this.cellSize * 0.16, -this.cellSize * 0.16, this.cellSize * 0.32, this.cellSize * 0.32);
      ctx.restore();
    } else {
      // Locked Security Shield
      ctx.fillStyle = 'rgba(255, 82, 110, 0.08)';
      ctx.fillRect(ex + 4, ey + 4, this.cellSize - 8, this.cellSize - 8);

      ctx.strokeStyle = 'rgba(255, 82, 110, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(ex + 6, ey + 6, this.cellSize - 12, this.cellSize - 12);

      // Warning crossbars
      ctx.beginPath();
      ctx.moveTo(ex + 10, ey + 10);
      ctx.lineTo(ex + this.cellSize - 10, ey + this.cellSize - 10);
      ctx.moveTo(ex + this.cellSize - 10, ey + 10);
      ctx.lineTo(ex + 10, ey + this.cellSize - 10);
      ctx.stroke();

      // Padlock / Barrier icon
      ctx.fillStyle = '#FF526E';
      ctx.beginPath();
      ctx.arc(cx, cy - 3, 5, Math.PI, 0, false);
      ctx.stroke();
      ctx.fillRect(cx - 5, cy - 2, 10, 8);
    }
    ctx.restore();
  }

  _drawWalls(ctx) {
    if (!this.gameState.levelData) return;
    const isAlpha = this.gameState.realm === 'alpha';
    const walls = isAlpha ? this.gameState.levelData.alphaWalls : this.gameState.levelData.omegaWalls;
    const mapId = this.gameState.currentMapId || 'neon';
    let accent = isAlpha ? '#00F3FF' : '#FF007F';

    if (mapId === 'quantum') {
      accent = isAlpha ? '#00FFCC' : '#A855F7';
    } else if (mapId === 'void') {
      accent = isAlpha ? '#C084FC' : '#FBBF24';
    }

    ctx.save();
    for (const w of walls) {
      const wx = this.offsetX + w.x * this.cellSize;
      const wy = this.offsetY + w.y * this.cellSize;
      const center = this.cellSize / 2;

      if (mapId === 'quantum') {
        // CRYSTAL CAVES: Crystalline rock formation with glowing mineral facets
        ctx.fillStyle = '#0d1624';
        ctx.fillRect(wx + 2, wy + 2, this.cellSize - 4, this.cellSize - 4);

        // Jagged Crystal Core
        ctx.fillStyle = '#09101d';
        ctx.beginPath();
        ctx.moveTo(wx + center, wy + 5);
        ctx.lineTo(wx + this.cellSize - 5, wy + center);
        ctx.lineTo(wx + center, wy + this.cellSize - 5);
        ctx.lineTo(wx + 5, wy + center);
        ctx.closePath();
        ctx.fill();

        // Crystal facet neon edge
        ctx.strokeStyle = accent;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Facet refraction cross
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx + center, wy + 6);
        ctx.lineTo(wx + center, wy + this.cellSize - 6);
        ctx.moveTo(wx + 6, wy + center);
        ctx.lineTo(wx + this.cellSize - 6, wy + center);
        ctx.stroke();
      } else if (mapId === 'void') {
        // SKY ISLANDS: Celestial runic monolith with ancient trims
        ctx.fillStyle = '#17102b';
        ctx.fillRect(wx + 2, wy + 2, this.cellSize - 4, this.cellSize - 4);

        // Inner rune stone
        ctx.fillStyle = '#0f0a1c';
        ctx.fillRect(wx + 5, wy + 5, this.cellSize - 10, this.cellSize - 10);

        // Golden/Violet Celestial Rim Glow
        ctx.strokeStyle = accent;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.8;
        ctx.strokeRect(wx + 3, wy + 3, this.cellSize - 6, this.cellSize - 6);

        // Star Rune Glyph
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        // Diamond star
        ctx.moveTo(wx + center, wy + center - 5);
        ctx.lineTo(wx + center + 4, wy + center);
        ctx.lineTo(wx + center, wy + center + 5);
        ctx.lineTo(wx + center - 4, wy + center);
        ctx.closePath();
        ctx.stroke();
      } else {
        // NEON CITY: Cyberpunk skyscraper block with illuminated windows
        ctx.fillStyle = '#191F35';
        ctx.fillRect(wx + 2, wy + 2, this.cellSize - 4, this.cellSize - 4);

        // Inner tech core
        ctx.fillStyle = '#111729';
        ctx.fillRect(wx + 6, wy + 6, this.cellSize - 12, this.cellSize - 12);

        // Neon Rim Glow
        ctx.strokeStyle = accent;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 7;
        ctx.lineWidth = 1.6;
        ctx.strokeRect(wx + 3, wy + 3, this.cellSize - 6, this.cellSize - 6);

        // High-tech internal glyph / windows
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(241, 245, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx + center - 4, wy + center);
        ctx.lineTo(wx + center + 4, wy + center);
        ctx.moveTo(wx + center, wy + center - 4);
        ctx.lineTo(wx + center, wy + center + 4);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  _drawBlocks(ctx) {
    if (!this.gameState.blocks) return;
    const isAlpha = this.gameState.realm === 'alpha';
    const primaryAccent = isAlpha ? '#00F3FF' : '#FF007F';

    ctx.save();
    for (const b of this.gameState.blocks) {
      const bv = this.blocksVisual.get(b.id) || { x: b.x, y: b.y };
      const bx = this.offsetX + bv.x * this.cellSize;
      const by = this.offsetY + bv.y * this.cellSize;
      const cx = bx + this.cellSize / 2;
      const cy = by + this.cellSize / 2;

      // Check if on pressure plate
      const onPlate = this.gameState.plates.some(p => p.x === b.x && p.y === b.y);

      // Block Base
      ctx.fillStyle = onPlate ? '#1b2c3a' : '#1e2438';
      ctx.fillRect(bx + 5, by + 5, this.cellSize - 10, this.cellSize - 10);

      // Neon outline
      ctx.strokeStyle = onPlate ? '#80FFB0' : primaryAccent;
      ctx.shadowColor = onPlate ? '#80FFB0' : primaryAccent;
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.2;
      ctx.strokeRect(bx + 6, by + 6, this.cellSize - 12, this.cellSize - 12);

      // Cyber Crate Bevel
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(241, 245, 255, 0.4)';
      ctx.lineWidth = 1.2;
      const inset = 11;
      ctx.strokeRect(bx + inset, by + inset, this.cellSize - inset * 2, this.cellSize - inset * 2);

      // Glowing Rune Core
      ctx.fillStyle = onPlate ? '#80FFB0' : primaryAccent;
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawPlayer(ctx) {
    const pv = this.playerVisual;
    const px = this.offsetX + pv.x * this.cellSize;
    const py = this.offsetY + pv.y * this.cellSize;
    const cx = px + this.cellSize / 2;
    const cy = py + this.cellSize / 2;
    const isAlpha = this.gameState.realm === 'alpha';
    const playerAccent = isAlpha ? '#00F3FF' : '#FF007F';
    const time = this.animTime;

    ctx.save();
    ctx.translate(cx, cy);

    // Orbital thruster ring
    const thrusterRadius = this.cellSize * 0.36;
    ctx.strokeStyle = isAlpha ? 'rgba(0, 243, 255, 0.35)' : 'rgba(255, 0, 127, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, thrusterRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Rotate player to facing angle
    ctx.rotate(pv.angle);

    // Drone Silhouette: Futuristic Triangular interceptor
    ctx.fillStyle = '#F1F5FF';
    ctx.shadowColor = playerAccent;
    ctx.shadowBlur = 12;

    const r = this.cellSize * 0.28;
    ctx.beginPath();
    ctx.moveTo(r, 0); // Nose pointing forward
    ctx.lineTo(-r * 0.75, r * 0.65);
    ctx.lineTo(-r * 0.35, 0); // Inverted thruster bay
    ctx.lineTo(-r * 0.75, -r * 0.65);
    ctx.closePath();
    ctx.fill();

    // Central Glowing Reactor Core
    ctx.fillStyle = playerAccent;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, 4.5 + Math.sin(time * 8) * 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawRadarMinimap(ctx, width, height) {
    if (!this.gameState.levelData) return;
    const altRealm = this.gameState.realm === 'alpha' ? 'omega' : 'alpha';
    const altWalls = altRealm === 'alpha' ? this.gameState.levelData.alphaWalls : this.gameState.levelData.omegaWalls;
    const altColor = altRealm === 'alpha' ? '#00F3FF' : '#FF007F';

    // Position radar in the top-right corner of the canvas
    const radarSize = Math.max(90, Math.min(130, Math.floor(this.boardPixelSize * 0.26)));
    const radarPad = 14;
    const rx = width - radarSize - radarPad;
    const ry = radarPad;
    const rCell = radarSize / this.gridSize;

    ctx.save();

    // Background
    ctx.fillStyle = 'rgba(17, 23, 41, 0.88)';
    ctx.fillRect(rx, ry, radarSize, radarSize);

    // Frame
    ctx.strokeStyle = altColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = altColor;
    ctx.shadowBlur = 6;
    ctx.strokeRect(rx, ry, radarSize, radarSize);

    // Header label
    ctx.shadowBlur = 0;
    ctx.fillStyle = altColor;
    ctx.font = '9px monospace';
    ctx.fillText(`ALT [${altRealm.toUpperCase()}]`, rx + 5, ry + 11);

    // Alternate Walls (Holographic Ghost blocks)
    ctx.fillStyle = altRealm === 'alpha' ? 'rgba(0, 243, 255, 0.35)' : 'rgba(255, 0, 127, 0.35)';
    for (const w of altWalls) {
      ctx.fillRect(rx + w.x * rCell + 0.5, ry + w.y * rCell + 0.5, rCell - 1, rCell - 1);
    }

    // Shared Blocks in Radar
    ctx.fillStyle = '#F1F5FF';
    for (const b of this.gameState.blocks) {
      ctx.fillRect(rx + b.x * rCell + 1.5, ry + b.y * rCell + 1.5, rCell - 3, rCell - 3);
    }

    // Player position in Radar (Glowing dot)
    ctx.fillStyle = this.gameState.realm === 'alpha' ? '#00F3FF' : '#FF007F';
    ctx.beginPath();
    ctx.arc(rx + (this.gameState.player.x + 0.5) * rCell, ry + (this.gameState.player.y + 0.5) * rCell, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Renderer;
}
