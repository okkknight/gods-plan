# 英语口语复习管理应用｜产品设计与实现说明

> 文档用途：交给 Codex 直接搭建项目。  
> 当前阶段目标：完成课程管理、每日学习计划、复习调度、历史/未来日期查看和三种课程阅读模式。  
> 当前阶段不实现 AI 课程生成，只预留标准 JSON 导入能力。

---

## 1. 产品概述

这是一个个人自用的英语口语学习管理应用。

用户每天学习一篇英语口语材料，并按照固定复习曲线进行重复练习。应用负责自动计算：

- 今天需要首次学习哪一篇课程；
- 今天需要复习哪些已学课程；
- 哪些复习任务已经逾期；
- 用户完成当前阶段后，下一次复习应安排在哪一天；
- 用户漏学或漏复习后，后续复习计划如何自动顺延。

课程内容主要是《摩登家庭》每集剧情的口语化描述，包含三种对应版本：

1. 中文版本；
2. 英文标准版本；
3. Cue Version。

用户每天打开应用后，应立即知道今天需要学习和复习什么，不再手动维护复习计划。

---

## 2. 核心产品原则

### 2.1 计划由实际完成时间驱动

复习计划不能只根据课程最初的学习日期固定生成。

用户在某一阶段延期完成后，后续复习节点必须以该阶段的实际完成日期为基础重新计算。

例如复习曲线为：

```text
第 0 天：首次学习
第 1 天：第一次复习
第 3 天：第二次复习
第 7 天：第三次复习
第 15 天：第四次复习
第 30 天：第五次复习
```

对应累计偏移量：

```ts
const REVIEW_OFFSETS = [0, 1, 3, 7, 15, 30];
```

对应阶段间隔：

```ts
const REVIEW_INTERVALS = [1, 2, 4, 8, 15];
```

如果第一次复习原定 7 月 2 日，但用户到 7 月 4 日才完成，那么第二次复习应安排在：

```text
7 月 4 日 + 2 天 = 7 月 6 日
```

第三次复习日期暂不需要提前生成。只有第二次复习完成后，再计算第三次复习日期。

### 2.2 一门课程同时只有一个待完成阶段

不要提前在数据库中生成一门课程未来所有复习任务。

每门已开始课程只需保存：

- 当前待完成阶段；
- 当前阶段应完成日期；
- 上一次实际完成日期；
- 是否已经完成全部复习周期。

这样可以避免延期后批量修改未来任务。

### 2.3 新课与复习任务分开处理

新课按照课程顺序依次解锁。

规则：

- 每天最多安排一篇新课；
- 当前新课未完成时，不解锁下一篇新课；
- 未完成的新课第二天继续作为当前新课；
- 新课阻塞只影响下一篇新课，不影响其他课程正常进入复习队列；
- 多篇复习任务可以在同一天同时出现。

### 2.4 不完成，不写完成记录

用户当天没有完成某项学习或复习任务时：

- 不创建完成事件；
- 不修改当前阶段；
- 不修改应完成日期；
- 第二天该任务自动变为逾期任务。

不需要后台定时任务，也不需要每天批量移动日期。

---

## 3. 当前版本范围

### 3.1 必须实现

- 查看今日新课；
- 查看今日到期复习；
- 查看逾期复习；
- 进入课程学习页面；
- 在中文、英文、Cue 三种模式之间切换；
- 仅在当天标记任务完成；
- 当天完成后可以撤销；
- 查看任意过去日期的真实学习记录；
- 查看任意未来日期的预计计划；
- 非当天页面不能标记完成；
- 课程列表管理；
- 通过标准 JSON 文件导入课程；
- 重复导入时可以选择更新课程内容；
- 更新课程内容时不破坏已有学习进度；
- 使用 SQLite 保存数据；
- 适配桌面端和手机浏览器。

### 3.2 当前版本明确不实现

- AI 自动生成课程；
- 应用内调用任何大模型 API；
- 用户注册与登录；
- 密码保护；
- 多用户系统；
- 云同步；
- PWA；
- 离线模式；
- Docker；
- Nginx；
- 自动备份；
- 语音识别；
- 发音评分；
- 录音；
- 音频播放；
- 单词本；
- 签到、积分、连续学习天数；
- 社交功能；
- 复杂统计图表；
- 自定义复习曲线界面；
- 删除或修改过去完成记录的管理后台。

