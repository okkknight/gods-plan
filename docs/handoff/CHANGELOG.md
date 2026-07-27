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
- 移除 Today 标题下的说明性激励文案，新增产品文案反向 e2e 验证。

## 2026-07-27 audio pilot

- 新增 Fish Audio 分段生成脚本 `npm run audio:generate -- --course <slug>`，使用 `s2.1-pro-free`、可恢复缓存、WAV 拼接和全局响度处理。
- 使用 `reference_id=933563129e564b19a115bedd57b7406a` 生成 S01E01 Pilot，共 12 段，输出约 2 分 19 秒的 `public/audio/courses/modern-family-s01e01/english.wav` 及 manifest。
- Course Reader 切换到英文模式后显示整篇音频播放控件；未生成音频的课程不显示控件。
- 已验证 `npm run lint`、`npm run test:run`、`npm run build`、浏览器页面切换和音频 Range 206。

## 2026-07-27 audio pilot reviewer verification

- 独立 reviewer 复核通过：在最新 production build 的 `next start -p 3001` 上确认 S01E01 页面包含音频资源，未生成音频的 S01E02 不显示该资源。
- 独立确认音频请求返回 `206 Partial Content`、`Content-Range: bytes 0-99/...`，`npm run lint`、11 个单元测试和 `npm run build` 均通过。
- 结论：本次第一篇整篇英文播放功能 PASS；逐段播放、跟读、字幕同步和其他课程批量音频仍不在本次范围内。

## 2026-07-27 audio control refinement

- 移除英文模式播放条旁的“英文朗读”说明文字和卡片容器，保留简约的原生播放条。
- 重新构建并在 production server 上确认英文模式仍可显示播放条。

## 2026-07-27 audio performance refinement

- 第一篇英文朗读改用 Fish Audio S2 方括号自动语气标签，按开场、转场、反思和轻微幽默内容稀疏添加自然语言提示。
- 所有分段的 Fish `prosody.speed` 调整为 `0.95`，并略微提高表达采样参数；S01E01 需要重新试听确认。
- 在保持 `speed=0.95` 的基础上增强 S01E01 的段落级情绪变化，使用 `auto-tags-v3`，提高 temperature/top-p，并为 12 个段落提供不同的叙事方向。
- 进一步将标签调整为连续的“讲故事的人”风格，减少角色化情绪，使用 `storyteller-v4`；语速保持 `0.95`，采样参数回调为 temperature `0.78` / top-p `0.82`。
- 在连续叙述风格上增加温度和现场感，使用 `warm-storyteller-v5`，加入更温暖、活泼、亲和的叙述提示，并将 Fish prosody volume 调至 `1`。
- 生成 `warm-storyteller-v6` 试听版，唯一调整为 Fish `prosody.speed=0.90`，其余叙述参数保持不变。

## 2026-07-27 dev/build isolation fix

- 开发环境改用独立 `.next-dev` 输出目录，production build 继续使用 `.next`，避免构建时覆盖正在运行的 dev server 分片。
- 此修复针对页面 500 的运行环境问题，不改变课程页面或音频逻辑。
