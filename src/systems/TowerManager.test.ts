import { describe, expect, it } from 'vitest';
import { LEVEL_1_2_GRID, convertGrid } from '../config/waves';
import { EconomyManager } from './EconomyManager';
import { Grid } from './Grid';
import { Pathfinder } from './Pathfinder';
import { TowerManager } from './TowerManager';

function makeTowerManager(startingGold: number, rows = LEVEL_1_2_GRID): {
  economy: EconomyManager;
  grid: Grid;
  manager: TowerManager;
  pathfinder: Pathfinder;
} {
  const grid = new Grid();
  grid.load(convertGrid(rows));
  const pathfinder = new Pathfinder(grid);
  const economy = new EconomyManager();
  economy.reset(startingGold);
  const manager = new TowerManager(grid, pathfinder, economy);

  return { economy, grid, manager, pathfinder };
}

describe('TowerManager placement', () => {
  it('places and marks towers on forest tiles consistently', () => {
    const { grid, manager } = makeTowerManager(500);
    const forestCell = grid.getCells().flat().find((cell) => cell.type === 'forest');

    expect(forestCell).toBeTruthy();
    expect(manager.placeTower(forestCell!.x, forestCell!.y, 'archer')).toBe(true);
    expect(grid.hasTower(forestCell!.x, forestCell!.y)).toBe(true);
    expect(manager.getTowerAt(forestCell!.x, forestCell!.y)).toBeTruthy();
  });

  it('does not place a tower or spend gold when the player cannot afford it', () => {
    const { economy, grid, manager } = makeTowerManager(0);
    const buildableCell = grid.getCells().flat().find((cell) => cell.type === 'buildable');

    expect(buildableCell).toBeTruthy();
    expect(manager.placeTower(buildableCell!.x, buildableCell!.y, 'sniper')).toBe(false);
    expect(grid.hasTower(buildableCell!.x, buildableCell!.y)).toBe(false);
    expect(manager.getTowers()).toHaveLength(0);
    expect(economy.getGold()).toBe(0);
  });

  it('rejects placements that would block the only ground path', () => {
    const { grid, manager } = makeTowerManager(500, [
      ['s', 'b', 'c'],
    ]);

    expect(manager.placeTower(1, 0, 'archer')).toBe(false);
    expect(grid.hasTower(1, 0)).toBe(false);
    expect(manager.getTowers()).toHaveLength(0);
  });
});
