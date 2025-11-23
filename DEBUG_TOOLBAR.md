# 工具栏调试指南

## 🔍 问题诊断

### 步骤 1: 测试独立工具栏
访问测试页面查看工具栏是否正常工作：
```
http://localhost:3000/test-toolbar
```

**预期结果**:
- ✅ 看到一个蓝色测试图片
- ✅ 图片上方有完整的工具栏
- ✅ 工具栏包含所有按钮

**如果测试页面正常**:
- 说明 ContextToolbar 组件本身没问题
- 问题在于 CanvasArea 的集成

**如果测试页面也没有工具栏**:
- 说明 ContextToolbar 组件有问题
- 检查浏览器控制台错误

### 步骤 2: 检查画布页面
访问画布页面：
```
http://localhost:3000/lovart/canvas
```

1. 上传一张图片
2. 点击图片（应该有蓝色边框）
3. 打开浏览器控制台 (F12)
4. 在 Console 中输入：

```javascript
// 检查选中状态
console.log('Selected IDs:', window.selectedIds);

// 检查元素
console.log('Elements:', window.elements);
```

### 步骤 3: 使用 React DevTools
1. 安装 React DevTools 浏览器扩展
2. 打开 DevTools
3. 切换到 "Components" 标签
4. 找到 `CanvasArea` 组件
5. 查看 Props 和 State：
   - `selectedIds` - 应该包含选中元素的 ID
   - `elements` - 应该包含所有元素
   - `isDragging` - 应该是 false
   - `isResizing` - 应该是 false
   - `isPanning` - 应该是 false
   - `isDrawing` - 应该是 false

### 步骤 4: 检查工具栏渲染条件

工具栏显示需要满足所有条件：
```typescript
selectedIds.length === 1 &&           // 只选中一个元素
selectedElement &&                     // 元素存在
!isDragging &&                         // 不在拖动
!isResizing &&                         // 不在调整大小
!isPanning &&                          // 不在平移
!isDrawing &&                          // 不在绘制
selectedElement.type !== 'connector'   // 不是连接线
```

## 🐛 常见问题

### 问题 1: 点击图片没有选中
**症状**: 点击图片后没有蓝色边框

**解决方法**:
1. 检查是否在使用"手型工具"（切换回选择工具）
2. 检查控制台是否有 JavaScript 错误
3. 尝试刷新页面

### 问题 2: 选中了但没有工具栏
**症状**: 图片有蓝色边框，但没有工具栏

**可能原因**:
1. 工具栏在屏幕外（尝试缩放画布）
2. z-index 被覆盖
3. 条件不满足（检查 React DevTools）

**调试代码**:
在 `src/components/lovart/CanvasArea.tsx` 中添加日志：

```typescript
// 在工具栏渲染前添加
console.log('Toolbar render check:', {
    selectedCount: selectedIds.length,
    hasElement: !!selectedElement,
    isDragging,
    isResizing,
    isPanning,
    isDrawing,
    elementType: selectedElement?.type,
    shouldShow: selectedIds.length === 1 && 
                selectedElement && 
                !isDragging && 
                !isResizing && 
                !isPanning && 
                !isDrawing && 
                selectedElement.type !== 'connector'
});
```

### 问题 3: 工具栏位置不对
**症状**: 工具栏显示但位置错误

**检查**:
1. 画布的 scale 值
2. 画布的 pan 值
3. 元素的 x, y, width 值

**修复**: 确保定位计算正确
```typescript
left: (selectedElement.x + (selectedElement.width || 0) / 2) * scale + pan.x,
top: (selectedElement.y - 60) * scale + pan.y,
```

## 🔧 手动修复步骤

### 如果工具栏完全不显示

1. **检查导入**:
```typescript
// 在 CanvasArea.tsx 顶部
import { ContextToolbar } from './ContextToolbar';
```

2. **检查 selectedElement 定义**:
```typescript
// 在 CanvasArea 组件中
const selectedElement = elements.find(el => selectedIds.includes(el.id));
```

3. **检查工具栏渲染代码**:
确保在 `return` 语句中，在 Content Container 之前有：

```typescript
{/* Context Toolbar */}
{selectedIds.length === 1 && selectedElement && !isDragging && !isResizing && !isPanning && !isDrawing && selectedElement.type !== 'connector' && (
    <div
        style={{
            position: 'absolute',
            left: (selectedElement.x + (selectedElement.width || 0) / 2) * scale + pan.x,
            top: (selectedElement.y - 60) * scale + pan.y,
            transform: 'translateX(-50%)',
            zIndex: 100,
        }}
    >
        <ContextToolbar
            element={selectedElement}
            onUpdate={onElementChange}
            onDelete={onDelete}
            onGenerateFromImage={onGenerateFromImage}
            onConnectFlow={onConnectFlow}
        />
    </div>
)}
```

## 📊 图像生成问题

### 检查 API 配置

1. **检查环境变量**:
```bash
# 在 .env.local 中
GEMINI_API_KEY=AIzaSy...
```

2. **重启服务器**:
```bash
# 停止服务器 (Ctrl+C)
npm run dev
```

3. **测试 API**:
打开浏览器控制台，运行：

```javascript
fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        prompt: 'a beautiful sunset',
        resolution: '1K',
        aspectRatio: '1:1'
    })
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

### 常见 API 错误

**错误 1: GEMINI_API_KEY not configured**
- 检查 `.env.local` 文件
- 确保变量名正确
- 重启开发服务器

**错误 2: Model not found**
- Gemini 可能不支持图像生成
- 尝试使用其他模型或 API

**错误 3: 401 Unauthorized**
- API key 无效或过期
- 检查 Google AI Studio 获取新 key

## ✅ 验证清单

完成以下检查：

- [ ] 访问 `/test-toolbar` 看到工具栏
- [ ] 上传图片到画布
- [ ] 点击图片看到蓝色边框
- [ ] 工具栏显示在图片上方
- [ ] 工具栏包含所有按钮
- [ ] 点击按钮有响应
- [ ] 控制台没有错误

## 🆘 仍然无法解决？

1. **清除缓存**:
   - 按 Ctrl+Shift+R 强制刷新
   - 清除浏览器缓存

2. **检查文件是否保存**:
   - 确保所有修改已保存
   - 检查文件时间戳

3. **重新构建**:
   ```bash
   # 停止服务器
   # 删除 .next 文件夹
   rm -rf .next
   # 重新启动
   npm run dev
   ```

4. **提供以下信息**:
   - 浏览器控制台的完整错误
   - React DevTools 的截图
   - `/test-toolbar` 页面的表现
   - 网络请求的状态
