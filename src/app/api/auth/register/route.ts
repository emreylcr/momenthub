import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalı." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı veya e-posta zaten kayıtlı." },
        { status: 400 }
      );
    }

    const userCount = await prisma.user.count();
    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        isAdmin: userCount === 0,
      },
    });

    await createSession({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    return NextResponse.json({
      message: user.isAdmin
        ? "Hoş geldin! İlk üye olduğun için admin yetkisi verildi."
        : "Kayıt başarılı!",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Kayıt sırasında hata oluştu." }, { status: 500 });
  }
}
