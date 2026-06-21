# PathForge TD 技术开发文档

> **文档类型**：技术开发文档 / Technical Design Document  
> **版本**：v1.0  
> **日期**：2026-06-21  
> **关联文档**：[PathForge TD 游戏设计文档](./GDD-PathForgeTD.md)

---

## 1. 概述

本文档基于《PathForge TD 游戏设计文档》（GDD），将设计意图转化为可执行的技术方案。文档面向前端/游戏客户端开发者，涵盖项目结构、核心系统架构、关键算法、数据配置、编码规范与部署流程。

### 1.1 技术选型

| 层级 | 选型 | 说明 |
|------|------|------|
| 语言 | TypeScript | 类型安全，便于协作与维护 |
| 渲染 | HTML5 Canvas 2D Context | 满足像素风需求，兼容性好 |
| 构建工具 | Vite | 快速 HMR、TypeScript 原生支持、打包优化 |
| 状态管理 | 自定义轻量级 Store | 避免引入重型框架，保持包体小 |
| 资源加载 | 自定义 AssetLoader | 精灵图、音频、JSON 配置按需加载 |
| 音频 | Web Audio API / Howler.js | 低延迟音效与背景音乐循环 |
| 持久化 | localStorage | 本地存档、导入/导出 |
| 部署 | 静态托管 | GitHub Pages / Vercel / Netlify |

### 1.2 目标平台

- 桌面浏览器：Chrome、Firefox、Safari、Edge（最近 2 个版本）。
- 平板浏览器：触屏兼容，但优先鼠标交互。
- 最低分辨率：1280×720。
- 目标分辨率：1920×1080，逻辑画布 960×540，2× 像素缩放。

---

## 2. 项目结构

```
towerDefence/
├── public/
│   ├── assets/
│   │   ├── sprites/           # 精灵图与瓦片
│   │   ├── audio/             # 音效与音乐
│   │   └── fonts/             # 像素字体
│   └── index.html
├── src/
│   ├── main.ts                # 入口
│   ├── config/                # 游戏配置
│   │   ├── towers.ts
│   │   ├── enemies.ts
│   │   ├── waves.ts
│   │   ├── levels.ts
│   │   └── gameConfig.ts
│   ├── core/                  # 核心引擎
│   │   ├── Game.ts
│   │   ├── GameLoop.ts
│   │   ├── StateManager.ts
│   │   ├── InputManager.ts
│   │   ├── AssetLoader.ts
│   │   └── EventBus.ts
│   ├── systems/               # 游戏系统
│   │   ├── Grid.ts
│   │   ├── Pathfinder.ts
│   │   ├── TowerManager.ts
│   │   ├── EnemyManager.ts
│   │   ├── WaveManager.ts
│   │   ├── ProjectileManager.ts
│   │   ├── EffectManager.ts
│   │   ├── EconomyManager.ts
│   │   └── SaveManager.ts
│   ├── entities/              # 实体类
│   │   ├── Tower.ts
│   │   ├── Enemy.ts
│   │   ├── Projectile.ts
│   │   └── Effect.ts
│   ├── ui/                    # UI 组件
│   │   ├── UIManager.ts
│   │   ├── Hud.ts
│   │   ├── BuildMenu.ts
│   │   ├── TowerPanel.ts
│   │   └── Modal.ts
│   ├── audio/                 # 音频管理
│   │   └── AudioManager.ts
│   ├── renderer/              # 渲染器
│   │   ├── CanvasRenderer.ts
│   │   └── Camera.ts
│   ├── types/                 # 类型定义
│   │   └── index.ts
│   └── utils/                 # 工具函数
│       ├── math.ts
│       ├── grid.ts
│       └── helpers.ts
├── tests/                     # 测试文件
├── docs/                      # 文档
│   ├── GDD-PathForgeTD.md
│   └── Technical-Design.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 3. 核心架构

### 3.1 模块依赖关系

```
Game
├── Renderer
├── StateManager <── SaveManager
├── InputManager
├── AudioManager
├── UIManager
├── EconomyManager
├── WaveManager
│   └── EnemyManager
├── TowerManager
├── ProjectileManager
├── EffectManager
├── Grid
└── Pathfinder
```

### 3.2 Game 类职责

`Game` 是顶层协调器，负责：

- 初始化所有子系统。
- 管理游戏状态机（菜单、战斗中、暂停、结束）。
- 协调各系统之间的交互。
- 处理关卡加载与卸载。

```typescript
export class Game {
  private renderer: CanvasRenderer;
  private state: StateManager;
  private input: InputManager;
  private audio: AudioManager;
  private ui: UIManager;
  private grid: Grid;
  private pathfinder: Pathfinder;
  private economy: EconomyManager;
  private waveManager: WaveManager;
  private towerManager: TowerManager;
  private enemyManager: EnemyManager;
  private projectileManager: ProjectileManager;
  private effectManager: EffectManager;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new CanvasRenderer(canvas);
    this.state = new StateManager();
    this.input = new InputManager(canvas);
    this.audio = new AudioManager();
    this.grid = new Grid();
    this.pathfinder = new Pathfinder(this.grid);
    this.economy = new EconomyManager();
    this.enemyManager = new EnemyManager(this.pathfinder);
    this.towerManager = new TowerManager(this.grid, this.pathfinder);
    this.projectileManager = new ProjectileManager();
    this.effectManager = new EffectManager();
    this.waveManager = new WaveManager(this.enemyManager, this.economy);
    this.ui = new UIManager(this);
  }

  public loadLevel(levelId: string): void {
    const config = LEVEL_CONFIGS[levelId];
    this.grid.load(config.grid);
    this.economy.reset(config.startingGold);
    this.waveManager.load(config.waves);
    this.towerManager.clear();
    this.enemyManager.clear();
    this.state.set('build');
  }

  public update(dt: number): void {
    if (this.state.isPaused) return;

    const scaledDt = dt * this.state.timeScale;
    this.waveManager.update(scaledDt);
    this.enemyManager.update(scaledDt);
    this.towerManager.update(scaledDt, this.enemyManager.getEnemies());
    this.projectileManager.update(scaledDt);
    this.effectManager.update(scaledDt);
    this.ui.update(scaledDt);
  }

  public render(): void {
    this.renderer.clear();
    this.renderer.drawGrid(this.grid);
    this.renderer.drawPaths(this.pathfinder);
    this.towerManager.render(this.renderer);
    this.enemyManager.render(this.renderer);
    this.projectileManager.render(this.renderer);
    this.effectManager.render(this.renderer);
    this.ui.render(this.renderer);
  }
}
```

### 3.3 游戏循环

使用 `requestAnimationFrame` 驱动，逻辑更新与渲染解耦。

```typescript
export class GameLoop {
  private lastTime = 0;
  private readonly game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public start(): void {
    requestAnimationFrame((t) => this.loop(t));
  }

