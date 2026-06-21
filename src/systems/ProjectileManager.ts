import { eventBus } from '../core/EventBus';
import { Projectile } from '../entities/Projectile';
import type { Enemy } from '../entities/Enemy';
import type { Tower } from '../entities/Tower';

const PROJECTILE_SPEED = 8; // tiles per second
const AOE_RADIUS = 1.5; // tiles

export class ProjectileManager {
  private projectiles: Projectile[] = [];

  public spawn(
    tower: Tower,
    target: Enemy,
    damage: number,
    damageType: string,
    projectileType: string,
  ): void {
    const startX = tower.x + 0.5;
    const startY = tower.y + 0.5;
    const type = projectileType === 'aoe' ? 'aoe' : 'projectile';

    const projectile = new Projectile(
      startX,
      startY,
      target,
      damage,
      damageType as any,
      PROJECTILE_SPEED,
      type,
      tower,
    );
    this.projectiles.push(projectile);
  }

  public update(dt: number, enemies: Enemy[]): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const stillFlying = p.update(dt);

      if (!p.active) {
        if (!stillFlying) {
          // 命中
          this.onHit(p, enemies);
        }
        this.projectiles.splice(i, 1);
      }
    }
  }

  private onHit(projectile: Projectile, enemies: Enemy[]): void {
    const pos = projectile.getHitPosition();

    if (projectile.projectileType === 'aoe') {
      for (const enemy of enemies) {
        const dist = Math.hypot(enemy.x - pos.x, enemy.y - pos.y);
        if (dist <= AOE_RADIUS) {
          enemy.takeDamage(projectile.damage, projectile.damageType);
        }
      }
      eventBus.emit('effect:explosion', { x: pos.x, y: pos.y, color: '#ff9800', size: 1.5 });
    } else {
      if (projectile.target.hp > 0) {
        projectile.target.takeDamage(projectile.damage, projectile.damageType);
      }
      eventBus.emit('effect:hit', { x: pos.x, y: pos.y, color: '#fff' });
    }
  }

  public getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  public clear(): void {
    this.projectiles = [];
  }
}
