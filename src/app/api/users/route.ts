import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get('exclude');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 获取当前登录用户
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    // 构建过滤条件：排除指定用户和当前登录用户
    const whereClause: any = {};
    const excludeIds = [excludeId].filter(Boolean);
    if (currentUserId) {
      excludeIds.push(currentUserId);
    }
    if (excludeIds.length > 0) {
      whereClause.id = { notIn: excludeIds };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 格式化返回数据
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      followers: user._count.followers,
      following: user._count.following,
      posts: user._count.posts
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: '获取用户失败' }, { status: 500 });
  }
}
