import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRoomSlug } from "@/lib/voice";

export async function GET() {
  const rooms = await prisma.voiceRoom.findMany({
    where: { isActive: true },
    include: {
      creator: {
        select: { username: true, displayName: true },
      },
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
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(rooms);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Oda adı zorunludur." },
        { status: 400 }
      );
    }

    if (name.trim().length > 40) {
      return NextResponse.json(
        { error: "Oda adı en fazla 40 karakter olabilir." },
        { status: 400 }
      );
    }

    const slug = createRoomSlug(name.trim());

    const room = await prisma.voiceRoom.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        creatorId: session.userId,
        members: {
          create: { userId: session.userId },
        },
      },
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
        },
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Oda oluşturulamadı." }, { status: 500 });
  }
}
