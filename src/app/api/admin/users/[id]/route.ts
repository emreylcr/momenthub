import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    if (id === admin.userId && body.isActive === false) {
      return NextResponse.json(
        { error: "Kendi hesabınızı pasifleştiremezsiniz." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(typeof body.isActive === "boolean" && { isActive: body.isActive }),
        ...(typeof body.isAdmin === "boolean" && { isAdmin: body.isAdmin }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 403 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const { id } = await context.params;

  if (id === session.userId) {
    return NextResponse.json(
      { error: "Kendi hesabınızı silemezsiniz." },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "Üye silindi." });
}
