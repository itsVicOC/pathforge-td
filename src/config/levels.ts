import type { LevelConfig } from '../types';
import {
  LEVEL_1_1_WAVES,
  LEVEL_1_1_GRID,
  LEVEL_1_2_WAVES,
  LEVEL_1_2_GRID,
  LEVEL_1_3_WAVES,
  LEVEL_1_3_GRID,
  LEVEL_2_1_WAVES,
  LEVEL_2_1_GRID,
  LEVEL_2_2_WAVES,
  LEVEL_2_2_GRID,
  LEVEL_2_3_WAVES,
  LEVEL_2_3_GRID,
  convertGrid,
  createAdvancedLevelGrid,
  createAdvancedLevelWaves,
} from './waves';

type AdvancedLevelSeed = {
  id: string;
  name: string;
  chapter: number;
  stage: 1 | 2 | 3;
  startingGold: number;
  lives: number;
};

const ADVANCED_STAGE_LAYOUTS: Record<AdvancedLevelSeed['stage'], Pick<LevelConfig, 'spawns' | 'cores'>> = {
  1: {
    spawns: [{ x: 0, y: 4 }],
    cores: [{ x: 28, y: 9 }, { x: 29, y: 9 }],
  },
  2: {
    spawns: [{ x: 0, y: 2 }, { x: 0, y: 10 }],
    cores: [{ x: 28, y: 6 }, { x: 29, y: 6 }],
  },
  3: {
    spawns: [{ x: 0, y: 3 }, { x: 0, y: 11 }],
    cores: [{ x: 28, y: 5 }, { x: 29, y: 5 }, { x: 28, y: 7 }, { x: 29, y: 7 }],
  },
};

const ADVANCED_LEVEL_SEEDS: AdvancedLevelSeed[] = [
  { id: '3-1', name: '荆棘前线', chapter: 3, stage: 1, startingGold: 1250, lives: 32 },
  { id: '3-2', name: '裂隙双径', chapter: 3, stage: 2, startingGold: 1750, lives: 52 },
  { id: '3-3', name: '天火门庭', chapter: 3, stage: 3, startingGold: 1800, lives: 48 },
  { id: '4-1', name: '深林回声', chapter: 4, stage: 1, startingGold: 1700, lives: 45 },
  { id: '4-2', name: '熔流双门', chapter: 4, stage: 2, startingGold: 1900, lives: 50 },
  { id: '4-3', name: '暗翼堡垒', chapter: 4, stage: 3, startingGold: 2050, lives: 54 },
  { id: '5-1', name: '钢盾河湾', chapter: 5, stage: 1, startingGold: 2000, lives: 51 },
  { id: '5-2', name: '幽影夹道', chapter: 5, stage: 2, startingGold: 2400, lives: 75 },
  { id: '5-3', name: '爆裂核心', chapter: 5, stage: 3, startingGold: 2350, lives: 60 },
  { id: '6-1', name: '雷鸣栈道', chapter: 6, stage: 1, startingGold: 2300, lives: 57 },
  { id: '6-2', name: '毒沼双线', chapter: 6, stage: 2, startingGold: 2700, lives: 82 },
  { id: '6-3', name: '熔空王座', chapter: 6, stage: 3, startingGold: 2650, lives: 66 },
  { id: '7-1', name: '灰烬远征', chapter: 7, stage: 1, startingGold: 2600, lives: 63 },
  { id: '7-2', name: '天幕裂谷', chapter: 7, stage: 2, startingGold: 3200, lives: 130 },
  { id: '7-3', name: '双王前夜', chapter: 7, stage: 3, startingGold: 3000, lives: 72 },
  { id: '8-1', name: '终局外环', chapter: 8, stage: 1, startingGold: 2950, lives: 69 },
  { id: '8-2', name: '核心围城', chapter: 8, stage: 2, startingGold: 3750, lives: 145 },
  { id: '8-3', name: 'PathForge 终点', chapter: 8, stage: 3, startingGold: 3500, lives: 80 },
];

function createAdvancedLevel(seed: AdvancedLevelSeed): LevelConfig {
  const layout = ADVANCED_STAGE_LAYOUTS[seed.stage];
  return {
    id: seed.id,
    name: seed.name,
    width: 30,
    height: 17,
    startingGold: seed.startingGold,
    lives: seed.lives,
    grid: createAdvancedLevelGrid(seed.stage),
    spawns: layout.spawns,
    cores: layout.cores,
    waves: createAdvancedLevelWaves(seed.chapter, seed.stage),
  };
}

function createAdvancedCampaignLevels(): Record<string, LevelConfig> {
  return Object.fromEntries(ADVANCED_LEVEL_SEEDS.map(seed => [seed.id, createAdvancedLevel(seed)]));
}

export const LEVEL_CONFIGS: Record<string, LevelConfig> = {
  '1-1': {
    id: '1-1',
    name: '第一滴血',
    width: 30,
    height: 17,
    startingGold: 450,
    lives: 20,
    grid: convertGrid(LEVEL_1_1_GRID),
    spawns: [{ x: 0, y: 2 }],
    cores: [{ x: 28, y: 10 }, { x: 29, y: 10 }],
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
    spawns: [{ x: 0, y: 2 }],
    cores: [{ x: 27, y: 8 }, { x: 28, y: 8 }],
    waves: LEVEL_1_2_WAVES,
  },
  '1-3': {
    id: '1-3',
    name: '天空要塞',
    width: 30,
    height: 17,
    startingGold: 800,
    lives: 28,
    grid: convertGrid(LEVEL_1_3_GRID),
    spawns: [{ x: 0, y: 2 }, { x: 0, y: 6 }],
    cores: [{ x: 27, y: 2 }, { x: 28, y: 2 }, { x: 27, y: 6 }, { x: 28, y: 6 }],
    waves: LEVEL_1_3_WAVES,
  },
  '2-1': {
    id: '2-1',
    name: '毒雾湿地',
    width: 30,
    height: 17,
    startingGold: 1050,
    lives: 35,
    grid: convertGrid(LEVEL_2_1_GRID),
    spawns: [{ x: 0, y: 4 }],
    cores: [{ x: 28, y: 9 }, { x: 29, y: 9 }],
    waves: LEVEL_2_1_WAVES,
  },
  '2-2': {
    id: '2-2',
    name: '双门峡谷',
    width: 30,
    height: 17,
    startingGold: 1350,
    lives: 45,
    grid: convertGrid(LEVEL_2_2_GRID),
    spawns: [{ x: 0, y: 2 }, { x: 0, y: 10 }],
    cores: [{ x: 28, y: 6 }, { x: 29, y: 6 }],
    waves: LEVEL_2_2_WAVES,
  },
  '2-3': {
    id: '2-3',
    name: '终焰回廊',
    width: 30,
    height: 17,
    startingGold: 1150,
    lives: 35,
    grid: convertGrid(LEVEL_2_3_GRID),
    spawns: [{ x: 0, y: 3 }, { x: 0, y: 11 }],
    cores: [{ x: 28, y: 5 }, { x: 29, y: 5 }, { x: 28, y: 7 }, { x: 29, y: 7 }],
    waves: LEVEL_2_3_WAVES,
  },
  ...createAdvancedCampaignLevels(),
};
