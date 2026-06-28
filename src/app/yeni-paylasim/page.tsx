"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function NewPostPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setMediaType(null);
    setMediaUrl(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const file = form.get("file") as File;

    let uploadedUrl = mediaUrl;
    let uploadedType = mediaType;

    if (file && file.size > 0) {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        setLoading(false);
        setError(uploadJson.error || "Dosya yüklenemedi.");
        return;
      }

      uploadedUrl = uploadJson.mediaUrl;
      uploadedType = uploadJson.mediaType;
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        content: form.get("content"),
        mediaUrl: uploadedUrl,
        mediaType: uploadedType,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Paylaşım oluşturulamadı.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold text-white">Anı Paylaş 🎬</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-violet-500/20 bg-slate-900/60 p-6"
        >
          <div>
            <label className="mb-1 block text-sm text-slate-400">Başlık</label>
            <input
              name="title"
              required
              placeholder="Örn: Son saniyede clutch!"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Hikayen / Açıklama
            </label>
            <textarea
              name="content"
              required
              rows={5}
              placeholder="Bu anı nasıl yaşadın? Ne oldu?"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Fotoğraf veya Video (isteğe bağlı)
            </label>
            <input
              name="file"
              type="file"
              accept="image/*,video/mp4,video/webm"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-white file:cursor-pointer"
            />
          </div>

          {preview && (
            <div className="overflow-hidden rounded-xl border border-slate-700">
              {preview.endsWith(".mp4") || preview.includes("video") ? (
                <video src={preview} controls className="w-full" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Önizleme" className="w-full object-cover" />
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition"
          >
            {loading ? "Yayınlanıyor..." : "Yayınla"}
          </button>
        </form>
      </main>
  );
}
