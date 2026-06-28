"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toJitsiRoomName } from "@/lib/voice";

type JitsiVoiceRoomProps = {
  slug: string;
  displayName: string;
  roomId: string;
};

export default function JitsiVoiceRoom({
  slug,
  displayName,
  roomId,
}: JitsiVoiceRoomProps) {
  const router = useRouter();
  const roomName = toJitsiRoomName(slug);

  const jitsiSrc =
    `https://meet.jit.si/${roomName}` +
    `#config.startWithVideoMuted=true` +
    `&config.prejoinPageEnabled=false` +
    `&config.disableDeepLinking=true` +
    `&interfaceConfig.SHOW_JITSI_WATERMARK=false` +
    `&interfaceConfig.MOBILE_APP_PROMO=false` +
    `&userInfo.displayName=${encodeURIComponent(displayName)}`;

  useEffect(() => {
    fetch(`/api/voice-rooms/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join" }),
    });

    return () => {
      fetch(`/api/voice-rooms/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave" }),
        keepalive: true,
      });
    };
  }, [roomId]);

  return (
    <div className="flex flex-col gap-3">
      <iframe
        title={`Ses odası: ${roomName}`}
        src={jitsiSrc}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="h-[min(70vh,560px)] w-full rounded-2xl border border-violet-500/20 bg-slate-900"
      />
      <button
        type="button"
        onClick={() => router.push("/")}
        className="self-start rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:text-white"
      >
        ← Ana sayfaya dön
      </button>
      <p className="text-xs text-slate-500">
        Mikrofon izni isteyecektir. Ses odasından çıkınca otomatik ayrılırsın.
      </p>
    </div>
  );
}
