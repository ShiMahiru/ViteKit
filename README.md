# Yuln 的博客

一个基于 SvelteKit 和 Vite 的静态博客项目。文章使用 Markdown 编写，构建后输出为纯静态文件，可部署到 Vercel、Cloudflare Pages 或 Cloudflare Workers Static Assets。

## 功能

- Markdown 文章与 frontmatter 元数据
- 首页文章列表、文章详情、归档、标签、搜索
- RSS、sitemap、robots.txt
- Giscus 评论
- 深色 / 浅色主题切换
- 代码高亮、Mermaid 渲染、图片查看器
- 静态构建输出到 `build/`

## 技术栈

- SvelteKit
- Vite
- mdsvex
- TypeScript
- @sveltejs/adapter-static
- Giscus

## 目录

```text
src/
├── config.ts              # 站点标题、图标、Giscus 配置
├── posts/                 # Markdown 文章
├── lib/
│   ├── components/        # 页面组件
│   └── utils/             # 文章、Markdown、渲染工具
└── routes/                # 页面路由、RSS、sitemap、robots
```

## 开发

```bash
pnpm install
pnpm dev
```

本地开发默认地址：

```text
http://localhost:5173/
```

## 构建

```bash
pnpm build
```

构建产物会生成到 `build/`。

## 检查

```bash
pnpm check
```

## 新建文章

```bash
pnpm new-post
```

文章放在 `src/posts/`，通过 frontmatter 控制标题、发布时间、标签、是否置顶、是否显示目录等信息。

## 部署

### Vercel

项目已提供 `vercel.json`：

- Build Command: `pnpm run build`
- Output Directory: `build`

导入 GitHub 仓库后即可部署。

### Cloudflare Pages

- Build command: `pnpm run build`
- Output directory: `build`

### Cloudflare Workers

项目已提供 `wrangler.jsonc`，使用 Workers Static Assets 部署 `build/`。

```bash
pnpm deploy:workers
```
