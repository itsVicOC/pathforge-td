import { TILE_SIZE, COLORS } from '../config/gameConfig';
import type { Grid } from '../systems/Grid';
import type { Tower } from '../entities/Tower';
import type { Enemy } from '../entities/Enemy';
import type { Projectile } from '../entities/Projectile';
import type { Particle, HitEffect, BeamEffect } from '../entities/Effect';
import type { Vec2 } from '../types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
  }

  public clear(): void {
    this.ctx.fillStyle = COLORS.bgDark;
    this.ctx.fillRect(0, 0, 960, 540);
  }

  public drawGrid(grid: Grid): void {
    for (const row of grid.getCells()) {
      for (const cell of row) {
        const x = cell.x * TILE_SIZE;
        const y = cell.y * TILE_SIZE;

        this.drawCellBase(x, y, cell.type);
        this.drawCellDetail(x, y, cell.type);
      }
    }
  }

  private drawCellBase(x: number, y: number, type: string): void {
    const color = this.getCellColor(type);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);

    // 内阴影/高光
    if (type === 'buildable' || type === 'path') {
      this.ctx.fillStyle = 'rgba(255,255,255,0.03)';
      this.ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, 3);
      this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
      this.ctx.fillRect(x + 1, y + TILE_SIZE - 5, TILE_SIZE - 2, 4);
    }
  }

  private drawCellDetail(x: number, y: number, type: string): void {
    switch (type) {
      case 'buildable':
        // 小点纹理
        this.ctx.fillStyle = 'rgba(255,255,255,0.04)';
        this.ctx.fillRect(x + 8, y + 8, 3, 3);
        this.ctx.fillRect(x + 22, y + 20, 3, 3);
        break;
      case 'path':
        // 路径中间线
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.ctx.fillRect(x + 12, y + 14, 8, 4);
        break;
      case 'water':
        // 水波纹
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 6, y + 18);
        this.ctx.lineTo(x + 14, y + 18);
        this.ctx.moveTo(x + 18, y + 22);
        this.ctx.lineTo(x + 26, y + 22);
        this.ctx.stroke();
        break;
      case 'lava':
        // 岩浆亮点
        this.ctx.fillStyle = 'rgba(255,150,50,0.4)';
        this.ctx.fillRect(x + 10, y + 12, 4, 4);
        this.ctx.fillRect(x + 20, y + 20, 3, 3);
        break;
      case 'forest':
        // 小草
        this.ctx.fillStyle = 'rgba(100,255,100,0.15)';
        this.ctx.fillRect(x + 10, y + 8, 2, 6);
        this.ctx.fillRect(x + 20, y + 16, 2, 5);
        break;
      case 'core':
        // 核心脉冲效果
        const pulse = 0.6 + Math.sin(Date.now() / 300) * 0.2;
        this.ctx.fillStyle = `rgba(255, 215, 0, ${pulse * 0.3})`;
        this.ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        break;
    }
  }

  private getCellColor(type: string): string {
    switch (type) {
      case 'buildable': return COLORS.buildable;
      case 'path': return COLORS.path;
      case 'obstacle': return COLORS.obstacle;
      case 'water': return COLORS.water;
      case 'lava': return COLORS.lava;
      case 'forest': return COLORS.forest;
      case 'spawn': return COLORS.spawn;
      case 'core': return COLORS.core;
      default: return COLORS.bgDark;
    }
  }

  public drawPaths(paths: Map<Vec2, Vec2[]>): void {
    this.ctx.strokeStyle = COLORS.pathPreview;
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.setLineDash([8, 5]);
    this.ctx.shadowColor = 'rgba(255, 213, 79, 0.4)';
    this.ctx.shadowBlur = 8;

    for (const path of paths.values()) {
      if (path.length < 2) continue;
      this.ctx.beginPath();
      this.ctx.moveTo(path[0].x * TILE_SIZE + TILE_SIZE / 2, path[0].y * TILE_SIZE + TILE_SIZE / 2);
      for (let i = 1; i < path.length; i++) {
        this.ctx.lineTo(path[i].x * TILE_SIZE + TILE_SIZE / 2, path[i].y * TILE_SIZE + TILE_SIZE / 2);
      }
      this.ctx.stroke();
    }

    this.ctx.shadowBlur = 0;
    this.ctx.setLineDash([]);
  }

  public drawHover(cell?: Vec2, selectedTowerId?: string): void {
    if (!cell) return;

    const x = cell.x * TILE_SIZE;
    const y = cell.y * TILE_SIZE;

    // 外发光
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    this.ctx.shadowBlur = 8;
    this.ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    this.ctx.shadowBlur = 0;

    if (selectedTowerId) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      this.ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }
  }

  public drawTower(tower: Tower): void {
    const cx = tower.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = tower.y * TILE_SIZE + TILE_SIZE / 2;
    const size = TILE_SIZE - 8;
    const x = tower.x * TILE_SIZE + 4;
    const y = tower.y * TILE_SIZE + 4;

    // 建造动画
    if (!tower.built) {
      const progress = tower.buildProgress / 0.3;
      const scale = Math.min(progress, 1);
      this.ctx.globalAlpha = 0.4 + scale * 0.6;
      this.drawTowerShape(tower, cx, cy, size * scale);
      this.ctx.globalAlpha = 1;
      return;
    }

    // 塔底座阴影
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.fillRect(x + 2, y + 4, size, size);

    // 塔主体
    this.drawTowerShape(tower, cx, cy, size);

    // 等级指示（小圆点）
    this.ctx.fillStyle = '#fff';
    for (let i = 0; i < tower.level; i++) {
      this.ctx.beginPath();
      this.ctx.arc(x + 6 + i * 6, y + 6, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 边框高光
    this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
  }

  private drawTowerShape(tower: Tower, cx: number, cy: number, size: number): void {
    const color = tower.config.color;
    const half = size / 2;

    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = this.darken(color, 30);
    this.ctx.lineWidth = 1;

    switch (tower.config.id) {
      case 'archer':
        // 三角形塔顶
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - half + 2);
        this.ctx.lineTo(cx + half - 2, cy + half - 2);
        this.ctx.lineTo(cx - half + 2, cy + half - 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        break;
      case 'cannon':
        // 圆形炮塔
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, half - 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        // 炮管
        this.ctx.fillStyle = this.darken(color, 40);
        this.ctx.fillRect(cx - 3, cy - half + 4, 6, half);
        break;
      case 'ice':
        // 菱形
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - half + 2);
        this.ctx.lineTo(cx + half - 2, cy);
        this.ctx.lineTo(cx, cy + half - 2);
        this.ctx.lineTo(cx - half + 2, cy);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        break;
      case 'lightning':
        // 尖锐塔
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - half + 1);
        this.ctx.lineTo(cx + half - 3, cy + half - 2);
        this.ctx.lineTo(cx, cy + half - 6);
        this.ctx.lineTo(cx - half + 3, cy + half - 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        break;
      case 'poison':
        // 六边形
        this.drawPolygon(cx, cy, half - 2, 6);
        break;
      case 'support':
        // 星形/加号
        this.ctx.fillRect(cx - half + 3, cy - 3, size - 6, 6);
        this.ctx.fillRect(cx - 3, cy - half + 3, 6, size - 6);
        break;
      case 'barracks':
        // 方形堡垒
        this.ctx.fillRect(cx - half + 2, cy - half + 2, size - 4, size - 4);
        this.ctx.strokeRect(cx - half + 2, cy - half + 2, size - 4, size - 4);
        // 小门
        this.ctx.fillStyle = this.darken(color, 40);
        this.ctx.fillRect(cx - 4, cy + 2, 8, half - 4);
        break;
      default:
        this.ctx.fillRect(cx - half + 2, cy - half + 2, size - 4, size - 4);
        this.ctx.strokeRect(cx - half + 2, cy - half + 2, size - 4, size - 4);
    }
  }

  private drawPolygon(cx: number, cy: number, radius: number, sides: number): void {
    this.ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * Math.PI * 2) / sides - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private darken(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - amount);
    return `rgb(${r}, ${g}, ${b})`;
  }

  public drawRangeIndicator(tower: Tower): void {
    const cx = tower.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = tower.y * TILE_SIZE + TILE_SIZE / 2;
    const range = tower.getRange() * TILE_SIZE;

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, range, 0, Math.PI * 2);
    this.ctx.fillStyle = COLORS.rangeIndicator;
    this.ctx.fill();
    this.ctx.strokeStyle = COLORS.rangeIndicatorBorder;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  public drawEnemy(enemy: Enemy): void {
    const x = enemy.x * TILE_SIZE;
    const y = enemy.y * TILE_SIZE;
    const radius = enemy.config.radius;

    // 敌人阴影
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x + 2, y + radius + 2, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 敌人主体
    this.ctx.fillStyle = enemy.config.color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 内高光
    this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
    this.ctx.beginPath();
    this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
    this.ctx.fill();

    // 眼睛
    this.ctx.fillStyle = '#000';
    const eyeOffset = radius * 0.3;
    this.ctx.beginPath();
    this.ctx.arc(x - eyeOffset * 0.5, y - eyeOffset * 0.3, radius * 0.18, 0, Math.PI * 2);
    this.ctx.arc(x + eyeOffset * 0.5, y - eyeOffset * 0.3, radius * 0.18, 0, Math.PI * 2);
    this.ctx.fill();

    // Boss 皇冠/光环
    if (enemy.config.bossSkill) {
      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // 飞行标记
    if (enemy.flying) {
      this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
      this.ctx.beginPath();
      this.ctx.ellipse(x, y - radius - 5, radius * 0.7, radius * 0.25, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 血条背景
    const barW = 18;
    const barH = 4;
    this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
    this.ctx.fillRect(x - barW / 2, y - radius - 10, barW, barH);

    // 血条
    const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
    this.ctx.fillStyle = hpPct > 0.5 ? '#4caf50' : hpPct > 0.25 ? '#ff9800' : '#f44336';
    this.ctx.fillRect(x - barW / 2, y - radius - 10, barW * hpPct, barH);

    // 状态效果图标
    let iconX = x - radius - 4;
    for (const effect of enemy.activeEffects.keys()) {
      this.ctx.fillStyle = effect === 'slow' || effect === 'terrainSlow' ? '#00bcd4' :
                           effect === 'stun' ? '#ffeb3b' : '#9e9e9e';
      this.ctx.fillRect(iconX, y - radius - 4, 3, 3);
      iconX += 4;
    }
  }

  public drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  public drawText(text: string, x: number, y: number, options: TextOptions = {}): void {
    this.ctx.font = options.font || 'bold 14px "Courier New", monospace';
    this.ctx.fillStyle = options.color || COLORS.text;
    this.ctx.textAlign = options.align || 'left';
    this.ctx.textBaseline = options.baseline || 'alphabetic';
    this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
    this.ctx.shadowBlur = 2;
    this.ctx.fillText(text, x, y);
    this.ctx.shadowBlur = 0;
  }

  public drawButton(x: number, y: number, w: number, h: number, text: string, active = false): void {
    // 按钮阴影
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.fillRect(x + 2, y + 3, w, h);

    // 按钮主体
    const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
    if (active) {
      gradient.addColorStop(0, '#5a5a8a');
      gradient.addColorStop(1, '#3a3a5a');
    } else {
      gradient.addColorStop(0, COLORS.uiAccent);
      gradient.addColorStop(1, '#2e7d32');
    }
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, w, h);

    // 边框
    this.ctx.strokeStyle = active ? COLORS.uiBorderLight : 'rgba(255,255,255,0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, w, h);

    // 文字
    this.ctx.fillStyle = COLORS.text;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = 'bold 14px "Courier New", monospace';
    this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
    this.ctx.shadowBlur = 2;
    this.ctx.fillText(text, x + w / 2, y + h / 2 + 1);
    this.ctx.shadowBlur = 0;
  }

  public drawTemporaryEffects(effects: Map<string, { type: string; duration: number }>): void {
    const time = Date.now() / 200;
    for (const [key, effect] of effects) {
      const [x, y] = key.split(',').map(Number);
      const baseAlpha = Math.min(1, effect.duration / 1.5);

      if (effect.type === 'damage') {
        // 火焰闪烁效果
        const flicker = 0.5 + Math.sin(time + x * 3 + y * 2) * 0.15;
        this.ctx.fillStyle = `rgba(255, 87, 34, ${baseAlpha * flicker * 0.7})`;
        this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        this.ctx.fillStyle = `rgba(255, 170, 50, ${baseAlpha * flicker * 0.4})`;
        this.ctx.fillRect(x * TILE_SIZE + 6, y * TILE_SIZE + 6, TILE_SIZE - 12, TILE_SIZE - 12);
      } else if (effect.type === 'slow') {
        this.ctx.fillStyle = `rgba(0, 188, 212, ${baseAlpha * 0.35})`;
        this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  public drawProjectiles(projectiles: Projectile[]): void {
    for (const p of projectiles) {
      const x = p.x * TILE_SIZE;
      const y = p.y * TILE_SIZE;
      const color = p.sourceTower.config.color;

      if (p.sourceTower.config.id === 'barracks') {
        // 士兵：小方块带方向
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x - 4, y - 4, 8, 8);
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - 4, y - 4, 8, 8);
      } else if (p.projectileType === 'aoe') {
        // 炮弹：圆形带高光
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
        this.ctx.beginPath();
        this.ctx.arc(x - 2, y - 2, 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // 箭矢：小圆加拖尾
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        // 拖尾
        this.ctx.fillStyle = `rgba(255,255,255,0.3)`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  public drawEffects(
    particles: Particle[],
    hitEffects: HitEffect[],
    beamEffects: BeamEffect[],
  ): void {
    for (const beam of beamEffects) {
      const alpha = beam.life / beam.maxLife || 1;
      this.ctx.strokeStyle = beam.color;
      this.ctx.lineWidth = 4;
      this.ctx.globalAlpha = alpha;
      this.ctx.shadowColor = beam.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.moveTo(beam.x1 * TILE_SIZE, beam.y1 * TILE_SIZE);
      this.ctx.lineTo(beam.x2 * TILE_SIZE, beam.y2 * TILE_SIZE);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1;
    }

    for (const hit of hitEffects) {
      const alpha = hit.life / hit.maxLife;
      this.ctx.fillStyle = hit.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(hit.x * TILE_SIZE, hit.y * TILE_SIZE, 10 * alpha, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    }

    for (const p of particles) {
      const alpha = p.fade ? p.life / p.maxLife : 1;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, alpha);
      this.ctx.beginPath();
      this.ctx.arc(p.x * TILE_SIZE, p.y * TILE_SIZE, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}

interface TextOptions {
  font?: string;
  color?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
}
