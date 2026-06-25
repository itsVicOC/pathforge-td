# PathForge TD Technical Design

> 文档状态：2026-06-25 重写版  
> 目标：以当前仓库实现为准，记录架构、数据流、接口约束、测试策略和后续技术风险。  
> 重要约定：本文不再保留过时的大段示例代码；涉及未来功能时必须明确标注“计划”。

## 1. 技术栈与运行方式

| 项 | 当前选择 |
| --- | --- |
| 语言 | TypeScript |
| 构建 | Vite |
| 渲染 | HTML Canvas 2D |
| 测试 | Vitest |
| 包管理 | npm |
| 入口 | `src/main.ts` |
| HTML | `index.html` |

常用脚本：

```bash
npm run dev
npm run test -- --run
npm run build
```

## 2. 当前目录职责

| 路径 | 职责 |
| --- | --- |
| `src/core` | 游戏主循环、输入、事件、状态、资源加载 |
| `src/systems` | 寻路、网格、塔/敌人/波次/投射物/效果/经济/存档/设置 |
| `src/entities` | Tower、Enemy、Projectile、Effect 等运行时实体 |
| `src/config` | 塔、敌人、关卡、波次、成就、颜色和全局常量 |
| `src/renderer` | Canvas 绘制封装 |
| `src/ui` | 战斗 UI 和菜单 UI |
| `src/types` | 跨模块共享类型 |
| `docs` | 产品、技术、计划文档 |

## 3. 运行时架构

### 3.1 主对象关系

`Game` 是运行时装配中心，负责创建并协调：

- `StateManager`：阶段、生命、波次、暂停、速度、选塔状态。
- `Grid`：地图格子、出生点、核心点、塔占位、地形成本和地形效果。
- `Pathfinder`：A* 寻路、路径缓存、放塔合法性校验。
- `EconomyManager`：金币、消费、奖励。
- `TowerManager`：塔配置读取、建造、升级、出售、更新。
- `EnemyManager`：敌人生成、移动、到达核心、地形效果应用。
- `WaveManager`：配置波次、无尽波次、下一波预览。
- `ProjectileManager`：投射物生成、命中和伤害结算。
- `EffectManager`：视觉效果。
- `UIManager`：HUD、塔栏、塔说明、选中塔面板、波次预览。
- `CanvasRenderer`：所有 Canvas 绘制方法。
- `MenuManager`：菜单、设置、关卡选择。
- `AudioManager`、`SaveManager`、`SettingsManager`：音频、存档、设置。

### 3.2 更新与渲染顺序

每帧主要流程：

1. 计算 `dt`，应用暂停和时间倍率。
2. 更新波次生成、敌人、塔、投射物、效果和 UI 动画时间。
3. 清屏。
4. 绘制地图、路径预览、塔、敌人、投射物、效果。
5. 绘制 UI：HUD、塔栏、塔说明、塔面板、波次预览、胜负弹窗。

UI 是 Canvas 绘制的一部分，因此任何游戏逻辑变更都不能跳过 UI 渲染，也不能在放塔流程中清空 UI 必需状态。

## 4. 核心类型接口

### 4.1 Grid 与地图

`CellType` 当前取值：

```ts
type CellType =
  | 'buildable'
  | 'path'
  | 'obstacle'
  | 'water'
  | 'lava'
  | 'forest'
  | 'spawn'
  | 'core';
```

约束：

- `spawn` 和 `core` 由关卡配置定义，运行中不应被移动。
- `towerId` 是塔占位，不应改变原始 `type`。
- `Grid.isWalkable` 和 `Grid.getMoveCost` 是寻路规则的事实来源。
- 地图显示和寻路预览必须使用同一套格子坐标。

### 4.2 TowerConfig

`TowerConfig` 是塔配置和 UI 说明的共同接口：

```ts
interface TowerConfig {
  id: string;
  name: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  projectileType: ProjectileType;
  damageType: DamageType;
  targetFlags: TargetFlag[];
  color: string;
  upgrades: UpgradeConfig[];
  role?: string;
  description?: string;
  special?: string;
  usage?: string;
}
```

文档约束：

- 新增塔必须填写 `role/description/special/usage`。
- UI 不应硬编码塔用途，应优先从配置读取。
- `targetFlags: []` 表示非攻击型塔，例如增益塔。
- `damageType` 和 `projectileType` 必须与实际伤害/投射物处理匹配。

### 4.3 EnemyConfig

`EnemyConfig` 定义敌人数值和移动类别：

```ts
interface EnemyConfig {
  id: string;
  name: string;
  hp: number;
  speed: number;
  armor: number;
  magicResist: number;
  reward: number;
  flying: boolean;
  color: string;
  radius: number;
  bossSkill?: BossSkillType;
  ability?: BossSkillType;
}
```

约束：

- `flying: true` 的敌人使用飞行路径，不应依赖地面迷宫。
- `armor` 和 `magicResist` 必须在伤害结算中保持可解释。
- Boss 技能使用 `bossSkill`，普通精英技能使用 `ability`；两者未配置时不得触发技能逻辑。

