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
      const result = p.update(dt);

      if (!p.active) {
        if (result === 'hit') {
          this.onHit(p, enemies);
        }
        this.projectiles.splice(i, 1);
      }
    }
  }

  private onHit(projectile: Projectile, enemies: Enemy[]): void {
    const pos = projectile.getHitPosition();
    const isBarracks = projectile.sourceTower.config.id === 'barracks';

    if (projectile.projectileType === 'aoe' || isBarracks) {
      const radius = isBarracks ? 1.2 : AOE_RADIUS;
      for (const enemy of enemies) {
        const dist = Math.hypot(enemy.x - pos.x, enemy.y - pos.y);
        if (dist <= radius) {
          enemy.takeDamage(projectile.damage, projectile.damageType);
          projectile.sourceTower.applyOnHitEffect(enemy);
          if (isBarracks) {
            enemy.applyEffect({ type: 'stun', duration: 0.5 });
          }
        }
      }
      const color = isBarracks ? '#795548' : '#ff9800';
      const size = isBarracks ? 1.2 : 1.5;
      eventBus.emit('effect:explosion', { x: pos.x, y: pos.y, color, size });
    } else {
      if (projectile.target.hp > 0) {
        projectile.target.takeDamage(projectile.damage, projectile.damageType);
        projectile.sourceTower.applyOnHitEffect(projectile.target);
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
