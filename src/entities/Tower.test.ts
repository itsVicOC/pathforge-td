import { describe, expect, it } from 'vitest';
import { eventBus } from '../core/EventBus';
import { Enemy } from './Enemy';
import { Tower } from './Tower';
import type { EnemyConfig, TowerConfig } from '../types';

const enemyConfig: EnemyConfig = {
  id: 'slime',
  name: 'Slime',
  hp: 30,
  speed: 1,
  armor: 0,
  magicResist: 0,
  reward: 5,
  flying: false,
  color: '#fff',
  radius: 6,
};

const towerConfig: TowerConfig = {
  id: 'archer',
  name: 'Archer',
  cost: 80,
  range: 5,
  damage: 8,
  fireRate: 1,
  projectileType: 'projectile',
  damageType: 'physical',
  targetFlags: ['ground'],
  color: '#fff',
  upgrades: [],
};

function makeEnemy(pathProgress: number): Enemy {
  const enemy = new Enemy(enemyConfig, [{ x: 1, y: 0 }, { x: 2, y: 0 }]);
  enemy.pathProgress = pathProgress;
  return enemy;
}

describe('Tower targeting', () => {
  it('targets the enemy closest to the core by default', () => {
    const tower = new Tower(0, 0, towerConfig);
    tower.built = true;
    const trailing = makeEnemy(0.2);
    const leading = makeEnemy(0.8);
    let target: Enemy | undefined;
    const unsubscribe = eventBus.on('tower:fire', (event: { target: Enemy }) => {
      target = event.target;
    });

    tower.update(1, [trailing, leading]);
    unsubscribe();

    expect(target).toBe(leading);
  });

  it('can switch to targeting the trailing enemy', () => {
    const tower = new Tower(0, 0, towerConfig);
    tower.built = true;
    tower.cycleTargetPriority();
    const trailing = makeEnemy(0.2);
    const leading = makeEnemy(0.8);
    let target: Enemy | undefined;
    const unsubscribe = eventBus.on('tower:fire', (event: { target: Enemy }) => {
      target = event.target;
    });

    tower.update(1, [trailing, leading]);
    unsubscribe();

    expect(target).toBe(trailing);
  });
});
