import { eventBus } from './EventBus';
import { StateManager } from './StateManager';
import { InputManager } from './InputManager';
import { Grid } from '../systems/Grid';
import { Pathfinder } from '../systems/Pathfinder';
import { TowerManager } from '../systems/TowerManager';
import { EnemyManager } from '../systems/EnemyManager';
import { WaveManager } from '../systems/WaveManager';
import { EconomyManager } from '../systems/EconomyManager';
import { saveManager } from '../systems/SaveManager';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { UIManager } from '../ui/UIManager';
import { MenuManager } from '../ui/MenuManager';
import { LEVEL_CONFIGS } from '../config/levels';
import { AudioManager } from '../audio/AudioManager';
import { MAX_DELTA_TIME } from '../config/gameConfig';
import { Enemy } from '../entities/Enemy';
import type { Vec2 } from '../types';

export class Game {
  private renderer: CanvasRenderer;
  private state: StateManager;
  private grid: Grid;
  private pathfinder: Pathfinder;
  private economy: EconomyManager;
  private towerManager: TowerManager;
  private enemyManager: EnemyManager;
  private waveManager: WaveManager;
  private uiManager: UIManager;
  private menuManager: MenuManager;
  private audioManager: AudioManager;

  private lastTime = 0;
  private currentLevelId = '1-1';
  private totalKills = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new CanvasRenderer(canvas);
    this.state = new StateManager();
    new InputManager(canvas);
    this.grid = new Grid();
    this.pathfinder = new Pathfinder(this.grid);
    this.economy = new EconomyManager();
    this.enemyManager = new EnemyManager(this.pathfinder);
    this.towerManager = new TowerManager(this.grid, this.pathfinder, this.economy);
    this.waveManager = new WaveManager(this.enemyManager, this.economy);
    this.uiManager = new UIManager(this.state, this.economy, this.towerManager, this.waveManager);
    this.menuManager = new MenuManager();
    this.audioManager = new AudioManager();

