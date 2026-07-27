// ---------------------------------------------------------------------------
// MediaVault – File Metadata Repository
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma';
import { CreateFileMetadataInput, PaginatedResult, PaginationParams } from '../core/types';

export class FileMetadataRepository {
  private readonly prisma: PrismaClient;

  public constructor() {
    this.prisma = getPrisma();
  }

  public async create(input: CreateFileMetadataInput) {
    return this.prisma.fileMetadata.create({ data: input });
  }

  public async findById(id: string) {
    return this.prisma.fileMetadata.findUnique({ where: { id } });
  }

  public async findByProjectAndFilename(projectId: string, filename: string) {
    return this.prisma.fileMetadata.findUnique({
      where: { projectId_filename: { projectId, filename } },
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
      this.prisma.fileMetadata.findMany({
        where: { projectId },
        skip,
        take: limit,
        orderBy: { [params.sortBy ?? 'createdAt']: params.sortOrder ?? 'desc' },
      }),
      this.prisma.fileMetadata.count({ where: { projectId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async findByFolderId(
    folderId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.fileMetadata.findMany({
        where: { folderId },
        skip,
        take: limit,
        orderBy: { [params.sortBy ?? 'createdAt']: params.sortOrder ?? 'desc' },
      }),
      this.prisma.fileMetadata.count({ where: { folderId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async update(
    id: string,
    data: Partial<Pick<CreateFileMetadataInput, 'folderId' | 'visibility'>>,
  ) {
    return this.prisma.fileMetadata.update({ where: { id }, data });
  }

  public async delete(id: string) {
    return this.prisma.fileMetadata.delete({ where: { id } });
  }
}
