/**
 * InputController - Multi-modal input coordinator for PHASE LOCK
 * Handles keyboard, touch D-Pad, on-screen buttons, debouncing, and focus management.
 */

class InputController {
  constructor(gameState, audio) {
    this.gameState = gameState;
    this.audio = audio;

    this.enabled = true;
    this.keysPressed = new Set();
    this.lastActionTime = 0;
    this.actionCooldownMs = 120; // Debounce threshold for rapid inputs

    // Bound listeners for cleanup
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onKeyUp = this._handleKeyUp.bind(this);

    this.attach();
  }

  attach() {
    window.addEventListener('keydown', this._onKeyDown, { passive: false });
    window.addEventListener('keyup', this._onKeyUp, { passive: true });
    this._attachTouchControls();
  }

  detach() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.keysPressed.clear();
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
    if (!this.enabled) {
      this.keysPressed.clear();
    }
  }

  _isInputActive() {
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

  _attachTouchControls() {
    // Touch D-Pad mapping
    const mappings = [
      { id: 'btn-dpad-up', dx: 0, dy: -1 },
      { id: 'btn-dpad-down', dx: 0, dy: 1 },
      { id: 'btn-dpad-left', dx: -1, dy: 0 },
      { id: 'btn-dpad-right', dx: 1, dy: 0 }
    ];

    mappings.forEach(({ id, dx, dy }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const trigger = (e) => {
        e.preventDefault();
        if (!this.enabled) return;
        this.audio.init();
        this._executeMove(dx, dy);
      };

      el.addEventListener('pointerdown', trigger);
    });

    // Touch Action Buttons
    const shiftBtn = document.getElementById('btn-action-shift');
    if (shiftBtn) {
      shiftBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (!this.enabled) return;
        this.audio.init();
        this._executePhaseShift();
      });
    }

    const undoBtn = document.getElementById('btn-action-undo');
    if (undoBtn) {
      undoBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (!this.enabled) return;
        this.audio.init();
        this._executeUndo();
      });
    }

    const resetBtn = document.getElementById('btn-action-reset');
    if (resetBtn) {
      resetBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (!this.enabled) return;
        this.audio.init();
        this._executeReset();
      });
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputController;
}
