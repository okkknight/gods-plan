# God's Plan

God's Plan 是本地单用户英语口语学习与复习管理应用。当前已导入《Modern Family》S01E01–S01E24 共 24 篇课程，支持中文、英文标准版和 Cue Version。

## 许可

应用代码采用 [MIT 许可证](LICENSE)。仓库中 `docs/ModernFamily S01/`、`docs/Modern_Family_S1E01-E24_Revised_Cue_Collection.md`、`content/courses/` 内的课程文本，以及 `public/audio/courses/` 内的课程音频和配套清单，采用 [Creative Commons Attribution 4.0 International（CC BY 4.0）](https://creativecommons.org/licenses/by/4.0/) 许可。转载或改编这些课程素材时请注明作者 Knight、附上许可链接，并标明所做修改。其他第三方依赖遵循各自的许可证。

本地环境变量文件和 `data/` 中的学习数据库不属于公开课程素材，已被 Git 忽略。

## 运行

```bash
npm install
npm run db:migrate
npm run course:convert
npm run db:seed
npm run dev
```

打开 <http://localhost:3000>。SQLite 默认位于 `data/english-learning.db`，可通过 `DATABASE_URL` 覆盖；业务时区默认为 `Asia/Shanghai`。

## 课程数据

原始课程位于 `docs/Modern_Family_S1E01-E24_Speaking_Course_MD/episodes/`（脚本也兼容项目根目录旧路径）。运行 `npm run course:convert` 会生成标准 JSON 到 `content/courses/`。单篇课程可以用以下命令校验或导入：

```bash
npm run course:validate -- content/courses/modern-family-s01e01.json
npm run course:import -- content/courses/modern-family-s01e01.json
npm run course:import -- content/courses/modern-family-s01e01.json --update
```

## 复习规则

阶段为首次学习、1–5 次复习，累计偏移为 `0 / 1 / 3 / 7 / 15 / 30` 天。延期完成后，下一阶段从实际完成日期计算。每门课程只保存当前待完成阶段；未来日期为预测，不写入数据库。只有今天的任务可以完成或撤销。

## 验证

```bash
npm run test:run
npm run build
```

当前版本不包含登录、云同步、录音、发音评分或 PWA。英文课程支持逐段 MP3 播放、字幕同步和点击跳段；Fish Audio 仅用于本地课程音频生产，不在用户端实时生成。

## VPS 部署

VPS 部署必须遵守 [VPS 部署约定](docs/VPS_DEPLOYMENT.md)：只同步 `.next`、`public`、生产数据库和必要的运行依赖，不要把整个项目目录或课程生产缓存同步到 VPS。
