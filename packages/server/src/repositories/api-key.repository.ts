// ---------------------------------------------------------------------------
// MediaVault – API Key Repository
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma';
import { CreateApiKeyInput } from '../core/types';

export class ApiKeyRepository {
  private readonly prisma: PrismaClient;

  public constructor() {
    this.prisma = getPrisma();
  }

  public async create(input: CreateApiKeyInput & { key: string }) {
    return this.prisma.apiKey.create({ data: input });
  }

  public async findById(id: string) {
    return this.prisma.apiKey.findUnique({ where: { id } });
  }

  public async findByKey(key: string) {
    return this.prisma.apiKey.findUnique({ where: { key } });
  }

  public async findByProjectId(projectId: string) {
    return this.prisma.apiKey.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async delete(id: string) {
    return this.prisma.apiKey.delete({ where: { id } });
  }

  public async countByProjectId(projectId: string): Promise<number> {
    return this.prisma.apiKey.count({ where: { projectId } });
  }
}
