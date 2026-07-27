// ---------------------------------------------------------------------------
// MediaVault – Folder Service
// ---------------------------------------------------------------------------

import { FolderRepository } from '../repositories';
import { CreateFolderInput, PaginationParams } from '../core/types';
import { NotFoundError, ConflictError, ValidationError } from '../core/errors';
import { getLogger } from '../utils/logger';

export class FolderService {
  private readonly repo = new FolderRepository();
  private readonly logger = getLogger().child({ service: 'FolderService' });

  public async create(input: CreateFolderInput) {
    // Build the full path
    const path = await this.buildPath(input.parentId ?? null, input.name, input.projectId);

    const existing = await this.repo.findByProjectAndPath(input.projectId, path);
    if (existing) {
      throw new ConflictError(`A folder already exists at "${path}"`);
    }

    const folder = await this.repo.create({
      projectId: input.projectId,
      parentId: input.parentId ?? null,
      name: input.name,
      path,
    });

    this.logger.info({ folderId: folder.id, path }, 'Folder created');
    return folder;
  }

  public async getById(id: string) {
    const folder = await this.repo.findById(id);
    if (!folder) {
      throw new NotFoundError('Folder', id);
    }
    return folder;
  }

  public async listByProjectId(projectId: string, params: PaginationParams) {
    return this.repo.findByProjectId(projectId, params);
  }

  public async listChildren(parentId: string) {
    return this.repo.findByParentId(parentId);
  }

  public async delete(id: string) {
    const folder = await this.repo.findById(id);
    if (!folder) {
      throw new NotFoundError('Folder', id);
    }

    await this.repo.delete(id);
    this.logger.info({ folderId: id, path: folder.path }, 'Folder deleted');
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async buildPath(
    parentId: string | null,
    name: string,
    projectId: string,
  ): Promise<string> {
    if (!parentId) {
      return `/${name}`;
    }

    const parent = await this.repo.findById(parentId);
    if (!parent) {
      throw new NotFoundError('Parent folder', parentId);
    }

    if (parent.projectId !== projectId) {
      throw new ValidationError('Parent folder does not belong to the specified project');
    }

    return `${parent.path}/${name}`;
  }
}
