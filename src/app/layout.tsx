import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import VoiceRoomPanel from "@/components/VoiceRoomPanel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MomentHub - Oyun Anıları",
  description: "Oyunlardaki en iyi anlarını paylaş, toplulukla eğlen.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 min-w-0 flex flex-col">{children}</div>
          <VoiceRoomPanel />
        </div>
        <footer className="mt-auto border-t border-violet-500/20 py-6 text-center text-sm text-slate-500">
          MomentHub © {new Date().getFullYear()} — Oyun anılarını paylaş
        </footer>
      </body>
    </html>
  );
}
