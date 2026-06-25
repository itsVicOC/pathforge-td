import type { CellType, WaveConfig } from '../types';

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
    { type: 'healer', count: 2, interval: 1.2, delay: 2 },
    { type: 'flyer', count: 6, interval: 0.7, delay: 4 },
  ], bonus: 160 },
  { wave: 7, groups: [
    { type: 'shielder', count: 6, interval: 1.1, delay: 0 },
    { type: 'bomber', count: 5, interval: 0.7, delay: 3 },
    { type: 'fireElemental', count: 6, interval: 0.8, delay: 5 },
  ], bonus: 180 },
  { wave: 8, groups: [{ type: 'lavaBoss', count: 1, interval: 1.0, delay: 0 }], bonus: 600 },
];

export const LEVEL_1_3_WAVES: WaveConfig[] = [
  { wave: 1, groups: [{ type: 'wolf', count: 10, interval: 0.65, delay: 0 }], bonus: 70 },
  { wave: 2, groups: [
    { type: 'fireElemental', count: 6, interval: 0.85, delay: 0 },
    { type: 'ghost', count: 5, interval: 0.75, delay: 3 },
  ], bonus: 100 },
  { wave: 3, groups: [
    { type: 'orc', count: 10, interval: 0.75, delay: 0 },
    { type: 'assassin', count: 4, interval: 0.8, delay: 3 },
  ], bonus: 130 },
  { wave: 4, groups: [
    { type: 'shielder', count: 6, interval: 0.95, delay: 0 },
    { type: 'healer', count: 3, interval: 1.0, delay: 2 },
    { type: 'ghost', count: 10, interval: 0.65, delay: 4 },
  ], bonus: 160 },
  { wave: 5, groups: [
    { type: 'fireElemental', count: 14, interval: 0.55, delay: 0 },
    { type: 'bomber', count: 8, interval: 0.55, delay: 2 },
    { type: 'skyBoss', count: 1, interval: 1.0, delay: 5 },
  ], bonus: 700 },
];

export const LEVEL_2_1_WAVES: WaveConfig[] = [
  { wave: 1, groups: [
    { type: 'wolf', count: 12, interval: 0.56, delay: 0 },
    { type: 'slime', count: 12, interval: 0.46, delay: 2 },
  ], bonus: 100 },
  { wave: 2, groups: [
    { type: 'fireElemental', count: 7, interval: 0.76, delay: 0 },
    { type: 'orc', count: 6, interval: 0.82, delay: 3 },
  ], bonus: 130 },
  { wave: 3, groups: [
    { type: 'flyer', count: 14, interval: 0.52, delay: 0 },
    { type: 'ghost', count: 9, interval: 0.62, delay: 3 },
  ], bonus: 160 },
  { wave: 4, groups: [
    { type: 'bomber', count: 10, interval: 0.52, delay: 0 },
    { type: 'assassin', count: 7, interval: 0.68, delay: 3 },
  ], bonus: 190 },
  { wave: 5, groups: [
    { type: 'shielder', count: 8, interval: 0.85, delay: 0 },
    { type: 'healer', count: 3, interval: 1.0, delay: 3 },
    { type: 'orc', count: 8, interval: 0.68, delay: 5 },
  ], bonus: 230 },
  { wave: 6, groups: [
    { type: 'ghost', count: 11, interval: 0.58, delay: 0 },
    { type: 'fireElemental', count: 9, interval: 0.66, delay: 3 },
  ], bonus: 260 },
  { wave: 7, groups: [
    { type: 'lavaBoss', count: 1, interval: 1.0, delay: 0 },
    { type: 'shielder', count: 7, interval: 0.8, delay: 5 },
  ], bonus: 650 },
];

export const LEVEL_2_2_WAVES: WaveConfig[] = [
  { wave: 1, groups: [
    { type: 'wolf', count: 16, interval: 0.5, delay: 0 },
    { type: 'slime', count: 16, interval: 0.4, delay: 3 },
  ], bonus: 120 },
  { wave: 2, groups: [
    { type: 'orc', count: 9, interval: 0.76, delay: 0 },
    { type: 'shielder', count: 5, interval: 0.9, delay: 4 },
  ], bonus: 150 },
  { wave: 3, groups: [
    { type: 'flyer', count: 13, interval: 0.54, delay: 0 },
    { type: 'bomber', count: 7, interval: 0.6, delay: 3 },
  ], bonus: 180 },
  { wave: 4, groups: [
    { type: 'healer', count: 3, interval: 1.05, delay: 0 },
    { type: 'fireElemental', count: 8, interval: 0.72, delay: 2 },
    { type: 'assassin', count: 4, interval: 0.78, delay: 5 },
  ], bonus: 220 },
  { wave: 5, groups: [
    { type: 'ghost', count: 15, interval: 0.52, delay: 0 },
    { type: 'flyer', count: 14, interval: 0.48, delay: 4 },
  ], bonus: 260 },
  { wave: 6, groups: [
    { type: 'shielder', count: 11, interval: 0.76, delay: 0 },
    { type: 'bomber', count: 11, interval: 0.5, delay: 3 },
    { type: 'orc', count: 11, interval: 0.68, delay: 5 },
  ], bonus: 300 },
  { wave: 7, groups: [
    { type: 'boss', count: 1, interval: 1.0, delay: 0 },
    { type: 'skyBoss', count: 1, interval: 1.0, delay: 5 },
    { type: 'ghost', count: 10, interval: 0.62, delay: 9 },
  ], bonus: 700 },
];