---

## 4. 推荐技术栈

```text
Next.js App Router
TypeScript
Tailwind CSS
SQLite
Drizzle ORM
better-sqlite3
Zod
date-fns
Vitest
Playwright
```

要求：

- 使用 Next.js App Router；
- 业务逻辑必须使用 TypeScript；
- 数据库使用本地 SQLite 文件；
- ORM 使用 Drizzle；
- JSON 导入使用 Zod 验证；
- 日期计算使用 `date-fns` 或等价可靠日期库；
- 不要使用 JavaScript `Date` 的隐式 UTC 转换保存业务日期；
- 单元测试重点覆盖调度器；
- 端到端测试覆盖关键用户流程。

---

## 5. 页面结构

应用包含四个主要页面。

```text
/today
/calendar
/course/[id]
/library
```

可以增加根路由：

```text
/
```

根路由直接跳转到 `/today`。

---

## 6. 全局导航

桌面端可以使用顶部导航栏。

手机端可以使用底部导航栏。

导航项：

```text
今日
日历
课程库
```

课程学习页可以隐藏底部导航，保留返回按钮，减少干扰。

---

## 7. Today 页面

路径：

```text
/today
```

### 7.1 页面目标

用户打开后立即知道今天要做什么。

页面不要做成复杂仪表盘。

### 7.2 页面内容顺序

```text
日期与星期
今日整体进度
逾期复习
今日复习
今日新学
今日已完成
```

### 7.3 示例

```text
2026 年 7 月 27 日
星期一

今日进度
1 / 4 已完成

逾期复习
- S01E03 第一次复习，逾期 1 天

今日复习
- S01E01 第五次复习
- S01E05 第二次复习

今日新学
- S01E08 首次学习

今日已完成
- S01E04 第三次复习
```

### 7.4 任务卡片字段

每张任务卡片显示：

- 课程编号；
- 课程标题；
- 当前阶段；
- 应完成日期；
- 状态；
- 开始练习按钮。

状态可能为：

```text
逾期 3 天
今天到期
今日新课
今天已完成
```

### 7.5 排序规则

逾期复习：

```text
应完成日期越早，排序越靠前
```

今日复习：

```text
课程顺序从早到晚
```

今日新课：

```text
始终最多一篇
```

今日已完成：

```text
按完成时间倒序
```

### 7.6 空状态

没有任何课程时：

```text
课程库中还没有课程，请先导入课程。
```

当天全部完成时：

```text
今天的学习任务已经全部完成。
```

不显示夸张激励、积分或连续签到信息。

---

## 8. Calendar 页面

路径：

```text
/calendar
```

### 8.1 页面目标

允许用户选择任意日期，查看当天计划或真实记录。

### 8.2 默认日期

默认选中今天。

### 8.3 日期类型

#### 过去日期

显示那一天真实发生的学习记录。

包括：

- 实际完成了哪些课程；
- 完成的是首次学习还是第几次复习；
- 原计划日期；
- 实际完成日期；
- 是否属于逾期完成。

过去日期不能标记完成，也不能撤销。

#### 今天

显示与 `/today` 相同的任务数据。

可以进入课程并标记完成。

#### 未来日期

显示基于当前进度推算出的预计计划。

必须显示提示：

```text
以下为基于当前学习进度生成的预计计划。
如果当前任务延期完成，未来安排会自动变化。
```

未来日期不能标记完成。

### 8.4 日历展示方式

第一版可以使用：

- 月视图日期选择器；
- 下方显示选中日期任务列表。

日期格可显示简单圆点：

- 有预计或实际任务：一个圆点；
- 有实际完成记录：使用实心圆点；
- 有逾期未完成任务不需要回填到过去日期格。

不要做复杂热力图。

---

## 9. Course 学习页面

路径：

```text
/course/[id]
```

建议附带任务上下文参数：

```text
/course/[id]?stage=2&date=2026-07-27
```

但完成操作必须由服务端重新验证，不能只信任 URL 参数。

