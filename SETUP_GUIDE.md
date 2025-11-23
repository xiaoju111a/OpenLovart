# Lovart UI - Clerk + Supabase 集成设置指南

本指南将帮助你完成 Lovart UI 项目的 Clerk 认证和 Supabase 数据库集成。

## 📋 前置要求

- Node.js 18+ 已安装
- npm 或 yarn 包管理器
- 一个 Clerk 账号（免费）
- 一个 Supabase 账号（免费）

---

## 🔐 步骤 1: 设置 Clerk 认证

### 1.1 创建 Clerk 应用

1. 访问 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 点击 "Add application" 创建新应用
3. 选择你想要的登录方式（推荐：Email + Google）
4. 创建完成后，你会看到 API Keys

### 1.2 获取 Clerk API 密钥

在 Clerk Dashboard 的 "API Keys" 页面，复制以下密钥：

- **Publishable key** (以 `pk_` 开头)
- **Secret key** (以 `sk_` 开头)

### 1.3 配置 Clerk JWT 模板（重要！）

为了与 Supabase 集成，需要创建一个 JWT 模板：

1. 在 Clerk Dashboard 中，进入 **JWT Templates**
2. 点击 **+ New template**
3. 选择 **Supabase** 作为模板类型
4. 模板名称设置为 `supabase`
5. 保存模板

---

## 🗄️ 步骤 2: 设置 Supabase 数据库

### 2.1 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - Name: `lovart-ui` (或你喜欢的名称)
   - Database Password: 设置一个强密码（保存好！）
   - Region: 选择离你最近的区域
4. 等待项目创建完成（约 2-3 分钟）

### 2.2 获取 Supabase API 密钥

在 Supabase Dashboard 的 **Settings > API** 页面，复制：

- **Project URL**
- **anon public** key

### 2.3 配置 Supabase 认证

1. 在 Supabase Dashboard，进入 **Authentication > Providers**
2. 找到 **Clerk** 部分
3. 启用 Clerk 作为第三方认证提供商
4. 从 Clerk Dashboard 复制 **JWKS Endpoint URL**：
   - 在 Clerk Dashboard，进入 **API Keys**
   - 复制 **JWKS URL**（类似 `https://your-app.clerk.accounts.dev/.well-known/jwks.json`）
5. 粘贴到 Supabase 的 Clerk 配置中
6. 保存设置

### 2.4 运行数据库迁移

1. 在 Supabase Dashboard，进入 **SQL Editor**
2. 打开项目根目录的 `supabase-schema.sql` 文件
3. 复制所有内容
4. 粘贴到 Supabase SQL Editor
5. 点击 **Run** 执行 SQL

这将创建以下表：
- `projects` - 存储用户的项目
- `canvas_elements` - 存储画布元素数据

并且会自动设置好 **行级安全（RLS）策略**，确保用户只能访问自己的数据。

---

## 🔧 步骤 3: 配置环境变量

### 3.1 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件（如果不存在）：

```bash
# 复制 .env.example 文件
cp .env.example .env.local
```

### 3.2 填写环境变量

