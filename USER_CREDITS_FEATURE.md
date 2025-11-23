# 用户积分系统

## 功能概述

添加了用户积分系统，新用户注册时自动获得 1000 积分。

## 更新内容

### 1. 项目列表页面优化
- ✅ 移除了页眉的搜索栏
- ✅ 简化了页面布局，更加清爽

### 2. 用户页面 (`/lovart/user`)
新建了用户中心页面，显示：
- **用户信息**: 头像、姓名、邮箱
- **积分余额**: 当前可用积分数量
- **加入时间**: 用户注册日期
- **积分说明**: 如何使用和获取积分

**功能特性**:
- 新用户自动创建积分记录（1000 积分）
- 已有用户显示当前积分
- 美观的渐变卡片设计
- 响应式布局

### 3. 侧边栏更新
- ✅ 移除了"帮助"和"设置"图标
- ✅ User 图标现在可点击，链接到用户页面
- ✅ 在用户页面时，User 图标显示激活状态

### 4. 数据库 Schema
添加了 `user_credits` 表：

```sql
CREATE TABLE user_credits (
  user_id TEXT PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS 策略**:
- 用户只能查看自己的积分
- 用户只能插入自己的积分记录
- 用户只能更新自己的积分

## 页面路由

- **主页**: `/lovart` - 欢迎页面
- **项目列表**: `/lovart/projects` - 所有项目
- **用户中心**: `/lovart/user` - 用户信息和积分 ✨ 新增
- **画布编辑器**: `/lovart/canvas` - 项目编辑

## 侧边栏导航

1. **Logo** - 返回主页
2. **Home 图标** - 主页
3. **Folder 图标** - 项目列表
4. **User 图标** - 用户中心 ✨ 新增链接

## 积分系统设计

### 初始积分
- 新用户注册: **1000 积分**
- 自动创建积分记录

### 积分用途（待实现）
- AI 图像生成
- 高级功能解锁
- 更多功能即将推出

### 积分获取（待实现）
- 每日签到
- 完成任务
- 邀请好友
- 购买积分包

## 技术实现

### 文件结构
```
src/
├── app/
│   └── lovart/
│       ├── page.tsx              # 主页
│       ├── projects/
│       │   └── page.tsx          # 项目列表（已更新）
│       ├── user/
│       │   └── page.tsx          # 用户中心（新增）
│       └── canvas/
│           └── page.tsx          # 画布编辑器
├── components/
│   └── lovart/
│       └── DashboardSidebar.tsx  # 侧边栏（已更新）
└── lib/
    └── supabase.ts               # 类型定义（已更新）
```

### 数据加载逻辑
```typescript
// 1. 尝试获取用户积分
const { data, error } = await supabase
  .from('user_credits')
  .select('*')
  .eq('user_id', user.id)
  .single();

// 2. 如果不存在，创建新记录（1000 积分）
if (error && error.code === 'PGRST116') {
  const { data: newData } = await supabase
    .from('user_credits')
    .insert({
      user_id: user.id,
      credits: 1000,
    })
    .select()
    .single();
}
```

## 视觉设计

### 用户页面
- **积分卡片**: 黄色渐变背景，金币图标
- **加入时间卡片**: 蓝色渐变背景，日历图标
- **信息提示**: 蓝色背景的提示框
- **用户头像**: 渐变色圆形头像

### 侧边栏
- 简洁的三图标设计
- 激活状态：灰色背景
- 悬停效果：平滑过渡

## 数据库迁移

在 Supabase SQL Editor 中运行以下 SQL：

```sql
-- 创建用户积分表
CREATE TABLE IF NOT EXISTS user_credits (
  user_id TEXT PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can insert their own credits"
  ON user_credits FOR INSERT
  WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update their own credits"
  ON user_credits FOR UPDATE
  USING (auth.jwt()->>'sub' = user_id)
  WITH CHECK (auth.jwt()->>'sub' = user_id);

-- 创建触发器
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 未来改进

- [ ] 积分消费记录
- [ ] 积分获取历史
- [ ] 积分充值功能
- [ ] 积分兑换商城
- [ ] 积分排行榜
- [ ] 每日签到奖励
- [ ] 任务系统
- [ ] 邀请奖励

## 用户体验

1. **首次访问用户页面**
   - 自动创建积分记录
   - 显示 1000 初始积分

2. **查看积分**
   - 点击侧边栏 User 图标
   - 查看当前积分余额

3. **使用积分**（待实现）
   - AI 图像生成时扣除积分
   - 实时更新余额显示
