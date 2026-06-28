# Contributing to PathForge TD

这份指南用于保持项目改动可验证、文档同步，并减少 UI、寻路和配置类回归。

## 本地开发

```bash
npm install
npm run dev
```

提交前建议运行：

```bash
npm run test -- --run
npm run build
```

更完整的自动化、手测和浏览器验证矩阵见 `docs/Testing-Guide.md`。

## 分支和提交

建议分支命名：

```text
feature/<short-name>
fix/<short-name>
docs/<short-name>
```

提交信息建议使用简短的 Conventional Commits 风格：

```text
feat: add tower range preview
fix: keep tower panel after failed placement
docs: complete repository documentation
test: cover path blocking validation
```

## 代码约定

- TypeScript 类型优先，避免新增隐式 `any`。
- 优先复用当前系统边界：`Game` 负责编排，`systems` 负责规则，`entities` 负责运行时对象，`renderer/ui` 负责表现。
- 不在 UI 中硬编码塔用途说明，优先使用 `TowerConfig.role / description / special / usage`。
- 放塔逻辑必须经过 `TowerManager` 和 `Pathfinder` 校验，不能绕过路径阻断检查。
- 地图运行时不能改变格子坐标或关卡原始布局。塔占位应使用 `towerId`，不要改写原始 `CellType`。
- 新增异步资源或美术资源时，需要考虑构建产物和加载失败回退。

## UI 和交互要求

- HUD、底部塔栏、塔说明、选中塔面板、波次预览是核心信息层，放塔成功或失败都不能把它们清空。
- 玩家选中塔并移动到地图时，应能看到作用范围和放置合法性。
- 新塔必须有可区分的图形、颜色和说明文案。
- 设置页和菜单页需要在常见窗口尺寸下保持可读，不应出现文本溢出或控件错位。

## 配置改动要求

新增或修改配置时，必须检查对应测试：

| 配置 | 需要关注 |
| --- | --- |
| `src/config/towers.ts` | 字段完整、目标类型、伤害类型、升级数值、UI 说明 |
| `src/config/enemies.ts` | 敌人 ID、血量、速度、抗性、奖励、飞行/Boss 标记 |
| `src/config/waves.ts` | 波次敌人 ID 是否存在、奖励和出怪密度 |
| `src/config/levels.ts` | 地图尺寸、出生点、核心点、可通路、难度曲线 |
| `src/config/achievements.ts` | 成就数量、ID 唯一性、条件可达性 |

## 文档同步

以下改动必须同步文档：

- 塔、敌人、关卡、成就数量变化。
- 玩法规则、放塔规则、胜负条件变化。
- 架构、核心类型、事件流、存档字段变化。
- 配置扩展步骤、测试流程、UI/美术规范或排障流程变化。
- 平衡调整，包括价格、伤害、速度、奖励、波次和地图。
- 发布版本或可试玩版本变更。

对应文档：

- 产品和玩法：`docs/GDD-PathForgeTD.md`
- 玩家和手测说明：`docs/Gameplay-Guide.md`
- 架构边界：`docs/Architecture.md`
- 技术和架构：`docs/Technical-Design.md`
- 配置扩展：`docs/Configuration-Guide.md`
- 测试矩阵：`docs/Testing-Guide.md`
- UI 和美术：`docs/UI-Art-Guide.md`
- 计划和验收：`docs/Development-Plan.md`
- 平衡记录：`docs/Balance-Notes.md`
- 发布流程：`docs/Release-Checklist.md`
- 故障排查：`docs/Troubleshooting.md`
- 版本记录：`CHANGELOG.md`

## Pull Request 检查清单

- [ ] 改动范围清晰，没有混入无关重构。
- [ ] `npm run test -- --run` 通过。
- [ ] `npm run build` 通过。
- [ ] UI 改动已手动检查主要界面。
- [ ] 放塔、路径、波次或配置改动已补测试。
- [ ] 相关文档已同步。

## 已知高风险区域

- 放塔失败后 UI 状态被清空。
- UI 点击和地图点击分层错误，导致塔栏点击误触地图。
- 多入口关卡被单点放塔完全堵死。
- 飞行敌人路径和地面路径显示混淆。
- 成就条件新增后无法通过旧存档迁移。
