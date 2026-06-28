import { COLORS } from '../config/gameConfig';
import { ENEMY_CONFIGS } from '../config/enemies';
import type { CanvasRenderer } from '../renderer/CanvasRenderer';
import { eventBus } from '../core/EventBus';
import { StateManager } from '../core/StateManager';
import { EconomyManager } from '../systems/EconomyManager';
import { TowerManager } from '../systems/TowerManager';
import { WaveManager } from '../systems/WaveManager';
import { Tower } from '../entities/Tower';
import type { TargetPriority } from '../types';

export class UIManager {
  private selectedExistingTower?: Tower;
  private wavePreviewTime = 0;
  private placementNotice?: { text: string; color: string; ttl: number };
  private readonly fontFamily = '"Inter", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

  private static readonly BUILD_MENU_Y = 450;
  private static readonly TOWER_CARD_X = 12;
  private static readonly TOWER_CARD_Y = 468;
  private static readonly TOWER_CARD_SIZE = 52;
  private static readonly TOWER_CARD_GAP = 10;
  private static readonly HELP_X = 525;
  private static readonly HELP_Y = 458;
  private static readonly HELP_W = 415;
  private static readonly HELP_H = 76;

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

  public isPointInUI(pixelX: number, pixelY: number): boolean {
    if (pixelY >= UIManager.BUILD_MENU_Y) return true;
    if (pixelX >= 780 && pixelX <= 900 && pixelY >= 5 && pixelY <= 38) return true;
    if (pixelY >= 8 && pixelY <= 36 && pixelX >= 390 && pixelX <= 512) return true;
    if (this.selectedExistingTower && pixelX >= 660 && pixelX <= 940 && pixelY >= 52 && pixelY <= 267) return true;
    return false;
  }

  private bindEvents(): void {
    eventBus.on('tower:placementFailed', ({ reason }: { reason: string }) => {
      this.placementNotice = {
        text: this.getPlacementFailureText(reason),
        color: COLORS.uiDanger,
        ttl: 2.2,
      };
    });

    eventBus.on('tower:placed', () => {
      this.placementNotice = {
        text: '已建造。路径已重新计算。',
        color: '#6cd6a6',
        ttl: 1.4,
      };
    });
  }

  public selectExistingTower(tower: Tower): void {
    this.selectedExistingTower = tower;
    this.state.selectTower(undefined);
  }

  public update(dt: number): void {
    this.wavePreviewTime += dt;
    if (this.placementNotice) {
      this.placementNotice.ttl -= dt;
      if (this.placementNotice.ttl <= 0) this.placementNotice = undefined;
    }
  }

  public render(renderer: CanvasRenderer): void {
    this.drawHud(renderer);
    this.drawBuildMenu(renderer);

    if (this.selectedExistingTower) {
      renderer.drawRangeIndicator(this.selectedExistingTower);
      this.drawTowerPanel(renderer, this.selectedExistingTower);
    }

    this.drawWavePreview(renderer);

    const phase = this.state.getState().phase;
    if (phase === 'victory') {
      this.drawModal(renderer, '胜利！', '按 F5 重新开始');
    } else if (phase === 'defeat') {
      this.drawModal(renderer, '失败', '按 F5 重新开始');
    }
  }

  private drawHud(renderer: CanvasRenderer): void {
    const state = this.state.getState();

    const gradient = renderer.getContext().createLinearGradient(0, 0, 0, 44);
    gradient.addColorStop(0, 'rgba(12, 17, 20, 0.98)');
    gradient.addColorStop(1, 'rgba(20, 30, 31, 0.92)');
    renderer.drawRect(0, 0, 960, 44, gradient as any);

    const ctx = renderer.getContext();
    ctx.fillStyle = 'rgba(111, 139, 139, 0.22)';
    ctx.fillRect(0, 43, 960, 1);
    ctx.fillStyle = 'rgba(88, 185, 120, 0.85)';
    ctx.fillRect(0, 44, 960, 2);
    ctx.fillStyle = 'rgba(242, 201, 76, 0.72)';
    ctx.fillRect(0, 44, 180, 2);

    this.drawStatBox(renderer, 14, 8, COLORS.lives, 'CORE', `${state.lives}`);
    this.drawStatBox(renderer, 112, 8, COLORS.gold, 'GOLD', `${this.economy.getGold()}`);
    const waveText = this.waveManager.isEndless()
      ? `波次 ${state.wave}`
      : `波次 ${Math.min(state.wave + 1, state.totalWaves)}/${state.totalWaves}`;
    this.drawStatBox(renderer, 212, 8, COLORS.energy, 'WAVE', waveText, 126);

    this.drawSpeedControls(renderer, 350, 8);

    if (state.paused) {
      renderer.drawRoundRect(510, 8, 72, 28, 6, 'rgba(242,201,76,0.12)', 'rgba(242,201,76,0.55)');
      renderer.drawText('暂停', 546, 27, { color: COLORS.gold, font: `700 14px ${this.fontFamily}`, align: 'center' });
    }

    const canStart = this.waveManager.canStartWave();
    renderer.drawButton(780, 7, 120, 30, canStart ? '开始波次' : '战斗中', !canStart);
  }

