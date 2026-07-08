# 个人站点（note.lancernix.space）设计文档

- **版本**: v1.0（设计稿）
- **日期**: 2026-07-08
- **Owner**: 峰哥（Lancernix）
- **状态**: 设计已确认，待出实现计划（PLAN）

---

## 1. 项目概述

### 1.1 目标

美观、响应式、内容优先（content-focused）的**个人网站**（不止博客）：

- 本地 Markdown + Git 提交即发布，无后台 CMS。
- 极简写作与阅读体验。
- 完备基础体验：暗色模式、标签/归档、站内搜索、评论、移动端布局。
- 两项轻量 AI/媒体能力：
  1. **语音阅读**：文章可选 `audio` 字段，页面极简播放器**懒加载**直链播放（MVP 阶段音频地址由作者手动填写，不生成、不存 OSS）。
  2. **复制为 Markdown**：读者侧一键复制文章 md 源码（含来源链接）。
- 作为个人站点，还包含：首页个人简介头部、关于页、项目页。

### 1.2 非目标（本期不做）

- AI 对话 / AI 解读。
- 后台 CMS / Web 编辑器。
- 多作者、会员、付费墙。
- 语音自动化（构建期/Action 批量转）（M4）。
- 真实 TTS 合成与 OSS 上传（等 TTS 厂商、OSS bucket 确定后再做；MVP 用 frontmatter `audio` 字段 + 懒加载播放器即可，无 `tts.mjs`、无 OSS 代码）。

### 1.3 成功标准

- `git push` → Vercel 自动部署，新文章/项目可见。
- 移动端阅读体验良好（窄屏自适应、触摸友好）。
- 「复制为 Markdown」产出含来源链接的干净 md。
- 文章页有极简音频播放器（播放/暂停/进度/倍速），填了 `audio` 才渲染、点播放才加载。
- 评论可正常提交（Giscus）。
- 个人站点基础模块（首页 Hero、About、Projects）可用。

---

## 2. 技术决策（已确认）

| 项 | 决策 | 说明 |
|---|---|---|
| 框架 | **Astro (SSG)** | md 原生、构建快、静态托管 |
| 主题 | **Astro Narrow** (`tom2almighty/astro-narrow`) | content-focused 紧凑阅读风，配置化定制能力最强 |
| 定制策略 | **Narrow + 轻量自定义层**（方案 B） | 不 fork、不改 Narrow 源码；仅新增独立组件 + 一个专属 `data-theme` 令牌块 |
| 内容源 | 本地 Markdown（`src/content/posts`、`src/content/projects`），Git 发布 | 零后台 |
| 部署 | **Vercel** + 自有域名 `note.lancernix.space` | 自动 CI/CD |
| 评论 | **Giscus**（`Lancernix/note`，Discussions 已开） | 无后端；未配置时静默不渲染 |
| 语音 | **frontmatter `audio` 字段 + 懒加载播放器** | MVP 不生成音频、不碰 OSS；地址作者手动填 |
| 包管理 | **pnpm** | 与 Astro Narrow 一致 |
| 规模 | ~1 篇/周 | 量级小，全量/手动均可 |

> 原需求文档（`blog-requirements.md`）的 §2 技术决策基本沿用；主题定制方式与原文档「theme tokens + theme.ts 集中换肤」一致，本次明确了**专属 `data-theme` 方案**与最终色值。

---

## 3. 信息架构

| 页面 | 路由 | 说明 |
|---|---|---|
| 首页 | `/` | 个人简介头部（Hero）+ 文章 stack 列表 |
| 文章列表 | `/posts` | Narrow 列表 |
| 文章详情 | `/posts/[slug]` | 正文 + TOC + 语音播放器 + 复制 MD + 评论 |
| 标签页 | `/tags` · `/tags/[tag]` | Narrow tags-only 自动聚合 |
| 归档页 | `/archives` | 时间线归档 |
| 项目列表 | `/projects` | 启用 Narrow projects content type |
| 项目详情 | `/projects/[slug]` | 项目详情 |
| 关于页 | `/about` | 静态个人介绍 |
| 404 | `/404` | Narrow 默认 |

导航 `nav`: `['posts','projects','archives','tags','about']`；移动端走 Narrow dock。

---

## 4. 内容模型

基于 Astro Narrow 的 `src/content.config.ts` schema，posts frontmatter 约定：

```yaml
title: 文章标题
date: 2026-07-08
description: 摘要（列表/SEO 用）
tags: [前端, Astro]        # Narrow 为 tags-only，分类与标签统一用 tags
draft: false               # true 不发布
lang: zh                   # 仅当与站点默认语言不同时填；站点默认 zh
audio: https://...         # 可选；填了才渲染播放器，点播放才加载
```

- `audio` 为可选字段；缺失时文章详情页不渲染播放器。
- projects 使用 Narrow 的 projects content type schema（本版启用）。
- 音频文件**不进仓库**；MVP 无 manifest、无 OSS 上传。

