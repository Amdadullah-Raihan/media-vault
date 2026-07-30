import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma';

export interface UploadRuleRow {
  id: string;
  category: string;
  extension: string | null;
  enabled: boolean;
  maxSize: number;
}

export class UploadRuleRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = getPrisma();
  }

  async findAll(): Promise<UploadRuleRow[]> {
    return this.prisma.uploadRule.findMany({
      orderBy: [{ category: 'asc' }, { extension: 'asc' }],
    });
  }

  async findByCategory(category: string): Promise<UploadRuleRow[]> {
    return this.prisma.uploadRule.findMany({ where: { category }, orderBy: { extension: 'asc' } });
  }

  async findCategoryRule(category: string): Promise<UploadRuleRow | null> {
    return this.prisma.uploadRule.findFirst({
      where: { category, extension: null },
    });
  }

  async findExtensionRule(category: string, extension: string): Promise<UploadRuleRow | null> {
    return this.prisma.uploadRule.findFirst({
      where: { category, extension },
    });
  }

  async count(): Promise<number> {
    return this.prisma.uploadRule.count();
  }

  async upsert(
    category: string,
    extension: string | null,
    data: { enabled: boolean; maxSize: number },
  ): Promise<UploadRuleRow> {
    const existing = await this.prisma.uploadRule.findFirst({
      where: { category, extension },
    });

    if (existing) {
      return this.prisma.uploadRule.update({
        where: { id: existing.id },
        data: { enabled: data.enabled, maxSize: data.maxSize },
      });
    }

    return this.prisma.uploadRule.create({
      data: { category, extension, enabled: data.enabled, maxSize: data.maxSize },
    });
  }

  async delete(category: string, extension: string | null): Promise<void> {
    const existing = await this.prisma.uploadRule.findFirst({
      where: { category, extension },
    });
    if (existing) {
      await this.prisma.uploadRule.delete({ where: { id: existing.id } });
    }
  }

  async createMany(
    rows: { category: string; extension: string | null; enabled: boolean; maxSize: number }[],
  ): Promise<void> {
    for (const row of rows) {
      const exists = await this.prisma.uploadRule.findFirst({
        where: { category: row.category, extension: row.extension },
      });
      if (!exists) {
        await this.prisma.uploadRule.create({ data: row });
      }
    }
  }
}