  private loop(timestamp: number): void {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1); // 限制最大 dt
    this.lastTime = timestamp;

    this.game.update(dt);
    this.game.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}
```

> 限制 `dt` 最大值为 0.1 秒，防止切回标签页时逻辑异常。

---

## 4. 类型定义

集中定义核心类型，便于系统间协作。

```typescript
// src/types/index.ts

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
  | 'spawn'
  | 'core';

export interface TowerConfig {
  id: string;
  name: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  projectileType: ProjectileType;
  damageType: DamageType;
  targetFlags: TargetFlag[];
  upgrades: UpgradeConfig[];
  sprite: string;
}

export interface UpgradeConfig {
  level: number;
  cost: number;
  damageMultiplier: number;
  rangeBonus: number;
  fireRateMultiplier: number;
  special?: string;
}

export interface EnemyConfig {
  id: string;
  name: string;
  hp: number;
  speed: number;
  armor: number;
  magicResist: number;
  reward: number;
  threat: number;
  flying: boolean;
  sprite: string;
}

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
```

---

## 5. 网格与寻路系统

### 5.1 Grid 类

`Grid` 管理地图瓦片状态，是寻路与建造的基础。

```typescript
export class Grid {
  private cells: GridCell[][] = [];
  private spawns: Vec2[] = [];
  private cores: Vec2[] = [];

  public load(cellTypes: CellType[][]): void {
    this.cells = cellTypes.map((row, y) =>
      row.map((type, x) => ({ x, y, type }))
    );
    this.spawns = this.findCellsOfType('spawn');
    this.cores = this.findCellsOfType('core');
  }

  public getCell(x: number, y: number): GridCell | undefined {
    return this.cells[y]?.[x];
  }

  public setTower(x: number, y: number, towerId: string): void {
    const cell = this.getCell(x, y);
    if (cell && cell.type === 'buildable') {
      cell.towerId = towerId;
    }
  }

  public removeTower(x: number, y: number): void {
    const cell = this.getCell(x, y);
    if (cell) delete cell.towerId;
  }

  public isWalkable(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    if (!cell) return false;
    if (cell.type === 'water' || cell.type === 'obstacle') return false;
    if (cell.type === 'buildable' && cell.towerId) return false;
    return true;
  }

