import { promises as fs } from "fs";
import path from "path";
import type { StorageProvider } from "./types";

const STORAGE_ROOT = path.join(process.cwd(), "storage");

function resolveSafe(key: string): string {
  const resolved = path.resolve(STORAGE_ROOT, key);
  if (!resolved.startsWith(STORAGE_ROOT + path.sep)) {
    throw new Error(`Invalid storage key: ${key}`);
  }
  return resolved;
}

export class LocalStorageProvider implements StorageProvider {
  async save(key: string, data: Buffer): Promise<{ key: string }> {
    const filePath = resolveSafe(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    return { key };
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(resolveSafe(key));
  }

  async delete(key: string): Promise<void> {
    await fs.rm(resolveSafe(key), { force: true });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(resolveSafe(key));
      return true;
    } catch {
      return false;
    }
  }
}
