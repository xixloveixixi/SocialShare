'use client';

import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  HeartOutlined,
  RiseOutlined
} from '@ant-design/icons';

const statsData = [
  { title: '总用户数', value: 12543, icon: <UserOutlined />, color: '#3B82F6' },
  { title: '总帖子数', value: 8234, icon: <FileTextOutlined />, color: '#10B981' },
  { title: '总点赞数', value: 45678, icon: <HeartOutlined />, color: '#FF6B6B' },
  { title: '今日新增', value: 128, icon: <RiseOutlined />, color: '#F59E0B', prefix: '+' }
];

const recentUsers = [
  { key: '1', name: '张三', email: 'zhangsan@example.com', role: '用户', status: '正常', createdAt: '2024-01-15' },
  { key: '2', name: '李四', email: 'lisi@example.com', role: '用户', status: '正常', createdAt: '2024-01-14' },
  { key: '3', name: '王五', email: 'wangwu@example.com', role: '管理员', status: '正常', createdAt: '2024-01-14' },
  { key: '4', name: '赵六', email: 'zhaoliu@example.com', role: '用户', status: '禁言', createdAt: '2024-01-13' },
  { key: '5', name: '孙七', sunqi: 'sunqi@example.com', role: '用户', status: '正常', createdAt: '2024-01-12' }
];

const columns = [
  { title: '用户名', dataIndex: 'name', key: 'name' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={status === '正常' ? 'green' : 'red'}>{status}</Tag>
    )
  },
  { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt' }
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>仪表盘</h1>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.prefix ? '↑' : ''}
                valueStyle={{ color: stat.color }}
              />
              <div style={{
                position: 'absolute',
                top: 20,
                right: 20,
                fontSize: 24,
                color: stat.color
              }}>
                {stat.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Users */}
      <Card title="最近注册用户" style={{ marginTop: 24 }}>
        <Table
          dataSource={recentUsers}
          columns={columns}
          pagination={false}
        />
      </Card>
    </div>
  );
}
