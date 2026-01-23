# OpenLovart 🎨

[English](./README.md) | 中文

[![GitHub stars](https://img.shields.io/github/stars/xiaoju111a/OpenLovart?style=social)](https://github.com/xiaoju111a/OpenLovart/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/xiaoju111a/OpenLovart?style=social)](https://github.com/xiaoju111a/OpenLovart/network/members)
[![GitHub issues](https://img.shields.io/github/issues/xiaoju111a/OpenLovart)](https://github.com/xiaoju111a/OpenLovart/issues)
[![GitHub license](https://img.shields.io/github/license/xiaoju111a/OpenLovart)](https://github.com/xiaoju111a/OpenLovart/blob/master/LICENSE)

OpenLovart 是一个基于 AI 的设计平台，让创意设计变得简单而强大。通过 AI 对话和智能画布，快速实现你的设计想法。

## ✨ 主要功能

- 🤖 **AI 设计助手** - 通过自然语言对话生成设计方案
- 🎨 **智能画布** - 可视化编辑器，支持拖拽、缩放、旋转等操作
- 🖼️ **AI 图像生成** - 集成 Google Gemini 和 X.AI Grok，生成高质量图像
- 💾 **项目管理** - 保存和管理你的设计项目
- 👤 **用户系统** - 基于 Clerk 的安全认证和积分系统
- ☁️ **云端存储** - 使用 Supabase 实现数据持久化

## 🚀 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **认证**: Clerk
- **数据库**: Supabase (PostgreSQL)
- **AI 服务**: 
  - Google Gemini (图像生成)
  - X.AI Grok (设计建议)
- **部署**: Vercel

## 📦 快速开始

### 1. 克隆项目

```bash
git clone git@github.com:xiaoju111a/OpenLovart.git
cd OpenLovart
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入你的 API 密钥：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# X.AI Grok API (可选)
XAI_API_KEY=your_xai_api_key
```

### 4. 设置数据库

在 Supabase 中执行 `supabase-schema.sql` 创建必要的表：

```sql
-- 在 Supabase SQL Editor 中运行
-- 文件位置: ./supabase-schema.sql
```

### 5. 配置 Clerk JWT 模板

参考 `CLERK_JWT_SETUP.md` 文档配置 Clerk 的 Supabase JWT 模板。

### 6. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🔑 获取 API 密钥

### Clerk (认证服务)
1. 访问 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 创建新应用
3. 复制 Publishable Key 和 Secret Key

### Supabase (数据库)
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目
3. 在 Settings > API 中找到 URL 和 anon key

### Google Gemini (AI 服务)
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建 API Key

### X.AI Grok (可选)
1. 访问 [X.AI Console](https://console.x.ai/)
2. 创建 API Key

## 📁 项目结构

```
OpenLovart/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── api/               # API 路由
│   │   ├── lovart/            # 主应用页面
│   │   └── debug-*/           # 调试工具
│   ├── components/            # React 组件
│   │   └── lovart/           # 核心组件
│   ├── hooks/                # 自定义 Hooks
│   ├── lib/                  # 工具库
│   └── middleware.ts         # 中间件
├── public/                   # 静态资源
├── supabase-schema.sql      # 数据库架构
└── .env.example             # 环境变量模板
```

## 🛠️ 可用命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 运行生产服务器
npm run start

# 代码检查
npm run lint
```

## 📚 文档

- [Clerk JWT 设置](./CLERK_JWT_SETUP.md)
- [Grok 集成指南](./GROK_INTEGRATION.md)
- [用户积分功能](./USER_CREDITS_FEATURE.md)
- [故障排除](./TROUBLESHOOTING.md)

## 🚢 部署到 Vercel

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（与 `.env.local` 相同）
4. 部署！

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xiaoju111a/OpenLovart)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.com/)
- [Supabase](https://supabase.com/)
- [Google Gemini](https://ai.google.dev/)
- [X.AI](https://x.ai/)

## 📊 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=xiaoju111a/OpenLovart&type=Date)](https://star-history.com/#xiaoju111a/OpenLovart&Date)

---

Made with ❤️ by Xiaoju
