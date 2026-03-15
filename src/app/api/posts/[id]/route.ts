import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// 获取单个帖子
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          select: { userId: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 404 }
      );
    }

    // 获取评论
    const comments = await prisma.comment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...post,
      images: JSON.parse(post.images || '[]'), // 解析 JSON 字符串
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      comments,
    });
  } catch (error) {
    console.error('获取帖子错误:', error);
    return NextResponse.json(
      { error: '获取帖子失败' },
      { status: 500 }
    );
  }
}

// 更新帖子
export async function PUT(
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

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 404 }
      );
    }

    if (post.authorId !== (session.user as any).id) {
      return NextResponse.json(
        { error: '无权限修改' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, images } = body;

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(content && { content }),
        ...(images && { images }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('更新帖子错误:', error);
    return NextResponse.json(
      { error: '更新帖子失败' },
      { status: 500 }
    );
  }
}

// 删除帖子
export async function DELETE(
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

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 404 }
      );
    }

    // 检查是否是作者本人或者是管理员
    if (post.authorId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: '无权限删除' },
        { status: 403 }
      );
    }

    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除帖子错误:', error);
    return NextResponse.json(
      { error: '删除帖子失败' },
      { status: 500 }
    );
  }
}
