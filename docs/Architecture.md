# PathForge TD Architecture

本文档说明当前仓库的运行时架构、模块边界和关键不变量。产品规则和体验目标见 [PRD/GDD](GDD-PathForgeTD.md)，更细的类型说明见 [Technical Design](Technical-Design.md)。

## 1. 架构目标

PathForge TD 是一个浏览器端 Canvas 2D 游戏。架构目标是：

- 让玩法规则、配置数据、渲染表现和菜单 UI 解耦。
- 保持迷宫塔防的核心不变量：玩家可以改变路径，但不能完全阻断任一入口到核心的地面路线。
- 所有玩家可见内容优先来自配置，避免在 UI 或渲染层散落重复文案。
- 让放塔、寻路、UI 状态和存档都有自动化测试可覆盖的边界。

## 2. 启动链路

```text
index.html
  -> src/main.ts
    -> new Game(canvas)
      -> Game.init()
        -> applySettings()
        -> AudioManager.init()
        -> MenuManager.showScreen('main-menu')
        -> requestAnimationFrame(loop)
```

`Game` 是运行时编排入口。它创建并持有核心系统、实体管理器、渲染器、战斗 UI 和菜单 UI。

## 3. 模块职责

| 路径 | 职责 |
| --- | --- |
| `src/core/Game.ts` | 游戏生命周期、事件绑定、关卡加载、胜负结算、主循环 |
| `src/core/InputManager.ts` | 将 pointer/keyboard 输入转换为网格坐标和事件 |
| `src/core/StateManager.ts` | 当前阶段、生命、波次、速度、暂停、选中塔和悬停格 |
| `src/core/EventBus.ts` | 系统间事件通信 |
| `src/config/` | 塔、敌人、波次、关卡、成就和全局视觉/规则常量 |
| `src/entities/` | `Tower`、`Enemy`、`Projectile`、`Effect` 等运行时对象 |
| `src/systems/Grid.ts` | 地图格、塔占位、地形效果、入口和核心缓存 |
| `src/systems/Pathfinder.ts` | A* 寻路、路径缓存、放塔合法性校验 |
| `src/systems/TowerManager.ts` | 放塔、升级、出售、辅助塔 Buff、塔更新 |
| `src/systems/EnemyManager.ts` | 敌人生成、移动、死亡和到达核心 |
| `src/systems/WaveManager.ts` | 波次加载、出怪节奏、下一波预览、无尽模式 |
| `src/systems/EconomyManager.ts` | 金币、花费、退款、击杀奖励和累计收入 |
| `src/systems/SaveManager.ts` | `localStorage` 存档、迁移、导入导出 |
| `src/systems/SettingsManager.ts` | 音量、画质、路径预览、粒子设置 |
| `src/renderer/CanvasRenderer.ts` | Canvas 地图、塔、敌人、投射物、路径和特效绘制 |
| `src/ui/UIManager.ts` | 战斗内 HUD、塔栏、说明面板、波次预览、结算提示 |
| `src/ui/MenuManager.ts` | 主菜单、选关、设置、统计、成就、暂停和结算 DOM |
| `src/audio/AudioManager.ts` | 音乐和音效入口 |

## 4. 主循环

每帧执行：

```text
Game.loop(timestamp)
  -> update(dt)
    -> combat 阶段更新波次、敌人、地形
    -> 更新塔、投射物、特效、战斗 UI
  -> render()
    -> 清屏
    -> 绘制地图、地形效果、路径预览、悬停/放置预览
    -> 绘制塔、敌人、投射物、粒子
    -> 绘制战斗 UI
```

`MAX_DELTA_TIME` 用于限制单帧最大时间步，避免窗口切回或卡顿后一次性推进过多模拟。

## 5. 输入与 UI 分层

输入先进入 `InputManager`，再通过 `eventBus` 发送给 `Game`。

点击处理顺序：

1. `UIManager.handleClick(pixelX, pixelY)` 先判断战斗 UI 是否消费点击。
2. 如果 UI 未消费点击，`Game.handleClick(x, y, button)` 再处理地图格。
3. 右键取消当前建塔选择。
4. 点已有塔打开选中塔面板。
5. 点空格且已选塔时尝试放置。

悬停处理顺序：

