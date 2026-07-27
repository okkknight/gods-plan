# God's Plan 项目上下文

## 产品

本地单用户英语口语复习管理应用。当前使用 `docs/Modern_Family_S1E01-E24_Speaking_Course_MD/episodes/` 下的 24 篇课程，支持中文、英文标准版和 Cue Version。

## 当前状态

已完成可运行第一版：Next.js App Router、SQLite/Drizzle schema、课程 Markdown 转 JSON、seed/import、调度器、Today、Calendar、Course Reader、Library、完成/撤销/导入/归档接口。

最新任务状态：`已执行待验收`。已完成日期导航、品牌命名和课程路径兼容，最新验证已通过。

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

- 当前内容解析把每个 Markdown 的三种模式保存在三个对应 section 中，每个 section 保留完整内容；24 篇 Cue 已按各自 Spoken English 原文重建，明文按原文顺序保留，连续剧情句块约挖空 50%。
- 已为 S01E01 生成标准英文朗读音频；音频生成脚本使用 Fish Audio `s2.1-pro-free`、指定 `reference_id` 和本地缓存，部署前需自行管理音频文件与 SQLite 文件。
- 当前只支持英文模式下播放整篇音频，不包含逐段播放、跟读或字幕同步；批量生成其他课程前应先试听确认 S01E01 的声音和节奏。
- 已独立检查完成/撤销流程、移动端响应式结构、真实导入更新保留进度，以及今天/过去/未来日历行为。
- Today 页面底部提供前一天/后一天按钮；非今天日期只读，今天保持原有可操作任务。
- Today 及 Calendar Today 只渲染有内容的优先级分组；空的逾期/今日复习不会占位，新学或已完成内容会自动上移。
- Today 移除了标题下的激励性说明文案，页面只保留日期、进度和任务信息。
- 项目品牌为 `God's Plan`；课程 Markdown 当前位于 `docs/`，转换脚本兼容旧根目录路径。
