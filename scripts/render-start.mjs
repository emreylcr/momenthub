import { execSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const raw = process.env.DATABASE_URL ?? "file:./data/dev.db";
const filePath = raw.replace(/^file:/, "");
const absolute = path.isAbsolute(filePath)
  ? filePath
  : path.join(process.cwd(), filePath);

await mkdir(path.dirname(absolute), { recursive: true });

process.env.DATABASE_URL = `file:${absolute}`;

console.log("[start] DATABASE_URL =", process.env.DATABASE_URL);
console.log("[start] Running prisma migrate deploy...");
execSync("npx prisma migrate deploy", { stdio: "inherit" });

console.log("[start] Starting Next.js...");
execSync("npx next start", { stdio: "inherit" });
