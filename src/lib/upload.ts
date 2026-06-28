import { mkdir, writeFile } from "fs/promises";
import path from "path";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const BANNER_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function saveImageFile(
  file: File,
  maxSizeMb = 5,
  subfolder = "uploads"
) {
  if (!IMAGE_TYPES.includes(file.type)) {
    return { error: "Sadece jpg, png, gif veya webp yüklenebilir." };
  }

  const maxSize = maxSizeMb * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: `Dosya boyutu en fazla ${maxSizeMb}MB olabilir.` };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", subfolder);

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return { url: `/${subfolder}/${filename}` };
}

export async function saveBannerFile(file: File) {
  if (!BANNER_TYPES.includes(file.type)) {
    return { error: "Kapak için jpg, png, webp veya gif yükleyebilirsin." };
  }

  const isGif = file.type === "image/gif";
  const maxSizeMb = isGif ? 15 : 8;
  const maxSize = maxSizeMb * 1024 * 1024;

  if (file.size > maxSize) {
    return {
      error: `Dosya boyutu en fazla ${maxSizeMb}MB olabilir.`,
    };
  }

  const ext = file.name.split(".").pop() || (isGif ? "gif" : "jpg");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "banners");

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return {
    url: `/uploads/banners/${filename}`,
    bannerType: isGif ? "gif" : "image",
  };
}

export function isBannerGif(
  bannerUrl: string | null | undefined,
  bannerType?: string | null
) {
  if (!bannerUrl) return false;
  return bannerType === "gif" || bannerUrl.toLowerCase().endsWith(".gif");
}