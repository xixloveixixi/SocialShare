'use client';

import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const onFinish = async (values: { username: string; email: string; password: string }) => {
    setLoading(true);
    try {
      await signUp(values.email, values.username, values.password);
      message.success('注册成功！');
      router.push('/home');
    } catch (error: any) {
      message.error(error.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left side - Brand */}
      <div style={{
        flex: '0 0 350px',
        background: '#FF6B6B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h1 style={{
          color: '#fff',
          fontSize: 32,
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif'
        }}>
          SocialShare
        </h1>
        <p style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>
          连接你我，分享世界
        </p>
      </div>

      {/* Right side - Register Form */}
      <div style={{
        flex: 1,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ width: 320 }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#111827',
            marginBottom: 32,
            textAlign: 'center'
          }}>
            创建账号
          </h2>

          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
                { max: 20, message: '用户名最多20个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="用户名"
                style={{ height: 48, background: '#F9FAFB', border: 'none' }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="邮箱地址"
                style={{ height: 48, background: '#F9FAFB', border: 'none' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="密码"
                style={{ height: 48, background: '#F9FAFB', border: 'none' }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="确认密码"
                style={{ height: 48, background: '#F9FAFB', border: 'none' }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 48,
                  background: '#FF6B6B',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ color: '#6B7280' }}>已有账号？</span>
            <Link href="/login" style={{ color: '#FF6B6B', marginLeft: 8 }}>
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
