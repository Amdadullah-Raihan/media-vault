// ---------------------------------------------------------------------------
// MediaVault – Folder Repository
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma';
import { CreateFolderInput, PaginatedResult, PaginationParams } from '../core/types';

export class FolderRepository {
  private readonly prisma: PrismaClient;

  public constructor() {
    this.prisma = getPrisma();
  }

  public async create(input: CreateFolderInput & { path: string }) {
    return this.prisma.folder.create({ data: input });
  }

  public async findById(id: string) {
    return this.prisma.folder.findUnique({ where: { id } });
  }

  public async findByProjectAndPath(projectId: string, folderPath: string) {
    return this.prisma.folder.findUnique({
      where: { projectId_path: { projectId, path: folderPath } },
    });
  }

  public async findByProjectId(
    projectId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.folder.findMany({
        where: { projectId },
        skip,
        take: limit,
        orderBy: { [params.sortBy ?? 'createdAt']: params.sortOrder ?? 'desc' },
      }),
      this.prisma.folder.count({ where: { projectId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async findByParentId(parentId: string) {
    return this.prisma.folder.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });
  }

  public async delete(id: string) {
    return this.prisma.folder.delete({ where: { id } });
  }
}
