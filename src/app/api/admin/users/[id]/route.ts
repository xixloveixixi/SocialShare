import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    // 不能删除自己
    const currentUserId = (session.user as any).id;
    if (currentUserId === params.id) {
      return NextResponse.json({ error: '不能删除自己的账号' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
