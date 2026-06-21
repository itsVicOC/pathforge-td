import { eventBus } from '../core/EventBus';
import type { DamageType, EffectSnapshot, EnemyConfig, TerrainEffect, Vec2 } from '../types';

export class Enemy {
  public x: number;
  public y: number;
  public config: EnemyConfig;
  public hp: number;
  public maxHp: number;
  public path: Vec2[] = [];
  public pathIndex = 0;
  public pathProgress = 0;
  public activeEffects: Map<string, EffectSnapshot> = new Map();
  public reachedCore = false;

  constructor(config: EnemyConfig, path: Vec2[]) {
    this.config = config;
    this.path = path;
    this.x = path[0].x + 0.5;
    this.y = path[0].y + 0.5;
    this.maxHp = config.hp;
    this.hp = config.hp;
  }

  public update(dt: number): void {
    this.updateEffects(dt);
    this.move(dt);
  }

  private move(dt: number): void {
    if (this.reachedCore) return;

    let speed = this.getCurrentSpeed();
    let remaining = speed * dt;

    while (remaining > 0.001 && this.pathIndex < this.path.length - 1) {
      const target = this.path[this.pathIndex + 1];
      const tx = target.x + 0.5;
      const ty = target.y + 0.5;
      const dx = tx - this.x;
      const dy = ty - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= remaining) {
        this.x = tx;
        this.y = ty;
        this.pathIndex++;
        remaining -= dist;
      } else {
        this.x += (dx / dist) * remaining;
        this.y += (dy / dist) * remaining;
        remaining = 0;
      }
    }

    if (this.pathIndex >= this.path.length - 1) {
      this.reachedCore = true;
    }

    this.pathProgress = this.pathIndex / Math.max(1, this.path.length - 1);
  }

  private getCurrentSpeed(): number {
    let speed = this.config.speed;
    const slow = this.activeEffects.get('slow');
    const terrainSlow = this.activeEffects.get('terrainSlow');
    if (slow) speed *= 0.7;
    if (terrainSlow) speed *= 0.8;
    return speed;
  }

  public takeDamage(amount: number, type: DamageType): void {
    const actual = this.calculateDamage(amount, type);
    this.hp -= actual;
    eventBus.emit('enemy:damaged', { enemy: this, damage: actual });
    if (this.hp <= 0) {
      eventBus.emit('enemy:killed', { enemy: this, reward: this.config.reward });
    }
  }

  private calculateDamage(amount: number, type: DamageType): number {
    if (type === 'true') return amount;
    if (type === 'physical') return Math.max(1, amount - this.config.armor);
    return Math.max(1, amount * (1 - this.config.magicResist / 100));
  }

  private updateEffects(dt: number): void {
    for (const [key, effect] of this.activeEffects) {
      effect.duration -= dt;
      if (effect.tickDamage) {
        this.hp -= effect.tickDamage * dt;
      }
      if (effect.duration <= 0) {
        this.activeEffects.delete(key);
      }
    }
  }

  public applyEffect(effect: EffectSnapshot): void {
    this.activeEffects.set(effect.type, effect);
  }

  public applyTerrainEffect(terrain: TerrainEffect, dt: number): void {
    if (terrain === 'slow') {
      this.activeEffects.set('terrainSlow', { type: 'terrainSlow', duration: 0.2 });
    } else if (terrain === 'damage') {
      this.hp -= 5 * dt;
      eventBus.emit('enemy:damaged', { enemy: this, damage: 5 * dt });
    }
  }

  public get flying(): boolean { return this.config.flying; }
}
