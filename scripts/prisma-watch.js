import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";

let lastKnownPrismaFiles = snapshotPrismaFiles();
const poller = setInterval(checkForChanges, 1000);

let scheduledPrepare = null;
let prepareRunning = false;
let rerunRequested = false;
let lastPrepareFailed = false;
let lastChangedPath = null;

console.log("Watching Prisma files for changes...");
runPrepareLoop();

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

function checkForChanges() {
  const nextPrismaFiles = snapshotPrismaFilesSafely();
  const changedPath = findChangedPath(lastKnownPrismaFiles, nextPrismaFiles);

  lastKnownPrismaFiles = nextPrismaFiles;

  if (changedPath) {
    schedulePrepare(changedPath);
  }
}

function findChangedPath(previousFiles, nextFiles) {
  for (const [path, signature] of nextFiles) {
    if (previousFiles.get(path) !== signature) {
      return path;
    }
  }

  for (const path of previousFiles.keys()) {
    if (!nextFiles.has(path)) {
      return path;
    }
  }

  return null;
}

function getFileSignature(path) {
  // Paths come from snapshotPrismaFiles/listMigrationPaths and stay in-repo.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const stats = statSync(path);
  return `${stats.size}:${stats.mtimeMs}`;
}

function listMigrationPaths() {
  const paths = [];

  // These paths are built from the fixed Prisma migrations root and dirent names.
  // They never incorporate user input.

  for (const entry of readdirSync("prisma/migrations", {
    withFileTypes: true,
  })) {
    const entryPath = `prisma/migrations/${entry.name}`;

    if (entry.isFile()) {
      paths.push(entryPath);
      continue;
    }

    if (!entry.isDirectory()) {
      continue;
    }

    // See note above: child paths stay within the Prisma migrations tree.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    for (const childEntry of readdirSync(entryPath, { withFileTypes: true })) {
      if (childEntry.isFile()) {
        paths.push(`${entryPath}/${childEntry.name}`);
      }
    }
  }

  return paths.sort();
}

function reportPrepareFailure(result, step) {
  if (result.error?.code === "ENOENT") {
    process.stderr.write(
      "\nPrisma CLI was not found on PATH while watching schema changes.\n\n",
    );
    lastPrepareFailed = true;
    return;
  }

  if (lastPrepareFailed) {
    return;
  }

  lastPrepareFailed = true;

  if (lastChangedPath) {
    process.stderr.write(
      `Prisma prepare failed after changes to ${lastChangedPath}.\n\n`,
    );
  }

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (!result.stdout && !result.stderr) {
    process.stderr.write(`Prisma ${step} failed.\n`);
  }

  process.stderr.write("\n");
}

function runCommand(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
  });
}

function runPrepare() {
  const migrateStatusResult = runCommand("prisma", ["migrate", "status"]);

  if (migrateStatusResult.status !== 0) {
    return reportPrepareFailure(migrateStatusResult, "migrate status");
  }

  const generateResult = runCommand("prisma", ["generate"]);

  if (generateResult.status !== 0) {
    return reportPrepareFailure(generateResult, "generate");
  }

  lastPrepareFailed = false;
}

function runPrepareLoop() {
  if (prepareRunning) {
    rerunRequested = true;
    return;
  }

  prepareRunning = true;

  try {
    do {
      rerunRequested = false;
      runPrepare();
    } while (rerunRequested);
  } finally {
    prepareRunning = false;
  }
}

function schedulePrepare(changedPath) {
  lastChangedPath = changedPath;
  clearTimeout(scheduledPrepare);
  scheduledPrepare = setTimeout(runPrepareLoop, 100);
}

function shutdown(exitCode = 0) {
  clearTimeout(scheduledPrepare);
  clearInterval(poller);

  process.exit(exitCode);
}

function snapshotPrismaFiles() {
  return new Map(
    ["prisma/schema.prisma", ...listMigrationPaths()].map((path) => [
      path,
      getFileSignature(path),
    ]),
  );
}

function snapshotPrismaFilesSafely() {
  try {
    return snapshotPrismaFiles();
  } catch (error) {
    if (error?.code === "ENOENT") {
      return lastKnownPrismaFiles;
    }

    throw error;
  }
}
