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
