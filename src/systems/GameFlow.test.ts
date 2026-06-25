import { describe, expect, it } from 'vitest';
import { eventBus } from '../core/EventBus';
import { LEVEL_CONFIGS } from '../config/levels';
import { TOWER_CONFIGS } from '../config/towers';
import { Enemy } from '../entities/Enemy';
import { EconomyManager } from './EconomyManager';
import { EnemyManager } from './EnemyManager';
import { Grid } from './Grid';
import { Pathfinder } from './Pathfinder';
import { ProjectileManager } from './ProjectileManager';
import { TowerManager } from './TowerManager';
import { WaveManager } from './WaveManager';
import type { LevelConfig, TowerConfig, WaveConfig } from '../types';

interface SimulationResult {
  finalWave: number;
  kills: number;
  lives: number;
  placedTowers: number;
  towers: string[];
  timedOut: boolean;
}

describe('configured level gameplay flow', () => {
  it('can run every configured campaign level through all waves with a reasonable automated defense', () => {
    const usedTowerTypes = new Set<string>();

    for (const level of Object.values(LEVEL_CONFIGS)) {
      const result = simulateLevel(level);
      const summary = `${level.id} result ${JSON.stringify(result)}`;
      result.towers.forEach(tower => usedTowerTypes.add(tower.split('@')[0]));

      expect(result.timedOut, `${summary} should not stall`).toBe(false);
      expect(result.finalWave, `${summary} should complete every configured wave`).toBe(level.waves.length);
      expect(result.placedTowers, `${summary} should build a real defense`).toBeGreaterThan(0);
      expect(result.kills, `${summary} should kill enemies during the run`).toBeGreaterThan(0);
    }

    expect([...usedTowerTypes].sort()).toEqual(Object.keys(TOWER_CONFIGS).sort());
  });
});

function simulateLevel(level: LevelConfig): SimulationResult {
  const grid = new Grid();
  grid.load(level.grid);
  const pathfinder = new Pathfinder(grid);
  const economy = new EconomyManager();
  economy.reset(level.startingGold);
  const enemyManager = new EnemyManager(pathfinder, grid);
  const towerManager = new TowerManager(grid, pathfinder, economy);
  const projectileManager = new ProjectileManager();
  const waveManager = new WaveManager(enemyManager, economy);
  waveManager.load(level.waves);

  let lives = level.lives;
  let kills = 0;
  const unsubscribers = [
    eventBus.on('tower:fire', ({ tower, target, damage, damageType }: {
      tower: import('../entities/Tower').Tower;
      target: Enemy;
      damage: number;
      damageType: string;
    }) => {
      if (tower.config.projectileType === 'hitscan') {
        target.takeDamage(damage, damageType as any);
        tower.applyOnHitEffect(target);
      } else {
        projectileManager.spawn(tower, target, damage, damageType, tower.config.projectileType);
      }
    }),
    eventBus.on('enemy:killed', ({ reward }: { enemy: Enemy; reward: number }) => {
      economy.addKillReward(reward);
      kills++;
    }),
    eventBus.on('enemy:reachedCore', () => {
      lives--;
    }),
  ];

  try {
    let timedOut = false;

    while (waveManager.getCurrentWave() < level.waves.length && lives > 0) {
      const wave = waveManager.getNextWavePreview();
      if (wave) buildForWave(wave, grid, pathfinder, towerManager, economy);

      waveManager.startWave();
      let elapsed = 0;
      const dt = 0.1;

      while (waveManager.isWaveInProgress() && lives > 0) {
        elapsed += dt;
        if (elapsed > 260) {
          timedOut = true;
          break;
        }

        waveManager.update(dt);
        enemyManager.update(dt);
        grid.update(dt);
        towerManager.update(dt, enemyManager.getEnemies());
        projectileManager.update(dt, enemyManager.getEnemies());
      }

      if (timedOut) {
        return {
          finalWave: waveManager.getCurrentWave(),
          kills,
          lives,
          placedTowers: towerManager.getTowers().length,
          towers: towerManager.getTowers().map(tower => `${tower.config.id}@${tower.x},${tower.y}`),
          timedOut,
        };
      }
    }

    return {
      finalWave: waveManager.getCurrentWave(),
      kills,
      lives,
      placedTowers: towerManager.getTowers().length,
      towers: towerManager.getTowers().map(tower => `${tower.config.id}@${tower.x},${tower.y}`),
      timedOut: false,
    };
  } finally {
    for (const unsubscribe of unsubscribers) unsubscribe();
  }
}

function buildForWave(
  wave: WaveConfig,
  grid: Grid,
  pathfinder: Pathfinder,
  towerManager: TowerManager,
  economy: EconomyManager,
): void {
  const hasSupport = towerManager.getTowers().some(tower => tower.config.id === 'support');
  const hasClusterToBuff = towerManager.getTowers().filter(tower => tower.config.id !== 'support').length >= 3;
  const desired = getDesiredTowerOrder(wave);
  const ordered = hasClusterToBuff && !hasSupport
    ? ['support', ...desired.filter(towerId => towerId !== 'support')]
    : desired;
  let built = 0;

  for (const towerId of ordered) {
    if (built >= 6) break;
    if (!economy.canAfford(TOWER_CONFIGS[towerId].cost)) continue;

    const placement = findBestPlacement(TOWER_CONFIGS[towerId], wave, grid, pathfinder, towerManager);
    if (!placement) continue;

    if (towerManager.placeTower(placement.x, placement.y, towerId)) {
      built++;
    }
  }

  if (towerManager.getTowers().length >= 8) {
    upgradeExistingTowers(ordered, towerManager, 3);
  }
}

