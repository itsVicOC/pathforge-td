# PathForge TD Troubleshooting

本文档记录本地开发、构建、测试、浏览器运行和存档调试中的常见问题。

## 1. 安装依赖失败

现象：

- `npm install` 报网络、锁文件或 Node 版本错误。

处理：

1. 确认 Node.js 20 或兼容版本。
2. 确认当前目录是仓库根目录。
3. 删除损坏的本地安装产物后重新安装：

```bash
rm -rf node_modules
npm install
```

不要手动编辑 `package-lock.json` 来绕过依赖错误。

## 2. 开发服务器打不开

现象：

- `npm run dev` 启动失败。
- 浏览器打不开本地页面。
- 端口 `5173` 被占用。

处理：

```bash
npm run dev -- --host 127.0.0.1
```

如果端口被占用，Vite 通常会提示可用端口。也可以指定端口：

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

## 3. 页面空白或 Canvas 不显示

检查：

- 浏览器控制台是否有红色错误。
- `src/main.ts` 是否成功找到 `#game-canvas`。
- `index.html` 中 Canvas 尺寸是否仍和 `GAME_CONFIG` 匹配。
- 是否处于菜单阶段，菜单阶段 Canvas 会被清屏，DOM 菜单应显示。

建议先运行：

```bash
npm run build
```

TypeScript 错误通常会解释空白原因。

## 4. 点击位置和格子不一致

可能原因：

- Canvas CSS 缩放后 `InputManager.updateScale()` 未收到正确尺寸。
- 修改了 Canvas 内部宽高或 CSS 宽高，但没有同步格子尺寸。
- 页面布局让 Canvas 出现非预期边距或滚动。

检查点：

- `InputManager.getPixelPosition()` 使用 `getBoundingClientRect()`。
- 网格坐标通过 `Math.floor(pixel / 32)` 计算。
- 如果修改 `TILE_SIZE` 或 Canvas 尺寸，需要同步渲染、输入和配置。

## 5. 放塔失败但看不出原因

常见原因：

- 金币不足。
- 点击了道路、水、障碍、熔岩、出生点或核心。
- 目标格已有塔。
- 放塔会堵死某个入口到所有核心的路径。

调试建议：

- 在 `TowerManager.failPlacement(reason)` 附近临时查看 reason。
- 确认 UI 仍保留塔选择和说明面板。
- 用 `Pathfinder.validatePlacement(x, y)` 单独写测试覆盖该位置。

## 6. 放塔后 UI 消失

这是高优先级回归。检查：

- `UIManager.handleClick()` 是否错误消费或清空了关键状态。
- `Game.handleClick()` 中成功/失败放塔后是否调用了 `state.selectTower(undefined)`。
- `tower:placementFailed` 事件监听是否清空了塔说明。
- Canvas 渲染层是否覆盖了 HUD 或底部塔栏。
- DOM 菜单是否错误显示并遮住 Canvas。

验收标准：

- 成功放塔后 HUD、塔栏、塔说明仍可见。
- 失败放塔后选中塔仍保持。
- 鼠标在 UI 上时地图不会误触发放塔。

## 7. 敌人路径异常或地图像在移动

检查：

- `GridCell.x/y` 运行中是否被改写。
- 放塔是否只写 `towerId`，没有改 `type`。
- 路径预览是否只绘制路线，没有修改关卡 `grid`。
- `Pathfinder.invalidate()` 是否在放塔、出售后调用。
- 地图布局是否存在大面积 `buildable` 让寻路看起来漂移。

必要测试：

- 多入口关卡每个入口都有可达路径。
- 反复放塔和出售后路径仍稳定。
- 非法堵路位置不能放塔。

## 8. 设置页错位

检查：

- 设置面板是否有固定最大宽度和可滚动区域。
- 标签、输入控件和值文本是否使用同一行布局。
- 小窗口下是否有换行规则。
- 是否新增了按钮但未添加统一样式。

手测：

- 打开主菜单的设置页。
- 调整音量、画质、路径预览和粒子开关。
- 缩小窗口，确认控件不互相覆盖。
- 点击重置，确认 UI 和存档都恢复默认。

## 9. 测试失败

优先定位：

```bash
npm run test -- --run
```

如果是配置测试失败：

- 检查新增 ID 是否唯一。
- 检查波次是否引用不存在的敌人。
- 检查塔说明字段是否缺失。
- 检查关卡尺寸、入口、核心和路径可达性。

如果是寻路或放塔测试失败：

- 检查 `Grid.isWalkable()` 和 `Grid.isBuildable()`。
- 检查地形成本是否让路径不可达。
- 检查临时 `towerId` 是否被清理。

## 10. 构建失败

`npm run build` 会先运行 `tsc`，再运行 `vite build`。

常见原因：

- 新增配置字段和类型不一致。
- 新增模块路径大小写错误。
- 引用了浏览器外不可用的全局对象。
- 修改 `SaveData` 后没有更新迁移和默认值。

修复后重新运行构建，不要只依赖开发服务器热更新。

## 11. 存档调试

存档键名：

```text
pathforge_save
```

在浏览器控制台查看：

```js
JSON.parse(localStorage.getItem('pathforge_save') ?? '{}')
```

清空存档：

```js
localStorage.removeItem('pathforge_save')
location.reload()
```

如果改了存档结构，必须更新 `SaveManager.migrate()`，并手动测试旧存档。

## 12. 发布前发现问题

发布前如果出现 UI、寻路、存档或配置回归：

1. 先记录复现关卡、波次、操作和浏览器。
2. 写最小自动化测试锁住问题。
3. 修复后跑 `npm run test -- --run` 和 `npm run build`。
4. 更新 [Release Checklist](Release-Checklist.md) 的对应检查项。
