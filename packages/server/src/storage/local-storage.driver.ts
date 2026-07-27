// ---------------------------------------------------------------------------
// MediaVault – Local Storage Driver
//
// Persists files directly to the local filesystem. This is the default
// driver and the reference implementation of the StorageDriver interface.
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createHash } from 'node:crypto';
import { StorageDriver } from './storage-driver.interface';
import { StorableFile, StorageResult } from '../core/types';
import { getConfig } from '../config';
import { getLogger } from '../utils/logger';
import { StorageError, NotFoundError, NotSupportedError } from '../core/errors';

export class LocalStorageDriver implements StorageDriver {
  public readonly name = 'local';

  private readonly basePath: string;
  private readonly logger = getLogger().child({ driver: 'local' });

  public constructor() {
    const config = getConfig();
    this.basePath = path.resolve(config.storage.localPath);
    this.ensureBasePath();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  public async store(file: StorableFile, projectId: string): Promise<StorageResult> {
    const projectDir = this.resolveProjectDir(projectId);
    await this.ensureDir(projectDir);

    const destPath = path.join(projectDir, file.filename);
    const writeStream = fs.createWriteStream(destPath);
    const hash = createHash('sha256');

    // Pipe: read → hash → write
    file.stream.on('data', (chunk: Buffer) => hash.update(chunk));

    try {
      await pipeline(file.stream, writeStream);
    } catch (err: unknown) {
      // Clean up partial file
      await this.safeUnlink(destPath);
      throw new StorageError(`Failed to store file "${file.filename}": ${String(err)}`);
    }

    const computedHash = hash.digest('hex');
    const { size } = await fsp.stat(destPath);

    this.logger.info({ filename: file.filename, size, hash: computedHash }, 'File stored');

    return {
      filename: file.filename,
      size,
      hash: computedHash,
      mimeType: file.mimeType,
    };
  }

  public async delete(filename: string, projectId: string): Promise<void> {
    const filePath = this.resolveProjectFile(filename, projectId);

    try {
      await fsp.unlink(filePath);
      this.logger.info({ filename, projectId }, 'File deleted');
    } catch (err: unknown) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'ENOENT') {
        throw new NotFoundError('File', filename);
      }
      throw new StorageError(`Failed to delete file "${filename}": ${String(err)}`);
    }
  }

  public async read(filename: string, projectId: string): Promise<NodeJS.ReadableStream> {
    const filePath = this.resolveProjectFile(filename, projectId);
    await this.assertExists(filePath, filename);
    return fs.createReadStream(filePath);
  }

  public async exists(filename: string, projectId: string): Promise<boolean> {
    const filePath = this.resolveProjectFile(filename, projectId);
    try {
      await fsp.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  public async getAbsolutePath(filename: string, projectId: string): Promise<string> {
    const filePath = this.resolveProjectFile(filename, projectId);
    await this.assertExists(filePath, filename);
    return filePath;
  }

  public async generateSignedUrl(
    _filename: string,
    _projectId: string,
    _expiresInSeconds: number,
  ): Promise<string> {
    throw new NotSupportedError('Signed URLs');
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private resolveProjectDir(projectId: string): string {
    return path.join(this.basePath, projectId);
  }

  private resolveProjectFile(filename: string, projectId: string): string {
    return path.join(this.basePath, projectId, filename);
  }

  private ensureBasePath(): void {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
      this.logger.info({ path: this.basePath }, 'Created storage base directory');
    }
  }

  private async ensureDir(dir: string): Promise<void> {
    await fsp.mkdir(dir, { recursive: true });
  }

  private async assertExists(filePath: string, filename: string): Promise<void> {
    try {
      await fsp.access(filePath, fs.constants.F_OK);
    } catch {
      throw new NotFoundError('File', filename);
    }
  }

  private async safeUnlink(filePath: string): Promise<void> {
    try {
      await fsp.unlink(filePath);
    } catch {
      // Ignore – best effort cleanup
    }
  }
}
