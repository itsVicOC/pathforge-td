export const TILE_SIZE = 32;
export const LOGICAL_WIDTH = 960;
export const LOGICAL_HEIGHT = 540;
export const MAX_DELTA_TIME = 0.1;
export const ENEMY_HP_GROWTH = 1.08;
export const ENEMY_COUNT_GROWTH = 1.05;
export const SELL_REFUND_RATE = 0.7;

// 主调色板 - 暗色战术奇幻主题
export const PALETTE = {
  // 背景
  bgDark: '#0a0d10',
  bgPanel: '#151c22',
  bgPanelLight: '#22303a',

  // 地形
  buildable: '#334735',
  buildableDark: '#223126',
  path: '#75634b',
  pathDark: '#4f4233',
  obstacle: '#3e4650',
  water: '#1d5571',
  waterLight: '#3c8aa8',
  lava: '#8f2a1d',
  lavaLight: '#ef6c35',
  forest: '#1f5a35',
  forestLight: '#42a362',
  spawn: '#9b6233',
  core: '#f2c94c',
  coreGlow: 'rgba(242, 201, 76, 0.32)',

  // 塔
  towerArcher: '#8bc34a',
  towerCannon: '#ff9800',
  towerIce: '#00bcd4',
  towerLightning: '#9c27b0',
  towerPoison: '#4caf50',
  towerSniper: '#607d8b',
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
  enemyHealer: '#ec407a',
  enemyBomber: '#fdd835',
  enemyAssassin: '#c2185b',
  enemyBoss: '#d32f2f',
  enemyLavaBoss: '#ff3d00',
  enemySkyBoss: '#7c4dff',

  // UI
  text: '#f5f2e8',
  textMuted: '#9eb0a7',
  gold: '#f2c94c',
  lives: '#ff5d5d',
  energy: '#5ec8e5',
  uiBg: 'rgba(12, 17, 20, 0.94)',
  uiBorder: '#38505a',
  uiBorderLight: '#6f8b8b',
  uiAccent: '#58b978',
  uiAccentHover: '#74d293',
  uiDanger: '#ff5d5d',

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
  sniper: PALETTE.towerSniper,
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
  healer: PALETTE.enemyHealer,
  bomber: PALETTE.enemyBomber,
  assassin: PALETTE.enemyAssassin,
  boss: PALETTE.enemyBoss,
  lavaBoss: PALETTE.enemyLavaBoss,
  skyBoss: PALETTE.enemySkyBoss,
};
