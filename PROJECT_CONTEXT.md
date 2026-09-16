# God's Plan 项目交接

最后核验：2026-09-16。此文件是项目现状的唯一交接入口；历史变化见 [docs/handoff/CHANGELOG.md](docs/handoff/CHANGELOG.md)，部署细节见 [docs/VPS_DEPLOYMENT.md](docs/VPS_DEPLOYMENT.md)。

## 产品边界

God's Plan 是单用户英语口语学习与复习 Web 应用。当前课程是《Modern Family》S01E01–E24，支持：

- Today、日历、课程库和课程阅读；
- 中文、英文、Cue 填空版；
- 基于实际完成日计算的 `0 / 1 / 3 / 7 / 15 / 30` 天复习；每天最多展示 3 条复习；
- 英文逐段字幕、点击跳段、单篇/循环播放；
- 24 集 96 kbps 单声道 MP3。

它不是多用户产品：没有登录、云同步、录音、发音评分或离线/PWA 支持。

## 当前状态

- 最新产品任务：S01E09–E24 按三份合并源文档更新内容，并将所有课程线上音频迁移为 MP3；**验收通过**。
- 2026-09-16 本地核验：24 门课程均有 `english.mp3`，manifest 指向 MP3，未发现 WAV；`npm run test:run`（21 项）与 `NEXT_PUBLIC_BASE_PATH=/godsplan npm run build` 均通过。
- 2026-09-16 VPS 核验：`godsplan.service` 为 `active`，24 个 MP3、0 个 WAV；课程页返回 200，MP3 Range 请求返回 `206 audio/mpeg`。
- 最近提交：`95eb860 docs: add updated course sources for episodes 9 to 24`；上一提交 `0959058 feat: deliver course audio as mp3`。

## 结构与数据流

```text
Next.js 页面 (src/app, src/components)
        ↓
服务层 (src/services) → SQLite / Drizzle (src/db)
        ↓
课程 JSON (content/courses) → 导入/定向更新 → courses / sections / paragraphs

Fish Audio → 本地 WAV 分段合成 → 96 kbps MP3 + manifest → public/audio/courses
```

- 用户学习数据在 `data/english-learning.db`：`course_progress` 和 `study_events` 不得被课程内容更新覆盖。
- 阅读页用 `src/services/course-audio-service.ts` 获取音频；优先 `english.mp3`，仅为旧资源回退到 `english.wav`。
- `manifest.json` 提供播放、逐段字幕和点击跳段所需的 `start` / `end` / `duration`。音频文件存在但 manifest 时间轴无效时，播放工作台不会可靠工作。

## 快速定位

- 页面与交互：`src/app/`、`src/components/course-reader.tsx`、`src/components/reader-workbench.tsx`
- 复习规则：`src/domain/scheduling/`、`src/services/study-service.ts`
- 课程导入与格式：`src/domain/courses/`、`scripts/import-course.ts`
- 音频生成与校验：`scripts/generate-course-audio.ts`、`scripts/convert-course-audio-to-mp3.ts`、`scripts/validate-audio-assets.ts`
- S01E09–E24 定向源与更新脚本：`docs/ModernFamily S01/Combined_*_E09-E24.md`、`scripts/apply-combined-course-updates.ts`
- VPS 运行边界：[docs/VPS_DEPLOYMENT.md](docs/VPS_DEPLOYMENT.md)

## 常用验证与操作

```bash
npm run test:run
npm run lint
NEXT_PUBLIC_BASE_PATH=/godsplan npm run build
npm run audio:validate

# 仅更新 E09–E24 的课程 JSON；再按需 --update 导入到目标数据库
npm run course:apply-combined

# 生成新课程音频；线上交付格式已固定为 96 kbps MP3
npm run audio:generate -- --course modern-family-s01e01
```

课程内容更新到已有数据库时，只更新目标课程的 sections/paragraphs；更新前后比较 `course_progress` 与 `study_events`，确认学习进度未变。

## 线上运行与部署

- URL：`https://boringmax.com/godsplan/`
- VPS：`ubuntu@43.172.79.177`，应用目录 `/opt/boringmax/godsplan`，服务 `godsplan.service`，监听 `127.0.0.1:3013`。
- SSH、文件所有者和服务账户均为 `ubuntu`。重启服务必须使用 `sudo -n systemctl restart godsplan.service`，直接 `systemctl` 会要求交互认证。
- 只上传生产运行物：`.next/`、`public/`、必要时数据库和 `package.json`。不要上传 `content/`、`docs/`、`scripts/`、测试、Fish 缓存、`.env.local` 或本机 `node_modules`。
- 大批量音频 rsync 可能超出命令窗口并留下混合格式；按小批次同步，确认 MP3/WAV 数量后再重启服务。

## 工作规则与风险

- Fish Audio 密钥只放本地 `.env.local`，不得提交、上传或写入交接文档。
- 课程源文件是用户给定内容；不要自行改写。Cue 更新需与英文原文逐一对齐。
- 音频生成参数里的 `speed` 不是最终时长保证；发现个别段落节奏异常时，只重生成目标段落/课程并重新校验 manifest。
- 内容更新、音频更新和前端更新都可能影响阅读页；每次上线至少检查课程页、manifest、MP3 Range 206 和服务状态。
- 目前没有待决产品方案；下一次改动前先确认目标是课程数据、音频、调度逻辑还是界面，避免误触学习数据。
