"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  _count: { posts: number };
};

type Post = {
  id: string;
  title: string;
  author: { username: string };
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const res = await fetch("/api/admin");
    if (res.status === 403) {
      router.push("/");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Veri yüklenemedi.");
      setLoading(false);
      return;
    }
    setUsers(data.users);
    setPosts(data.posts);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateUser(id: string, body: Partial<{ isActive: boolean; isAdmin: boolean }>) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      loadData();
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Bu üyeyi silmek istediğine emin misin?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) loadData();
  }

  async function deletePost(id: string) {
    if (!confirm("Bu paylaşımı silmek istediğine emin misin?")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) loadData();
  }

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold text-amber-300">Admin Paneli</h1>

        {loading && <p className="text-slate-400">Yükleniyor...</p>}
        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2 text-red-300">{error}</p>
        )}

        {!loading && !error && (
          <div className="space-y-10">
            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Üyeler ({users.length})
              </h2>
              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Kullanıcı</th>
                      <th className="px-4 py-3">E-posta</th>
                      <th className="px-4 py-3">Paylaşım</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-slate-700">
                        <td className="px-4 py-3">
                          <span className="font-medium text-violet-300">
                            @{user.username}
                          </span>
                          {user.isAdmin && (
                            <span className="ml-2 rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{user.email}</td>
                        <td className="px-4 py-3">{user._count.posts}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              user.isActive ? "text-green-400" : "text-red-400"
                            }
                          >
                            {user.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                updateUser(user.id, { isActive: !user.isActive })
                              }
                              className="rounded border border-slate-600 px-2 py-1 text-xs hover:border-violet-400"
                            >
                              {user.isActive ? "Pasifleştir" : "Aktifleştir"}
                            </button>
                            <button
                              onClick={() =>
                                updateUser(user.id, { isAdmin: !user.isAdmin })
                              }
                              className="rounded border border-slate-600 px-2 py-1 text-xs hover:border-amber-400"
                            >
                              {user.isAdmin ? "Admin Al" : "Admin Yap"}
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="rounded border border-red-800 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Son Paylaşımlar
              </h2>
              <div className="space-y-2">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">{post.title}</p>
                      <p className="text-sm text-slate-400">
                        @{post.author.username} ·{" "}
                        {new Date(post.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="rounded border border-red-800 px-3 py-1 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
  );
}
