// ---------------------------------------------------------------------------
// MediaVault – Prisma Client Singleton
//
// Prisma 6 uses the datasource URL from schema.prisma.
// The client is a singleton to avoid connection exhaustion during development.
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client';
import { getLogger } from './logger';

let _prisma: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    const logger = getLogger();

    const prisma = new PrismaClient({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    const childLogger = logger.child({ component: 'prisma' });
    prisma.$on('warn', (e: unknown) => {
      childLogger.warn(e);
    });
    prisma.$on('error', (e: unknown) => {
      childLogger.error(e);
    });

    _prisma = prisma;
  }
  return _prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = undefined;
  }
}
