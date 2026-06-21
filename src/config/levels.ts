import type { LevelConfig } from '../types';
import {
  LEVEL_1_1_WAVES,
  LEVEL_1_1_GRID,
  LEVEL_1_2_WAVES,
  LEVEL_1_2_GRID,
  LEVEL_1_3_WAVES,
  LEVEL_1_3_GRID,
  convertGrid,
} from './waves';

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
  '1-2': {
    id: '1-2',
    name: '熔岩裂谷',
    width: 30,
    height: 17,
    startingGold: 550,
    lives: 20,
    grid: convertGrid(LEVEL_1_2_GRID),
    spawns: [{ x: 0, y: 1 }],
    cores: [{ x: 28, y: 6 }, { x: 29, y: 6 }],
    waves: LEVEL_1_2_WAVES,
  },
  '1-3': {
    id: '1-3',
    name: '天空要塞',
    width: 30,
    height: 17,
    startingGold: 700,
    lives: 25,
    grid: convertGrid(LEVEL_1_3_GRID),
    spawns: [{ x: 0, y: 1 }, { x: 0, y: 4 }],
    cores: [{ x: 28, y: 1 }, { x: 29, y: 1 }, { x: 28, y: 4 }, { x: 29, y: 4 }],
    waves: LEVEL_1_3_WAVES,
  },
};
