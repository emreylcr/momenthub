import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await getSession();

  const posts = await prisma.post.findMany({
    where: { author: { isActive: true } },
    include: {
      author: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
          accentColor: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10">
        <section className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-extrabold text-white md:text-5xl">
            Oyun Anılarını Paylaş 🎯
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            En iyi kliplerini, ekran görüntülerini yükle, üstüne hikayeni yaz ve
            toplulukla paylaş.
          </p>
          {session ? (
            <Link
              href="/yeni-paylasim"
              className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500 transition"
            >
              + Yeni Anı Paylaş
            </Link>
          ) : (
            <Link
              href="/kayit"
              className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500 transition"
            >
              Hemen Üye Ol
            </Link>
          )}
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-violet-200">Son Paylaşımlar</h2>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-600 p-12 text-center text-slate-400">
              Henüz paylaşım yok. İlk anıyı sen paylaş!
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  mediaType={post.mediaType}
                  mediaUrl={post.mediaUrl}
                  authorName={post.author.username}
                  authorDisplayName={post.author.displayName}
                  authorAvatar={post.author.avatarUrl}
                  authorAccent={post.author.accentColor}
                  createdAt={post.createdAt}
                  isLoggedIn={!!session}
                  currentUserId={session?.userId}
                  isAdmin={session?.isAdmin}
                />
              ))}
            </div>
          )}
        </section>
      </main>
  );
}
