export const TILE_SIZE = 32;
export const LOGICAL_WIDTH = 960;
export const LOGICAL_HEIGHT = 540;
export const MAX_DELTA_TIME = 0.1;
export const ENEMY_HP_GROWTH = 1.08;
export const ENEMY_COUNT_GROWTH = 1.05;
export const SELL_REFUND_RATE = 0.7;

export const COLORS = {
  background: '#1a1a2e',
  gridBuildable: '#2d4a3e',
  gridPath: '#6b5b4f',
  gridObstacle: '#3a3a4a',
  gridWater: '#1e3a5f',
  gridSpawn: '#8b4513',
  gridCore: '#ffd700',
  pathPreview: 'rgba(255, 255, 0, 0.4)',
  rangeIndicator: 'rgba(255, 255, 255, 0.2)',
  text: '#ffffff',
  gold: '#ffd700',
  lives: '#ff5252',
  uiBg: 'rgba(0, 0, 0, 0.7)',
  uiBorder: '#4a4a6a',
} as const;