### 4.4 WaveConfig 与 LevelConfig

波次：

```ts
interface WaveGroup {
  type: string;
  count: number;
  interval: number;
  delay: number;
}

interface WaveConfig {
  wave: number;
  groups: WaveGroup[];
  bonus: number;
}
```

关卡：

```ts
interface LevelConfig {
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
```

约束：

- `WaveGroup.type` 必须对应 `ENEMY_CONFIGS` 中存在的敌人 ID。
- `LevelConfig.grid` 尺寸必须匹配 `width/height`。
- `spawns/cores` 坐标必须对应 `spawn/core` 格子或清晰解释其映射关系。

## 5. 放塔与寻路数据流

### 5.1 成功路径

1. 玩家点击底部塔卡，`StateManager.selectedTowerId` 更新。
2. 玩家点击地图格子。
3. `TowerManager` 读取塔配置和金币状态。
4. `Pathfinder.validatePlacement(x, y)` 临时占位检查所有入口是否仍有通路。
5. 校验通过后，`Grid` 写入 `towerId`。
6. `EconomyManager` 扣金币。
7. `Pathfinder.invalidate()` 清空路径缓存。
8. 后续敌人使用新路径，UI 保持当前塔说明和 HUD。

### 5.2 失败路径

放塔失败可能原因：

- 金币不足。
- 格子不可建造。
- 格子已有塔。
- 会堵死路径。
- 当前阶段不允许建造。

失败要求：

- 不写入 `Grid.towerId`。
- 不扣金币。
- 不清空选中塔，除非玩家主动取消。
- 不隐藏 HUD、底部塔栏、塔说明和波次预览。
- 应保留或发出失败原因，供 UI 提示。

## 6. Pathfinder 技术要求

当前实现：

- A* 使用曼哈顿距离启发式。
- 使用 `MinHeap` 优先队列。
- 路径结果按 `from-to` 缓存。
- 放塔校验会临时设置 `towerId = 'temp'`，检查后删除并清空缓存。
- 地面路径预览显示路线长度；下一波包含飞行敌人时额外显示飞行直线路径。

必须保持：

- 入口到核心至少存在一条路径。
- 路径缓存只在地图占位变化后失效。
- 地形成本来自 `Grid.getMoveCost`，不能在 UI 或敌人中复制另一套规则。
- 地图格子不会因路径更新而移动。

后续优化：

- 根据试玩数据继续微调路径长度阈值颜色。
- 增加更长局的路径稳定压力测试。

## 7. 实体与伤害

### 7.1 Tower

职责：

- 保存配置、坐标、等级、冷却、目标优先级。
- 根据 `targetFlags` 过滤可攻击敌人。
- 按 `TargetPriority` 选择目标。
- 触发 `tower:fire` 事件或直接应用特殊效果。

目标优先级：

| 值 | 含义 |
| --- | --- |
| `first` | 路径进度最高，默认防漏 |
| `last` | 路径进度最低，适合延后集火 |
| `strong` | 当前生命最高，适合 Boss/精英 |
| `weak` | 当前生命最低，适合补刀 |
| `nearest` | 距离塔最近，适合局部防守 |

### 7.2 Enemy

职责：

- 按路径移动。
- 维护 `pathIndex`、`pathProgress` 和生命。
- 应用护甲、魔抗、状态效果、地形效果。
- 到达核心后由管理器触发生命扣除。

### 7.3 Projectile

职责：

- 追踪目标或处理命中。
- 命中后由 `ProjectileManager` 统一结算伤害和特殊效果。
- 目标死亡或失效时应安全销毁。

## 8. UI 技术要求

### 8.1 绘制层级

战斗 UI 由 `UIManager.render(renderer)` 绘制，顺序为：

1. HUD。
2. 底部建造栏。
3. 已选中塔的范围和塔面板。
4. 波次预览。
5. 胜利/失败弹窗。

Canvas 地图由 `Game` 在 UI 之前绘制。UI 坐标需要与地图坐标分离，避免放塔命中测试误判 UI 区域。

### 8.2 塔说明面板

塔说明面板应读取：

- `name`
- `role`
- `damageType`
- `targetFlags`
- `cost`
- `description`
- `special`
- `usage`

约束：

- 没有选塔时显示“如何查看塔作用”的固定提示。
- 选塔后立即展示该塔作用。
- 放塔成功或失败后，说明面板不能消失。
- 面板宽度和换行应限制文本溢出。

### 8.3 UI 消失问题的技术防线

后续实现应检查：

- `Game.handleClick` 是否把 UI 点击和地图点击明确分离。
- `UIManager.handleClick` 是否优先消费 UI 区域点击。
- `StateManager.selectTower(undefined)` 是否只在明确取消或选中已有塔时调用。
- 放塔失败事件是否会误触发菜单/阶段切换。
- 渲染函数是否依赖未定义的选中塔对象导致提前返回。

## 9. 配置数据现状

### 9.1 防御塔

当前 8 种塔：

