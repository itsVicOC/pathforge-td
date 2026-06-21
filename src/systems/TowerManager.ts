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
    if (!this.grid.isBuildable(x, y)) return false;
    if (!this.pathfinder.validatePlacement(x, y)) return false;

    const config = TOWER_CONFIGS[towerId];
    if (!config) return false;
    if (!this.economy.spend(config.cost)) return false;

    const tower = new Tower(x, y, config);
    this.towers.push(tower);
    this.grid.setTower(x, y, tower.id);
    this.pathfinder.invalidate();

    eventBus.emit('tower:placed', { x, y, towerId, tower });
    return true;
  }

  public upgradeTower(tower: Tower): boolean {
    const upgrade = tower.getNextUpgrade();
    if (!upgrade) return false;
    if (!this.economy.spend(upgrade.cost)) return false;

    tower.upgrade(upgrade);
    eventBus.emit('tower:upgraded', { tower });
    return true;
  }

  public sellTower(tower: Tower): void {
    const refund = tower.getSellValue();
    this.grid.removeTower(tower.x, tower.y);
    this.towers = this.towers.filter(t => t.id !== tower.id);
    this.economy.refund(refund);
    this.pathfinder.invalidate();
    eventBus.emit('tower:sold', { tower, refund });
  }

  public update(dt: number, enemies: Enemy[]): void {
    for (const tower of this.towers) {
      tower.update(dt, enemies);
    }
  }

  public getTowerConfig(id: string): TowerConfig | undefined {
    return TOWER_CONFIGS[id];
  }

  public getAllConfigs(): Record<string, TowerConfig> {
    return TOWER_CONFIGS;
  }
}
