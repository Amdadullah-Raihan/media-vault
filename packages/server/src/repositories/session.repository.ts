// ---------------------------------------------------------------------------
// MediaVault – Session Repository
// ---------------------------------------------------------------------------

import { PrismaClient, Session } from '@prisma/client';

export class SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(adminId: string, expiresAt: Date): Promise<Session> {
    return this.prisma.session.create({
      data: { adminId, expiresAt },
    });
  }

  async findById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { id } });
  }

  async touch(id: string): Promise<void> {
    await this.prisma.session.update({
      where: { id },
      data: { lastActivity: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({ where: { id } }).catch(() => {
      // Already deleted
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}
