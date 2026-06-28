import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { id } = await context.params;
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json({ error: "Paylaşım bulunamadı." }, { status: 404 });
  }

  if (post.authorId !== session.userId && !session.isAdmin) {
    return NextResponse.json({ error: "Bu paylaşımı silemezsiniz." }, { status: 403 });
  }

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ message: "Paylaşım silindi." });
}
