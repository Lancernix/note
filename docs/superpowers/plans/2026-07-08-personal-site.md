# 个人站点（note.lancernix.space）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 Astro Narrow 搭建一个中文个人网站（博客 + 项目 + 关于），含暗色模式、站内搜索、原生 Giscus 评论、懒加载语音播放器（`audio` 字段）、复制为 Markdown 按钮，并套用专属 `lancernix` 配色主题（鼠尾草绿强调色）。

**Architecture:** 以 `tom2almighty/astro-narrow` 为上游，**不 fork、不改其 `src` 内部源码**；仅 (a) 把 `src/config/*`、`src/i18n.ts`、`src/styles/themes.css` 的本地副本配置为中文站 + 专属主题，(b) 新增两个独立组件 `AudioPlayer.astro` / `CopyMdButton.astro` 及其在文章详情页的接入，(c) 把 `audio` 字段加进 `content.config.ts` schema。所有定制走配置与新增文件，便于上游升级。

**Tech Stack:** Astro 5 (SSG) + Tailwind CSS v4 + astro-icon + pnpm；部署 Vercel；评论 Giscus（Narrow 原生）。

## 关于 spec 的两处校正（执行前须知）

设计稿 `docs/superpowers/specs/2026-07-08-personal-site-design.md` 在探索 Narrow 源码后发现两处可删减（YAGNI）：

- **`Giscus.astro` 组件删除**：Narrow 已原生实现评论（`src/components/features/Comments.astro` + `siteConfig.comments.giscus.*`），且文章详情页已通过 `comments={entry.data.comments}` 自动渲染。本计划改为「填 giscus 配置 + 设 `comments.enabled=true`」，不新建组件。
- **`Hero.astro` 组件删除**：Narrow 首页 `HomePage.astro` 已原生渲染个人简介头部（`siteConfig.author`：头像/名字/title/description/社交）。本计划改为「填 `author` 配置」，不新建组件。

此外 spec 中字段名（`date`、`lang: zh`）按 Narrow 真实 schema 校正为 `pubDate`、`lang: 'zh-cn'`（见 Task 3）。

## Global Constraints

- 不 fork、不修改 Astro Narrow 的 `src` 内部实现文件（配置与新增组件除外，明确列出在各 Task 的 Files 中）。
- 包管理使用 **pnpm**；`package.json` 锁定 Narrow 版本号（实现时取 clone 到的版本并记录）。
- 内容默认语言 **zh-cn**；所有文章/项目 frontmatter `lang: zh-cn`。
- 阅读宽度 `contentWidth` ≈ **`48rem`**（集中 `site.ts` 配置）。
- 暗色模式用 Narrow 原生切换 + localStorage 持久化，不另写逻辑。
- 专属主题 id 固定为 **`lancernix`**；亮/暗两版色值见 Task 4，改动只动那两段令牌。
- 音频只靠 frontmatter `audio` 字段；MVP 不写 TTS 脚本、不碰 OSS。
- 评论 Giscus 未配置时静默不渲染、不阻塞 `astro build`。
- 触摸命中区 ≥ **44px**；移动端断点 ≤480px 须可用。

---

## Task 1: 初始化仓库为 Astro Narrow + pnpm

**Files:**
- Create: `package.json`（基于 Narrow 的 package.json）
- Create: `astro.config.mjs`（基于 Narrow 的 astro.config.mjs）
- Create: `pnpm-workspace.yaml`（如上游有则复制；否则省略）
- Create: `tsconfig.json`（复制上游）
- Create: `ec.config.mjs`（复制上游，Expressive Code 配置）
- Create: `.gitignore`（含 `node_modules/`、`dist/`、`pnpm-lock.yaml` 视情况、`.env.local`）
- Create: `vercel.json`（见步骤内）
- Create: `src/env.d.ts`（复制上游）
- Create: 复制上游 `src/config/`、`src/i18n.ts`、`src/styles/`、`src/lib/`、`src/scripts/`、`src/components/`、`src/content/`、`src/pages/`、`public/`、`README.md` 的全部文件与目录
- Modify: `README.md`（改为站点说明）

**背景（来自 Narrow 源码探索）：**
- 上游根文件：`astro.config.mjs`、`ec.config.mjs`、`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`tsconfig.json`、`src/env.d.ts`。
- 上游目录：`src/config`（`site.ts`/`content.ts`/`theme.ts`/`i18n.ts`/`navigation.ts`）、`src/i18n.ts`、`src/styles`（`global.css`/`themes.css`）、`src/lib`、`src/scripts`、`src/components`、`src/pages`、`src/content`、`public`。
- 内容当前在 `src/content/{posts,projects,series,pages}/{en,zh-cn}/`；Markdown frontmatter 用 `pubDate`、可选 `lang: 'en'|'zh-cn'`。

**Interfaces:** 无（本任务为脚手架，产出供后续 Task 修改的本地副本）。

- [ ] **Step 1: 把 Astro Narrow 源码作为本地起点复制进来**

在仓库根 `note/` 下，从 clone 的上游（`/tmp/narrow-probe/astro-narrow`）复制全部文件与目录（保留 `.git`），但**排除** `.git` 与 `node_modules`：

```bash
cd /tmp/narrow-probe/astro-narrow
git archive --format=tar HEAD | (cd /Users/lancernix_1/Codes/note && tar xf -)
```

- [ ] **Step 2: 创建 `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
.env
.env.*
!.env.local.example
```

- [ ] **Step 3: 创建 `vercel.json`（静态 SSG 输出）**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "astro",
  "installCommand": "pnpm install"
}
```