编辑 `.env.local` 文件，填入你的密钥：

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk URLs (使用默认值即可)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# Google Gemini AI (如果已有)
GEMINI_API_KEY=your_gemini_api_key
```

⚠️ **重要提示**：
- 不要把 `.env.local` 提交到 Git
- 确保 `.gitignore` 包含 `.env.local`
- 所有以 `NEXT_PUBLIC_` 开头的变量会暴露到客户端

---

## 🚀 步骤 4: 启动项目

### 4.1 安装依赖（如果还没安装）

```bash
npm install
```

### 4.2 启动开发服务器

```bash
npm run dev
```

### 4.3 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

---

## ✅ 步骤 5: 测试集成

### 5.1 测试认证

1. 访问 Dashboard 页面
2. 点击右上角的 "Sign In" 按钮
3. 使用 Email 或 Google 登录
4. 登录成功后，应该能看到用户头像

### 5.2 测试项目保存

1. 登录后，点击 "New Project" 创建新项目
2. 在画布上添加一些元素（图片、文字、形状）
3. 修改项目标题
4. 观察右上角的保存状态：
   - 🔄 "保存中..." - 正在保存
   - ✅ "已保存" - 保存成功
   - ❌ "离线" - 保存失败

### 5.3 测试项目加载

1. 返回 Dashboard
2. 你应该能看到刚才创建的项目
3. 点击项目卡片
4. 项目应该加载并显示之前创建的所有元素

### 5.4 测试多设备同步

1. 在另一个浏览器或设备上登录同一账号
2. 应该能看到相同的项目列表
3. 在一个设备上修改项目，另一个设备刷新后应该能看到更新

---

## 🔍 故障排除

### 问题 1: "离线" 状态持续显示

**可能原因**：
- Supabase 环境变量配置错误
- Clerk JWT 模板未配置
- RLS 策略未正确设置

**解决方法**：
1. 检查 `.env.local` 中的 Supabase 密钥是否正确
2. 确认 Clerk 中创建了名为 `supabase` 的 JWT 模板
3. 在 Supabase SQL Editor 重新运行 `supabase-schema.sql`

### 问题 2: 无法保存项目

**检查步骤**：
1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签是否有错误信息
3. 查看 Network 标签，检查 Supabase 请求是否成功
4. 确认用户已登录（右上角有用户头像）

### 问题 3: RLS 策略错误

如果看到类似 "new row violates row-level security policy" 的错误：

1. 进入 Supabase Dashboard > Authentication > Policies
2. 检查 `projects` 和 `canvas_elements` 表的策略
3. 确保策略使用的是 `auth.jwt()->>'sub'` 而不是 `auth.uid()`

### 问题 4: 项目列表为空

1. 打开浏览器开发者工具
2. 检查 Network 标签中的 Supabase 请求
3. 如果返回 401 Unauthorized，说明 Clerk-Supabase 集成有问题：
   - 检查 Clerk JWT 模板是否正确配置
   - 检查 Supabase 的 Clerk 第三方认证是否启用
   - 确认 JWKS URL 正确

---

## 📚 功能说明

### 自动保存

- 项目会在用户停止编辑 **2 秒后** 自动保存
- 每次修改标题、添加/删除/移动元素都会触发自动保存
- 保存过程中会显示 "保存中..." 状态

### 项目管理

- **创建项目**：点击 "New Project" 自动创建并分配唯一 ID
- **编辑项目**：通过 URL 参数 `?id=xxx` 加载特定项目
- **项目列表**：Dashboard 显示按更新时间排序的所有项目

### 数据结构

**projects 表**：
- `id` - 项目唯一标识符 (UUID)
- `user_id` - 用户 Clerk ID（自动从 JWT 获取）
- `title` - 项目标题
- `thumbnail` - 项目缩略图（可选）
- `created_at` - 创建时间
- `updated_at` - 更新时间（自动更新）

**canvas_elements 表**：
- `id` - 元素唯一标识符 (UUID)
- `project_id` - 关联的项目 ID
- `element_data` - 元素数据（JSONB 格式）
- `created_at` - 创建时间
- `updated_at` - 更新时间（自动更新）

---

## 🎯 下一步

集成完成后，你可以：

1. ✨ 自定义 Clerk 登录页面样式
2. 📸 实现项目缩略图自动生成
3. 🔗 添加项目分享功能
4. 👥 实现多人协作编辑
5. 💾 添加版本历史功能
6. 🗑️ 实现项目删除和恢复

---

## 📞 获取帮助

- **Clerk 文档**: https://clerk.com/docs
- **Supabase 文档**: https://supabase.com/docs
- **Clerk + Supabase 集成**: https://clerk.com/docs/integrations/databases/supabase

---

祝你使用愉快！🎉
