# 个人博客 需求文档（详细版）

- **版本**: v1.0（详细版，替代初版 MVP 简稿）
- **日期**: 2026-07-07
- **Owner**: 峰哥
- **状态**: 需求已澄清，待出 PLAN 开工

---

## 1. 项目概述

### 1.1 目标
美观、响应式、内容优先（content-focused）的个人博客：
- **极简写作**：本地 Markdown + Git 提交即发布，无后台 CMS。
- **AI 能力（两项）**：
  1. **语音阅读**：文章预生成音频，存 OSS，页面极简播放器直链播放。
  2. **复制为 Markdown**：读者侧一键复制文章 md 源码。
- **完备基础体验**：暗色模式、标签/归档、站内搜索、评论、移动端布局。

### 1.2 非目标（本期不做）
- AI 对话 / AI 解读（PostChat 类）。
- 后台 CMS / Web 编辑器。
- 多作者、会员、付费墙。

### 1.3 成功标准
- `git push` → Vercel 自动部署，新文章可见。
- 移动端阅读体验良好（窄屏自适应、触摸友好）。
- 「复制为 Markdown」产出含来源链接的干净 md。
- 文章页有极简音频播放器（播放/暂停/进度/倍速），播 OSS 上的音频。
- 评论可正常提交（Giscus）。

---

## 2. 技术决策（已确认）

| 项 | 决策 | 说明 |
|---|---|---|
| 框架 | **Astro (SSG)** | md 原生、构建快、静态托管 |
| 主题 | **Astro Narrow** (`tom2almighty/astro-narrow`) | content-focused 紧凑阅读风，配置化定制能力最强 |
| 内容源 | 本地 Markdown (`src/content/posts`)，Git 发布 | 零后台 |
| 部署 | **Vercel** + 自有域名 `note.lancernix.space` | 自动 CI/CD |
| 评论 | **Giscus**（`Lancernix/note`，Discussions 已开） | 无后端 |
| 语音存储 | **阿里云 OSS** | 音频走对象存储，页面直链 |
| 语音生成 | 手动脚本（本地触发），TTS 抽象层 + mock | 自动化后续再定 |
| 规模 | ~1 篇/周 | 量级小，全量/手动均可 |

---

## 3. 信息架构

| 页面 | 说明 |
|---|---|
| 首页 | 文章列表（stack 布局，可配） |
| 文章详情 | 正文 + TOC + 语音播放器 + 复制 MD + 评论 |
| 标签页 `/tags` | 按 tag 聚合（Narrow 为 tags-only taxonomy） |
| 归档页 `/archives` | 时间线归档 |
| 关于页 `/about` | 静态介绍 |
| 项目页 `/projects` | Narrow 内置 content type，**MVP 可选启用** |
| 404 | 默认 |

---

## 4. 内容模型

基于 Astro Narrow 的 `src/content.config.ts` schema，frontmatter 约定：

```yaml
title: 文章标题
date: 2026-07-07
description: 摘要（列表/SEO 用）
tags: [前端, Astro]        # Narrow 为 tags-only，分类与标签统一用 tags
draft: false               # true 不发布
lang: zh                   # 仅当与站点默认语言不同时填
# audio: 由生成脚本写入 manifest，不强制手填 frontmatter
```

> 说明：Astro Narrow 采用 **tags-only taxonomy**（无独立 category 字段），分类维度用 tags 表达。

---

## 5. 功能需求

### 5.1 写作与发布
- 文章为 Markdown，统一放 `src/content/posts/`。
- `draft: true` 不进入生产构建。
- 发布 = `git push main` → Vercel 自动构建部署。

### 5.2 主题与 UI（含移动端）
- **阅读布局**：Astro Narrow 紧凑阅读宽度，在 `src/config/site.ts` 的 `contentWidth` 配置（默认约 `56rem`，可窄化以适配长文阅读）。
- **暗色模式**：Narrow 内置 dark mode + theme tokens，`src/config/theme.ts` 控制切换选项。
- **配色定制**：通过 theme tokens + `theme.ts` 集中换肤，无需翻 CSS。
- **移动端 UI（明确要求）**：
  - 窄屏阅读宽度自适应，正文不溢出。
  - 导航在移动端以菜单/dock 呈现（Narrow 内置 dock），可触达。
  - 语音播放器、复制 MD 按钮 **触摸友好**（命中区 ≥ 44px）。
  - 暗色切换在移动端可达。
  - TOC 在移动端折叠/抽屉。
  - 评论区宽度适配。

