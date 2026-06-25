import { describe, expect, it } from 'vitest';
import { eventBus } from '../core/EventBus';
import { StateManager } from '../core/StateManager';
import { TOWER_CONFIGS } from '../config/towers';
import { LEVEL_1_1_GRID, convertGrid } from '../config/waves';
import { EnemyManager } from '../systems/EnemyManager';
import { EconomyManager } from '../systems/EconomyManager';
import { Grid } from '../systems/Grid';
import { Pathfinder } from '../systems/Pathfinder';
import { TowerManager } from '../systems/TowerManager';
import { WaveManager } from '../systems/WaveManager';
import { Tower } from '../entities/Tower';
import { UIManager } from './UIManager';

function makeUi(): {
  economy: EconomyManager;
  state: StateManager;
  towerManager: TowerManager;
  ui: UIManager;
  waveManager: WaveManager;
} {
  const state = new StateManager();
  state.setPhase('build');

  const grid = new Grid();
  grid.load(convertGrid(LEVEL_1_1_GRID));
  const pathfinder = new Pathfinder(grid);
  const economy = new EconomyManager();
  economy.reset(500);
  const towerManager = new TowerManager(grid, pathfinder, economy);
  const enemyManager = new EnemyManager(pathfinder, grid);
  const waveManager = new WaveManager(enemyManager, economy);
  const ui = new UIManager(state, economy, towerManager, waveManager);

  return { economy, state, towerManager, ui, waveManager };
}

describe('UIManager interactions', () => {
  it('selects a tower card and consumes empty bottom-panel clicks', () => {
    const { state, ui } = makeUi();
    const unsubscribe = eventBus.on('ui:selectTower', ({ towerId }: { towerId: string }) => {
      const current = state.getState().selectedTowerId;
      state.selectTower(current === towerId ? undefined : towerId);
    });

    expect(ui.handleClick(20, 480)).toBe(true);
    expect(state.getState().selectedTowerId).toBe('archer');

    expect(ui.handleClick(930, 530)).toBe(true);
    expect(state.getState().selectedTowerId).toBe('archer');

    unsubscribe();
  });

  it('keeps the selected tower when placement fails', () => {
    const { state, towerManager } = makeUi();
    state.selectTower('archer');

    expect(towerManager.placeTower(0, 0, 'archer')).toBe(false);
    expect(state.getState().selectedTowerId).toBe('archer');
  });

  it('emits speed changes from the HUD speed controls', () => {
    const { ui } = makeUi();
    let scale = 1;
    const unsubscribe = eventBus.on('ui:setSpeed', (event: { scale: number }) => {
      scale = event.scale;
    });

    expect(ui.handleClick(436, 20)).toBe(true);
    expect(scale).toBe(2);

    unsubscribe();
  });

  it('keeps tower panel clicks in UI space and cycles targeting priority', () => {
    const { state, ui } = makeUi();
    state.selectTower('archer');
    const tower = new Tower(4, 4, TOWER_CONFIGS.archer);

    ui.selectExistingTower(tower);

    expect(state.getState().selectedTowerId).toBeUndefined();
    expect(ui.isPointInUI(740, 205)).toBe(true);
    expect(tower.targetPriority).toBe('first');

    expect(ui.handleClick(740, 205)).toBe(true);
    expect(tower.targetPriority).toBe('last');
  });

  it('upgrades and sells the selected tower from the tower panel', () => {
    const { economy, towerManager, ui } = makeUi();

    expect(towerManager.placeTower(6, 2, 'archer')).toBe(true);
    const tower = towerManager.getTowerAt(6, 2);
    expect(tower).toBeTruthy();
    ui.selectExistingTower(tower!);

    expect(ui.handleClick(700, 175)).toBe(true);
    expect(tower!.level).toBe(2);
    expect(economy.getGold()).toBe(300);

    expect(ui.handleClick(820, 175)).toBe(true);
    expect(towerManager.getTowerAt(6, 2)).toBeUndefined();
    expect(towerManager.getTowers()).toHaveLength(0);
    expect(economy.getGold()).toBeGreaterThan(300);
  });
});