---

## 5. 自定义组件（轻量层）

所有组件为独立 `.astro` 文件，不修改 Narrow 内部逻辑。

### 5.1 `Hero.astro`（新增）
- 首页顶部个人简介头部：头像、名字、一句话简介、社交链接。
- 数据来源：`site.ts` 的 `author` 配置或组件 props。
- 样式跟随 theme tokens（暗/亮一致）。

### 5.2 `AudioPlayer.astro`（新增）
- 仅当 frontmatter 有 `audio` 字段时渲染。
- `preload="none"`；点击播放才设置 `src` 并发起请求（懒加载，避免构建期/页面加载预取）。
- 极简 UI：播放/暂停、进度条、当前/总时长、**倍速（0.75 / 1 / 1.25 / 1.5 / 2）**。
- 倍速用原生 `audio.playbackRate`。
- 移动端适配：触摸控件命中区 ≥44px；宽度自适应。
- 样式跟随 theme tokens。

### 5.3 `CopyMdButton.astro`（新增）
- 复制该文完整 md 源码（含 frontmatter + 正文）。
- 末尾自动追加来源注释：
  ```markdown
  > 原文：<文章永久链接>
  ```
- 实现：优先 `navigator.clipboard.write([new ClipboardItem({'text/plain': blob})])`；降级 `textarea + execCommand`。
- 复制成功给 toast 提示（`aria-live="polite"`，3–5s 自动消失）。

### 5.4 `Giscus.astro`（新增）
- 封装 giscus 脚本。
- `repo` / `data-repo-id` / `data-category-id` 从配置读取（`.env.local` 公开字段或 `site.ts` comments 位）。
- **未配置时静默不渲染，不阻塞构建**（缺 `repo-id`/`category-id` 仍可部署）。
- 待办：去 giscus.app 授权 `Lancernix/note` + 选 category，取得 `data-repo-id` / `data-category-id`。

---

## 6. 主题、配色与字体

### 6.1 定制策略
- 不 fork、不修改 Narrow 源码。
- 配色通过 Narrow 的**主题令牌（CSS 变量）体系**实现：在 `src/config/theme.ts` 注册一个专属 `data-theme` id，并在 `src/styles/themes.css` 留该主题的令牌块。
- 布局/风格全部走配置项（`site.ts` / `content.ts` / `theme.ts`），不写定制 CSS；仅在主题令牌覆盖不到的细节（如 Hero 头像圆角）才用集中的自定义样式文件，且不污染 Narrow 源文件。

### 6.2 专属主题 `lancernix`
在 `theme.ts` 的 `themes` 数组追加 `{ id: 'lancernix', name: 'Lancernix' }`，并把 `defaultTheme` 指向它。在 `themes.css` 新增：

```css
[data-theme="lancernix"] {
  --color-background: #ffffff;
  --color-background-subtle: #fafafa;
  --color-foreground: #18181b;
  --color-muted-foreground: #71717a;
  --color-border: #e4e4e7;
  --color-accent: #5dac8d;       /* 鼠尾草绿 */
  --color-on-accent: #ffffff;
  --color-ring: #5dac8d;
}
[data-theme="lancernix"].dark {
  --color-background: #18181b;
  --color-background-subtle: #1f1f23;
  --color-foreground: #fafafa;
  --color-muted-foreground: #a1a1aa;
  --color-border: rgba(255,255,255,0.1);
  --color-accent: #7fc9a8;       /* 暗版提亮，保对比 */
  --color-on-accent: #0f172a;
  --color-ring: #7fc9a8;
}
```

> 色值基于 ui-ux-pro-max 设计系统检索（editorial 近黑 + 纸张浅底；强调色为去饱和鼠尾草绿 `#5dac8d`，暗版同色相提亮至 `#7fc9a8` 保 WCAG 3:1）。后续微调只改这两段令牌，不影响 Narrow 逻辑。

### 6.3 字体（无衬线 A 线）
- 拉丁/标题：`Inter`
- 中文正文：`Noto Sans SC`（CJK 字体，Inter 不渲染中文——硬约束）
- 正文 16px、行高 1.6–1.75；中文长文阅读宽度 `contentWidth` ≈ `48rem`（集中在 `site.ts`/`theme.ts` 调，不翻 CSS）。

### 6.4 暗色模式与移动端
- 暗色模式用 Narrow 内置 dark mode + theme tokens，切换状态持久化。
- 移动端（≤480px）要求：正文不溢出；导航走 Narrow dock，触摸可达；播放器/复制按钮命中区 ≥44px；TOC 折叠/抽屉；暗色切换可达；评论区宽度适配。

---

## 7. 架构与目录