  public isBuildable(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    return !!cell && cell.type === 'buildable' && !cell.towerId;
  }

  public getSpawns(): Vec2[] { return this.spawns; }
  public getCores(): Vec2[] { return this.cores; }

  private findCellsOfType(type: CellType): Vec2[] {
    const result: Vec2[] = [];
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.type === type) result.push({ x: cell.x, y: cell.y });
      }
    }
    return result;
  }
}
```

### 5.2 Pathfinder 类

使用 A* 算法实现动态寻路。

```typescript
interface PathNode {
  x: number;
  y: number;
  g: number;
  f: number;
  parent?: PathNode;
}

export class Pathfinder {
  private cachedPaths: Map<string, Vec2[]> = new Map();

  constructor(private grid: Grid) {}

  public invalidate(): void {
    this.cachedPaths.clear();
  }

  public getPath(from: Vec2, to: Vec2): Vec2[] {
    const key = `${from.x},${from.y}-${to.x},${to.y}`;
    if (this.cachedPaths.has(key)) return this.cachedPaths.get(key)!;

    const path = this.aStar(from, to);
    this.cachedPaths.set(key, path);
    return path;
  }

  public validatePlacement(x: number, y: number): boolean {
    // 临时假设放置塔
    const cell = this.grid.getCell(x, y);
    if (!cell || cell.type !== 'buildable' || cell.towerId) return false;

    cell.towerId = 'temp';
    let valid = true;

    for (const spawn of this.grid.getSpawns()) {
      let hasPath = false;
      for (const core of this.grid.getCores()) {
        const path = this.aStar(spawn, core);
        if (path.length > 0) {
          hasPath = true;
          break;
        }
      }
      if (!hasPath) {
        valid = false;
        break;
      }
    }

    delete cell.towerId;
    this.invalidate();
    return valid;
  }

  private aStar(from: Vec2, to: Vec2): Vec2[] {
    const openSet: PathNode[] = [];
    const closedSet = new Set<string>();

    const startNode: PathNode = { x: from.x, y: from.y, g: 0, f: this.heuristic(from, to) };
    openSet.push(startNode);

    while (openSet.length > 0) {
      // 使用最小堆优化（生产环境建议实现二叉堆）
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const key = `${current.x},${current.y}`;

      if (current.x === to.x && current.y === to.y) {
        return this.reconstructPath(current);
      }

      if (closedSet.has(key)) continue;
      closedSet.add(key);

      for (const neighbor of this.getNeighbors(current)) {
        if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;
        if (!this.grid.isWalkable(neighbor.x, neighbor.y)) continue;

        const g = current.g + 1;
        const existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!existing || g < existing.g) {
          const node: PathNode = {
            x: neighbor.x,
            y: neighbor.y,
            g,
            f: g + this.heuristic(neighbor, to),
            parent: current,
          };
          if (existing) {
            Object.assign(existing, node);
          } else {
            openSet.push(node);
          }
        }
      }
    }

    return []; // 无路径
  }

  private heuristic(a: Vec2, b: Vec2): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private getNeighbors(node: PathNode): Vec2[] {
    return [
      { x: node.x + 1, y: node.y },
      { x: node.x - 1, y: node.y },
      { x: node.x, y: node.y + 1 },
      { x: node.x, y: node.y - 1 },
    ];
  }

  private reconstructPath(node: PathNode): Vec2[] {
    const path: Vec2[] = [];
    let current: PathNode | undefined = node;
    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path;
  }
}
```

### 5.3 性能优化建议

- **缓存路径**：塔状态未变化时直接使用缓存路径。
- **二叉堆**：生产环境将 openSet 替换为二叉堆，时间复杂度从 O(n²) 降至 O(n log n)。
- **增量更新**：仅对受影响的入口重新计算路径。
- **路径预览**：预览使用简化版寻路，放置成功后再完整验证。

---

## 6. 状态管理

### 6.1 StateManager

使用轻量级 observable store，避免引入 Redux/Vuex 等重型库。

```typescript
type GamePhase = 'menu' | 'build' | 'combat' | 'wave_clear' | 'victory' | 'defeat';

interface GameState {
  phase: GamePhase;
  lives: number;
  wave: number;
  totalWaves: number;
  timeScale: number;
  paused: boolean;
  selectedTowerId?: string;
  hoveredCell?: Vec2;
}

export class StateManager {
  private state: GameState = {
    phase: 'menu',
    lives: 20,
    wave: 0,
    totalWaves: 0,
    timeScale: 1,
    paused: false,
  };

  private listeners: Set<(state: GameState) => void> = new Set();

