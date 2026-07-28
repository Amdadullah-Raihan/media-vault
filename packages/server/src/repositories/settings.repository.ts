// ---------------------------------------------------------------------------
// MediaVault – Settings Repository
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client';

export class SettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get(key: string): Promise<string | null> {
    const row = await this.prisma.settings.findUnique({ where: { key } });
    return row?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async delete(key: string): Promise<void> {
    await this.prisma.settings.delete({ where: { key } }).catch(() => {
      // Ignore if doesn't exist
    });
  }

  async getMany(keys: string[]): Promise<Record<string, string | null>> {
    const rows = await this.prisma.settings.findMany({
      where: { key: { in: keys } },
    });
    const result: Record<string, string | null> = {};
    for (const k of keys) {
      result[k] = rows.find((r) => r.key === k)?.value ?? null;
    }
    return result;
  }
}
