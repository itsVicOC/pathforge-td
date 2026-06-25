import { LEVEL_CONFIGS } from './levels';
import type { SaveData } from '../types';

export type AchievementCondition =
  | { type: 'victory' }
  | { type: 'anyThreeStar' }
  | { type: 'levelComplete'; levelId: string }
  | { type: 'levelStars'; levelId: string; stars: number }
  | { type: 'chapterComplete'; chapter: number }
  | { type: 'chapterStars'; chapter: number; stars: number }
  | { type: 'totalKills'; count: number }
  | { type: 'totalBossKills'; count: number }
  | { type: 'highestWave'; wave: number }
  | { type: 'singleRunGold'; amount: number }
  | { type: 'maxPathLength'; length: number }
  | { type: 'campaignStars'; stars: number };

export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
}

export interface AchievementContext {
  victory: boolean;
  stars: number;
  levelId?: string;
  totalKills: number;
  totalBossKills: number;
  highestWave: number;
  singleRunGold: number;
  maxPathLength: number;
  campaign: SaveData['progress']['campaign'];
}

const LEVEL_ENTRIES = Object.entries(LEVEL_CONFIGS);
const CHAPTERS = Array.from(new Set(LEVEL_ENTRIES.map(([id]) => Number(id.split('-')[0]))));

const CORE_ACHIEVEMENTS: AchievementConfig[] = [
  {
    id: 'first_victory',
    name: '初次胜利',
    description: '通关任意一个关卡',
    icon: '🏆',
    condition: { type: 'victory' },
  },
  {
    id: 'perfect_defense',
    name: '完美防线',
    description: '任意关卡获得 3 星评价',
    icon: '⭐',
    condition: { type: 'anyThreeStar' },
  },
  {
    id: 'millionaire',
    name: '百万富翁',
    description: '单局累计获得 10,000 金币',
    icon: '💰',
    condition: { type: 'singleRunGold', amount: 10000 },
  },
  {
    id: 'path_master',
    name: '路径大师',
    description: '使敌人路径长度超过 80 格',
    icon: '🌀',
    condition: { type: 'maxPathLength', length: 80 },
  },
  {
    id: 'veteran',
    name: '塔防老手',
    description: '累计击杀 100 个敌人',
    icon: '⚔️',
    condition: { type: 'totalKills', count: 100 },
  },
  {
    id: 'boss_slayer',
    name: 'Boss 猎手',
    description: '累计击杀 5 个 Boss',
    icon: '👹',
    condition: { type: 'totalBossKills', count: 5 },
  },
];

const LEVEL_CLEAR_ACHIEVEMENTS: AchievementConfig[] = LEVEL_ENTRIES.map(([id, level]) => ({
  id: `clear_${id.replace('-', '_')}`,
  name: `${id} 通关`,
  description: `通关 ${level.name}`,
  icon: '🏁',
  condition: { type: 'levelComplete', levelId: id },
}));

const LEVEL_STAR_ACHIEVEMENTS: AchievementConfig[] = LEVEL_ENTRIES.map(([id, level]) => ({
  id: `perfect_${id.replace('-', '_')}`,
  name: `${id} 三星`,
  description: `在 ${level.name} 获得 3 星评价`,
  icon: '🌟',
  condition: { type: 'levelStars', levelId: id, stars: 3 },
}));

const CHAPTER_CLEAR_ACHIEVEMENTS: AchievementConfig[] = CHAPTERS.map(chapter => ({
  id: `chapter_${chapter}_clear`,
  name: `第 ${chapter} 章征服者`,
  description: `通关第 ${chapter} 章全部关卡`,
  icon: '📜',
  condition: { type: 'chapterComplete', chapter },
}));

const CHAPTER_STAR_ACHIEVEMENTS: AchievementConfig[] = CHAPTERS.map(chapter => ({
  id: `chapter_${chapter}_perfect`,
  name: `第 ${chapter} 章无瑕防线`,
  description: `第 ${chapter} 章全部关卡获得 3 星`,
  icon: '💎',
  condition: { type: 'chapterStars', chapter, stars: 3 },
}));

const KILL_MILESTONE_ACHIEVEMENTS: AchievementConfig[] = [
  10,
  50,
  250,
  500,
  1000,
  2500,
  5000,
  10000,
  25000,
  50000,
].map(count => ({
  id: `kills_${count}`,
  name: `累计击杀 ${count}`,
  description: `累计击杀 ${count} 个敌人`,
  icon: '⚔️',
  condition: { type: 'totalKills', count },
}));

const ENDLESS_WAVE_ACHIEVEMENTS: AchievementConfig[] = [5, 10, 15, 20, 30, 40, 50].map(wave => ({
  id: `endless_wave_${wave}`,
  name: `无尽 ${wave} 波`,
  description: `无尽模式最高达到第 ${wave} 波`,
  icon: '♾️',
  condition: { type: 'highestWave', wave },
}));

