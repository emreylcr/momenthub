import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaClientVersion?: string;
};

// Şema değişince bu sürümü artır — eski önbellekli client yenilenir
const PRISMA_CLIENT_VERSION = "voice-rooms-v1";

function resolveDatabaseUrl() {
  const raw = process.env.DATABASE_URL ?? "file:./data/dev.db";
  const filePath = raw.replace(/^file:/, "");

  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  return `file:${absolute}`;
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() });
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prismaClientVersion !== PRISMA_CLIENT_VERSION
  ) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaClientVersion = PRISMA_CLIENT_VERSION;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