export const LEVEL_2_3_WAVES: WaveConfig[] = [
  { wave: 1, groups: [
    { type: 'orc', count: 10, interval: 0.75, delay: 0 },
    { type: 'wolf', count: 12, interval: 0.45, delay: 3 },
  ], bonus: 140 },
  { wave: 2, groups: [
    { type: 'fireElemental', count: 10, interval: 0.65, delay: 0 },
    { type: 'shielder', count: 6, interval: 0.9, delay: 4 },
  ], bonus: 180 },
  { wave: 3, groups: [
    { type: 'flyer', count: 14, interval: 0.5, delay: 0 },
    { type: 'ghost', count: 10, interval: 0.55, delay: 3 },
  ], bonus: 220 },
  { wave: 4, groups: [
    { type: 'assassin', count: 9, interval: 0.58, delay: 0 },
    { type: 'bomber', count: 10, interval: 0.48, delay: 2 },
    { type: 'healer', count: 4, interval: 0.95, delay: 5 },
  ], bonus: 260 },
  { wave: 5, groups: [
    { type: 'fireElemental', count: 14, interval: 0.55, delay: 0 },
    { type: 'ghost', count: 12, interval: 0.5, delay: 3 },
    { type: 'shielder', count: 8, interval: 0.72, delay: 5 },
  ], bonus: 320 },
  { wave: 6, groups: [
    { type: 'skyBoss', count: 1, interval: 1.0, delay: 0 },
    { type: 'flyer', count: 16, interval: 0.48, delay: 4 },
    { type: 'ghost', count: 8, interval: 0.56, delay: 7 },
  ], bonus: 720 },
  { wave: 7, groups: [
    { type: 'lavaBoss', count: 1, interval: 1.0, delay: 0 },
    { type: 'boss', count: 1, interval: 1.0, delay: 6 },
    { type: 'assassin', count: 9, interval: 0.6, delay: 10 },
  ], bonus: 760 },
];

// 30x17 grids. Road tiles are cheap to traverse, buildable tiles are slower
// fallback space for player-made mazes, and obstacles trim unused dead areas.
export const LEVEL_1_1_GRID: string[][] = toGrid([
  'oooooooooooooooooooooooooooooo',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'spppppbbbbbbbbooooobbbbbbbbbbb',
  'bbbbbpbbbbbbbobbbbbbbbooooobbb',
  'bbbbbpbbbbbbbobbbbbbbbbbbbbbbb',
  'booobpbooooobobbbbooooobbbbbbb',
  'bbbbbpbbbbbbbobbbbbobbbbbbbbbb',
  'bbbbbpppppbbbbbbbbbobbbbbbbbbb',
  'bbbbbbbbbpbbbooooobobbbbbbbbbb',
  'bbbbbbbbbpbbbbbbbbbobbbbbbbbbb',
  'booooobbbppppppbbbbobbbbbbbbcc',
  'bbbbbbbbbbbbbbpbbbbobbbbbbbbbb',
  'bbbbbooooobbbbpbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbpppppppppppppbbb',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
]);

export const LEVEL_1_2_GRID: string[][] = toGrid([
  'oooooooooooooooooooooooooooooo',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'sppppffbbbbbooooobbblllbbbbbbb',
  'bbbbpffbbbbbobbbbbbblllbooobbb',
  'bbbbpbbbbbbbobbbffbbbbbbbbbbbb',
  'bbbpppppbbbboobbffbbbooooobbbb',
  'bbbplllpbbbbbbbbbbbbbbbbbbbbbb',
  'bbbplllppppppbbbbbooooobbbbbbb',
  'bbbbbbbbbbbpppppbbbbbbbllllccb',
  'bbbooooobbbbbbbpbbbbbbbllllbbb',
  'bbbbbbbbbbbbbbbpffffbbbbbbbbbb',
  'bbbbbbllllbbbbbppppppbbbbbbbbb',
  'bbbbbbllllbbboooobbbpbbbbbbbbb',
  'bbbbbbbbbbbbbbbbbbbbppppppbbbb',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
]);

