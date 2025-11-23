# 问题修复总结

## ✅ 已修复的问题

### 1. 上下文工具栏不显示
**问题**: 选中图片元素时没有显示上下文操作 UI

**修复**:
- 将工具栏定位逻辑从 ContextToolbar 组件移到 CanvasArea
- 使用 scale 和 pan 计算正确的屏幕位置
- 添加 z-index 确保工具栏在最上层
- 排除 connector 类型元素（不需要工具栏）

```typescript
<div
    style={{
        position: 'absolute',
        left: (selectedElement.x + (selectedElement.width || 0) / 2) * scale + pan.x,
        top: (selectedElement.y - 60) * scale + pan.y,
        transform: 'translateX(-50%)',
        zIndex: 100,
    }}
>
    <ContextToolbar ... />
</div>
```

### 2. 流程图拖动时其他元素乱飞
**问题**: 拖动一个图片时，关联的流程图元素也会跟着移动

**修复**:
- 简化拖动逻辑，只移动选中的元素
- 移除自动移动 linkedElements 的代码
- 连接线会自动更新位置（因为它们基于元素位置计算）

**之前**:
```typescript
// 会移动所有 linkedElements
if (element?.linkedElements) {
    element.linkedElements.forEach(linkedId => {
        // 移动关联元素
    });
}
```

**现在**:
```typescript
// 只移动选中的元素
dragStartRef.current.initialPositions.forEach(pos => {
    onElementChange(pos.id, {
        x: pos.x + dx,
        y: pos.y + dy,
    });
});
```

### 3. 视频只显示为图片
**问题**: 上传的视频文件显示为静态图片，无法播放

**修复**:
- 为视频元素添加 controls 属性
- 移除 pointer-events-none（允许点击控制条）
- 添加 onClick 阻止事件冒泡
- 使用 div 包裹确保圆角正确显示

```typescript
<div className="relative w-full h-full rounded-lg overflow-hidden">
    <video 
        src={el.content} 
        className="w-full h-full object-cover select-none"
        controls  // 显示播放控制条
        loop
        playsInline
        onClick={(e) => e.stopPropagation()}  // 防止拖动
    />
</div>
```

### 4. 数据库一直显示离线
**问题**: 保存状态一直显示"离线"，无法保存到数据库

**可能原因**:
1. Clerk JWT 令牌未正确配置
2. Supabase 客户端未初始化
3. RLS 策略验证失败

**修复**:
- 添加详细的日志输出
- 检查 user 和 supabase 状态
- 显示具体的错误代码和消息

**调试步骤**:
1. 打开浏览器控制台
2. 查看保存时的日志：
   ```
   Starting save... { userId: 'user_xxx', projectId: 'xxx', elementsCount: 2 }
   ```
3. 如果看到 "Save skipped: No user logged in"
   - 检查右上角是否显示用户头像
   - 访问 /debug-auth 检查认证状态
4. 如果看到 "RLS Policy Error"
   - 访问 /debug-auth 测试 JWT 令牌
   - 确认 Clerk JWT 模板已配置

### 5. 图像生成 API 500 错误
**问题**: POST /api/generate-image 返回 500 错误

**修复**:
- 使用环境变量而不是硬编码 API key
- 添加 API key 检查
- 改进错误处理和日志

```typescript
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
    );
}
```

## 🧪 测试清单

### 测试 1: 上下文工具栏
- [ ] 上传一张图片
- [ ] 点击图片选中
- [ ] ✅ 应该在图片上方显示工具栏
- [ ] 工具栏包含：尺寸、替换背景、Mockup、编辑、流程、扩展、复制、下载、删除

### 测试 2: 视频播放
- [ ] 上传一个视频文件
- [ ] 视频应该显示在画布上
- [ ] ✅ 视频应该有播放控制条
- [ ] 点击播放按钮可以播放视频
- [ ] 可以调整音量、全屏等

### 测试 3: 流程图拖动
- [ ] 上传一张图片
- [ ] 点击工具栏的"流程"按钮
- [ ] 创建流程图连接
- [ ] 拖动源图片
- [ ] ✅ 只有源图片移动，其他元素不动
- [ ] 连接线自动更新位置

### 测试 4: 数据库保存
- [ ] 确保已登录（右上角有头像）
- [ ] 上传图片或添加元素
- [ ] 等待 2 秒
- [ ] ✅ 右上角显示"✅ 已保存"
- [ ] 刷新页面，元素仍然存在

### 测试 5: 图像生成
- [ ] 点击工具栏的"扩展元素"按钮
- [ ] 输入提示词
- [ ] 点击生成
- [ ] ✅ 应该成功生成图片
- [ ] 如果失败，检查控制台错误

## 🔍 调试技巧

### 检查认证状态
访问: `http://localhost:3000/debug-auth`

应该看到：
- ✅ Clerk 用户信息 - 已登录
- ✅ JWT Token - 已获取
- ✅ Token 中包含 sub 字段
- ✅ Supabase 连接测试 - 成功

### 检查控制台日志

**正常保存流程**:
```
Starting save... { userId: 'user_xxx', projectId: null, elementsCount: 1 }
Save successful!
```

**认证问题**:
```
Save skipped: No user logged in
// 或
Save skipped: Supabase client not initialized
```

**RLS 策略问题**:
```
Failed to save project: {...}
Error code: 42501
RLS Policy Error: User not authenticated properly
```

### 检查视频元素

在 React DevTools 中：
1. 找到 CanvasArea 组件
2. 查看 elements 数组
3. 找到 type: 'video' 的元素
4. 确认 content 包含 base64 数据

## 🚀 如果问题仍然存在

### 数据库离线问题
1. 访问 `/debug-auth` 检查认证
2. 检查 Clerk Dashboard 的 JWT 模板
3. 检查 Supabase Dashboard 的 Clerk 配置
4. 查看浏览器控制台的详细错误

### 工具栏不显示
1. 检查元素是否真的被选中（蓝色边框）
2. 检查浏览器控制台是否有错误
3. 尝试缩放画布（可能工具栏在屏幕外）
4. 检查 z-index 是否被其他元素覆盖

### 视频不播放
1. 检查视频文件格式（推荐 mp4）
2. 检查文件大小（太大可能加载慢）
3. 检查浏览器是否支持该格式
4. 打开浏览器控制台查看视频加载错误

### 图像生成失败
1. 检查 `.env.local` 中的 `GEMINI_API_KEY`
2. 检查 API key 是否有效
3. 检查网络连接
4. 查看控制台的详细错误信息

## 📝 环境变量检查

确保 `.env.local` 包含：

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# Gemini AI
GEMINI_API_KEY=AIzaSyAxxxxx
```

修改后需要重启开发服务器：
```bash
# 停止服务器 (Ctrl+C)
npm run dev
```

## 🎯 关键改进

1. **工具栏定位** - 现在正确跟随画布缩放和平移
2. **拖动行为** - 更符合直觉，不会意外移动其他元素
3. **视频支持** - 完整的播放控制
4. **错误日志** - 更详细的调试信息
5. **API 安全** - 使用环境变量而不是硬编码

所有修复都已应用，刷新页面即可看到效果！
