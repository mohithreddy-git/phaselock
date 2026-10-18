/**
 * ParticleEngine - High-performance canvas particle system for PHASE LOCK
 * Capable of ambient dust, quantum phase ripples, plate activation sparks, and rejection bursts.
 */

class ParticleEngine {
  constructor(maxParticles = 220) {
    this.maxParticles = maxParticles;
    this.particles = [];
    this.reducedMotion = false;

    // Check media query for prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = mq.matches;
      mq.addEventListener('change', (e) => {
        this.reducedMotion = e.matches;
      });
    }
  }

  /**
   * Resets all transient particles
   */
  clear() {
    this.particles.length = 0;
  }

  /**
   * Spawns an explosion of energy sparks when a pressure plate is activated
   */
  emitPlateActivated(x, y, color = '#00F3FF') {
    if (this.reducedMotion) return;
    const count = 28;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 1.2 + Math.random() * 2.8;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.0 + Math.random() * 2.5,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.025,
        color,
        glow: true
      });
    }

    // Expanding shock ring
    this.particles.push({
      type: 'ring',
      x,
      y,
      radius: 4,
      maxRadius: 36,
      dr: 1.6,
      alpha: 0.9,
      decay: 0.035,
      color,
      lineWidth: 2.5
    });
  }

  /**
   * Spawns a quantum phase ripple across the board
   */
  emitPhaseShift(x, y, fromColor = '#00F3FF', toColor = '#FF007F') {
    if (this.reducedMotion) return;
    const count = 35;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 3.5;
      const color = Math.random() > 0.5 ? fromColor : toColor;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.8 + Math.random() * 2.2,
        alpha: 0.9,
        decay: 0.025 + Math.random() * 0.03,
        color,
        glow: true
      });
    }

    // Concentric phase rings
    this.particles.push({
      type: 'ring',
      x,
      y,
      radius: 6,
      maxRadius: 50,
      dr: 2.2,
      alpha: 0.8,
      decay: 0.03,
      color: toColor,
      lineWidth: 2.0
    });
  }

  /**
   * Rejection shockwave and red spark burst on invalid move / wall collision
   */
  emitRejection(x, y) {
    if (this.reducedMotion) return;
    const count = 22;
    const dangerColor = '#FF526E';
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2.5;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.2 + Math.random() * 2.0,
        alpha: 1.0,
        decay: 0.04 + Math.random() * 0.03,
        color: dangerColor,
        glow: true
      });
    }

    this.particles.push({
      type: 'ring',
      x,
      y,
      radius: 4,
      maxRadius: 28,
      dr: 2.4,
      alpha: 1.0,
      decay: 0.06,
      color: dangerColor,
      lineWidth: 3.0
    });
  }

  /**
   * Spawns subtle ambient floating cyber dust particles
   */
  spawnAmbient(width, height, realmColor) {
    if (this.reducedMotion) return;
    if (this.particles.length >= this.maxParticles - 10) return;
    if (Math.random() > 0.35) return;

    this.particles.push({
      type: 'dust',
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.3,
      size: 1.0 + Math.random() * 1.5,
      alpha: 0.15 + Math.random() * 0.35,
      decay: 0.002 + Math.random() * 0.004,
      color: realmColor,
      glow: false
    });
  }

  /**
   * Updates particle state
   * @param {number} dt Delta time in seconds (standardized around 0.016)
   */
  update(dt = 0.016) {
    const timeScale = dt / 0.016;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.type === 'spark' || p.type === 'dust') {
        p.x += p.vx * timeScale;
        p.y += p.vy * timeScale;
        p.alpha -= p.decay * timeScale;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      } else if (p.type === 'ring') {
        p.radius += p.dr * timeScale;
        p.alpha -= p.decay * timeScale;
        if (p.alpha <= 0 || p.radius >= p.maxRadius) {
          this.particles.splice(i, 1);
        }
      }
    }
  }

  /**
   * Renders all active particles to the provided CanvasRenderingContext2D
   */
  render(ctx) {
    if (this.particles.length === 0) return;

    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.alpha <= 0) continue;

      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

      if (p.type === 'spark' || p.type === 'dust') {
        ctx.fillStyle = p.color;
        if (p.glow) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = p.lineWidth;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleEngine;
}
