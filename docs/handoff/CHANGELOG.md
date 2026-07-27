# Changelog

## 2026-07-27

- 初始化 Next.js + TypeScript 项目和 SQLite/Drizzle 数据层。
- 将 24 篇 Modern Family Markdown 转换为标准 JSON 并 seed。
- 实现复习调度、未来预测、完成/撤销、课程导入更新和归档。
- 实现 Today、Calendar、Course Reader、Library 页面。
- 增加 9 个单元测试和 2 个 Playwright 核心流程测试。

## 2026-07-27 reviewer verification

- 验收通过：`npm run lint`、9 个单元测试、2 个 Playwright 测试和 `npm run build` 均通过。
- 独立验证数据库包含 24 门课程、72 个 section、72 个 paragraph，默认数据无残留学习事件。
- 临时 SQLite 验证更新模式会保留已有 progress、due date 和 study event。
- 浏览器验证今天日历展示完整任务分组，课程库提供新建/更新导入模式。

## 2026-07-27 latest update

- Today 页面底部新增前一天/后一天日期按钮，支持过去记录、今天任务和未来预测切换。
- 统一项目名称为 `God's Plan`，同步页面标题、README 和 npm 包名。
- 兼容课程 Markdown 移至 `docs/` 后的路径，新增日期导航 e2e 测试。
- 隐藏 Today 与 Calendar Today 的空优先级分组，新增空分组上移 e2e 验证。
