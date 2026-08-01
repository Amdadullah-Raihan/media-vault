// ---------------------------------------------------------------------------
// MediaVault – File Metadata Repository
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../utils/store';
import {
  CreateFileMetadataInput,
  FileMetadata,
  FileVisibility,
  PaginatedResult,
  PaginationParams,
} from '../core/types';

const COLLECTION = 'files';

export class FileMetadataRepository {
  private readonly store = getStore();

  public async create(input: CreateFileMetadataInput): Promise<FileMetadata> {
    const now = new Date();
    const metadata: FileMetadata = {
      id: uuidv4(),
      projectId: input.projectId,
      folderId: input.folderId ?? null,
      filename: input.filename,
      originalFilename: input.originalFilename,
      extension: input.extension,
      mimeType: input.mimeType,
      size: input.size,
      hash: input.hash,
      visibility: input.visibility ?? FileVisibility.Private,
      createdAt: now,
      updatedAt: now,
    };
    return this.store.insert<FileMetadata>(COLLECTION, metadata);
  }

  public async findById(id: string): Promise<FileMetadata | undefined> {
    return this.store.findOne<FileMetadata>(COLLECTION, (f) => f.id === id);
  }

  public async findByProjectAndFilename(
    projectId: string,
    filename: string,
  ): Promise<FileMetadata | undefined> {
    return this.store.findOne<FileMetadata>(
      COLLECTION,
      (f) => f.projectId === projectId && f.filename === filename,
    );
  }

  public async findByProjectId(
    projectId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<FileMetadata>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const sortBy = (params.sortBy ?? 'createdAt') as keyof FileMetadata;
    const sortOrder = params.sortOrder ?? 'desc';

    const all = this.store.findMany<FileMetadata>(COLLECTION, (f) => f.projectId === projectId);

    const sorted = this.sortByKey(all, sortBy, sortOrder);

    return this.paginate(sorted, page, limit);
  }

  public async findByFolderId(
    folderId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<FileMetadata>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const sortBy = (params.sortBy ?? 'createdAt') as keyof FileMetadata;
    const sortOrder = params.sortOrder ?? 'desc';

    const all = this.store.findMany<FileMetadata>(COLLECTION, (f) => f.folderId === folderId);

    const sorted = this.sortByKey(all, sortBy, sortOrder);

    return this.paginate(sorted, page, limit);
  }

  public async findAll(filters: {
    projectId?: string;
    folderId?: string;
    search?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<FileMetadata>> {
    const { projectId, folderId, search, page, limit, sortBy, sortOrder } = filters;

    let results = this.store.all<FileMetadata>(COLLECTION);

    if (projectId) {
      results = results.filter((f) => f.projectId === projectId);
    }
    if (folderId) {
      results = results.filter((f) => f.folderId === folderId);
    }
    if (search) {
      const lower = search.toLowerCase();
      results = results.filter(
        (f) =>
          f.originalFilename.toLowerCase().includes(lower) ||
          f.filename.toLowerCase().includes(lower),
      );
    }

    const sortKey = (sortBy ?? 'createdAt') as keyof FileMetadata;
    const order = sortOrder ?? 'desc';
    results = this.sortByKey(results, sortKey, order);

    return this.paginate(results, page, limit);
  }

  public async update(
    id: string,
    data: Partial<Pick<CreateFileMetadataInput, 'folderId' | 'visibility'>>,
  ): Promise<FileMetadata | undefined> {
    return this.store.update<FileMetadata>(
      COLLECTION,
      (f) => f.id === id,
      (f) => ({
        ...f,
        ...(data.folderId !== undefined ? { folderId: data.folderId } : {}),
        ...(data.visibility !== undefined ? { visibility: data.visibility as FileVisibility } : {}),
        updatedAt: new Date(),
      }),
    );
  }

  public async delete(id: string): Promise<FileMetadata | undefined> {
    return this.store.delete<FileMetadata>(COLLECTION, (f) => f.id === id);
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private sortByKey<T>(data: T[], key: keyof T, order: 'asc' | 'desc'): T[] {
    return [...data].sort((a, b) => {
      const aVal = a[key] as unknown;
      const bVal = b[key] as unknown;
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return order === 'asc' ? -1 : 1;
      if (bVal == null) return order === 'asc' ? 1 : -1;
      if ((aVal as number | string) < (bVal as number | string)) return order === 'asc' ? -1 : 1;
      if ((aVal as number | string) > (bVal as number | string)) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private paginate<T>(data: T[], page: number, limit: number): PaginatedResult<T> {
    const total = data.length;
    const skip = (page - 1) * limit;
    return {
      data: data.slice(skip, skip + limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