### 9.1 页面头部

显示：

- 返回按钮；
- 课程编号；
- 课程标题；
- 当前学习阶段；
- 模式切换。

模式：

```text
中文
英文
Cue
```

不实现全隐藏模式。

### 9.2 内容结构

课程内容由 section 和 paragraph 组成。

每个 section 可以显示标题。

模式切换时：

- 保持相同段落位置；
- 不跳回页面顶部；
- 不丢失当前滚动位置；
- 三个版本的段落必须一一对应。

### 9.3 完成按钮

只有在以下条件全部满足时显示可用的完成按钮：

- 当前查看日期是今天；
- 该课程今天确实存在可完成任务；
- 当前阶段与服务端记录一致；
- 今天尚未完成该阶段。

按钮文案：

```text
完成今天的学习
```

复习阶段可使用：

```text
完成本次复习
```

完成后：

- 写入 `study_events`；
- 更新 `course_progress`；
- 计算下一阶段日期；
- 如果全部阶段已完成，将课程状态设为 `completed`；
- 返回 Today 页面或原页面显示完成状态。

### 9.4 撤销完成

只允许撤销今天刚完成的任务。

撤销后必须恢复到完成前状态。

为了可靠支持撤销，`study_events` 应保存足够信息，或者撤销时根据事件前阶段重新计算。

推荐限制：

- 只能撤销该课程最新的一条完成记录；
- 该记录必须是今天创建；
- 撤销后删除该事件；
- 恢复 `currentStage`、`nextDueDate`、`lastCompletedDate` 和课程状态。

如果已经完成后续阶段，则不能撤销更早记录。但由于只允许撤销当天最新完成记录，正常情况下不会出现该问题。

---

## 10. Library 页面

路径：

```text
/library
```

### 10.1 页面功能

- 查看全部课程；
- 查看课程状态；
- 查看课程顺序；
- 查看当前复习阶段；
- 查看下一次到期日期；
- 导入课程 JSON；
- 更新已有课程内容；
- 进入课程预览；
- 手动归档课程；
- 取消归档。

第一版不要求实现拖拽排序。

课程顺序由 `orderIndex` 决定。

### 10.2 课程状态

```ts
type CourseStatus =
  | "queued"
  | "active"
  | "completed"
  | "archived";
```

解释：

- `queued`：尚未开始；
- `active`：已开始，仍处于复习周期；
- `completed`：已完成全部复习阶段；
- `archived`：不再参与新课和复习调度。

### 10.3 课程筛选

支持简单筛选：

```text
全部
待学习
学习中
已完成
已归档
```

### 10.4 课程编辑

第一版不需要复杂富文本编辑器。

可以实现一个简单表单，用于修改：

- 标题；
- 课程编号信息；
- `orderIndex`；
- section 标题；
- 中文段落；
- 英文段落；
- Cue 段落。

但 JSON 导入仍然是主要内容进入方式。

---

## 11. 复习阶段定义

统一使用以下阶段：

```ts
const STAGE_LABELS = [
  "首次学习",
  "第 1 次复习",
  "第 2 次复习",
  "第 3 次复习",
  "第 4 次复习",
  "第 5 次复习",
] as const;
```

阶段编号：

```text
0 = 首次学习
1 = 第 1 次复习
2 = 第 2 次复习
3 = 第 3 次复习
4 = 第 4 次复习
5 = 第 5 次复习
```

固定累计偏移：

```ts
const REVIEW_OFFSETS = [0, 1, 3, 7, 15, 30] as const;
```

固定阶段间隔：

```ts
const REVIEW_INTERVALS = [1, 2, 4, 8, 15] as const;
```

第一版不需要设置页面修改复习曲线，但常量必须集中定义，不能散落在不同组件和 API 中。

---

## 12. 调度规则

### 12.1 新课程选择

从所有满足以下条件的课程中选择：

```text
status = queued
且未归档
```

按 `orderIndex` 升序取第一篇。

只有当前不存在未完成的新课时，才能安排新的 queued 课程。

### 12.2 首次学习任务

首次学习任务的阶段为：

```text
stage = 0
```

首次学习完成后：