- [ ] **Step 4: 安装依赖并本地构建通过**

Run: `cd /Users/lancernix_1/Codes/note && pnpm install && pnpm build`
Expected: 退出码 0，`dist/` 生成；无类型错误。

- [ ] **Step 5: 记录并锁定 Narrow 版本**

Run: `cat package.json | grep -A2 '"astro"'`
把 `astro` 及其关键依赖（如 `@astrojs/*`）的确切版本写入本仓库 `package.json`（clone 来的已是锁定态，保持不动即可）。

- [ ] **Step 6: 更新 README.md**

将 `README.md` 改为：
```markdown
# note

个人网站（Astro Narrow + Vercel + Giscus）。中文内容优先。
```

- [ ] **Step 7: 提交脚手架**

```bash
git add -A
git commit -m "chore: scaffold site from Astro Narrow (pnpm, vercel)"
```

---

## Task 2: 设默认语言为 zh-cn（i18n）

**Files:**
- Modify: `src/i18n.ts:1-2`（`defaultLocale` / `locales`）
- Modify: `src/pages/index.astro:9`（`const locale = 'en'` → `'zh-cn'`）
- Modify: `src/pages/posts/index.astro:8`（`const locale = 'en'` → `'zh-cn'`）
- Modify: `src/pages/posts/[...slug].astro:14-21`（getStaticPaths 与渲染改 `zh-cn`）
- Modify: `src/pages/projects/index.astro:8`
- Modify: `src/pages/projects/[...slug].astro:8-10`
- Modify: `src/pages/tags/index.astro:8`
- Modify: `src/pages/tags/[tag].astro:9,14`
- Modify: `src/pages/archives/index.astro:8`
- Modify: `src/pages/404.astro:6`

**背景：** Narrow 根路由全部硬编码 `locale='en'`，且 `[locale]/` 路由只为非 en 生成页面。`defaultLocale` 决定 `getLocalePath` 是否加 `/zh-cn` 前缀。把 `defaultLocale` 设为 `zh-cn` 后，根路由 `/` 即中文首页，内容从 `src/content/*/zh-cn/` 读取，URL 不带语言前缀——最符合「中文个人站」。

**Interfaces:** 无（仅配置；后续 Task 依赖 `locale='zh-cn'` 已生效）。

- [ ] **Step 1: 改 `src/i18n.ts` 默认语言**

`src/i18n.ts:1-2` 改为：
```ts
export const defaultLocale = 'zh-cn';
export const locales = ['en', 'zh-cn'] as const;
```

- [ ] **Step 2: 改各根页面 `const locale`**

将以下文件的 `const locale = 'en';` 改为 `const locale = 'zh-cn';`：
- `src/pages/index.astro:9`
- `src/pages/posts/index.astro:8`
- `src/pages/projects/index.astro:8`
- `src/pages/tags/index.astro:8`
- `src/pages/archives/index.astro:8`
- `src/pages/404.astro:6`

- [ ] **Step 3: 改 posts 详情页为 zh-cn**

`src/pages/posts/[...slug].astro` 第 14-21 行，将 `getLocalizedEntries('posts', 'en')` 全部改为 `'zh-cn'`，`locale="en"` 改为 `locale="zh-cn"`，`getLocalePath('en', ...)` 改为 `getLocalePath('zh-cn', ...)`。即：

```astro
export async function getStaticPaths() {
  const posts = await getLocalizedEntries('posts', 'zh-cn');
  return posts.map((entry) => ({ params: { slug: entrySlug(entry as any) }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content, headings } = await render(entry);
const posts = await getLocalizedEntries('posts', 'zh-cn');
```

以及模板里 `locale="en"` → `locale="zh-cn"`，`getLocalePath('en', contentTypes.posts.path)` → `getLocalePath('zh-cn', contentTypes.posts.path)`。

- [ ] **Step 4: 改 projects 详情页为 zh-cn**

`src/pages/projects/[...slug].astro` 第 8-10 行：
```astro
export async function getStaticPaths() {
  const projects = await getLocalizedEntries('projects', 'zh-cn');
  return projects.map((entry) => ({ params: { slug: entrySlug(entry as any) }, props: { entry } }));
}
```
模板内 `locale="en"` → `locale="zh-cn"`（第 17、18、19 行）。

- [ ] **Step 5: 改 tags/[tag] 为 zh-cn**

`src/pages/tags/[tag].astro:9` `getLocalizedEntries('posts', 'en')` → `'zh-cn'`；第 14 行 `useTranslations('en')` → `useTranslations('zh-cn')`；模板 `locale="en"` → `locale="zh-cn"`。

