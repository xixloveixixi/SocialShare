'use client';

import { useState, useEffect } from 'react';
import { Card, Avatar, Button, List, Tabs, Select, Input } from 'antd';
import {
  ArrowLeftOutlined,
  HeartOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Search } = Input;

export default function PostListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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

  // 按点赞排序
  const sortedByPopular = [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));

  const renderPostList = (postList: any[]) => (
    <List
      dataSource={postList}
      loading={loading}
      renderItem={post => (
        <Card style={{ marginBottom: 16, borderRadius: 12 }} hoverable onClick={() => router.push(`/post?id=${post.id}`)}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href={`/profile?id=${post.author?.id}`}>
              <Avatar
                size={48}
                style={{ background: '#3B82F6', flexShrink: 0 }}
                src={post.author?.avatar}
              >
                {post.author?.name?.[0] || post.author?.username?.[0] || 'U'}
              </Avatar>
            </Link>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link href={`/profile?id=${post.author?.id}`} style={{ fontWeight: 600, color: '#111827' }}>
                  {post.author?.name || post.author?.username}
                </Link>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>@{post.author?.username}</span>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>· {formatTime(post.createdAt)}</span>
              </div>
              <p style={{ margin: '8px 0', color: '#374151', fontSize: 15, lineHeight: 1.6 }}>
                {post.content}
              </p>
              <div style={{ display: 'flex', gap: 24 }}>
                <span style={{ color: '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <HeartOutlined /> {post.likesCount || 0}
                </span>
                <span style={{ color: '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CommentOutlined /> {post.commentsCount || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
      locale={{ emptyText: '暂无帖子' }}
    />
  );

  const tabItems = [
    {
      key: 'all',
      label: '全部',
      children: renderPostList(posts)
    },
    {
      key: 'popular',
      label: '热门',
      children: renderPostList(sortedByPopular)
    },
    {
      key: 'following',
      label: '关注',
      children: renderPostList(posts.slice(0, 5))
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <Card
        style={{
          borderRadius: 0,
          borderBottom: '1px solid #E5E7EB',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/home">
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ fontSize: 18 }} />
          </Link>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
            全部帖子
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Select
            defaultValue="latest"
            style={{ width: 120 }}
            options={[
              { value: 'latest', label: '最新' },
              { value: 'popular', label: '热门' },
              { value: 'following', label: '关注' }
            ]}
          />
        </div>
      </Card>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索帖子..."
            allowClear
            style={{ width: '100%' }}
          />
        </div>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </div>
    </div>
  );
}
