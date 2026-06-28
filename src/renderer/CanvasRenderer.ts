import { TILE_SIZE, COLORS } from '../config/gameConfig';
import type { Grid } from '../systems/Grid';
import type { Tower } from '../entities/Tower';
import type { Enemy } from '../entities/Enemy';
import type { Projectile } from '../entities/Projectile';
import type { Particle, HitEffect, BeamEffect } from '../entities/Effect';
import type { TowerConfig, Vec2 } from '../types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private readonly fontFamily = '"Inter", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = true;
  }

  public clear(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 960, 540);
    gradient.addColorStop(0, '#0a0d10');
    gradient.addColorStop(0.52, '#10161a');
    gradient.addColorStop(1, '#11100c');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, 960, 540);

    this.ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x <= 960; x += 64) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, 540);
      this.ctx.stroke();
    }
    for (let y = 0; y <= 540; y += 64) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(960, y);
      this.ctx.stroke();
    }
  }

  public drawGrid(grid: Grid): void {
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0,0,0,0.42)';
    this.ctx.shadowBlur = 12;
    this.ctx.shadowOffsetY = 6;
    this.drawRoundRect(3, 48, 954, 398, 8, 'rgba(6, 9, 11, 0.32)', 'rgba(255,255,255,0.05)');
    this.ctx.restore();

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
    const gradient = this.ctx.createLinearGradient(x, y, x, y + TILE_SIZE);
    gradient.addColorStop(0, this.lighten(color, type === 'path' ? 14 : 10));
    gradient.addColorStop(1, this.darken(color, type === 'path' ? 18 : 22));
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);

    this.ctx.fillStyle = 'rgba(255,255,255,0.045)';
    this.ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, 2);
    this.ctx.fillStyle = 'rgba(0,0,0,0.18)';
    this.ctx.fillRect(x + 1, y + TILE_SIZE - 4, TILE_SIZE - 2, 3);
    this.ctx.strokeStyle = type === 'path' ? 'rgba(255,229,180,0.08)' : 'rgba(0,0,0,0.22)';
    this.ctx.strokeRect(x + 1.5, y + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);
  }

  private drawCellDetail(x: number, y: number, type: string): void {
    switch (type) {
      case 'buildable':
        this.ctx.fillStyle = 'rgba(182, 221, 160, 0.09)';
        this.ctx.fillRect(x + 8, y + 8, 3, 3);
        this.ctx.fillRect(x + 21, y + 19, 4, 3);
        this.ctx.fillStyle = 'rgba(0,0,0,0.12)';
        this.ctx.fillRect(x + 15, y + 24, 5, 2);
        break;
      case 'path':
        this.ctx.fillStyle = 'rgba(255, 236, 191, 0.07)';
        this.ctx.fillRect(x + 5, y + 8, 8, 2);
        this.ctx.fillRect(x + 17, y + 20, 10, 2);
        this.ctx.fillStyle = 'rgba(0,0,0,0.13)';
        this.ctx.fillRect(x + 10, y + 15, 13, 3);
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
        this.ctx.fillStyle = 'rgba(255,195,87,0.45)';
        this.ctx.fillRect(x + 7, y + 12, 8, 3);
        this.ctx.fillRect(x + 19, y + 21, 6, 3);
        this.ctx.fillStyle = 'rgba(255,255,255,0.12)';
        this.ctx.fillRect(x + 11, y + 13, 2, 1);
        break;
      case 'forest':
        this.ctx.fillStyle = 'rgba(120,255,150,0.22)';
        this.ctx.fillRect(x + 9, y + 8, 2, 9);
        this.ctx.fillRect(x + 15, y + 12, 2, 8);
        this.ctx.fillRect(x + 22, y + 16, 2, 7);
        this.ctx.fillStyle = 'rgba(0,0,0,0.14)';
        this.ctx.fillRect(x + 7, y + 25, 18, 2);
        break;
      case 'spawn':
        this.ctx.fillStyle = 'rgba(255,236,191,0.22)';
        this.ctx.beginPath();
        this.ctx.moveTo(x + 8, y + 8);
        this.ctx.lineTo(x + 24, y + 16);
        this.ctx.lineTo(x + 8, y + 24);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255,236,191,0.45)';
        this.ctx.stroke();
        break;
      case 'core':
        // 核心脉冲效果
        const pulse = 0.6 + Math.sin(Date.now() / 300) * 0.2;
        this.ctx.fillStyle = `rgba(242, 201, 76, ${pulse * 0.34})`;
        this.ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        this.ctx.strokeStyle = 'rgba(255,245,200,0.58)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 8, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fillStyle = 'rgba(255,245,200,0.75)';
        this.ctx.fillRect(x + 14, y + 9, 4, 14);
        this.ctx.fillRect(x + 9, y + 14, 14, 4);
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
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.setLineDash([8, 5]);
    this.ctx.shadowBlur = 8;

    for (const path of paths.values()) {
      if (path.length < 2) continue;
      const color = this.getPathPreviewColor(path.length);
      this.ctx.strokeStyle = color;
      this.ctx.shadowColor = color;
      this.ctx.beginPath();
      this.ctx.moveTo(path[0].x * TILE_SIZE + TILE_SIZE / 2, path[0].y * TILE_SIZE + TILE_SIZE / 2);
      for (let i = 1; i < path.length; i++) {
        this.ctx.lineTo(path[i].x * TILE_SIZE + TILE_SIZE / 2, path[i].y * TILE_SIZE + TILE_SIZE / 2);
      }
      this.ctx.stroke();

      this.drawPathMarkers(path, color);
    }

    this.ctx.shadowBlur = 0;
    this.ctx.setLineDash([]);
  }

  public drawFlightPaths(spawns: Vec2[], cores: Vec2[]): void {
    if (spawns.length === 0 || cores.length === 0) return;

    this.ctx.save();
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.setLineDash([3, 8]);
    this.ctx.strokeStyle = 'rgba(79, 195, 247, 0.72)';
    this.ctx.shadowColor = 'rgba(79, 195, 247, 0.7)';
    this.ctx.shadowBlur = 10;

    for (const spawn of spawns) {
      const core = this.getNearestCore(spawn, cores);
      const sx = spawn.x * TILE_SIZE + TILE_SIZE / 2;
      const sy = spawn.y * TILE_SIZE + TILE_SIZE / 2;
      const ex = core.x * TILE_SIZE + TILE_SIZE / 2;
      const ey = core.y * TILE_SIZE + TILE_SIZE / 2;

      this.ctx.beginPath();
      this.ctx.moveTo(sx, sy);
      this.ctx.lineTo(ex, ey);
      this.ctx.stroke();

      this.drawFlightMarker((sx + ex) / 2, (sy + ey) / 2);
    }

    this.ctx.restore();
  }

  private getNearestCore(spawn: Vec2, cores: Vec2[]): Vec2 {
    return cores.reduce((best, core) => {
      const bestDist = Math.abs(best.x - spawn.x) + Math.abs(best.y - spawn.y);
      const nextDist = Math.abs(core.x - spawn.x) + Math.abs(core.y - spawn.y);
      return nextDist < bestDist ? core : best;
    }, cores[0]);
  }

  private drawFlightMarker(x: number, y: number): void {
    const label = '飞行';
    this.ctx.setLineDash([]);
    this.ctx.shadowBlur = 0;
    this.ctx.font = `800 11px ${this.fontFamily}`;
    const textWidth = this.ctx.measureText(label).width;
    this.drawRoundRect(x - textWidth / 2 - 6, y - 20, textWidth + 12, 16, 5, 'rgba(8, 24, 34, 0.86)', 'rgba(79, 195, 247, 0.8)');
    this.drawText(label, x, y - 8, {
      font: `800 11px ${this.fontFamily}`,
      align: 'center',
      color: '#b3e5fc',
    });
    this.ctx.setLineDash([3, 8]);
    this.ctx.shadowBlur = 10;
  }

  private getPathPreviewColor(length: number): string {
    if (length >= 46) return 'rgba(102, 187, 106, 0.65)';
    if (length >= 30) return COLORS.pathPreview;
    return 'rgba(239, 83, 80, 0.6)';
  }

  private drawPathMarkers(path: Vec2[], color: string): void {
    const start = path[0];
    const end = path[path.length - 1];
    const sx = start.x * TILE_SIZE + TILE_SIZE / 2;
    const sy = start.y * TILE_SIZE + TILE_SIZE / 2;
    const ex = end.x * TILE_SIZE + TILE_SIZE / 2;
    const ey = end.y * TILE_SIZE + TILE_SIZE / 2;
    const mid = path[Math.floor(path.length / 2)];
    const mx = mid.x * TILE_SIZE + TILE_SIZE / 2;
    const my = mid.y * TILE_SIZE + TILE_SIZE / 2;

    this.ctx.setLineDash([]);
    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(ex, ey, 8, 0, Math.PI * 2);
    this.ctx.stroke();

    const label = `${path.length}格`;
    this.ctx.font = `800 11px ${this.fontFamily}`;
    const textWidth = this.ctx.measureText(label).width;
    this.drawRoundRect(mx - textWidth / 2 - 5, my - 20, textWidth + 10, 16, 5, 'rgba(10,14,21,0.82)', color);
    this.drawText(label, mx, my - 8, {
      font: `800 11px ${this.fontFamily}`,
      align: 'center',
      color: '#eef9f3',
    });

    this.ctx.setLineDash([8, 5]);
    this.ctx.shadowBlur = 8;
  }

  public drawHover(cell?: Vec2, selectedTower?: TowerConfig, canPlace = false): void {
    if (!cell) return;

    const x = cell.x * TILE_SIZE;
    const y = cell.y * TILE_SIZE;
    const cx = x + TILE_SIZE / 2;
    const cy = y + TILE_SIZE / 2;

    if (selectedTower) {
      this.drawPlacementRange(cx, cy, selectedTower, canPlace);
    }

    // 外发光
    this.ctx.strokeStyle = selectedTower
      ? (canPlace ? 'rgba(109, 214, 166, 0.95)' : 'rgba(239, 83, 80, 0.95)')
      : 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = selectedTower ? 3 : 2;
    this.ctx.shadowColor = selectedTower
      ? (canPlace ? 'rgba(109, 214, 166, 0.55)' : 'rgba(239, 83, 80, 0.55)')
      : 'rgba(255, 255, 255, 0.5)';
    this.ctx.shadowBlur = 8;
    this.ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    this.ctx.shadowBlur = 0;

    if (selectedTower) {
      this.ctx.fillStyle = canPlace ? 'rgba(109, 214, 166, 0.16)' : 'rgba(239, 83, 80, 0.16)';
      this.ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }
  }

  private drawPlacementRange(cx: number, cy: number, config: TowerConfig, canPlace: boolean): void {
    const range = config.range * TILE_SIZE;
    const color = canPlace ? config.color : COLORS.uiDanger;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, range, 0, Math.PI * 2);
    this.ctx.fillStyle = this.withAlpha(color, 0.14);
    this.ctx.fill();
    this.ctx.strokeStyle = this.withAlpha(color, 0.72);
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([8, 5]);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, Math.max(7, TILE_SIZE * 0.22), 0, Math.PI * 2);
    this.ctx.fillStyle = this.withAlpha(color, 0.9);
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.restore();
  }

  public drawTower(tower: Tower): void {
    this.ctx.save();

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
      this.ctx.restore();
      return;
    }

    // 塔底座阴影
    this.ctx.fillStyle = 'rgba(0,0,0,0.38)';
    this.ctx.beginPath();
    this.ctx.ellipse(cx + 2, cy + size / 2 - 4, size * 0.48, size * 0.2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 塔主体
    this.drawTowerShape(tower, cx, cy, size);

    // 等级指示
    for (let i = 0; i < tower.level; i++) {
      this.ctx.fillStyle = i === 2 ? COLORS.gold : '#f5f2e8';
      this.ctx.beginPath();
      this.ctx.arc(x + 6 + i * 6, y + 6, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 边框高光
    this.ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size * 0.47, 0, Math.PI * 2);
    this.ctx.stroke();

    if (tower.disabledTime > 0) {
      this.ctx.fillStyle = 'rgba(255, 235, 59, 0.28)';
      this.ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
      this.ctx.fillStyle = '#ffeb3b';
      this.ctx.font = `700 12px ${this.fontFamily}`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('!', cx, cy);
    }

    this.ctx.restore();
  }

  private drawTowerShape(tower: Tower, cx: number, cy: number, size: number): void {
    this.drawTowerShapeById(tower.config.id, tower.config.color, cx, cy, size, true);
  }

  private drawTowerShapeById(towerId: string, color: string, cx: number, cy: number, size: number, drawBase: boolean): void {
    if (size < 18) {
      const tinySize = Math.max(3, size);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(cx - tinySize / 2, cy - tinySize / 2, tinySize, tinySize);
      return;
    }

    const half = size / 2;
    const dark = this.darken(color, 42);
    const light = this.lighten(color, 38);

    if (drawBase) {
      const baseGradient = this.ctx.createLinearGradient(cx, cy - half, cx, cy + half);
      baseGradient.addColorStop(0, 'rgba(255,255,255,0.08)');
      baseGradient.addColorStop(1, 'rgba(0,0,0,0.45)');
      this.ctx.fillStyle = baseGradient;
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy + half - 5, size * 0.42, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      this.ctx.stroke();
    }

    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = dark;
    this.ctx.lineWidth = 1;

    switch (towerId) {
      case 'archer':
        this.ctx.fillStyle = dark;
        this.ctx.fillRect(cx - half + 6, cy - 2, size - 12, half + 2);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(cx - half + 8, cy, size - 16, half - 1);
        this.ctx.fillStyle = light;
        this.ctx.fillRect(cx - 2, cy + 3, 4, 7);
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - half + 1);
        this.ctx.lineTo(cx + half - 2, cy - 2);
        this.ctx.lineTo(cx - half + 2, cy - 2);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 6, cy - 6);
        this.ctx.lineTo(cx + 6, cy - 6);
        this.ctx.stroke();
        break;
      case 'cannon':
        this.ctx.fillStyle = dark;
        this.ctx.fillRect(cx - half + 4, cy + 2, size - 8, half - 2);
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, half - 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = dark;
        this.ctx.fillRect(cx - 4, cy - half + 3, 8, half + 1);
        this.ctx.fillStyle = '#222833';
        this.ctx.fillRect(cx - 2, cy - half + 1, 4, 7);
        this.ctx.fillStyle = light;
        this.ctx.beginPath();
        this.ctx.arc(cx - 4, cy - 4, 3, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'ice':
        this.ctx.fillStyle = 'rgba(255,255,255,0.22)';
        this.ctx.fillRect(cx - half + 6, cy + half - 6, size - 12, 4);
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - half + 1);
        this.ctx.lineTo(cx + half - 3, cy - 2);
        this.ctx.lineTo(cx + 4, cy + half - 1);
        this.ctx.lineTo(cx - half + 5, cy + 3);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = 'rgba(255,255,255,0.55)';
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 1, cy - half + 5);
        this.ctx.lineTo(cx + 5, cy - 2);
        this.ctx.lineTo(cx, cy + half - 5);
        this.ctx.lineTo(cx - 3, cy);
        this.ctx.closePath();
        this.ctx.fill();
        break;
      case 'lightning':
        this.ctx.fillStyle = dark;
        this.ctx.fillRect(cx - half + 6, cy + 2, size - 12, half - 2);
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(cx + 2, cy - half + 1);
        this.ctx.lineTo(cx + half - 3, cy - 2);
        this.ctx.lineTo(cx + 3, cy + 1);
        this.ctx.lineTo(cx + 7, cy + half - 1);
        this.ctx.lineTo(cx - half + 2, cy + 1);
        this.ctx.lineTo(cx - 1, cy - 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = '#fff59d';
        this.ctx.fillRect(cx - 1, cy - 8, 3, 8);
        break;
      case 'poison':
        this.ctx.fillStyle = dark;
        this.ctx.fillRect(cx - half + 5, cy - 1, size - 10, half + 2);
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy + 2, half - 4, half - 7, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = light;
        this.ctx.beginPath();
        this.ctx.arc(cx - 6, cy - 8, 3, 0, Math.PI * 2);
        this.ctx.arc(cx + 4, cy - 11, 2, 0, Math.PI * 2);
        this.ctx.arc(cx + 8, cy - 5, 2, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'sniper':
        this.ctx.fillStyle = dark;
        this.ctx.fillRect(cx - half + 4, cy - half + 4, size - 8, size - 8);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(cx - half + 6, cy - half + 6, size - 12, size - 12);
        this.ctx.strokeStyle = dark;
        this.ctx.strokeRect(cx - half + 6, cy - half + 6, size - 12, size - 12);
        this.ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, half - 8, 0, Math.PI * 2);
        this.ctx.moveTo(cx - half + 7, cy);
        this.ctx.lineTo(cx + half - 7, cy);
        this.ctx.moveTo(cx, cy - half + 7);
        this.ctx.lineTo(cx, cy + half - 7);
        this.ctx.stroke();
        break;
      case 'support':
        this.ctx.fillStyle = dark;
        this.drawPolygon(cx, cy, half - 3, 8);
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, half - 7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = dark;
        this.ctx.stroke();
        this.ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - half + 8, cy);
        this.ctx.lineTo(cx + half - 8, cy);
        this.ctx.moveTo(cx, cy - half + 8);
        this.ctx.lineTo(cx, cy + half - 8);
        this.ctx.stroke();
        break;
      case 'barracks':
        this.ctx.fillStyle = dark;
        this.ctx.fillRect(cx - half + 3, cy - half + 4, size - 6, size - 4);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(cx - half + 5, cy - half + 2, size - 10, size - 8);
        this.ctx.fillStyle = dark;
        for (let i = 0; i < 3; i++) {
          this.ctx.fillRect(cx - half + 6 + i * 8, cy - half + 1, 5, 5);
        }
        this.ctx.fillRect(cx - 4, cy + 2, 8, half - 4);
        this.ctx.fillStyle = 'rgba(255,255,255,0.25)';
        this.ctx.fillRect(cx - half + 8, cy - 3, 4, 4);
        this.ctx.fillRect(cx + half - 12, cy - 3, 4, 4);
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

  private lighten(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + amount);
    const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + amount);
    return `rgb(${r}, ${g}, ${b})`;
  }

  private withAlpha(color: string, alpha: number): string {
    if (!color.startsWith('#')) return color;
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  public drawRangeIndicator(tower: Tower): void {
    const cx = tower.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = tower.y * TILE_SIZE + TILE_SIZE / 2;
    const range = tower.getRange() * TILE_SIZE;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, range, 0, Math.PI * 2);
    this.ctx.fillStyle = this.withAlpha(tower.config.color, 0.12);
    this.ctx.fill();
    this.ctx.strokeStyle = this.withAlpha(tower.config.color, 0.62);
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 6]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, range - 5, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.restore();
  }

  public drawEnemy(enemy: Enemy): void {
    const x = enemy.x * TILE_SIZE;
    const y = enemy.y * TILE_SIZE;
    const radius = enemy.config.radius;

    // 敌人阴影
    this.ctx.fillStyle = 'rgba(0,0,0,0.36)';
    this.ctx.beginPath();
    this.ctx.ellipse(x + 2, y + radius + 2, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.drawEnemyBody(enemy, x, y, radius);

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
    const barW = Math.max(18, radius * 2.2);
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
                           effect === 'stun' ? '#ffeb3b' :
                           effect === 'poison' ? '#4caf50' : '#9e9e9e';
      this.ctx.fillRect(iconX, y - radius - 4, 3, 3);
      iconX += 4;
    }
  }

  private drawEnemyBody(enemy: Enemy, x: number, y: number, radius: number): void {
    const color = enemy.config.color;
    const dark = this.darken(color, 40);
    const light = this.lighten(color, 42);
    const type = enemy.config.id;

    this.ctx.save();
    this.ctx.strokeStyle = dark;
    this.ctx.lineWidth = 1.5;

    if (type === 'wolf' || type === 'assassin') {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(x - radius, y + radius * 0.25);
      this.ctx.lineTo(x - radius * 0.5, y - radius);
      this.ctx.lineTo(x, y - radius * 0.35);
      this.ctx.lineTo(x + radius * 0.5, y - radius);
      this.ctx.lineTo(x + radius, y + radius * 0.25);
      this.ctx.lineTo(x, y + radius);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    } else if (type === 'shielder') {
      this.ctx.fillStyle = color;
      this.drawPolygon(x, y, radius, 6);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      this.ctx.beginPath();
      this.ctx.moveTo(x, y - radius * 0.75);
      this.ctx.lineTo(x, y + radius * 0.75);
      this.ctx.moveTo(x - radius * 0.55, y);
      this.ctx.lineTo(x + radius * 0.55, y);
      this.ctx.stroke();
    } else if (type === 'healer') {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.strokeStyle = '#ffe3ef';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x - radius * 0.5, y);
      this.ctx.lineTo(x + radius * 0.5, y);
      this.ctx.moveTo(x, y - radius * 0.5);
      this.ctx.lineTo(x, y + radius * 0.5);
      this.ctx.stroke();
    } else if (type === 'bomber') {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.fillStyle = '#2b2014';
      this.ctx.fillRect(x - 2, y - radius - 3, 4, 5);
      this.ctx.strokeStyle = '#fff3a0';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 2, y - radius - 4);
      this.ctx.lineTo(x + 6, y - radius - 8);
      this.ctx.stroke();
    } else if (enemy.config.bossSkill) {
      this.ctx.fillStyle = color;
      this.drawPolygon(x, y, radius, enemy.flying ? 5 : 8);
      this.ctx.fillStyle = light;
      this.ctx.beginPath();
      this.ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.22, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (enemy.flying) {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, radius * 1.05, radius * 0.78, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.fillStyle = this.withAlpha(light, 0.75);
      this.ctx.beginPath();
      this.ctx.ellipse(x - radius * 0.85, y, radius * 0.55, radius * 0.22, -0.35, 0, Math.PI * 2);
      this.ctx.ellipse(x + radius * 0.85, y, radius * 0.55, radius * 0.22, 0.35, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    }

    this.ctx.fillStyle = 'rgba(255,255,255,0.24)';
    this.ctx.beginPath();
    this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.28, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = 'rgba(4,8,10,0.82)';
    const eyeOffset = radius * 0.32;
    this.ctx.beginPath();
    this.ctx.arc(x - eyeOffset * 0.5, y - eyeOffset * 0.25, radius * 0.12, 0, Math.PI * 2);
    this.ctx.arc(x + eyeOffset * 0.5, y - eyeOffset * 0.25, radius * 0.12, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  public drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  public drawRoundRect(x: number, y: number, w: number, h: number, radius: number, fill: string | CanvasGradient, stroke?: string): void {
    const r = Math.min(radius, w / 2, h / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  public drawTowerIcon(towerId: string, color: string, cx: number, cy: number, size: number): void {
    this.ctx.save();
    this.drawTowerShapeById(towerId, color, cx, cy, size, false);
    this.ctx.restore();
  }

  public drawText(text: string, x: number, y: number, options: TextOptions = {}): void {
    this.ctx.font = options.font || `800 14px ${this.fontFamily}`;
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
      gradient.addColorStop(0, '#3a434b');
      gradient.addColorStop(1, '#20282f');
    } else {
      gradient.addColorStop(0, COLORS.uiAccent);
      gradient.addColorStop(1, '#23674a');
    }
    this.drawRoundRect(x, y, w, h, 6, gradient, active ? COLORS.uiBorderLight : 'rgba(255,255,255,0.22)');

    // 文字
    this.ctx.fillStyle = COLORS.text;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = `800 14px ${this.fontFamily}`;
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
      this.ctx.save();
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 8;

      if (p.sourceTower.config.id === 'barracks') {
        // 士兵：小盾兵轮廓
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 6);
        this.ctx.lineTo(x + 6, y - 1);
        this.ctx.lineTo(x + 4, y + 6);
        this.ctx.lineTo(x - 4, y + 6);
        this.ctx.lineTo(x - 6, y - 1);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
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
        // 箭矢/毒弹：核心加外圈
        this.ctx.fillStyle = this.withAlpha(color, 0.24);
        this.ctx.beginPath();
        this.ctx.arc(x, y, 7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
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
