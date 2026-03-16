# 社交分享平台 - 实现计划文档

## 项目概述

基于《需求规约1.0.pdf》文档，开发一个功能完善的社交分享平台。

---

## 一、开发阶段规划

### 第一阶段：基础架构

#### 1.1 项目初始化
- [ ] 初始化 Next.js 14 项目（App Router + TypeScript）
- [ ] 配置 Tailwind CSS
- [ ] 配置 ESLint + Prettier

#### 1.2 数据库搭建
- [ ] 安装 Prisma ORM
- [ ] 配置 SQLite 开发数据库
- [ ] 创建数据库 Schema
- [ ] 执行数据库迁移

#### 1.3 认证系统
- [ ] 配置 NextAuth.js
- [ ] 实现注册 API
- [ ] 实现登录 API
- [ ] 实现登出 API
- [ ] 创建认证中间件

---

## 第二阶段：核心功能

### 2.1 用户模块

#### 基础功能
- [ ] 获取当前用户资料
- [ ] 获取其他用户资料
- [ ] 更新用户资料（头像、昵称、简介）
- [ ] 用户搜索

#### 关注系统
- [ ] 关注用户
- [ ] 取消关注
- [ ] 获取粉丝列表
- [ ] 获取关注列表
- [ ] 获取互关列表

### 2.2 帖子模块

#### 帖子 CRUD
- [ ] 创建帖子（文字 + 图片）
- [ ] 获取帖子列表（公开）
- [ ] 获取用户帖子
- [ ] 获取帖子详情
- [ ] 编辑帖子
- [ ] 删除帖子

#### 互动功能
- [ ] 点赞帖子
- [ ] 取消点赞
- [ ] 收藏帖子
- [ ] 取消收藏
- [ ] 分享帖子

#### 动态流
- [ ] 首页动态（关注用户的帖子）
- [ ] 发现页面（推荐帖子）
- [ ] 时间线（个人帖子）

### 2.3 互动模块

#### 评论功能
- [ ] 添加评论
- [ ] 获取评论列表
- [ ] 编辑评论
- [ ] 删除评论
- [ ] 点赞评论
- [ ] 评论回复（1层嵌套）

---

## 第三阶段：增强功能

### 3.1 消息通知

#### 通知系统
- [ ] 获取通知列表
- [ ] 标记通知已读
- [ ] 全部标记已读

#### 通知类型
- [ ] 点赞通知
- [ ] 评论通知
- [ ] 关注通知
- [ ] @提及通知

### 3.2 搜索功能
- [ ] 搜索用户
- [ ] 搜索帖子
- [ ] 搜索话题标签

### 3.3 管理后台（可选）
- [ ] 用户管理
- [ ] 内容管理
- [ ] 举报管理

---

## 第四阶段：优化完善

### 4.1 性能优化
- [ ] SSR/SSG 混合渲染
- [ ] 图片懒加载
- [ ] 接口缓存策略
- [ ] 分页/无限滚动

### 4.2 安全加固
- [ ] XSS 防护
- [ ] CSRF 防护
- [ ] API 限流
- [ ] 密码加密

### 4.3 UI/UX 优化
- [ ] 响应式设计完善
- [ ] 动画效果
- [ ] 加载状态
- [ ] 错误处理

---

## 二、技术架构

### 2.1 技术栈

```
前端框架:     Next.js 14 (App Router) + TypeScript
UI框架:       Tailwind CSS + Radix UI
图标:         Lucide React
状态管理:     Zustand + React Query
后端:         Next.js API Routes
数据库:       SQLite + Prisma ORM
认证:         NextAuth.js (JWT)
密码加密:     bcryptjs
日期处理:     date-fns
```

### 2.2 项目结构