### 5.3 导航与布局
- `nav` / `footerNav` 在 `site.ts` 配置（如 `['posts','archives','tags']`）。
- 首页区块（home sections）在 `content.ts` 配置。

### 5.4 标签 / 归档
- tags-only，自动生成标签页与归档页，无需手建路由。

### 5.5 站内搜索
- **使用 Astro Narrow 内置 search**（README 已列 search 功能），MVP 不引入额外方案（Pagefind 等留作增强备选）。
- 搜索框在站顶/侧边，命中标题与正文。

### 5.6 评论（Giscus）
- 文章详情页底部放 Giscus 组件。
- 需峰哥网页一步：去 **giscus.app** 授权 `Lancernix/note` + 选 discussion category，拿到 `data-repo-id` / `data-category-id`。
- 配置进 `site.ts` 的 comments 或 Giscus 组件（Narrow 已预留 comments 配置位）。

### 5.7 复制为 Markdown（读者侧）
- 文章页提供「 **复制为 Markdown** 」按钮。
- 行为：复制该文 **完整 md 源码**（含 frontmatter + 正文）。
- 末尾自动追加来源注释：
  ```markdown
  > 原文：<文章永久链接>
  ```
- 实现：优先 `navigator.clipboard.write([new ClipboardItem({'text/plain': blob})])`；降级 `textarea + execCommand`。
- 复制成功给 toast 提示。

### 5.8 语音阅读（OSS + 极简播放）★重点
**峰哥决策**：先转完音频（手动脚本），存 OSS，页面只放极简播放器直链播放；自动化时机暂不定。

**为什么走 OSS 更合适**（已与峰哥确认）：
- 大文件不进 git repo → 仓库干净、clone 快、无 LFS 负担。
- 构建不处理音频 → Vercel 部署更快，且 **无需在 CI 放 TTS/OSS 密钥**。
- 页面直链 `<audio src="https://<bucket>.<endpoint>/audio/<slug>.mp3">`，实现极简。
- OSS 天然公读 + 可挂 CDN，适合静态资源分发；一周一篇成本可忽略。

**生成流程（`scripts/tts.mjs`）**：
1. 读 `src/content/posts/*.md`，提取正文纯文本（清洗 md 语法、代码块按需跳过或标注）。
2. 调 TTS 抽象层 `provider.synthesize(text)` → 音频二进制。
3. **长文拆分**：按标点/字数切 chunk，逐个合成后拼接（各家 API 有字数上限）。
4. 上传 OSS（`ali-oss` SDK 或 `ossutil cp`）→ `audio/{slug}.mp3`，bucket 设为公共读。
5. 记录 URL：写 `public/manifest.json`（`{ [slug]: ossUrl }`），**不改 md frontmatter**。

**播放（`AudioPlayer.astro` 组件，文章详情页）**：
- 极简 UI：播放/暂停、进度条、当前/总时长、**倍速（0.75 / 1 / 1.25 / 1.5 / 2）**。
- 音频源 = OSS URL（按 slug 拼 `base + slug.mp3`，或读 manifest）。
- 倍速用原生 `audio.playbackRate` 实现。
- 移动端适配（触摸控件、宽度自适应）。

**TTS 抽象层**：
```ts
interface TtsProvider {
  synthesize(text: string): Promise<Buffer>;
}
class MockProvider implements TtsProvider { /* 占位音频，跑通链路 */ }
class AliyunTtsProvider implements TtsProvider { /* 后续接入，倾向阿里云，与 OSS 同生态 */ }
```
> MVP 用 MockProvider 把「生成 → 上传 OSS → 播放器播放」全链路跑通；TTS 供应商确定后只换 provider，脚本逻辑不变。

**凭证管理**：OSS AK/SK、TTS key 仅存本地 `.env.local`（gitignore），**不进 Vercel、不进 git**。

### 5.9 SEO / 性能
- Astro Narrow 内置 RSS、sitemap、SEO、OpenGraph。
- Lighthouse 性能 / SEO ≥ 90。
- 结构化数据（JSON-LD）。

---

## 6. 架构与目录

```
blog/
├─ src/
│  ├─ config/              # site.ts / content.ts / theme.ts / i18n.ts（Narrow 内置）
│  ├─ content/posts/       # Markdown 文章（写作入口）
│  ├─ components/
│  │  ├─ AudioPlayer.astro # 新增：极简播放器（倍速/暂停/进度）
│  │  ├─ CopyMdButton.astro# 新增：复制为 MD
│  │  └─ Giscus.astro      # 新增 / 或复用 Narrow comments 位
│  ├─ layouts/
│  └─ pages/               # 路由（首页/文章/标签/归档/关于）
├─ scripts/
│  └─ tts.mjs              # 新增：TTS 合成 + OSS 上传 + manifest
├─ public/
│  └─ manifest.json        # 音频 URL 映射（由脚本生成）
├─ .env.local              # OSS/TTS 凭证（gitignore）
├─ astro.config.mjs
├─ vercel.json
└─ package.json
```
> 说明：音频文件 **不在此仓库**，存于 OSS；`public/` 仅放站点静态资源。