| ID | 名称 | 定位 | 目标 |
| --- | --- | --- | --- |
| `archer` | 箭塔 | 单体 | 地面 |
| `cannon` | 炮塔 | 范围 | 地面 |
| `ice` | 冰塔 | 减速 | 地面 |
| `lightning` | 雷塔 | 对空 | 地面/飞行 |
| `poison` | 毒塔 | 毒伤 | 地面/飞行 |
| `sniper` | 狙击塔 | 狙杀 | 地面/飞行 |
| `support` | 增益塔 | 增益 | 无 |
| `barracks` | 兵营 | 控制 | 地面 |

### 9.2 敌人

当前 13 种敌人：

| ID | 名称 | 类别 |
| --- | --- | --- |
| `slime` | 史莱姆 | 基础 |
| `wolf` | 狼 | 高速 |
| `orc` | 兽人 | 高血 |
| `flyer` | 飞行者 | 飞行 |
| `shielder` | 盾兵 | 护甲 |
| `ghost` | 幽灵 | 飞行/魔抗 |
| `fireElemental` | 火元素 | 魔抗 |
| `healer` | 治疗者 | 支援 |
| `bomber` | 自爆怪 | 高速威胁 |
| `assassin` | 迅捷刺客 | 冲刺精英 |
| `boss` | 森林巨兽 | Boss |
| `lavaBoss` | 熔岩领主 | Boss |
| `skyBoss` | 天空暴君 | 飞行 Boss |

### 9.3 关卡

当前 24 个关卡均为 30x17：

| ID | 名称 | 特征 |
| --- | --- | --- |
| `1-1` | 第一滴血 | 单入口、基础路径 |
| `1-2` | 熔岩裂谷 | 熔岩/森林地形、复合波次 |
| `1-3` | 天空要塞 | 双入口、多核心、飞行压力 |
| `2-1` | 毒雾湿地 | 地形复合、魔抗/飞行混合压力 |
| `2-2` | 双门峡谷 | 双入口汇合、防线集中与补漏 |
| `2-3` | 终焰回廊 | 章节 2 终局混合 Boss、飞行和高速压力 |
| `3-1` 到 `8-3` | 高阶战役 | 基于三种稳定小关模板生成，逐章提高敌人组合、Boss 压力、起始经济和生命上限 |

## 10. 测试策略

### 10.1 已有测试方向

- `Pathfinder.test.ts`：地形成本、放塔校验、路径缓存失效。
- `Tower.test.ts`：目标优先级。
- `Projectile.test.ts`：投射物命中。
- `TowerManager.test.ts`：forest 建塔一致性、金币不足、堵路拒绝。
- `EnemyManager.test.ts`：飞行敌人直线路径。
- `GameFlow.test.ts`：全部配置关卡波次无渲染模拟，验证关卡流程不会卡死且能完整跑完。
- `UIManager.test.ts`：塔卡、速度、塔面板、升级、出售和目标优先级交互。
- `levels.test.ts` / `config.test.ts`：关卡尺寸、入口/核心、路径存在、路径塑形、塔说明字段、波次敌人 ID、13 敌人覆盖、关卡压力曲线递增、100 个成就数量/唯一 ID/条件有效性。

### 10.2 必补测试

| 场景 | 目的 |
| --- | --- |
| 放塔失败不清空 `selectedTowerId` | 已覆盖，防止塔说明消失 |
| UI 点击塔栏不触发地图放塔 | 已覆盖 |
| 非法放塔不写入 `Grid.towerId` | 已覆盖 |
| 多入口关卡放塔仍保持每个入口有路 | 已覆盖基础路径存在与路径塑形 |
| 路径缓存失效后重新计算 | 已覆盖 |
| 飞行敌人不受地面堵路影响 | 已覆盖直线路径 |

### 10.3 手测清单

- 进入 1-1，依次点击 8 个塔卡，确认说明面板更新。
- 金币不足时点击昂贵塔，确认 UI 不消失。
- 在不可建造格子、已有塔格子、堵路格子放塔，确认失败状态稳定。
- 开始波次后切换速度和暂停，确认 HUD 正常。
- 1-3 双入口路径预览清楚，敌人不会从视觉上“穿越”不可走区域。
- 2-1 到 8-3 能连续解锁并通过“继续下一关”进入后续关卡。

## 11. 性能目标

| 项 | 目标 |
| --- | --- |
| 常规帧率 | 主流桌面浏览器 60 FPS 附近 |
| 寻路 | 单次 A* 在当前 30x17 地图上无明显卡顿 |
| 同屏对象 | 80 敌人、200 投射物仍可操作 |
| UI | 文本和面板绘制不产生明显闪烁 |

后续如出现性能问题，优先优化：

- 路径缓存失效频率。
- 塔索敌频率。
- 投射物对象复用。
- Canvas 文本测量和重复绘制。

## 12. 文档维护规则

- 技术文档只记录当前真实存在的模块和接口。
- 未来功能必须标注“计划”，不能和已实现内容混写。
- 新增配置字段后，同步更新 PRD/GDD、Technical Design、Development Plan。
- 不引用仓库中不存在的文件。
- 大段代码示例只在必要时保留，否则以接口、流程和约束描述为主。
