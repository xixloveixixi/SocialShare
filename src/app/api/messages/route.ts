import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// 获取会话列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // 获取用户发送或接收的消息
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // 按对话分组
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;

      if (!conversationsMap.has(otherUserId)) {
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: msg.receiverId === userId && !msg.read ? 1 : 0,
        });
      } else {
        const conv = conversationsMap.get(otherUserId);
        if (msg.receiverId === userId && !msg.read) {
          conv.unreadCount += 1;
        }
      }
    });

    const conversations = Array.from(conversationsMap.values()).map((conv: any) => ({
      ...conv.user,
      lastMessage: {
        content: conv.lastMessage.content,
        time: conv.lastMessage.createdAt,
        isMe: conv.lastMessage.senderId === userId,
      },
      unreadCount: conv.unreadCount,
    }));

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('获取会话列表错误:', error);
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    );
  }
}

// 发送私信
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
    const { receiverId, content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    if (!receiverId) {
      return NextResponse.json(
        { error: '接收者不能为空' },
        { status: 400 }
      );
    }

    // 检查接收者是否存在
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: (session.user as any).id,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // 创建通知
    await prisma.notification.create({
      data: {
        type: 'MESSAGE',
        content: '给你发送了一条私信',
        userId: receiverId,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('发送消息错误:', error);
    return NextResponse.json(
      { error: '发送失败' },
      { status: 500 }
    );
  }
}
