# 访谈洞察助手 | Interview Insight Tool

AI 驱动的多视角访谈分析工具。输入访谈逐字稿，自动提取关键语句，从三种不同框架生成亲和图分类，帮助发现单一视角下容易被忽略的洞察。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

打开 `.env.local` 文件，把 `sk-ant-xxxxx` 替换成你自己的 Anthropic API Key：

```
ANTHROPIC_API_KEY=sk-ant-你的真实key
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000 即可使用。

## 项目结构

```
├── app/
│   ├── api/analyze/route.ts   # 后端 API：调用 Claude，三阶段 prompt chain
│   ├── globals.css             # 全局样式
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 主页面（输入/加载/结果三种视图）
├── components/
│   ├── AffinityBoard.tsx       # 核心：多框架亲和图切换视图
│   ├── InsightsPanel.tsx       # 跨视角洞察展示
│   ├── LoadingState.tsx        # 分析进度状态
│   └── StatementCard.tsx       # 单条语句卡片
├── lib/
│   └── prompts.ts              # 三阶段 prompt 定义
└── .env.local                  # API Key（不要提交到 git）
```

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **AI**: Claude API (claude-sonnet-4-20250514)
- **语言**: TypeScript

## 部署到 Vercel

1. 把代码推到 GitHub
2. 在 vercel.com 导入项目
3. 在 Vercel 的 Environment Variables 里添加 `ANTHROPIC_API_KEY`
4. 部署完成后会得到一个公开链接，可以放在简历里