```text
currentStage = 1
lastCompletedDate = 今天
nextDueDate = 今天 + 1 天
status = active
```

### 12.3 复习任务到期判断

一门 active 课程满足以下条件时，进入待复习队列：

```text
nextDueDate <= 今天
```

进一步分类：

```text
nextDueDate < 今天  => 逾期复习
nextDueDate = 今天  => 今日复习
```

### 12.4 完成阶段后的下一日期

设完成前当前阶段为 `stage`。

完成后：

```ts
const nextStage = stage + 1;
```

如果 `nextStage` 超过最后阶段：

```text
课程状态变为 completed
nextDueDate = null
completedDate = 今天
```

否则：

```ts
const interval =
  REVIEW_OFFSETS[nextStage] - REVIEW_OFFSETS[stage];

nextDueDate = addDays(actualCompletedDate, interval);
currentStage = nextStage;
lastCompletedDate = actualCompletedDate;
```

### 12.5 同一天多项复习

同一天允许出现任意数量的复习任务。

完成其中一项不会影响其他课程。

### 12.6 同一天完成顺序

用户可以按任意顺序完成：

- 逾期复习；
- 今日复习；
- 今日新课。

应用不强制必须先复习再学新课。

### 12.7 一天内重复完成保护

同一门课程、同一阶段、同一天只能创建一次完成事件。

必须通过数据库唯一约束或事务内校验防止重复提交。

### 12.8 归档规则

归档后：

- 不再显示在 Today；
- 不参与未来计划；
- 保留已有内容和历史完成记录；
- 不删除学习进度。

取消归档后恢复原有状态和到期日期。

如果取消归档时任务已过期，立即显示为逾期任务。

---

## 13. 过去、今天与未来数据定义

### 13.1 过去日期显示事实

过去日期主要读取：

```text
study_events.completedDate = 选中日期
```

不要尝试根据当前状态反推出过去计划。

### 13.2 今天显示真实待办

今天读取：

- 当前未完成新课；
- `nextDueDate <= today` 的 active 课程；
- 今天的完成事件。

### 13.3 未来日期显示预测

未来计划不是数据库事实，需要通过当前进度模拟生成。

预测算法要求：

1. 复制当前所有课程进度到内存；
2. 假设所有当前和未来任务都在计划当天完成；
3. 按当前复习曲线逐日推算；
4. 新课按每天一篇依次加入；
5. 不写入数据库；
6. 返回指定未来日期预计发生的任务。

未来预测只用于展示，不作为完成依据。

### 13.4 预测范围

第一版建议限制未来查看范围：

```text
今天起未来 180 天
```

避免无意义地模拟过远日期。

---

## 14. 数据库设计

### 14.1 courses

```ts
{
  id: number;
  slug: string;
  series: string | null;
  season: number | null;
  episode: number | null;
  title: string;
  orderIndex: number;
  status: "queued" | "active" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}
```

约束：

- `slug` 唯一；
- `orderIndex` 建索引；
- `status` 建索引。

### 14.2 course_sections

```ts
{
  id: number;
  courseId: number;
  sectionKey: string;
  heading: string | null;
  orderIndex: number;
}
```

约束：

```text
(courseId, sectionKey) 唯一
(courseId, orderIndex) 建索引
```

### 14.3 course_paragraphs

```ts
{
  id: number;
  sectionId: number;
  paragraphKey: string;
  chinese: string;
  english: string;
  cue: string;
  orderIndex: number;
}
```

约束：

```text
(sectionId, paragraphKey) 唯一
(sectionId, orderIndex) 建索引
```

### 14.4 course_progress

```ts
{
  courseId: number;
  currentStage: number;
  nextDueDate: string | null;
  startedDate: string | null;
  lastCompletedDate: string | null;
  completedDate: string | null;
  updatedAt: string;
}
```

说明：

- 与 `courses` 一对一；
- queued 课程可以没有 progress 记录，也可以有空 progress 记录；
- 推荐在课程首次学习完成后创建 progress。

业务日期格式：

```text
YYYY-MM-DD
```

### 14.5 study_events

```ts
{
  id: number;
  courseId: number;
  stage: number;
  scheduledDate: string;
  completedDate: string;
  completedAt: string;
  createdAt: string;
}
```

