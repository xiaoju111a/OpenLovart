# 图片/视频上传消失问题 - 调试指南

## 🐛 问题描述
上传图片或视频后，元素会立即消失

## 🔍 已修复的问题

### 1. **useSupabase Hook 频繁重建**
**问题**: 每次 session 对象引用改变时，都会创建新的 Supabase 客户端，导致 `loadProject` 被重复调用

**修复**: 
- 添加 `sessionIdRef` 来跟踪 session ID
- 只在 session ID 真正改变时才重新创建客户端

```typescript
const sessionIdRef = useRef<string | null>(null);

// Only create a new client if the session ID has changed
if (sessionIdRef.current === session.id) {
  return;
}
```

### 2. **loadProject 重复执行**
**问题**: `loadProject` 在 supabase 客户端更新时会重复执行，覆盖刚添加的元素

**修复**:
- 添加 `hasLoadedRef` 标志，确保项目只加载一次
- 只在真正需要时加载项目

```typescript
const hasLoadedRef = useRef(false);
useEffect(() => {
  if (projectId && user && supabase && !hasLoadedRef.current) {
    hasLoadedRef.current = true;
    loadProject(projectId);
  }
}, [projectId, user, supabase, loadProject]);
```

### 3. **自动保存在初始化时触发**
**问题**: 在项目加载完成前就触发自动保存，可能导致空数据覆盖

**修复**:
- 添加 `isInitializedRef` 标志
- 只在初始化完成后才启用自动保存

```typescript
const isInitializedRef = useRef(false);

// Mark as initialized after loading completes
useEffect(() => {
  if (!isLoading && !isInitializedRef.current) {
    isInitializedRef.current = true;
  }
}, [isLoading]);

// Auto-save only after initialization
useEffect(() => {
  if (!user || isLoading || !isInitializedRef.current) return;
  // ... auto-save logic
}, [elements, title, user, isLoading]);
```

## 🧪 测试步骤

### 测试 1: 新项目上传图片
1. 访问 `/lovart/canvas`（不带 ID 参数）
2. 点击左侧工具栏的 "+" 按钮
3. 选择 "上传图片"
4. 选择一张图片
5. ✅ 图片应该显示在画布上并保持可见

### 测试 2: 现有项目上传图片
1. 访问 `/lovart/canvas?id=xxx`（已有项目）
2. 等待项目加载完成
3. 点击左侧工具栏的 "+" 按钮
4. 选择 "上传图片"
5. 选择一张图片
6. ✅ 图片应该显示在画布上并保持可见

### 测试 3: 上传视频
1. 访问 `/lovart/canvas`
2. 点击左侧工具栏的 "+" 按钮
3. 选择 "上传视频"
4. 选择一个视频文件
5. ✅ 视频应该显示在画布上并保持可见

### 测试 4: 自动保存
1. 上传一张图片
2. 等待 2 秒
3. 检查右上角状态
4. ✅ 应该显示 "✅ 已保存"
5. 刷新页面
6. ✅ 图片应该仍然存在

## 🔧 调试技巧

### 检查控制台日志
打开浏览器开发者工具（F12），查看 Console 标签：

```javascript
// 应该看到的日志
"Supabase client created with session: user_xxxxx"

// 不应该看到的日志（重复出现）
"Multiple GoTrueClient instances detected"
"Failed to load project"
```

### 检查 React DevTools
1. 安装 React DevTools 扩展
2. 查看 `LovartCanvas` 组件的状态
3. 观察 `elements` 数组的变化
4. 确认上传后 `elements.length` 增加

### 检查网络请求
在 Network 标签中：
1. 过滤 Supabase 请求
2. 上传图片后应该看到：
   - 一个 INSERT 请求（保存项目）
   - 一个 INSERT 请求（保存元素）
3. 不应该看到立即的 SELECT 请求（重新加载）

## 📊 预期行为

### 正常流程
1. 用户上传图片 → `handleAddImage` 被调用
2. FileReader 读取文件 → 转换为 base64
3. 创建新元素 → `setElements(prev => [...prev, newElement])`
4. 元素显示在画布上
5. 2 秒后 → 自动保存触发
6. 保存成功 → 显示 "✅ 已保存"

### 异常流程（已修复）
1. ❌ 用户上传图片
2. ❌ 元素被添加到状态
3. ❌ `useSupabase` 重新创建客户端
4. ❌ `loadProject` 被触发
5. ❌ 旧数据覆盖新数据
6. ❌ 图片消失

## 🎯 关键修复点总结

1. **防止 Supabase 客户端频繁重建** - 使用 session ID 比较
2. **防止项目重复加载** - 使用 hasLoadedRef 标志
3. **防止过早自动保存** - 使用 isInitializedRef 标志
4. **只在有数据时设置元素** - 检查 canvasElements.length > 0

## 🚀 如果问题仍然存在

1. 清除浏览器缓存和 localStorage
2. 重启开发服务器
3. 检查是否有其他 useEffect 在修改 elements
4. 在 `setElements` 调用处添加 console.log 追踪
5. 使用 React DevTools Profiler 查看重渲染

## 📝 额外建议

考虑添加以下功能来改善用户体验：

1. **上传进度指示器** - 显示文件正在上传
2. **错误处理** - 文件太大或格式不支持时提示
3. **图片预加载** - 确保图片完全加载后再显示
4. **撤销/重做** - 允许用户恢复误删的元素