- [ ] **Step 6: 构建验证中文路由生效**

Run: `pnpm build`
Expected: 退出码 0；`dist/posts/index.html`、`dist/projects/index.html`、`dist/tags/index.html`、`dist/archives/index.html`、`dist/index.html` 存在（无 `/zh-cn` 前缀）。

- [ ] **Step 7: 提交**

```bash
git add src/i18n.ts src/pages
git commit -m "i18n: default locale zh-cn for root routes"
```

---

## Task 3: 内容模型 — 加 `audio` 字段 + 中文内容

**Files:**
- Modify: `src/content.config.ts`（posts schema 加 `audio`）
- Delete: `src/content/posts/en/`、`src/content/posts/zh-cn/`（上游示例）— 保留目录结构，删示例 md
- Delete: `src/content/projects/en/`、`src/content/projects/zh-cn/`（上游示例）— 删示例 md
- Create: `src/content/posts/zh-cn/welcome.md`（首篇中文文章，含 `audio` 演示字段留空）
- Create: `src/content/projects/zh-cn/note-site.md`（首个项目）
- Create: `src/content/pages/zh-cn/about.md`（关于页）

**背景：** `baseSchema` 已有 `title/description/pubDate/draft/tags/lang/comments`；posts 额外有 `series`。`audio` 不在 schema，须新增为可选 `z.string().url().optional()`。`lang` 取值 `'en' | 'zh-cn'`。`pages` 集合的 `about.md` 是 Narrow 已支持的「free-form page」（见 `[locale]/[...slug].astro`）。

**Interfaces:** 后续 Task（AudioPlayer、CopyMdButton）依赖 `entry.data.audio` 字段存在且为 `string | undefined`。

- [ ] **Step 1: posts schema 加 `audio`**

在 `src/content.config.ts` 的 `posts` collection（`schema: baseSchema.extend({...})`）内追加一行：
```ts
  schema: baseSchema.extend({
    pubDate: z.coerce.date(),
    series: z.array(z.string()).optional(),
    seriesOrder: z.number().optional(),
    audio: z.string().url().optional()
  })
```

- [ ] **Step 2: 删除上游英文/中文示例内容**

删除 `src/content/posts/en/`、`src/content/posts/zh-cn/`、`src/content/projects/en/`、`src/content/projects/zh-cn/`、`src/content/series/`、`src/content/pages/en/`、`src/content/pages/zh-cn/`（仅 markdown 文件，保留目录或重建下方所需目录）。

- [ ] **Step 3: 写首篇中文文章（演示 `audio` 可选）**

`src/content/posts/zh-cn/welcome.md`：
```markdown
---
title: 你好，世界
pubDate: 2026-07-08
description: 站点第一篇示例文章。
tags: [公告, 随笔]
draft: false
lang: zh-cn
# audio: https://your-cdn.example.com/audio/hello.mp3
---

这是 **note** 的第一篇文章。正文用 Markdown 写作，Git 推送即发布。

- 暗色模式
- 站内搜索
- 评论（Giscus）
- 复制为 Markdown
- 可选语音（填了 `audio` 才出现播放器）
```

- [ ] **Step 4: 写首个项目**

`src/content/projects/zh-cn/note-site.md`：
```markdown
---
title: note 个人站点
pubDate: 2026-07-08
description: 基于 Astro Narrow 搭建的中文个人网站。
tags: [Astro, 前端]
draft: false
lang: zh-cn
featured: true
links:
  - label: 源码
    url: https://github.com/Lancernix/note
    icon: lucide:github
    variant: primary
---

用 Astro Narrow 主题搭建，内容优先、暗色友好、移动端适配。
```

- [ ] **Step 5: 写关于页**

`src/content/pages/zh-cn/about.md`：
```markdown
---
title: 关于
pubDate: 2026-07-08
description: 关于我。
layout: page
lang: zh-cn
---

这里是你的个人介绍。可以写你做什么、喜欢什么、在折腾什么。
```

- [ ] **Step 6: 构建验证 schema 通过**

Run: `pnpm build`
Expected: 退出码 0；`dist/posts/welcome/` 与 `dist/projects/note-site/`、`dist/about/`（或 `dist/zh-cn/about/`）生成。

- [ ] **Step 7: 提交**

```bash
git add src/content.config.ts src/content
git commit -m "content: add audio field + seed zh-cn posts/projects/about"
```

---

## Task 4: 专属主题 `lancernix`（配色 + 字体）

**Files:**
- Modify: `src/config/theme.ts:1-18`（themes 数组加 `lancernix`，`defaultTheme` 改 `lancernix`）
- Modify: `src/styles/themes.css`（追加 `[data-theme="lancernix"]` 与 `.dark` 块）
- Modify: `src/styles/global.css`（在 `@theme` 的 `--font-sans` 注入 Inter + Noto Sans SC）
- Create: `public/fonts/` 说明（字体走 Google Fonts CDN，不本地放；见步骤）
- Modify: `astro.config.mjs`（如需要，确保字体/资源正确；Narrow 用 `@fontsource` 或 CDN，本任务用 CDN `<link>` 注入到 BaseLayout 头部——但因不改 Narrow 内部，改为在 `src/config/site.ts` 的 `head`/自定义手段；见步骤）

