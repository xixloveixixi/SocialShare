'use client';

import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
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
import Link from 'next/link';

const { Sider, Header, Content } = Layout;

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
  { key: 'settings', icon: <SettingOutlined />, label: '设置' },
  { type: 'divider' as const },
  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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
