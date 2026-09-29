# God's Plan

一套口语素材，学过一次不等于会用。God's Plan 用《Modern Family》第一季 24 集对白做成一条可持续的学习和复习路线，让自然表达不是听过就忘，而是隔几天再回来，慢慢变成自己的语言。

每天打开 Today，只做眼前该做的事：学一篇新课，或复习几篇已经学过的。进入课程后，先用中文看懂场景，再切到英文和 Cue 填空跟着逐段音频走；完成之后，系统会按实际完成日期安排下一次出现。

**[现在开始学习 →](https://boringmax.com/godsplan/)**

## 你会怎么用它

今天的页面只放需要做的事：一篇新课，或者几篇该复习的旧课。进入课程后可以：

- 跟着逐段音频读，对照正在播放的字幕；
- 在中文、完整英文和 Cue 填空之间来回切换；
- 点任意一句跳到对应位置，或者循环听一篇课；
- 完成后让系统安排下一次复习。

复习节奏是 `1 / 3 / 7 / 15 / 30` 天。它按你的实际完成日往后排，今天没学完也不会把任务堆成压力。

## 本地运行

仓库带着课程文本和音频，装好 Node.js 后就能在本地建立一套自己的学习记录：

```bash
npm install
npm run db:migrate
npm run course:convert
npm run db:seed
npm run dev
```

打开 <http://localhost:3000>。学习记录保存在本地 SQLite；默认路径是 `data/english-learning.db`。

## 课程与项目结构

想加自己的课程，可以从 `content/courses/` 看课程 JSON 的样子。课程文本、音频和时间轴需要一起维护，具体流程在 [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md)。部署到自己的服务器时再看 [VPS 文档](docs/VPS_DEPLOYMENT.md)。

## 许可

应用代码采用 [MIT 许可证](LICENSE)。仓库中 `docs/ModernFamily S01/`、`docs/Modern_Family_S1E01-E24_Revised_Cue_Collection.md`、`content/courses/` 的课程文本，以及 `public/audio/courses/` 的音频和配套清单，采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)：再利用时请注明作者 Knight、附上许可链接并说明修改。第三方依赖遵循各自的许可证。学习数据库和本地环境变量不属于公开课程素材。
