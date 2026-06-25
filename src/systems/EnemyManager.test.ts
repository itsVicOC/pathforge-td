import { describe, expect, it } from 'vitest';
import { LEVEL_1_1_GRID, convertGrid } from '../config/waves';
import { Grid } from './Grid';
import { Pathfinder } from './Pathfinder';
import { EnemyManager } from './EnemyManager';

describe('EnemyManager flying pathing', () => {
  it('spawns flying enemies on a direct two-point path', () => {
    const grid = new Grid();
    grid.load(convertGrid(LEVEL_1_1_GRID));
    const pathfinder = new Pathfinder(grid);
    const manager = new EnemyManager(pathfinder, grid);

    manager.spawnEnemy('flyer');

    const enemy = manager.getEnemies()[0];
    expect(enemy).toBeTruthy();
    expect(enemy.path).toHaveLength(2);
    expect(enemy.flying).toBe(true);
  });
});
