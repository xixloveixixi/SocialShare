import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// 获取帖子列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    const where = userId ? { authorId: userId } : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
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
      }),
      prisma.post.count({ where }),
    ]);

    // 处理帖子数据，添加 isLiked 字段
    const postsWithMeta = posts.map((post) => ({
      ...post,
      images: JSON.parse(post.images || '[]'), // 解析 JSON 字符串
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: false, // 需要客户端传入 session 来判断
      isOwn: false,
    }));

    return NextResponse.json({
      posts: postsWithMeta,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取帖子列表错误:', error);
    return NextResponse.json(
      { error: '获取帖子列表失败' },
      { status: 500 }
    );
  }
}

// 创建帖子
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, images = [] } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        images: JSON.stringify(images || []), // 转换为 JSON 字符串存储
        authorId: (session.user as any).id,
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('创建帖子错误:', error);
    return NextResponse.json(
      { error: '创建帖子失败' },
      { status: 500 }
    );
  }
}
