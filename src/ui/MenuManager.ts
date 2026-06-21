import { eventBus } from '../core/EventBus';
import { LEVEL_CONFIGS } from '../config/levels';
import { ACHIEVEMENTS } from '../config/achievements';
import type { SaveData } from '../types';

export class MenuManager {
  private screens: Map<string, HTMLElement> = new Map();
  private onLevelSelect?: (levelId: string) => void;
  private onEndlessStart?: () => void;
  private saveData: SaveData | null = null;

  constructor() {
    this.initScreens();
    this.bindButtons();
    this.bindSettings();
  }

  public setSaveData(data: SaveData | null): void {
    this.saveData = data;
    this.updateLevelSelect();
    this.updateStatsScreen();
    this.updateSettingsScreen();
  }

  public setLevelSelectCallback(callback: (levelId: string) => void): void {
    this.onLevelSelect = callback;
  }

  public setEndlessStartCallback(callback: () => void): void {
    this.onEndlessStart = callback;
  }

  public showScreen(screenId: string): void {
    for (const screen of this.screens.values()) {
      screen.classList.remove('active');
    }
    const target = this.screens.get(screenId);
    if (target) {
      target.classList.add('active');
      if (screenId === 'stats-screen') this.updateStatsScreen();
      if (screenId === 'settings-screen') this.updateSettingsScreen();
    }
  }

  public hideAll(): void {
    for (const screen of this.screens.values()) {
      screen.classList.remove('active');
    }
  }

  public showPauseMenu(): void {
    this.showScreen('pause-menu');
  }

  public showGameOver(victory: boolean, stats: { wave: number; kills: number }): void {
    const title = document.getElementById('game-over-title')!;
    title.textContent = victory ? '胜利！' : '失败';
    title.style.color = victory ? '#ffd700' : '#ff5252';

    const statsEl = document.getElementById('game-over-stats')!;
    statsEl.textContent = `完成波次: ${stats.wave} | 击杀敌人: ${stats.kills}`;

    this.showScreen('game-over');
  }

  private initScreens(): void {
    const screenIds = ['main-menu', 'level-select', 'pause-menu', 'game-over', 'stats-screen', 'settings-screen'];
    for (const id of screenIds) {
      const el = document.getElementById(id);
      if (el) this.screens.set(id, el);
    }
  }

