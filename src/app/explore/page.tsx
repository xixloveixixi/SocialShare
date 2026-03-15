'use client';

import { useState, useEffect } from 'react';
import { Card, Input, List, Avatar, Button, Tag, Tabs, Row, Col, Spin, Empty } from 'antd';
import {
  SearchOutlined,
  HeartOutlined,
  CommentOutlined,
  ShareAltOutlined,
  FireOutlined,
  CompassOutlined,
  HeartFilled
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Search } = Input;

export default function ExplorePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recommend');
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取帖子
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // 获取推荐用户
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users?limit=10');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPosts(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // 点赞帖子
  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchPosts(); // 刷新帖子列表
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // 关注用户
  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchUsers(); // 刷新用户列表
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  // 从帖子内容中提取话题
  const extractTopics = (content: string) => {
    const matches = content.match(/#\w+/g);
    return matches || [];
  };

  // 统计话题出现频率
  const trendingTopics = Array.isArray(posts)
    ? posts
        .flatMap((post: any) => extractTopics(post.content || ''))
        .reduce((acc: any, tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {})
    : {};

  const topTopics = Object.entries(trendingTopics)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count], index) => ({
      id: index,
      tag,
      posts: count,
      trend: 'up'
    }));

  const formatTime = (dateString: string) => {
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

  const renderPostCard = (post: any) => (
    <Card
      hoverable
      cover={
        post.images && post.images.length > 0 ? (
          <div style={{
            height: 200,
            background: '#E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CompassOutlined style={{ fontSize: 48, color: '#9CA3AF' }} />
          </div>
        ) : null
      }
      style={{ borderRadius: 12 }}
      onClick={() => router.push(`/post?id=${post.id}`)}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Avatar src={post.author?.avatar} style={{ background: '#3B82F6' }}>
          {post.author?.name?.[0] || post.author?.username?.[0] || 'U'}
        </Avatar>
        <div>
          <div style={{ fontWeight: 600 }}>{post.author?.name || post.author?.username}</div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>{formatTime(post.createdAt)}</div>
        </div>
      </div>
      <p style={{ margin: '8px 0', color: '#374151', fontSize: 14 }}>
        {post.content}
      </p>
      <div style={{ display: 'flex', gap: 16, color: '#6B7280', fontSize: 13 }}>
        <span
          onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
          style={{ cursor: 'pointer', color: post.isLiked ? '#FF6B6B' : undefined }}
        >
          {post.isLiked ? <HeartFilled style={{ color: '#FF6B6B' }} /> : <HeartOutlined />} {post._count?.likes || 0}
        </span>
        <span><CommentOutlined /> {post._count?.comments || 0}</span>
      </div>
    </Card>
  );

  const renderPostList = (postList: any[]) => (
    <List
      dataSource={postList}
      renderItem={post => (
        <Card style={{ marginBottom: 16, borderRadius: 12 }} onClick={() => router.push(`/post?id=${post.id}`)}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Avatar size={48} src={post.author?.avatar} style={{ background: '#3B82F6' }}>
              {post.author?.name?.[0] || post.author?.username?.[0] || 'U'}
            </Avatar>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>{post.author?.name || post.author?.username}</span>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>{formatTime(post.createdAt)}</span>
              </div>
              <p style={{ margin: '8px 0', color: '#374151' }}>{post.content}</p>
              {post.images && post.images.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {post.images.map((img: string, idx: number) => (
                    <img key={idx} src={img} alt={`图片${idx + 1}`} style={{ width: '100%', maxWidth: 150, maxHeight: 150, objectFit: 'cover', borderRadius: 8 }} />
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                <span
                  style={{ color: '#6B7280', fontSize: 13, cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                >
                  {post.isLiked ? <HeartFilled style={{ color: '#FF6B6B' }} /> : <HeartOutlined />} {post._count?.likes || 0}
                </span>
                <span style={{ color: '#6B7280', fontSize: 13 }}><CommentOutlined /> {post._count?.comments || 0}</span>
                <span style={{ color: '#6B7280', fontSize: 13 }}><ShareAltOutlined /> 分享</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    />
  );

  const tabItems = [
    {
      key: 'recommend',
      label: <FireOutlined />,
      children: (
        loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : posts.length === 0 ? (
          <Empty description="暂无推荐内容" />
        ) : (
          <Row gutter={[16, 16]}>
            {posts.map(post => (
              <Col xs={24} sm={12} md={8} key={post.id}>
                {renderPostCard(post)}
              </Col>
            ))}
          </Row>
        )
      )
    },
    {
      key: 'following',
      label: '关注',
      children: (
        loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : posts.length === 0 ? (
          <Empty description="暂无关注动态" />
        ) : (
          renderPostList(posts.slice(0, 5))
        )
      )
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '16px 24px',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/home" style={{ fontSize: 22, fontWeight: 700, color: '#FF6B6B' }}>
            SocialShare
          </Link>
          <Search
            placeholder="搜索内容、用户或话题..."
            style={{ width: 400 }}
            prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'flex', gap: 24 }}>
        {/* Main Content */}
        <div style={{ flex: 1 }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ minHeight: 400 }}
          />
        </div>

        {/* Right Sidebar */}
        <div style={{ width: 320 }}>
          {/* Trending Topics */}
          <Card title={<span style={{ fontWeight: 600 }}><FireOutlined style={{ color: '#FF6B6B' }} /> 热门话题</span>} style={{ borderRadius: 12, marginBottom: 16 }}>
            {topTopics.length === 0 ? (
              <Empty description="暂无话题" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={topTopics}
                renderItem={topic => (
                  <List.Item style={{ padding: '12px 0', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: '#FF6B6B', fontWeight: 600 }}>{topic.tag}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{topic.posts} 帖子</div>
                      </div>
                      <Tag color={topic.trend === 'up' ? 'green' : 'red'}>
                        {topic.trend === 'up' ? '↑' : '↓'}
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>

          {/* Recommended Users */}
          <Card title={<span style={{ fontWeight: 600 }}>推荐关注</span>} style={{ borderRadius: 12 }}>
            {users.length === 0 ? (
              <Empty description="暂无推荐用户" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={users}
                renderItem={user => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <Avatar src={user.avatar} style={{ background: '#10B981' }}>
                        {user.name?.[0] || user.username?.[0] || 'U'}
                      </Avatar>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.name || user.username}
                        </div>
                        <div style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.bio || `${user.posts || 0} 帖子`}
                        </div>
                      </div>
                      <Button
                        size="small"
                        style={{ borderColor: '#FF6B6B', color: '#FF6B6B' }}
                        onClick={() => handleFollow(user.id)}
                      >
                        关注
                      </Button>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
