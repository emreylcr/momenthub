import "dotenv/config";
import { defineConfig } from "prisma/config";

// Render build aşamasında env gelmeyebilir — migrate start'ta çalışır
const databaseUrl = process.env.DATABASE_URL ?? "file:./data/dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
