# note

个人网站（Astro Narrow + Vercel + Giscus）。中文内容优先。

## 技术栈

- [Astro Narrow](https://github.com/tom2almighty/astro-narrow) 主题（不改 `src` 内部源码，仅配置 + 新增组件）
- Astro 5 (SSG) + Tailwind CSS v4 + astro-icon + pnpm
- 部署：Vercel（`vercel.json` 已配置，`pnpm build` → `dist`）
- 评论：Giscus（Narrow 原生 `Comments.astro`，配置见下）

## 本地开发

```bash
pnpm install
pnpm dev        # 本地预览
pnpm build      # 生产构建到 dist/
pnpm preview    # 预览构建产物
```

## 部署（Vercel）

1. Vercel 控制台导入 `Lancernix/note`（默认分支 `master`）。
2. Framework 选 Astro，构建命令 `pnpm build`，输出目录 `dist`（已由 `vercel.json` 设定）。
3. 域名加 `note.lancernix.space`，DNS CNAME 到 Vercel，开启 HTTPS。
4. 推送 `master` 即自动部署：

```bash
git push -u origin master
```

`astro.config.mjs` 中 `site` 固定为 `https://note.lancernix.space`（可被环境变量 `ASTRO_SITE` 覆盖），用于生成绝对 URL 的 sitemap / canonical。

## 评论（Giscus）

Narrow 在 `comments.enabled && provider === 'giscus' && giscus.repo` 时渲染评论（见 `src/components/features/Comments.astro`）。

1. 去 [giscus.app](https://giscus.app) 授权仓库 `Lancernix/note` 并选择分类。
2. 取得 `data-repo-id` / `data-category-id`，替换 `src/config/site.ts` 中的 `YOUR_REPO_ID` / `YOUR_CATEGORY_ID` 占位符。
3. **每篇文章需在其 frontmatter 设 `comments: true`** 才会渲染评论区（`BaseLayout` 按页面级 `comments` 开关挂载）。
4. （可选）`.env.local.example` 是填写指引，Narrow 直接读 `site.ts`，不读 env。

## 定制点

- 主题：`src/styles/themes.css` 中 `lancernix` 亮/暗两段令牌（鼠尾草绿强调色）。
- 阅读宽度：`src/config/site.ts` 的 `contentWidth`（当前 `48rem`）。
- 内容：文章在 `src/content/posts/zh-cn/`，项目在 `src/content/projects/zh-cn/`，关于页在 `src/content/pages/zh-cn/about.md`；frontmatter 含可选 `audio` 字段（填了才出现懒加载播放器）。

## 待用户填写的外部凭证（非实现占位）

- Giscus `repoId` / `categoryId`（spec §10）。
