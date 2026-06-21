import { eventBus } from '../core/EventBus';
import type { EconomyManager } from './EconomyManager';
import type { EnemyManager } from './EnemyManager';
import type { WaveConfig, WaveGroup } from '../types';

interface ActiveGroup extends WaveGroup {
  spawned: number;
  elapsed: number;
}

export class WaveManager {
  private waves: WaveConfig[] = [];
  private currentWave = 0;
  private activeGroups: ActiveGroup[] = [];
  private waveInProgress = false;
  private endless = false;

  constructor(
    private enemyManager: EnemyManager,
    private economy: EconomyManager,
  ) {}

  public load(waves: WaveConfig[]): void {
    this.waves = waves;
    this.currentWave = 0;
    this.activeGroups = [];
    this.waveInProgress = false;
    this.endless = false;
  }

  public startEndless(): void {
    this.waves = [];
    this.currentWave = 0;
    this.activeGroups = [];
    this.waveInProgress = false;
    this.endless = true;
  }

  public isEndless(): boolean {
    return this.endless;
  }

  public startWave(): boolean {
    if (this.waveInProgress) return false;

    let wave: WaveConfig;
    if (this.endless) {
      wave = this.generateEndlessWave(this.currentWave + 1);
    } else {
      if (this.currentWave >= this.waves.length) return false;
      wave = this.waves[this.currentWave];
    }

    this.activeGroups = wave.groups.map(g => ({
      ...g,
      spawned: 0,
      elapsed: g.delay,
    }));
    this.waveInProgress = true;
    eventBus.emit('wave:started', wave.wave);
    return true;
  }

  private generateEndlessWave(waveNumber: number): WaveConfig {
    const groups: WaveGroup[] = [];
    const difficulty = Math.pow(1.08, waveNumber);
    const baseCount = Math.min(5 + Math.floor(waveNumber * 0.8), 25);

    // 基础敌人群
    const basicTypes = ['slime', 'wolf', 'orc'];
    const type = basicTypes[Math.floor(waveNumber / 3) % basicTypes.length];
    groups.push({
      type,
      count: Math.floor(baseCount),
      interval: Math.max(0.3, 0.8 - waveNumber * 0.02),
      delay: 0,
    });

    // 飞行敌人
    if (waveNumber >= 3 && waveNumber % 3 === 0) {
      groups.push({
        type: 'flyer',
        count: Math.floor(3 + waveNumber * 0.4),
        interval: 0.7,
        delay: 2,
      });
    }

    // 高级敌人
    if (waveNumber >= 5) {
      const advanced = ['shielder', 'ghost', 'fireElemental'];
      groups.push({
        type: advanced[waveNumber % advanced.length],
        count: Math.floor(2 + waveNumber * 0.25),
        interval: 1.0,
        delay: 4,
      });
    }

    // Boss 每 5 波
    if (waveNumber % 5 === 0) {
      groups.push({
        type: 'boss',
        count: 1 + Math.floor(waveNumber / 15),
        interval: 1.5,
        delay: 6,
      });
    }

    const bonus = Math.floor(50 * difficulty);
    return { wave: waveNumber, groups, bonus };
  }

  public update(dt: number): void {
    if (!this.waveInProgress) return;

    let activeCount = 0;

    for (const group of this.activeGroups) {
      if (group.spawned >= group.count) continue;

      group.elapsed += dt;
      activeCount++;

      while (group.elapsed >= group.interval && group.spawned < group.count) {
        this.enemyManager.spawnEnemy(group.type);
        group.spawned++;
        group.elapsed -= group.interval;
      }
    }

    if (activeCount === 0 && this.enemyManager.getEnemies().length === 0) {
      this.completeWave();
    }
  }

  private completeWave(): void {
    let bonus = 0;
    if (this.endless) {
      bonus = Math.floor(50 * Math.pow(1.08, this.currentWave + 1));
    } else {
      bonus = this.waves[this.currentWave]?.bonus ?? 0;
    }

    this.economy.addWaveBonus(bonus);
    this.waveInProgress = false;
    this.currentWave++;
    eventBus.emit('wave:complete', { wave: this.currentWave, bonus, current: this.currentWave });
  }

  public canStartWave(): boolean {
    return !this.waveInProgress && (this.endless || this.currentWave < this.waves.length);
  }

  public getCurrentWave(): number { return this.currentWave; }
  public getTotalWaves(): number { return this.waves.length; }
  public isWaveInProgress(): boolean { return this.waveInProgress; }
  public getCurrentWaveConfig(): WaveConfig | undefined {
    return this.waves[this.currentWave];
  }
}
