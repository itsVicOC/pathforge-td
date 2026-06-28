# PathForge TD Configuration Guide

本文档说明如何安全扩展塔、敌人、关卡、波次、成就和设置。所有配置改动都应同步测试和相关设计文档。

## 1. 配置文件总览

| 文件 | 内容 |
| --- | --- |
| `src/config/towers.ts` | 8 种塔的数值、目标、伤害、升级和 UI 说明 |
| `src/config/enemies.ts` | 13 种敌人的生命、速度、抗性、奖励、飞行和技能 |
| `src/config/waves.ts` | 早期关卡波次、地图字符转换、高级关卡生成器 |
| `src/config/levels.ts` | 24 个战役关卡配置 |
| `src/config/achievements.ts` | 100 个条件化成就 |
| `src/config/gameConfig.ts` | Canvas 尺寸、格子尺寸、颜色、运行时常量 |

共享类型定义在 `src/types/index.ts`。

## 2. 新增防御塔

新增塔需要修改：

1. `src/types/index.ts`：如需新的 `DamageType`、`ProjectileType` 或 `TargetFlag`，先扩展类型。
2. `src/config/towers.ts`：新增 `TowerConfig`。
3. `src/entities/Tower.ts`：如需新的命中特效或攻击逻辑，在实体中实现。
4. `src/renderer/CanvasRenderer.ts`：新增可区分的塔视觉表现。
5. `src/ui/UIManager.ts`：确认塔卡和说明面板能自动读取字段。
6. `src/core/Game.ts`：如果要支持快捷键，需要新增按键映射。
7. 测试和文档：更新配置测试、玩法文档和 PRD/GDD。

`TowerConfig` 必填字段：

```ts
{
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
  role: string;
  description: string;
  special: string;
  usage: string;
  upgrades: UpgradeConfig[];
}
```

塔说明验收：

- `role` 是 2-4 个字的定位。
- `description` 说明基础职责。
- `special` 说明特殊机制。
- `usage` 说明推荐摆放或克制场景。
- 支援类塔可以 `damage = 0`、`fireRate = 0`、`targetFlags = []`，但 UI 仍必须解释用途。

## 3. 新增敌人

新增敌人需要修改：

1. `src/config/enemies.ts`：新增 `EnemyConfig`。
2. `src/entities/Enemy.ts`：如有新能力，接入移动、受伤或死亡逻辑。
3. `src/renderer/CanvasRenderer.ts`：新增敌人外观差异。
4. `src/config/waves.ts`：把敌人放入合适波次。
5. 测试和文档：更新配置测试、敌人说明和平衡记录。

`EnemyConfig` 关键字段：

- `hp`：基础生命。
- `speed`：格/秒。
- `armor`：削减物理伤害。
- `magicResist`：削减魔法类伤害。
- `reward`：击杀金币。
- `flying`：是否忽略地面寻路。
- `ability`：普通敌人特殊能力。
- `bossSkill`：Boss 技能。

平衡建议：

- 高速敌人不要同时拥有过高血量。
- 飞行敌人的出现需要提前给玩家防空准备窗口。
- 支援敌人和自爆敌人应在波次预览中容易识别。
- Boss 应测试 1x/2x/3x 速度下的稳定性。

## 4. 新增波次

`WaveConfig` 使用组配置：

```ts
{
  wave: number;
  groups: [
    { type: 'slime', count: 10, interval: 0.6, delay: 0 }
  ],
  bonus: 50
}
```

字段含义：

| 字段 | 说明 |
| --- | --- |
| `type` | 必须存在于 `ENEMY_CONFIGS` |
| `count` | 该组敌人数量 |
| `interval` | 同组出怪间隔，单位秒 |
| `delay` | 当前组开始前延迟，单位秒 |
| `bonus` | 波次结束奖励 |

波次设计建议：

- 每关前 1-2 波用于提示该关核心压力。
- 引入新敌人时先少量出现，再组合出现。
- 飞行波前应确保玩家有足够金币购买至少一种防空塔。
- Boss 波不要同时塞入过多首次出现的机制。

## 5. 新增关卡

新增关卡需要修改：

1. `src/config/levels.ts`：新增 `LevelConfig`。
2. `src/config/waves.ts`：新增或复用地图网格和波次生成函数。
3. `src/ui/MenuManager.ts`：如果选关布局依赖数量或章节，需要确认显示。
4. `src/config/achievements.ts`：关卡通关、三星和章节成就会根据 `LEVEL_CONFIGS` 自动派生，但仍需跑测试确认数量。
5. 文档：更新 README、PRD/GDD、玩法指南和平衡记录。

`LevelConfig` 要求：

- `width / height` 必须和 `grid` 尺寸一致。
- `grid` 必须包含 `spawn` 和 `core`。
- `spawns / cores` 应和 `grid` 中的出生点、核心点一致。
- 所有入口至少能到达一个核心。
- 可建造区域必须足够塑形，但不能轻易一两塔堵死。

地图字符和格子含义以 `waves.ts` 的转换函数为准。当前运行时支持的 `CellType`：

| 类型 | 是否可走 | 是否可建塔 | 寻路成本/效果 |
| --- | --- | --- | --- |
| `path` | 是 | 否 | 成本 1 |
| `spawn` | 是 | 否 | 成本 1 |
| `core` | 是 | 否 | 成本 1 |
| `buildable` | 是，除非有塔 | 是 | 成本 5 |
| `forest` | 是，除非有塔 | 是 | 成本 3，地形减速 |
| `lava` | 是 | 否 | 成本 7，地形伤害 |
| `water` | 否 | 否 | 不可通行 |
| `obstacle` | 否 | 否 | 不可通行 |

## 6. 新增成就

成就配置在 `src/config/achievements.ts`。当前成就包括核心成就、关卡通关、关卡三星、章节通关、章节三星、击杀里程碑、无尽波次、金币、路径长度、Boss 击杀和战役星数。

新增条件时需要：

1. 扩展 `AchievementCondition` 联合类型。
2. 在 `isAchievementUnlocked()` 中实现判定。
3. 确认 `AchievementContext` 能提供所需数据。
4. 更新测试，确保成就可被完整存档上下文解锁。
5. 更新玩法和发布文档。

不要新增无法通过当前存档或运行时数据判断的成就。

## 7. 新增设置项

新增设置项需要修改：

1. `src/systems/SettingsManager.ts`
2. `src/types/index.ts` 的 `SaveData.settings`
3. `src/systems/SaveManager.ts` 的默认存档和迁移
4. `src/ui/MenuManager.ts` 的设置页 DOM
5. `src/core/Game.ts` 的 `applySettings()` 和事件监听
6. 测试、README、故障排查和发布清单

设置页验收：

- 控件不重叠。
- 标签和当前值对齐。
- 改动立即生效并保存。
- 重置后恢复默认值。

## 8. 配置改动检查清单

- [ ] 新 ID 唯一且命名稳定。
- [ ] 所有引用 ID 都存在。
- [ ] 文案字段完整、玩家可读。
- [ ] 数值不会让早期关卡破产或后期关卡失控。
- [ ] `npm run test -- --run` 通过。
- [ ] 涉及构建或 UI 时 `npm run build` 通过。
- [ ] `docs/Balance-Notes.md` 记录了数值变化原因。
- [ ] README 和相关设计文档中的数量信息已同步。
