# 乔布斯斯坦福毕业演讲：拆课草案

状态：已获取原声、生成五课中文/英文/Cue 和原声 MP3，并于 2026-10-16 发布到 VPS（课程 25–29）。自动时间轴待人工试听精校。

正文来源：https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says

官方原声视频：https://www.youtube.com/watch?v=UF8uR6Z6KLc

分析日期：2026-10-16。

## 暂定拆分

| 课次 | 主题 | 词数 | 原文句序号（含首尾） |
| --- | --- | --- | --- |
| 1 | 辍学与选择 | 469 | 1–35 |
| 2 | 好奇心与人生连线 | 433 | 36–65 |
| 3 | 失去与重新开始 | 463 | 66–96 |
| 4 | 面对死亡 | 468 | 97–123 |
| 5 | 时间与人生忠告 | 428 | 124–161 |

总计 2261 词。数字、英文单词计入词数，词内撇号与连字符不拆词；破折号分词。使用英文句子分段识别，保留原文顺序，不删减、不重复，优先在原文段落边界拆课。标题表示主要内容，跨课处可能包含话题引入。

这些词数针对官网讲稿。整段录音已进行 Whisper tiny.en 自动转写与全文词序比对，参考词匹配率为 98.23%，不代表人工逐字校对。保留官方拼写（如 Reed、Stewart），不把识别模型的同音误拼写回正文。逐段起点取自录音识别词的时间戳，没有按总时长均分。拆分草案的时间字段保留原始 null；实际切片时间见 `preparation-report.json` 与各课 manifest。

## 已确认的素材障碍

本机访问官方 YouTube 视频时返回登录/人机验证要求；斯坦福视频制作页也嵌入同一视频。本机 Downloads 中未找到名称匹配的原声素材。未读取浏览器登录凭据，也未获取来历不明的转载音频。

后续搜索已找到两个公开直链并成功下载：9696 学习站版本约 14 分 7 秒、128 kbps；Best Graduation Speeches 播客版本约 15 分 5 秒、112 kbps。来源、下载地址、文件属性与 SHA-256 见 `audio-sources.json`。文件保存在被 Git 忽略的本地 `data/audio-cache/steve-jobs-stanford-2005/`。

无需用户补交文件。首尾识别抽查确认 9696 版本直接进入演讲，并保留结尾致谢；播客版本额外带有 Stanford 片头与掌声。选用 9696 版本作为本地制作底稿。公开下载链接不等于已确认转载许可。

## 本地预览与复现

- 五课原声区间分别为：0–176.4、176.4–345.6、345.6–491.84、491.84–673.2、673.2–847.117 秒。
- 原声切片连续、不重排；课内共 49 个段落，支持点击跳段、当前段循环与三档变速。
  此处为 2026-10-16 首发数据；2026-10-28 的背诵分段优化见文末，当前线上版本为 83 段。
- 音频输出统一为 96 kbps 单声道 MP3，总计约 10 MB。
- `npm run course:prepare:stanford` 使用本地原声及 `words.json` 重建成品，不调用 TTS，不操作数据库。
- `npm run course:import:stanford` 先通过 SQLite backup 备份，再追加缺少的课程；已存在的同 slug 课程跳过，不覆盖。导入前后比较全部学习进度与学习事件摘要，变化时事务回滚。
- `npm run audio:validate` 已覆盖新系列，无需 Modern Family 前缀。
- 本地原始素材与识别模型位于被忽略的缓存目录；正式课程 JSON、MP3 与 manifest 位于现有课程生产路径。

## 后续接入

以下生成、导入和页面接入步骤已完成并部署。待办为人工试听精校。

1. 以原声校对英文，复核每课 400–500 词，微调完整句切点。
2. 根据实际音频标注起止时间，试听每课与课内段落切点。
3. 生成中文、英文、Cue 三个对齐学习版本。
4. 输出每课独立的 96 kbps 单声道 english.mp3 和课内段落 manifest。
5. 复用现有 JSON 课程导入；新系列不需要改数据库结构。适配课程编号展示及音频校验器中的 modern-family 前缀限制。
6. 验证逐段播放、循环和变速，再追加新课；保留现有学习数据。

后续重点是人工试听切点与校对自动识别未完全匹配的措辞。第三方录音的公开下载可用性本身不代表转载许可；来源信息保留在 `audio-sources.json`。

## VPS 发布验收（2026-10-16）