**背景：** Narrow 主题令牌为 oklch 变量（`--color-background/foreground/muted-foreground/border/accent/...`）。强调色 spec 定为鼠尾草绿 `#5dac8d`（亮）/ `#7fc9a8`（暗）。`#5dac8d` ≈ `oklch(0.66 0.06 165)`；`#7fc9a8` ≈ `oklch(0.78 0.07 165)`。基底用近黑/纸白（参照 `:root` 与 `.dark` 默认块数值，但 foreground 用 zinc 系 `#18181b`≈`oklch(0.205 0 0)`、`#71717a`≈`oklch(0.55 0 0)`）。字体：中文正文必须 CJK——Inter 不渲染中文，故 `--font-sans` 追加 `"Noto Sans SC"`。

**Interfaces:** 无（纯配置/样式；后续页面自动套用 `data-theme="lancernix"`）。

- [ ] **Step 1: 注册 `lancernix` 主题**

`src/config/theme.ts` 顶部数组追加，并改默认：
```ts
export const themes = [
  { id: 'default', name: 'Default' },
  // ... 保留其余内置主题 ...
  { id: 'lancernix', name: 'Lancernix' }
] as const;

export type ThemeId = (typeof themes)[number]['id'];

export const defaultTheme: ThemeId = 'lancernix';
```

- [ ] **Step 2: 在 themes.css 追加令牌块**

在 `src/styles/themes.css` 末尾追加（不改动已有块）：
```css
[data-theme="lancernix"] {
  --color-primary: oklch(0.205 0 0);
  --color-primary-foreground: oklch(0.985 0 0);
  --color-secondary: oklch(0.96 0 0);
  --color-secondary-foreground: oklch(0.205 0 0);
  --color-accent: oklch(0.66 0.06 165);
  --color-accent-foreground: oklch(0.985 0 0);
  --color-background: oklch(0.99 0 0);
  --color-foreground: oklch(0.205 0 0);
  --color-muted: oklch(0.96 0 0);
  --color-muted-foreground: oklch(0.55 0 0);
  --color-border: oklch(0.90 0 0);
  --color-card: oklch(0.99 0 0);
  --color-card-foreground: oklch(0.205 0 0);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.205 0 0);
  --color-note: oklch(0.61 0.15 252.5);
  --color-tip: oklch(0.61 0.15 162.48);
  --color-important: oklch(0.61 0.15 282.5);
  --color-warning: oklch(0.61 0.15 82.5);
  --color-caution: oklch(0.61 0.15 12.57);
}

[data-theme="lancernix"].dark {
  --color-primary: oklch(0.92 0 0);
  --color-primary-foreground: oklch(0.205 0 0);
  --color-secondary: oklch(0.27 0 0);
  --color-secondary-foreground: oklch(0.985 0 0);
  --color-accent: oklch(0.78 0.07 165);
  --color-accent-foreground: oklch(0.15 0.02 165);
  --color-background: oklch(0.205 0 0);
  --color-foreground: oklch(0.92 0 0);
  --color-muted: oklch(0.27 0 0);
  --color-muted-foreground: oklch(0.70 0 0);
  --color-border: oklch(1 0 0 / 10%);
  --color-card: oklch(0.24 0 0);
  --color-card-foreground: oklch(0.92 0 0);
  --color-popover: oklch(0.27 0 0);
  --color-popover-foreground: oklch(0.92 0 0);
  --color-note: oklch(0.67 0.15 252.5);
  --color-tip: oklch(0.67 0.15 162.48);
  --color-important: oklch(0.67 0.15 282.5);
  --color-warning: oklch(0.67 0.15 82.5);
  --color-caution: oklch(0.67 0.15 12.57);
}
```

- [ ] **Step 3: 字体 — 注入 Inter + Noto Sans SC**

`src/styles/global.css` 第 29 行 `--font-sans` 改为：
```css
  --font-sans: "Inter", "Noto Sans SC", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```
