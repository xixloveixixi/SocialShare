'use client';

import { useState, useEffect, useRef } from 'react';
import { Input, Button, Avatar, Card, List, Space, Badge, Dropdown, message } from 'antd';
import {
  HomeOutlined,
  CompassOutlined,
  MessageOutlined,
  UserOutlined,
  SearchOutlined,
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  ShareAltOutlined,
  EditOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  CloseOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const { TextArea } = Input;

interface Post {
  id: string;
  content: string;
  images: string[];
  createdAt: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session, status } = useSession();

  // 选择图片
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPostImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // 移除图片
  const removeImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
  };

  // 获取帖子列表
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || data || []);
      }
    } catch (error) {
      console.error('获取帖子失败:', error);
    }
  };

  // 获取推荐用户
  const fetchRecommendedUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setRecommendedUsers(data.slice(0, 5));
      }
    } catch (error) {
      console.error('获取推荐用户失败:', error);
    }
  };

  // 获取当前用户最新信息
  const fetchCurrentUser = async () => {
    try {
      const userId = (session?.user as any)?.id;
      if (!userId) return;

      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
    }
  };

  // 从帖子提取话题
  const extractTopics = (content: string) => {
    const matches = content?.match(/#\w+/g);
    return matches || [];
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPosts();
      fetchRecommendedUsers();
      fetchCurrentUser();

      // 从帖子中提取热门话题
      const topics = posts
        .flatMap((post: any) => extractTopics(post.content || ''))
        .reduce((acc: any, tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {});

      const topTopics = Object.entries(topics)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count], index) => ({
          id: index,
          tag,
          posts: count
        }));
      setTrendingTopics(topTopics);
    }
  }, [status, session, posts]);

  // 发布帖子
  const handlePost = async () => {
    if (!postContent.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postContent, images: postImages }),
      });

      if (res.ok) {
        message.success('发布成功！');
        setPostContent('');
        setPostImages([]);
        fetchPosts();
      } else {
        const data = await res.json();
        message.error(data.error || '发布失败');
      }
    } catch (error) {
      message.error('发布失败');
    } finally {
      setLoading(false);
    }
  };

  // 点赞
  const handleLike = async (postId: string) => {
    if (!session?.user) {
      message.warning('请先登录');
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map((post: any) =>
          post.id === postId
            ? {
                ...post,
                isLiked: data.isLiked,
                likesCount: data.isLiked ? (post.likesCount || 0) + 1 : (post.likesCount || 1) - 1
              }
            : post
        ));
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 关注用户
  const handleFollow = async (userId: string) => {
    if (!session?.user) {
      message.warning('请先登录');
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchRecommendedUsers();
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const menuItems = [
    { key: '1', icon: <HomeOutlined />, label: '首页', href: '/home' },
    { key: '2', icon: <CompassOutlined />, label: '发现', href: '/explore' },
    { key: '3', icon: <MessageOutlined />, label: '消息', href: '/messages' },
    { key: '4', icon: <UserOutlined />, label: '个人中心', href: '/profile' },
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人资料', onClick: () => router.push('/profile') },
    { key: 'settings', icon: <SettingOutlined />, label: '设置', onClick: () => router.push('/settings') },
    ...(currentUser?.role === 'ADMIN' ? [
      { type: 'divider' as const },
      { key: 'admin', icon: <SettingOutlined />, label: '管理后台', onClick: () => router.push('/admin') }
    ] : []),
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true, onClick: () => signOut({ callbackUrl: '/login' }) },
  ];

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  if (status === 'unauthenticated') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: '#6B7280', marginBottom: 16 }}>请先登录</p>
          <Link href="/login">
            <Button type="primary" style={{ background: '#FF6B6B', border: 'none' }}>登录</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Top Navigation Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/home" style={{ fontSize: 22, fontWeight: 700, color: '#FF6B6B' }}>
            SocialShare
          </Link>
          <Input
            prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
            placeholder="搜索内容、用户或话题..."
            style={{ width: 400, height: 40, background: '#F3F4F6', border: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Badge count={0} size="small">
            <Button type="text" icon={<BellOutlined style={{ fontSize: 20 }} />} onClick={() => router.push('/messages')} />
          </Badge>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar
              size={36}
              style={{ background: '#3B82F6', cursor: 'pointer' }}
              icon={<UserOutlined />}
              src={currentUser?.avatar}
            />
          </Dropdown>
        </div>
      </div>

      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Left Sidebar */}
        <div style={{
          width: 220,
          padding: '16px 0',
          position: 'sticky',
          top: 56,
          height: 'calc(100vh - 56px)'
        }}>
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            {menuItems.map(item => (
              <Link key={item.key} href={item.href} style={{ display: 'block' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 8,
                  color: item.key === '1' ? '#FF6B6B' : '#374151',
                  fontWeight: item.key === '1' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 16 }}>{item.label}</span>
                </div>
              </Link>
            ))}
          </Space>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          padding: '16px 24px',
          maxWidth: 760
        }}>
          {/* Post Input */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Avatar
                size={44}
                style={{ background: '#3B82F6', flexShrink: 0 }}
                icon={<UserOutlined />}
                src={currentUser?.avatar}
              />
              <div style={{ flex: 1 }}>
                <TextArea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="分享你的想法..."
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  style={{
                    border: 'none',
                    resize: 'none',
                    fontSize: 16,
                    padding: 0
                  }}
                />
                {/* 图片预览 */}
                {postImages.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {postImages.map((img, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={img}
                          alt={`预览${index + 1}`}
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                        />
                        <button
                          onClick={() => removeImage(index)}
                          style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: 'none',
                            background: '#ff4d4f',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12
                          }}
                        >
                          <CloseOutlined style={{ fontSize: 10 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid #F3F4F6'
                }}>
                  <Space>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                    />
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      style={{ color: '#FF6B6B' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      图片
                    </Button>
                  </Space>
                  <Button
                    type="primary"
                    style={{ background: '#FF6B6B', border: 'none' }}
                    disabled={!postContent.trim() && postImages.length === 0}
                    loading={loading}
                    onClick={handlePost}
                  >
                    发布
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Post List */}
          <List
            dataSource={posts}
            loading={loading}
            renderItem={post => (
              <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link href={`/profile?id=${post.author.id}`}>
                    <Avatar
                      size={44}
                      style={{ background: '#3B82F6', flexShrink: 0 }}
                      icon={<UserOutlined />}
                      src={post.author.avatar}
                    />
                  </Link>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Link href={`/profile?id=${post.author.id}`} style={{ fontWeight: 600, color: '#111827' }}>
                        {post.author.name || post.author.username}
                      </Link>
                      <span style={{ color: '#9CA3AF', fontSize: 13 }}>@{post.author.username}</span>
                      <span style={{ color: '#9CA3AF', fontSize: 13 }}>· {formatTime(post.createdAt)}</span>
                    </div>
                    <p style={{ margin: '8px 0', color: '#374151', fontSize: 15, lineHeight: 1.6 }}>
                      {post.content}
                    </p>
                    {/* 显示帖子图片 */}
                    {post.images && post.images.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        {post.images.map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`图片${idx + 1}`}
                            style={{ width: '100%', maxWidth: 200, maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
                          />
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                      <span
                        style={{ color: post.isLiked ? '#FF6B6B' : '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                        onClick={() => handleLike(post.id)}
                      >
                        {post.isLiked ? <HeartFilled /> : <HeartOutlined />} {post.likesCount || 0}
                      </span>
                      <Link href={`/post?id=${post.id}`} style={{ color: '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CommentOutlined /> {post.commentsCount || 0}
                      </Link>
                      <span style={{ color: '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ShareAltOutlined /> 分享
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            locale={{ emptyText: '还没有帖子，快来发布第一条吧！' }}
          />
        </div>

        {/* Right Sidebar */}
        <div style={{
          width: 350,
          padding: '16px 0',
          position: 'sticky',
          top: 56,
          height: 'calc(100vh - 56px)'
        }}>
          {/* Recommended Users */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }} title={<span style={{ fontWeight: 600 }}>推荐关注</span>}>
            <List
              dataSource={recommendedUsers}
              renderItem={user => (
                <List.Item style={{ padding: '12px 0', border: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                    <Link href={`/profile?id=${user.id}`}>
                      <Avatar style={{ background: '#10B981' }} icon={<UserOutlined />} src={user.avatar} />
                    </Link>
                    <div style={{ flex: 1 }}>
                      <Link href={`/profile?id=${user.id}`} style={{ fontWeight: 500, color: '#111827', display: 'block' }}>
                        {user.name || user.username}
                      </Link>
                      <div style={{ fontSize: 13, color: '#9CA3AF' }}>{user.bio || `${user.posts || 0} 帖子`}</div>
                    </div>
                    <Button size="small" style={{ borderColor: '#FF6B6B', color: '#FF6B6B' }} onClick={() => handleFollow(user.id)}>
                      关注
                    </Button>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: '暂无推荐用户' }}
            />
          </Card>

          {/* Trending Topics */}
          <Card style={{ borderRadius: 12 }} title={<span style={{ fontWeight: 600 }}>热门话题</span>}>
            <List
              dataSource={trendingTopics}
              renderItem={topic => (
                <List.Item style={{ padding: '12px 0', border: 'none', cursor: 'pointer' }}>
                  <div>
                    <div style={{ color: '#FF6B6B', fontWeight: 500 }}>{topic.tag}</div>
                    <div style={{ fontSize: 13, color: '#9CA3AF' }}>{topic.posts} 帖子</div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: '暂无话题' }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
