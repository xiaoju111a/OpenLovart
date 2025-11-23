# 故障排除指南 - RLS 策略错误

## 问题描述
错误信息：`new row violates row-level security policy for table "projects"`

这个错误表示 Supabase 无法验证用户的 Clerk JWT 令牌。

## 已修复的问题

### 1. Supabase 客户端配置
✅ 修复了 `useSupabase` hook，现在正确地获取和设置 Clerk JWT 令牌

### 2. 移除显式 user_id 设置
✅ 移除了手动设置 `user_id`，让数据库使用默认值 `auth.jwt()->>'sub'`

## 验证步骤

### 步骤 1: 检查 Clerk JWT 模板

1. 访问 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 进入你的应用
3. 导航到 **JWT Templates**
4. 确认存在名为 `supabase` 的模板
5. 模板应该包含以下声明：
   ```json
   {
     "sub": "{{user.id}}"
   }
   ```

### 步骤 2: 测试认证 API

访问：`http://localhost:3000/api/test-auth`

你应该看到类似这样的响应：
```json
{
  "userId": "user_xxxxx",
  "hasSupabaseToken": true,
  "tokenPreview": "eyJhbGciOiJSUzI1NiIs...",
  "decodedToken": {
    "sub": "user_xxxxx",
    "iat": 1234567890,
    "exp": 1234567890
  }
}
```

**重要检查点**：
- ✅ `hasSupabaseToken` 应该是 `true`
- ✅ `decodedToken.sub` 应该包含你的 Clerk 用户 ID

### 步骤 3: 检查 Supabase 配置

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入你的项目
3. 导航到 **Authentication > Providers**
4. 找到 **Clerk** 部分
5. 确认已启用并配置了 JWKS URL

**JWKS URL 格式**：
```
https://[your-clerk-domain].clerk.accounts.dev/.well-known/jwks.json
```

你可以在 Clerk Dashboard 的 **API Keys** 页面找到这个 URL。

### 步骤 4: 验证数据库策略

在 Supabase SQL Editor 中运行：

```sql
-- 检查 projects 表的 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- 测试 JWT 函数
SELECT auth.jwt()->>'sub' as user_id;
```

如果 `auth.jwt()->>'sub'` 返回 NULL，说明 JWT 令牌没有正确传递。

### 步骤 5: 重新运行数据库迁移（如果需要）

如果上述检查发现问题，在 Supabase SQL Editor 中重新运行：

```sql
-- 删除现有策略
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- 重新创建策略
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  USING (auth.jwt()->>'sub' = user_id)
  WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  USING (auth.jwt()->>'sub' = user_id);
```

## 常见问题

### Q: 仍然看到 "Multiple GoTrueClient instances" 警告
A: 这是一个警告，不是错误。它不会影响功能，但可以通过确保只创建一个 Supabase 客户端实例来解决。

### Q: 令牌获取失败
A: 确保：
1. 用户已登录（右上角有用户头像）
2. Clerk JWT 模板名称正确为 `supabase`
3. 环境变量正确配置

### Q: RLS 策略仍然失败
A: 检查：
1. Supabase 中的 Clerk 第三方认证是否启用
2. JWKS URL 是否正确
3. 数据库中的 `user_id` 列类型是否为 TEXT

## 测试流程

1. 清除浏览器缓存和 cookies
2. 重新登录
3. 访问 `/api/test-auth` 验证令牌
4. 创建新项目
5. 检查浏览器控制台是否有错误

## 需要更多帮助？

如果问题仍然存在，请提供：
1. `/api/test-auth` 的响应
2. 浏览器控制台的完整错误信息
3. Supabase Dashboard 中的 RLS 策略截图
