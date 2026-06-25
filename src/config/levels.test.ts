import { describe, expect, it } from 'vitest';
import { LEVEL_CONFIGS } from './levels';
import { Grid } from '../systems/Grid';
import { Pathfinder } from '../systems/Pathfinder';

function getRouteSignature(pathfinder: Pathfinder): string {
  const paths = pathfinder.getAllPaths();
  return Array.from(paths.values())
    .map(path => path.map(cell => `${cell.x},${cell.y}`).join('|'))
    .join(' / ');
}

describe('level configuration', () => {
  it('keeps every level grid aligned with declared dimensions and endpoints', () => {
    for (const level of Object.values(LEVEL_CONFIGS)) {
      expect(level.grid).toHaveLength(level.height);
      for (const row of level.grid) {
        expect(row).toHaveLength(level.width);
      }

      for (const spawn of level.spawns) {
        expect(level.grid[spawn.y]?.[spawn.x]).toBe('spawn');
      }
      for (const core of level.cores) {
        expect(level.grid[core.y]?.[core.x]).toBe('core');
      }
    }
  });

  it('keeps at least one valid ground path in every level', () => {
    for (const level of Object.values(LEVEL_CONFIGS)) {
      const grid = new Grid();
      grid.load(level.grid);
      const pathfinder = new Pathfinder(grid);

      for (const path of pathfinder.getAllPaths().values()) {
        expect(path.length).toBeGreaterThan(0);
      }
    }
  });

  it('provides map-shaping cells that can change at least one route', () => {
    for (const level of Object.values(LEVEL_CONFIGS)) {
      const grid = new Grid();
      grid.load(level.grid);
      const pathfinder = new Pathfinder(grid);
      const initialSignature = getRouteSignature(pathfinder);
      let foundRouteChanger = false;

      for (const path of pathfinder.getAllPaths().values()) {
        for (const cell of path) {
          if (!grid.isBuildable(cell.x, cell.y)) continue;
          if (!pathfinder.validatePlacement(cell.x, cell.y)) continue;

          grid.setTower(cell.x, cell.y, 'test');
          pathfinder.invalidate();
          const nextSignature = getRouteSignature(pathfinder);
          grid.removeTower(cell.x, cell.y);
          pathfinder.invalidate();

          if (nextSignature !== initialSignature) {
            foundRouteChanger = true;
            break;
          }
        }
        if (foundRouteChanger) break;
      }

      expect(foundRouteChanger, `${level.id} should include a meaningful maze-shaping placement`).toBe(true);
    }
  });
});
