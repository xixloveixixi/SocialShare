# Social Share Platform - Implementation Specification

## Project Overview
- **Project Name**: SocialShare
- **Type**: Full-stack Social Media Web Application
- **Core Functionality**: A social sharing platform with posts, comments, likes, follows, and notifications
- **Target Users**: General users looking to share content and connect with others

## Technical Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + Radix UI + Lucide React icons
- **State**: Zustand + React Query (TanStack Query)
- **Database**: SQLite (for development) with Prisma ORM
- **Auth**: NextAuth.js with credentials provider

---

## UI/UX Specification

### Color Palette
- **Primary**: `#1DA1F2` (Twitter Blue)
- **Primary Hover**: `#1a91da`
- **Background**: `#FFFFFF`
- **Background Secondary**: `#F7F9F9`
- **Border**: `#EFF3F4`
- **Text Primary**: `#0F1419`
- **Text Secondary**: `#536471`
- **Text Muted**: `#8B98A5`
- **Accent Red**: `#E0245E` (Like/Heart)
- **Accent Green**: `#17BF63` (Success)
- **Accent Yellow**: `#FFAD1F` (Warning)

### Typography
- **Font Family**: `"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`
- **Heading 1**: 28px, font-weight: 700
- **Heading 2**: 22px, font-weight: 600
- **Heading 3**: 18px, font-weight: 600
- **Body**: 15px, font-weight: 400
- **Small**: 13px, font-weight: 400

### Layout Structure
- **Desktop** (≥1200px): Three-column layout
  - Left sidebar: 280px (navigation)
  - Main content: 600px (feed)
  - Right sidebar: 350px (suggestions)
- **Tablet** (768-1199px): Two-column layout
  - Left sidebar: 200px (navigation)
  - Main content: flexible
- **Mobile** (<768px): Single column with bottom navigation

### Components

#### Navigation Sidebar
- Logo at top
- Nav items with icons: Home, Explore, Notifications, Messages, Profile, Settings
- Post button (primary color, rounded)
- User profile card at bottom

#### Post Card
- Author avatar (48px circle)
- Author name + handle + timestamp
- Post content (max 280 chars visible, expandable)
- Images grid (1-4 images supported)
- Action bar: Comment, Retweet, Like, Share, Bookmark
- Hover effects on actions

#### User Card
- Avatar (40px circle)
- Username + display name
- Follow button (primary for suggestions)

#### Notification Item
- Icon based on type (like, comment, follow)
- Content text
- Timestamp
- Unread indicator (blue dot)

---

## Functionality Specification

### Authentication
- Register with username, email, password
- Login with email/password
- Session-based auth with NextAuth.js
- Protected routes for authenticated pages

### User Features
- View/edit profile (avatar, bio, name)
- Follow/unfollow users
- View followers/following lists
- User search

### Post Features
- Create post with text (max 5000 chars)
- Add images (up to 4)
- Like/unlike posts
- Bookmark posts
- Delete own posts
- Infinite scroll feed

### Comment Features
- Add comments to posts
- Reply to comments (1 level)
- Like comments

### Notification Features
- Get notified on: likes, comments, follows
- Mark as read
- Mark all as read

### Feed Features
- Home feed: posts from followed users
- Explore feed: trending posts
- User profile: user's posts

---

## Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  password      String
  name          String?
  avatar        String?
  bio           String?
  coverImage    String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  posts         Post[]
  comments      Comment[]
  likes         Like[]
  favorites     Favorite[]
  following     Follow[]  @relation("following")
  followers     Follow[]  @relation("followers")
  notifications Notification[]
}

model Post {
  id          String    @id @default(cuid())
  content     String
  images      String[]  @default([])
  location    String?
  visibility  String    @default("public")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  authorId    String
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)

  comments    Comment[]
  likes       Like[]
  favorites   Favorite[]
}

model Comment {
  id        String    @id @default(cuid())
  content   String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  postId    String
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)

  authorId  String
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)

  parentId  String?
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")

  likes     CommentLike[]
}

model Like {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
}

model Favorite {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
}

model Follow {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())

  followerId  String
  follower    User     @relation("following", fields: [followerId], references: [id], onDelete: Cascade)

  followingId String
  following   User     @relation("followers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
}

model CommentLike {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId    String
  commentId String
  comment   Comment  @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@unique([userId, commentId])
}

model Notification {
  id        String   @id @default(cuid())
  type      String   // like, comment, follow, mention
  content   String?
  createdAt DateTime @default(now())
  read      Boolean  @default(false)

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  sourceId  String?  // id of the source (post, comment, user)
}
```

---

## API Routes

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get session

### Users
- `GET /api/users` - Get current user
- `GET /api/users/:id` - Get user by id
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/followers` - Get followers
- `GET /api/users/:id/following` - Get following

### Posts
- `GET /api/posts` - Get posts (feed)
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `DELETE /api/posts/:id/like` - Unlike post
- `POST /api/posts/:id/favorite` - Favorite post
- `DELETE /api/posts/:id/favorite` - Unfavorite post
- `GET /api/users/:id/posts` - Get user posts

### Comments
- `GET /api/posts/:id/comments` - Get comments
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like comment

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark read
- `PUT /api/notifications/read-all` - Mark all read

---

## Acceptance Criteria

1. ✅ User can register and login
2. ✅ User can view home feed with posts
3. ✅ User can create posts with text
4. ✅ User can like/unlike posts
5. ✅ User can bookmark posts
6. ✅ User can follow/unfollow other users
7. ✅ User can comment on posts
8. ✅ User can view their profile
9. ✅ User can edit their profile
10. ✅ User receives notifications for likes, comments, follows
11. ✅ Responsive design works on mobile/tablet/desktop
12. ✅ Clean, modern UI matching the design spec
