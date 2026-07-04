import { LocalStorageProvider } from "./local";
import type { StorageProvider } from "./types";

// Swap the implementation here to move to S3 without touching callers.
export const storage: StorageProvider = new LocalStorageProvider();

export type { StorageProvider } from "./types";
