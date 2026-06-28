import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const room = await prisma.voiceRoom.findFirst({
    where: { OR: [{ id }, { slug: id }], isActive: true },
    include: {
      creator: { select: { username: true, displayName: true } },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              accentColor: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { members: true } },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Oda bulunamadı." }, { status: 404 });
  }

  return NextResponse.json(room);
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const { id } = await context.params;
  const { action } = await request.json();

  const room = await prisma.voiceRoom.findFirst({
    where: { OR: [{ id }, { slug: id }], isActive: true },
  });

  if (!room) {
    return NextResponse.json({ error: "Oda bulunamadı." }, { status: 404 });
  }

  if (action === "join") {
    await prisma.voiceRoomMember.upsert({
      where: {
        roomId_userId: { roomId: room.id, userId: session.userId },
      },
      create: { roomId: room.id, userId: session.userId },
      update: { joinedAt: new Date() },
    });

    return NextResponse.json({ message: "Odaya katıldın.", slug: room.slug });
  }

  if (action === "leave") {
    await prisma.voiceRoomMember.deleteMany({
      where: { roomId: room.id, userId: session.userId },
    });

    const remaining = await prisma.voiceRoomMember.count({
      where: { roomId: room.id },
    });

    if (remaining === 0) {
      await prisma.voiceRoom.update({
        where: { id: room.id },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ message: "Odadan ayrıldın." });
  }

  return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const { id } = await context.params;

  const room = await prisma.voiceRoom.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!room) {
    return NextResponse.json({ error: "Oda bulunamadı." }, { status: 404 });
  }

  if (room.creatorId !== session.userId && !session.isAdmin) {
    return NextResponse.json({ error: "Bu odayı kapatamazsın." }, { status: 403 });
  }

  await prisma.voiceRoom.update({
    where: { id: room.id },
    data: { isActive: false },
  });

  await prisma.voiceRoomMember.deleteMany({ where: { roomId: room.id } });

  return NextResponse.json({ message: "Oda kapatıldı." });
}
