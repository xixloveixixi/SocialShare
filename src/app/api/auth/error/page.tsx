'use client';

import { useEffect } from 'react';
import { Result, Button } from 'antd';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    console.error('Auth error:', error);
  }, [error]);

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return '服务器配置错误';
      case 'Credentials':
        return '登录凭证错误';
      case 'AccessDenied':
        return '访问被拒绝';
      default:
        return error || '未知错误';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F9FAFB'
    }}>
      <Result
        status="error"
        title="认证失败"
        subTitle={getErrorMessage(error)}
        extra={
          <Button
            type="primary"
            href="/login"
            style={{ background: '#FF6B6B', border: 'none' }}
          >
            返回登录
          </Button>
        }
      />
    </div>
  );
}
