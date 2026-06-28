import Link from "next/link";
import { redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import JitsiVoiceRoom from "@/components/JitsiVoiceRoom";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ slug: string }> };

export default async function VoiceRoomPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/giris");

  const { slug } = await params;

  const room = await prisma.voiceRoom.findFirst({
    where: { slug, isActive: true },
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
    },
  });

  if (!room) {
    return (
      <main className="mx-auto max-w-2xl flex-1 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Oda bulunamadı</h1>
        <p className="mt-2 text-slate-400">Bu ses odası kapanmış veya silinmiş.</p>
        <Link href="/" className="mt-6 inline-block text-violet-300 hover:underline">
          Ana sayfaya dön
        </Link>
      </main>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { displayName: true, username: true },
  });

  const displayName = user?.displayName || user?.username || session.username;

  return (
    <main className="mx-auto max-w-5xl flex-1 px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{room.name}</h1>
        <p className="text-slate-400">
          Kurucu: {room.creator.displayName || room.creator.username} ·{" "}
          {room.members.length} katılımcı
        </p>
        {room.description && (
          <p className="mt-1 text-sm text-slate-500">{room.description}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <JitsiVoiceRoom
          slug={room.slug}
          displayName={displayName}
          roomId={room.id}
        />

        <aside className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 h-fit">
          <h2 className="mb-3 font-semibold text-violet-200">
            Odadakiler ({room.members.length})
          </h2>
          <ul className="space-y-2">
            {room.members.map((m) => (
              <li key={m.user.id} className="flex items-center gap-2 text-sm">
                <Avatar
                  src={m.user.avatarUrl}
                  name={m.user.displayName || m.user.username}
                  size="sm"
                  accentColor={m.user.accentColor}
                />
                <span className="text-slate-300">
                  {m.user.displayName || m.user.username}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
