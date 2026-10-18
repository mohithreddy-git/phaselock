/**
 * InputController - Multi-modal input coordinator for PHASE LOCK
 * Handles keyboard, direct touch/swipe actions on canvas, tap-to-move pointer,
 * on-screen action buttons, debouncing, and focus management.
 */

class InputController {
  constructor(gameState, audio, canvas = null, renderer = null) {
    this.gameState = gameState;
    this.audio = audio;
    this.canvas = canvas || (typeof document !== 'undefined' ? document.getElementById('game-canvas') : null);
    this.renderer = renderer;

    this.enabled = true;
    this.keysPressed = new Set();
    this.lastActionTime = 0;
    this.actionCooldownMs = 110; // Debounce threshold for rapid inputs

    // Touch / Swipe state tracking
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.hasMovedInTouch = false;
    this.swipeThreshold = 22; // Pixels required to trigger a swipe move
    this.lastTapTime = 0;

    // Bound listeners for cleanup
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onKeyUp = this._handleKeyUp.bind(this);
    this._onTouchStart = this._handlePointerDown.bind(this);
    this._onTouchMove = this._handlePointerMove.bind(this);
    this._onTouchEnd = this._handlePointerUp.bind(this);
    this._onTouchCancel = this._handlePointerCancel.bind(this);

    this.attach();
  }

  setRenderer(renderer) {
    this.renderer = renderer;
  }

  setCanvas(canvas) {
    if (this.canvas && this._boundCanvas) {
      this._detachCanvasListeners();
    }
    this.canvas = canvas;
    this._attachCanvasListeners();
  }

  attach() {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', this._onKeyDown, { passive: false });
    window.addEventListener('keyup', this._onKeyUp, { passive: true });

    this._attachCanvasListeners();
    this._attachActionButtons();
  }