---

## 7. 语音阅读详细设计

### 7.1 脚本接口
```bash
node scripts/tts.mjs all          # 全量转换（MVP 量级小，可全量）
node scripts/tts.mjs my-post      # 只转某篇（按文件名/slug）
```
- 输出：`public/manifest.json` + OSS 上的 `audio/{slug}.mp3`。
- 幂等：已存在且 md 未变更可跳过（后续优化，MVP 可每次覆盖）。

### 7.2 OSS 上传
- SDK：`ali-oss`（Node），或 CLI `ossutil cp`。
- Bucket：公共读；路径 `audio/{slug}.mp3`。
- 可选：挂 CDN 加速域名，页面用 CDN 域名。

### 7.3 播放器
- 基于 `new Audio(url)` + 自定义控件；倍速 `audio.playbackRate = rate`。
- 样式跟随 Narrow 的 theme tokens，保证暗色/亮色一致。

### 7.4 自动化（后续，本期不做）
- 构建期前置：`package.json` 的 `build` 先跑 `tts.mjs` 再 `astro build`。
- 或 GitHub Action：监听 posts 变动批量转。
- 现在用手动脚本即可，不阻塞 MVP。

---

## 8. 部署与 CI/CD

- Vercel 连接 `Lancernix/note`，默认分支 `master`（与仓库默认分支一致）。
- 自定义域名 `note.lancernix.space`：DNS CNAME → Vercel，开启 HTTPS。
- 环境变量：Giscus 的 `data-*` 为公开信息，可硬编码进组件或 Vercel 环境变量。
- OSS / TTS 凭证：**仅本地 `.env.local`**，不配置到 Vercel。
- 包管理：Astro Narrow 用 pnpm；Vercel 自动识别，或统一改为 npm（PLAN 中定）。

---

## 9. 里程碑

- **M1 基础博客**：Astro Narrow 初始化 + Vercel/域名 + 列表/详情/标签/归档/搜索/暗色/移动端 + Giscus 接入 + Git 发布验证。
- **M2 复制为 Markdown**：`CopyMdButton` 组件。
- **M3 语音阅读**：`tts.mjs`（mock + OSS 上传）+ `AudioPlayer`（倍速/暂停/进度）+ 供应商确定后接真实 TTS。
- **M4（可选）**：语音自动化（构建期/Action）。

> M1 不依赖 TTS/OSS 决策，可立即开工；语音链路 M3 先用 mock 跑通。

---

## 10. 待定项

- [ ] **Giscus**：峰哥去 giscus.app 授权 `Lancernix/note` + 选 category，给 `repo-id` / `category-id`。
- [ ] **OSS**：bucket 名、endpoint、是否挂 CDN。
- [ ] **TTS 供应商**：倾向阿里云（与 OSS 同生态），待确认；对应 AK/SK。
- [ ] `contentWidth` 具体值（窄化到多少，移动端长文体验）。
- [ ] 是否启用 `projects` 内容类型。

---

## 11. 验收标准（Checklist）

- [ ] `git push` 后 Vercel 自动部署，新文章可见。
- [ ] 暗色模式可切换并持久化。
- [ ] 移动端（≤480px）阅读/导航/播放器/复制按钮均可用且触摸友好。
- [ ] 站内搜索命中标题与正文。
- [ ] 评论可提交（Giscus）。
- [ ] 「复制为 Markdown」产出含来源链接的干净 md。
- [ ] 文章页有极简播放器，能播放 OSS 上的音频（mock 阶段为占位音频），支持倍速/暂停/进度。
- [ ] Lighthouse 性能 / SEO ≥ 90。

---

## 12. 风险与对策

| 风险 | 对策 |
|---|---|
| TTS 供应商未定 | MockProvider 跑通全链路，不影响 M1/M2 |
| OSS 凭证泄露 | 仅本地 `.env.local` + gitignore，不进 Vercel/git |
| Astro Narrow 仍在演进 | `package.json` 锁定版本号，升级谨慎评估 |
| 音频与文章不同步 | manifest 按 slug 映射；后续加 md 哈希跳过未变更 |
