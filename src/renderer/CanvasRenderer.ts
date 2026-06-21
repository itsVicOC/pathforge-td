import { TILE_SIZE, COLORS } from '../config/gameConfig';
import type { Grid } from '../systems/Grid';
import type { Tower } from '../entities/Tower';
import type { Enemy } from '../entities/Enemy';
import type { Vec2 } from '../types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
  }

  public clear(): void {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, 960, 540);
  }

  public drawGrid(grid: Grid): void {
    for (const row of grid.getCells()) {
      for (const cell of row) {
        const x = cell.x * TILE_SIZE;
        const y = cell.y * TILE_SIZE;
        const color = this.getCellColor(cell.type);

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  private getCellColor(type: string): string {
    switch (type) {
      case 'buildable': return COLORS.gridBuildable;
      case 'path': return COLORS.gridPath;
      case 'obstacle': return COLORS.gridObstacle;
      case 'water': return COLORS.gridWater;
      case 'spawn': return COLORS.gridSpawn;
      case 'core': return COLORS.gridCore;
      default: return '#000';
    }
  }

  public drawPaths(paths: Map<Vec2, Vec2[]>): void {
    this.ctx.strokeStyle = COLORS.pathPreview;
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([6, 4]);

    for (const path of paths.values()) {
      if (path.length < 2) continue;
      this.ctx.beginPath();
      this.ctx.moveTo(path[0].x * TILE_SIZE + TILE_SIZE / 2, path[0].y * TILE_SIZE + TILE_SIZE / 2);
      for (let i = 1; i < path.length; i++) {
        this.ctx.lineTo(path[i].x * TILE_SIZE + TILE_SIZE / 2, path[i].y * TILE_SIZE + TILE_SIZE / 2);
      }
      this.ctx.stroke();
    }

    this.ctx.setLineDash([]);
  }

  public drawHover(cell?: Vec2, selectedTowerId?: string): void {
    if (!cell) return;

    const x = cell.x * TILE_SIZE;
    const y = cell.y * TILE_SIZE;

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

    if (selectedTowerId) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }
  }

  public drawTower(tower: Tower): void {
    const x = tower.x * TILE_SIZE + 4;
    const y = tower.y * TILE_SIZE + 4;
    const size = TILE_SIZE - 8;

    // 建造动画
    if (!tower.built) {
      const progress = tower.buildProgress / 0.3;
      const scale = Math.min(progress, 1);
      this.ctx.globalAlpha = 0.5 + scale * 0.5;
      this.ctx.fillStyle = tower.config.color;
      this.ctx.fillRect(
        x + size / 2 - (size * scale) / 2,
        y + size / 2 - (size * scale) / 2,
        size * scale,
        size * scale,
      );
      this.ctx.globalAlpha = 1;
      return;
    }

    // 塔主体
    this.ctx.fillStyle = tower.config.color;
    this.ctx.fillRect(x, y, size, size);

    // 塔等级指示
    this.ctx.fillStyle = '#fff';
    for (let i = 0; i < tower.level; i++) {
      this.ctx.fillRect(x + 3 + i * 5, y + 3, 3, 3);
    }

    // 选中或悬停高亮
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, size, size);
  }

  public drawEnemy(enemy: Enemy): void {
    const x = enemy.x * TILE_SIZE;
    const y = enemy.y * TILE_SIZE;
    const radius = enemy.config.radius;

    this.ctx.fillStyle = enemy.config.color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 血条
    const hpPct = enemy.hp / enemy.maxHp;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(x - 8, y - radius - 8, 16, 4);
    this.ctx.fillStyle = hpPct > 0.5 ? '#0f0' : hpPct > 0.25 ? '#ff0' : '#f00';
    this.ctx.fillRect(x - 8, y - radius - 8, 16 * hpPct, 4);

    // 飞行标记
    if (enemy.flying) {
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.arc(x, y - radius - 4, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  public drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  public drawText(text: string, x: number, y: number, options: TextOptions = {}): void {
    this.ctx.font = options.font || '14px monospace';
    this.ctx.fillStyle = options.color || COLORS.text;
    this.ctx.textAlign = options.align || 'left';
    this.ctx.textBaseline = options.baseline || 'alphabetic';
    this.ctx.fillText(text, x, y);
  }

  public drawButton(x: number, y: number, w: number, h: number, text: string, active = false): void {
    this.ctx.fillStyle = active ? '#5a5a8a' : COLORS.uiBg;
    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeStyle = active ? '#8888ff' : COLORS.uiBorder;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, w, h);
    this.ctx.fillStyle = COLORS.text;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x + w / 2, y + h / 2);
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
