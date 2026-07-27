# Godsplan 项目上下文

## 产品

本地单用户英语口语复习管理应用。当前使用 `Modern_Family_S1E01-E24_Speaking_Course_MD/episodes/` 下的 24 篇课程，支持中文、英文标准版和 Cue Version。

## 当前状态

已完成可运行第一版：Next.js App Router、SQLite/Drizzle schema、课程 Markdown 转 JSON、seed/import、调度器、Today、Calendar、Course Reader、Library、完成/撤销/导入/归档接口。

最新任务状态：`已执行待验收`。独立 reviewer 尚未完成验证。

## 关键规则

- 复习偏移：`0 / 1 / 3 / 7 / 15 / 30`；延期后从实际完成日期计算。
- 每门课程只保存当前阶段；每天最多解锁一篇新课。
- 只有当天任务可完成或撤销；未来计划不写数据库。
- SQLite 默认路径：`data/english-learning.db`；时区：`Asia/Shanghai`。

## 关键文件

- `src/domain/scheduling/`：纯调度逻辑。
- `src/domain/courses/`：Zod schema、Markdown parser、导入事务。
- `src/db/`：Drizzle schema、SQLite client、迁移。
- `src/services/`：dashboard、calendar、course、study 服务。
- `src/app/`：四个页面和写操作 API。
- `content/courses/`：24 篇标准 JSON。
- `tests/unit/`、`tests/e2e/`：调度/解析和核心浏览器流程。

## 验证命令

```bash
npm run course:convert
npm run db:migrate
npm run db:seed
npm run lint
npm run test:run
npm run test:e2e
npm run build
```

## 风险与后续

- 当前内容解析把每个 Markdown 的三种模式保存在三个对应 section 中，每个 section 保留完整内容；后续若需要逐段 Cue 对齐，应升级导入格式和 UI。
- 无账号、云同步、备份、音频和 AI 功能，部署前需自行管理 SQLite 文件。
- 需 reviewer 独立检查并确认完成/撤销并发边界、移动端布局和真实导入更新行为。
