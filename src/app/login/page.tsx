'use client';

import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      message.success('登录成功！');
      router.push('/home');
    } catch (error: any) {
      message.error(error.message || '登录失败，请重试');
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
      </div>

      {/* Right side - Login Form */}
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
            欢迎回来
          </h2>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="邮箱地址"
                style={{ height: 48, background: '#F9FAFB', border: 'none' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
                placeholder="密码"
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
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ color: '#6B7280' }}>还没有账号？</span>
            <Link href="/register" style={{ color: '#FF6B6B', marginLeft: 8 }}>
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