  public getState(): Readonly<GameState> {
    return this.state;
  }

  public setPhase(phase: GamePhase): void {
    this.state = { ...this.state, phase };
    this.notify();
  }

  public setPaused(paused: boolean): void {
    this.state = { ...this.state, paused };
    this.notify();
  }

  public setTimeScale(scale: number): void {
    this.state = { ...this.state, timeScale: scale };
    this.notify();
  }

  public setLives(lives: number): void {
    this.state = { ...this.state, lives };
    this.notify();
  }

  public setWave(wave: number): void {
    this.state = { ...this.state, wave };
    this.notify();
  }

  public selectTower(id?: string): void {
    this.state = { ...this.state, selectedTowerId: id };
    this.notify();
  }

  public subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public get isPaused(): boolean { return this.state.paused; }
  public get timeScale(): number { return this.state.timeScale; }
}
```

### 6.2 事件总线

用于系统间解耦通信。

```typescript
export class EventBus {
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  public on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  public emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) cb(...args);
    }
  }
}
```

常用事件：

| 事件 | 参数 | 说明 |
|------|------|------|
| `tower:placed` | `{ x, y, towerId }` | 塔被放置 |
| `tower:sold` | `{ x, y, refund }` | 塔被出售 |
| `enemy:reachedCore` | `enemy: Enemy` | 敌人到达核心 |
| `enemy:killed` | `{ enemy, reward }` | 敌人被击杀 |
| `wave:complete` | `{ wave, bonus }` | 波次完成 |
| `game:victory` | `levelId` | 关卡胜利 |
| `game:defeat` | `levelId` | 关卡失败 |

---

## 7. 实体系统

### 7.1 Tower 类

```typescript
export class Tower {
  public id: string;
  public x: number;
  public y: number;
  public config: TowerConfig;
  public level = 1;
  public branch?: string;
  public cooldown = 0;
  public totalInvested: number;

