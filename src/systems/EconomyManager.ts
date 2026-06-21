import { eventBus } from '../core/EventBus';

export class EconomyManager {
  private gold = 0;
  private totalEarned = 0;

  public reset(startingGold: number): void {
    this.gold = startingGold;
    this.totalEarned = startingGold;
    this.notify();
  }

  public canAfford(amount: number): boolean {
    return this.gold >= amount;
  }

  public spend(amount: number): boolean {
    if (!this.canAfford(amount)) return false;
    this.gold -= amount;
    this.notify();
    return true;
  }

  public add(amount: number): void {
    this.gold += amount;
    this.totalEarned += amount;
    this.notify();
  }

  public addKillReward(reward: number): void {
    this.add(reward);
  }

  public addWaveBonus(bonus: number): void {
    this.add(bonus);
  }

  public refund(amount: number): void {
    this.add(amount);
  }

  public getGold(): number { return this.gold; }
  public getTotalEarned(): number { return this.totalEarned; }

  private notify(): void {
    eventBus.emit('economy:changed', this.gold);
  }
}
