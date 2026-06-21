export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementConfig[] = [
  {
    id: 'first_victory',
    name: '初次胜利',
    description: '通关任意一个关卡',
    icon: '🏆',
  },
  {
    id: 'perfect_defense',
    name: '完美防线',
    description: '任意关卡获得 3 星评价',
    icon: '⭐',
  },
  {
    id: 'millionaire',
    name: '百万富翁',
    description: '单局累计获得 10,000 金币',
    icon: '💰',
  },
  {
    id: 'path_master',
    name: '路径大师',
    description: '使敌人路径长度超过 80 格',
    icon: '🌀',
  },
  {
    id: 'veteran',
    name: '塔防老手',
    description: '累计击杀 100 个敌人',
    icon: '⚔️',
  },
  {
    id: 'boss_slayer',
    name: 'Boss 猎手',
    description: '累计击杀 5 个 Boss',
    icon: '👹',
  },
];
