'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, List, Avatar, Input, Button, Space, Badge, Tabs, message, Modal } from 'antd';
import {
  ArrowLeftOutlined,
  SendOutlined,
  SearchOutlined,
  PlusOutlined,
  MessageOutlined,
  NotificationOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const { TextArea } = Input;

interface Conversation {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
  lastMessage: {
    content: string;
    time: string | Date;
    isMe: boolean;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [newMessageModalVisible, setNewMessageModalVisible] = useState(false);
  const [newMessageUserId, setNewMessageUserId] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取会话列表
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('获取会话列表失败:', error);
    }
  };

  // 获取聊天记录
  const fetchMessages = async (userId: string) => {
    try {
      const res = await fetch(`/api/messages/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('获取聊天记录失败:', error);
    }
  };

  // 获取用户列表用于新建消息
  const fetchUsersForNewMessage = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  // 发送新消息
  const handleSendNewMessage = async () => {
    if (!newMessageUserId || !newMessageContent.trim()) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: newMessageUserId,
          content: newMessageContent
        }),
      });

      if (res.ok) {
        message.success('发送成功');
        setNewMessageModalVisible(false);
        setNewMessageContent('');
        fetchConversations();
      } else {
        const data = await res.json();
        message.error(data.error || '发送失败');
      }
    } catch (error) {
      message.error('发送失败');
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchConversations();
    }
  }, [session]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedConversation.id,
          content: newMessage
        }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages([...messages, newMsg]);
        setNewMessage('');
        fetchConversations();
      } else {
        const data = await res.json();
        message.error(data.error || '发送失败');
      }
    } catch (error) {
      message.error('发送失败');
    } finally {
      setLoading(false);
    }
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

  const currentUserId = (session.user as any)?.id;

  const tabItems = [
    {
      key: 'messages',
      label: <Badge count={conversations.reduce((sum, c) => sum + c.unreadCount, 0)} offset={[10, 0]}><MessageOutlined /> 消息</Badge>,
      children: (
        <div style={{ display: 'flex', height: '100%' }}>
          {/* Conversation List */}
          <div style={{ width: 300, borderRight: '1px solid #E5E7EB', overflow: 'auto' }}>
            <div style={{ padding: 16 }}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="搜索..."
                style={{ borderRadius: 20 }}
              />
            </div>
            <List
              dataSource={conversations}
              renderItem={conv => (
                <List.Item
                  onClick={() => setSelectedConversation(conv)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: selectedConversation?.id === conv.id ? '#F3F4F6' : 'transparent'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot offset={[-4, 36]}>
                        <Avatar style={{ background: '#3B82F6' }} src={conv.avatar} icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{conv.name || conv.username}</span>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                          {typeof conv.lastMessage.time === 'string' ? conv.lastMessage.time : new Date(conv.lastMessage.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: conv.unreadCount > 0 ? '#111827' : '#9CA3AF', fontWeight: conv.unreadCount > 0 ? 600 : 400 }}>
                          {conv.lastMessage.isMe ? '我: ' : ''}{conv.lastMessage.content}
                        </span>
                        {conv.unreadCount > 0 && (
                          <Badge count={conv.unreadCount} style={{ marginLeft: 8 }} />
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无会话' }}
            />
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div style={{
                  padding: '12px 24px',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Space>
                    <Avatar style={{ background: '#3B82F6' }} src={selectedConversation.avatar}>
                      {selectedConversation.name?.[0] || selectedConversation.username[0]}
                    </Avatar>
                    <span style={{ fontWeight: 600 }}>{selectedConversation.name || selectedConversation.username}</span>
                  </Space>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: msg.senderId === currentUserId ? 'flex-end' : 'flex-start',
                        marginBottom: 16
                      }}
                    >
                      {msg.senderId !== currentUserId && (
                        <Avatar style={{ background: '#3B82F6', marginRight: 8 }} src={msg.sender.avatar}>
                          {msg.sender.name?.[0] || msg.sender.username[0]}
                        </Avatar>
                      )}
                      <div style={{
                        maxWidth: '60%',
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: msg.senderId === currentUserId ? '#FF6B6B' : '#F3F4F6',
                        color: msg.senderId === currentUserId ? '#fff' : '#111827'
                      }}>
                        <div>{msg.content}</div>
                        <div style={{
                          fontSize: 12,
                          marginTop: 4,
                          opacity: 0.7,
                          textAlign: msg.senderId === currentUserId ? 'right' : 'left'
                        }}>
                          {new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: 16, borderTop: '1px solid #E5E7EB' }}>
                  <Space.Compact style={{ width: '100%' }}>
                    <TextArea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="输入消息..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      style={{ borderRadius: '8px 0 0 8px' }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSend}
                      loading={loading}
                      style={{ background: '#FF6B6B', border: 'none', borderRadius: '0 8px 8px 0' }}
                    />
                  </Space.Compact>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                选择一个会话开始聊天
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'notifications',
      label: <NotificationOutlined />,
      children: (
        <div style={{ padding: 24 }}>
          <List
            dataSource={[] as { id: number; content: string; time: string }[]}
            renderItem={item => (
              <List.Item style={{ padding: '16px 0' }}>
                <List.Item.Meta
                  avatar={<Avatar style={{ background: '#10B981' }}>❤️</Avatar>}
                  title={item.content}
                  description={item.time}
                />
              </List.Item>
            )}
            locale={{ emptyText: '暂无通知' }}
          />
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
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/home">
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ fontSize: 18 }} />
          </Link>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
            消息
          </span>
        </div>
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#FF6B6B', border: 'none' }} onClick={() => { fetchUsersForNewMessage(); setNewMessageModalVisible(true); }}>
          新建消息
        </Button>
      </Card>

      {/* Content */}
      <div style={{ height: 'calc(100vh - 60px)', background: '#fff' }}>
        <Tabs items={tabItems} style={{ height: '100%' }} tabBarStyle={{ padding: '0 24px', margin: 0 }} />
      </div>

      {/* 新建消息弹窗 */}
      <Modal
        title="新建消息"
        open={newMessageModalVisible}
        onCancel={() => setNewMessageModalVisible(false)}
        onOk={handleSendNewMessage}
        okText="发送"
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 8 }}>选择用户:</p>
          <select
            value={newMessageUserId}
            onChange={(e) => setNewMessageUserId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #d9d9d9' }}
          >
            <option value="">选择用户...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name || user.username}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p style={{ marginBottom: 8 }}>消息内容:</p>
          <TextArea
            value={newMessageContent}
            onChange={(e) => setNewMessageContent(e.target.value)}
            placeholder="输入消息内容..."
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
}