字段说明：

- `scheduledDate`：该阶段原本应完成的日期；
- `completedDate`：用户实际标记完成的业务日期；
- `completedAt`：准确完成时间；
- `stage`：完成时的阶段编号。

约束建议：

```text
(courseId, stage) 唯一
```

因为每门课程每个阶段正常只会完成一次。

### 14.6 app_settings

第一版可以不创建设置页面。

可以使用单行配置表，也可以直接使用代码常量。

如果建表：

```ts
{
  id: number;
  timezone: string;
  dailyNewCourseLimit: number;
}
```

默认：

```text
timezone = Asia/Shanghai
dailyNewCourseLimit = 1
```

复习曲线第一版保留在代码常量中即可。

---

## 15. 日期与时区规则

### 15.1 业务日期

所有计划日期使用纯日期字符串：

```text
2026-07-27
```

不要把业务日期只保存为 UTC 时间戳。

### 15.2 默认时区

默认：

```text
Asia/Shanghai
```

项目中集中提供：

```ts
getTodayInAppTimezone()
```

所有页面、服务端操作和测试都调用同一个日期工具。

不要在不同模块直接使用：

```ts
new Date().toISOString().slice(0, 10)
```

因为这可能得到 UTC 日期，而不是用户当地日期。

### 15.3 完成时间

精确完成时间可以保存为 ISO 时间：

```text
2026-07-27T21:35:12+08:00
```

业务判断仍使用 `completedDate`。

---

## 16. 课程 JSON 格式

当前阶段不实现 AI 生成，但必须先定义稳定导入格式。

示例：

```json
{
  "schemaVersion": 1,
  "slug": "modern-family-s01e03",
  "series": "Modern Family",
  "season": 1,
  "episode": 3,
  "title": "Come Fly with Me",
  "orderIndex": 3,
  "sections": [
    {
      "id": "story-1",
      "heading": "Jay and Phil",
      "paragraphs": [
        {
          "id": "p1",
          "chinese": "这一集的第一条故事线围绕杰和菲尔展开。",
          "english": "The first storyline follows Jay and Phil.",
          "cue": "The first storyline follows **** and ****."
        },
        {
          "id": "p2",
          "chinese": "菲尔一直想和杰拉近关系。",
          "english": "Phil has always wanted to build a closer relationship with Jay.",
          "cue": "Phil has always wanted to **** a closer relationship with Jay."
        }
      ]
    }
  ]
}
```

### 16.1 必填字段

课程级：

```text
schemaVersion
slug
title
orderIndex
sections
```

section 级：

```text
id
paragraphs
```

paragraph 级：

```text
id
chinese
english
cue
```

### 16.2 可选字段

```text
series
season
episode
heading
```

### 16.3 验证规则

- `schemaVersion` 必须为 1；
- `slug` 只能包含小写字母、数字和连字符；
- `title` 不能为空；
- `orderIndex` 必须是非负整数；
- 至少有一个 section；
- 每个 section 至少有一个 paragraph；
- 同一课程内 section id 不能重复；
- 同一 section 内 paragraph id 不能重复；
- 中文、英文、Cue 均不能为空；
- Cue 不要求一定包含星号，但必须存在；
- season 和 episode 如果存在，必须为正整数。

---

## 17. 课程导入

### 17.1 导入入口

第一版至少实现 Library 页面文件上传导入。

可同时实现命令行脚本：

```bash
npm run course:validate -- path/to/course.json
npm run course:import -- path/to/course.json
npm run course:import -- path/to/course.json --update
```

命令行不是必须的 UI 功能，但对后续 Codex 批量生产课程很有用。

### 17.2 新课程导入

如果 slug 不存在：

- 创建 course；
- 创建 sections；
- 创建 paragraphs；
- status 设为 `queued`；
- 不创建学习完成记录。

### 17.3 重复课程

如果 slug 已存在，默认拒绝并返回：

```text
课程已存在。如需更新内容，请使用更新模式。
```

### 17.4 更新模式

更新模式只更新：

- 元数据；
- section；
- paragraph；
- `orderIndex`。

不得修改：

