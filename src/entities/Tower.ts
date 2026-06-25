import { eventBus } from '../core/EventBus';
import type { TargetPriority, TowerConfig, UpgradeConfig } from '../types';
import type { Enemy } from './Enemy';

const TARGET_PRIORITIES: TargetPriority[] = ['first', 'last', 'strong', 'weak', 'nearest'];

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
  public buffDamage = 1;
  public buffRange = 0;
  public buffFireRate = 1;
  public targetPriority: TargetPriority = 'first';
  public disabledTime = 0;

  constructor(x: number, y: number, config: TowerConfig) {
    this.id = `tower_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.x = x;
    this.y = y;
    this.config = config;
    this.totalInvested = config.cost;
  }

  public resetBuff(): void {
    this.buffDamage = 1;
    this.buffRange = 0;
    this.buffFireRate = 1;
  }

  public applyBuff(damage: number, range: number, fireRate: number): void {
    this.buffDamage *= damage;
    this.buffRange += range;
    this.buffFireRate *= fireRate;
  }

  public update(dt: number, enemies: Enemy[]): void {
    if (!this.built) {
      this.buildProgress += dt;
      if (this.buildProgress >= 0.3) this.built = true;
      return;
    }

    if (this.disabledTime > 0) {
      this.disabledTime = Math.max(0, this.disabledTime - dt);
      return;
    }

    // 辅助塔不主动攻击
    if (this.config.damage <= 0) return;

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

    return inRange.sort((a, b) => this.compareTargets(a, b))[0];
  }

  private compareTargets(a: Enemy, b: Enemy): number {
    switch (this.targetPriority) {
      case 'last':
        return a.pathProgress - b.pathProgress;
      case 'strong':
        return b.hp - a.hp;
      case 'weak':
        return a.hp - b.hp;
      case 'nearest':
        return this.distanceTo(a) - this.distanceTo(b);
      case 'first':
      default:
        return b.pathProgress - a.pathProgress;
    }
  }

  private distanceTo(enemy: Enemy): number {
    return Math.hypot(enemy.x - (this.x + 0.5), enemy.y - (this.y + 0.5));
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

  public applyOnHitEffect(enemy: Enemy): void {
    switch (this.config.id) {
      case 'ice':
        enemy.applyEffect({ type: 'slow', duration: 1.6 });
        break;
      case 'lightning':
        enemy.applyEffect({ type: 'stun', duration: 0.18 });
        break;
      case 'poison':
        enemy.applyEffect({
          type: 'poison',
          duration: 3.2,
          tickDamage: Math.max(2, this.getDamage() * 0.35),
        });
        break;
    }
  }

  public upgrade(upgrade: UpgradeConfig): void {
    this.level = upgrade.level;
    this.totalInvested += upgrade.cost;
  }

  public cycleTargetPriority(): TargetPriority {
    const index = TARGET_PRIORITIES.indexOf(this.targetPriority);
    this.targetPriority = TARGET_PRIORITIES[(index + 1) % TARGET_PRIORITIES.length];
    return this.targetPriority;
  }

  public stun(duration: number): void {
    this.disabledTime = Math.max(this.disabledTime, duration);
  }

  public getDamage(): number {
    const upgrade = this.config.upgrades[this.level - 1];
    const base = upgrade ? this.config.damage * upgrade.damageMultiplier : this.config.damage;
    return Math.round(base * this.buffDamage);
  }

  public getRange(): number {
    const upgrade = this.config.upgrades[this.level - 1];
    const bonus = upgrade ? upgrade.rangeBonus : 0;
    return this.config.range + bonus + this.buffRange;
  }

  public getFireRate(): number {
    const upgrade = this.config.upgrades[this.level - 1];
    const multiplier = upgrade ? upgrade.fireRateMultiplier : 1;
    return this.config.fireRate * multiplier * this.buffFireRate;
  }

  public getNextUpgrade(): UpgradeConfig | undefined {
    return this.config.upgrades[this.level - 1];
  }

  public getSellValue(refundRate = 0.7): number {
    return Math.floor(this.totalInvested * refundRate);
  }
}
