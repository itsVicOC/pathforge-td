export interface Vec2 {
  x: number;
  y: number;
}

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  towerId?: string;
}

export type CellType =
  | 'buildable'
  | 'path'
  | 'obstacle'
  | 'water'
  | 'lava'
  | 'forest'
  | 'spawn'
  | 'core';

export interface TowerConfig {
  id: string;
  name: string;
  cost: number;
  range: number; // in tiles
  damage: number;
  fireRate: number; // attacks per second
  projectileType: ProjectileType;
  damageType: DamageType;
  targetFlags: TargetFlag[];
  color: string;
  upgrades: UpgradeConfig[];
}

export interface UpgradeConfig {
  level: number;
  cost: number;
  damageMultiplier: number;
  rangeBonus: number;
  fireRateMultiplier: number;
}

export interface EnemyConfig {
  id: string;
  name: string;
  hp: number;
  speed: number; // tiles per second
  armor: number;
  magicResist: number;
  reward: number;
  flying: boolean;
  color: string;
  radius: number;
  bossSkill?: BossSkillType;
}

export type BossSkillType = 'summon' | 'burningGround' | 'dash' | 'spawnFlyers';

export interface WaveGroup {
  type: string;
  count: number;
  interval: number;
  delay: number;
}

export interface WaveConfig {
  wave: number;
  groups: WaveGroup[];
  bonus: number;
}

export interface LevelConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  startingGold: number;
  lives: number;
  grid: CellType[][];
  spawns: Vec2[];
  cores: Vec2[];
  waves: WaveConfig[];
}

export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'true';
export type ProjectileType = 'projectile' | 'hitscan' | 'aoe' | 'beam';
export type TargetFlag = 'ground' | 'flying';
export type TerrainEffect = 'none' | 'slow' | 'damage';

export type GamePhase = 'menu' | 'build' | 'combat' | 'wave_clear' | 'victory' | 'defeat';

export interface GameState {
  phase: GamePhase;
  lives: number;
  wave: number;
  totalWaves: number;
  timeScale: number;
  paused: boolean;
  selectedTowerId?: string;
  hoveredCell?: Vec2;
}

export interface SaveData {
  version: number;
  player: {
    level: number;
    xp: number;
  };
  progress: {
    campaign: Record<string, Record<string, number>>;
    unlocks: string[];
    achievements: string[];
  };
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
  stats: {
    totalKills: number;
    highestWave: number;
  };
}

export interface EffectSnapshot {
  type: string;
  duration: number;
  tickDamage?: number;
}