  constructor(x: number, y: number, config: TowerConfig) {
    this.id = `tower_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.x = x;
    this.y = y;
    this.config = config;
    this.totalInvested = config.cost;
  }

  public update(dt: number, enemies: Enemy[]): void {
    if (this.cooldown > 0) {
      this.cooldown -= dt;
      return;
    }

    const target = this.findTarget(enemies);
    if (target) {
      this.fire(target);
      this.cooldown = 1 / this.getFireRate();
    }
  }

  private findTarget(enemies: Enemy[]): Enemy | undefined {
    const inRange = enemies.filter(e => {
      const dist = Math.hypot(e.x - this.x, e.y - this.y);
      return dist <= this.getRange() && this.canTarget(e);
    });

    // 默认优先：First（距离终点最近）
    return inRange.sort((a, b) => a.pathProgress - b.pathProgress)[0];
  }

  private canTarget(enemy: Enemy): boolean {
    if (enemy.flying) return this.config.targetFlags.includes('flying');
    return this.config.targetFlags.includes('ground');
  }

  private fire(target: Enemy): void {
    EventBusInstance.emit('tower:fire', {
      tower: this,
      target,
      damage: this.getDamage(),
      damageType: this.config.damageType,
    });
  }

  public getDamage(): number {
    return this.config.damage * Math.pow(1.3, this.level - 1);
  }

  public getRange(): number {
    return this.config.range + (this.level - 1) * 0.5;
  }

  public getFireRate(): number {
    return this.config.fireRate * Math.pow(1.1, this.level - 1);
  }

  public upgrade(upgrade: UpgradeConfig): void {
    this.level = upgrade.level;
    this.totalInvested += upgrade.cost;
  }
}
```

### 7.2 Enemy 类

```typescript
export class Enemy {
  public x: number;
  public y: number;
  public config: EnemyConfig;
  public hp: number;
  public maxHp: number;
  public path: Vec2[] = [];
  public pathIndex = 0;
  public pathProgress = 0;
  public activeEffects: Map<string, EffectSnapshot> = new Map();

  constructor(config: EnemyConfig, path: Vec2[]) {
    this.config = config;
    this.path = path;
    this.x = path[0].x;
    this.y = path[0].y;
    this.maxHp = config.hp;
    this.hp = config.hp;
  }

  public update(dt: number): void {
    this.updateEffects(dt);
    this.move(dt);
  }

  private move(dt: number): void {
    const speed = this.getCurrentSpeed();
    let remaining = speed * dt;

    while (remaining > 0 && this.pathIndex < this.path.length - 1) {
      const target = this.path[this.pathIndex + 1];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= remaining) {
        this.x = target.x;
        this.y = target.y;
        this.pathIndex++;
        remaining -= dist;
      } else {
        this.x += (dx / dist) * remaining;
        this.y += (dy / dist) * remaining;
        remaining = 0;
      }
    }

    this.pathProgress = this.pathIndex / (this.path.length - 1);
  }

  private getCurrentSpeed(): number {
    let speed = this.config.speed;
    const slow = this.activeEffects.get('slow');
    if (slow) speed *= 0.7;
    return speed;
  }

  public takeDamage(amount: number, type: DamageType): void {
    const actual = this.calculateDamage(amount, type);
    this.hp -= actual;
    EventBusInstance.emit('enemy:damaged', { enemy: this, damage: actual });
    if (this.hp <= 0) {
      EventBusInstance.emit('enemy:killed', { enemy: this, reward: this.config.reward });
    }
  }

  private calculateDamage(amount: number, type: DamageType): number {
    if (type === 'true') return amount;
    if (type === 'physical') return Math.max(1, amount - this.config.armor);
    return Math.max(1, amount * (1 - this.config.magicResist / 100));
  }

  private updateEffects(dt: number): void {
    for (const [key, effect] of this.activeEffects) {
      effect.duration -= dt;
      if (effect.tickDamage) {
        this.hp -= effect.tickDamage * dt;
      }
      if (effect.duration <= 0) {
        this.activeEffects.delete(key);
      }
    }
  }

  public applyEffect(effect: EffectSnapshot): void {
    this.activeEffects.set(effect.type, effect);
  }

  public hasReachedCore(): boolean {
    return this.pathIndex >= this.path.length - 1;
  }

  public get flying(): boolean { return this.config.flying; }
}
```

---

## 8. 波次系统

### 8.1 WaveManager

```typescript
export class WaveManager {
  private waves: WaveConfig[] = [];
  private currentWave = 0;
  private timer = 0;
  private activeSpawns: WaveGroupState[] = [];
  private waveInProgress = false;

  constructor(
    private enemyManager: EnemyManager,
    private economy: EconomyManager,
    private eventBus: EventBus,
  ) {}

  public load(waves: WaveConfig[]): void {
    this.waves = waves;
    this.currentWave = 0;
    this.activeSpawns = [];
    this.waveInProgress = false;
  }

  public startWave(): void {
    if (this.waveInProgress || this.currentWave >= this.waves.length) return;

    const wave = this.waves[this.currentWave];
    this.activeSpawns = wave.groups.map(g => ({
      ...g,
      spawned: 0,
      elapsed: g.delay,
    }));
    this.waveInProgress = true;
    this.eventBus.emit('wave:started', wave.wave);
  }

  public update(dt: number): void {
    if (!this.waveInProgress) return;

    let activeCount = 0;

    for (const spawn of this.activeSpawns) {
      if (spawn.spawned >= spawn.count) continue;

      spawn.elapsed += dt;
      activeCount++;

      while (spawn.elapsed >= spawn.interval && spawn.spawned < spawn.count) {
        this.enemyManager.spawnEnemy(spawn.type);
        spawn.spawned++;
        spawn.elapsed -= spawn.interval;
      }
    }

    if (activeCount === 0 && this.enemyManager.getEnemies().length === 0) {
      this.completeWave();
    }
  }

  private completeWave(): void {
    const wave = this.waves[this.currentWave];
    this.economy.addWaveBonus(wave.bonus);
    this.waveInProgress = false;
    this.currentWave++;
    this.eventBus.emit('wave:complete', { wave: wave.wave, bonus: wave.bonus });
  }

  public canStartWave(): boolean {
    return !this.waveInProgress && this.currentWave < this.waves.length;
  }

  public getCurrentWave(): number { return this.currentWave; }
  public getTotalWaves(): number { return this.waves.length; }
  public isWaveInProgress(): boolean { return this.waveInProgress; }
}
```

### 8.2 敌人波次配置示例

```typescript
// src/config/waves.ts
export const LEVEL_1_1_WAVES: WaveConfig[] = [
  {
    wave: 1,
    groups: [{ type: 'slime', count: 10, interval: 0.8, delay: 0 }],
    bonus: 50,
  },
  {
    wave: 2,
    groups: [
      { type: 'slime', count: 12, interval: 0.6, delay: 0 },
      { type: 'wolf', count: 3, interval: 0.8, delay: 3 },
    ],
    bonus: 70,
  },
  // ...
];
```

---

## 9. 经济系统

```typescript
export class EconomyManager {
  private gold = 0;
  private totalEarned = 0;

  constructor(private eventBus: EventBus) {}

  public reset(startingGold: number): void {
    this.gold = startingGold;
    this.totalEarned = startingGold;
  }

  public canAfford(amount: number): boolean {
    return this.gold >= amount;
  }

  public spend(amount: number): boolean {
    if (!this.canAfford(amount)) return false;
    this.gold -= amount;
    this.eventBus.emit('economy:changed', this.gold);
    return true;
  }

  public add(amount: number): void {
    this.gold += amount;
    this.totalEarned += amount;
    this.eventBus.emit('economy:changed', this.gold);
  }

  public addKillReward(reward: number): void {
    this.add(reward);
  }

  public addWaveBonus(bonus: number): void {
    this.add(bonus);
  }

  public getGold(): number { return this.gold; }
  public getTotalEarned(): number { return this.totalEarned; }
}
```

---

## 10. 输入管理

```typescript
export class InputManager {
  private canvas: HTMLCanvasElement;
  private scale = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('resize', this.onResize);
  }

  private onPointerDown = (e: PointerEvent): void => {
    const pos = this.getGridPosition(e);
    EventBusInstance.emit('input:click', { ...pos, button: e.button });
  };

  private onPointerMove = (e: PointerEvent): void => {
    const pos = this.getGridPosition(e);
    EventBusInstance.emit('input:hover', pos);
  };

  private onPointerUp = (e: PointerEvent): void => {
    const pos = this.getGridPosition(e);
    EventBusInstance.emit('input:release', pos);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    EventBusInstance.emit('input:key', { key: e.key });
  };

  private getGridPosition(e: PointerEvent): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / this.scale;
    const y = (e.clientY - rect.top) / this.scale;
    return {
      x: Math.floor(x / TILE_SIZE),
      y: Math.floor(y / TILE_SIZE),
    };
  }

  private onResize = (): void => {
    // 根据容器计算缩放比例
  };
}
```

---

## 11. 渲染系统

### 11.1 CanvasRenderer

```typescript
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private logicalWidth = 960;
  private logicalHeight = 540;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    canvas.width = this.logicalWidth;
    canvas.height = this.logicalHeight;
    this.ctx.imageSmoothingEnabled = false; // 保持像素清晰
  }

  public clear(): void {
    this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
  }

  public drawSprite(sprite: HTMLImageElement, x: number, y: number, width: number, height: number): void {
    this.ctx.drawImage(sprite, x, y, width, height);
  }

  public drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  public drawText(text: string, x: number, y: number, options: TextOptions = {}): void {
    this.ctx.font = options.font || '16px monospace';
    this.ctx.fillStyle = options.color || '#fff';
    this.ctx.textAlign = options.align || 'left';
    this.ctx.fillText(text, x, y);
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
```

### 11.2 渲染顺序

1. 清空画布。
2. 绘制地图瓦片。
3. 绘制路径预览（虚线）。
4. 绘制防御塔（含建造动画）。
5. 绘制敌人（含状态效果图标）。
6. 绘制投射物与特效。
7. 绘制 HUD 与 UI。

---

## 12. 音频系统

```typescript
export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private masterVolume = 1;
  private musicVolume = 1;
  private sfxVolume = 1;
  private currentMusic?: HTMLAudioElement;

  public async loadSound(id: string, url: string): Promise<void> {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds.set(id, audio);
  }

  public playSfx(id: string): void {
    const sound = this.sounds.get(id);
    if (!sound) return;
    sound.volume = this.masterVolume * this.sfxVolume;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  public playMusic(id: string): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
    this.currentMusic = this.sounds.get(id);
    if (this.currentMusic) {
      this.currentMusic.loop = true;
      this.currentMusic.volume = this.masterVolume * this.musicVolume;
      this.currentMusic.play().catch(() => {});
    }
  }

  public setMasterVolume(v: number): void { this.masterVolume = v; }
  public setMusicVolume(v: number): void { this.musicVolume = v; }
  public setSfxVolume(v: number): void { this.sfxVolume = v; }
}
```

---

## 13. 存档系统

```typescript
export class SaveManager {
  private readonly KEY = 'pathforge_save';

  public save(data: SaveData): void {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Save failed', e);
    }
  }

  public load(): SaveData | null {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? this.migrate(JSON.parse(raw)) : null;
    } catch (e) {
      console.error('Load failed', e);
      return null;
    }
  }

  public export(): string {
    return btoa(JSON.stringify(this.load()));
  }

  public import(code: string): boolean {
    try {
      const data = JSON.parse(atob(code));
      if (this.validate(data)) {
        this.save(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private migrate(data: any): SaveData {
    if (!data.version) data.version = 1;
    // 未来版本迁移逻辑
    return data;
  }

  private validate(data: any): boolean {
    return data && typeof data.version === 'number';
  }
}
```

---

## 14. 配置数据组织

### 14.1 防御塔配置

```typescript
// src/config/towers.ts
export const TOWER_CONFIGS: Record<string, TowerConfig> = {
  archer: {
    id: 'archer',
    name: '箭塔',
    cost: 80,
    range: 3,
    damage: 8,
    fireRate: 1.0,
    projectileType: 'projectile',
    damageType: 'physical',
    targetFlags: ['ground'],
    upgrades: [
      { level: 2, cost: 120, damageMultiplier: 1.5, rangeBonus: 0.5, fireRateMultiplier: 1.1 },
      { level: 3, cost: 200, damageMultiplier: 2.2, rangeBonus: 1.0, fireRateMultiplier: 1.2 },
    ],
    sprite: 'towers/archer.png',
  },
  // ...
};
```

### 14.2 敌人配置

```typescript
// src/config/enemies.ts
export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  slime: {
    id: 'slime',
    name: '史莱姆',
    hp: 30,
    speed: 1.5,
    armor: 0,
    magicResist: 0,
    reward: 5,
    threat: 1,
    flying: false,
    sprite: 'enemies/slime.png',
  },
  // ...
};
```

### 14.3 关卡配置

```typescript
// src/config/levels.ts
export const LEVEL_CONFIGS: Record<string, LevelConfig> = {
  '1-1': {
    id: '1-1',
    name: '第一滴血',
    width: 20,
    height: 12,
    startingGold: 400,
    lives: 20,
    grid: [
      // 'b' = buildable, 'p' = path, 's' = spawn, 'c' = core, 'w' = water
      ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
      ['s','p','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
      ['b','b','p','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b'],
      // ...
    ].map(row => row as CellType[]),
    spawns: [{ x: 0, y: 1 }],
    cores: [{ x: 19, y: 6 }],
    waves: LEVEL_1_1_WAVES,
  },
};
```

> 注：实际项目中建议用 JSON 文件或专用编辑器生成关卡数据，避免手写大数组。

---

## 15. UI 系统

### 15.1 设计原则

- UI 与游戏逻辑解耦，仅通过事件总线和状态管理通信。
- UI 组件接收状态快照渲染，不直接修改游戏状态。
- 使用 Canvas 绘制 HUD，DOM 元素用于菜单/弹窗。

### 15.2 主要 UI 组件

| 组件 | 职责 |
|------|------|
| `Hud` | 顶部资源栏、波次信息 |
| `BuildMenu` | 底部可建造塔列表 |
| `TowerPanel` | 选中塔时的升级/出售面板 |
| `WavePreview` | 下一波敌人预览 |
| `Modal` | 胜利/失败/暂停弹窗 |

### 15.3 HUD 渲染示例

```typescript
export class Hud {
  public render(renderer: CanvasRenderer, state: GameState, economy: EconomyManager): void {
    renderer.drawRect(0, 0, 960, 40, 'rgba(0,0,0,0.6)');
    renderer.drawText(`生命: ${state.lives}`, 20, 28, { color: '#ff5252' });
    renderer.drawText(`金币: ${economy.getGold()}`, 140, 28, { color: '#ffd700' });
    renderer.drawText(`波次: ${state.wave}/${state.totalWaves}`, 280, 28, { color: '#fff' });
  }
}
```

---

## 16. 构建与部署

### 16.1 package.json 示例

```json
{
  "name": "pathforge-td",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext .ts"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### 16.2 vite.config.ts

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
});
```

### 16.3 部署步骤

1. 运行 `npm run build` 生成 `dist/` 目录。
2. 将 `dist/` 部署到静态托管平台：
   - **GitHub Pages**：使用 `gh-pages` 分支或 GitHub Actions。
   - **Vercel**：连接 Git 仓库自动部署。
   - **Netlify**：拖拽 `dist/` 目录或配置持续部署。

---

## 17. 开发规范

### 17.1 编码风格

- 使用 TypeScript 严格模式（`strict: true`）。
- 类名使用 PascalCase，变量/函数使用 camelCase，常量使用 UPPER_SNAKE_CASE。
- 优先使用 `readonly` 和 `const`。
- 避免 `any`，使用 `unknown` 处理不确定类型。

### 17.2 文件组织

- 每个类/组件一个文件。
- 配置、工具、类型分别放入对应目录。
- 避免循环依赖；必要时通过事件总线解耦。

### 17.3 注释规范

- 公共 API 必须加 JSDoc 注释。
- 复杂算法（如寻路、伤害计算）需 inline 说明。
- TODO 使用 `// TODO:` 标记，并关联 issue 或说明。

### 17.4 Git 工作流

- `main` 分支保持可部署状态。
- 功能开发使用 `feature/xxx` 分支。
- 提交信息遵循 Angular Commit Message 规范。

---

## 18. 测试策略

### 18.1 单元测试

使用 Vitest 对纯函数和核心类进行测试：

- `Pathfinder`：路径存在性、阻塞验证、多入口场景。
- `Grid`：建造/移除塔、格子类型判断。
- `EconomyManager`：收入、支出、边界条件。
- `DamageCalculator`：护甲、魔抗、真实伤害计算。

### 18.2 集成测试

- 完整波次流程模拟。
- 塔升级与出售对经济的影响。
- 敌人到达核心后的生命扣除。

### 18.3 性能测试

- 同屏 80 敌人 + 200 投射物场景下的帧率。
- 大型地图（24×14）A* 寻路耗时（应 < 5ms）。
- 首屏加载时间。

### 18.4 测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { Grid } from '../src/systems/Grid';
import { Pathfinder } from '../src/systems/Pathfinder';

describe('Pathfinder', () => {
  it('should find path in empty grid', () => {
    const grid = new Grid();
    grid.load([
      ['spawn', 'buildable', 'core'],
    ].map(row => row as CellType[]));

    const pf = new Pathfinder(grid);
    const path = pf.getPath({ x: 0, y: 0 }, { x: 2, y: 0 });

    expect(path.length).toBe(3);
  });

  it('should reject placement that blocks all paths', () => {
    const grid = new Grid();
    grid.load([
      ['spawn', 'buildable', 'core'],
    ].map(row => row as CellType[]));

    const pf = new Pathfinder(grid);
    expect(pf.validatePlacement(1, 0)).toBe(false);
  });
});
```

---

## 19. 性能优化

### 19.1 渲染优化

- 使用脏矩形重绘：仅更新变化区域。
- 对象池复用敌人、投射物实例，减少 GC。
- 避免每帧创建新对象（如 `Vec2`）。
- 特效使用简单粒子系统，限制最大粒子数。

### 19.2 逻辑优化

- 塔索敌每 0.1 秒更新一次，而非每帧。
- 敌人状态效果使用 Map 存储，避免数组遍历。
- 路径缓存，仅在塔变化时重算。

### 19.3 内存优化

- 关卡切换时清理对象池与缓存。
- 图片资源懒加载，按关卡按需加载。
- 音频使用单例，避免重复解码。

---

## 20. 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| Canvas 在低端设备性能不足 | 高 | 提供画质选项、限制同屏实体数、使用脏矩形 |
| A* 在复杂迷宫上耗时过高 | 中 | 二叉堆优化、缓存路径、异步寻路 |
| TypeScript 类型维护成本高 | 低 | 早期定义清晰类型、使用严格模式 |
| 音频自动播放策略限制 | 中 | 首次用户交互后初始化音频上下文 |
| 存档损坏或版本不兼容 | 中 | 存档版本号、导入校验、默认回退 |

---

## 21. 附录

### 21.1 关键常量

```typescript
export const TILE_SIZE = 32;
export const LOGICAL_WIDTH = 960;
export const LOGICAL_HEIGHT = 540;
export const MAX_FPS = 60;
export const MAX_DELTA_TIME = 0.1;
export const ENEMY_HP_GROWTH = 1.08;
export const ENEMY_COUNT_GROWTH = 1.05;
export const SELL_REFUND_RATE = 0.7;
```

### 21.2 目录速查

| 路径 | 说明 |
|------|------|
| `src/core/Game.ts` | 游戏主类 |
| `src/systems/Pathfinder.ts` | A* 寻路 |
| `src/systems/TowerManager.ts` | 防御塔管理 |
| `src/systems/EnemyManager.ts` | 敌人管理 |
| `src/systems/WaveManager.ts` | 波次系统 |
| `src/config/` | 游戏配置数据 |
| `src/types/index.ts` | 公共类型 |

### 21.3 参考资源

- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [A* Pathfinding for Beginners](https://www.policyalmanac.org/games/aStarTutorial.htm)
- [Game Programming Patterns - Game Loop](https://gameprogrammingpatterns.com/game-loop.html)

---

## 22. 变更记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-06-21 | 基于 GDD v1.0 完成技术开发文档初稿 |

---

*本文档为 PathForge TD 的技术实现指南，具体代码实现可根据实际开发情况调整。*
