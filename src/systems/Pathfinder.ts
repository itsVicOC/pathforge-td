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
    if (!cell || (cell.type !== 'buildable' && cell.type !== 'forest') || cell.towerId) return false;

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
    const openSet = new MinHeap<PathNode>((a, b) => a.f - b.f || a.g - b.g);
    const closedSet = new Set<string>();
    const bestG = new Map<string, number>();

    const startNode: PathNode = {
      x: from.x,
      y: from.y,
      g: 0,
      f: this.heuristic(from, to),
    };
    openSet.push(startNode);
    bestG.set(`${from.x},${from.y}`, 0);

    while (!openSet.isEmpty()) {
      const current = openSet.pop()!;
      const key = `${current.x},${current.y}`;
      if (current.g > (bestG.get(key) ?? Infinity)) continue;

      if (current.x === to.x && current.y === to.y) {
        return this.reconstructPath(current);
      }

      if (closedSet.has(key)) continue;
      closedSet.add(key);

      for (const neighbor of this.getNeighbors(current)) {
        const nKey = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(nKey)) continue;
        if (!this.grid.isWalkable(neighbor.x, neighbor.y)) continue;

        const moveCost = this.grid.getMoveCost(neighbor.x, neighbor.y);
        if (!Number.isFinite(moveCost)) continue;

        const g = current.g + moveCost;
        if (g < (bestG.get(nKey) ?? Infinity)) {
          bestG.set(nKey, g);
          openSet.push({
            x: neighbor.x,
            y: neighbor.y,
            g,
            f: g + this.heuristic(neighbor, to),
            parent: current,
          });
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

class MinHeap<T> {
  private items: T[] = [];

  constructor(private compare: (a: T, b: T) => number) {}

  public push(item: T): void {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  public pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const first = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return first;
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.items[index], this.items[parent]) >= 0) break;
      [this.items[index], this.items[parent]] = [this.items[parent], this.items[index]];
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;

      if (left < this.items.length && this.compare(this.items[left], this.items[smallest]) < 0) {
        smallest = left;
      }
      if (right < this.items.length && this.compare(this.items[right], this.items[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }
}