并在 `src/styles/global.css` 顶部 `@import "tailwindcss";` 之后、首个 `@import` 之后追加（或单独建 `src/styles/fonts.css` 并在 `global.css` 引入）：
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');
```
> 注：若 Tailwind v4 的 `@import` 顺序有约束，把字体 `@import` 放在文件最顶部（在 `@import "tailwindcss";` 之前）。

- [ ] **Step 4: 构建并目视检查亮/暗两版**

Run: `pnpm build`
Expected: 退出码 0。人工在 `dist/index.html` 打开（或 `pnpm dev`），确认默认主题生效、强调色为鼠尾草绿、切换暗色后对比达标（正文 fg 对 bg ≥4.5:1，accent 可见）。

- [ ] **Step 5: 提交**

```bash
git add src/config/theme.ts src/styles
git commit -m "theme: add lancernix theme (sage-green accent) + CJK font"
```

---

## Task 5: 站点配置 — site.ts / content.ts（作者、导航、宽度）

**Files:**
- Modify: `src/config/site.ts`（name/author/nav/contentWidth/comments）
- Modify: `src/config/content.ts`（可选：home 标题中文；已默认含 zh-cn 标签，基本不改）

**背景：** `siteConfig` 含 `name/shortName/description/author{name,title,description,avatar,social}/contentWidth/nav/footerNav/comments/ui`。`author` 驱动首页个人简介头部（`HomePage.astro`）。`nav` 用内置 key（`posts/projects/archives/tags`），`about` 不是内置系统路由 key——需确认 About 如何进导航（见步骤）。

**Interfaces:** 无（配置；首页 Hero 与导航消费 `author`/`nav`）。

- [ ] **Step 1: 填站点与作者信息**

`src/config/site.ts`：
```ts
export const siteConfig = {
  name: 'Lancernix',
  shortName: 'Lancernix',
  description: '峰哥的个人网站：写作、项目与随笔。',
  author: {
    name: '峰哥',
    title: { en: 'Lancernix', 'zh-cn': '峰哥' },
    description: {
      en: 'Personal site of Lancernix.',
      'zh-cn': '写代码、做项目、记随笔。'
    },
    avatar: '/avatar.svg',
    social: [
      { name: 'GitHub', url: 'https://github.com/Lancernix', icon: 'lucide:github' },
      { name: 'Email', url: 'mailto:you@example.com', icon: 'lucide:mail' }
    ]
  },
  contentWidth: '48rem',
  // ... 其余保持 ...
  nav: ['posts', 'projects', 'archives', 'tags', 'about'],
  footerNav: ['archives', 'tags', 'about'],
  // ...
};
```
> `avatar: '/avatar.svg'` 需放 `public/avatar.svg`（见 Step 3）。

- [ ] **Step 2: 让 About 进导航**

`about` 不是 `navigation.ts` 的 `systemRoutes` key。两种做法，选 A（最小改动）：
- **A（推荐）**：在 `src/config/site.ts` 的 `nav` 用自定义对象项：
  ```ts
  nav: [
    'posts', 'projects', 'archives', 'tags',
    { label: { en: 'About', 'zh-cn: '关于' }, href: '/about/', icon: 'lucide:user' }
  ]
  ```
  因 `navigation.ts` 的 `resolveNavigationItem` 对非字符串对象直接返回，且该 href 非 http，会经 `getLocalePath('zh-cn', '/about/')` → `/about/`（defaultLocale 不加前缀）。确认 `src/content/pages/zh-cn/about.md` 生成 `/about/` 路由（见 Task 3 Step 5；若路径带 `/zh-cn/` 前缀，则 href 改为 `/zh-cn/about/`）。

- [ ] **Step 3: 放头像到 public**

创建 `public/avatar.svg`（一张简单占位 SVG，或你后续替换）：
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#5dac8d"/><text x="48" y="60" font-size="40" text-anchor="middle" fill="#fff" font-family="sans-serif">L</text></svg>
```

- [ ] **Step 4: 构建验证导航与首页头部**

Run: `pnpm build`
Expected: 退出码 0；`dist/index.html` 含作者名「峰哥」、社交链接；导航含 文章/项目/归档/标签/关于。

- [ ] **Step 5: 提交**

```bash
git add src/config/site.ts public/avatar.svg
git commit -m "config: site identity, author, nav (about), 48rem width"
```

---

## Task 6: 新建 AudioPlayer 组件（懒加载语音）

**Files:**
- Create: `src/components/AudioPlayer.astro`
- Modify: `src/pages/posts/[...slug].astro`（在 `<Content />` 后插入 `<AudioPlayer audio={entry.data.audio} />`）

**背景：** 仅当 `entry.data.audio` 存在时渲染。`preload="none"`，点播放才设 `src`。倍速用原生 `playbackRate`（0.75/1/1.25/1.5/2）。样式用 Narrow 的 surface/token 类，暗亮一致。

**Interfaces:**
- 消费：`entry.data.audio: string | undefined`（来自 Task 3 schema）
- 产出：文章详情页插入点

- [ ] **Step 1: 写组件（仅 audio 存在时渲染）**

`src/components/AudioPlayer.astro`：
```astro
---
interface Props {
  audio?: string;
}
const { audio } = Astro.props;
---

{audio && (
  <div class="surface-card my-6 flex flex-wrap items-center gap-3 px-4 py-3" data-audio-player>
    <button
      type="button"
      class="audio-toggle inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-primary text-primary-foreground"
      aria-label="播放/暂停"
    >
      <span class="audio-icon" aria-hidden="true">▶</span>
    </button>
    <span class="audio-time text-sm tabular-nums text-muted-foreground">0:00 / 0:00</span>
    <input
      type="range"
      class="audio-progress flex-1 min-w-[120px]"
      min="0"
      max="100"
      value="0"
      aria-label="播放进度"
    />
    <label class="audio-rate-wrap flex items-center gap-1 text-sm text-muted-foreground">
      倍速
      <select class="audio-rate rounded-[var(--radius-control)] bg-muted px-2 py-1" aria-label="倍速">
        <option value="0.75">0.75×</option>
        <option value="1" selected>1×</option>
        <option value="1.25">1.25×</option>
        <option value="1.5">1.5×</option>
        <option value="2">2×</option>
      </select>
    </label>
    <audio class="audio-el" src={audio} preload="none"></audio>
  </div>
)}

<script>
  document.querySelectorAll<HTMLElement>('[data-audio-player]').forEach((root) => {
    const btn = root.querySelector<HTMLButtonElement>('.audio-toggle')!;
    const icon = root.querySelector<HTMLElement>('.audio-icon')!;
    const time = root.querySelector<HTMLElement>('.audio-time')!;
    const progress = root.querySelector<HTMLInputElement>('.audio-progress')!;
    const rate = root.querySelector<HTMLSelectElement>('.audio-rate')!;
    const audio = root.querySelector<HTMLAudioElement>('.audio-el')!;

    const fmt = (s: number) => {
      if (!isFinite(s)) return '0:00';
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60).toString().padStart(2, '0');
      return `${m}:${sec}`;
    };

    btn.addEventListener('click', () => {
      if (audio.paused) audio.play(); else audio.pause();
    });
    audio.addEventListener('play', () => (icon.textContent = '❚❚'));
    audio.addEventListener('pause', () => (icon.textContent = '▶'));
    audio.addEventListener('loadedmetadata', () => (time.textContent = `0:00 / ${fmt(audio.duration)}`));
    audio.addEventListener('timeupdate', () => {
      time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
      if (audio.duration) progress.value = String((audio.currentTime / audio.duration) * 100);
    });
    progress.addEventListener('input', () => {
      if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
    });
    rate.addEventListener('change', () => (audio.playbackRate = Number(rate.value)));
  });
</script>
```
> 说明：`src={audio}` 在服务端渲染时直接写入 `<audio>`；`preload="none"` 保证构建期/页面加载**不预取**，仅在用户点播放时浏览器才拉取音频（懒加载）。`audio` 缺失时整个播放器不渲染。

    const fmt = (s: number) => {
      if (!isFinite(s)) return '0:00';
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60).toString().padStart(2, '0');
      return `${m}:${sec}`;
    };

    btn.addEventListener('click', () => {
      if (audio.paused) audio.play(); else audio.pause();
    });
    audio.addEventListener('play', () => (icon.textContent = '❚❚'));
    audio.addEventListener('pause', () => (icon.textContent = '▶'));
    audio.addEventListener('loadedmetadata', () => (time.textContent = `0:00 / ${fmt(audio.duration)}`));
    audio.addEventListener('timeupdate', () => {
      time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
      if (audio.duration) progress.value = String((audio.currentTime / audio.duration) * 100);
    });
    progress.addEventListener('input', () => {
      if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
    });
    rate.addEventListener('change', () => (audio.playbackRate = Number(rate.value)));
  });