```
social-share/
├── prisma/
│   ├── schema.prisma          # 数据库 Schema
│   └── dev.db                 # SQLite 数据库
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # 认证页面
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/            # 登录后页面
│   │   │   ├── layout.tsx     # 主布局（侧边栏）
│   │   │   ├── home/
│   │   │   ├── explore/
│   │   │   ├── notifications/
│   │   │   ├── messages/
│   │   │   ├── search/
│   │   │   └── settings/
│   │   ├── profile/           # 用户主页
│   │   │   └── [username]/
│   │   ├── post/              # 帖子详情
│   │   │   └── [id]/
│   │   ├── api/               # API 路由
│   │   │   ├── auth/
│   │   │   ├── posts/
│   │   │   ├── users/
│   │   │   ├── comments/
│   │   │   └── notifications/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # React 组件
│   │   ├── ui/                # 基础 UI 组件
│   │   ├── layout/            # 布局组件
│   │   ├── posts/             # 帖子相关
│   │   ├── users/             # 用户相关
│   │   └── comments/          # 评论相关
│   ├── lib/                   # 工具库
│   │   ├── prisma.ts          # Prisma 客户端
│   │   ├── auth.ts            # NextAuth 配置
│   │   └── utils.ts           # 工具函数
│   ├── stores/                # Zustand stores
│   └── types/                 # TypeScript 类型
├── public/                    # 静态资源
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 三、数据库设计

### 3.1 核心表结构

#### 用户表 (users)
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| email | VARCHAR(255) | 邮箱（唯一） |
| password | VARCHAR(255) | 密码哈希 |
| name | VARCHAR(100) | 显示名称 |
| avatar | VARCHAR(500) | 头像URL |
| bio | TEXT | 个人简介 |
| coverImage | VARCHAR(500) | 封面图 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

#### 帖子表 (posts)
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| authorId | UUID | 作者ID |
| content | TEXT | 内容 |
| images | JSON | 图片数组 |
| location | VARCHAR(255) | 位置 |
| visibility | ENUM | 可见性 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

#### 关注表 (follows)
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| followerId | UUID | 关注者 |
| followingId | UUID | 被关注者 |
| createdAt | TIMESTAMP | 创建时间 |

#### 点赞表 (likes)
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID |
| postId | UUID | 帖子ID |
| createdAt | TIMESTAMP | 创建时间 |

#### 收藏表 (favorites)
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID |
| postId | UUID | 帖子ID |
| createdAt | TIMESTAMP | 创建时间 |

#### 评论表 (comments)
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| postId | UUID | 帖子ID |
| authorId | UUID | 作者ID |
| parentId | UUID | 父评论ID |
| content | TEXT | 内容 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

#### 通知表 (notifications)
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 接收者ID |
| type | ENUM | 类型 |
| sourceId | UUID | 来源ID |
| content | TEXT | 内容 |
| read | BOOLEAN | 已读状态 |
| createdAt | TIMESTAMP | 创建时间 |

---

## 四、API 接口清单

### 4.1 认证模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| POST | /api/auth/logout | 用户登出 | 是 |
| GET | /api/auth/session | 获取会话 | 是 |

### 4.2 用户模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/users/me | 获取当前用户 | 是 |
| GET | /api/users/:id | 获取用户资料 | 否 |
| PUT | /api/users/:id | 更新用户资料 | 是 |
| POST | /api/users/:id/follow | 关注用户 | 是 |
| DELETE | /api/users/:id/follow | 取消关注 | 是 |
| GET | /api/users/:id/followers | 获取粉丝列表 | 否 |
| GET | /api/users/:id/following | 获取关注列表 | 否 |

### 4.3 帖子模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/posts | 获取帖子列表 | 否 |
| POST | /api/posts | 发布帖子 | 是 |
| GET | /api/posts/:id | 获取帖子详情 | 否 |
| PUT | /api/posts/:id | 编辑帖子 | 是 |
| DELETE | /api/posts/:id | 删除帖子 | 是 |
| POST | /api/posts/:id/like | 点赞帖子 | 是 |
| DELETE | /api/posts/:id/like | 取消点赞 | 是 |
| POST | /api/posts/:id/favorite | 收藏帖子 | 是 |
| DELETE | /api/posts/:id/favorite | 取消收藏 | 是 |
| GET | /api/users/:id/posts | 获取用户帖子 | 否 |
| GET | /api/posts/timeline | 获取时间线 | 是 |

### 4.4 评论模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/posts/:id/comments | 获取评论列表 | 否 |
| POST | /api/posts/:id/comments | 添加评论 | 是 |
| PUT | /api/comments/:id | 编辑评论 | 是 |
| DELETE | /api/comments/:id | 删除评论 | 是 |
| POST | /api/comments/:id/like | 点赞评论 | 是 |

### 4.5 通知模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/notifications | 获取通知列表 | 是 |
| PUT | /api/notifications/:id/read | 标记已读 | 是 |
| PUT | /api/notifications/read-all | 全部已读 | 是 |

---

## 五、UI 组件清单

### 5.1 布局组件

| 组件 | 描述 |
|------|------|
| Navbar | 顶部导航栏 |
| Sidebar | 左侧导航栏 |
| MainLayout | 主布局容器 |
| MobileNav | 移动端底部导航 |

### 5.2 帖子组件

| 组件 | 描述 |
|------|------|
| PostCard | 帖子卡片 |
| PostForm | 发帖表单 |
| PostList | 帖子列表 |
| PostActions | 帖子操作按钮 |
| ImageGrid | 图片网格 |

### 5.3 用户组件

| 组件 | 描述 |
|------|------|
| UserAvatar | 用户头像 |
| UserCard | 用户卡片 |
| FollowButton | 关注按钮 |
| UserProfile | 用户资料 |
| FollowList | 关注/粉丝列表 |

### 5.4 评论组件

| 组件 | 描述 |
|------|------|
| CommentItem | 评论项 |
| CommentForm | 评论表单 |
| CommentList | 评论列表 |
| ReplyForm | 回复表单 |

### 5.5 通知组件

| 组件 | 描述 |
|------|------|
| NotificationItem | 通知项 |
| NotificationList | 通知列表 |

### 5.6 表单组件

| 组件 | 描述 |
|------|------|
| Input | 输入框 |
| Button | 按钮 |
| Textarea | 文本域 |
| AvatarUpload | 头像上传 |

---

## 六、实现顺序

### 第一步：环境搭建
1. 初始化 Next.js 项目
2. 安装依赖
3. 配置 Tailwind
4. 配置 Prisma

### 第二步：数据库 + 认证
1. 创建 Schema
2. 执行迁移
3. 实现注册/登录 API
4. 创建登录/注册页面

### 第三步：用户功能
1. 用户资料页面
2. 编辑资料功能
3. 关注/取消关注
4. 关注列表页面

### 第四步：帖子功能
1. 发帖页面/组件
2. 帖子列表
3. 点赞/收藏
4. 帖子详情页

### 第五步：评论功能
1. 评论列表
2. 添加评论
3. 回复评论

### 第六步：通知功能
1. 通知列表
2. 标记已读

### 第七步：优化
1. 响应式适配
2. 加载状态
3. 错误处理

---

## 七、开发规范

### 7.1 代码规范
- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- API 使用 Route Handlers
- 样式使用 Tailwind CSS

### 7.2 命名规范
- 文件：kebab-case (post-card.tsx)
- 组件：PascalCase (PostCard)
- 函数：camelCase
- 常量：UPPER_SNAKE_CASE

### 7.3 Git 提交规范
```
feat: 新功能
fix: 修复
docs: 文档
style: 样式
refactor: 重构
test: 测试
chore: 构建/工具
```

---

## 八、验收标准

### 功能验收
- [ ] 用户可以注册和登录
- [ ] 用户可以查看首页动态
- [ ] 用户可以发布帖子
- [ ] 用户可以点赞/取消点赞
- [ ] 用户可以收藏/取消收藏
- [ ] 用户可以关注/取消关注
- [ ] 用户可以评论帖子
- [ ] 用户可以查看个人资料
- [ ] 用户可以编辑个人资料
- [ ] 用户可以收到通知
- [ ] 响应式设计适配移动端

### 视觉验收
- [ ] 颜色符合设计规范
- [ ] 布局符合三栏设计
- [ ] 组件样式统一
- [ ] 动画流畅

---

*文档版本：1.0*
*创建日期：2026-03-10*
