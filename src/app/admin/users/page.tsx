'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Tag, Space, Avatar, Modal, message } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // 检查是否是管理员
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'ADMIN') {
        router.push('/home');
      } else {
        fetchUsers();
      }
    }
  }, [status, session, router]);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除用户
  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            message.success('用户已删除');
            fetchUsers();
          } else {
            const data = await res.json();
            message.error(data.error || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: '用户',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} style={{ background: '#3B82F6' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{record.email}</div>
          </div>
        </Space>
      )
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role === 'ADMIN' ? '管理员' : '用户'}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === '正常' ? 'green' : status === '禁言' ? 'orange' : 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    { title: '帖子数', dataIndex: 'posts', key: 'posts' },
    { title: '粉丝数', dataIndex: 'followers', key: 'followers' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedUser(record);
              setIsModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  if (status === 'loading' || loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>用户管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/register')}>
          添加用户
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索用户..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <Table
          dataSource={filteredUsers}
          columns={columns}
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title="用户详情"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedUser(null);
        }}
        footer={null}
      >
        {selectedUser && (
          <div>
            <p><strong>用户名：</strong>{selectedUser.name}</p>
            <p><strong>邮箱：</strong>{selectedUser.email}</p>
            <p><strong>角色：</strong>{selectedUser.role === 'ADMIN' ? '管理员' : '用户'}</p>
            <p><strong>帖子数：</strong>{selectedUser.posts}</p>
            <p><strong>粉丝数：</strong>{selectedUser.followers}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
