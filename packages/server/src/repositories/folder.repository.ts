// ---------------------------------------------------------------------------
// MediaVault – Folder Repository
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../utils/store';
import { CreateFolderInput, Folder, PaginatedResult, PaginationParams } from '../core/types';

const COLLECTION = 'folders';

export class FolderRepository {
  private readonly store = getStore();

  public async create(input: CreateFolderInput & { path: string }): Promise<Folder> {
    const now = new Date();
    const folder: Folder = {
      id: uuidv4(),
      projectId: input.projectId,
      parentId: input.parentId ?? null,
      name: input.name,
      path: input.path,
      createdAt: now,
      updatedAt: now,
    };
    return this.store.insert<Folder>(COLLECTION, folder);
  }

  public async findById(id: string): Promise<Folder | undefined> {
    return this.store.findOne<Folder>(COLLECTION, (f) => f.id === id);
  }

  public async findByProjectAndPath(
    projectId: string,
    folderPath: string,
  ): Promise<Folder | undefined> {
    return this.store.findOne<Folder>(
      COLLECTION,
      (f) => f.projectId === projectId && f.path === folderPath,
    );
  }

  public async findByProjectId(
    projectId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<Folder>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const sortBy = (params.sortBy ?? 'createdAt') as keyof Folder;
    const sortOrder = params.sortOrder ?? 'desc';

    const all = this.store.findMany<Folder>(COLLECTION, (f) => f.projectId === projectId);

    const sorted = [...all].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortOrder === 'asc' ? -1 : 1;
      if (bVal == null) return sortOrder === 'asc' ? 1 : -1;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = sorted.length;
    const skip = (page - 1) * limit;
    const data = sorted.slice(skip, skip + limit);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public async findByParentId(parentId: string): Promise<Folder[]> {
    return this.store
      .findMany<Folder>(COLLECTION, (f) => f.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  public async delete(id: string): Promise<Folder | undefined> {
    const folder = this.store.delete<Folder>(COLLECTION, (f) => f.id === id);

    if (folder) {
      // Cascade: move child folders to parent's parent
      this.store.update<Folder>(
        COLLECTION,
        (f) => f.parentId === id,
        (f) => ({ ...f, parentId: folder.parentId, updatedAt: new Date() }),
      );
      // Unlink files from deleted folder
      this.store.update(
        'files',
        (f: { folderId: string | null }) => f.folderId === id,
        (f) => ({ ...f, folderId: null }),
      );
    }

    return folder;
  }
}