  private drawStatBox(renderer: CanvasRenderer, x: number, y: number, color: string, label: string, value: string, width = 84): void {
    const ctx = renderer.getContext();

    const gradient = ctx.createLinearGradient(x, y, x, y + 28);
    gradient.addColorStop(0, 'rgba(255,255,255,0.085)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.28)');
    renderer.drawRoundRect(x, y, width, 28, 7, gradient, 'rgba(255,255,255,0.11)');

    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, 3, 26);
    renderer.drawText(label, x + 11, y + 11, { font: `700 8px ${this.fontFamily}`, color: COLORS.textMuted });
    renderer.drawText(value, x + 11, y + 23, { color, font: `800 15px ${this.fontFamily}` });
  }

  private drawSpeedControls(renderer: CanvasRenderer, x: number, y: number): void {
    renderer.drawText('速度', x, y + 19, { font: `700 11px ${this.fontFamily}`, color: COLORS.textMuted });

    const current = this.state.getState().timeScale;
    const speeds = [1, 2, 3];
    for (let i = 0; i < speeds.length; i++) {
      const bx = x + 40 + i * 42;
      const active = current === speeds[i];
      renderer.drawRoundRect(
        bx,
        y,
        36,
        28,
        6,
        active ? 'rgba(88, 185, 120, 0.38)' : 'rgba(0,0,0,0.28)',
        active ? COLORS.uiAccentHover : 'rgba(255,255,255,0.14)',
      );
      renderer.drawText(`${speeds[i]}x`, bx + 18, y + 19, {
        font: `800 12px ${this.fontFamily}`,
        align: 'center',
        color: active ? COLORS.text : COLORS.textMuted,
      });
    }
  }

  private drawBuildMenu(renderer: CanvasRenderer): void {
    const configs = this.towerManager.getAllConfigs();
    const state = this.state.getState();
    const startX = UIManager.TOWER_CARD_X;
    const startY = UIManager.TOWER_CARD_Y;
    const size = UIManager.TOWER_CARD_SIZE;
    const gap = UIManager.TOWER_CARD_GAP;

    const ctx = renderer.getContext();
    const gradient = ctx.createLinearGradient(0, 450, 0, 540);
    gradient.addColorStop(0, 'rgba(15, 21, 22, 0.82)');
    gradient.addColorStop(1, 'rgba(7, 10, 11, 0.98)');
    renderer.drawRect(0, 450, 960, 90, gradient as any);
    ctx.fillStyle = 'rgba(88, 185, 120, 0.72)';
    ctx.fillRect(0, 450, 960, 2);

    renderer.drawText('防御塔', 14, 461, { font: `800 12px ${this.fontFamily}`, color: '#dff7ea' });

    let i = 0;
    for (const [id, config] of Object.entries(configs)) {
      const x = startX + i * (size + gap);
      const y = startY;
      const selected = state.selectedTowerId === id;
      const affordable = this.economy.canAfford(config.cost);

      // 按钮背景
      const btnGradient = ctx.createLinearGradient(x, y, x, y + size);
      if (selected) {
        btnGradient.addColorStop(0, 'rgba(116, 210, 147, 0.38)');
        btnGradient.addColorStop(1, 'rgba(32, 93, 68, 0.78)');
      } else {
        btnGradient.addColorStop(0, 'rgba(39, 50, 48, 0.94)');
        btnGradient.addColorStop(1, 'rgba(17, 23, 24, 0.98)');
      }
      renderer.drawRoundRect(
        x,
        y,
        size,
        size,
        8,
        btnGradient,
        selected ? COLORS.uiAccentHover : affordable ? 'rgba(255,255,255,0.16)' : COLORS.uiDanger,
      );
      ctx.fillStyle = config.color;
      ctx.fillRect(x + 5, y + 5, size - 10, 3);

      if (!affordable) {
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
      }

      renderer.drawTowerIcon(id, config.color, x + size / 2, y + 23, 30);

      // 快捷键
      if (i < 9) {
        renderer.drawRoundRect(x + 3, y + 3, 13, 13, 4, 'rgba(0,0,0,0.42)', 'rgba(255,255,255,0.12)');
        renderer.drawText(`${i + 1}`, x + 9.5, y + 13, { font: `800 9px ${this.fontFamily}`, color: COLORS.textMuted, align: 'center' });
      }

      // 定位标签
      renderer.drawText(config.role ?? '通用', x + size / 2, y + size - 17, {
        font: `800 9px ${this.fontFamily}`,
        align: 'center',
        color: selected ? '#c8f7df' : COLORS.textMuted,
      });

      // 名称
      renderer.drawText(config.name.slice(0, 2), x + size / 2, y + size - 6, {
        font: `800 10px ${this.fontFamily}`,
        align: 'center',
        color: affordable ? '#eef9f3' : COLORS.uiDanger,
      });

      // 成本
      renderer.drawText(`${config.cost}`, x + size / 2, y - 4, {
        font: `800 10px ${this.fontFamily}`,
        align: 'center',
        color: affordable ? COLORS.gold : '#f55',
      });
      i++;
    }

    this.drawTowerHelpPanel(renderer);
  }

  private drawTowerHelpPanel(renderer: CanvasRenderer): void {
    const selectedTowerId = this.state.getState().selectedTowerId;
    const config = selectedTowerId ? this.towerManager.getTowerConfig(selectedTowerId) : undefined;
    const x = UIManager.HELP_X;
    const y = UIManager.HELP_Y;
    const w = UIManager.HELP_W;
    const h = UIManager.HELP_H;
    const ctx = renderer.getContext();

    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, 'rgba(31, 42, 40, 0.96)');
    gradient.addColorStop(1, 'rgba(9, 14, 15, 0.99)');
    renderer.drawRoundRect(x, y, w, h, 8, gradient, config?.color ?? 'rgba(255,255,255,0.13)');

    if (!config) {
      renderer.drawText('塔作用说明', x + 12, y + 18, {
        font: `800 13px ${this.fontFamily}`,
        color: '#dff7ea',
      });
      renderer.drawText('点击底部塔卡查看：定位、攻击目标、特殊效果和推荐用途。', x + 12, y + 38, {
        font: `500 12px ${this.fontFamily}`,
        color: COLORS.text,
      });
      renderer.drawText('卡片标签：单体 / 范围 / 减速 / 对空 / 毒伤 / 狙杀 / 增益 / 控制', x + 12, y + 55, {
        font: `500 11px ${this.fontFamily}`,
        color: COLORS.textMuted,
      });
      if (this.placementNotice) {
        renderer.drawText(this.placementNotice.text, x + 12, y + 71, {
          font: `800 11px ${this.fontFamily}`,
          color: this.placementNotice.color,
        });
      }
      return;
    }

    ctx.fillStyle = config.color;
    ctx.fillRect(x + 10, y + 11, 4, 54);
    renderer.drawRoundRect(x + 22, y + 19, 34, 38, 7, 'rgba(0,0,0,0.25)', 'rgba(255,255,255,0.10)');
    renderer.drawTowerIcon(config.id, config.color, x + 34, y + 37, 32);
    renderer.drawText(`${config.name}  [${config.role ?? '通用'}]`, x + 58, y + 18, {
      font: `800 13px ${this.fontFamily}`,
      color: '#dff7ea',
    });
    renderer.drawText(`${this.getDamageTypeLabel(config.damageType)} | ${this.getTargetLabel(config.targetFlags)} | ${config.cost} 金币`, x + 58, y + 34, {
      font: `700 11px ${this.fontFamily}`,
      color: COLORS.gold,
    });

    const lines = this.wrapText(`${config.description ?? ''} ${config.special ?? ''} ${config.usage ?? ''}`, 30, 2);
    for (let i = 0; i < lines.length; i++) {
      renderer.drawText(lines[i], x + 58, y + 50 + i * 13, {
        font: `500 11px ${this.fontFamily}`,
        color: i === 0 ? COLORS.text : COLORS.textMuted,
      });
    }

    if (this.placementNotice) {
      renderer.drawText(this.placementNotice.text, x + 58, y + 73, {
        font: `800 11px ${this.fontFamily}`,
        color: this.placementNotice.color,
      });
    }
  }

  private wrapText(text: string, maxChars: number, maxLines: number): string[] {
    const compact = text.replace(/\s+/g, '');
    const lines: string[] = [];
    for (let i = 0; i < compact.length && lines.length < maxLines; i += maxChars) {
      lines.push(compact.slice(i, i + maxChars));
    }
    return lines;
  }

  private getDamageTypeLabel(type: string): string {
    switch (type) {
      case 'physical': return '物理伤害';
      case 'ice': return '冰霜伤害';
      case 'lightning': return '雷电伤害';
      case 'poison': return '毒素伤害';
      case 'true': return '辅助效果';
      case 'fire': return '火焰伤害';
      default: return '通用伤害';
    }
  }

  private getTargetLabel(flags: string[]): string {
    if (flags.includes('ground') && flags.includes('flying')) return '地面+飞行';
    if (flags.includes('flying')) return '只打飞行';
    if (flags.includes('ground')) return '只打地面';
    return '不直接攻击';
  }

  private getPlacementFailureText(reason: string): string {
    switch (reason) {
      case 'not_enough_gold': return '金币不足：先击败敌人或等待波次奖励。';
      case 'blocked_path': return '不能堵死路线：每个入口都必须通向核心。';
      case 'invalid_cell': return '这里不能建造：请选择绿色可建造格。';
      case 'unknown_tower': return '未知防御塔：请重新选择塔卡。';
      default: return '无法建造：请换一个位置。';
    }
  }

  private drawTowerPanel(renderer: CanvasRenderer, tower: Tower): void {
    const x = 660;
    const y = 52;
    const w = 280;
    const h = 215;
    const ctx = renderer.getContext();

    // 面板背景
    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, 'rgba(30, 41, 40, 0.97)');
    gradient.addColorStop(1, 'rgba(9, 13, 14, 0.99)');
    renderer.drawRoundRect(x, y, w, h, 8, gradient, 'rgba(255,255,255,0.15)');

    // 顶部装饰条
    ctx.fillStyle = tower.config.color;
    ctx.fillRect(x + 1, y + 1, w - 2, 4);

    renderer.drawText(`${tower.config.name}`, x + 14, y + 26, { font: `800 16px ${this.fontFamily}` });
    renderer.drawText(`Lv.${tower.level}`, x + w - 50, y + 26, { font: `800 14px ${this.fontFamily}`, color: COLORS.gold });

    const stats = [
      { label: '伤害', value: tower.getDamage() },
      { label: '射程', value: tower.getRange().toFixed(1) },
      { label: '攻速', value: tower.getFireRate().toFixed(2) },
    ];

    for (let i = 0; i < stats.length; i++) {
      const sx = x + 14 + i * 90;
      renderer.drawRoundRect(sx - 4, y + 39, 74, 40, 6, 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.08)');
      renderer.drawText(stats[i].label, sx, y + 52, { font: `600 11px ${this.fontFamily}`, color: COLORS.textMuted });
      renderer.drawText(`${stats[i].value}`, sx, y + 70, { font: `800 14px ${this.fontFamily}` });
    }

    const upgrade = tower.getNextUpgrade();
    const inCombat = this.waveManager.isWaveInProgress();
    if (upgrade) {
      const canAfford = this.economy.canAfford(upgrade.cost);
      renderer.drawButton(x + 14, y + 110, 120, 38, inCombat ? '战斗中' : `升级 ${upgrade.cost}`, inCombat || !canAfford);
    } else {
      renderer.drawButton(x + 14, y + 110, 120, 38, '满级', true);
    }

    const refundRate = inCombat ? 0.5 : 0.7;
    renderer.drawButton(x + 146, y + 110, 120, 38, `出售 ${tower.getSellValue(refundRate)}`, false);

    renderer.drawText('目标', x + 14, y + 164, { font: `700 11px ${this.fontFamily}`, color: COLORS.textMuted });
    renderer.drawButton(x + 70, y + 146, 196, 34, this.getPriorityLabel(tower.targetPriority), false);
    renderer.drawText(this.getPriorityHint(tower.targetPriority), x + 14, y + 203, {
      font: `500 11px ${this.fontFamily}`,
      color: COLORS.textMuted,
    });
  }

  private drawWavePreview(renderer: CanvasRenderer): void {
    const wave = this.waveManager.getNextWavePreview();
    if (!wave) return;

    const x = this.selectedExistingTower ? 660 : 690;
    const y = this.selectedExistingTower ? 282 : 54;
    const w = this.selectedExistingTower ? 280 : 250;
    const h = 86 + wave.groups.length * 24;
    const ctx = renderer.getContext();

    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, 'rgba(30, 41, 40, 0.94)');
    gradient.addColorStop(1, 'rgba(9, 13, 14, 0.97)');
    renderer.drawRoundRect(x, y, w, h, 8, gradient, 'rgba(255,255,255,0.14)');

    ctx.fillStyle = 'rgba(88, 185, 120, 0.72)';
    ctx.fillRect(x + 1, y + 1, w - 2, 3);

    renderer.drawText(`下一波 ${wave.wave}`, x + 12, y + 22, { font: `800 14px ${this.fontFamily}`, color: '#dff7ea' });
    renderer.drawText(`奖励 ${wave.bonus}`, x + w - 74, y + 22, { font: `800 12px ${this.fontFamily}`, color: COLORS.gold });
    renderer.drawText(this.getWaveAdvice(wave.groups.map(group => group.type)), x + 12, y + 40, {
      font: `800 11px ${this.fontFamily}`,
      color: '#ffd54f',
    });

    for (let i = 0; i < wave.groups.length; i++) {
      const group = wave.groups[i];
      const enemy = ENEMY_CONFIGS[group.type];
      const gy = y + 70 + i * 24;
      renderer.drawRoundRect(x + 10, gy - 16, w - 20, 18, 5, 'rgba(255,255,255,0.045)');
      ctx.fillStyle = enemy?.color ?? COLORS.textMuted;
      ctx.fillRect(x + 15, gy - 11, 9, 9);
      renderer.drawText(`${enemy?.name ?? group.type} x${group.count}`, x + 32, gy, {
        font: `600 12px ${this.fontFamily}`,
        color: COLORS.text,
      });
      renderer.drawText(`+${group.delay.toFixed(0)}s`, x + w - 45, gy, {
        font: `500 11px ${this.fontFamily}`,
        color: COLORS.textMuted,
      });
    }
  }

  private getWaveAdvice(enemyTypes: string[]): string {
    const enemies = enemyTypes.map(type => ENEMY_CONFIGS[type]).filter(Boolean);
    if (enemies.some(enemy => enemy.flying)) return '推荐：雷塔 / 狙击塔 / 毒塔对空';
    if (enemyTypes.some(type => type === 'shielder' || type === 'orc' || type.includes('Boss') || type === 'boss')) {
      return '推荐：毒塔 + 狙击塔点杀高血量';
    }
    if (enemyTypes.some(type => type === 'wolf' || type === 'bomber' || type === 'assassin')) return '推荐：冰塔减速，雷塔补漏';
    if (enemyTypes.some(type => type === 'healer')) return '推荐：狙击塔优先强敌/治疗者';
    if (enemyTypes.some(type => type === 'slime')) return '推荐：箭塔铺火力，炮塔清集群';
    return '推荐：检查路径长度和对空覆盖';
  }

  private getPriorityLabel(priority: TargetPriority): string {
    switch (priority) {
      case 'first': return '优先：近核心';
      case 'last': return '优先：殿后';
      case 'strong': return '优先：强壮';
      case 'weak': return '优先：虚弱';
      case 'nearest': return '优先：最近';
    }
  }

  private getPriorityHint(priority: TargetPriority): string {
    switch (priority) {
      case 'first': return '近核心：默认防漏，适合大多数输出塔。';
      case 'last': return '殿后：延后集火，让敌人留在火力区。';
      case 'strong': return '强壮：优先打精英、Boss 和治疗者。';
      case 'weak': return '虚弱：优先补刀，减少漏怪。';
      case 'nearest': return '最近：守转角或核心前更稳定。';
    }
  }

  private drawModal(renderer: CanvasRenderer, title: string, subtitle: string): void {
    const ctx = renderer.getContext();

    renderer.drawRect(0, 0, 960, 540, 'rgba(3, 5, 6, 0.72)');

    const x = 315;
    const y = 188;
    const w = 330;
    const h = 164;
    const victory = title === '胜利！';

    const glow = victory ? 'rgba(242, 201, 76, 0.22)' : 'rgba(255, 93, 93, 0.18)';
    const accent = victory ? COLORS.gold : COLORS.lives;

    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 26;
    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, 'rgba(36, 48, 45, 0.98)');
    gradient.addColorStop(1, 'rgba(8, 12, 13, 0.99)');
    renderer.drawRoundRect(x, y, w, h, 10, gradient, 'rgba(255,255,255,0.14)');
    ctx.restore();

    ctx.fillStyle = accent;
    ctx.fillRect(x + 1, y + 1, w - 2, 4);
    renderer.drawText(victory ? '防线稳固' : '核心失守', 480, y + 32, {
      font: `700 13px ${this.fontFamily}`,
      align: 'center',
      color: COLORS.textMuted,
    });
    renderer.drawText(title, 480, y + 84, {
      font: `900 36px ${this.fontFamily}`,
      align: 'center',
      color: accent,
    });
    renderer.drawText(subtitle, 480, y + 120, {
      align: 'center',
      color: COLORS.textMuted,
      font: `600 14px ${this.fontFamily}`,
    });
    renderer.drawText('结算菜单已打开', 480, y + 144, {
      align: 'center',
      color: COLORS.textMuted,
      font: `500 11px ${this.fontFamily}`,
    });
  }

  private handleUIClick(x: number, y: number): boolean {
    // 速度按钮
    if (y >= 8 && y <= 36) {
      const speeds = [1, 2, 3];
      for (let i = 0; i < speeds.length; i++) {
        const bx = 390 + i * 42;
        if (x >= bx && x <= bx + 36) {
          eventBus.emit('ui:setSpeed', { scale: speeds[i] });
          return true;
        }
      }
    }

    // 开始波次按钮
    if (x >= 780 && x <= 900 && y >= 5 && y <= 35) {
      eventBus.emit('ui:startWave');
      return true;
    }

    // 建造菜单
    if (y >= UIManager.BUILD_MENU_Y) {
      const configs = this.towerManager.getAllConfigs();
      const startX = UIManager.TOWER_CARD_X;
      const startY = UIManager.TOWER_CARD_Y;
      const size = UIManager.TOWER_CARD_SIZE;
      const gap = UIManager.TOWER_CARD_GAP;

      let i = 0;
      for (const id of Object.keys(configs)) {
        const bx = startX + i * (size + gap);
        const by = startY;
        if (x >= bx && x <= bx + size && y >= by && y <= by + size) {
          eventBus.emit('ui:selectTower', { towerId: id });
          this.selectedExistingTower = undefined;
          return true;
        }
        i++;
      }
      return true;
    }

    // 塔面板按钮
    if (this.selectedExistingTower) {
      const px = 660;
      const py = 52;

      // 升级按钮
      const upgrade = this.selectedExistingTower.getNextUpgrade();
      if (upgrade && x >= px + 14 && x <= px + 134 && y >= py + 110 && y <= py + 148) {
        if (!this.waveManager.isWaveInProgress() && this.towerManager.upgradeTower(this.selectedExistingTower)) {
          if (!this.selectedExistingTower.getNextUpgrade()) {
            // 保持面板打开，方便玩家查看满级属性。
          }
        }
        return true;
      }

      // 出售按钮
      if (x >= px + 146 && x <= px + 266 && y >= py + 110 && y <= py + 148) {
        const refundRate = this.waveManager.isWaveInProgress() ? 0.5 : 0.7;
        this.towerManager.sellTower(this.selectedExistingTower, refundRate);
        this.selectedExistingTower = undefined;
        return true;
      }

      // 目标优先级按钮
      if (x >= px + 70 && x <= px + 266 && y >= py + 146 && y <= py + 180) {
        this.selectedExistingTower.cycleTargetPriority();
        return true;
      }
    }

    return false;
  }
}
