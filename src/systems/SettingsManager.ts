import { eventBus } from '../core/EventBus';
import type { SaveData } from '../types';

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  quality: 'low' | 'medium' | 'high';
  showPathPreview: boolean;
  particleEffects: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 1,
  musicVolume: 0.4,
  sfxVolume: 0.7,
  quality: 'high',
  showPathPreview: true,
  particleEffects: true,
};

export class SettingsManager {
  private settings: GameSettings = { ...DEFAULT_SETTINGS };

  constructor(private saveData: SaveData) {
    this.load();
  }

  public getSettings(): GameSettings {
    return { ...this.settings };
  }

  public setMasterVolume(v: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, v));
    this.save();
    eventBus.emit('settings:changed', this.settings);
  }

  public setMusicVolume(v: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, v));
    this.save();
    eventBus.emit('settings:changed', this.settings);
  }

  public setSfxVolume(v: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, v));
    this.save();
    eventBus.emit('settings:changed', this.settings);
  }

  public setQuality(q: GameSettings['quality']): void {
    this.settings.quality = q;
    this.save();
    eventBus.emit('settings:changed', this.settings);
  }

  public setShowPathPreview(show: boolean): void {
    this.settings.showPathPreview = show;
    this.save();
    eventBus.emit('settings:changed', this.settings);
  }

  public setParticleEffects(enabled: boolean): void {
    this.settings.particleEffects = enabled;
    this.save();
    eventBus.emit('settings:changed', this.settings);
  }

  public reset(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
    eventBus.emit('settings:changed', this.settings);
  }

  private load(): void {
    if (this.saveData?.settings) {
      this.settings = { ...DEFAULT_SETTINGS, ...this.saveData.settings };
    }
  }

  private save(): void {
    this.saveData.settings = { ...this.settings };
    eventBus.emit('save:request');
  }
}
