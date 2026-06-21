import type { Grid } from './Grid';
import type { Vec2 } from '../types';

interface PathNode {
  x: number;
  y: number;
  g: number;
  f: number;
  parent?: PathNode;
}

export class Pathfinder {
  private cachedPaths: Map<string, Vec2[]> = new Map();

  constructor(private grid: Grid) {}

  public invalidate(): void {
    this.cachedPaths.clear();
  }

  public getPath(from: Vec2, to: Vec2): Vec2[] {
    const key = `${from.x},${from.y}-${to.x},${to.y}`;
    if (this.cachedPaths.has(key)) return this.cachedPaths.get(key)!;

    const path = this.aStar(from, to);
    this.cachedPaths.set(key, path);
    return path;
  }

  public getAllPaths(): Map<Vec2, Vec2[]> {
    const paths = new Map<Vec2, Vec2[]>();
    for (const spawn of this.grid.getSpawns()) {
      let shortest: Vec2[] = [];
      for (const core of this.grid.getCores()) {
        const path = this.getPath(spawn, core);
        if (path.length > 0 && (shortest.length === 0 || path.length < shortest.length)) {
          shortest = path;
        }
      }
      paths.set(spawn, shortest);
    }
    return paths;
  }

  public validatePlacement(x: number, y: number): boolean {
    const cell = this.grid.getCell(x, y);
    if (!cell || cell.type !== 'buildable' || cell.towerId) return false;

    cell.towerId = 'temp';
    let valid = true;

    for (const spawn of this.grid.getSpawns()) {
      let hasPath = false;
      for (const core of this.grid.getCores()) {
        const path = this.aStar(spawn, core);
        if (path.length > 0) {
          hasPath = true;
          break;
        }
      }
      if (!hasPath) {
        valid = false;
        break;
      }
    }

    delete cell.towerId;
    this.invalidate();
    return valid;
  }

  private aStar(from: Vec2, to: Vec2): Vec2[] {
    const openSet: PathNode[] = [];
    const closedSet = new Set<string>();

    const startNode: PathNode = {
      x: from.x,
      y: from.y,
      g: 0,
      f: this.heuristic(from, to),
    };
    openSet.push(startNode);

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const key = `${current.x},${current.y}`;

      if (current.x === to.x && current.y === to.y) {
        return this.reconstructPath(current);
      }

      if (closedSet.has(key)) continue;
      closedSet.add(key);

      for (const neighbor of this.getNeighbors(current)) {
        const nKey = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(nKey)) continue;
        if (!this.grid.isWalkable(neighbor.x, neighbor.y)) continue;

        const g = current.g + 1;
        const existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!existing || g < existing.g) {
          const node: PathNode = {
            x: neighbor.x,
            y: neighbor.y,
            g,
            f: g + this.heuristic(neighbor, to),
            parent: current,
          };
          if (existing) {
            Object.assign(existing, node);
          } else {
            openSet.push(node);
          }
        }
      }
    }

    return [];
  }

  private heuristic(a: Vec2, b: Vec2): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private getNeighbors(node: PathNode): Vec2[] {
    return [
      { x: node.x + 1, y: node.y },
      { x: node.x - 1, y: node.y },
      { x: node.x, y: node.y + 1 },
      { x: node.x, y: node.y - 1 },
    ];
  }

  private reconstructPath(node: PathNode): Vec2[] {
    const path: Vec2[] = [];
    let current: PathNode | undefined = node;
    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path;
  }
}
