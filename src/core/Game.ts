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
import { SettingsManager } from '../systems/SettingsManager';
import { ProjectileManager } from '../systems/ProjectileManager';
import { EffectManager } from '../systems/EffectManager';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { UIManager } from '../ui/UIManager';
import { MenuManager } from '../ui/MenuManager';
import { LEVEL_CONFIGS } from '../config/levels';
import { getUnlockedAchievementIds } from '../config/achievements';
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
  private projectileManager: ProjectileManager;
  private effectManager: EffectManager;
  private settingsManager: SettingsManager;

  private lastTime = 0;
  private currentLevelId = '1-1';
  private isEndless = false;
  private totalKills = 0;
  private bossKills = 0;
  private maxPathLength = 0;
  private showPathPreview = true;
  private particleEffects = true;
  private placementPreviewKey = '';
  private placementPreviewCanPlace = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new CanvasRenderer(canvas);
    this.state = new StateManager();
    new InputManager(canvas);
    this.grid = new Grid();
    this.pathfinder = new Pathfinder(this.grid);
    this.economy = new EconomyManager();
    this.enemyManager = new EnemyManager(this.pathfinder, this.grid);
    this.towerManager = new TowerManager(this.grid, this.pathfinder, this.economy);
    this.waveManager = new WaveManager(this.enemyManager, this.economy);
    this.uiManager = new UIManager(this.state, this.economy, this.towerManager, this.waveManager);
    this.menuManager = new MenuManager();
    this.audioManager = new AudioManager();
    this.projectileManager = new ProjectileManager();
    this.effectManager = new EffectManager();
    this.settingsManager = new SettingsManager(saveManager.getData());

    this.bindEvents();
  }

  public init(): void {
    this.applySettings();
    this.audioManager.init();
    this.audioManager.startMusic();
    this.menuManager.setSaveData(saveManager.getData());
    this.menuManager.showScreen('main-menu');
    this.menuManager.setLevelSelectCallback((levelId) => {
      this.startLevel(levelId);
    });
    this.menuManager.setEndlessStartCallback(() => {
      this.startEndless();
    });
    requestAnimationFrame((t) => this.loop(t));
  }

  public startLevel(levelId: string): void {
    this.isEndless = false;
    this.currentLevelId = levelId;
    this.loadLevel(levelId);
    this.totalKills = 0;
    this.bossKills = 0;
    this.maxPathLength = 0;
    this.state.setPhase('build');
    this.menuManager.hideAll();
  }

  public startEndless(): void {
    this.isEndless = true;
    this.currentLevelId = 'endless';
    this.loadLevel('1-1');
    this.waveManager.startEndless();
    this.totalKills = 0;
    this.bossKills = 0;
    this.maxPathLength = 0;
    this.state.setPhase('build');
    this.state.setTotalWaves(0);
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
    this.projectileManager.clear();
    this.effectManager.clear();
    this.state.setLives(config.lives);
    this.state.setWave(0);
    this.state.setTotalWaves(config.waves.length);
    this.state.selectTower(undefined);
    this.state.setPaused(false);
    this.state.setTimeScale(1);
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

    eventBus.on('input:hover', (pos: Vec2 & { pixelX?: number; pixelY?: number }) => {
      if (pos.pixelX !== undefined && pos.pixelY !== undefined && this.uiManager.isPointInUI(pos.pixelX, pos.pixelY)) {
        this.state.setHoveredCell(undefined);
        return;
      }
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

    eventBus.on('tower:placementFailed', () => {
      this.audioManager.playSfx('error');
    });

    eventBus.on('tower:fire', ({ tower, target, damage, damageType }: {
      tower: import('../entities/Tower').Tower;
      target: Enemy;
      damage: number;
      damageType: string;
    }) => {
      const pType = tower.config.projectileType;
      if (pType === 'hitscan') {
        target.takeDamage(damage, damageType as any);
        tower.applyOnHitEffect(target);
        if (this.particleEffects) {
          eventBus.emit('effect:beam', {
            x1: tower.x + 0.5,
            y1: tower.y + 0.5,
            x2: target.x,
            y2: target.y,
            color: tower.config.color,
          });
        }
      } else {
        this.projectileManager.spawn(tower, target, damage, damageType, pType);
      }

      if (tower.config.id === 'cannon') {
        this.audioManager.playSfx('cannon');
      } else {
        this.audioManager.playSfx('shoot');
      }
    });

    eventBus.on('enemy:damaged', () => {
      this.audioManager.playSfx('hit');
    });

    eventBus.on('enemy:killed', ({ enemy, reward }: { enemy: Enemy; reward: number }) => {
      this.economy.addKillReward(reward);
      this.totalKills++;
      if (enemy.config.bossSkill) this.bossKills++;
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
      if (this.waveManager.isEndless()) {
        this.state.setPhase('build');
      } else if (current >= this.waveManager.getTotalWaves()) {
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

    eventBus.on('ui:setSpeed', ({ scale }: { scale: number }) => {
      this.state.setTimeScale(Math.max(1, Math.min(3, scale)));
    });

    // Settings events
    eventBus.on('settings:masterVolume', (v: number) => this.settingsManager.setMasterVolume(v));
    eventBus.on('settings:musicVolume', (v: number) => this.settingsManager.setMusicVolume(v));
    eventBus.on('settings:sfxVolume', (v: number) => this.settingsManager.setSfxVolume(v));
    eventBus.on('settings:quality', (q: any) => this.settingsManager.setQuality(q));
    eventBus.on('settings:pathPreview', (show: boolean) => this.settingsManager.setShowPathPreview(show));
    eventBus.on('settings:particles', (enabled: boolean) => this.settingsManager.setParticleEffects(enabled));
    eventBus.on('settings:reset', () => this.settingsManager.reset());
    eventBus.on('settings:changed', () => this.applySettings());
    eventBus.on('save:request', () => saveManager.saveCurrent());

    // Menu events
    eventBus.on('boss:summon', ({ count }: { count: number }) => {
      for (let i = 0; i < count; i++) {
        this.enemyManager.spawnEnemy('slime');
      }
    });

    eventBus.on('boss:burningGround', ({ x, y }: { x: number; y: number }) => {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          this.grid.applyTemporaryTerrain(x + dx, y + dy, 'damage', 5);
        }
      }
    });

    eventBus.on('boss:spawnFlyers', ({ count }: { count: number }) => {
      for (let i = 0; i < count; i++) {
        this.enemyManager.spawnEnemy('flyer');
      }
    });

    eventBus.on('enemy:bomberExploded', ({ x, y, radius, towerStunDuration }: {
      x: number;
      y: number;
      radius: number;
      towerStunDuration: number;
    }) => {
      this.towerManager.stunTowersInRange(x, y, radius, towerStunDuration);
      eventBus.emit('effect:explosion', { x, y, color: '#fdd835', size: radius });
      this.audioManager.playSfx('cannon');
    });

    // Menu events
    eventBus.on('menu:resume', () => {
      this.state.setPaused(false);
    });

    eventBus.on('menu:restart', () => {
      if (this.isEndless) {
        this.startEndless();
      } else {
        this.startLevel(this.currentLevelId);
      }
    });

    eventBus.on('menu:nextLevel', ({ levelId }: { levelId: string }) => {
      this.startLevel(levelId);
    });

    eventBus.on('menu:quit', () => {
      this.showMainMenu();
    });

    eventBus.on('menu:levels', () => {
      this.showMainMenu();
    });
  }

  private applySettings(): void {
    const settings = this.settingsManager.getSettings();
    this.audioManager.setMasterVolume(settings.masterVolume);
    this.audioManager.setMusicVolume(settings.musicVolume);
    this.audioManager.setSfxVolume(settings.sfxVolume);
    this.showPathPreview = settings.showPathPreview;
    this.particleEffects = settings.particleEffects;
  }

  private showMainMenu(): void {
    this.state.setPhase('menu');
    this.menuManager.setSaveData(saveManager.getData());
    this.menuManager.showScreen('main-menu');
  }

  private endGame(victory: boolean): void {
    const currentPhase = this.state.getState().phase;
    if (currentPhase === 'victory' || currentPhase === 'defeat') return;

    const phase = victory ? 'victory' : 'defeat';
    this.state.setPhase(phase);
    this.audioManager.playSfx(victory ? 'victory' : 'defeat');

    if (this.isEndless) {
      const wave = this.waveManager.getCurrentWave();
      saveManager.updateStats({ highestWave: wave, totalKills: this.totalKills, totalBossKills: this.bossKills });
      this.checkAchievements(false, 0);
      this.menuManager.showGameOver(false, { wave, kills: this.totalKills });
      this.menuManager.setSaveData(saveManager.getData());
      return;
    }

    const config = LEVEL_CONFIGS[this.currentLevelId];
    const lives = this.state.getState().lives;
    const maxLives = config?.lives ?? lives;
    const lifeRatio = lives / maxLives;
    const stars = victory ? (lifeRatio >= 0.8 ? 3 : lifeRatio >= 0.4 ? 2 : 1) : 0;

    saveManager.updateStats({ totalKills: this.totalKills, totalBossKills: this.bossKills });

    if (victory) {
      saveManager.completeLevel(this.currentLevelId, stars);
    }
    this.checkAchievements(victory, stars);
    this.menuManager.setSaveData(saveManager.getData());

    this.menuManager.showGameOver(victory, {
      wave: this.waveManager.getCurrentWave(),
      kills: this.totalKills,
      nextLevelId: victory ? this.getNextLevelId(this.currentLevelId) : undefined,
    });
    eventBus.emit('game:complete', {
      levelId: this.currentLevelId,
      victory,
      wave: this.waveManager.getCurrentWave(),
      lives,
      stars,
    });
  }

  private updateMaxPathLength(): void {
    const paths = this.pathfinder.getAllPaths();
    for (const path of paths.values()) {
      if (path.length > this.maxPathLength) {
        this.maxPathLength = path.length;
      }
    }
  }

  private getNextLevelId(levelId: string): string | undefined {
    const levelIds = Object.keys(LEVEL_CONFIGS);
    const index = levelIds.indexOf(levelId);
    if (index < 0 || index >= levelIds.length - 1) return undefined;
    return levelIds[index + 1];
  }

  private checkAchievements(victory: boolean, stars: number): void {
    const data = saveManager.getData();
    const achievementIds = getUnlockedAchievementIds({
      victory,
      stars,
      levelId: this.isEndless ? undefined : this.currentLevelId,
      totalKills: data.stats.totalKills,
      totalBossKills: data.stats.totalBossKills,
      highestWave: data.stats.highestWave,
      singleRunGold: this.economy.getTotalEarned(),
      maxPathLength: this.maxPathLength,
      campaign: data.progress.campaign,
    });

    for (const achievementId of achievementIds) {
      saveManager.unlockAchievement(achievementId);
    }
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
      if (this.towerManager.placeTower(x, y, selectedTowerId)) {
        this.updateMaxPathLength();
      }
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
    } else if (key === '4') {
      this.state.selectTower('lightning');
    } else if (key === '5') {
      this.state.selectTower('poison');
    } else if (key === '6') {
      this.state.selectTower('sniper');
    } else if (key === '7') {
      this.state.selectTower('support');
    } else if (key === '8') {
      this.state.selectTower('barracks');
    } else if (key === 'q' || key === 'Q') {
      this.state.setTimeScale(1);
    } else if (key === 'w' || key === 'W') {
      this.state.setTimeScale(2);
    } else if (key === 'e' || key === 'E') {
      this.state.setTimeScale(3);
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
      this.grid.update(scaledDt);
    }

    this.towerManager.update(scaledDt, this.enemyManager.getEnemies());
    this.projectileManager.update(scaledDt, this.enemyManager.getEnemies());
    this.effectManager.update(scaledDt);
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
    this.renderer.drawTemporaryEffects(this.grid.getTemporaryEffects());
    if (this.showPathPreview) {
      this.renderer.drawPaths(this.pathfinder.getAllPaths());
      if (this.nextWaveHasFlyingEnemies()) {
        this.renderer.drawFlightPaths(this.grid.getSpawns(), this.grid.getCores());
      }
    }
    const state = this.state.getState();
    const selectedTowerConfig = state.selectedTowerId && (phase === 'build' || phase === 'wave_clear')
      ? this.towerManager.getTowerConfig(state.selectedTowerId)
      : undefined;
    const canPreviewPlace = selectedTowerConfig
      ? this.canPreviewPlace(state.hoveredCell, selectedTowerConfig.id)
      : false;
    this.renderer.drawHover(state.hoveredCell, selectedTowerConfig, canPreviewPlace);
    this.towerManager.getTowers().forEach(t => this.renderer.drawTower(t));
    this.enemyManager.getEnemies().forEach(e => this.renderer.drawEnemy(e));
    this.renderer.drawProjectiles(this.projectileManager.getProjectiles());
    if (this.particleEffects) {
      this.renderer.drawEffects(
        this.effectManager.getParticles(),
        this.effectManager.getHitEffects(),
        this.effectManager.getBeamEffects(),
      );
    }
    this.uiManager.render(this.renderer);
  }

  public getMenuManager(): MenuManager { return this.menuManager; }
  public getState(): StateManager { return this.state; }
  public getEconomy(): EconomyManager { return this.economy; }
  public getTowerManager(): TowerManager { return this.towerManager; }
  public getWaveManager(): WaveManager { return this.waveManager; }
  public getGrid(): Grid { return this.grid; }

  private canPreviewPlace(cell: Vec2 | undefined, towerId: string): boolean {
    if (!cell) return false;

    const key = `${towerId}:${cell.x},${cell.y}:${this.towerManager.getTowers().length}`;
    if (this.placementPreviewKey === key) return this.placementPreviewCanPlace;

    this.placementPreviewKey = key;
    this.placementPreviewCanPlace = this.grid.isBuildable(cell.x, cell.y)
      && this.pathfinder.validatePlacement(cell.x, cell.y);
    return this.placementPreviewCanPlace;
  }

  private nextWaveHasFlyingEnemies(): boolean {
    const wave = this.waveManager.getNextWavePreview();
    if (!wave) return false;
    return wave.groups.some(group => this.enemyManager.getConfig(group.type)?.flying);
  }
}