</script>

- [ ] **Step 3: 构建验证（无 audio 不渲染）**

Run: `pnpm build`
Expected: 退出码 0；`dist/posts/welcome/` 因 frontmatter 注释掉 `audio` 而**不含**播放器；临时给 welcome.md 取消注释 `audio` 并指向一个可达 mp3，重建确认播放器出现、点播放才请求（可用浏览器网络面板手动验证，或跳过手动验证仅确认 DOM 存在）。验证后恢复 welcome.md 的 `audio` 注释。

- [ ] **Step 4: 提交**

```bash
git add src/components/AudioPlayer.astro src/pages/posts/[...slug].astro
git commit -m "feat: lazy AudioPlayer (preload=none, playbackRate speed)"
```

---

## Task 7: 新建 CopyMdButton 组件

**Files:**
- Create: `src/components/CopyMdButton.astro`
- Modify: `src/pages/posts/[...slug].astro`（在文章正文区域插入 `<CopyMdButton slug={entrySlug(entry)} />` 或传入 raw 内容）

**背景：** 复制完整 md 源码（含 frontmatter + 正文），末尾追加 `> 原文：<永久链接>`。永久链接 = `siteConfig` 站点 URL + 文章路径。优先 `navigator.clipboard`，降级 `textarea+execCommand`。toast `aria-live="polite"` 3–5s。

**关键约束：** 组件在构建期运行，拿不到「正文原始 markdown 源码」——Narrow 用 `render(entry)` 渲染，原文需从 content 文件读取。Astro content 集合默认不暴露 raw body。可行做法（选 A，最稳）：
- **A（推荐）**：在文章详情页用 `getEntry` + `entry.body`（Astro content collections 的 `body` 字段在 glob loader 下可用，含 frontmatter 之后的原始 markdown）获取原文，传给组件；组件负责拼 frontmatter 来源注释并复制。

**Interfaces:**
- 消费：`entry.body`（原始 markdown，不含 frontmatter 文本；frontmatter 由 `entry.data` 重建或省去）、`siteConfig`（站点 URL）、文章 slug
- 产出：按钮 + toast

- [ ] **Step 1: 写组件（接收 rawBody + url）**

