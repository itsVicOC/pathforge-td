import type { LevelConfig } from '../types';
import { LEVEL_1_1_WAVES, LEVEL_1_1_GRID, convertGrid } from './waves';

export const LEVEL_CONFIGS: Record<string, LevelConfig> = {
  '1-1': {
    id: '1-1',
    name: '第一滴血',
    width: 30,
    height: 17,
    startingGold: 450,
    lives: 20,
    grid: convertGrid(LEVEL_1_1_GRID),
    spawns: [{ x: 0, y: 1 }],
    cores: [{ x: 28, y: 6 }, { x: 29, y: 6 }],
    waves: LEVEL_1_1_WAVES,
  },
};
