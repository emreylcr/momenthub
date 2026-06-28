"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import BannerMedia from "@/components/BannerMedia";
import { isBannerGif } from "@/lib/profile";
import { ACCENT_COLORS, type AccentColor, getAccent } from "@/lib/profile";

type Profile = {
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bannerType: string | null;
  favoriteGame: string | null;
  accentColor: string;
  createdAt: string;
  _count: { posts: number };
};

type Tab = "genel" | "gorunum" | "guvenlik";

export default function ProfilePage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerPhotoRef = useRef<HTMLInputElement>(null);
  const bannerGifRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>("genel");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    displayName: "",
    bio: "",
    favoriteGame: "",
    accentColor: "violet" as AccentColor,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  async function loadProfile() {
    const res = await fetch("/api/profile");
    if (!res.ok) {
      router.push("/giris");
      return;
    }
    const data: Profile = await res.json();
    setProfile(data);
    setForm({
      username: data.username,
      email: data.email,
      displayName: data.displayName || "",
      bio: data.bio || "",
      favoriteGame: data.favoriteGame || "",
      accentColor: (data.accentColor as AccentColor) || "violet",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleImageUpload(
    file: File,
    type: "avatar" | "banner"
  ) {
    setUploading(type);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/profile/${type}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(null);

    if (!res.ok) {
      setError(data.error || "Yükleme başarısız.");
      return;
    }

    setMessage(
      type === "avatar"
        ? "Profil fotoğrafı güncellendi."
        : "Kapak fotoğrafı güncellendi."
    );
    await loadProfile();
    router.refresh();
  }

  async function removeImage(type: "avatar" | "banner") {
    const res = await fetch(`/api/profile/${type}`, { method: "DELETE" });
    if (res.ok) {
      setMessage(type === "avatar" ? "Profil fotoğrafı kaldırıldı." : "Kapak kaldırıldı.");
      await loadProfile();
      router.refresh();
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    if (tab === "guvenlik" && form.newPassword !== form.confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      setSaving(false);
      return;
    }

    const payload: Record<string, string> = {
      username: form.username,
      email: form.email,
      displayName: form.displayName,
      bio: form.bio,
      favoriteGame: form.favoriteGame,
      accentColor: form.accentColor,
    };

    if (tab === "guvenlik" && form.newPassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
    }

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Kaydedilemedi.");
      return;
    }

    setMessage("Profil başarıyla güncellendi.");
    setForm((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    await loadProfile();
    router.refresh();
  }

  if (loading || !profile) {
    return (
      <main className="mx-auto max-w-4xl flex-1 px-4 py-16 text-center text-slate-400">
        Profil yükleniyor...
      </main>
    );
  }

  const accent = getAccent(form.accentColor);
  const displayName = form.displayName || profile.username;

  return (
    <main className="mx-auto max-w-4xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-white">Profilim</h1>

      {/* Önizleme kartı */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-900/60">
        <div className="relative h-36 md:h-44">
          {profile.bannerUrl ? (
            <BannerMedia
              url={profile.bannerUrl}
              bannerType={profile.bannerType}
              alt="Kapak"
            />
          ) : (
            <div
              className={`h-full w-full bg-gradient-to-r ${accent.gradient} opacity-80`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>

        <div className="relative px-6 pb-6">
          <div className="-mt-14 mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <Avatar
              src={profile.avatarUrl}
              name={displayName}
              size="xl"
              accentColor={form.accentColor}
              className="ring-4 ring-slate-900"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{displayName}</h2>
              <p className={`${accent.text}`}>@{profile.username}</p>
            </div>
            <div className="flex gap-4 text-sm text-slate-400">
              <span>
                <strong className="text-white">{profile._count.posts}</strong> paylaşım
              </span>
              <span>
                Üye:{" "}
                {new Date(profile.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>
          </div>

          {form.bio && (
            <p className="text-slate-300 leading-relaxed">{form.bio}</p>
          )}
          {form.favoriteGame && (
            <p className="mt-2 text-sm text-slate-400">
              🎮 Favori oyun:{" "}
              <span className="text-slate-200">{form.favoriteGame}</span>
            </p>
          )}
        </div>
      </section>

      {message && (
        <p className="mb-4 rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-300">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* Sekmeler */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["genel", "Genel Bilgiler"],
            ["gorunum", "Görünüm"],
            ["guvenlik", "Güvenlik"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === key
                ? `${accent.bg} text-white`
                : "border border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {tab === "genel" && (
          <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/40 p-6">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Görünen Ad</label>
              <input
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
                placeholder="Oyuncu adın"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Kullanıcı Adı
              </label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                minLength={3}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Biyografi ({form.bio.length}/300)
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                maxLength={300}
                rows={4}
                placeholder="Kendini ve oyun tarzını anlat..."
                className="w-full resize-none rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Favori Oyun
              </label>
              <input
                value={form.favoriteGame}
                onChange={(e) =>
                  setForm({ ...form, favoriteGame: e.target.value })
                }
                placeholder="Valorant, CS2, Minecraft..."
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
              />
            </div>
          </div>
        )}

        {tab === "gorunum" && (
          <div className="space-y-6 rounded-2xl border border-slate-700 bg-slate-900/40 p-6">
            <div>
              <h3 className="mb-3 font-semibold text-white">Profil Fotoğrafı</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar
                  src={profile.avatarUrl}
                  name={displayName}
                  size="lg"
                  accentColor={form.accentColor}
                />
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "avatar");
                  }}
                />
                <button
                  type="button"
                  disabled={uploading === "avatar"}
                  onClick={() => avatarInputRef.current?.click()}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  {uploading === "avatar" ? "Yükleniyor..." : "Dosyadan Yükle"}
                </button>
                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => removeImage("avatar")}
                    className="rounded-lg border border-red-800 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Kaldır
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-1 font-semibold text-white">
                Kapak (Fotoğraf veya GIF)
              </h3>
              <p className="mb-3 text-sm text-slate-400">
                Fotoğraf: jpg, png, webp (max 8MB) · GIF: max 15MB
              </p>
              <div className="relative mb-3 h-32 overflow-hidden rounded-xl bg-slate-800">
                {profile.bannerUrl ? (
                  <>
                    <BannerMedia
                      url={profile.bannerUrl}
                      bannerType={profile.bannerType}
                      alt="Kapak önizleme"
                      sizes="400px"
                    />
                    {isBannerGif(profile.bannerUrl, profile.bannerType) && (
                      <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                        GIF
                      </span>
                    )}
                  </>
                ) : (
                  <div
                    className={`flex h-full items-center justify-center bg-gradient-to-r ${accent.gradient} text-sm text-white/70`}
                  >
                    Kapak yok
                  </div>
                )}
              </div>
              <input
                ref={bannerPhotoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "banner");
                }}
              />
              <input
                ref={bannerGifRef}
                type="file"
                accept="image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "banner");
                }}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={uploading === "banner"}
                  onClick={() => bannerPhotoRef.current?.click()}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  {uploading === "banner" ? "Yükleniyor..." : "Fotoğraf Yükle"}
                </button>
                <button
                  type="button"
                  disabled={uploading === "banner"}
                  onClick={() => bannerGifRef.current?.click()}
                  className="rounded-lg border border-violet-500/50 bg-violet-500/10 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/20 disabled:opacity-50"
                >
                  GIF Yükle
                </button>
                {profile.bannerUrl && (
                  <button
                    type="button"
                    onClick={() => removeImage("banner")}
                    className="rounded-lg border border-red-800 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Kaldır
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-white">Profil Rengi</h3>
              <div className="flex flex-wrap gap-3">
                {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => {
                  const c = ACCENT_COLORS[color];
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, accentColor: color })}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        form.accentColor === color
                          ? `border-white ${c.bg} text-white`
                          : "border-slate-600 text-slate-400 hover:border-slate-400"
                      }`}
                    >
                      <span
                        className={`h-4 w-4 rounded-full bg-gradient-to-br ${c.gradient}`}
                      />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "guvenlik" && (
          <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/40 p-6">
            <p className="text-sm text-slate-400">
              Şifreni değiştirmek istemiyorsan bu alanları boş bırak.
            </p>
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Mevcut Şifre
              </label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Yeni Şifre
              </label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                minLength={6}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`rounded-xl ${accent.bg} px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50 transition`}
        >
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </form>
    </main>
  );
}
