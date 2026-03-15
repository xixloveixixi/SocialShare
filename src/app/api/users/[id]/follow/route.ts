import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// 关注/取消关注
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const targetUserId = params.id;

    if (userId === targetUserId) {
      return NextResponse.json(
        { error: '不能关注自己' },
        { status: 400 }
      );
    }

    // 检查目标用户是否存在
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查是否已关注
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // 取消关注
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });

      return NextResponse.json({ following: false });
    } else {
      // 关注
      await prisma.follow.create({
        data: {
          followerId: userId,
          followingId: targetUserId,
        },
      });

      // 创建通知
      await prisma.notification.create({
        data: {
          type: 'FOLLOW',
          content: '关注了你',
          userId: targetUserId,
        },
      });

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error('关注错误:', error);
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    );
  }
}

// 获取关注状态和数量
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const targetUserId = params.id;

    const [followersCount, followingCount, isFollowing] = await Promise.all([
      prisma.follow.count({
        where: { followingId: targetUserId },
      }),
      prisma.follow.count({
        where: { followerId: targetUserId },
      }),
      session?.user
        ? prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: (session.user as any).id,
                followingId: targetUserId,
              },
            },
          })
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      followersCount,
      followingCount,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    console.error('获取关注信息错误:', error);
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    );
  }
}