`src/components/CopyMdButton.astro`：
```astro
---
interface Props {
  rawBody: string;
  canonicalUrl: string;
}
const { rawBody, canonicalUrl } = Astro.props;
const source = `${rawBody.trimEnd()}\n\n> 原文：${canonicalUrl}\n`;
---

<button
  type="button"
  class="copy-md-btn inline-flex h-11 items-center gap-2 rounded-[var(--radius-control)] border border-border bg-muted px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
  data-raw={source}
>
  <span class="copy-label">复制为 Markdown</span>
</button>
<div class="copy-toast sr-only" role="status" aria-live="polite"></div>

<script>
  document.querySelectorAll<HTMLButtonElement>('.copy-md-btn').forEach((btn) => {
    const toast = btn.parentElement?.querySelector<HTMLElement>('.copy-toast');
    const label = btn.querySelector<HTMLElement>('.copy-label')!;
    btn.addEventListener('click', async () => {
      const text = btn.dataset.raw || '';
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        if (toast) { toast.textContent = '已复制'; toast.classList.remove('sr-only'); setTimeout(() => toast.classList.add('sr-only'), 4000); }
        label.textContent = '已复制 ✓';
        setTimeout(() => (label.textContent = '复制为 Markdown'), 2000);
      } catch {
        if (toast) { toast.textContent = '复制失败'; toast.classList.remove('sr-only'); setTimeout(() => toast.classList.add('sr-only'), 4000); }
      }
    });
  });
</script>
```

- [ ] **Step 2: 文章页传 rawBody + 永久链接**

在 `src/pages/posts/[...slug].astro` 顶部 import 区加 `import CopyMdButton from '../../components/CopyMdButton.astro';`，并在 frontmatter 取原文与站点 URL：
```astro
const siteUrl = 'https://note.lancernix.space';
const canonicalUrl = `${siteUrl}${getLocalePath('zh-cn', `/posts/${entrySlug(entry)}/`)}`;
```
> `siteUrl` 用本任务内局部常量（Narrow 的 `siteConfig` 无 `siteUrl` 字段，且为 `satisfies` 类型，强加成员会破坏类型）。后续若想统一，可在 `site.ts` 加 `siteUrl` 并放宽 `satisfies`，但本任务不改动 `siteConfig` 类型。`entry.body` 在 glob loader 下可用（frontmatter 之后的 markdown 原文）；frontmatter 文本不在 `body` 中，故 Step 3 用 `entry.data` 重建 frontmatter 块。

在 `<article>` 上方或 `PostMeta` 下方插入：
```astro
<CopyMdButton rawBody={entry.body} canonicalUrl={canonicalUrl} />
```

- [ ] **Step 3: 关于「含 frontmatter」的处理（spec 要求）**

spec §5.3 要求复制「含 frontmatter + 正文」。Narrow glob loader 的 `entry.body` 仅为 frontmatter 之后的正文。要包含 frontmatter，两种做法：
- **最简（本计划采用）**：在 `CopyMdButton` 的 `source` 拼接里，用 `entry.data` 重建 frontmatter 块。即在文章页构造 `frontmatter` 字符串并一并传入：
  ```astro
  const fm = [
    '---',
    `title: ${JSON.stringify(entry.data.title)}`,
    `date: ${entry.data.pubDate.toISOString().slice(0,10)}`,
    entry.data.description ? `description: ${JSON.stringify(entry.data.description)}` : '',
    `tags: [${entry.data.tags.map((t) => JSON.stringify(t)).join(', ')}]`,
    `lang: zh-cn`,
    '---'
  ].filter(Boolean).join('\n');
  const rawBody = `${fm}\n\n${entry.body}`;
  ```
  然后 `CopyMdButton rawBody={rawBody} canonicalUrl={canonicalUrl} />`。
- 这样产出即「含 frontmatter + 正文 + 来源注释」，符合 spec。

- [ ] **Step 4: 构建验证复制内容**

Run: `pnpm build`
Expected: 退出码 0；`dist/posts/welcome/` 页面含「复制为 Markdown」按钮；用浏览器手动点一次，确认剪贴板文本以 `---` 开头、以 `> 原文：https://note.lancernix.space/posts/welcome/` 结尾。

- [ ] **Step 5: 提交**

```bash
git add src/components/CopyMdButton.astro src/pages/posts/[...slug].astro
git commit -m "feat: copy-as-markdown button with source link"
```

---

## Task 8: 启用 Giscus 评论（原生）

**Files:**
- Modify: `src/config/site.ts`（`comments.enabled=true` + 填 `giscus.*`）
- Create: `.env.local.example`（giscus 公开字段示例）

**背景：** Narrow 的 `Comments.astro` 在 `comments.enabled && provider==='giscus' && giscus.repo` 时渲染。文章详情页已传 `comments={entry.data.comments}`。未配置时不渲染、不阻塞构建。你需先去 giscus.app 授权 `Lancernix/note` 取 `repoId`/`categoryId`（spec §10 待办）。

**Interfaces:** 无（配置；文章页自动消费）。

- [ ] **Step 1: 开启并填 giscus 配置**