1. 如果鼠标在战斗 UI 上，清空 `hoveredCell`。
2. 如果鼠标在地图上，记录网格坐标。
3. 渲染阶段用 `hoveredCell + selectedTowerId` 绘制放置预览和作用范围。

该分层的核心约束是：UI 点击不能误触地图；地图放塔失败不能清空 HUD、塔栏、说明面板或选中塔。

## 6. 放塔数据流

成功路径：

```text
选择塔卡
  -> StateManager.selectedTowerId
鼠标悬停地图
  -> Pathfinder.validatePlacement() 用临时 towerId 预判
点击地图格
  -> TowerManager.placeTower()
    -> Grid.isBuildable()
    -> Pathfinder.validatePlacement()
    -> EconomyManager.spend()
    -> Grid.setTower()
    -> towers.push(new Tower())
    -> Pathfinder.invalidate()
    -> eventBus.emit('tower:placed')
```

失败路径：

```text
TowerManager.placeTower()
  -> failPlacement(reason)
  -> eventBus.emit('tower:placementFailed')
  -> 保留 selectedTowerId、塔说明、HUD 和建造栏
```

失败原因包括未知塔、不可建造格、路径被堵死、金币不足和写入格子失败。

## 7. 地图与寻路不变量

- `Grid.load()` 只在加载关卡时建立格子数组。
- 运行中不能移动格子的 `x/y`，也不能为了放塔改写原始 `CellType`。
- 塔占位写入 `GridCell.towerId`，出售时删除 `towerId`。
- 地面敌人通过 `Pathfinder.getPath()` 选择路径。
- `Pathfinder.validatePlacement()` 会临时写入 `towerId = 'temp'`，逐个入口检查至少能到达一个核心，然后清理临时状态并失效路径缓存。
- 飞行敌人不依赖地面路径；路径预览需要区分地面路径和飞行路线。

## 8. 配置即接口

当前项目把配置视为产品接口。新增内容时必须保证字段完整：

- 塔：`id / name / cost / range / damage / fireRate / projectileType / damageType / targetFlags / color / role / description / special / usage / upgrades`
- 敌人：`id / name / hp / speed / armor / magicResist / reward / flying / color / radius / ability? / bossSkill?`
- 关卡：`id / name / width / height / startingGold / lives / grid / spawns / cores / waves`
- 波次：`wave / groups / bonus`
- 成就：`id / name / description / icon / condition`

配置扩展步骤见 [Configuration Guide](Configuration-Guide.md)。

## 9. 存档边界

`SaveManager` 使用浏览器 `localStorage`，键名为 `pathforge_save`。

存档包含：

- `version`
- `player`
- `progress.campaign / unlocks / achievements`
- `settings.masterVolume / musicVolume / sfxVolume`
- `stats.totalKills / totalBossKills / highestWave`

`SettingsManager` 会在当前默认设置基础上合并存档设置，因此新增设置项时需要同步：

1. `GameSettings`
2. `DEFAULT_SETTINGS`
3. `SaveData.settings`
4. `SaveManager.migrate()`
5. 设置页 UI
6. 文档和测试

## 10. 高风险改动

| 改动 | 主要风险 | 必要验证 |
| --- | --- | --- |
| 放塔规则 | 堵死路径、金币扣除错误、UI 状态丢失 | `TowerManager.test.ts`、手测成功/失败放塔 |
| 寻路权重 | 路径漂移、关卡不可通、性能下降 | `Pathfinder.test.ts`、3 个以上关卡手测 |
| UI 分层 | 点塔栏误触地图、设置页错位、说明不可读 | `UIManager.test.ts`、浏览器视觉检查 |
| 新关卡 | 出生点/核心缺失、路线无效、空间浪费 | `levels.test.ts`、完整通关手测 |
| 新敌人/塔 | 目标类型不匹配、伤害类型失衡、文案缺失 | `config.test.ts`、战斗手测 |
| 存档字段 | 旧存档无法读取、设置丢失 | 手动迁移旧 `pathforge_save` |

## 11. 关联文档

- [Technical Design](Technical-Design.md)
- [Configuration Guide](Configuration-Guide.md)
- [Testing Guide](Testing-Guide.md)
- [UI & Art Guide](UI-Art-Guide.md)
- [Troubleshooting](Troubleshooting.md)
