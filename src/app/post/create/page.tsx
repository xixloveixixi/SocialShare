'use client';

import { useState } from 'react';
import { Card, Input, Button, Upload, message, Space } from 'antd';
import {
  ArrowLeftOutlined,
  PictureOutlined,
  SmileOutlined,
  EnvironmentOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { TextArea } = Input;

export default function CreatePostPage() {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) {
      message.warning('请输入内容或选择图片');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('发布成功！');
      router.push('/home');
    } catch (error) {
      message.error('发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
          zIndex: 100
        }}
        bodyStyle={{ padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/home">
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ fontSize: 18 }} />
          </Link>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
            发布新帖子
          </span>
        </div>
        <Button
          type="primary"
          loading={loading}
          onClick={handlePost}
          disabled={!content.trim() && images.length === 0}
          style={{ background: '#FF6B6B', border: 'none' }}
        >
          发布
        </Button>
      </Card>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              U
            </div>
            <div style={{ flex: 1 }}>
              <TextArea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="分享你的想法..."
                autoSize={{ minRows: 8, maxRows: 20 }}
                style={{
                  border: 'none',
                  resize: 'none',
                  fontSize: 16,
                  padding: 0
                }}
              />

              {/* Image Preview */}
              {images.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: images.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                  gap: 8,
                  marginTop: 16
                }}>
                  {images.map((img, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <div
                        style={{
                          width: '100%',
                          height: 200,
                          background: '#E5E7EB',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9CA3AF'
                        }}
                      >
                        <PictureOutlined style={{ fontSize: 32 }} />
                      </div>
                      <Button
                        type="primary"
                        icon={<CloseOutlined />}
                        size="small"
                        danger
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8
                        }}
                        onClick={() => handleRemoveImage(index)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid #F3F4F6'
              }}>
                <Space>
                  <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                      if (images.length >= 4) {
                        message.warning('最多只能上传4张图片');
                        return false;
                      }
                      setImages(prev => [...prev, URL.createObjectURL(file)]);
                      return false;
                    }}
                  >
                    <Button type="text" icon={<PictureOutlined style={{ color: '#FF6B6B', fontSize: 20 }} />} />
                  </Upload>
                  <Button type="text" icon={<SmileOutlined style={{ color: '#FFB800', fontSize: 20 }} />} />
                  <Button type="text" icon={<EnvironmentOutlined style={{ color: '#10B981', fontSize: 20 }} />} />
                </Space>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>
                  {content.length} / 5000
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
