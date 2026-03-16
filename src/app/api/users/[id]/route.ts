import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        cover: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 检查当前用户是否已关注
    let isFollowing = false;
    if (currentUserId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: params.id
          }
        }
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      cover: user.cover,
      role: user.role,
      createdAt: user.createdAt,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      postsCount: user._count.posts,
      isFollowing,
      isMe: currentUserId === params.id
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}

// 更新用户信息
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;

    // 只有本人可以修改自己的资料
    if (currentUserId !== params.id) {
      return NextResponse.json({ error: '无权限修改' }, { status: 403 });
    }

    const body = await request.json();
    const { name, bio, avatar, cover } = body;

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(cover !== undefined && { cover }),
      },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        cover: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return NextResponse.json({ error: '更新用户信息失败' }, { status: 500 });
  }
}
