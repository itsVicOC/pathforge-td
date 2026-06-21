export const TILE_SIZE = 32;
export const LOGICAL_WIDTH = 960;
export const LOGICAL_HEIGHT = 540;
export const MAX_DELTA_TIME = 0.1;
export const ENEMY_HP_GROWTH = 1.08;
export const ENEMY_COUNT_GROWTH = 1.05;
export const SELL_REFUND_RATE = 0.7;

// 主调色板 - 暗色像素风主题
export const PALETTE = {
  // 背景
  bgDark: '#0f0f1a',
  bgPanel: '#1a1a2e',
  bgPanelLight: '#252542',

  // 地形
  buildable: '#2d3a2d',
  buildableDark: '#232f23',
  path: '#5c5045',
  pathDark: '#4a4037',
  obstacle: '#3a3a4a',
  water: '#1e4a6e',
  waterLight: '#2a6090',
  lava: '#8b1a1a',
  lavaLight: '#b52a2a',
  forest: '#1b4d1b',
  forestLight: '#276327',
  spawn: '#8b4513',
  core: '#ffd700',
  coreGlow: 'rgba(255, 215, 0, 0.3)',

  // 塔
  towerArcher: '#8bc34a',
  towerCannon: '#ff9800',
  towerIce: '#00bcd4',
  towerLightning: '#9c27b0',
  towerPoison: '#4caf50',
  towerSupport: '#ffeb3b',
  towerBarracks: '#795548',

  // 敌人
  enemySlime: '#7cb342',
  enemyWolf: '#8d6e63',
  enemyOrc: '#558b2f',
  enemyFlyer: '#29b6f6',
  enemyShielder: '#78909c',
  enemyGhost: '#b39ddb',
  enemyFire: '#ff5722',
  enemyBoss: '#d32f2f',
  enemyLavaBoss: '#ff3d00',
  enemySkyBoss: '#7c4dff',

  // UI
  text: '#f0f0f5',
  textMuted: '#a0a0b0',
  gold: '#ffd54f',
  lives: '#ff5252',
  energy: '#4fc3f7',
  uiBg: 'rgba(20, 20, 35, 0.92)',
  uiBorder: '#4a4a6a',
  uiBorderLight: '#6b6b8a',
  uiAccent: '#4caf50',
  uiAccentHover: '#66bb6a',
  uiDanger: '#ef5350',

  // 特效
  pathPreview: 'rgba(255, 213, 79, 0.5)',
  rangeIndicator: 'rgba(255, 255, 255, 0.15)',
  rangeIndicatorBorder: 'rgba(255, 255, 255, 0.35)',
  explosion: '#ff9800',
  hit: '#ffffff',
  beam: '#e040fb',
} as const;

// 兼容旧代码的 COLORS 导出
export const COLORS = PALETTE;

// 塔颜色映射
export const TOWER_COLORS: Record<string, string> = {
  archer: PALETTE.towerArcher,
  cannon: PALETTE.towerCannon,
  ice: PALETTE.towerIce,
  lightning: PALETTE.towerLightning,
  poison: PALETTE.towerPoison,
  support: PALETTE.towerSupport,
  barracks: PALETTE.towerBarracks,
};

// 敌人颜色映射
export const ENEMY_COLORS: Record<string, string> = {
  slime: PALETTE.enemySlime,
  wolf: PALETTE.enemyWolf,
  orc: PALETTE.enemyOrc,
  flyer: PALETTE.enemyFlyer,
  shielder: PALETTE.enemyShielder,
  ghost: PALETTE.enemyGhost,
  fireElemental: PALETTE.enemyFire,
  boss: PALETTE.enemyBoss,
  lavaBoss: PALETTE.enemyLavaBoss,
  skyBoss: PALETTE.enemySkyBoss,
};