    this.bindEvents();
  }

  public init(): void {
    this.audioManager.init();
    this.audioManager.startMusic();
    this.menuManager.setSaveData(saveManager.getData());
    this.menuManager.showScreen('main-menu');
    this.menuManager.setLevelSelectCallback((levelId) => {
      this.startLevel(levelId);
    });
    requestAnimationFrame((t) => this.loop(t));
  }

  public startLevel(levelId: string): void {
    this.currentLevelId = levelId;
    this.loadLevel(levelId);
    this.totalKills = 0;
    this.state.setPhase('build');
    this.menuManager.hideAll();
  }

  public loadLevel(levelId: string): void {
    const config = LEVEL_CONFIGS[levelId];
    if (!config) {
      console.error(`Level ${levelId} not found`);
      return;
    }

    this.grid.load(config.grid);
    this.pathfinder.invalidate();
    this.economy.reset(config.startingGold);
    this.waveManager.load(config.waves);
    this.towerManager.clear();
    this.enemyManager.clear();
    this.state.setLives(config.lives);
    this.state.setWave(0);
    this.state.setTotalWaves(config.waves.length);
    this.state.selectTower(undefined);
    this.state.setPaused(false);
  }

  private bindEvents(): void {
    eventBus.on('input:click', (pos: Vec2 & { pixelX: number; pixelY: number; button: number }) => {
      const phase = this.state.getState().phase;
      if (phase === 'menu') return;

      const handled = this.uiManager.handleClick(pos.pixelX, pos.pixelY);
      if (!handled) {
        this.handleClick(pos.x, pos.y, pos.button);
      }
    });

    eventBus.on('input:hover', (pos: Vec2) => {
      this.state.setHoveredCell(pos);
    });

    eventBus.on('input:key', ({ key }: { key: string }) => {
      this.handleKey(key);
    });

    eventBus.on('tower:placed', () => {
      this.audioManager.playSfx('build');
    });

    eventBus.on('tower:sold', () => {
      this.audioManager.playSfx('build');
    });

    eventBus.on('tower:fire', ({ tower, target, damage, damageType }: {
      tower: import('../entities/Tower').Tower;
      target: Enemy;
      damage: number;
      damageType: string;
    }) => {
      target.takeDamage(damage, damageType as any);
      if (tower.config.id === 'cannon') {
        this.audioManager.playSfx('cannon');
      } else {
        this.audioManager.playSfx('shoot');
      }
    });

    eventBus.on('enemy:damaged', () => {
      this.audioManager.playSfx('hit');
    });

    eventBus.on('enemy:killed', ({ reward }: { reward: number }) => {
      this.economy.addKillReward(reward);
      this.totalKills++;
      this.audioManager.playSfx('enemyDeath');
    });

    eventBus.on('enemy:reachedCore', () => {
      const newLives = this.state.getState().lives - 1;
      this.state.setLives(newLives);
      if (newLives <= 0) {
        this.endGame(false);
      }
    });

    eventBus.on('wave:complete', ({ current }: { current: number }) => {
      this.state.setWave(current);
      if (current >= this.waveManager.getTotalWaves()) {
        this.endGame(true);
      } else {
        this.state.setPhase('build');
      }
    });

    eventBus.on('ui:startWave', () => {
      if (this.waveManager.canStartWave()) {
        this.state.setPhase('combat');
        this.waveManager.startWave();
        this.audioManager.playSfx('waveStart');
      }
    });

    eventBus.on('ui:selectTower', ({ towerId }: { towerId: string }) => {
      const current = this.state.getState().selectedTowerId;
      this.state.selectTower(current === towerId ? undefined : towerId);
    });

    // Menu events
    eventBus.on('menu:resume', () => {
      this.state.setPaused(false);
    });

    eventBus.on('menu:restart', () => {
      this.startLevel(this.currentLevelId);
    });

    eventBus.on('menu:quit', () => {
      this.menuManager.showScreen('main-menu');
      this.state.setPhase('menu');
    });

    eventBus.on('menu:levels', () => {
      this.state.setPhase('menu');
    });
  }

  private endGame(victory: boolean): void {
    const phase = victory ? 'victory' : 'defeat';
    this.state.setPhase(phase);
    this.audioManager.playSfx(victory ? 'victory' : 'defeat');

    const config = LEVEL_CONFIGS[this.currentLevelId];
    const lives = this.state.getState().lives;
    const maxLives = config?.lives ?? lives;
    const lifeRatio = lives / maxLives;
    const stars = victory ? (lifeRatio >= 0.8 ? 3 : lifeRatio >= 0.4 ? 2 : 1) : 0;

    if (victory) {
      saveManager.completeLevel(this.currentLevelId, stars);
      saveManager.updateStats({ totalKills: this.totalKills });
      this.menuManager.setSaveData(saveManager.getData());
    }

    this.menuManager.showGameOver(victory, {
      wave: this.waveManager.getCurrentWave(),
      kills: this.totalKills,
    });
    eventBus.emit('game:complete', {
      levelId: this.currentLevelId,
      victory,
      wave: this.waveManager.getCurrentWave(),
      lives,
      stars,
    });
  }

  private handleClick(x: number, y: number, button: number): void {
    const phase = this.state.getState().phase;
    if (phase === 'defeat' || phase === 'victory' || phase === 'menu') return;

    if (button === 2) {
      this.state.selectTower(undefined);
      return;
    }

    const selectedTowerId = this.state.getState().selectedTowerId;
    const existingTower = this.towerManager.getTowerAt(x, y);

    if (existingTower) {
      this.uiManager.selectExistingTower(existingTower);
      return;
    }

    if (selectedTowerId && (phase === 'build' || phase === 'wave_clear')) {
      this.towerManager.placeTower(x, y, selectedTowerId);
    }
  }

  private handleKey(key: string): void {
    const phase = this.state.getState().phase;

    if (key === ' ') {
      if (phase === 'build' || phase === 'wave_clear') {
        eventBus.emit('ui:startWave');
      } else if (phase === 'combat') {
        this.state.togglePause();
      }
    } else if (key === 'Escape') {
      if (phase === 'combat' || phase === 'build' || phase === 'wave_clear') {
        this.state.setPaused(true);
        this.menuManager.showPauseMenu();
      } else if (phase === 'victory' || phase === 'defeat') {
        // 已被菜单覆盖
      }
    } else if (key === '1') {
      this.state.selectTower('archer');
    } else if (key === '2') {
      this.state.selectTower('cannon');
    } else if (key === '3') {
      this.state.selectTower('ice');
    }
  }

  private loop(timestamp: number): void {
    const dt = Math.min((timestamp - this.lastTime) / 1000, MAX_DELTA_TIME);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number): void {
    if (this.state.isPaused) return;

    const scaledDt = dt * this.state.timeScale;
    const phase = this.state.getState().phase;

    if (phase === 'combat') {
      this.waveManager.update(scaledDt);
      this.enemyManager.update(scaledDt);
    }

    this.towerManager.update(scaledDt, this.enemyManager.getEnemies());
    this.uiManager.update(scaledDt);
  }

  private render(): void {
    const phase = this.state.getState().phase;
    if (phase === 'menu') {
      this.renderer.clear();
      return;
    }

    this.renderer.clear();
    this.renderer.drawGrid(this.grid);
    this.renderer.drawPaths(this.pathfinder.getAllPaths());
    this.renderer.drawHover(this.state.getState().hoveredCell, this.state.getState().selectedTowerId);
    this.towerManager.getTowers().forEach(t => this.renderer.drawTower(t));
    this.enemyManager.getEnemies().forEach(e => this.renderer.drawEnemy(e));
    this.uiManager.render(this.renderer);
  }

  public getMenuManager(): MenuManager { return this.menuManager; }
  public getState(): StateManager { return this.state; }
  public getEconomy(): EconomyManager { return this.economy; }
  public getTowerManager(): TowerManager { return this.towerManager; }
  public getWaveManager(): WaveManager { return this.waveManager; }
  public getGrid(): Grid { return this.grid; }
}
