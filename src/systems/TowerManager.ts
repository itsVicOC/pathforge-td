import { eventBus } from '../core/EventBus';
import { TOWER_CONFIGS } from '../config/towers';
import type { Grid } from './Grid';
import type { Pathfinder } from './Pathfinder';
import type { EconomyManager } from './EconomyManager';
import { Tower } from '../entities/Tower';
import type { Enemy } from '../entities/Enemy';
import type { TowerConfig } from '../types';

export class TowerManager {
  private towers: Tower[] = [];

  constructor(
    private grid: Grid,
    private pathfinder: Pathfinder,
    private economy: EconomyManager,
  ) {}

  public clear(): void {
    this.towers = [];
  }

  public getTowers(): Tower[] {
    return this.towers;
  }

  public getTowerAt(x: number, y: number): Tower | undefined {
    return this.towers.find(t => t.x === x && t.y === y);
  }

  public placeTower(x: number, y: number, towerId: string): boolean {
    const config = TOWER_CONFIGS[towerId];
    if (!config) return this.failPlacement('unknown_tower');
    if (!this.grid.isBuildable(x, y)) return this.failPlacement('invalid_cell');
    if (!this.pathfinder.validatePlacement(x, y)) return this.failPlacement('blocked_path');
    if (!this.economy.spend(config.cost)) return this.failPlacement('not_enough_gold');

    const tower = new Tower(x, y, config);
    if (!this.grid.setTower(x, y, tower.id)) {
      this.economy.refund(config.cost);
      return this.failPlacement('invalid_cell');
    }

    this.towers.push(tower);
    this.pathfinder.invalidate();

    eventBus.emit('tower:placed', { x, y, towerId, tower });
    return true;
  }

  private failPlacement(reason: string): false {
    eventBus.emit('tower:placementFailed', { reason });
    return false;
  }

  public upgradeTower(tower: Tower): boolean {
    const upgrade = tower.getNextUpgrade();
    if (!upgrade) return false;
    if (!this.economy.spend(upgrade.cost)) return false;

    tower.upgrade(upgrade);
    eventBus.emit('tower:upgraded', { tower });
    return true;
  }

  public sellTower(tower: Tower, refundRate = 0.7): void {
    const refund = tower.getSellValue(refundRate);
    this.grid.removeTower(tower.x, tower.y);
    this.towers = this.towers.filter(t => t.id !== tower.id);
    this.economy.refund(refund);
    this.pathfinder.invalidate();
    eventBus.emit('tower:sold', { tower, refund });
  }

  public update(dt: number, enemies: Enemy[]): void {
    this.applySupportBuffs();
    for (const tower of this.towers) {
      tower.update(dt, enemies);
    }
  }

  private applySupportBuffs(): void {
    for (const tower of this.towers) {
      tower.resetBuff();
    }

    const supports = this.towers.filter(t => t.config.id === 'support');
    for (const support of supports) {
      const range = support.getRange();
      for (const tower of this.towers) {
        if (tower === support) continue;
        const dist = Math.hypot(tower.x - support.x, tower.y - support.y);
        if (dist <= range) {
          tower.applyBuff(1.2, 0.5, 1.1);
        }
      }
    }
  }

  public stunTowersInRange(x: number, y: number, radius: number, duration: number): number {
    let affected = 0;
    for (const tower of this.towers) {
      const dist = Math.hypot((tower.x + 0.5) - x, (tower.y + 0.5) - y);
      if (dist <= radius) {
        tower.stun(duration);
        affected++;
      }
    }
    return affected;
  }

  public getTowerConfig(id: string): TowerConfig | undefined {
    return TOWER_CONFIGS[id];
  }

  public getAllConfigs(): Record<string, TowerConfig> {
    return TOWER_CONFIGS;
  }
}
