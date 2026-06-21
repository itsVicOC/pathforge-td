import type { DamageType, Vec2 } from '../types';
import type { Enemy } from './Enemy';
import type { Tower } from './Tower';

export class Projectile {
  public x: number;
  public y: number;
  public target: Enemy;
  public damage: number;
  public damageType: DamageType;
  public speed: number;
  public projectileType: 'projectile' | 'aoe';
  public sourceTower: Tower;
  public active = true;

  constructor(
    x: number,
    y: number,
    target: Enemy,
    damage: number,
    damageType: DamageType,
    speed: number,
    projectileType: 'projectile' | 'aoe',
    sourceTower: Tower,
  ) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.damageType = damageType;
    this.speed = speed;
    this.projectileType = projectileType;
    this.sourceTower = sourceTower;
  }

  public update(dt: number): boolean {
    if (!this.active) return false;
    if (!this.target || this.target.hp <= 0) {
      this.active = false;
      return false;
    }

    const tx = this.target.x;
    const ty = this.target.y;
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.speed * dt) {
      this.active = false;
      return true; // 命中
    }

    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;
    return true; // 仍在飞行
  }

  public getHitPosition(): Vec2 {
    return { x: this.x, y: this.y };
  }
}
