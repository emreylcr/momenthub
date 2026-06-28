import Image from "next/image";
import { isBannerGif } from "@/lib/profile";

type BannerMediaProps = {
  url: string;
  bannerType?: string | null;
  alt?: string;
  className?: string;
  sizes?: string;
};

export default function BannerMedia({
  url,
  bannerType,
  alt = "Kapak",
  className = "object-cover",
  sizes = "(max-width: 896px) 100vw, 896px",
}: BannerMediaProps) {
  if (isBannerGif(url, bannerType)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${className}`}
      />
    );
  }

  return (
    <Image src={url} alt={alt} fill className={className} sizes={sizes} />
  );
}
