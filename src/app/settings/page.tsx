'use client';

import { useState, useEffect } from 'react';
import { Card, List, Switch, Button, Input, Avatar, Upload, message, Tabs, Form, Modal } from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  LockOutlined,
  BellOutlined,
  SafetyOutlined,
  GlobalOutlined,
  DeleteOutlined,
  EditOutlined,
  LogoutOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [form] = Form.useForm();

  // 获取用户信息
  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user) return;

      try {
        const userId = (session.user as any).id;
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          form.setFieldsValue({
            name: data.name,
            bio: data.bio,
            email: data.email
          });
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUser();
  }, [session, form]);

  // 保存个人资料
  const handleSaveProfile = async (values: any) => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const userId = (session.user as any).id;
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success('保存成功！');
        update();
      } else {
        message.error('保存失败');
      }
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 退出登录
  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await signOut({ redirect: true, callbackUrl: '/login' });
      }
    });
  };

  // 删除账号
  const handleDeleteAccount = () => {
    Modal.confirm({
      title: '确认删除账号',
      content: '删除账号后，你的所有数据将被永久清除，无法恢复。请谨慎操作。',
      okText: '确定删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        message.success('功能开发中');
      }
    });
  };

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

  const tabItems = [
    {
      key: 'profile',
      label: <span><UserOutlined /> 个人资料</span>,
      children: (
        <div style={{ maxWidth: 600 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Avatar size={100} style={{ background: '#3B82F6', fontSize: 40 }} src={user?.avatar}>
              {user?.name?.[0] || user?.username?.[0] || 'U'}
            </Avatar>
            <div style={{ marginTop: 12 }}>
              <Upload showUploadList={false}>
                <Button icon={<EditOutlined />}>更换头像</Button>
              </Upload>
            </div>
          </div>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveProfile}
            initialValues={{
              name: user?.name,
              bio: user?.bio,
              email: user?.email
            }}
          >
            <Form.Item name="name" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
              <Input placeholder="请输入昵称" />
            </Form.Item>
            <Form.Item label="用户名">
              <Input placeholder="请输入用户名" defaultValue={user?.username} disabled />
            </Form.Item>
            <Form.Item name="email" label="邮箱">
              <Input placeholder="请输入邮箱" disabled />
            </Form.Item>
            <Form.Item name="bio" label="个人简介">
              <Input.TextArea rows={3} placeholder="请输入个人简介" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#FF6B6B', border: 'none' }}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </div>
      )
    },
    {
      key: 'account',
      label: <span><LockOutlined /> 账号安全</span>,
      children: (
        <List
          dataSource={[
            {
              title: '修改密码',
              description: '定期修改密码可以保护账号安全',
              action: <Button onClick={() => message.info('功能开发中')}>修改</Button>
            },
            {
              title: '绑定邮箱',
              description: `已绑定邮箱：${user?.email || '未绑定'}`,
              action: <Button onClick={() => message.info('功能开发中')}>更换</Button>
            },
            {
              title: '两步验证',
              description: '开启两步验证增加账号安全性',
              action: <Switch onChange={() => message.info('功能开发中')} />
            }
          ]}
          renderItem={item => (
            <List.Item actions={[item.action]}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'privacy',
      label: <span><SafetyOutlined /> 隐私设置</span>,
      children: (
        <List
          dataSource={[
            {
              title: '谁可以私信我',
              description: '控制谁可以给你发送私信',
              action: <Button onClick={() => message.info('功能开发中')}>所有人</Button>
            },
            {
              title: '谁可以看到我的帖子',
              description: '控制谁可以看到你发布的帖子',
              action: <Button onClick={() => message.info('功能开发中')}>所有人</Button>
            },
            {
              title: '展示点赞记录',
              description: '允许他人查看你点赞的内容',
              action: <Switch defaultChecked onChange={() => message.info('功能开发中')} />
            }
          ]}
          renderItem={item => (
            <List.Item actions={[item.action]}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'notification',
      label: <span><BellOutlined /> 通知设置</span>,
      children: (
        <List
          dataSource={[
            { title: '新粉丝通知', description: '当有人关注你时收到通知', action: <Switch defaultChecked onChange={() => message.info('功能开发中')} /> },
            { title: '新消息通知', description: '当收到新私信时收到通知', action: <Switch defaultChecked onChange={() => message.info('功能开发中')} /> },
            { title: '点赞通知', description: '当有人点赞你的帖子时收到通知', action: <Switch defaultChecked onChange={() => message.info('功能开发中')} /> },
            { title: '评论通知', description: '当有人评论你的帖子时收到通知', action: <Switch defaultChecked onChange={() => message.info('功能开发中')} /> },
            { title: '系统通知', description: '接收系统公告和更新通知', action: <Switch defaultChecked onChange={() => message.info('功能开发中')} /> }
          ]}
          renderItem={item => (
            <List.Item actions={[item.action]}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'preferences',
      label: <span><GlobalOutlined /> 偏好设置</span>,
      children: (
        <List
          dataSource={[
            { title: '语言', description: '选择界面显示语言', action: <Button onClick={() => message.info('功能开发中')}>简体中文</Button> },
            { title: '主题', description: '选择界面显示主题', action: <Button onClick={() => message.info('功能开发中')}>浅色模式</Button> },
            { title: '自动播放视频', description: '自动播放 timeline 中的视频', action: <Switch defaultChecked onChange={() => message.info('功能开发中')} /> },
            { title: '省流量模式', description: '减少图片和视频的加载', action: <Switch onChange={() => message.info('功能开发中')} /> }
          ]}
          renderItem={item => (
            <List.Item actions={[item.action]}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'danger',
      label: <span><DeleteOutlined /> 危险区域</span>,
      children: (
        <div style={{ maxWidth: 600 }}>
          <Card style={{ borderColor: '#EF4444' }}>
            <h3 style={{ color: '#EF4444', marginBottom: 16 }}>删除账号</h3>
            <p style={{ color: '#6B7280', marginBottom: 16 }}>
              删除账号后，你的所有数据将被永久清除，无法恢复。请谨慎操作。
            </p>
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteAccount}>
              删除账号
            </Button>
          </Card>
          <div style={{ marginTop: 24 }}>
            <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
              退出登录
            </Button>
          </div>
        </div>
      )
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
          alignItems: 'center'
        }}
      >
        <Link href="/home">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ fontSize: 18 }} />
        </Link>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginLeft: 16 }}>
          设置
        </span>
      </Card>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <Card style={{ borderRadius: 12 }}>
          <Tabs items={tabItems} tabPosition="left" />
        </Card>
      </div>
    </div>
  );
}
