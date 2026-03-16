'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Result, Button } from 'antd';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  DashboardOutlined,
  UserOutlined,
  FileSearchOutlined,
  NotificationOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Sider, Header, Content } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // 检查是否是管理员
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'ADMIN') {
        router.push('/home');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        加载中...
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  if (userRole !== 'ADMIN') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Result
          status="403"
          title="403"
          subTitle="抱歉，您没有权限访问此页面。"
          extra={
            <Link href="/home">
              <Button type="primary" style={{ background: '#FF6B6B', border: 'none' }}>
                返回首页
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link href="/admin">仪表盘</Link>
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link href="/admin/users">用户管理</Link>
    },
    {
      key: '/admin/content',
      icon: <FileSearchOutlined />,
      label: <Link href="/admin/content">内容审核</Link>
    },
    {
      key: '/admin/ads',
      icon: <NotificationOutlined />,
      label: <Link href="/admin/ads">广告管理</Link>
    }
  ];

  const userMenuItems = [
    { key: 'home', icon: <SettingOutlined />, label: <Link href="/home">返回首页</Link> },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true, onClick: () => signOut({ callbackUrl: '/login' }) }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#1F2937',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100
        }}
        width={240}
      >
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          borderBottom: '1px solid #374151'
        }}>
          <span style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: 700
          }}>
            {collapsed ? 'S' : '管理后台'}
          </span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ background: '#1F2937', marginTop: 8 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{ cursor: 'pointer', fontSize: 18 }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ background: '#3B82F6' }}>A</Avatar>
              <span>管理员</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
