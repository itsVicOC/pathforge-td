import type { WaveConfig } from '../types';

export const LEVEL_1_1_WAVES: WaveConfig[] = [
  { wave: 1, groups: [{ type: 'slime', count: 8, interval: 0.8, delay: 0 }], bonus: 50 },
  { wave: 2, groups: [{ type: 'slime', count: 12, interval: 0.6, delay: 0 }], bonus: 60 },
  { wave: 3, groups: [
    { type: 'slime', count: 10, interval: 0.6, delay: 0 },
    { type: 'wolf', count: 3, interval: 0.8, delay: 3 },
  ], bonus: 80 },
  { wave: 4, groups: [
    { type: 'wolf', count: 6, interval: 0.6, delay: 0 },
    { type: 'slime', count: 8, interval: 0.5, delay: 2 },
  ], bonus: 90 },
  { wave: 5, groups: [{ type: 'orc', count: 5, interval: 1.0, delay: 0 }], bonus: 120 },
  { wave: 6, groups: [
    { type: 'flyer', count: 6, interval: 0.8, delay: 0 },
    { type: 'slime', count: 12, interval: 0.4, delay: 3 },
  ], bonus: 130 },
  { wave: 7, groups: [
    { type: 'orc', count: 8, interval: 0.9, delay: 0 },
    { type: 'wolf', count: 8, interval: 0.5, delay: 4 },
  ], bonus: 150 },
  { wave: 8, groups: [
    { type: 'shielder', count: 4, interval: 1.2, delay: 0 },
    { type: 'orc', count: 8, interval: 0.7, delay: 3 },
  ], bonus: 180 },
  { wave: 9, groups: [
    { type: 'wolf', count: 15, interval: 0.4, delay: 0 },
    { type: 'flyer', count: 10, interval: 0.6, delay: 5 },
  ], bonus: 200 },
  { wave: 10, groups: [{ type: 'boss', count: 1, interval: 1.0, delay: 0 }], bonus: 500 },
];

export const LEVEL_1_2_WAVES: WaveConfig[] = [
  { wave: 1, groups: [{ type: 'slime', count: 10, interval: 0.7, delay: 0 }], bonus: 60 },
  { wave: 2, groups: [
    { type: 'slime', count: 10, interval: 0.6, delay: 0 },
    { type: 'fireElemental', count: 3, interval: 1.0, delay: 3 },
  ], bonus: 80 },
  { wave: 3, groups: [{ type: 'wolf', count: 10, interval: 0.6, delay: 0 }], bonus: 100 },
  { wave: 4, groups: [
    { type: 'fireElemental', count: 6, interval: 0.9, delay: 0 },
    { type: 'slime', count: 10, interval: 0.4, delay: 4 },
  ], bonus: 120 },
  { wave: 5, groups: [{ type: 'orc', count: 8, interval: 1.0, delay: 0 }], bonus: 140 },
  { wave: 6, groups: [
    { type: 'ghost', count: 8, interval: 0.8, delay: 0 },
    { type: 'flyer', count: 6, interval: 0.7, delay: 4 },
  ], bonus: 160 },
  { wave: 7, groups: [
    { type: 'shielder', count: 6, interval: 1.1, delay: 0 },
    { type: 'fireElemental', count: 6, interval: 0.8, delay: 5 },
  ], bonus: 180 },
  { wave: 8, groups: [{ type: 'boss', count: 1, interval: 1.0, delay: 0 }], bonus: 600 },
];

export const LEVEL_1_3_WAVES: WaveConfig[] = [
  { wave: 1, groups: [{ type: 'wolf', count: 8, interval: 0.7, delay: 0 }], bonus: 70 },
  { wave: 2, groups: [
    { type: 'fireElemental', count: 5, interval: 0.9, delay: 0 },
    { type: 'ghost', count: 4, interval: 0.8, delay: 3 },
  ], bonus: 100 },
  { wave: 3, groups: [{ type: 'orc', count: 10, interval: 0.8, delay: 0 }], bonus: 130 },
  { wave: 4, groups: [
    { type: 'shielder', count: 5, interval: 1.0, delay: 0 },
    { type: 'ghost', count: 8, interval: 0.7, delay: 4 },
  ], bonus: 160 },
  { wave: 5, groups: [
    { type: 'fireElemental', count: 12, interval: 0.6, delay: 0 },
    { type: 'boss', count: 1, interval: 1.0, delay: 5 },
  ], bonus: 700 },
];

// 30x17 grid
export const LEVEL_1_1_GRID: string[][] = [
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['s','p','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','p','p','p','p','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','c','c'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
];

// 30x17 grid with forest and lava
export const LEVEL_1_2_GRID: string[][] = [
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['s','p','p','f','f','p','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','p','p','p','f','f','p','p','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','p','p','l','l','p','p','p','p','p','p','p','p','p','p','p','c','c'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
];

// 30x17 grid with double spawn and lava river
export const LEVEL_1_3_GRID: string[][] = [
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['s','p','p','p','p','p','p','l','l','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','c','c'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['s','p','p','p','p','p','p','l','l','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','p','c','c'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
  ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
];

function convertGrid(rows: string[][]): import('../types').CellType[][] {
  const map: Record<string, import('../types').CellType> = {
    b: 'buildable',
    p: 'path',
    o: 'obstacle',
    w: 'water',
    l: 'lava',
    f: 'forest',
    s: 'spawn',
    c: 'core',
  };
  return rows.map(row => row.map(cell => map[cell] || 'buildable'));
}

export { convertGrid };
