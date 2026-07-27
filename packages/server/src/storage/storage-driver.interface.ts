// ---------------------------------------------------------------------------
// MediaVault – Storage Driver Interface
//
// All storage implementations MUST implement this interface. Business logic
// must never couple to a specific driver.
// ---------------------------------------------------------------------------

import { StorableFile, StorageResult } from './types';

export interface StorageDriver {
  /** A unique identifier for this driver (e.g. "local", "s3"). */
  readonly name: string;

  /**
   * Persist a file. The driver receives a stream and metadata; it must
   * return a StorageResult with the computed hash.
   */
  store(file: StorableFile, projectId: string): Promise<StorageResult>;

  /**
   * Delete a file by its stored filename within a project.
   */
  delete(filename: string, projectId: string): Promise<void>;

  /**
   * Open a readable stream for a stored file. Used for downloads and streaming.
   */
  read(filename: string, projectId: string): Promise<NodeJS.ReadableStream>;

  /**
   * Check whether a file exists on disk.
   */
  exists(filename: string, projectId: string): Promise<boolean>;

  /**
   * Return the absolute path on the local filesystem (local driver only).
   * Remote drivers may throw or return undefined.
   */
  getAbsolutePath?(filename: string, projectId: string): Promise<string>;

  /**
   * Generate a signed URL for temporary public access. Only supported by
   * remote/cloud drivers; local driver should throw NotSupportedError.
   */
  generateSignedUrl?(
    filename: string,
    projectId: string,
    expiresInSeconds: number,
  ): Promise<string>;
}
