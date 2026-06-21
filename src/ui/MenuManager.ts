import { eventBus } from '../core/EventBus';
import { LEVEL_CONFIGS } from '../config/levels';
import type { SaveData } from '../types';

export class MenuManager {
  private screens: Map<string, HTMLElement> = new Map();
  private onLevelSelect?: (levelId: string) => void;
  private saveData: SaveData | null = null;

  constructor() {
    this.initScreens();
    this.bindButtons();
  }

  public setSaveData(data: SaveData | null): void {
    this.saveData = data;
    this.updateLevelSelect();
  }

  public setLevelSelectCallback(callback: (levelId: string) => void): void {
    this.onLevelSelect = callback;
  }

  public showScreen(screenId: string): void {
    for (const screen of this.screens.values()) {
      screen.classList.remove('active');
    }
    const target = this.screens.get(screenId);
    if (target) target.classList.add('active');
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
    const screenIds = ['main-menu', 'level-select', 'pause-menu', 'game-over'];
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

    document.getElementById('btn-settings')?.addEventListener('click', () => {
      alert('设置功能即将上线');
    });
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

  private getLevelStars(levelProgress?: Record<string, number>): number {
    if (!levelProgress) return 0;
    return Math.max(0, ...Object.values(levelProgress));
  }
}
