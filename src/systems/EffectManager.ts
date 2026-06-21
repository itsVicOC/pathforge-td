import { eventBus } from '../core/EventBus';
import { Particle, HitEffect, BeamEffect } from '../entities/Effect';

export class EffectManager {
  private particles: Particle[] = [];
  private hitEffects: HitEffect[] = [];
  private beamEffects: BeamEffect[] = [];

  constructor() {
    this.bindEvents();
  }

  private bindEvents(): void {
    eventBus.on('effect:explosion', ({ x, y, color, size }: {
      x: number;
      y: number;
      color: string;
      size: number;
    }) => {
      this.createExplosion(x, y, color, size);
    });

    eventBus.on('effect:hit', ({ x, y, color }: { x: number; y: number; color: string }) => {
      this.createHitEffect(x, y, color);
    });

    eventBus.on('effect:beam', ({ x1, y1, x2, y2, color }: {
      x1: number; y1: number; x2: number; y2: number; color: string;
    }) => {
      this.beamEffects.push(new BeamEffect(x1, y1, x2, y2, color));
    });
  }

  public createExplosion(x: number, y: number, color: string, size: number): void {
    const count = Math.floor(size * 12);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1 + Math.random() * 3;
      this.particles.push(new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.3,
        color,
        size: 2 + Math.random() * 3,
        gravity: 0,
        fade: true,
      }));
    }
  }

  public createHitEffect(x: number, y: number, color: string): void {
    this.hitEffects.push(new HitEffect(x, y, color));
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      this.particles.push(new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.2,
        color,
        size: 1 + Math.random() * 2,
      }));
    }
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (!this.particles[i].active) this.particles.splice(i, 1);
    }

    for (let i = this.hitEffects.length - 1; i >= 0; i--) {
      this.hitEffects[i].update(dt);
      if (!this.hitEffects[i].active) this.hitEffects.splice(i, 1);
    }

    for (let i = this.beamEffects.length - 1; i >= 0; i--) {
      this.beamEffects[i].update(dt);
      if (!this.beamEffects[i].active) this.beamEffects.splice(i, 1);
    }
  }

  public getParticles(): Particle[] { return this.particles; }
  public getHitEffects(): HitEffect[] { return this.hitEffects; }
  public getBeamEffects(): BeamEffect[] { return this.beamEffects; }

  public clear(): void {
    this.particles = [];
    this.hitEffects = [];
    this.beamEffects = [];
  }
}
