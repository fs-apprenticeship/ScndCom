import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export async function maybeLoadModule(path: string) {
  const url = pathToFileURL(resolve(process.cwd(), "prisma", path));

  try {
    return await import(url.href);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ERR_MODULE_NOT_FOUND"
    ) {
      return null;
    }

    throw error;
  }
}
