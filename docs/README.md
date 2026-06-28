# PathForge TD 文档总览

这个目录保存项目的产品、玩法、架构、技术、配置、测试、UI/美术、计划、平衡、发布和排障文档。新增功能或调整系统时，应同步维护对应文档，避免文档和实现脱节。

## 推荐阅读顺序

| 顺序 | 文档 | 适合读者 | 内容 |
| --- | --- | --- | --- |
| 1 | [README](../README.md) | 所有人 | 项目介绍、运行方式、玩法和目录 |
| 2 | [PRD/GDD](GDD-PathForgeTD.md) | 产品、策划、开发 | 核心体验、玩法、塔/敌/地图/UI/平衡要求 |
| 3 | [Gameplay Guide](Gameplay-Guide.md) | 玩家、测试、策划 | 操作、阶段、塔职责、敌人类型、关卡节奏和手测路径 |
| 4 | [Architecture](Architecture.md) | 开发 | 启动链路、模块职责、主循环、事件流和高风险边界 |
| 5 | [Technical Design](Technical-Design.md) | 开发 | 核心类型、数据流、寻路、UI 分层、测试策略 |
| 6 | [Configuration Guide](Configuration-Guide.md) | 开发、策划 | 新增塔、敌人、波次、关卡、成就和设置的步骤 |
| 7 | [UI & Art Guide](UI-Art-Guide.md) | UI、开发、测试 | 战斗界面、菜单、塔/敌美术、范围预览和视觉验收 |
| 8 | [Testing Guide](Testing-Guide.md) | 开发、测试 | 自动化测试、手测矩阵、浏览器检查和发布前验证 |
| 9 | [Development Plan](Development-Plan.md) | 开发、项目管理 | 里程碑、验收标准、后续优化优先级 |
| 10 | [Balance Notes](Balance-Notes.md) | 策划、开发 | 平衡调整记录和自动化验证基线 |
| 11 | [Release Checklist](Release-Checklist.md) | 发布负责人 | 发布前检查、构建、测试、手测和 GitHub 发布步骤 |
| 12 | [Troubleshooting](Troubleshooting.md) | 开发、测试 | 本地运行、构建、测试、UI、寻路和存档排障 |
| 13 | [Contributing](../CONTRIBUTING.md) | 贡献者 | 分支、提交、测试、文档同步和代码约定 |
| 14 | [Changelog](../CHANGELOG.md) | 所有人 | 版本变更记录 |

## 文档维护规则

| 变更类型 | 必须同步的文档 |
| --- | --- |
| 新增塔、敌人、关卡、成就 | `GDD-PathForgeTD.md`、`Technical-Design.md`、对应测试 |
| 调整数值、波次、地图或经济 | `Balance-Notes.md`、相关配置测试 |
| 改架构、数据流、核心类型 | `Architecture.md`、`Technical-Design.md` |
| 改配置字段或新增内容流程 | `Configuration-Guide.md`、`Technical-Design.md` |
| 改 UI/交互/玩家可见规则 | `GDD-PathForgeTD.md`、`Gameplay-Guide.md`、`UI-Art-Guide.md`、`README.md` |
| 改自动化测试、手测或浏览器验证流程 | `Testing-Guide.md`、`Release-Checklist.md` |
| 改开发流程、验收标准 | `Development-Plan.md`、`Release-Checklist.md`、`CONTRIBUTING.md` |
| 发现高频问题或排障步骤变化 | `Troubleshooting.md` |
| 发布版本 | `CHANGELOG.md`、`Release-Checklist.md` |

## 当前实现快照

| 项 | 当前状态 |
| --- | --- |
| 游戏形态 | 网页 Canvas 迷宫式塔防 |
| 技术栈 | TypeScript + Vite + Canvas 2D + Vitest |
| 关卡 | 24 个战役关卡 |
| 塔 | 8 种，均有定位、描述、特殊效果和用途说明 |
| 敌人 | 13 种，包含飞行、护甲、魔抗、支援、精英和 Boss |
| 成就 | 100 个条件化成就 |
| 核心系统 | `Game / Grid / Pathfinder / TowerManager / UIManager / WaveManager / SaveManager` |
| 验证 | `npm run test -- --run`、`npm run build` |

## 文档质量要求

- 当前功能要能在代码中找到对应实现。
- 计划功能必须明确标注为后续计划。
- 数量类信息要和配置文件一致，例如关卡数、塔数、敌人数、成就数。
- 不写大段过时伪代码；技术细节以当前类、类型和数据流为准。
- PRD/GDD 关注玩家体验和验收标准，Technical Design 关注实现约束和模块关系。
- README 和文档总览必须包含所有重要入口。
- 新文档必须说明维护规则或验收标准，不只描述现状。