- status；
- course_progress；
- study_events；
- startedDate；
- completedDate；
- nextDueDate。

内容更新建议采用事务：

1. 更新 courses 元数据；
2. 删除该课程旧 sections 和 paragraphs；
3. 按新 JSON 重建内容；
4. 保留课程主表 ID；
5. 保留进度和历史事件。

### 17.5 导入原子性

整个导入必须在一个数据库事务中完成。

任何一步失败时全部回滚。

---

## 18. 服务端接口或 Server Actions

可以使用 Next.js Server Actions，也可以使用 Route Handlers。

建议核心业务逻辑独立放在 service 层，不要直接写进 React 组件。

建议能力：

```text
getTodayDashboard()
getTasksForDate(date)
getCourse(courseId)
getLibraryCourses(filters)
completeCourseStage(courseId, expectedStage)
undoTodayCompletion(courseId)
importCourse(json, mode)
archiveCourse(courseId)
unarchiveCourse(courseId)
```

所有写操作都必须在服务端重新校验当前状态。

---

## 19. 调度器模块

建议目录：

```text
src/domain/scheduling/
  constants.ts
  types.ts
  complete-stage.ts
  today-tasks.ts
  future-plan.ts
  date-utils.ts
```

### 19.1 调度器要求

- 纯 TypeScript；
- 不依赖 React；
- 尽量不直接依赖数据库；
- 输入普通对象；
- 输出普通对象；
- 易于单元测试；
- 不读取系统时间，时间由调用方传入。

### 19.2 完成阶段函数示意

```ts
type CompleteStageInput = {
  currentStage: number;
  completedDate: string;
};

type CompleteStageResult =
  | {
      type: "next-stage";
      nextStage: number;
      nextDueDate: string;
    }
  | {
      type: "course-completed";
      completedDate: string;
    };
```

### 19.3 Today 任务分类

```ts
type TodayTaskGroups = {
  overdueReviews: ReviewTask[];
  dueReviews: ReviewTask[];
  newCourse: NewCourseTask | null;
  completedToday: CompletedTask[];
};
```

---

## 20. 完成操作事务

完成任务时必须在同一事务中完成：

1. 读取课程与当前进度；
2. 验证课程未归档；
3. 验证阶段与前端提交的 `expectedStage` 一致；
4. 验证今天确实可完成该任务；
5. 验证该阶段未完成过；
6. 创建 `study_events`；
7. 更新 course_progress；
8. 更新 courses.status；
9. 提交事务。

如果重复点击或并发请求，后一个请求应安全失败，不得生成重复事件。

---

## 21. 撤销操作事务

撤销今天完成记录时：

1. 找到该课程最新 study event；
2. 验证 `completedDate` 是今天；
3. 验证该事件是该课程最新阶段；
4. 删除事件；
5. 根据上一条事件恢复 progress；
6. 如果没有上一条事件：
   - 课程恢复为 `queued`；
   - 删除或清空 progress；
7. 如果上一条事件仍有后续阶段：
   - 课程恢复为 `active`；
   - `currentStage = 上一阶段 + 1`；
   - `nextDueDate = 被撤销事件的 scheduledDate`；
8. 如果撤销的是最终复习：
   - completed 状态恢复为 active；
   - completedDate 设为 null。

建议给撤销操作写完整单元测试。

---

## 22. UI 与交互风格

### 22.1 总体风格

- 简洁；
- 安静；
- 阅读优先；
- 不做游戏化；
- 不使用大量渐变；
- 不使用复杂插画；
- 不使用花哨动画；
- 手机端可单手操作；
- 课程正文保持舒适行距和最大宽度。

### 22.2 建议布局

正文区域：

```text
max-width: 760px
```

英文正文建议：

```text
font-size: 18px
line-height: 1.8
```

手机端适当缩小。

### 22.3 模式切换

中文、英文、Cue 使用分段控制器或标签页。

切换模式时不要整页重新加载。

### 22.4 颜色

只需要：

- 一个主色；
- 中性色；
- 逾期警示色；
- 完成状态色。

不要让颜色承担过多信息。

### 22.5 错误反馈

导入失败或完成失败时，必须显示明确原因。

