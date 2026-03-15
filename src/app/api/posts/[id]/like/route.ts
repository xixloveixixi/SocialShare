import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// 点赞/取消点赞
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
    const postId = params.id;

    // 检查帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 404 }
      );
    }

    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      // 删除通知
      await prisma.notification.deleteMany({
        where: {
          type: 'LIKE',
          userId: post.authorId,
          content: {
            contains: userId,
          },
        },
      });

      return NextResponse.json({ liked: false });
    } else {
      // 点赞
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });

      // 如果不是自己点赞自己，创建通知
      if (post.authorId !== userId) {
        await prisma.notification.create({
          data: {
            type: 'LIKE',
            content: '赞了你的帖子',
            userId: post.authorId,
          },
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('点赞错误:', error);
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    );
  }
}

// 获取点赞状态
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const postId = params.id;

    const [likeCount, isLiked] = await Promise.all([
      prisma.like.count({
        where: { postId },
      }),
      session?.user
        ? prisma.like.findUnique({
            where: {
              postId_userId: {
                postId,
                userId: (session.user as any).id,
              },
            },
          })
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      likesCount: likeCount,
      isLiked: !!isLiked,
    });
  } catch (error) {
    console.error('获取点赞信息错误:', error);
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    );
  }
}
