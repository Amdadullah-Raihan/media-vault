// ---------------------------------------------------------------------------
// MediaVault – File Service
//
// Orchestrates upload, download, stream, and delete. Coordinates between the
// storage driver and the metadata repository.
// ---------------------------------------------------------------------------

import { FileMetadataRepository } from '../repositories';
import { getStorageDriver } from '../storage';
import {
  CreateFileMetadataInput,
  FileVisibility,
  PaginationParams,
  PaginatedResult,
  FileMetadata,
} from '../core/types';
import { NotFoundError, PayloadTooLargeError, UnsupportedMediaTypeError } from '../core/errors';
import { isMimeTypeAllowed } from '../utils/mime';
import { getConfig } from '../config';
import { getLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import { Readable } from 'node:stream';

export class FileService {
  private readonly repo = new FileMetadataRepository();
  private readonly storage = getStorageDriver();
  private readonly logger = getLogger().child({ service: 'FileService' });

  // ---------------------------------------------------------------------------
  // Upload
  // ---------------------------------------------------------------------------

  public async upload(
    projectId: string,
    file: Express.Multer.File,
    options?: { folderId?: string | null; visibility?: FileVisibility },
  ): Promise<FileMetadata> {
    // Validate MIME type
    if (!isMimeTypeAllowed(file.mimetype)) {
      throw new UnsupportedMediaTypeError(file.mimetype);
    }

    // Validate size
    const config = getConfig();
    if (file.size > config.storage.maxFileSizeBytes) {
      throw new PayloadTooLargeError(config.storage.maxFileSizeBytes);
    }

    // Generate unique filename
    const extension = path.extname(file.originalname);
    const filename = `${uuidv4()}${extension}`;

    // Store the file via the storage driver
    const result = await this.storage.store(
      {
        filename,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        stream: Readable.from(file.buffer),
      },
      projectId,
    );

    // Persist metadata
    const metadataInput: CreateFileMetadataInput = {
      projectId,
      folderId: options?.folderId ?? null,
      filename: result.filename,
      originalFilename: file.originalname,
      extension,
      mimeType: result.mimeType,
      size: result.size,
      hash: result.hash,
      visibility: options?.visibility ?? FileVisibility.Private,
    };

    const metadata = await this.repo.create(metadataInput);

    this.logger.info({ fileId: metadata.id, filename }, 'File uploaded');
    return metadata as FileMetadata;
  }

  // ---------------------------------------------------------------------------
  // Download
  // ---------------------------------------------------------------------------

  public async download(
    id: string,
  ): Promise<{ metadata: FileMetadata; stream: NodeJS.ReadableStream }> {
    const metadata = await this.getById(id);
    const stream = await this.storage.read(metadata.filename, metadata.projectId);
    return { metadata: metadata as FileMetadata, stream };
  }

  // ---------------------------------------------------------------------------
  // Stream (for media)
  // ---------------------------------------------------------------------------

  public async stream(
    id: string,
    range?: string,
  ): Promise<{
    metadata: FileMetadata;
    stream: NodeJS.ReadableStream;
    start: number;
    end: number;
    totalSize: number;
  }> {
    const metadata = await this.getById(id);
    const stream = await this.storage.read(metadata.filename, metadata.projectId);

    const totalSize = metadata.size;
    let start = 0;
    let end = totalSize - 1;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      start = Number.parseInt(parts[0] ?? '0', 10);
      end = parts[1] ? Number.parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize) {
        start = 0;
        end = totalSize - 1;
      }
    }

    return { metadata: metadata as FileMetadata, stream, start, end, totalSize };
  }

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  public async getById(id: string) {
    const metadata = await this.repo.findById(id);
    if (!metadata) {
      throw new NotFoundError('File', id);
    }
    return metadata;
  }

  public async listByProjectId(
    projectId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<FileMetadata>> {
    return this.repo.findByProjectId(projectId, params) as Promise<PaginatedResult<FileMetadata>>;
  }

  public async listByFolderId(
    folderId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<FileMetadata>> {
    return this.repo.findByFolderId(folderId, params) as Promise<PaginatedResult<FileMetadata>>;
  }

  public async list(filters: {
    projectId?: string;
    folderId?: string;
    search?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<FileMetadata>> {
    return this.repo.findAll(filters) as Promise<PaginatedResult<FileMetadata>>;
  }

  public async update(id: string, data: { folderId?: string | null; visibility?: FileVisibility }) {
    const metadata = await this.repo.findById(id);
    if (!metadata) {
      throw new NotFoundError('File', id);
    }

    const updateData: Record<string, unknown> = {};
    if (data.folderId !== undefined) updateData.folderId = data.folderId;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;

    return this.repo.update(id, updateData as Partial<CreateFileMetadataInput>);
  }

  public async delete(id: string) {
    const metadata = await this.repo.findById(id);
    if (!metadata) {
      throw new NotFoundError('File', id);
    }

    // Delete from storage first, then metadata
    await this.storage.delete(metadata.filename, metadata.projectId);
    await this.repo.delete(id);

    this.logger.info({ fileId: id, filename: metadata.filename }, 'File deleted');
  }
}