例如：

```text
无法完成：该课程当前阶段已经发生变化，请刷新页面后重试。
```

不要只显示“操作失败”。

---

## 23. 推荐项目结构

```text
src/
  app/
    page.tsx
    today/
      page.tsx
    calendar/
      page.tsx
    course/
      [id]/
        page.tsx
    library/
      page.tsx
    api/
      courses/
      study/
      import/

  components/
    navigation/
    task-card/
    course-reader/
    calendar/
    library/

  db/
    client.ts
    schema.ts
    migrations/

  domain/
    scheduling/
      constants.ts
      types.ts
      complete-stage.ts
      today-tasks.ts
      future-plan.ts
      date-utils.ts
    courses/
      course-schema.ts
      import-course.ts

  services/
    dashboard-service.ts
    course-service.ts
    study-service.ts
    calendar-service.ts
    import-service.ts

  lib/
    validation/
    errors/

scripts/
  validate-course.ts
  import-course.ts

content/
  examples/
    modern-family-s01e01.json

tests/
  unit/
  integration/
  e2e/
```

目录可以根据 Codex 的判断微调，但必须保持：

- 领域逻辑与 UI 分离；
- 数据库操作与纯调度函数分离；
- JSON Schema 独立；
- 测试目录清晰。

---

## 24. 单元测试要求

调度器必须覆盖以下场景。

### 24.1 正常完成

- 首次学习当天完成；
- 第一次复习按时完成；
- 最后一次复习完成后课程状态为 completed。

### 24.2 延期完成

- 第一次复习延期 1 天；
- 第一次复习延期 10 天；
- 后续日期以实际完成日计算；
- 不保留原未来固定日期。

### 24.3 新课阻塞

- 当前新课未完成时不安排下一篇；
- 当前新课完成后次日出现下一篇；
- 新课未完成不影响其他课程复习。

### 24.4 多任务

- 同一天多篇复习；
- 同一天同时存在逾期、今日复习和新课；
- 任意顺序完成不产生冲突。

### 24.5 日期边界

- 跨月；
- 跨年；
- 2 月 28 日；
- 闰年 2 月 29 日；
- 时区下的当天判断。

### 24.6 重复提交

- 同阶段重复完成；
- 并发完成请求；
- 已完成课程再次完成。

### 24.7 撤销

- 撤销首次学习；
- 撤销普通复习；
- 撤销最后一次复习；
- 非当天记录不能撤销；
- 不是最新事件不能撤销。

### 24.8 归档

- 归档 active 课程；
- 归档后不出现在 Today；
- 取消归档后恢复逾期状态。

### 24.9 未来预测

- 正常连续完成预测；
- 多课程复习重叠；
- 新课每日一篇；
- 未来预测不写数据库。

---

## 25. 端到端测试

至少实现以下流程。

### 流程一：导入并学习第一篇课程

1. 打开课程库；
2. 导入课程 JSON；
3. 打开 Today；
4. 看到该课程作为今日新课；
5. 进入课程；
6. 切换中文、英文、Cue；
7. 标记完成；
8. 返回 Today；
9. 课程出现在今日已完成；
10. 下一次复习日期为次日。

### 流程二：延期复习

1. 准备一门 nextDueDate 早于今天的课程；
2. Today 显示为逾期；
3. 完成该课程；
4. 验证下一次复习日期按今天计算；
5. 不按原应完成日期计算。

### 流程三：查看非当天日期

1. 打开 Calendar；
2. 选择过去日期；
3. 只能查看，不能完成；
4. 选择未来日期；
5. 显示预计计划和提示；
6. 不能完成未来任务。

### 流程四：撤销

1. 今天完成一项任务；
2. 点击撤销；
3. Today 恢复原待办；
4. 数据库事件被移除；
5. 进度恢复正确。

---

## 26. 示例初始数据

项目中放一篇简短示例课程，便于开发和测试。

文件：

```text
content/examples/modern-family-s01e01.json
```

只需要几段虚拟或示例文本，不需要现在生成完整课程内容。

另外提供 seed 脚本：

```bash
npm run db:seed
```

seed 可以导入该示例课程。

---

## 27. 开发脚本

