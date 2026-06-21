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

  constructor(
    private enemyManager: EnemyManager,
    private economy: EconomyManager,
  ) {}

  public load(waves: WaveConfig[]): void {
    this.waves = waves;
    this.currentWave = 0;
    this.activeGroups = [];
    this.waveInProgress = false;
  }

  public startWave(): boolean {
    if (this.waveInProgress || this.currentWave >= this.waves.length) return false;

    const wave = this.waves[this.currentWave];
    this.activeGroups = wave.groups.map(g => ({
      ...g,
      spawned: 0,
      elapsed: g.delay,
    }));
    this.waveInProgress = true;
    eventBus.emit('wave:started', wave.wave);
    return true;
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
    const wave = this.waves[this.currentWave];
    this.economy.addWaveBonus(wave.bonus);
    this.waveInProgress = false;
    this.currentWave++;
    eventBus.emit('wave:complete', { wave: wave.wave, bonus: wave.bonus, current: this.currentWave });
  }

  public canStartWave(): boolean {
    return !this.waveInProgress && this.currentWave < this.waves.length;
  }

  public getCurrentWave(): number { return this.currentWave; }
  public getTotalWaves(): number { return this.waves.length; }
  public isWaveInProgress(): boolean { return this.waveInProgress; }
  public getCurrentWaveConfig(): WaveConfig | undefined {
    return this.waves[this.currentWave];
  }
}
