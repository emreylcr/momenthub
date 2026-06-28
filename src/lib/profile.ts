export const ACCENT_COLORS = {
  violet: {
    label: "Mor",
    ring: "ring-violet-500",
    bg: "bg-violet-600",
    text: "text-violet-300",
    gradient: "from-violet-600 to-purple-700",
  },
  cyan: {
    label: "Camgöbeği",
    ring: "ring-cyan-500",
    bg: "bg-cyan-600",
    text: "text-cyan-300",
    gradient: "from-cyan-600 to-blue-700",
  },
  amber: {
    label: "Kehribar",
    ring: "ring-amber-500",
    bg: "bg-amber-600",
    text: "text-amber-300",
    gradient: "from-amber-500 to-orange-600",
  },
  rose: {
    label: "Gül",
    ring: "ring-rose-500",
    bg: "bg-rose-600",
    text: "text-rose-300",
    gradient: "from-rose-600 to-pink-700",
  },
  emerald: {
    label: "Zümrüt",
    ring: "ring-emerald-500",
    bg: "bg-emerald-600",
    text: "text-emerald-300",
    gradient: "from-emerald-600 to-teal-700",
  },
} as const;

export type AccentColor = keyof typeof ACCENT_COLORS;

export function getAccent(color?: string | null) {
  if (color && color in ACCENT_COLORS) {
    return ACCENT_COLORS[color as AccentColor];
  }
  return ACCENT_COLORS.violet;
}

export function isBannerGif(
  bannerUrl: string | null | undefined,
  bannerType?: string | null
) {
  if (!bannerUrl) return false;
  return bannerType === "gif" || bannerUrl.toLowerCase().endsWith(".gif");
}
