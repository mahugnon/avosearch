// Storage abstraction: local disk for the MVP, S3-compatible later.

export interface StorageProvider {
  /** Persist a file and return its stable key. */
  save(key: string, data: Buffer, contentType?: string): Promise<{ key: string }>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