`src/config/site.ts` 的 `comments` 块：
```ts
  comments: {
    enabled: true,
    provider: 'giscus',
    giscus: {
      repo: 'Lancernix/note',
      repoId: 'YOUR_REPO_ID',
      category: 'Announcements',
      categoryId: 'YOUR_CATEGORY_ID',
      mapping: 'pathname',
      strict: '0',
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme'
    }
  },
```
> `YOUR_REPO_ID` / `YOUR_CATEGORY_ID` 占位——你去 giscus.app 拿到后替换（见 Task 9 待办说明）。在拿到前，`repoId` 为空串时 `Comments.astro` 不渲染，构建不报错的。

- [ ] **Step 2: 加 `.env.local.example`**

```bash
# Giscus (public, safe to commit as example)
GISCUS_REPO=Lancernix/note
GISCUS_REPO_ID=YOUR_REPO_ID
GISCUS_CATEGORY_ID=YOUR_CATEGORY_ID
```
> Narrow 的 `Comments.astro` 直接读 `siteConfig.comments.giscus.*`，不读 env；本 `.env.local.example` 仅作填写指引，实际值填进 `site.ts`。

- [ ] **Step 3: 构建验证（未配置不报错）**

Run: `pnpm build`
Expected: 退出码 0；因 `repoId` 为空，`dist/posts/welcome/` 不含 giscus `<script>`。拿到真实 id 填入后重建即出现。

- [ ] **Step 4: 提交**

```bash
git add src/config/site.ts .env.local.example
git commit -m "feat: enable Giscus comments (native, configured via site.ts)"
```

---

## Task 9: 部署到 Vercel + 收尾验收

**Files:**
- Modify: `astro.config.ts`/`astro.config.mjs`（确认 `site` 字段或留空；Vercel 用环境变量）
- Create/Modify: Vercel 项目连接（在 Vercel 控制台操作，非文件）
- Modify: `README.md`（补部署与待办）

**背景：** `vercel.json` 已建（Task 1）。Vercel 连 `Lancernix/note` 默认分支 `master`，域名 `note.lancernix.space`。构建命令 `pnpm build`。

**Interfaces:** 无。

- [ ] **Step 1: 在 Vercel 连接仓库并设域名**

在 Vercel 控制台：导入 `Lancernix/note` → Framework 选 Astro（自动识别或手动 `pnpm build`/`dist`）→ 域名加 `note.lancernix.space`，DNS CNAME 到 Vercel，开 HTTPS。

- [ ] **Step 2: 推送并触发部署**

```bash
git push -u origin master
```
Run（本地验证）: `pnpm build && pnpm preview`
Expected: 本地预览 200；Vercel 显示 Deploy Ready。

- [ ] **Step 3: 填 Giscus 真实 id 并重建**

去 giscus.app 授权 `Lancernix/note` + 选 category，取得 `data-repo-id`/`data-category-id`，替换 `src/config/site.ts` 的占位，提交并推送。

- [ ] **Step 4: 跑验收清单（spec §11）**

逐项核对：
- [ ] `git push` 后 Vercel 自动部署，新文章/项目可见。
- [ ] 暗色模式可切换并持久化（刷新后保持）。
- [ ] 移动端 ≤480px：阅读/导航(dock)/播放器/复制按钮可用，命中区 ≥44px。
- [ ] 站内搜索命中标题与正文（Narrow 原生 SearchModal）。
- [ ] 评论可提交（Giscus 填 id 后）。
- [ ] 复制为 Markdown 产出含 `---` frontmatter + 正文 + `> 原文：...`。
- [ ] 文章页：填了 `audio` 才出播放器，点播放才加载；倍速/暂停/进度可用。
- [ ] 首页 Hero、About、Projects 页可用。
- [ ] `lancernix` 主题亮/暗两版对比达标、视觉一致。
- [ ] Lighthouse 性能/SEO ≥ 90（`pnpm build` 产物 + 部署后测）。

- [ ] **Step 5: 提交收尾**

```bash
git add -A
git commit -m "deploy: wire Vercel + giscus ids; finalize README"
```

---

## 自检（写后对照 spec）

1. **Spec 覆盖**：M1（Narrow 初始化/部署/列表详情/标签归档/搜索/暗色/移动端/Giscus/Hero/About/Projects）✓ Task1,2,3,5,8,9；M2（复制 MD）✓ Task7；M3（audio 字段 + 懒加载播放器）✓ Task3,6。M4 自动化明确不做 ✓。配色/字体 ✓ Task4。内容模型 ✓ Task3。
2. **占位符扫描**：无 TBD/TODO；`YOUR_REPO_ID` 等为真实待用户填的外部凭证占位（spec §10 已列），非实现占位。
3. **类型一致性**：`entry.data.audio: string|undefined`（Task3→Task6 一致）；`entry.body`（Task7 用）；`lancernix` id（Task4→全局一致）；`zh-cn` locale（Task2→后续一致）。
4. **对 spec 的校正已在本计划开头声明**：`Giscus.astro`/`Hero.astro` 删除，改配置驱动。
