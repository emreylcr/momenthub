"use client";

export default function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-300 hover:border-violet-400 hover:text-white transition"
    >
      Çıkış
    </button>
  );
}
