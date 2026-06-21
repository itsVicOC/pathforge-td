import type { CellType, GridCell, TerrainEffect, Vec2 } from '../types';

export class Grid {
  private cells: GridCell[][] = [];
  private spawns: Vec2[] = [];
  private cores: Vec2[] = [];
  private width = 0;
  private height = 0;
  private temporaryEffects: Map<string, { type: TerrainEffect; duration: number }> = new Map();

  public load(cellTypes: CellType[][]): void {
    this.height = cellTypes.length;
    this.width = cellTypes[0]?.length ?? 0;
    this.cells = cellTypes.map((row, y) =>
      row.map((type, x) => ({ x, y, type }))
    );
    this.spawns = this.findCellsOfType('spawn');
    this.cores = this.findCellsOfType('core');
    this.temporaryEffects.clear();
  }

  public getWidth(): number { return this.width; }
  public getHeight(): number { return this.height; }

  public getCell(x: number, y: number): GridCell | undefined {
    return this.cells[y]?.[x];
  }

  public setTower(x: number, y: number, towerId: string): boolean {
    const cell = this.getCell(x, y);
    if (!cell || cell.type !== 'buildable' || cell.towerId) return false;
    cell.towerId = towerId;
    return true;
  }

  public removeTower(x: number, y: number): void {
    const cell = this.getCell(x, y);
    if (cell) delete cell.towerId;
  }

  public isWalkable(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    if (!cell) return false;
    if (cell.type === 'water' || cell.type === 'obstacle' || cell.type === 'lava') return false;
    if (cell.type === 'buildable' && cell.towerId) return false;
    return true;
  }

  public isBuildable(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    return !!cell && (cell.type === 'buildable' || cell.type === 'forest') && !cell.towerId;
  }

  public update(dt: number): void {
    for (const [key, effect] of this.temporaryEffects) {
      effect.duration -= dt;
      if (effect.duration <= 0) {
        this.temporaryEffects.delete(key);
      }
    }
  }

  public applyTemporaryTerrain(x: number, y: number, effect: TerrainEffect, duration: number): void {
    if (effect === 'none') return;
    this.temporaryEffects.set(`${x},${y}`, { type: effect, duration });
  }

  public getTerrainEffect(x: number, y: number): TerrainEffect {
    const temp = this.temporaryEffects.get(`${x},${y}`);
    if (temp) return temp.type;

    const cell = this.getCell(x, y);
    if (!cell) return 'none';
    if (cell.type === 'lava') return 'damage';
    if (cell.type === 'forest') return 'slow';
    return 'none';
  }

  public hasTower(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    return !!cell?.towerId;
  }

  public getTowerId(x: number, y: number): string | undefined {
    return this.getCell(x, y)?.towerId;
  }

  public getSpawns(): Vec2[] { return this.spawns; }
  public getCores(): Vec2[] { return this.cores; }

  public getCells(): GridCell[][] { return this.cells; }

  public getTemporaryEffects(): Map<string, { type: TerrainEffect; duration: number }> {
    return this.temporaryEffects;
  }

  private findCellsOfType(type: CellType): Vec2[] {
    const result: Vec2[] = [];
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.type === type) result.push({ x: cell.x, y: cell.y });
      }
    }
    return result;
  }
}