const GOLD_RUN_ACHIEVEMENTS: AchievementConfig[] = [1000, 2500, 5000, 7500].map(amount => ({
  id: `gold_run_${amount}`,
  name: `单局金币 ${amount}`,
  description: `单局累计获得 ${amount} 金币`,
  icon: '💰',
  condition: { type: 'singleRunGold', amount },
}));

const PATH_LENGTH_ACHIEVEMENTS: AchievementConfig[] = [40, 60, 100, 120].map(length => ({
  id: `path_length_${length}`,
  name: `路径长度 ${length}`,
  description: `通过迷宫塑形让敌人路径长度超过 ${length} 格`,
  icon: '🌀',
  condition: { type: 'maxPathLength', length },
}));

const BOSS_KILL_ACHIEVEMENTS: AchievementConfig[] = [1, 10, 25, 50].map(count => ({
  id: `boss_kills_${count}`,
  name: `Boss 击破 ${count}`,
  description: `累计击杀 ${count} 个 Boss`,
  icon: '👹',
  condition: { type: 'totalBossKills', count },
}));

const CAMPAIGN_STAR_ACHIEVEMENTS: AchievementConfig[] = [
  {
    id: 'campaign_stars_24',
    name: '星火燎原',
    description: '战役累计获得 24 颗星',
    icon: '⭐',
    condition: { type: 'campaignStars', stars: 24 },
  },
];

export const ACHIEVEMENTS: AchievementConfig[] = [
  ...CORE_ACHIEVEMENTS,
  ...LEVEL_CLEAR_ACHIEVEMENTS,
  ...LEVEL_STAR_ACHIEVEMENTS,
  ...CHAPTER_CLEAR_ACHIEVEMENTS,
  ...CHAPTER_STAR_ACHIEVEMENTS,
  ...KILL_MILESTONE_ACHIEVEMENTS,
  ...ENDLESS_WAVE_ACHIEVEMENTS,
  ...GOLD_RUN_ACHIEVEMENTS,
  ...PATH_LENGTH_ACHIEVEMENTS,
  ...BOSS_KILL_ACHIEVEMENTS,
  ...CAMPAIGN_STAR_ACHIEVEMENTS,
];

export function getUnlockedAchievementIds(context: AchievementContext): string[] {
  return ACHIEVEMENTS
    .filter(achievement => isAchievementUnlocked(achievement, context))
    .map(achievement => achievement.id);
}

export function isAchievementUnlocked(achievement: AchievementConfig, context: AchievementContext): boolean {
  const condition = achievement.condition;
  switch (condition.type) {
    case 'victory':
      return context.victory || getCompletedLevelCount(context.campaign) > 0;
    case 'anyThreeStar':
      return context.stars >= 3 || getMaxLevelStars(context.campaign) >= 3;
    case 'levelComplete':
      return getLevelStars(context.campaign, condition.levelId) > 0;
    case 'levelStars':
      return getLevelStars(context.campaign, condition.levelId) >= condition.stars;
    case 'chapterComplete':
      return getChapterLevelIds(condition.chapter).every(levelId => getLevelStars(context.campaign, levelId) > 0);
    case 'chapterStars':
      return getChapterLevelIds(condition.chapter).every(levelId => getLevelStars(context.campaign, levelId) >= condition.stars);
    case 'totalKills':
      return context.totalKills >= condition.count;
    case 'totalBossKills':
      return context.totalBossKills >= condition.count;
    case 'highestWave':
      return context.highestWave >= condition.wave;
    case 'singleRunGold':
      return context.singleRunGold >= condition.amount;
    case 'maxPathLength':
      return context.maxPathLength >= condition.length;
    case 'campaignStars':
      return getTotalCampaignStars(context.campaign) >= condition.stars;
  }
}

function getChapterLevelIds(chapter: number): string[] {
  return LEVEL_ENTRIES
    .map(([id]) => id)
    .filter(id => Number(id.split('-')[0]) === chapter);
}

function getLevelStars(campaign: SaveData['progress']['campaign'], levelId: string): number {
  const progress = campaign[levelId];
  if (!progress) return 0;
  return Math.max(0, ...Object.values(progress));
}

function getTotalCampaignStars(campaign: SaveData['progress']['campaign']): number {
  return Object.keys(LEVEL_CONFIGS).reduce((total, levelId) => total + getLevelStars(campaign, levelId), 0);
}

function getCompletedLevelCount(campaign: SaveData['progress']['campaign']): number {
  return Object.keys(LEVEL_CONFIGS).filter(levelId => getLevelStars(campaign, levelId) > 0).length;
}

function getMaxLevelStars(campaign: SaveData['progress']['campaign']): number {
  return Object.keys(LEVEL_CONFIGS).reduce((maxStars, levelId) => Math.max(maxStars, getLevelStars(campaign, levelId)), 0);
}