  detach() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this._detachCanvasListeners();
    this.keysPressed.clear();
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
    if (!this.enabled) {
      this.keysPressed.clear();
      this.hasMovedInTouch = false;
    }
  }

  _isInputActive() {
    if (typeof document === 'undefined') return false;
    const active = document.activeElement;
    if (!active) return false;
    const tag = active.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || active.isContentEditable;
  }

  _handleKeyDown(e) {
    if (!this.enabled || this._isInputActive()) return;

    // Prevent default scrolling for game controls
    const scrollKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
    if (scrollKeys.includes(e.key) || scrollKeys.includes(e.code)) {
      e.preventDefault();
    }

    // Ignore duplicate continuous key repeats
    if (e.repeat) return;

    // Throttle rapid spam
    const now = Date.now();
    if (now - this.lastActionTime < this.actionCooldownMs) return;

    // Ensure audio starts on first user interaction
    this.audio.init();

    let handled = false;

    switch (e.key) {
      // Movement
      case 'ArrowUp':
      case 'w':
      case 'W':
        handled = true;
        this._executeMove(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        handled = true;
        this._executeMove(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        handled = true;
        this._executeMove(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        handled = true;
        this._executeMove(1, 0);
        break;

      // Phase Shift
      case ' ':
      case 'Spacebar':
      case 'Space':
        handled = true;
        this._executePhaseShift();
        break;

      // Undo
      case 'u':
      case 'U':
        handled = true;
        this._executeUndo();
        break;

      // Reset
      case 'r':
      case 'R':
        handled = true;
        this._executeReset();
        break;
    }

    if (handled) {
      this.lastActionTime = now;
    }
  }

  _handleKeyUp(e) {
    this.keysPressed.delete(e.key.toLowerCase());
  }

  _executeMove(dx, dy) {
    const success = this.gameState.move(dx, dy);
    if (success) {
      this.audio.playMove();
    } else {
      this.audio.playInvalid();
    }
  }

  _executePhaseShift() {
    const success = this.gameState.phaseShift();
    if (success) {
      this.audio.playPhaseShift();
    } else {
      this.audio.playInvalid();
    }
  }

  _executeUndo() {
    const success = this.gameState.undo();
    if (success) {
      this.audio.playMove();
    }
  }

  _executeReset() {
    this.gameState.resetCurrentLevel();
    this.audio.playMove();
  }

  // =========================================================================
  // TOUCH & SWIPE GESTURE CONTROLS (DIRECT CANVAS INTERACTION)
  // =========================================================================

  _attachCanvasListeners() {
    if (!this.canvas) {
      if (typeof document !== 'undefined') {
        this.canvas = document.getElementById('game-canvas');
      }
    }
    if (!this.canvas) return;

    const target = this.canvas;
    this._boundCanvas = target;

    // Use Pointer Events where supported, with touch-action: none
    target.style.touchAction = 'none';

    target.addEventListener('pointerdown', this._onTouchStart, { passive: false });
    window.addEventListener('pointermove', this._onTouchMove, { passive: false });
    window.addEventListener('pointerup', this._onTouchEnd, { passive: false });
    window.addEventListener('pointercancel', this._onTouchCancel, { passive: false });

    // Touch events fallback for older mobile engines
    target.addEventListener('touchstart', this._onTouchStart, { passive: false });
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    window.addEventListener('touchend', this._onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', this._onTouchCancel, { passive: false });
  }

  _detachCanvasListeners() {
    if (!this._boundCanvas) return;
    const target = this._boundCanvas;
    target.removeEventListener('pointerdown', this._onTouchStart);
    window.removeEventListener('pointermove', this._onTouchMove);
    window.removeEventListener('pointerup', this._onTouchEnd);
    window.removeEventListener('pointercancel', this._onTouchCancel);

    target.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('touchend', this._onTouchEnd);
    window.removeEventListener('touchcancel', this._onTouchCancel);
    this._boundCanvas = null;
  }

  _getClientCoordinates(e) {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  }

  _handlePointerDown(e) {
    if (!this.enabled) return;
    this.audio.init();

    const coords = this._getClientCoordinates(e);
    this.touchStartX = coords.clientX;
    this.touchStartY = coords.clientY;
    this.touchStartTime = Date.now();
    this.hasMovedInTouch = false;
  }

  _handlePointerMove(e) {
    if (!this.enabled || this.touchStartTime === 0) return;

    const coords = this._getClientCoordinates(e);
    const deltaX = coords.clientX - this.touchStartX;
    const deltaY = coords.clientY - this.touchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // If swipe threshold is met, move the pointer
    if (Math.max(absX, absY) >= this.swipeThreshold) {
      if (e.cancelable) {
        e.preventDefault();
      }

      const now = Date.now();
      if (now - this.lastActionTime >= this.actionCooldownMs) {
        if (absX >= absY) {
          // Horizontal swipe
          if (deltaX > 0) {
            this._executeMove(1, 0); // Right
          } else {
            this._executeMove(-1, 0); // Left
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            this._executeMove(0, 1); // Down
          } else {
            this._executeMove(0, -1); // Up
          }
        }

        this.lastActionTime = now;
        this.hasMovedInTouch = true;

        // Reset touch start anchor to enable fluid continuous swiping
        this.touchStartX = coords.clientX;
        this.touchStartY = coords.clientY;
      }
    }
  }

  _handlePointerUp(e) {
    if (!this.enabled || this.touchStartTime === 0) return;

    const coords = this._getClientCoordinates(e);
    const duration = Date.now() - this.touchStartTime;
    const deltaX = coords.clientX - this.touchStartX;
    const deltaY = coords.clientY - this.touchStartY;
    const totalDist = Math.hypot(deltaX, deltaY);

    // If finger didn't swipe and tap was brief, handle direct Tap-To-Move
    if (!this.hasMovedInTouch && duration < 380 && totalDist < 20) {
      const now = Date.now();

      // Double-tap anywhere on the canvas -> Phase Shift
      if (now - this.lastTapTime < 320) {
        this._executePhaseShift();
        this.lastTapTime = 0;
        this.touchStartTime = 0;
        return;
      }
      this.lastTapTime = now;

      this._handleCanvasTap(coords.clientX, coords.clientY);
    }

    this.touchStartTime = 0;
    this.hasMovedInTouch = false;
  }

  _handlePointerCancel() {
    this.touchStartTime = 0;
    this.hasMovedInTouch = false;
  }

  /**
   * Tapping directly on the board:
   * - Tap on player: Phase Shift
   * - Tap adjacent cell: Move directly into that cell
   * - Tap any other cell: Move 1 step towards that cell along dominant axis
   */
  _handleCanvasTap(clientX, clientY) {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // Check if tap fell inside the canvas area
    if (clickX < 0 || clickX > rect.width || clickY < 0 || clickY > rect.height) return;

    let cellX = -1;
    let cellY = -1;

    if (this.renderer && this.renderer.cellSize > 0) {
      cellX = Math.floor((clickX - this.renderer.offsetX) / this.renderer.cellSize);
      cellY = Math.floor((clickY - this.renderer.offsetY) / this.renderer.cellSize);
    }

    const player = this.gameState.player;

    if (cellX >= 0 && cellX < 8 && cellY >= 0 && cellY < 8) {
      // Tap on player -> Phase shift!
      if (cellX === player.x && cellY === player.y) {
        this._executePhaseShift();
      } else {
        // Tap on target cell -> Move pointer towards it
        const dx = cellX - player.x;
        const dy = cellY - player.y;

        if (Math.abs(dx) + Math.abs(dy) === 1) {
          // Direct 1-tile adjacent move
          this._executeMove(dx, dy);
        } else {
          // Step towards target along the greater axis
          if (Math.abs(dx) >= Math.abs(dy)) {
            this._executeMove(Math.sign(dx), 0);
          } else {
            this._executeMove(0, Math.sign(dy));
          }
        }
      }

      // Visual touch feedback ripple
      if (this.renderer && this.renderer.particleEngine) {
        const rippleColor = this.gameState.realm === 'alpha' ? '#00F3FF' : '#FF007F';
        this.renderer.particleEngine.emitTouchRipple(clickX, clickY, rippleColor);
      }
    } else if (this.renderer && this.renderer.cellSize > 0) {
      // Tapped outside board grid but inside canvas: move in direction from player
      const playerCenterX = this.renderer.offsetX + (player.x + 0.5) * this.renderer.cellSize;
      const playerCenterY = this.renderer.offsetY + (player.y + 0.5) * this.renderer.cellSize;
      const dx = clickX - playerCenterX;
      const dy = clickY - playerCenterY;

      if (Math.abs(dx) >= Math.abs(dy)) {
        this._executeMove(Math.sign(dx), 0);
      } else {
        this._executeMove(0, Math.sign(dy));
      }
    }
  }

  // =========================================================================
  // ON-SCREEN BUTTONS (Command Deck & Mobile Quick Actions)
  // =========================================================================

  _attachActionButtons() {
    if (typeof document === 'undefined') return;

    const bindBtn = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = (e) => {
        e.preventDefault();
        if (!this.enabled) return;
        this.audio.init();
        action();
      };
      el.addEventListener('pointerdown', handler);
      el.addEventListener('click', handler);
    };

    // Sidebar command deck buttons
    bindBtn('btn-action-shift', () => this._executePhaseShift());
    bindBtn('btn-action-undo', () => this._executeUndo());
    bindBtn('btn-action-reset', () => this._executeReset());

    // Top breadcrumb quick actions
    bindBtn('btn-top-undo', () => this._executeUndo());
    bindBtn('btn-top-reset', () => this._executeReset());

    // In-modal command deck buttons (closes modal after activating action)
    const modalInstructions = document.getElementById('modal-instructions');
    const closeInstructionsModal = () => {
      if (modalInstructions && modalInstructions.classList.contains('visible')) {
        modalInstructions.classList.remove('visible');
        modalInstructions.setAttribute('aria-hidden', 'true');
        this.setEnabled(true);
      }
    };

    const bindModalBtn = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = (e) => {
        e.preventDefault();
        this.audio.init();
        action();
        closeInstructionsModal();
      };
      el.addEventListener('pointerdown', handler);
      el.addEventListener('click', handler);
    };

    bindModalBtn('btn-modal-shift', () => this._executePhaseShift());
    bindModalBtn('btn-modal-undo', () => this._executeUndo());
    bindModalBtn('btn-modal-reset', () => this._executeReset());
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputController;
}
