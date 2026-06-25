import { describe, expect, it } from 'vitest';
import { Grid } from './Grid';
import { Pathfinder } from './Pathfinder';
import { LEVEL_1_1_GRID, LEVEL_1_2_GRID, convertGrid } from '../config/waves';

function serializePaths(pathfinder: Pathfinder): string {
  return Array.from(pathfinder.getAllPaths().values())
    .map((path) => path.map((cell) => `${cell.x},${cell.y}`).join('|'))
    .join(' / ');
}

describe('Pathfinder terrain costs', () => {
  it('prefers road tiles over open buildable tiles', () => {
    const grid = new Grid();
    grid.load(convertGrid(LEVEL_1_1_GRID));
    const pathfinder = new Pathfinder(grid);
    const path = pathfinder.getPath({ x: 0, y: 1 }, { x: 28, y: 1 });

    expect(path.length).toBeGreaterThan(0);
    const roadTiles = path.filter((p) => grid.getCell(p.x, p.y)?.type === 'path').length;
    const buildableTiles = path.filter((p) => grid.getCell(p.x, p.y)?.type === 'buildable').length;

    expect(roadTiles).toBeGreaterThan(buildableTiles);
  });

  it('allows towers on forest tiles during placement validation', () => {
    const grid = new Grid();
    grid.load(convertGrid(LEVEL_1_2_GRID));
    const pathfinder = new Pathfinder(grid);

    const forestCell = grid.getCells().flat().find((cell) => cell.type === 'forest');
    expect(forestCell).toBeTruthy();
    expect(pathfinder.validatePlacement(forestCell!.x, forestCell!.y)).toBe(true);
  });

  it('invalidates cached routes when tower placement changes the map', () => {
    const grid = new Grid();
    grid.load(convertGrid(LEVEL_1_1_GRID));
    const pathfinder = new Pathfinder(grid);
    const before = serializePaths(pathfinder);
    let routeChangingCell: { x: number; y: number } | undefined;

    for (const path of pathfinder.getAllPaths().values()) {
      for (const cell of path) {
        if (!grid.isBuildable(cell.x, cell.y) || !pathfinder.validatePlacement(cell.x, cell.y)) continue;

        grid.setTower(cell.x, cell.y, 'test');
        pathfinder.invalidate();
        const changed = serializePaths(pathfinder) !== before;
        grid.removeTower(cell.x, cell.y);
        pathfinder.invalidate();

        if (changed) {
          routeChangingCell = cell;
          break;
        }
      }
      if (routeChangingCell) break;
    }

    expect(routeChangingCell).toBeTruthy();
    grid.setTower(routeChangingCell!.x, routeChangingCell!.y, 'archer');
    pathfinder.invalidate();
    const after = serializePaths(pathfinder);

    expect(after).not.toBe(before);
  });
});
