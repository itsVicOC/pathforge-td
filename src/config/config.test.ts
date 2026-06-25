import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, getUnlockedAchievementIds } from './achievements';
import { ENEMY_CONFIGS } from './enemies';
import { LEVEL_CONFIGS } from './levels';
import { TOWER_CONFIGS } from './towers';

describe('content configuration integrity', () => {
  it('keeps tower documentation fields populated', () => {
    for (const tower of Object.values(TOWER_CONFIGS)) {
      expect(tower.role?.length).toBeGreaterThan(0);
      expect(tower.description?.length).toBeGreaterThan(0);
      expect(tower.special?.length).toBeGreaterThan(0);
      expect(tower.usage?.length).toBeGreaterThan(0);
    }
  });

  it('keeps wave enemy ids aligned with enemy configs', () => {
    for (const wave of Object.values(LEVEL_CONFIGS).flatMap(level => level.waves)) {
      for (const group of wave.groups) {
        expect(ENEMY_CONFIGS[group.type], `missing enemy config for ${group.type}`).toBeTruthy();
      }
    }
  });

  it('keeps the documented enemy roster represented in configured waves', () => {
    expect(Object.keys(ENEMY_CONFIGS)).toHaveLength(13);

    const waveEnemyIds = new Set(
      Object.values(LEVEL_CONFIGS)
        .flatMap(level => level.waves)
        .flatMap(wave => wave.groups.map(group => group.type)),
    );

    for (const enemyId of Object.keys(ENEMY_CONFIGS)) {
      expect(waveEnemyIds.has(enemyId), `${enemyId} should appear in at least one configured wave`).toBe(true);
    }
  });

  it('keeps the campaign ordered from 1-1 through 8-3', () => {
    const expectedLevelIds = Array.from({ length: 8 }, (_, chapter) =>
      Array.from({ length: 3 }, (__, stage) => `${chapter + 1}-${stage + 1}`),
    ).flat();

    expect(Object.keys(LEVEL_CONFIGS)).toEqual(expectedLevelIds);
  });

  it('keeps campaign pressure increasing by stage and by chapter', () => {
    const difficulty = Object.fromEntries(
      Object.values(LEVEL_CONFIGS).map(level => [level.id, getLevelDifficulty(level)]),
    );

    for (let chapter = 1; chapter <= 8; chapter++) {
      expect(difficulty[`${chapter}-2`], `${chapter}-2 should pressure more than ${chapter}-1`)
        .toBeGreaterThan(difficulty[`${chapter}-1`]);
      expect(difficulty[`${chapter}-3`], `${chapter}-3 should pressure more than ${chapter}-2`)
        .toBeGreaterThan(difficulty[`${chapter}-2`]);
    }

    for (let stage = 1; stage <= 3; stage++) {
      for (let chapter = 2; chapter <= 8; chapter++) {
        expect(difficulty[`${chapter}-${stage}`], `${chapter}-${stage} should pressure more than ${chapter - 1}-${stage}`)
          .toBeGreaterThan(difficulty[`${chapter - 1}-${stage}`]);
      }
    }

    expect(difficulty['8-3']).toBeGreaterThan(difficulty['1-1'] * 8);
  });

  it('keeps exactly 100 valid achievements', () => {
    expect(ACHIEVEMENTS).toHaveLength(100);
    expect(new Set(ACHIEVEMENTS.map(achievement => achievement.id)).size).toBe(ACHIEVEMENTS.length);

    const levelIds = new Set(Object.keys(LEVEL_CONFIGS));
    const chapterIds = new Set(Object.keys(LEVEL_CONFIGS).map(levelId => Number(levelId.split('-')[0])));

    for (const achievement of ACHIEVEMENTS) {
      expect(achievement.id.length).toBeGreaterThan(0);
      expect(achievement.name.length).toBeGreaterThan(0);
      expect(achievement.description.length).toBeGreaterThan(0);
      expect(achievement.icon.length).toBeGreaterThan(0);

      const condition = achievement.condition;
      if (condition.type === 'levelComplete' || condition.type === 'levelStars') {
        expect(levelIds.has(condition.levelId), `${achievement.id} should reference an existing level`).toBe(true);
      }
      if (condition.type === 'chapterComplete' || condition.type === 'chapterStars') {
        expect(chapterIds.has(condition.chapter), `${achievement.id} should reference an existing chapter`).toBe(true);
      }
    }
  });

  it('can unlock every configured achievement from a complete save context', () => {
    const campaign = Object.fromEntries(
      Object.keys(LEVEL_CONFIGS).map(levelId => [levelId, { normal: 3 }]),
    );

    const unlocked = getUnlockedAchievementIds({
      victory: true,
      stars: 3,
      levelId: '8-3',
      totalKills: 50000,
      totalBossKills: 50,
      highestWave: 50,
      singleRunGold: 10000,
      maxPathLength: 120,
      campaign,
    });

    expect(new Set(unlocked).size).toBe(100);
    expect(unlocked.sort()).toEqual(ACHIEVEMENTS.map(achievement => achievement.id).sort());
  });

  it('keeps boss skills separate from elite enemy abilities', () => {
    const bossIds = Object.values(ENEMY_CONFIGS)
      .filter(enemy => enemy.bossSkill)
      .map(enemy => enemy.id)
      .sort();

    expect(bossIds).toEqual(['boss', 'lavaBoss', 'skyBoss']);
    expect(ENEMY_CONFIGS.assassin.ability).toBe('dash');
    expect(ENEMY_CONFIGS.assassin.bossSkill).toBeUndefined();
  });

  it('keeps level metadata and grid endpoints aligned', () => {
    for (const level of Object.values(LEVEL_CONFIGS)) {
      expect(level.grid).toHaveLength(level.height);
      for (const row of level.grid) {
        expect(row).toHaveLength(level.width);
      }

      for (const spawn of level.spawns) {
        expect(level.grid[spawn.y]?.[spawn.x]).toBe('spawn');
      }
      for (const core of level.cores) {
        expect(level.grid[core.y]?.[core.x]).toBe('core');
      }
    }
  });
});

function getLevelDifficulty(level: (typeof LEVEL_CONFIGS)[string]): number {
  const threat = level.waves.reduce((levelTotal, wave) => {
    const waveThreat = wave.groups.reduce((waveTotal, group) => {
      const enemy = ENEMY_CONFIGS[group.type];
      const durability = enemy.hp * (1 + enemy.armor / 80 + enemy.magicResist / 120);
      const mobility = enemy.speed * (enemy.flying ? 1.4 : 1);
      const skill = enemy.bossSkill ? 2.2 : enemy.ability ? 1.35 : 1;
      const density = 1 + Math.max(0, 0.8 - group.interval) * 0.15;
      return waveTotal + durability * (0.85 + mobility / 4) * skill * density * group.count;
    }, 0);
    return levelTotal + waveThreat;
  }, 0);

  const routeComplexity = 1
    + Math.max(0, level.spawns.length - 1) * 0.16
    + Math.max(0, level.cores.length - 2) * 0.04;

  return Math.round(threat * routeComplexity);
}
