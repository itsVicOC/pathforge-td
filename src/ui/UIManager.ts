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
      renderer.drawRangeIndicator(this.selectedExistingTower);
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

    // HUD 背景 - 顶部条带渐变
    const gradient = renderer.getContext().createLinearGradient(0, 0, 0, 44);
    gradient.addColorStop(0, 'rgba(20, 20, 35, 0.95)');
    gradient.addColorStop(1, 'rgba(20, 20, 35, 0.75)');
    renderer.drawRect(0, 0, 960, 44, gradient as any);

    // 底部装饰线
    renderer.getContext().fillStyle = COLORS.uiAccent;
    renderer.getContext().fillRect(0, 44, 960, 2);

    // 生命
    this.drawStatBox(renderer, 16, 8, COLORS.lives, '❤', `${state.lives}`);
    // 金币
    this.drawStatBox(renderer, 110, 8, COLORS.gold, '🪙', `${this.economy.getGold()}`);
    // 波次
    const waveText = this.waveManager.isEndless()
      ? `波次 ${state.wave}`
      : `波次 ${Math.min(state.wave + 1, state.totalWaves)}/${state.totalWaves}`;
    this.drawStatBox(renderer, 210, 8, COLORS.energy, '⚡', waveText);

    if (state.paused) {
      renderer.drawText('⏸ 暂停', 400, 27, { color: '#ffeb3b', font: 'bold 16px "Courier New", monospace' });
    }

    // 开始波次按钮
    const canStart = this.waveManager.canStartWave();
    renderer.drawButton(780, 7, 120, 30, canStart ? '开始波次' : '战斗中', !canStart);
  }

  private drawStatBox(renderer: CanvasRenderer, x: number, y: number, color: string, icon: string, value: string): void {
    const ctx = renderer.getContext();

    // 背景
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x, y, 80, 28);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 80, 28);

    // 图标
    renderer.drawText(icon, x + 8, y + 20, { font: '14px "Courier New", monospace' });
    // 数值
    renderer.drawText(value, x + 30, y + 20, { color, font: 'bold 15px "Courier New", monospace' });
  }

  private drawBuildMenu(renderer: CanvasRenderer): void {
    const configs = this.towerManager.getAllConfigs();
    const state = this.state.getState();
    const startX = 12;
    const startY = 462;
    const size = 52;
    const gap = 10;

    // 底部面板背景
    const ctx = renderer.getContext();
    const gradient = ctx.createLinearGradient(0, 450, 0, 540);
    gradient.addColorStop(0, 'rgba(20, 20, 35, 0.85)');
    gradient.addColorStop(1, 'rgba(20, 20, 35, 0.95)');
    renderer.drawRect(0, 450, 960, 90, gradient as any);
    ctx.fillStyle = COLORS.uiAccent;
    ctx.fillRect(0, 450, 960, 2);

    renderer.drawText('选择防御塔', 12, 458, { font: 'bold 12px "Courier New", monospace', color: COLORS.textMuted });

    let i = 0;
    for (const [id, config] of Object.entries(configs)) {
      const x = startX + i * (size + gap);
      const y = startY + 6;
      const selected = state.selectedTowerId === id;
      const affordable = this.economy.canAfford(config.cost);

      // 按钮背景
      const btnGradient = ctx.createLinearGradient(x, y, x, y + size);
      if (selected) {
        btnGradient.addColorStop(0, 'rgba(76, 175, 80, 0.4)');
        btnGradient.addColorStop(1, 'rgba(76, 175, 80, 0.2)');
      } else {
        btnGradient.addColorStop(0, 'rgba(60, 60, 80, 0.9)');
        btnGradient.addColorStop(1, 'rgba(40, 40, 55, 0.9)');
      }
      ctx.fillStyle = btnGradient;
      ctx.fillRect(x, y, size, size);

      // 边框
      ctx.strokeStyle = selected ? COLORS.uiAccent : affordable ? COLORS.uiBorderLight : COLORS.uiDanger;
      ctx.lineWidth = selected ? 2 : 1;
      ctx.strokeRect(x, y, size, size);

      // 塔图标
      ctx.fillStyle = config.color;
      const iconSize = 24;
      const ix = x + (size - iconSize) / 2;
      const iy = y + 6;
      ctx.fillRect(ix, iy, iconSize, iconSize);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(ix, iy, iconSize, iconSize);

      // 快捷键
      if (i < 3) {
        renderer.drawText(`${i + 1}`, x + 4, y + 12, { font: 'bold 10px "Courier New", monospace', color: COLORS.textMuted });
      }

      // 名称
      renderer.drawText(config.name.slice(0, 2), x + size / 2, y + size - 6, {
        font: 'bold 10px "Courier New", monospace',
        align: 'center',
        color: affordable ? COLORS.text : COLORS.uiDanger,
      });

      // 成本
      renderer.drawText(`${config.cost}`, x + size / 2, y - 4, {
        font: 'bold 10px "Courier New", monospace',
        align: 'center',
        color: affordable ? COLORS.gold : '#f55',
      });
      i++;
    }
  }

  private drawTowerPanel(renderer: CanvasRenderer, tower: Tower): void {
    const x = 660;
    const y = 52;
    const w = 280;
    const h = 170;
    const ctx = renderer.getContext();

    // 面板背景
    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, 'rgba(25, 25, 42, 0.95)');
    gradient.addColorStop(1, 'rgba(15, 15, 28, 0.98)');
    renderer.drawRect(x, y, w, h, gradient as any);

    // 边框
    ctx.strokeStyle = COLORS.uiBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // 顶部装饰条
    ctx.fillStyle = tower.config.color;
    ctx.fillRect(x, y, w, 4);

    renderer.drawText(`${tower.config.name}`, x + 14, y + 26, { font: 'bold 16px "Courier New", monospace' });
    renderer.drawText(`Lv.${tower.level}`, x + w - 50, y + 26, { font: 'bold 14px "Courier New", monospace', color: COLORS.gold });

    const stats = [
      { label: '伤害', value: tower.getDamage() },
      { label: '射程', value: tower.getRange().toFixed(1) },
      { label: '攻速', value: tower.getFireRate().toFixed(2) },
    ];

    for (let i = 0; i < stats.length; i++) {
      const sx = x + 14 + i * 90;
      renderer.drawText(stats[i].label, sx, y + 52, { font: '11px "Courier New", monospace', color: COLORS.textMuted });
      renderer.drawText(`${stats[i].value}`, sx, y + 70, { font: 'bold 14px "Courier New", monospace' });
    }

    const upgrade = tower.getNextUpgrade();
    if (upgrade) {
      const canAfford = this.economy.canAfford(upgrade.cost);
      renderer.drawButton(x + 14, y + 110, 120, 38, `升级 ${upgrade.cost}`, !canAfford);
    }

    renderer.drawButton(x + 146, y + 110, 120, 38, `出售 ${tower.getSellValue()}`, false);
  }

  private drawModal(renderer: CanvasRenderer, title: string, subtitle: string): void {
    const ctx = renderer.getContext();

    // 暗背景
    renderer.drawRect(0, 0, 960, 540, 'rgba(0, 0, 0, 0.75)');

    // 面板
    const x = 330;
    const y = 190;
    const w = 300;
    const h = 160;

    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, 'rgba(30, 30, 50, 0.98)');
    gradient.addColorStop(1, 'rgba(20, 20, 35, 0.98)');
    renderer.drawRect(x, y, w, h, gradient as any);

    ctx.strokeStyle = COLORS.uiAccent;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    renderer.drawText(title, 480, 250, { font: 'bold 36px "Courier New", monospace', align: 'center', color: title === '胜利！' ? COLORS.gold : COLORS.lives });
    renderer.drawText(subtitle, 480, 290, { align: 'center', color: COLORS.textMuted, font: '14px "Courier New", monospace' });
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