建议提供：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "tsx scripts/seed.ts",
    "course:validate": "tsx scripts/validate-course.ts",
    "course:import": "tsx scripts/import-course.ts"
  }
}
```

具体命令可按实际依赖调整。

---

## 28. README 要求

Codex 完成项目后，README 至少说明：

- 项目用途；
- 技术栈；
- 本地运行方法；
- 环境变量；
- SQLite 文件位置；
- 数据库迁移方法；
- 导入课程方法；
- 运行测试方法；
- 复习调度规则；
- 当前不支持的功能。

第一版本地启动应尽量简单：

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

---

## 29. 环境变量

尽量少。

示例：

```env
DATABASE_URL=./data/english-learning.db
APP_TIMEZONE=Asia/Shanghai
```

如果 Drizzle 或 better-sqlite3 的实际配置需要不同格式，可调整，但必须在 README 中写清。

应用启动时应确保 `data` 目录存在。

---

## 30. 实现顺序

Codex 按以下顺序实现。

### 第一阶段：项目骨架

1. 创建 Next.js + TypeScript 项目；
2. 配置 Tailwind；
3. 配置 SQLite、Drizzle、迁移；
4. 建立基础目录；
5. 增加示例环境变量和 README。

### 第二阶段：领域逻辑

1. 定义复习常量；
2. 实现日期工具；
3. 实现完成阶段计算；
4. 实现 Today 任务分类；
5. 实现未来计划预测；
6. 编写单元测试。

### 第三阶段：课程数据

1. 定义 Drizzle Schema；
2. 定义课程 Zod Schema；
3. 实现课程导入事务；
4. 实现更新模式；
5. 增加示例课程和 seed。

### 第四阶段：核心页面

1. Today；
2. Course；
3. Library；
4. Calendar。

### 第五阶段：写操作

1. 完成任务；
2. 撤销当天完成；
3. 归档和取消归档；
4. 导入与更新课程。

### 第六阶段：测试和收尾

1. 集成测试；
2. Playwright 流程测试；
3. 空状态；
4. 错误处理；
5. 响应式适配；
6. README 完成。

---

## 31. 验收标准

项目完成时，必须满足以下条件。

### 31.1 调度正确

- 复习节点为 0、1、3、7、15、30；
- 延期完成后按实际完成日推算下一阶段；
- 不提前存储全部未来任务；
- 未完成任务自动保持并成为逾期；
- 新课未完成时阻塞下一篇新课；
- 新课阻塞不影响复习。

### 31.2 权限规则正确

虽然没有账号系统，但操作时间规则必须正确：

- 只有今天的任务能完成；
- 过去和未来只能查看；
- 未来预测不能写入数据库；
- 只能撤销今天最新完成的任务。

### 31.3 内容展示正确

- 中文、英文、Cue 三种模式都能使用；
- 三种模式段落一一对应；
- 切换模式不跳回顶部；
- 移动端阅读正常。

### 31.4 导入正确

- 非法 JSON 被拒绝；
- 重复 slug 默认拒绝；
- 更新模式不破坏进度；
- 导入过程原子化；
- 页面和命令行至少有一种可用导入方式；
- 推荐两种都实现。

### 31.5 工程质量

- TypeScript 无明显类型逃逸；
- 核心业务逻辑不写在页面组件中；
- 调度器有完整单元测试；
- 数据库写操作使用事务；
- README 可以让新环境直接运行项目；
- 不加入本文明确排除的复杂功能。

---

## 32. 给 Codex 的最终实现指令

请根据本文档直接实现一个可运行的完整项目。

执行原则：

1. 不扩大产品范围；
2. 不增加登录、备份、PWA、Docker、Nginx 或 AI 功能；
3. 优先保证调度逻辑正确；
4. 调度逻辑必须先写测试再接 UI；
5. 使用 SQLite；
6. 课程内容通过标准 JSON 导入；
7. 第一版只支持中文、英文、Cue 三种学习模式；
8. 所有非当天日期只读；
9. 未来计划只做动态预测；
10. 完成后提供清晰 README 和示例课程文件。

如果实现细节与本文档存在冲突，以本文档中的产品规则和验收标准为准。
