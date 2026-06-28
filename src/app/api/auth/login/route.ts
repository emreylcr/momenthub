import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre zorunludur." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Geçersiz giriş bilgileri veya hesap pasif." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Geçersiz giriş bilgileri." },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    return NextResponse.json({ message: "Giriş başarılı!" });
  } catch {
    return NextResponse.json({ error: "Giriş sırasında hata oluştu." }, { status: 500 });
  }
}
