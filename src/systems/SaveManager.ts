import type { SaveData } from '../types';

const SAVE_KEY = 'pathforge_save';

export class SaveManager {
  private data: SaveData;

  constructor() {
    this.data = this.load() ?? this.createDefaultSave();
  }

  public getData(): SaveData {
    return this.data;
  }

  public saveCurrent(): void {
    this.save(this.data);
  }

  public save(data?: SaveData): void {
    if (data) this.data = data;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save game', e);
    }
  }

  public load(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return this.migrate(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load game', e);
      return null;
    }
  }

  public reset(): void {
    this.data = this.createDefaultSave();
    this.save();
  }

  public export(): string {
    return btoa(JSON.stringify(this.data));
  }

  public import(code: string): boolean {
    try {
      const data = JSON.parse(atob(code));
      if (this.validate(data)) {
        this.data = data;
        this.save();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public completeLevel(levelId: string, stars: number): void {
    if (!this.data.progress.campaign[levelId]) {
      this.data.progress.campaign[levelId] = {};
    }
    const current = this.data.progress.campaign[levelId]['normal'] ?? 0;
    if (stars > current) {
      this.data.progress.campaign[levelId]['normal'] = stars;
    }
    this.data.stats.totalKills += 0; // updated externally
    this.save();
  }

  public updateStats(stats: { totalKills?: number; highestWave?: number }): void {
    if (stats.totalKills !== undefined) {
      this.data.stats.totalKills += stats.totalKills;
    }
    if (stats.highestWave !== undefined && stats.highestWave > this.data.stats.highestWave) {
      this.data.stats.highestWave = stats.highestWave;
    }
    this.save();
  }

  public unlockAchievement(id: string): void {
    if (!this.data.progress.achievements.includes(id)) {
      this.data.progress.achievements.push(id);
      this.save();
    }
  }

  public unlockTower(id: string): void {
    if (!this.data.progress.unlocks.includes(id)) {
      this.data.progress.unlocks.push(id);
      this.save();
    }
  }

  private createDefaultSave(): SaveData {
    return {
      version: 1,
      player: { level: 1, xp: 0 },
      progress: {
        campaign: {},
        unlocks: [],
        achievements: [],
      },
      settings: {
        masterVolume: 1,
        musicVolume: 0.4,
        sfxVolume: 0.7,
      },
      stats: {
        totalKills: 0,
        highestWave: 0,
      },
    };
  }

  private migrate(data: any): SaveData {
    if (!data.version) data.version = 1;
    if (!data.player) data.player = { level: 1, xp: 0 };
    if (!data.progress) data.progress = { campaign: {}, unlocks: [], achievements: [] };
    if (!data.settings) data.settings = { masterVolume: 1, musicVolume: 0.4, sfxVolume: 0.7 };
    if (!data.stats) data.stats = { totalKills: 0, highestWave: 0 };
    return data as SaveData;
  }

  private validate(data: any): boolean {
    return data && typeof data.version === 'number';
  }
}

export const saveManager = new SaveManager();
