import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import Avatar from "@/components/Avatar";

export default async function Navbar() {
  const session = await getSession();

  const profile = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          avatarUrl: true,
          displayName: true,
          username: true,
          accentColor: true,
        },
      })
    : null;

  return (
    <header className="border-b border-violet-500/30 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-violet-300">
          🎮 MomentHub
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-slate-300 hover:text-white transition">
            Ana Sayfa
          </Link>

          {session ? (
            <>
              <Link
                href="/yeni-paylasim"
                className="text-slate-300 hover:text-white transition"
              >
                Anı Paylaş
              </Link>
              <Link
                href="/profil"
                className="text-slate-300 hover:text-white transition"
              >
                Profilim
              </Link>
              {session.isAdmin && (
                <Link
                  href="/admin"
                  className="text-amber-300 hover:text-amber-200 transition"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profil"
                className="flex items-center gap-2 text-violet-300 hover:text-white transition"
              >
                <Avatar
                  src={profile?.avatarUrl}
                  name={profile?.displayName || profile?.username || session.username}
                  size="sm"
                  accentColor={profile?.accentColor}
                />
                <span className="hidden sm:inline">
                  @{session.username}
                </span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/giris"
                className="text-slate-300 hover:text-white transition"
              >
                Giriş
              </Link>
              <Link
                href="/kayit"
                className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500 transition"
              >
                Üye Ol
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
