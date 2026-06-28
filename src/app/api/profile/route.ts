import { NextResponse } from "next/server";
import {
  createSession,
  getSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { ACCENT_COLORS } from "@/lib/profile";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      bannerUrl: true,
      bannerType: true,
      favoriteGame: true,
      accentColor: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      username,
      email,
      displayName,
      bio,
      favoriteGame,
      accentColor,
      currentPassword,
      newPassword,
    } = body;

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    if (username && username !== user.username) {
      const taken = await prisma.user.findUnique({ where: { username } });
      if (taken) {
        return NextResponse.json(
          { error: "Bu kullanıcı adı zaten alınmış." },
          { status: 400 }
        );
      }
    }

    if (email && email !== user.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) {
        return NextResponse.json(
          { error: "Bu e-posta zaten kayıtlı." },
          { status: 400 }
        );
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Şifre değiştirmek için mevcut şifreni girmelisin." },
          { status: 400 }
        );
      }
      const valid = await verifyPassword(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Mevcut şifre yanlış." },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Yeni şifre en az 6 karakter olmalı." },
          { status: 400 }
        );
      }
    }

    if (accentColor && !(accentColor in ACCENT_COLORS)) {
      return NextResponse.json({ error: "Geçersiz renk seçimi." }, { status: 400 });
    }

    if (bio && bio.length > 300) {
      return NextResponse.json(
        { error: "Biyografi en fazla 300 karakter olabilir." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(username && { username: username.trim() }),
        ...(email && { email: email.trim() }),
        ...(displayName !== undefined && {
          displayName: displayName?.trim() || null,
        }),
        ...(bio !== undefined && { bio: bio?.trim() || null }),
        ...(favoriteGame !== undefined && {
          favoriteGame: favoriteGame?.trim() || null,
        }),
        ...(accentColor && { accentColor }),
        ...(newPassword && { password: await hashPassword(newPassword) }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        bannerUrl: true,
        favoriteGame: true,
        accentColor: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    });

    if (updated.username !== session.username) {
      await createSession({
        userId: updated.id,
        username: updated.username,
        isAdmin: session.isAdmin,
      });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Profil güncellenemedi." },
      { status: 500 }
    );
  }
}