```
（仓库根 note/）
├─ src/
│  ├─ config/              # Narrow 内置：site.ts / content.ts / theme.ts / i18n.ts
│  ├─ content/
│  │  ├─ posts/            # 博客文章 Markdown（写作入口）
│  │  └─ projects/         # 项目内容（启用 projects content type）
│  ├─ components/
│  │  ├─ Hero.astro        # 新增：首页个人简介头部
│  │  ├─ AudioPlayer.astro # 新增：懒加载语音播放器（可选 audio 时渲染）
│  │  ├─ CopyMdButton.astro# 新增：复制为 MD
│  │  └─ Giscus.astro      # 新增：评论封装（读取配置位）
│  ├─ layouts/             # 复用 Narrow 的 post 等 layout，必要时薄封装
│  ├─ pages/               # Narrow 默认路由 + 启用的内容类型路由
│  └─ styles/              # 自定义样式（仅 Hero 等令牌覆盖不到的细节）
├─ src/styles/themes.css   # 在 Narrow 此文件追加 [data-theme="lancernix"] 令牌块
├─ astro.config.mjs
├─ vercel.json
├─ package.json            # pnpm，锁版本号
├─ .env.local.example      # Giscus 等公开配置示例（凭证不进 git）
└─ README.md
```

> 音频文件**不在此仓库**，存于外部（MVP 阶段由作者提供 URL 填进 frontmatter）；`public/` 仅放站点静态资源。
> 根目录直接建站（不套 `blog/` 子目录），与现有 `README.md`（「Personal blog (Astro + Vercel + Giscus)」）一致。

---

## 8. 部署与 CI/CD

- Vercel 连接 `Lancernix/note`，默认分支 `master`（与仓库默认分支一致）。
- 自定义域名 `note.lancernix.space`：DNS CNAME → Vercel，开启 HTTPS。
- 包管理：pnpm（与 Narrow 一致）；`package.json` 锁定版本号，升级谨慎评估。
- 环境变量：Giscus 的 `data-*` 为公开信息，可硬编码进组件或 Vercel 环境变量。
- 无 OSS / TTS 凭证（本版用不到）。
- 自动化（M4）本期不做：纯 `git push` → Vercel 部署。

---

## 9. 里程碑与范围

本版交付 **M1 + M2 + M3（除自动化外全做）**：

- **M1 基础站点**：Astro Narrow 初始化 + Vercel/域名 + 列表/详情/标签/归档/搜索/暗色/移动端 + Giscus 接入 + 首页 Hero + About + Projects 启用 + Git 发布验证。
- **M2 复制为 Markdown**：`CopyMdButton` 组件。
- **M3 语音阅读（MVP）**：frontmatter `audio` 字段 + 懒加载 `AudioPlayer`（倍速/暂停/进度）。**不做** TTS 脚本与 OSS 上传（等厂商/bucket 定后再做）。
- **M4（可选，本期不做）**：语音自动化（构建期/Action）。

---

## 10. 待定项（待用户后续补）

- [ ] **Giscus**：去 giscus.app 授权 `Lancernix/note` + 选 category，给 `data-repo-id` / `data-category-id`。
- [ ] **OSS / TTS**：MVP 用不到；后续做 M3 真实链路时再定 bucket/endpoint/厂商与凭证管理。
- [ ] **`contentWidth` 具体值**：默认 ≈48rem，可按长文体验微调。
- [ ] **Hero / About 文案与头像**：作者提供。

---

## 11. 验收标准（Checklist）

- [ ] `git push` 后 Vercel 自动部署，新文章/项目可见。
- [ ] 暗色模式可切换并持久化。
- [ ] 移动端（≤480px）阅读/导航/播放器/复制按钮均可用且触摸友好（≥44px）。
- [ ] 站内搜索命中标题与正文。
- [ ] 评论可提交（Giscus；未配置时不阻塞构建）。
- [ ] 「复制为 Markdown」产出含来源链接的干净 md。
- [ ] 文章页：填了 `audio` 才出播放器，点播放才加载；支持倍速/暂停/进度。
- [ ] 首页 Hero、About、Projects 页可用。
- [ ] 专属 `lancernix` 主题（鼠尾草绿强调色）在亮/暗两版对比达标、视觉一致。
- [ ] Lighthouse 性能 / SEO ≥ 90。

---

## 12. 风险与对策

| 风险 | 对策 |
|---|---|
| Narrow 仍在演进 | `package.json` 锁定版本号，升级谨慎评估；定制只走配置与独立组件，不碰内部 |
| Giscus 凭证未配置 | 组件静默不渲染，部署不阻塞；配好 `data-*` 即生效 |
| 音频与文章不同步 | MVP 音频地址人工填 frontmatter，作者自管；后续做 TTS 时再加 manifest/哈希跳过 |
| 中文未用 CJK 字体 | 正文显式用 `Noto Sans SC`，避免 Inter 不渲染中文 |
| 强调色对比不足 | 暗版同色相提亮（`#7fc9a8`），保 WCAG 3:1；交付前亮/暗两版各验一次 |
