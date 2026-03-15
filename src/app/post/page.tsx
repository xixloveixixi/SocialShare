'use client';

import { useState, useEffect } from 'react';
import { Card, Avatar, Button, Input, List, Space, Divider, Spin, Empty, message } from 'antd';
import {
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  ShareAltOutlined,
  MoreOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const { TextArea } = Input;

export default function PostDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id') || '';

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
  const [showReplyInput, setShowReplyInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取帖子详情
  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // 点赞/取消点赞
  const handleLike = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setPost((prev: any) => ({
          ...prev,
          isLiked: data.isLiked,
          likesCount: data.isLiked ? (prev.likesCount || 0) + 1 : (prev.likesCount || 1) - 1
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
      message.error('操作失败');
    }
  };

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentContent.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments([newComment, ...comments]);
        setCommentContent('');
        setPost((prev: any) => ({
          ...prev,
          commentsCount: (prev.commentsCount || 0) + 1
        }));
        message.success('评论成功');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      message.error('评论失败');
    }
  };

  // 回复评论
  const handleReply = async (commentId: string) => {
    const content = replyContent[commentId];
    if (!content?.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          parentId: commentId
        }),
      });

      if (res.ok) {
        const newReply = await res.json();
        setComments(comments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply]
            };
          }
          return c;
        }));
        setReplyContent({ ...replyContent, [commentId]: '' });
        setShowReplyInput(null);
        message.success('回复成功');
      }
    } catch (error) {
      console.error('Error replying:', error);
      message.error('回复失败');
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Empty description="帖子不存在" />
      </div>
    );
  }

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
          alignItems: 'center'
        }}
      >
        <Button type="text" icon={<ArrowLeftOutlined />} style={{ fontSize: 18 }} onClick={() => router.back()} />
      </Card>

      {/* Post Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Avatar
              size={48}
              src={post.author?.avatar}
              style={{ background: '#3B82F6', flexShrink: 0 }}
            >
              {post.author?.name?.[0] || post.author?.username?.[0] || 'U'}
            </Avatar>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link href={`/profile?id=${post.author?.id}`} style={{ fontWeight: 600, color: '#111827', fontSize: 16 }}>
                  {post.author?.name || post.author?.username}
                </Link>
                <span style={{ color: '#9CA3AF', fontSize: 14 }}>{formatTime(post.createdAt)}</span>
              </div>
              <p style={{ margin: '12px 0', color: '#374151', fontSize: 15, lineHeight: 1.6 }}>
                {post.content}
              </p>
              {/* 显示帖子图片 */}
              {post.images && post.images.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {post.images.map((img: string, idx: number) => (
                    <img key={idx} src={img} alt={`图片${idx + 1}`} style={{ width: '100%', maxWidth: 400, maxHeight: 400, objectFit: 'cover', borderRadius: 8 }} />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
                <Button
                  type="text"
                  icon={post.isLiked ? <HeartFilled style={{ color: '#FF6B6B' }} /> : <HeartOutlined />}
                  onClick={handleLike}
                  style={{ color: '#6B7280' }}
                >
                  {post.likesCount || 0}
                </Button>
                <Button type="text" icon={<CommentOutlined />} style={{ color: '#6B7280' }}>
                  {comments.length}
                </Button>
                <Button type="text" icon={<ShareAltOutlined />} style={{ color: '#6B7280' }}>
                  分享
                </Button>
                <Button type="text" icon={<MoreOutlined />} style={{ color: '#6B7280' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Comment Input */}
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Avatar
              size={40}
              style={{ background: '#3B82F6', flexShrink: 0 }}
            >
              我
            </Avatar>
            <div style={{ flex: 1 }}>
              <TextArea
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
                placeholder="写下你的评论..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ borderRadius: 8 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  disabled={!commentContent.trim()}
                  style={{ background: '#FF6B6B', border: 'none' }}
                  onClick={handleSubmitComment}
                >
                  发送
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <Card style={{ borderRadius: 12 }} title={<span style={{ fontWeight: 600 }}>全部评论 ({comments.length})</span>}>
          {comments.length === 0 ? (
            <Empty description="暂无评论，快来抢沙发吧" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              dataSource={comments}
              renderItem={comment => (
                <div style={{ padding: '16px 0' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Avatar
                      size={40}
                      src={comment.author?.avatar}
                      style={{ background: '#10B981', flexShrink: 0 }}
                    >
                      {comment.author?.name?.[0] || comment.author?.username?.[0] || 'U'}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Link href={`/profile?id=${comment.author?.id}`} style={{ fontWeight: 600, color: '#111827' }}>
                          {comment.author?.name || comment.author?.username}
                        </Link>
                        <span style={{ color: '#9CA3AF', fontSize: 13 }}>{formatTime(comment.createdAt)}</span>
                      </div>
                      <p style={{ margin: '8px 0', color: '#374151', fontSize: 14 }}>
                        {comment.content}
                      </p>
                      <Space>
                        <Button
                          type="text"
                          icon={<HeartOutlined />}
                          style={{ color: '#6B7280', fontSize: 13, padding: 0 }}
                        >
                          0
                        </Button>
                        <Button
                          type="text"
                          onClick={() => setShowReplyInput(showReplyInput === comment.id ? null : comment.id)}
                          style={{ color: '#6B7280', fontSize: 13, padding: 0 }}
                        >
                          回复
                        </Button>
                      </Space>

                      {/* Reply Input */}
                      {showReplyInput === comment.id && (
                        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                          <Input
                            size="small"
                            placeholder="回复..."
                            value={replyContent[comment.id] || ''}
                            onChange={e => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
                            onPressEnter={() => handleReply(comment.id)}
                            style={{ borderRadius: 16 }}
                          />
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => handleReply(comment.id)}
                            style={{ background: '#FF6B6B', border: 'none' }}
                          >
                            发送
                          </Button>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div style={{ marginTop: 12, paddingLeft: 16, borderLeft: '2px solid #E5E7EB' }}>
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} style={{ marginBottom: 8 }}>
                              <Link href={`/profile?id=${reply.author?.id}`} style={{ fontWeight: 600, color: '#111827' }}>
                                {reply.author?.name || reply.author?.username}
                              </Link>
                              <span style={{ color: '#9CA3AF', marginLeft: 8 }}>{formatTime(reply.createdAt)}</span>
                              <p style={{ margin: '4px 0', color: '#374151', fontSize: 13 }}>{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Divider style={{ margin: '16px 0 0' }} />
                </div>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
