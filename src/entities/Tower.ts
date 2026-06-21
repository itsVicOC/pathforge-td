import { eventBus } from '../core/EventBus';
import type { TowerConfig, UpgradeConfig } from '../types';
import type { Enemy } from './Enemy';

export class Tower {
  public id: string;
  public x: number;
  public y: number;
  public config: TowerConfig;
  public level = 1;
  public totalInvested: number;
  public cooldown = 0;
  public buildProgress = 0;
  public built = false;

  constructor(x: number, y: number, config: TowerConfig) {
    this.id = `tower_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.x = x;
    this.y = y;
    this.config = config;
    this.totalInvested = config.cost;
  }

  public update(dt: number, enemies: Enemy[]): void {
    if (!this.built) {
      this.buildProgress += dt;
      if (this.buildProgress >= 0.3) this.built = true;
      return;
    }

    if (this.cooldown > 0) {
      this.cooldown -= dt;
      return;
    }

    const target = this.findTarget(enemies);
    if (target) {
      this.fire(target);
      this.cooldown = 1 / this.getFireRate();
    }
  }

  private findTarget(enemies: Enemy[]): Enemy | undefined {
    const inRange = enemies.filter(e => {
      const dist = Math.hypot(e.x - (this.x + 0.5), e.y - (this.y + 0.5));
      return dist <= this.getRange() && this.canTarget(e);
    });

    return inRange.sort((a, b) => a.pathProgress - b.pathProgress)[0];
  }

  private canTarget(enemy: Enemy): boolean {
    if (enemy.flying) return this.config.targetFlags.includes('flying');
    return this.config.targetFlags.includes('ground');
  }

  private fire(target: Enemy): void {
    eventBus.emit('tower:fire', {
      tower: this,
      target,
      damage: this.getDamage(),
      damageType: this.config.damageType,
    });
  }

  public upgrade(upgrade: UpgradeConfig): void {
    this.level = upgrade.level;
    this.totalInvested += upgrade.cost;
  }

  public getDamage(): number {
    const upgrade = this.config.upgrades[this.level - 1];
    if (!upgrade) return this.config.damage;
    return Math.round(this.config.damage * upgrade.damageMultiplier);
  }

  public getRange(): number {
    const upgrade = this.config.upgrades[this.level - 1];
    const bonus = upgrade ? upgrade.rangeBonus : 0;
    return this.config.range + bonus;
  }

  public getFireRate(): number {
    const upgrade = this.config.upgrades[this.level - 1];
    const multiplier = upgrade ? upgrade.fireRateMultiplier : 1;
    return this.config.fireRate * multiplier;
  }

  public getNextUpgrade(): UpgradeConfig | undefined {
    return this.config.upgrades[this.level - 1];
  }

  public getSellValue(): number {
    return Math.floor(this.totalInvested * 0.7);
  }
}
