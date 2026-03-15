'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Avatar, Button, Tabs, List, Input, message, Modal, Form, Spin, Empty } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  HeartOutlined,
  CommentOutlined,
  StarOutlined,
  CameraOutlined,
  SettingOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

const { TextArea } = Input;

interface Post {
  id: string;
  content: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    username: string;
    avatar: string | null;
  };
}

interface User {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  cover: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  isMe: boolean;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 获取用户信息
  const fetchUser = async () => {
    try {
      const targetUserId = userId || (session?.user as any)?.id;
      if (!targetUserId) return;

      const res = await fetch(`/api/users/${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  // 获取用户的帖子
  const fetchPosts = async () => {
    try {
      const targetUserId = userId || (session?.user as any)?.id;
      if (!targetUserId) return;

      const res = await fetch(`/api/posts?userId=${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || data);
      }
    } catch (error) {
      console.error('获取帖子失败:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUser(), fetchPosts()]);
      setLoading(false);
    };
    if (session) {
      loadData();
    }
  }, [session, userId]);

  // 点赞帖子
  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // 编辑资料
  const handleEdit = () => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        bio: user.bio
      });
    }
    setIsEditing(true);
  };

  // 保存资料
  const handleSave = async () => {
    form.validateFields().then(async (values) => {
      setLoading(true);
      try {
        const targetUserId = userId || (session?.user as any)?.id;
        const res = await fetch(`/api/users/${targetUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        if (res.ok) {
          message.success('保存成功！');
          setUser({ ...user, ...values } as User);
          setIsEditing(false);
        }
      } catch (error) {
        message.error('保存失败');
      } finally {
        setLoading(false);
      }
    });
  };

  // 选择封面图片
  const handleCoverSelect = () => {
    coverInputRef.current?.click();
  };

  // 上传封面图片
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      // 转换为 base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        const targetUserId = userId || (session?.user as any)?.id;
        const res = await fetch(`/api/users/${targetUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cover: base64 }),
        });

        if (res.ok) {
          message.success('封面更新成功！');
          setUser({ ...user, cover: base64 } as User);
        } else {
          message.error('封面更新失败');
        }
        setUploadingCover(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      message.error('上传失败');
      setUploadingCover(false);
    }
    e.target.value = '';
  };

  // 选择头像图片
  const handleAvatarSelect = () => {
    avatarInputRef.current?.click();
  };

  // 上传头像图片
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        const targetUserId = userId || (session?.user as any)?.id;
        const res = await fetch(`/api/users/${targetUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64 }),
        });

        if (res.ok) {
          message.success('头像更新成功！');
          setUser({ ...user, avatar: base64 } as User);
        } else {
          message.error('头像更新失败');
        }
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      message.error('上传失败');
      setUploadingAvatar(false);
    }
    e.target.value = '';
  };

  // 关注/取消关注
  const handleFollow = async () => {
    if (!session?.user || !user) {
      message.warning('请先登录');
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}/follow`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setUser({
          ...user,
          isFollowing: data.following,
          followersCount: data.following ? user.followersCount + 1 : user.followersCount - 1
        });
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

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

  const tabItems = [
    {
      key: 'posts',
      label: (
        <span>
          <EditOutlined /> 帖子
        </span>
      ),
      children: (
        posts.length === 0 ? (
          <Empty description="还没有帖子" />
        ) : (
          <List
            dataSource={posts}
            renderItem={post => (
              <Card
                style={{ marginBottom: 16, borderRadius: 12 }}
                onClick={() => router.push(`/post?id=${post.id}`)}
                hoverable
              >
                <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>
                  {formatTime(post.createdAt)}
                </div>
                <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.6 }}>{post.content}</p>
                <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                  <span
                    style={{ color: '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                  >
                    <HeartOutlined /> {post.likesCount || 0}
                  </span>
                  <span style={{ color: '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CommentOutlined /> {post.commentsCount || 0}
                  </span>
                </div>
              </Card>
            )}
          />
        )
      )
    },
    {
      key: 'liked',
      label: (
        <span>
          <HeartOutlined /> 点赞
        </span>
      ),
      children: (
        <Empty description="还没有点赞的帖子" />
      )
    },
    {
      key: 'favorited',
      label: (
        <span>
          <StarOutlined /> 收藏
        </span>
      ),
      children: (
        <Empty description="还没有收藏的帖子" />
      )
    }
  ];

  if (!session) {
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '0 24px' }}>
      {/* Header Navigation */}
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
        <Link href="/home" style={{ fontSize: 22, fontWeight: 700, color: '#FF6B6B' }}>
          SocialShare
        </Link>
        {user?.isMe && (
          <Button type="text" icon={<SettingOutlined style={{ fontSize: 20 }} />} onClick={() => router.push('/settings')} />
        )}
      </div>

      {/* Profile Header */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 0' }}>
        {/* Cover Image */}
        <div style={{
          height: 200,
          background: user?.cover ? `url(${user.cover}) center/cover` : '#1F2937',
          borderRadius: '12px 12px 0 0',
          position: 'relative'
        }}>
          {user?.isMe && (
            <>
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Button
                type="primary"
                icon={<CameraOutlined />}
                onClick={handleCoverSelect}
                loading={uploadingCover}
                style={{
                  position: 'absolute',
                  right: 16,
                  bottom: 16,
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none'
                }}
              >
                编辑封面
              </Button>
            </>
          )}
        </div>

        {/* User Info */}
        <div style={{ background: '#fff', padding: '0 24px 24px', borderRadius: '0 0 12px 12px' }}>
          {/* Avatar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginTop: -50
          }}>
            {user?.isMe && (
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            )}
            <div style={{ position: 'relative', cursor: user?.isMe ? 'pointer' : 'default' }} onClick={user?.isMe ? handleAvatarSelect : undefined}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                style={{
                  background: '#3B82F6',
                  border: '4px solid #fff',
                  fontSize: 40
                }}
                src={user?.avatar}
              />
              {user?.isMe && (
                <div style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: uploadingAvatar ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {uploadingAvatar ? (
                    <Spin size="small" />
                  ) : (
                    <CameraOutlined style={{ color: '#fff', fontSize: 14 }} />
                  )}
                </div>
              )}
            </div>
            {user?.isMe ? (
              <Button
                style={{
                  marginTop: 70,
                  borderColor: '#FF6B6B',
                  color: '#FF6B6B'
                }}
                onClick={handleEdit}
              >
                编辑资料
              </Button>
            ) : (
              <Button
                type={user?.isFollowing ? 'default' : 'primary'}
                style={{
                  marginTop: 70,
                  borderColor: '#FF6B6B',
                  color: user?.isFollowing ? '#FF6B6B' : '#fff',
                  background: user?.isFollowing ? 'transparent' : '#FF6B6B'
                }}
                onClick={handleFollow}
              >
                {user?.isFollowing ? '已关注' : '关注'}
              </Button>
            )}
          </div>

          {/* User Details */}
          <div style={{ marginTop: 16 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>
              {user?.name || user?.username}
            </h1>
            <p style={{ color: '#6B7280', fontSize: 15, marginTop: 8 }}>
              {user?.bio || '暂无简介'}
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div>
                <span style={{ fontWeight: 600, color: '#111827' }}>{user?.followingCount || 0}</span>
                <span style={{ color: '#6B7280', marginLeft: 4 }}>关注</span>
              </div>
              <div>
                <span style={{ fontWeight: 600, color: '#111827' }}>{user?.followersCount || 0}</span>
                <span style={{ color: '#6B7280', marginLeft: 4 }}>粉丝</span>
              </div>
              <div>
                <span style={{ fontWeight: 600, color: '#111827' }}>{user?.postsCount || 0}</span>
                <span style={{ color: '#6B7280', marginLeft: 4 }}>帖子</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div style={{ marginTop: 24 }}>
          <Tabs items={tabItems} />
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title="编辑资料"
        open={isEditing}
        onOk={handleSave}
        onCancel={() => setIsEditing(false)}
        okText="保存"
        cancelText="取消"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="bio" label="简介">
            <TextArea rows={3} placeholder="请输入个人简介" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