- 发布构建：`1zLKEnX5RR_i52M9ZfRzm`；服务启动时间 17:44:34（Asia/Shanghai）。
- 在 VPS 现有数据库追加课程 25–29；未用本地数据库覆盖线上数据，未安装或修改线上依赖。
- 数据库备份：`/opt/boringmax/godsplan/data/english-learning.db.pre-stanford-2026-10-16T09-44-33-070Z`。
- 旧构建保留在 `/opt/boringmax/godsplan/.release-stanford-MM1qVCtQ/previous-next`。
- 既有课程、段落、4 条学习进度及 67 条学习事件的合并校验值前后一致：`146a05d2379419b873d0dcc7209bd4c77c2cb3b53763996280bfcc1512990328`。
- 五门课程公网页面均返回 200，播放器出现；五个 manifest 返回 200，五份 MP3 Range 请求均返回 `206 audio/mpeg` 和 1024 字节。
- 上传前后逐一验证十份音频/manifest 的 SHA-256。线上 `.next/cache` 与 `data/audio-cache` 均不存在。
- 入口：https://boringmax.com/godsplan/library；第一课：https://boringmax.com/godsplan/course/25。

## 本地验收

- 30 项单测、TypeScript 检查、带 `/godsplan` 前缀的生产构建均通过。
- 29 门课程音频校验通过，含原有 24 课和新增 5 课。
- Headless Chromium 实测课程库显示五课、课程 25–29 加载成功、五份原声均支持 Range 206。
- 点击段落后实际开始播放；当前段循环到结尾后回到该段起点；音频实际 playbackRate 可依次切换 1.25、0.75、1。
- 桌面 1280×900 与移动端 390×844 已检查，无横向溢出、无页面运行错误。临时截图保存于 `/tmp/godsplan-stanford-desktop.png` 与 `/tmp/godsplan-stanford-mobile.png`。
- SQLite 备份由导入脚本生成；导入前后全部 `course_progress` 与 `study_events` 的 SHA-256 一致。

## 2026-10-28：背诵分段优化（已发布）

首发版直接沿用讲稿段落，部分段落有 76–90 词，不适合逐段背诵。现在按完整句子、话题转折及因果/举例关系重新划分。

| 课次 | 原段数 | 新段数 | 最长段词数 |
| --- | --- | --- | --- |
| 1 | 11 | 17 | 39 |
| 2 | 8 | 16 | 40 |
| 3 | 11 | 17 | 38 |
| 4 | 9 | 18 | 42 |
| 5 | 10 | 15 | 40 |

- 总段数 49 → 83，平均约 27 词，中位播放时长约 9.72 秒。通常 20–35 词，个别完整句群保留至 40 词左右；42 词的单个完整句未从从句中间强行截断。
- 原第二课第二段的书法内容现在拆为 27、26、23 词三段，依次讲校园书法环境、旁听书法课、学习字体排版，对应原声时长约 12.49、8.36、9.60 秒。
- 保留原有五课划分、全部英文措辞和顺序。五份 MP3 的 SHA-256、播放时长、原声来源区间与初版完全一致，仅更新段落与 manifest 时间轴。
- 中文和 Cue 跟随新段落一一对应；单句段落也保留可点击的回忆填空。时间取自原有逐词识别锚点，仍标注为自动对齐。
- `recitation-plan.json` 保存人工审阅的句群划分及对应中文；`recitation-baseline-v1.json` 保存初版文本与 MP3 指纹；`recitation-report.json` 保存新版词数与时间统计。
- 生成：`npm run course:prepare:stanford -- --segments-only`；不重新编码或替换原声。
- 更新已有本地课程：`npm run course:update:stanford-segments`。先备份 SQLite，再只替换五课的章节段落；不改变课程 ID、状态、所属组、当前组选择及学习记录。
- 本地数据库备份：`data/english-learning.db.pre-stanford-resegmentation-2026-10-28T01-06-11-091Z`。发布时应同样针对线上五课更新段落和 manifest，不覆盖整库、不重新上传 MP3。
- 39 项单测、类型检查和五份音频/manifest 连续时间轴校验通过。
- 已发布至 VPS，仅替换五课的段落及 manifest；没有发布构建或重新上传 MP3。
- 线上数据库备份：`/opt/boringmax/godsplan/data/english-learning.db.pre-stanford-recite-2026-10-28T01-11-55-204Z`。原 manifest 与校验记录保存在 `/opt/boringmax/godsplan/.release-stanford-recite-zs0iCg/`。
- 发布前后课程元数据、章节元数据、课程组选择、5 条学习进度、69 条学习事件、其他课程全部段落的校验值一致。当前学习组仍为乔布斯演讲，第一课仍保持学习中状态。
- 五个 manifest 均返回 200，五份原声 MP3 均支持 Range 206；原声文件校验值与初版一致。
