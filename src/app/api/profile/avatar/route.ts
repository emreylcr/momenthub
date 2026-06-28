import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveImageFile } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya seçilmedi." }, { status: 400 });
    }

    const result = await saveImageFile(file, 5, "uploads/avatars");
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: result.url },
      select: { avatarUrl: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Profil fotoğrafı yüklenemedi." }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { avatarUrl: null },
  });

  return NextResponse.json({ message: "Profil fotoğrafı kaldırıldı." });
}
