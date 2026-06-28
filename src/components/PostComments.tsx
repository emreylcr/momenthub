"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import Avatar from "@/components/Avatar";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    accentColor: string;
  };
};

type PostCommentsProps = {
  postId: string;
  isLoggedIn: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
};

export default function PostComments({
  postId,
  isLoggedIn,
  currentUserId,
  isAdmin,
}: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  async function loadComments() {
    const res = await fetch(`/api/posts/${postId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Yorum gönderilemedi.");
      return;
    }

    setText("");
    setExpanded(true);
    await loadComments();
  }

  async function deleteComment(id: string) {
    if (!confirm("Bu yorumu silmek istiyor musun?")) return;
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) await loadComments();
  }

  const visibleComments = expanded ? comments : comments.slice(0, 2);

  return (
    <div className="border-t border-slate-700/60 pt-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mb-3 text-sm font-medium text-violet-300 hover:text-violet-200 transition"
      >
        💬 {comments.length} yorum {expanded ? "▲" : "▼"}
      </button>

      {loading ? (
        <p className="text-sm text-slate-500">Yorumlar yükleniyor...</p>
      ) : (
        <div className="space-y-3">
          {visibleComments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-2 rounded-lg bg-slate-800/50 px-3 py-2"
            >
              <Avatar
                src={comment.author.avatarUrl}
                name={comment.author.displayName || comment.author.username}
                size="sm"
                accentColor={comment.author.accentColor}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-medium text-white">
                      {comment.author.displayName || comment.author.username}
                    </span>
                    <span className="ml-1 text-slate-500">
                      @{comment.author.username}
                    </span>
                  </p>
                  <time className="shrink-0 text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                <p className="mt-0.5 text-sm text-slate-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
              {(isAdmin || comment.authorId === currentUserId) && (
                <button
                  type="button"
                  onClick={() => deleteComment(comment.id)}
                  className="shrink-0 self-start text-xs text-red-400/70 hover:text-red-400"
                  title="Yorumu sil"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {!expanded && comments.length > 2 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-sm text-slate-400 hover:text-white"
            >
              {comments.length - 2} yorum daha göster
            </button>
          )}
        </div>
      )}

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Yorum yaz..."
            maxLength={500}
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {submitting ? "..." : "Gönder"}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Yorum yapmak için{" "}
          <Link href="/giris" className="text-violet-300 hover:underline">
            giriş yap
          </Link>
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
