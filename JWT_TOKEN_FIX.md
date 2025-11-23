# JWT 令牌过期问题修复

## 🐛 问题描述

错误信息：
```
Failed to save project: {code: 'PGRST303', details: null, hint: null, message: 'JWT expired'}
Error code: PGRST303
Error message: JWT expired
```

## 🔍 根本原因

之前的实现在创建 Supabase 客户端时获取一次 JWT 令牌，然后一直使用这个令牌。但是：
1. JWT 令牌有过期时间（通常是 1 小时）
2. 令牌过期后，所有数据库操作都会失败
3. 用户需要刷新页面才能获取新令牌

## ✅ 修复方案

修改 `useSupabase` hook，让它在**每次请求时**都获取新的令牌：

### 之前的代码（有问题）
```typescript
// 只在创建客户端时获取一次令牌
const token = await session.getToken({ template: 'supabase' });

const client = createClient(url, key, {
  global: {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  },
});
```

### 修复后的代码
```typescript
// 使用函数，每次请求时都获取新令牌
const client = createClient(url, key, {
  global: {
    headers: async () => {
      // 每次请求都会调用这个函数
      const token = await session.getToken({ template: 'supabase' });
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  },
});
```

## 🎯 关键改进

1. **动态令牌获取**: `headers` 现在是一个异步函数，而不是静态对象
2. **自动刷新**: Clerk 会自动管理令牌刷新，我们只需要每次请求时获取最新的
3. **无需手动刷新**: 用户不需要刷新页面，令牌会自动更新

## 🧪 测试步骤

### 1. 重启开发服务器
```bash
# 停止服务器 (Ctrl+C)
npm run dev
```

### 2. 测试长时间使用
1. 访问 `http://localhost:3000/lovart/canvas`
2. 登录并创建项目
3. 添加一些元素
4. **等待 5-10 分钟**（不要刷新页面）
5. 再添加更多元素
6. ✅ 应该仍然能够保存，不会出现 "JWT expired" 错误

### 3. 检查控制台
打开浏览器控制台，应该看到：
```
Starting save... { userId: 'user_xxx', projectId: 'xxx', elementsCount: 2 }
Save successful!
```

**不应该看到**:
```
Failed to save project: JWT expired
Error code: PGRST303
```

## 📊 令牌生命周期

### 正常流程
```
用户登录
  ↓
获取 JWT 令牌 (有效期 1 小时)
  ↓
使用令牌访问 Supabase
  ↓
令牌快过期时，Clerk 自动刷新
  ↓
下次请求时获取新令牌
  ↓
继续正常使用
```

### 之前的问题流程
```
用户登录
  ↓
获取 JWT 令牌 (有效期 1 小时)
  ↓
创建 Supabase 客户端（使用这个令牌）
  ↓
1 小时后令牌过期
  ↓
❌ 所有请求失败 "JWT expired"
  ↓
用户必须刷新页面
```

## 🔧 其他相关修复

### 1. 移除 sessionIdRef
不再需要跟踪 session ID，因为我们使用 `useMemo` 和 session 依赖

### 2. 简化代码
- 移除 `useState` 和 `useEffect`
- 使用 `useMemo` 直接返回客户端
- 代码更简洁，更容易理解

### 3. 性能优化
- `useMemo` 确保只在 session 改变时重新创建客户端
- 每次请求时获取令牌的开销很小（Clerk 有缓存）

## 🎓 技术细节

### Supabase 客户端配置

Supabase JS 客户端支持两种 headers 配置：

**静态 headers（之前的方式）**:
```typescript
{
  global: {
    headers: {
      Authorization: 'Bearer token123'
    }
  }
}
```

**动态 headers（新方式）**:
```typescript
{
  global: {
    headers: async () => {
      return {
        Authorization: 'Bearer ' + await getToken()
      };
    }
  }
}
```

### Clerk 令牌管理

Clerk 的 `session.getToken()` 方法：
- 如果令牌有效，立即返回缓存的令牌
- 如果令牌快过期，自动刷新后返回新令牌
- 如果令牌已过期，获取新令牌后返回
- 整个过程对开发者透明

## ✅ 验证修复

### 快速测试
1. 登录并创建项目
2. 添加元素
3. 等待 2 秒
4. 检查右上角显示 "✅ 已保存"
5. ✅ 成功！

### 长时间测试
1. 登录并创建项目
2. 保持页面打开 10-15 分钟
3. 添加新元素
4. ✅ 应该仍然能够保存

### 压力测试
1. 快速添加多个元素
2. 每个元素都会触发自动保存
3. ✅ 所有保存都应该成功

## 🚨 如果问题仍然存在

### 检查 1: Clerk JWT 模板
访问 Clerk Dashboard → JWT Templates
- 确认存在名为 `supabase` 的模板
- 模板应该包含 `sub` 声明

### 检查 2: Supabase 配置
访问 Supabase Dashboard → Authentication → Providers
- 确认 Clerk 已启用
- JWKS URL 正确配置

### 检查 3: 令牌内容
访问 `/debug-auth` 页面
- 检查 JWT Token 是否包含 `sub` 字段
- 检查令牌是否有效

### 检查 4: 浏览器控制台
查看是否有其他错误：
```javascript
// 应该看到
Starting save...
Save successful!

// 不应该看到
JWT expired
PGRST303
401 Unauthorized
```

## 📝 总结

**修复前**: 令牌在客户端创建时获取一次，1 小时后过期导致所有操作失败

**修复后**: 每次请求时动态获取令牌，Clerk 自动管理刷新，永不过期

这个修复确保了：
- ✅ 用户可以长时间使用应用而不需要刷新
- ✅ 令牌自动刷新，无需手动处理
- ✅ 更好的用户体验
- ✅ 更可靠的数据保存

现在重启服务器，JWT 过期问题应该完全解决了！
