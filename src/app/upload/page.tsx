'use client';

import { useState } from 'react';
import { Card, Upload, Button, message, List, Image as AntImage, Space } from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Dragger } = Upload;

export default function UploadPage() {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning('请先选择图片');
      return;
    }

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      message.success('上传成功！');
      router.push('/home');
    }, 1500);
  };

  const handleRemove = (file: any) => {
    setFileList(prev => prev.filter(item => item.uid !== file.uid));
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB！');
        return false;
      }
      setFileList(prev => [...prev, { ...file, uid: Date.now(), status: 'done' }]);
      return false;
    },
    onRemove: handleRemove
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '0 24px' }}>
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
        <Link href="/post/create" style={{ color: '#111827', fontSize: 18 }}>
          ← 返回
        </Link>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
          上传图片
        </span>
        <div style={{ width: 60 }} />
      </Card>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <Card title="上传图片" style={{ borderRadius: 12 }}>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: '#FF6B6B', fontSize: 48 }} />
            </p>
            <p style={{ fontSize: 16, color: '#374151' }}>
              拖拽图片到这里
            </p>
            <p style={{ color: '#9CA3AF' }}>
              或点击选择文件
            </p>
            <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 16 }}>
              支持 JPG、PNG、GIF 格式，单个文件不超过 5MB，最多上传 9 张图片
            </p>
          </Dragger>

          {/* Selected Files */}
          {fileList.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                已选择 {fileList.length} 张图片
              </h3>
              <List
                grid={{ gutter: 16, xs: 2, sm: 3, md: 3, lg: 4 }}
                dataSource={fileList}
                renderItem={(file, index) => (
                  <List.Item>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '100%',
                        height: 120,
                        background: '#E5E7EB',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        <AntImage
                          src={URL.createObjectURL(file)}
                          alt={`图片 ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          preview={{ visible: false }}
                        />
                      </div>
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        style={{ position: 'absolute', top: 4, right: 4 }}
                        onClick={() => handleRemove(file)}
                      />
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Space>
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                loading={uploading}
                onClick={handleUpload}
                style={{ background: '#FF6B6B', border: 'none', height: 44 }}
              >
                {uploading ? '上传中...' : '确认上传'}
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
}
