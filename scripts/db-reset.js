import { config as loadEnv } from "dotenv";
import { spawnSync } from "node:child_process";

loadEnv({ override: true, path: ".env" });

if (process.env.NODE_ENV === "test") {
  loadEnv({ override: true, path: ".env.test" });
}

assertSafeEnvironment();
run("prisma", ["migrate", "reset", "--force"]);

function assertSafeEnvironment() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Refusing to reset the database when NODE_ENV is production.",
    );
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set before running db:reset.");
  }

  const parsedUrl = new URL(databaseUrl);
  const isPostgres =
    parsedUrl.protocol === "postgresql:" || parsedUrl.protocol === "postgres:";

  if (!isPostgres) {
    throw new Error("db:reset only supports PostgreSQL DATABASE_URL values.");
  }

  const databaseHost = parsedUrl.hostname;
  const isLocalDatabase =
    databaseHost === "localhost" ||
    databaseHost === "127.0.0.1" ||
    databaseHost === "::1";

  if (!isLocalDatabase) {
    throw new Error(
      `Refusing to reset database on non-local host "${databaseHost}".`,
    );
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
