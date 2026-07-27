# God's Plan

God's Plan 是本地单用户英语口语学习与复习管理应用。当前已导入《Modern Family》S01E01–S01E24 共 24 篇课程，支持中文、英文标准版和 Cue Version。

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

当前版本不包含登录、云同步、AI 生成、音频播放、录音、发音评分或 PWA。
