// ---------------------------------------------------------------------------
// MediaVault – Project Repository
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma';
import { CreateProjectInput, PaginatedResult, PaginationParams } from '../core/types';

export class ProjectRepository {
  private readonly prisma: PrismaClient;

  public constructor() {
    this.prisma = getPrisma();
  }

  public async create(input: CreateProjectInput) {
    return this.prisma.project.create({ data: input });
  }

  public async findById(id: string) {
    return this.prisma.project.findUnique({ where: { id } });
  }

  public async findByName(name: string) {
    return this.prisma.project.findUnique({ where: { name } });
  }

  public async findAll(params: PaginationParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        skip,
        take: limit,
        orderBy: { [params.sortBy ?? 'createdAt']: params.sortOrder ?? 'desc' },
      }),
      this.prisma.project.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async delete(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  public async exists(id: string): Promise<boolean> {
    const count = await this.prisma.project.count({ where: { id } });
    return count > 0;
  }
}
