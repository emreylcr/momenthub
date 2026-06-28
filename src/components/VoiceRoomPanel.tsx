"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Avatar from "@/components/Avatar";

type Member = {
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    accentColor: string;
  };
};

type VoiceRoom = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  creator: { username: string; displayName: string | null };
  members: Member[];
  _count: { members: number };
};

export default function VoiceRoomPanel() {
  const router = useRouter();
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadRooms = useCallback(async () => {
    const [roomsRes, profileRes] = await Promise.all([
      fetch("/api/voice-rooms"),
      fetch("/api/profile"),
    ]);

    if (roomsRes.ok) {
      setRooms(await roomsRes.json());
    }
    setIsLoggedIn(profileRes.ok);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, [loadRooms]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    const res = await fetch("/api/voice-rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: roomName, description: roomDesc }),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(data.error || "Oda oluşturulamadı.");
      return;
    }

    setShowCreate(false);
    setRoomName("");
    setRoomDesc("");
    router.push(`/ses/${data.slug}`);
  }

  async function joinRoom(slug: string) {
    if (!isLoggedIn) {
      router.push("/giris");
      return;
    }

    await fetch(`/api/voice-rooms/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join" }),
    });

    router.push(`/ses/${slug}`);
  }

  const panel = (
    <aside className="flex h-full flex-col border-l border-violet-500/20 bg-slate-950/95">
      <div className="border-b border-violet-500/20 p-4">
        <h2 className="text-lg font-bold text-violet-200">🎙️ Ses Odaları</h2>
        <p className="mt-1 text-xs text-slate-400">
          Oda oluştur veya bir gruba katıl
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <p className="text-sm text-slate-500 p-2">Yükleniyor...</p>
        ) : rooms.length === 0 ? (
          <p className="text-sm text-slate-500 p-2">
            Aktif ses odası yok. İlk odayı sen aç!
          </p>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-3 hover:border-violet-500/40 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{room.name}</p>
                  <p className="text-xs text-slate-400">
                    {room._count.members} kişi · @
                    {room.creator.displayName || room.creator.username}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                  Canlı
                </span>
              </div>

              {room.description && (
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                  {room.description}
                </p>
              )}

              <div className="mt-2 flex -space-x-2">
                {room.members.slice(0, 5).map((m) => (
                  <Avatar
                    key={m.user.id}
                    src={m.user.avatarUrl}
                    name={m.user.displayName || m.user.username}
                    size="sm"
                    accentColor={m.user.accentColor}
                    className="ring-2 ring-slate-900"
                  />
                ))}
                {room._count.members > 5 && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs text-slate-300 ring-2 ring-slate-900">
                    +{room._count.members - 5}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => joinRoom(room.slug)}
                className="mt-3 w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-500 transition"
              >
                Katıl
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-violet-500/20 p-3">
        {isLoggedIn ? (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="w-full rounded-lg border border-dashed border-violet-500/50 py-2.5 text-sm font-medium text-violet-300 hover:bg-violet-500/10 transition"
          >
            + Ses Odası Oluştur
          </button>
        ) : (
          <Link
            href="/giris"
            className="block w-full rounded-lg bg-slate-800 py-2.5 text-center text-sm text-slate-300 hover:text-white"
          >
            Oda açmak için giriş yap
          </Link>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobil açma butonu */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/50 hover:bg-violet-500 lg:hidden"
      >
        🎙️ Ses Odaları
      </button>

      {/* Masaüstü sağ panel */}
      <div className="hidden lg:block w-80 shrink-0 sticky top-[65px] h-[calc(100vh-65px)]">
        {panel}
      </div>

      {/* Mobil drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[min(100%,320px)] shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-lg bg-slate-800 px-2 py-1 text-sm text-slate-300"
            >
              ✕
            </button>
            {panel}
          </div>
        </div>
      )}

      {/* Oda oluştur modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-violet-500/30 bg-slate-900 p-6">
            <h3 className="text-xl font-bold text-white">Ses Odası Oluştur</h3>
            <p className="mt-1 text-sm text-slate-400">
              Arkadaşların bu odaya katılıp sesli konuşabilir.
            </p>

            {error && (
              <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-400">Oda Adı</label>
                <input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  maxLength={40}
                  placeholder="Örn: Valorant Gecesi"
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Açıklama (isteğe bağlı)
                </label>
                <input
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  maxLength={120}
                  placeholder="Ne oynuyorsunuz?"
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-lg border border-slate-600 py-2.5 text-slate-300 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-lg bg-violet-600 py-2.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  {creating ? "Oluşturuluyor..." : "Oluştur ve Katıl"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
