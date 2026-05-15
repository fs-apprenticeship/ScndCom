import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ override: true, path: ".env" });

// NOTE: use `NODE_ENV=test npx prisma` to run commands on the test DB
if (process.env.NODE_ENV === "test") {
  loadEnv({ override: true, path: ".env.test" });
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  schema: "prisma/schema.prisma",
});