export const LEVEL_1_3_GRID: string[][] = toGrid([
  'oooooooooooooooooooooooooooooo',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'spppppbbbbbooooobbbllllbbbbccb',
  'bbbbbpbbbbbbbbbbbbbbllllbbbbbb',
  'bbbbbpbbbbbbbbbooooobbbbbbbbbb',
  'bbbbbpbbbbbbbbbbbbbbbbbbbbbbbb',
  'spppppppppbbbbbooooobbbbbbbccb',
  'bbbbbbbbbpbbbbbbbbbbbbbbbbbbbb',
  'bbbooooobpbbbllllbbbbbooooobbb',
  'bbbbbbbbbpbbbllllbbbbbbbbbbbbb',
  'bbbbbbbbbpppppbbbbbbbbbllllbbb',
  'booooobbbbbbbpbbbbbbbbbbllllbb',
  'bbbbbbbbbbbbbpbbbooooobbbbbbbb',
  'bbbbbbbbbbbbbpppppppppppppbbbb',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
]);

export const LEVEL_2_1_GRID: string[][] = toGrid([
  'oooooooooooooooooooooooooooooo',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'bbbbbbbbbooooobbbbffffbbbbbbbb',
  'bbbbooooobbbbbbbbbffffbbbbooob',
  'spppppbbbbllllbbbbbbbbbbbbbbbb',
  'bbbbbpbbbbllllbbbbooooobbbbbbb',
  'bbbbbpbbbbbbbbbbbbobbbbbbbbbbb',
  'bbbbbppppppppbbbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbpbbbbffffbbbbbbbbb',
  'bbbbbbbbbbbbppppbpppppppppppcc',
  'bbbbffffbbbbbbbbbbbbbbbbbbbbbb',
  'bbbbffffbbbbllllbbbbooooobbbbb',
  'bbbbbbbbbbbbllllbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
]);

export const LEVEL_2_2_GRID: string[][] = toGrid([
  'oooooooooooooooooooooooooooooo',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'sppppppppbbbbffffbbbbllllbbbbb',
  'bbbbbbbbpbbbffffbbbboooobbbbbb',
  'bbbbllllpbbbbbbbbbbbbbbbbbbbbb',
  'bbbbllllpbbbbooooobbbbffffbbbb',
  'bbbbbbbbppppbpppppppppppppppcc',
  'bbbbffffpbbbbllllbbbbbbbbbbbbb',
  'bbbbffffpbbbbllllbbbbooooobbbb',
  'bbbbbbbbpbbbbbbbbbbbbbbbbbbbbb',
  'sppppppppbbbbooooobbbbffffbbbb',
  'bbbbbbbbbbbbbbbbbbbbffffbbbbbb',
  'bbbbooooobbbbllllbbbbbbbbbbbbb',
  'bbbbbbbbbbbbllllbbbbbbbbbbbbbb',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
]);

export const LEVEL_2_3_GRID: string[][] = toGrid([
  'oooooooooooooooooooooooooooooo',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'bbbbffffbbbbooooobbbbllllbbbbb',
  'sppppppbbbbbbbbbbbbbbllllbbbbb',
  'bbbbbpbbbbffffbbbbooooobbbbbbb',
  'bbbbbpbbbbffffbbbbbbbbbbbbbbcc',
  'bbbbbpbbbbbbbbbbbbllllbbbbbbbb',
  'bbbbbppppbppppppppppppppppppcc',
  'bbbbbpbbbbbbbbbbbbllllbbbbbbbb',
  'bbbbbpbbbbooooobbbbbbbbffffbbb',
  'bbbbbpbbbbbbbbbbbbbbbbbbffffbb',
  'sppppppbbbbllllbbbbooooobbbbbb',
  'bbbbbbbbbbbbllllbbbbbbbbbbbbbb',
  'bbbbffffbbbbbbbbbbbbllllbbbbbb',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
  'oooooooooooooooooooooooooooooo',
]);

