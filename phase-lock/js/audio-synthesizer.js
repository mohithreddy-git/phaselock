/**
 * AudioSynthesizer - Procedural Web Audio Engine for PHASE LOCK
 * Zero external audio files. 100% procedurally synthesized sound effects.
 */

class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.initialized = false;
    this.supported = typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined';
  }

  /**
   * Initializes or resumes the AudioContext after a user gesture.
   */
  init() {
    if (!this.supported) return;
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
      } catch (e) {
        console.warn('Web Audio API initialization failed:', e);
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.45, now + 0.05);
    }
    return this.isMuted;
  }

  setMute(muteState) {
    this.isMuted = !!muteState;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.45, now + 0.05);
    }
  }

  /**
   * Movement: Soft futuristic synth click/thud with short envelope
   */
  playMove() {
    if (!this.supported || this.isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.07);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.07);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Phase Shift: Low bass frequency sweep combined with high-tech digital swoop
   */
  playPhaseShift() {
    if (!this.supported || this.isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;

    // 1. Low bass sub-sweep
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(175, now);
    bassOsc.frequency.exponentialRampToValueAtTime(42, now + 0.28);

    const bassFilter = this.ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(320, now);
    bassFilter.frequency.exponentialRampToValueAtTime(80, now + 0.28);

    bassGain.gain.setValueAtTime(0.5, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.masterGain);

    bassOsc.start(now);
    bassOsc.stop(now + 0.31);

    // 2. High-tech resonant swoop
    const swoopOsc = this.ctx.createOscillator();
    const swoopGain = this.ctx.createGain();
    const swoopFilter = this.ctx.createBiquadFilter();

    swoopOsc.type = 'triangle';
    swoopOsc.frequency.setValueAtTime(350, now);
    swoopOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.16);
    swoopOsc.frequency.exponentialRampToValueAtTime(700, now + 0.28);

    swoopFilter.type = 'bandpass';
    swoopFilter.Q.value = 4.0;
    swoopFilter.frequency.setValueAtTime(400, now);
    swoopFilter.frequency.exponentialRampToValueAtTime(1800, now + 0.18);

    swoopGain.gain.setValueAtTime(0.3, now);
    swoopGain.gain.linearRampToValueAtTime(0.4, now + 0.1);
    swoopGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    swoopOsc.connect(swoopFilter);
    swoopFilter.connect(swoopGain);
    swoopGain.connect(this.masterGain);

    swoopOsc.start(now);
    swoopOsc.stop(now + 0.31);
  }

  /**
   * Invalid Action: Low-frequency dissonant buzz / rejection sound
   */
  playInvalid() {
    if (!this.supported || this.isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(84, now);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(118, now); // Dissonant minor third/tritone

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.15);
  }

  /**
   * Plate Activated: Pleasant harmonic chime with multiple resonant tones
   */
  playPlateActivated() {
    if (!this.supported || this.isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const baseTime = this.ctx.currentTime;
    // Harmonic arpeggio in high register: E5, G#5, B5, E6
    const freqs = [659.25, 830.61, 987.77, 1318.51];

    freqs.forEach((freq, idx) => {
      const noteTime = baseTime + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.28, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.46);
    });
  }

  /**
   * Victory: Multi-stage retro-synth arpeggio fanfare
   */
  playVictory() {
    if (!this.supported || this.isMuted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    const baseTime = this.ctx.currentTime;
    // Triumphant Cyberpunk Arpeggio: C4, G4, C5, E5, G5, C6
    const notes = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const noteTime = baseTime + idx * 0.085;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.32, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + (idx === notes.length - 1 ? 0.9 : 0.4));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + (idx === notes.length - 1 ? 0.95 : 0.45));
    });
  }
}

// Export for module and global script availability
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioSynthesizer;
}
