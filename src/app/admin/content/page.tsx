'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, message, Tabs, Badge } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const { TabPane } = Tabs;

// Mock reported content data
const mockReports = [
  {
    key: '1',
    id: 1,
    type: 'post',
    reporter: '用户A',
    reportedUser: '用户B',
    content: '这是一条被举报的帖子内容，涉嫌违规...',
    reason: '垃圾广告',
    status: '待审核',
    reportTime: '2024-01-15 10:30'
  },
  {
    key: '2',
    id: 2,
    type: 'comment',
    reporter: '用户C',
    reportedUser: '用户D',
    content: '这是一条被举报的评论...',
    reason: '人身攻击',
    status: '待审核',
    reportTime: '2024-01-15 09:45'
  },
  {
    key: '3',
    id: 3,
    type: 'post',
    reporter: '用户E',
    reportedUser: '用户F',
    content: '这是另一条被举报的帖子内容...',
    reason: '虚假信息',
    status: '已通过',
    reportTime: '2024-01-14 16:20'
  }
];

export default function AdminContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState(mockReports);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

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

  const pendingCount = reports.filter(r => r.status === '待审核').length;

  const handleApprove = (id: number) => {
    Modal.confirm({
      title: '确认处理',
      content: '确定要通过此举报并删除相关内容吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setReports(reports.map(r =>
          r.id === id ? { ...r, status: '已通过' } : r
        ));
        message.success('处理成功，内容已删除');
      }
    });
  };

  const handleReject = (id: number) => {
    setReports(reports.map(r =>
      r.id === id ? { ...r, status: '已拒绝' } : r
    ));
    message.success('已拒绝该举报');
  };

  const handleView = (record: any) => {
    setSelectedReport(record);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const color = type === 'post' ? 'blue' : type === 'comment' ? 'orange' : 'purple';
        const text = type === 'post' ? '帖子' : type === 'comment' ? '评论' : '用户';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    { title: '举报人', dataIndex: 'reporter', key: 'reporter' },
    { title: '被举报人', dataIndex: 'reportedUser', key: 'reportedUser' },
    {
      title: '举报原因',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => (
        <Tag color="red">{reason}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === '待审核' ? 'orange' : status === '已通过' ? 'green' : 'default';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    { title: '举报时间', dataIndex: 'reportTime', key: 'reportTime' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === '待审核' && (
            <>
              <Button type="link" icon={<CheckOutlined />} style={{ color: '#10B981' }} onClick={() => handleApprove(record.id)}>
                通过
              </Button>
              <Button type="link" icon={<CloseOutlined />} danger onClick={() => handleReject(record.id)}>
                拒绝
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  if (loading || status === 'loading') {
    return <div style={{ padding: 24, textAlign: 'center' }}>加载中...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>内容审核</h1>

      <Card>
        <Tabs defaultActiveKey="all">
          <TabPane tab={<span>全部 <Badge count={reports.length} /></span>} key="all">
            <Table dataSource={reports} columns={columns} pagination={{ pageSize: 10 }} />
          </TabPane>
          <TabPane tab={<span>待审核 <Badge count={pendingCount} /></span>} key="pending">
            <Table dataSource={reports.filter(r => r.status === '待审核')} columns={columns} pagination={{ pageSize: 10 }} />
          </TabPane>
          <TabPane tab="已通过" key="approved">
            <Table dataSource={reports.filter(r => r.status === '已通过')} columns={columns} pagination={{ pageSize: 10 }} />
          </TabPane>
          <TabPane tab="已拒绝" key="rejected">
            <Table dataSource={reports.filter(r => r.status === '已拒绝')} columns={columns} pagination={{ pageSize: 10 }} />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="举报详情"
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); setSelectedReport(null); }}
        footer={
          selectedReport?.status === '待审核' ? (
            <Space>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => { if (selectedReport) handleApprove(selectedReport.id); setIsModalVisible(false); }} style={{ background: '#10B981' }}>
                通过并删除
              </Button>
              <Button icon={<CloseOutlined />} onClick={() => { if (selectedReport) handleReject(selectedReport.id); setIsModalVisible(false); }}>
                拒绝
              </Button>
            </Space>
          ) : null
        }
      >
        {selectedReport && (
          <div>
            <p><strong>举报类型：</strong>{selectedReport.type === 'post' ? '帖子' : selectedReport.type === 'comment' ? '评论' : '用户'}</p>
            <p><strong>举报人：</strong>{selectedReport.reporter}</p>
            <p><strong>被举报人：</strong>{selectedReport.reportedUser}</p>
            <p><strong>举报原因：</strong>{selectedReport.reason}</p>
            <p><strong>举报时间：</strong>{selectedReport.reportTime}</p>
            <p><strong>内容：</strong></p>
            <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 8, marginTop: 8 }}>
              {selectedReport.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
