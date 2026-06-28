import Image from "next/image";
import { getAccent } from "@/lib/profile";

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  accentColor?: string | null;
  className?: string;
};

const sizes = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-4xl",
};

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 80,
  xl: 112,
};

export default function Avatar({
  src,
  name,
  size = "md",
  accentColor,
  className = "",
}: AvatarProps) {
  const accent = getAccent(accentColor);
  const initial = (name || "?").charAt(0).toUpperCase();

  if (src) {
    return (
      <div
        className={`relative overflow-hidden rounded-full ring-2 ${accent.ring} ${sizes[size]} ${className}`}
      >
        <Image
          src={src}
          alt={name}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br ${accent.gradient} font-bold text-white ring-2 ${accent.ring} ${sizes[size]} ${className}`}
    >
      {initial}
    </div>
  );
}
