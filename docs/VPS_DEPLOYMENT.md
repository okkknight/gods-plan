# God's Plan VPS 部署约定

本文档是 God's Plan Web 部署的目录边界。部署时只同步生产运行时需要的文件，不能把整个本地项目目录直接同步到 VPS。

## 运行时真正需要的内容

当前服务由 `godsplan.service` 执行 `npm run start`，工作目录为 `/opt/boringmax/godsplan`。在现有部署方式下，VPS 上需要保留：

- `.next/`：通过生产构建生成的 Next.js 运行产物；
- `public/`：页面静态资源，尤其是 `public/audio/courses/` 下的 `english.wav` 和 `manifest.json`；
- `data/english-learning.db`：用户学习进度和已导入课程内容；
- `node_modules/`：与 VPS 系统和 Node.js 版本匹配的生产依赖；
- `package.json`：因为 systemd 当前通过 `npm run start` 启动服务；
- `next.config.js`：生产启动时由 Next 读取的运行配置；
- 运行配置：systemd、Caddy 和 VPS 上的环境变量，不从本地项目目录盲目覆盖。

课程页面运行时从 SQLite 读取中文、英文和 Cue 内容，不读取本地课程源文件或课程 JSON。英文音频的分段字幕时间轴从 `public/audio/courses/*/manifest.json` 读取，因此音频目录中的 manifest 不能省略。

## 只用于本地或部署过程的内容

以下内容不属于生产运行时数据，不应同步到 VPS：

- `data/audio-cache/`：Fish Audio 分段生成缓存，成品音频生成并发布后即可删除；
- `data/*.pre-*`：本地或部署前的数据库快照，只保留 VPS 上必要的最新回滚备份；
- `content/`、`courses/`、`docs/Modern_Family_S1E01-E24_Speaking_Course_MD/`：课程生产源文件和转换中间数据；
- `scripts/`：课程转换、导入、音频生成和校验脚本；
- `src/`：源码，生产环境运行的是 `.next/` 构建产物；
- `tests/`、`test-results/`、`examples/`、`handoff/`、`superpowers/`：测试、示例和协作资料；
- `.git/`、`.next-dev/`、`.next/cache/`：版本控制目录、开发构建产物和可再生构建缓存；
- Fish Audio API key、`.env.local` 及任何本地密钥文件。

`package-lock.json` 只在 VPS 上安装依赖时作为部署输入使用，不是服务运行时数据。若依赖已经在 VPS 安装完成，后续增量发布不需要反复同步它；如需重新安装，必须在 VPS 上用锁文件安装，不能把 macOS 的 `node_modules` 直接复制过去。

## 推荐发布边界

发布前在本地完成测试和生产构建，然后只将构建产物、静态资源和数据库变更发布到 VPS。示意边界如下：

```text
本地构建：
  .next/                         -> VPS .next/
  public/                        -> VPS public/
  data/english-learning.db      -> VPS data/english-learning.db（先备份）
  package.json                  -> VPS package.json（仅当启动配置有变化）

禁止同步：
  data/audio-cache/
  data/*.pre-*
  content/ courses/ docs/ scripts/ src/ tests/
  .git/ .next-dev/ .next/cache/
  本地密钥和本地开发配置
```

不要使用不带排除规则的整目录 `scp` 或 `rsync`，例如不要把本地项目根目录直接同步到 `/opt/boringmax/godsplan/`。如果使用 rsync，必须采用显式白名单或至少排除上述目录，并在同步后检查 VPS 目录大小。

## 部署后检查

每次发布后至少确认：

1. `godsplan.service` 处于 `active`；
2. `https://boringmax.com/godsplan/` 可以打开；
3. 第一集课程页面可以打开；
4. 音频请求仍支持 `206 Partial Content`；
5. VPS 上不存在新产生的 `data/audio-cache/`、`.next/cache/` 或测试产物。

如果只是更新前端代码，不要重新上传课程源文件、音频生成缓存或本地测试目录。只有课程内容、数据库或音频成品实际变化时，才发布对应的运行时文件。

## 默认：代码增量发布（最常用）

只修改 `src/`、预测逻辑或页面交互时，部署不需要同步数据库，也不需要在 VPS 上重新安装或清理依赖：

```bash
# 本地
NEXT_PUBLIC_BASE_PATH=/godsplan npm run test:run
NEXT_PUBLIC_BASE_PATH=/godsplan npm run build

# 只同步新的生产构建
rsync -az --delete .next/ root@89.208.242.44:/opt/boringmax/godsplan/.next/
ssh root@89.208.242.44 'systemctl restart godsplan.service && systemctl is-active godsplan.service'

# 发布后检查
curl -fsS https://boringmax.com/godsplan/today >/dev/null
curl -fsS https://boringmax.com/godsplan/library >/dev/null
curl -fsS https://boringmax.com/godsplan/calendar >/dev/null
```

这条路径明确禁止执行 `npm install`、`npm ci` 或 `npm prune`。VPS 上的 `node_modules/` 是与 Node 24 匹配的运行时环境，代码发布不应触碰它。

## 依赖变更发布（仅在 package.json 或锁文件变化时）

只有依赖确实变化时，才在 VPS 上单独维护 `node_modules/`。当前 VPS 使用 Node 24，线上实际运行的 `better-sqlite3` 为兼容 Node 24 的 `13.0.2`；不能直接按本地 macOS 锁文件把 `11.x` 原生包装上去。

依赖变更前必须先备份并验证原生绑定：

```bash
cd /opt/boringmax/godsplan
cp -a data/english-learning.db data/english-learning.db.pre-deps-$(date -u +%Y%m%dT%H%M%SZ)
npm install --omit=dev
test -n "$(find node_modules/better-sqlite3 -name '*.node' -print -quit)"
systemctl restart godsplan.service
systemctl is-active godsplan.service
```

如果依赖安装移除了 `better-sqlite3` 原生绑定，应立即停止发布流程，恢复兼容版本并重新验证页面；不要继续反复执行 `npm prune` 或默认 `npm install`。

## 依赖清理约定

依赖清理不是代码增量发布的必经步骤。只有依赖维护完成、服务和原生模块验证通过后，才可以执行：

```bash
cd /opt/boringmax/godsplan
npm prune --omit=dev
systemctl restart godsplan.service
```

清理后必须确认 `godsplan.service` 为 `active`，并重新检查首页、课程页和音频请求。线上服务通过 `npm run start` 运行，只依赖 `dependencies`；不要在 VPS 上运行本地构建、测试或课程生产脚本。生产配置使用 `next.config.js`，因此 Next 启动不需要 TypeScript。以后如需在 VPS 重新安装依赖，必须先确认锁文件与 Node 24 原生模块兼容，并使用 production-only 安装；不能把 macOS 的 `node_modules` 直接复制到 VPS。
