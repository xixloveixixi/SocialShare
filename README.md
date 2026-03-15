# SocialShare 社交分享平台

一个功能完善的社交分享平台，基于 Next.js 14、Prisma、NextAuth.js 和 Ant Design 构建。

## 功能特点

- **用户认证** - 注册、登录、退出，支持邮箱密码认证
- **帖子发布** - 发布文字和图片动态
- **互动功能** - 点赞、评论、回复
- **社交关系** - 关注/取消关注用户
- **私信聊天** - 用户间一对一私信
- **个人主页** - 头像、封面、个人简介
- **发现页面** - 推荐内容、热门话题、推荐关注
- **图片画廊** - 浏览所有帖子中的图片
- **消息通知** - 点赞、评论、关注等通知
- **管理后台** - 用户管理，内容审核（需管理员权限）

## 技术栈

- **前端**: Next.js 14 (App Router), React, TypeScript, Ant Design
- **后端**: Next.js API Routes, NextAuth.js
- **数据库**: SQLite (开发), PostgreSQL (生产)
- **ORM**: Prisma

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/xixloveixixi/SocialShare.git
cd SocialShare
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. 初始化数据库

```bash
npx prisma db push
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 6. 注册账号

访问注册页面 http://localhost:3000/register 创建账号，然后登录即可使用。

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/          # 认证相关 API
│   │   ├── posts/         # 帖子 API
│   │   ├── users/         # 用户 API
│   │   └── messages/      # 消息 API
│   ├── home/              # 首页
│   ├── explore/           # 发现页面
│   ├── profile/           # 个人主页
│   ├── messages/          # 消息页面
│   ├── settings/          # 设置页面
│   └── admin/             # 管理后台
├── components/            # React 组件
├── context/              # React Context
├── lib/                  # 工具库
│   ├── prisma.ts         # Prisma 客户端
│   ├── auth.ts           # NextAuth 配置
│   └── antd/             # Ant Design 配置
└── types/                # TypeScript 类型定义
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/[...nextauth]` | * | 认证相关 |
| `/api/posts` | GET | 获取帖子列表 |
| `/api/posts` | POST | 创建帖子 |
| `/api/posts/[id]` | GET | 获取帖子详情 |
| `/api/posts/[id]/like` | POST | 点赞/取消点赞 |
| `/api/posts/[id]/comments` | POST | 添加评论 |
| `/api/users` | GET | 获取用户列表 |
| `/api/users/[id]` | GET/PUT | 获取/更新用户信息 |
| `/api/users/[id]/follow` | POST | 关注/取消关注 |
| `/api/messages` | GET/POST | 获取/发送私信 |

## License

MIT
