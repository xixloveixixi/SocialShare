'use client';

import { useState, useEffect } from 'react';
import { Card, Image, Row, Col, Button, Space, Input, Modal, Empty } from 'antd';
import {
  ArrowLeftOutlined,
  HeartOutlined,
  ShareAltOutlined,
  ZoomInOutlined,
  UserOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Search } = Input;

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewPost, setPreviewPost] = useState<any>(null);

  // 获取帖子中的图片
  const fetchImages = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        const posts = data.posts || data || [];

        // 从帖子中提取有图片的
        const imageList: any[] = [];
        posts.forEach((post: any) => {
          const postImages = post.images || [];
          if (postImages.length > 0) {
            postImages.forEach((img: string, index: number) => {
              imageList.push({
                id: `${post.id}-${index}`,
                src: img,
                postId: post.id,
                author: post.author,
                likes: post.likesCount || 0,
                comments: post.commentsCount || 0,
                createdAt: post.createdAt
              });
            });
          }
        });

        setImages(imageList);
      }
    } catch (error) {
      console.error('获取图片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handlePreview = (img: any) => {
    setPreviewImage(img.src);
    setPreviewPost(img);
    setPreviewVisible(true);
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
            图片浏览
          </span>
        </div>
        <Search
          placeholder="搜索图片..."
          allowClear
          style={{ width: 300 }}
        />
      </Card>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {images.length === 0 && !loading ? (
          <Empty description="暂无图片，快去发布帖子吧！" />
        ) : (
          <Row gutter={[16, 16]}>
            {images.map(img => (
              <Col xs={24} sm={12} md={8} lg={6} key={img.id}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: 200,
                        background: '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => handlePreview(img)}
                    >
                      {img.src ? (
                        <Image
                          src={img.src}
                          alt="Gallery"
                          style={{ width: '100%', height: 200, objectFit: 'cover' }}
                          preview={false}
                        />
                      ) : (
                        <ZoomInOutlined style={{ fontSize: 32, color: '#9CA3AF' }} />
                      )}
                    </div>
                  }
                  actions={[
                    <Button key="like" type="text" icon={<HeartOutlined />}>
                      {img.likes}
                    </Button>,
                    <Button key="share" type="text" icon={<ShareAltOutlined />} />,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Link href={`/post?id=${img.postId}`} style={{ color: '#111827' }}>
                        查看帖子
                      </Link>
                    }
                    description={
                      <Link href={`/profile?id=${img.author?.id}`} style={{ color: '#9CA3AF' }}>
                        {img.author?.name || img.author?.username}
                      </Link>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <div style={{
          background: '#1F2937',
          height: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Image
            src={previewImage}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            preview={false}
          />
        </div>
        {previewPost && (
          <div style={{ padding: 16, background: '#fff' }}>
            <Space>
              <Link href={`/post?id=${previewPost.postId}`}>
                <Button type="primary" style={{ background: '#FF6B6B', border: 'none' }}>
                  查看帖子
                </Button>
              </Link>
              <Link href={`/profile?id=${previewPost.author?.id}`}>
                <Button icon={<UserOutlined />}>
                  {previewPost.author?.name || previewPost.author?.username}
                </Button>
              </Link>
              <span style={{ color: '#9CA3AF', marginLeft: 8 }}>
                {formatTime(previewPost.createdAt)}
              </span>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}
