import { eventBus } from '../core/EventBus';
import { ENEMY_CONFIGS } from '../config/enemies';
import { Pathfinder } from './Pathfinder';
import { Grid } from './Grid';
import { Enemy } from '../entities/Enemy';
import type { EnemyConfig, Vec2 } from '../types';

export class EnemyManager {
  private enemies: Enemy[] = [];

  constructor(
    private pathfinder: Pathfinder,
    private grid: Grid,
  ) {
    this.bindEvents();
  }

  private bindEvents(): void {
    eventBus.on('enemy:healPulse', ({ source, x, y, radius, amount }: {
      source: Enemy;
      x: number;
      y: number;
      radius: number;
      amount: number;
    }) => {
      for (const enemy of this.enemies) {
        if (enemy === source || enemy.hp <= 0 || enemy.reachedCore) continue;
        const dist = Math.hypot(enemy.x - x, enemy.y - y);
        if (dist <= radius) {
          enemy.heal(amount);
          eventBus.emit('effect:hit', { x: enemy.x, y: enemy.y, color: '#66bb6a' });
        }
      }
    });

    eventBus.on('enemy:killed', ({ enemy }: { enemy: Enemy }) => {
      if (enemy.config.id === 'bomber') {
        eventBus.emit('enemy:bomberExploded', {
          x: enemy.x,
          y: enemy.y,
          radius: 1.8,
          towerStunDuration: 2.0,
        });
      }
    });
  }

  public clear(): void {
    this.enemies = [];
  }

  public getEnemies(): Enemy[] {
    return this.enemies;
  }

  public spawnEnemy(type: string): void {
    const config = ENEMY_CONFIGS[type];
    if (!config) return;

    const paths = this.pathfinder.getAllPaths();
    let shortest: Vec2[] = [];
    let shortestSpawn: Vec2 | undefined;

    for (const [spawn, path] of paths) {
      if (path.length > 0 && (shortest.length === 0 || path.length < shortest.length)) {
        shortest = path;
        shortestSpawn = spawn;
      }
    }

    if (shortest.length === 0) {
      console.warn('No valid path for enemy spawn');
      return;
    }

    // 飞行敌人直线路径
    const path = config.flying && shortestSpawn
      ? [shortestSpawn, shortest[shortest.length - 1]]
      : shortest;

    const enemy = new Enemy(config, path);
    this.enemies.push(enemy);
  }

  public update(dt: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt);

      const terrain = this.grid.getTerrainEffect(Math.floor(enemy.x), Math.floor(enemy.y));
      enemy.applyTerrainEffect(terrain, dt);

      if (enemy.reachedCore) {
        eventBus.emit('enemy:reachedCore', { enemy });
        this.enemies.splice(i, 1);
      } else if (enemy.hp <= 0) {
        this.enemies.splice(i, 1);
      }
    }
  }

  public getConfig(id: string): EnemyConfig | undefined {
    return ENEMY_CONFIGS[id];
  }

  public getAllConfigs(): Record<string, EnemyConfig> {
    return ENEMY_CONFIGS;
  }
}
