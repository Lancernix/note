# note

个人网站（Astro Narrow + Vercel + Giscus）。中文内容优先。

## 技术栈

- [Astro Narrow](https://github.com/tom2almighty/astro-narrow) 主题（不改 `src` 内部源码，仅配置 + 新增组件）
- Astro 7 (SSG) + Tailwind CSS v4 + astro-icon
- Node 24 + pnpm 11（由根目录 `mise.toml` 锁定，本机用 [mise](https://mise.jdx.dev) 管理运行时）
- 部署：Vercel（`vercel.json` 已配置，`pnpm build` → `dist`）；备选腾讯 EdgeOne Pages（GitHub 集成原生支持 Astro）
- 评论：Giscus（Narrow 原生 `Comments.astro`，配置见下）

## 本地开发

```bash
pnpm install
pnpm dev        # 本地预览
pnpm build      # 生产构建到 dist/
pnpm preview    # 预览构建产物
```

## 部署

### 方案一：Vercel（当前配置）

1. Vercel 控制台导入 `Lancernix/note`（默认分支 `master`），Framework 自动识别 Astro；Node.js Version 选 `24.x`（仓库已用 `.nvmrc` + `engines.node` 声明）。
2. 域名加 `blog.lancernix.space`，DNS CNAME 到 Vercel，开启 HTTPS。
3. 推送 `master` 即自动部署：

```bash
git push -u origin master
```

`astro.config.mjs` 中 `site` 固定为 `https://blog.lancernix.space`（可被环境变量 `ASTRO_SITE` 覆盖），用于生成绝对 URL 的 sitemap / canonical。

### 方案二：腾讯 EdgeOne Pages

1. EdgeOne 控制台「导入 Git 仓库」，OAuth 授权 GitHub 后选 `Lancernix/note`（构建命令 `pnpm build`，输出目录 `dist`，Astro 有官方框架预设）。
2. 绑定自定义域名，CNAME 到 EdgeOne 分配的地址。

### agent / MCP 自动化（可选）

- Vercel 官方 MCP：`https://mcp.vercel.com`（支持部署、查日志、查项目；仅 OAuth 授权，无 token 直连）。
- EdgeOne MCP / CLI 支持 `EDGEONE_PAGES_API_TOKEN`（[Makers 控制台](https://pages.edgeone.ai/document/api-token) 申请）非交互部署；官方 skill：`npx skills add TencentEdgeOne/edgeone-makers-tools`。
- 首次账号授权需要在浏览器完成一次，之后 git push 的自动部署与 agent 无关。

## 评论（Giscus）

Narrow 在 `comments.enabled && provider === 'giscus' && giscus.repo` 时渲染评论（见 `src/components/features/Comments.astro`）。

`src/config/site.ts` 中已填好 `repoId`（`R_kgDOTQRMYQ`）与 `categoryId`（Announcements，`DIC_kwDOTQRMYc4DArpB`）。剩余步骤：

1. 确认 [giscus App](https://github.com/apps/giscus) 已安装在 `Lancernix/note`（未安装时评论区会报错）。
2. 文章默认带评论区（`comments: true` 由 posts schema 提供）；想关闭的文章在 frontmatter 显式写 `comments: false`，普通页面（about 等）默认不挂评论区。

## 定制点

- 主题：`src/styles/themes.css` 中 `lancernix` 亮/暗两段令牌（鼠尾草绿强调色）。
- 阅读宽度：`src/config/site.ts` 的 `contentWidth`（当前 `48rem`）。
- 内容：文章在 `src/content/posts/zh-cn/`，项目在 `src/content/projects/zh-cn/`，关于页在 `src/content/pages/zh-cn/about.md`；frontmatter 含可选 `audio` 字段（填了才出现懒加载播放器）。

## 待办（需要账号操作，代码已就绪）

- 安装 [giscus App](https://github.com/apps/giscus) 到 `Lancernix/note`（若尚未安装）。
- Vercel / EdgeOne 控制台导入仓库并授权（首次一次即可），绑定 `blog.lancernix.space` 域名。