function upgradeExistingTowers(
  preferredTowerIds: string[],
  towerManager: TowerManager,
  maxUpgrades: number,
): void {
  let upgraded = 0;
  const preferred = new Map(preferredTowerIds.map((towerId, index) => [towerId, index]));
  const candidates = [...towerManager.getTowers()]
    .filter(tower => tower.getNextUpgrade())
    .sort((a, b) => {
      const aRank = preferred.get(a.config.id) ?? preferredTowerIds.length;
      const bRank = preferred.get(b.config.id) ?? preferredTowerIds.length;
      if (aRank !== bRank) return aRank - bRank;
      return b.level - a.level;
    });

  for (const tower of candidates) {
    if (upgraded >= maxUpgrades) return;
    if (towerManager.upgradeTower(tower)) upgraded++;
  }
}

function getDesiredTowerOrder(wave: WaveConfig): string[] {
  const types = wave.groups.map(group => group.type);
  if (types.some(type => ['flyer', 'ghost', 'skyBoss'].includes(type))) {
    return ['lightning', 'poison', 'sniper', 'support', 'ice', 'cannon', 'archer', 'barracks'];
  }
  if (types.some(type => ['boss', 'lavaBoss', 'skyBoss', 'orc', 'shielder'].includes(type))) {
    return ['poison', 'sniper', 'cannon', 'support', 'barracks', 'ice', 'lightning', 'archer'];
  }
  if (types.some(type => ['wolf', 'bomber', 'assassin'].includes(type))) {
    return ['archer', 'ice', 'lightning', 'barracks', 'cannon', 'poison', 'support'];
  }
  return ['cannon', 'archer', 'ice', 'barracks', 'poison', 'lightning', 'support'];
}

function findBestPlacement(
  config: TowerConfig,
  wave: WaveConfig,
  grid: Grid,
  pathfinder: Pathfinder,
  towerManager: TowerManager,
): { x: number; y: number } | undefined {
  const existingTowers = towerManager.getTowers();
  const routeCells = [
    ...Array.from(pathfinder.getAllPaths().values()).flat(),
    ...getFlightRouteCells(wave, grid, config),
  ];
  let best: { x: number; y: number; score: number } | undefined;

  for (const row of grid.getCells()) {
    for (const cell of row) {
      if (!grid.isBuildable(cell.x, cell.y)) continue;
      if (!pathfinder.validatePlacement(cell.x, cell.y)) continue;

      const score = config.id === 'support'
        ? scoreSupportPlacement(config, cell.x, cell.y, existingTowers)
        : routeCells.reduce((total, routeCell, index) => {
          const dist = Math.hypot(routeCell.x + 0.5 - (cell.x + 0.5), routeCell.y + 0.5 - (cell.y + 0.5));
          if (dist > config.range) return total;
          return total + 1 + index / Math.max(1, routeCells.length);
        }, 0);

      if (!best || score > best.score) {
        best = { x: cell.x, y: cell.y, score };
      }
    }
  }

  return best && best.score > 0 ? best : undefined;
}

function scoreSupportPlacement(
  config: TowerConfig,
  x: number,
  y: number,
  towers: ReturnType<TowerManager['getTowers']>,
): number {
  return towers.reduce((total, tower) => {
    if (tower.config.id === 'support') return total;
    const dist = Math.hypot(tower.x + 0.5 - (x + 0.5), tower.y + 0.5 - (y + 0.5));
    if (dist > config.range) return total;
    return total + 10 + (config.range - dist);
  }, 0);
}

function getFlightRouteCells(wave: WaveConfig, grid: Grid, config: TowerConfig): Array<{ x: number; y: number }> {
  const hasFlying = wave.groups.some(group => ['flyer', 'ghost', 'skyBoss'].includes(group.type));
  if (!hasFlying || !config.targetFlags.includes('flying')) return [];

  const cells: Array<{ x: number; y: number }> = [];
  for (const spawn of grid.getSpawns()) {
    const core = grid.getCores().reduce((best, next) => {
      const bestDist = Math.abs(best.x - spawn.x) + Math.abs(best.y - spawn.y);
      const nextDist = Math.abs(next.x - spawn.x) + Math.abs(next.y - spawn.y);
      return nextDist < bestDist ? next : best;
    }, grid.getCores()[0]);

    const steps = Math.max(Math.abs(core.x - spawn.x), Math.abs(core.y - spawn.y));
    for (let i = 0; i <= steps; i++) {
      const t = i / Math.max(1, steps);
      cells.push({
        x: Math.round(spawn.x + (core.x - spawn.x) * t),
        y: Math.round(spawn.y + (core.y - spawn.y) * t),
      });
    }
  }

  return cells;
}
