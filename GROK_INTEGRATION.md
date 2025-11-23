# Grok AI 集成说明

## 功能概述

集成了 X.AI 的 Grok 4.1 模型作为 AI 设计助手，提供智能设计建议和对话功能。

## 实现功能

### 1. 首页生成功能
- 用户在首页输入设计需求
- 点击"生成"按钮自动创建新项目
- 调用 Grok API 获取设计建议
- 跳转到 canvas 页面并打开聊天面板

### 2. Canvas 聊天面板
- 右侧悬浮聊天界面
- 显示 AI 设计助手对话
- 支持多轮对话
- 实时获取设计建议

### 3. 自动打字效果
- 首页输入框 placeholder 自动轮播
- 5 个不同的设计提示文本
- 打字和删除动画效果

## 文件结构

```
src/
├── app/
│   ├── api/
│   │   └── generate-design/
│   │       └── route.ts          # Grok API 路由
│   └── lovart/
│       ├── page.tsx               # 首页（已更新）
│       └── canvas/
│           └── page.tsx           # Canvas 页面（已更新）
└── components/
    └── lovart/
        └── DesignChat.tsx         # 聊天组件（新增）
```

## 环境变量

需要在 `.env.local` 中添加：

```env
XAI_API_KEY=your_xai_api_key_here
```

## 安装依赖

需要安装 OpenAI SDK：

```bash
npm install openai
```

## API 配置

### Grok API 设置
- **模型**: `grok-4-1-fast-non-reasoning`
- **Base URL**: `https://api.x.ai/v1`
- **Timeout**: 360000ms (6分钟)

### System Prompt
```
You are a professional design assistant. Based on user's description, 
provide detailed design suggestions including layout, colors, typography, 
and visual elements. Be specific and creative.
```

## 使用流程

### 用户流程
1. 在首页输入框输入设计需求
2. 点击"生成"按钮或按 Enter
3. 系统自动创建项目
4. 跳转到 canvas 页面
5. 右侧显示聊天面板
6. AI 助手提供设计建议
7. 用户可以继续对话获取更多建议

### 技术流程
1. **创建项目**
   ```typescript
   const newProjectId = uuidv4();
   await supabase.from('projects').insert({
       id: newProjectId,
       title: inputValue.trim().slice(0, 50),
   });
   ```

2. **调用 Grok API**
   ```typescript
   const response = await fetch('/api/generate-design', {
       method: 'POST',
       body: JSON.stringify({ prompt: inputValue }),
   });
   ```

3. **跳转到 Canvas**
   ```typescript
   window.location.href = `/lovart/canvas?id=${newProjectId}&prompt=${prompt}`;
   ```

4. **显示聊天面板**
   - 检测 URL 中的 `prompt` 参数
   - 自动打开聊天面板
   - 发送初始消息

## 聊天组件功能

### DesignChat 组件
- **Props**:
  - `projectId`: 项目 ID
  - `initialPrompt`: 初始提示（可选）

- **功能**:
  - 消息历史记录
  - 实时对话
  - 加载状态
  - 自动滚动
  - 日期分隔符
  - 多行输入
  - 快捷键支持（Enter 发送，Shift+Enter 换行）

### UI 特点
- 参考 Lumen Light 设计
- 白色圆角卡片
- 用户消息右对齐（灰色背景）
- AI 消息左对齐（纯文本）
- 底部输入区域
- 工具按钮（附件、@、灯泡、闪电、地球）

## 状态管理

### 首页状态
```typescript
const [inputValue, setInputValue] = useState('');
const [isGenerating, setIsGenerating] = useState(false);
const [placeholder, setPlaceholder] = useState('');
const [placeholderIndex, setPlaceholderIndex] = useState(0);
```

### Canvas 状态
```typescript
const [showChat, setShowChat] = useState(false);
const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
```

### 聊天状态
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

## 错误处理

### API 错误
- 检查 API Key 配置
- 捕获网络错误
- 显示友好错误消息
- 记录详细错误日志

### 用户体验
- 未登录提示
- 系统初始化检查
- 加载状态显示
- 禁用重复提交

## 未来改进

- [ ] 添加消息编辑功能
- [ ] 支持图片上传
- [ ] 保存对话历史到数据库
- [ ] 添加代码高亮
- [ ] 支持 Markdown 渲染
- [ ] 添加消息复制功能
- [ ] 实现流式响应
- [ ] 添加语音输入
- [ ] 支持多语言
- [ ] 添加快捷命令

## 注意事项

1. **API Key 安全**: 确保 XAI_API_KEY 只在服务器端使用
2. **成本控制**: Grok API 调用可能产生费用
3. **超时设置**: 长时间请求需要适当的超时配置
4. **错误重试**: 考虑添加重试机制
5. **用户反馈**: 提供清晰的加载和错误状态
