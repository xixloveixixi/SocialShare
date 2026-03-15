import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// 获取所有用户（管理员）
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查是否是管理员
    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(user => ({
      key: user.id,
      id: user.id,
      name: user.name || user.username,
      email: user.email,
      username: user.username,
      role: user.role,
      status: '正常', // 默认状态
      avatar: user.avatar,
      posts: user._count.posts,
      followers: user._count.followers
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
