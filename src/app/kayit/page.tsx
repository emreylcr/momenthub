"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Kayıt başarısız.");
      return;
    }

    setMessage(data.message);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="rounded-2xl border border-violet-500/20 bg-slate-900/60 p-8">
          <h1 className="mb-2 text-2xl font-bold text-white">Üye Ol</h1>
          <p className="mb-6 text-sm text-slate-400">
            İlk kayıt olan kullanıcı otomatik admin olur.
          </p>

          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          {message && (
            <p className="mb-4 rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-300">
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Kullanıcı Adı
              </label>
              <input
                name="username"
                type="text"
                required
                minLength={3}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">E-posta</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Şifre</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-violet-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 py-2.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition"
            >
              {loading ? "Kaydediliyor..." : "Kayıt Ol"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Zaten üye misin?{" "}
            <Link href="/giris" className="text-violet-300 hover:underline">
              Giriş yap
            </Link>
          </p>
        </div>
      </main>
  );
}