  private bindButtons(): void {
    document.getElementById('btn-campaign')?.addEventListener('click', () => {
      this.updateLevelSelect();
      this.showScreen('level-select');
    });

    document.getElementById('btn-endless')?.addEventListener('click', () => {
      this.hideAll();
      this.onEndlessStart?.();
    });

    document.getElementById('btn-back-main')?.addEventListener('click', () => {
      this.showScreen('main-menu');
    });

    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.hideAll();
      eventBus.emit('menu:resume');
    });

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.hideAll();
      eventBus.emit('menu:restart');
    });

    document.getElementById('btn-quit')?.addEventListener('click', () => {
      this.showScreen('main-menu');
      eventBus.emit('menu:quit');
    });

    document.getElementById('btn-retry')?.addEventListener('click', () => {
      this.hideAll();
      eventBus.emit('menu:restart');
    });

    document.getElementById('btn-back-levels')?.addEventListener('click', () => {
      this.updateLevelSelect();
      this.showScreen('level-select');
      eventBus.emit('menu:levels');
    });

    document.getElementById('btn-stats')?.addEventListener('click', () => {
      this.updateStatsScreen();
      this.showScreen('stats-screen');
    });

    document.getElementById('btn-back-main-stats')?.addEventListener('click', () => {
      this.showScreen('main-menu');
    });

    document.getElementById('btn-settings')?.addEventListener('click', () => {
      this.updateSettingsScreen();
      this.showScreen('settings-screen');
    });

    document.getElementById('btn-back-main-settings')?.addEventListener('click', () => {
      this.showScreen('main-menu');
    });

    document.getElementById('btn-reset-settings')?.addEventListener('click', () => {
      eventBus.emit('settings:reset');
    });
  }

  private bindSettings(): void {
    const bindSlider = (id: string, event: string, valueId: string) => {
      const input = document.getElementById(id) as HTMLInputElement | null;
      if (!input) return;
      input.addEventListener('input', () => {
        const value = parseInt(input.value, 10) / 100;
        const valueEl = document.getElementById(valueId);
        if (valueEl) valueEl.textContent = `${input.value}%`;
        eventBus.emit(event as any, value);
      });
    };

    bindSlider('setting-master', 'settings:masterVolume', 'value-master');
    bindSlider('setting-music', 'settings:musicVolume', 'value-music');
    bindSlider('setting-sfx', 'settings:sfxVolume', 'value-sfx');

    const quality = document.getElementById('setting-quality') as HTMLSelectElement | null;
    quality?.addEventListener('change', () => {
      eventBus.emit('settings:quality', quality.value);
    });

    const pathPreview = document.getElementById('setting-path-preview') as HTMLInputElement | null;
    pathPreview?.addEventListener('change', () => {
      eventBus.emit('settings:pathPreview', pathPreview.checked);
    });

    const particles = document.getElementById('setting-particles') as HTMLInputElement | null;
    particles?.addEventListener('change', () => {
      eventBus.emit('settings:particles', particles.checked);
    });
  }

  private updateSettingsScreen(): void {
    const settings = this.saveData?.settings;
    if (!settings) return;

    const setSlider = (id: string, valueId: string, value: number) => {
      const input = document.getElementById(id) as HTMLInputElement | null;
      const valueEl = document.getElementById(valueId);
      if (input) input.value = String(Math.round(value * 100));
      if (valueEl) valueEl.textContent = `${Math.round(value * 100)}%`;
    };

    setSlider('setting-master', 'value-master', settings.masterVolume);
    setSlider('setting-music', 'value-music', settings.musicVolume);
    setSlider('setting-sfx', 'value-sfx', settings.sfxVolume);

    const quality = document.getElementById('setting-quality') as HTMLSelectElement | null;
    if (quality) quality.value = (settings as any).quality ?? 'high';

    const pathPreview = document.getElementById('setting-path-preview') as HTMLInputElement | null;
    if (pathPreview) pathPreview.checked = (settings as any).showPathPreview ?? true;

    const particles = document.getElementById('setting-particles') as HTMLInputElement | null;
    if (particles) particles.checked = (settings as any).particleEffects ?? true;
  }

  private updateLevelSelect(): void {
    const grid = document.getElementById('level-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const levels = Object.entries(LEVEL_CONFIGS);
    const campaign = this.saveData?.progress.campaign ?? {};

    for (let i = 0; i < levels.length; i++) {
      const [id, config] = levels[i];
      const isFirst = i === 0;
      const prevId = i > 0 ? levels[i - 1][0] : undefined;
      const prevStars = prevId ? this.getLevelStars(campaign[prevId]) : 999;
      const unlocked = isFirst || prevStars > 0;
      const stars = this.getLevelStars(campaign[id]);

      const btn = document.createElement('button');
      btn.className = `level-btn ${unlocked ? '' : 'locked'}`;
      btn.innerHTML = `
        <div>${config.name}</div>
        <div class="stars">${unlocked ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '🔒'}</div>
      `;

      if (unlocked) {
        btn.addEventListener('click', () => {
          this.hideAll();
          this.onLevelSelect?.(id);
        });
      }

      grid.appendChild(btn);
    }
  }

  private updateStatsScreen(): void {
    const summary = document.getElementById('stats-summary');
    const list = document.getElementById('achievements-list');
    if (!summary || !list) return;

    const stats = this.saveData?.stats ?? { totalKills: 0, highestWave: 0 };
    const campaign = this.saveData?.progress.campaign ?? {};
    const unlocked = this.saveData?.progress.achievements ?? [];

    let totalStars = 0;
    let completedLevels = 0;
    for (const levelProgress of Object.values(campaign)) {
      const stars = this.getLevelStars(levelProgress);
      totalStars += stars;
      if (stars > 0) completedLevels++;
    }

    summary.innerHTML = `
      <div>累计击杀: ${stats.totalKills}</div>
      <div>最高波次: ${stats.highestWave}</div>
      <div>通关关卡: ${completedLevels} / ${Object.keys(LEVEL_CONFIGS).length}</div>
      <div>获得星星: ${totalStars}</div>
    `;

    list.innerHTML = '';
    for (const ach of ACHIEVEMENTS) {
      const isUnlocked = unlocked.includes(ach.id);
      const div = document.createElement('div');
      div.style.cssText = `
        display: flex;
        align-items: center;
        padding: 10px;
        margin: 6px 0;
        background: ${isUnlocked ? 'rgba(76, 175, 80, 0.2)' : 'rgba(100, 100, 100, 0.2)'};
        border: 1px solid ${isUnlocked ? '#4caf50' : '#666'};
        opacity: ${isUnlocked ? 1 : 0.6};
      `;
      div.innerHTML = `
        <span style="font-size: 24px; margin-right: 12px;">${ach.icon}</span>
        <div>
          <div style="font-weight: bold;">${ach.name}</div>
          <div style="font-size: 12px; color: #aaa;">${ach.description}</div>
        </div>
        <div style="margin-left: auto;">${isUnlocked ? '✅' : '🔒'}</div>
      `;
      list.appendChild(div);
    }
  }

  private getLevelStars(levelProgress?: Record<string, number>): number {
    if (!levelProgress) return 0;
    return Math.max(0, ...Object.values(levelProgress));
  }
}
