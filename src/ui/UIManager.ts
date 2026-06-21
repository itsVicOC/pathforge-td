import { COLORS } from '../config/gameConfig';
import type { CanvasRenderer } from '../renderer/CanvasRenderer';
import { eventBus } from '../core/EventBus';
import { StateManager } from '../core/StateManager';
import { EconomyManager } from '../systems/EconomyManager';
import { TowerManager } from '../systems/TowerManager';
import { WaveManager } from '../systems/WaveManager';
import { Tower } from '../entities/Tower';

export class UIManager {
  private selectedExistingTower?: Tower;
  private wavePreviewTime = 0;

  constructor(
    private state: StateManager,
    private economy: EconomyManager,
    private towerManager: TowerManager,
    private waveManager: WaveManager,
  ) {
    this.bindEvents();
  }

  public handleClick(pixelX: number, pixelY: number): boolean {
    return this.handleUIClick(pixelX, pixelY);
  }

  private bindEvents(): void {
    // click is handled via Game -> handleClick
  }

  public selectExistingTower(tower: Tower): void {
    this.selectedExistingTower = tower;
    this.state.selectTower(undefined);
  }

  public update(dt: number): void {
    this.wavePreviewTime += dt;
  }

  public render(renderer: CanvasRenderer): void {
    this.drawHud(renderer);
    this.drawBuildMenu(renderer);

    if (this.selectedExistingTower) {
      this.drawTowerPanel(renderer, this.selectedExistingTower);
    }

    const phase = this.state.getState().phase;
    if (phase === 'victory') {
      this.drawModal(renderer, '胜利！', '按 F5 重新开始');
    } else if (phase === 'defeat') {
      this.drawModal(renderer, '失败', '按 F5 重新开始');
    }
  }

  private drawHud(renderer: CanvasRenderer): void {
    const state = this.state.getState();

    renderer.drawRect(0, 0, 960, 40, COLORS.uiBg);
    renderer.drawText(`❤ ${state.lives}`, 20, 26, { color: COLORS.lives, font: 'bold 16px monospace' });
    renderer.drawText(`🪙 ${this.economy.getGold()}`, 120, 26, { color: COLORS.gold, font: 'bold 16px monospace' });
    renderer.drawText(`波次: ${Math.min(state.wave + 1, state.totalWaves)}/${state.totalWaves}`, 260, 26);

    if (state.paused) {
      renderer.drawText('暂停', 400, 26, { color: '#ff0' });
    }

    // 开始波次按钮
    const canStart = this.waveManager.canStartWave();
    renderer.drawButton(780, 5, 120, 30, canStart ? '开始波次 (Space)' : '战斗中', !canStart);
  }

  private drawBuildMenu(renderer: CanvasRenderer): void {
    const configs = this.towerManager.getAllConfigs();
    const state = this.state.getState();
    const startX = 10;
    const startY = 460;
    const size = 50;
    const gap = 10;

    renderer.drawRect(0, 450, 960, 90, COLORS.uiBg);
    renderer.drawText('选择防御塔:', 10, 470, { font: '12px monospace' });

    let i = 0;
    for (const [id, config] of Object.entries(configs)) {
      const x = startX + i * (size + gap);
      const y = startY + 10;
      const selected = state.selectedTowerId === id;
      const affordable = this.economy.canAfford(config.cost);

      renderer.drawButton(x, y, size, size, '', selected);
      renderer.drawRect(x + 5, y + 5, size - 10, size - 20, config.color);
      renderer.drawText(config.name.slice(0, 2), x + size / 2, y + size - 8, {
        font: '10px monospace',
        align: 'center',
        color: affordable ? COLORS.text : '#888',
      });
      renderer.drawText(`${config.cost}`, x + size / 2, y - 5, {
        font: '10px monospace',
        align: 'center',
        color: affordable ? COLORS.gold : '#f55',
      });
      i++;
    }
  }

  private drawTowerPanel(renderer: CanvasRenderer, tower: Tower): void {
    const x = 680;
    const y = 50;
    const w = 260;
    const h = 160;

    renderer.drawRect(x, y, w, h, COLORS.uiBg);
    renderer.drawText(`${tower.config.name} (Lv.${tower.level})`, x + 10, y + 25, { font: 'bold 14px monospace' });
    renderer.drawText(`伤害: ${tower.getDamage()}`, x + 10, y + 50);
    renderer.drawText(`射程: ${tower.getRange().toFixed(1)}`, x + 10, y + 70);
    renderer.drawText(`攻速: ${tower.getFireRate().toFixed(2)}`, x + 10, y + 90);

    const upgrade = tower.getNextUpgrade();
    if (upgrade) {
      const canAfford = this.economy.canAfford(upgrade.cost);
      renderer.drawButton(x + 10, y + 110, 110, 35, `升级 ${upgrade.cost}`, !canAfford);
    }

    renderer.drawButton(x + 130, y + 110, 100, 35, `出售 ${tower.getSellValue()}`, false);
  }

  private drawModal(renderer: CanvasRenderer, title: string, subtitle: string): void {
    renderer.drawRect(0, 0, 960, 540, 'rgba(0, 0, 0, 0.7)');
    renderer.drawRect(330, 200, 300, 140, COLORS.uiBg);
    renderer.drawText(title, 480, 250, { font: 'bold 32px monospace', align: 'center' });
    renderer.drawText(subtitle, 480, 290, { align: 'center', color: '#aaa' });
  }

  private handleUIClick(x: number, y: number): boolean {
    // 开始波次按钮
    if (x >= 780 && x <= 900 && y >= 5 && y <= 35) {
      eventBus.emit('ui:startWave');
      return true;
    }

    // 建造菜单
    if (y >= 460 && y <= 550) {
      const configs = this.towerManager.getAllConfigs();
      const startX = 10;
      const startY = 460;
      const size = 50;
      const gap = 10;

      let i = 0;
      for (const id of Object.keys(configs)) {
        const bx = startX + i * (size + gap);
        const by = startY + 10;
        if (x >= bx && x <= bx + size && y >= by && y <= by + size) {
          eventBus.emit('ui:selectTower', { towerId: id });
          this.selectedExistingTower = undefined;
          return true;
        }
        i++;
      }
    }

    // 塔面板按钮
    if (this.selectedExistingTower) {
      const px = 680;
      const py = 50;

      // 升级按钮
      const upgrade = this.selectedExistingTower.getNextUpgrade();
      if (upgrade && x >= px + 10 && x <= px + 120 && y >= py + 110 && y <= py + 145) {
        if (this.towerManager.upgradeTower(this.selectedExistingTower)) {
          if (!this.selectedExistingTower.getNextUpgrade()) {
            this.selectedExistingTower = undefined;
          }
        }
        return true;
      }

      // 出售按钮
      if (x >= px + 130 && x <= px + 230 && y >= py + 110 && y <= py + 145) {
        this.towerManager.sellTower(this.selectedExistingTower);
        this.selectedExistingTower = undefined;
        return true;
      }
    }

    return false;
  }
}
