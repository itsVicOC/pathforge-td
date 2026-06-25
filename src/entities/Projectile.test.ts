import { describe, expect, it } from 'vitest';
import { Projectile } from './Projectile';
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
  range: 3,
  damage: 8,
  fireRate: 1,
  projectileType: 'projectile',
  damageType: 'physical',
  targetFlags: ['ground'],
  color: '#fff',
  upgrades: [],
};

describe('Projectile', () => {
  it('reports a hit and snaps to the target position when it reaches the target', () => {
    const enemy = new Enemy(enemyConfig, [{ x: 1, y: 0 }, { x: 2, y: 0 }]);
    const tower = new Tower(0, 0, towerConfig);
    const projectile = new Projectile(0.5, 0.5, enemy, 8, 'physical', 10, 'projectile', tower);

    const result = projectile.update(0.2);

    expect(result).toBe('hit');
    expect(projectile.active).toBe(false);
    expect(projectile.x).toBe(enemy.x);
    expect(projectile.y).toBe(enemy.y);
  });
});