function convertGrid(rows: string[][]): CellType[][] {
  const map: Record<string, CellType> = {
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

function toGrid(rows: string[]): string[][] {
  return rows.map(row => row.split(''));
}

export function createAdvancedLevelGrid(stage: number): CellType[][] {
  const source = stage === 1 ? LEVEL_2_1_GRID : stage === 2 ? LEVEL_2_2_GRID : LEVEL_2_3_GRID;
  return convertGrid(source);
}

export function createAdvancedLevelWaves(chapter: number, stage: number): WaveConfig[] {
  const campaignStep = (chapter - 3) * 3 + stage;
  const openingCount = Math.floor(campaignStep * 1.1);
  const eliteCount = Math.floor(campaignStep * 1.5);
  const stageOneFinalSurge = stage === 1 ? 18 : 0;
  const bonus = (base: number) => base + campaignStep * 45 + stage * 20;
  const bossType = stage === 1
    ? (chapter % 2 === 0 ? 'lavaBoss' : 'boss')
    : stage === 2
      ? (chapter % 2 === 0 ? 'skyBoss' : 'boss')
      : (chapter % 2 === 0 ? 'skyBoss' : 'lavaBoss');
  const secondBossType = bossType === 'lavaBoss' ? 'skyBoss' : 'lavaBoss';
  const heavyEscort = stage === 1 ? 'orc' : stage === 2 ? 'flyer' : 'assassin';
  const eliteEscort = stage === 1 ? 'shielder' : stage === 2 ? 'ghost' : 'bomber';

  const waves: WaveConfig[] = [
    { wave: 1, groups: [
      { type: 'wolf', count: 12 + campaignStep * 2, interval: 0.5, delay: 0 },
      { type: 'slime', count: 14 + campaignStep * 2 + stage, interval: 0.4, delay: 2 },
    ], bonus: bonus(120) },
    { wave: 2, groups: [
      { type: 'orc', count: 7 + openingCount, interval: 0.76, delay: 0 },
      { type: 'fireElemental', count: 6 + openingCount, interval: 0.72, delay: 3 },
    ], bonus: bonus(150) },
    { wave: 3, groups: [
      { type: 'flyer', count: 10 + campaignStep * 2, interval: 0.52, delay: 0 },
      { type: 'ghost', count: 7 + openingCount, interval: 0.62, delay: 3 },
    ], bonus: bonus(180) },
    { wave: 4, groups: [
      { type: 'assassin', count: 4 + openingCount, interval: 0.68, delay: 0 },
      { type: 'bomber', count: 6 + openingCount, interval: 0.54, delay: 2 },
      { type: 'healer', count: 2 + Math.floor(campaignStep / 6), interval: 1.05, delay: 5 },
    ], bonus: bonus(220) },
    { wave: 5, groups: [
      { type: 'shielder', count: 6 + openingCount, interval: 0.82, delay: 0 },
      { type: 'fireElemental', count: 8 + openingCount, interval: 0.66, delay: 3 },
      { type: 'ghost', count: 8 + eliteCount + stage, interval: 0.56, delay: 5 },
    ], bonus: bonus(270) },
    { wave: 6, groups: [
      { type: bossType, count: 1, interval: 1.0, delay: 0 },
      { type: heavyEscort, count: 10 + campaignStep * 3, interval: 0.58, delay: 5 },
      { type: 'healer', count: 3 + Math.floor(campaignStep / 5), interval: 1.0, delay: 8 },
    ], bonus: bonus(720) },
    { wave: 7, groups: [
      { type: 'shielder', count: 8 + openingCount, interval: 0.74, delay: 0 },
      { type: 'assassin', count: 7 + openingCount, interval: 0.6, delay: 2 },
      { type: eliteEscort, count: 8 + openingCount, interval: 0.58, delay: 4 },
    ], bonus: bonus(380) },
    { wave: 8, groups: [
      { type: bossType, count: 1, interval: 1.0, delay: 0 },
      { type: secondBossType, count: 1, interval: 1.0, delay: 6 },
      { type: 'skyBoss', count: stage === 2 && chapter >= 6 ? 1 : 0, interval: 1.0, delay: 9 },
      { type: 'boss', count: stage === 1 ? 1 : 0, interval: 1.0, delay: 12 },
      { type: 'skyBoss', count: stage === 1 && chapter >= 8 ? 1 : 0, interval: 1.0, delay: 14 },
      { type: 'flyer', count: 12 + campaignStep * 3 + stageOneFinalSurge, interval: 0.48, delay: 8 },
      { type: 'ghost', count: 9 + eliteCount + stageOneFinalSurge, interval: 0.55, delay: 10 },
    ].filter(group => group.count > 0), bonus: bonus(900) },
  ];

  if (stage === 3 && chapter >= 7) {
    waves[7].groups.push({ type: 'lavaBoss', count: 1, interval: 1.0, delay: 12 });
  }

  return waves;
}

export { convertGrid };
