'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Switch, Modal, Form, Input, Row, Col, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const { TextArea } = Input;

// Mock ad data
const mockAds = [
  {
    key: '1',
    id: 1,
    name: '首页轮播广告位',
    position: '首页顶部',
    type: '轮播图',
    status: 'active',
    impressions: 12543,
    clicks: 892,
    ctr: '7.11%',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  {
    key: '2',
    id: 2,
    name: '侧边栏横幅',
    position: '右侧边栏',
    type: '横幅',
    status: 'active',
    impressions: 8234,
    clicks: 456,
    ctr: '5.54%',
    startDate: '2024-01-01',
    endDate: '2024-06-30'
  }
];

export default function AdminAdsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState(mockAds);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 检查是否是管理员
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'ADMIN') {
        router.push('/home');
      }
      setLoading(false);
    }
  }, [status, session, router]);

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该广告位吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setAds(ads.filter(ad => ad.id !== id));
        message.success('广告位已删除');
      }
    });
  };

  const handleStatusChange = (id: number, checked: boolean) => {
    setAds(ads.map(ad =>
      ad.id === id ? { ...ad, status: checked ? 'active' : 'inactive' } : ad
    ));
    message.success(`广告位已${checked ? '启用' : '禁用'}`);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      message.success('保存成功！');
      setIsModalVisible(false);
    });
  };

  const columns = [
    { title: '广告位名称', dataIndex: 'name', key: 'name' },
    { title: '位置', dataIndex: 'position', key: 'position' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    {
      title: '展示量',
      dataIndex: 'impressions',
      key: 'impressions',
      render: (val: number) => val?.toLocaleString() || 0
    },
    {
      title: '点击量',
      dataIndex: 'clicks',
      key: 'clicks',
      render: (val: number) => val?.toLocaleString() || 0
    },
    {
      title: '点击率',
      dataIndex: 'ctr',
      key: 'ctr'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<BarChartOutlined />}>数据</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      )
    }
  ];

  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + '%' : '0%';

  if (loading || status === 'loading') {
    return <div style={{ padding: 24, textAlign: 'center' }}>加载中...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>广告管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加广告位
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#3B82F6' }}>{totalImpressions.toLocaleString()}</div>
              <div style={{ color: '#6B7280' }}>总展示量</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#10B981' }}>{totalClicks.toLocaleString()}</div>
              <div style={{ color: '#6B7280' }}>总点击量</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#FF6B6B' }}>{avgCtr}</div>
              <div style={{ color: '#6B7280' }}>平均点击率</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Table dataSource={ads} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="广告位设置"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText="保存"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="广告位名称" rules={[{ required: true }]}>
            <Input placeholder="请输入广告位名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="位置" rules={[{ required: true }]}>
                <Input placeholder="如：首页顶部" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                <Input placeholder="如：轮播图" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入广告位描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
