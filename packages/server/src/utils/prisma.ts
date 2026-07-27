// ---------------------------------------------------------------------------
// MediaVault – Prisma Client Singleton
//
// Prisma 7+ uses the adapter pattern: the connection URL is passed via an
// adapter rather than the datasource block in the schema.
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client';
import { PrismaSqlite } from '@prisma/adapter-sqlite';
import { getConfig } from '../config';
import { getLogger } from './logger';

let _prisma: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    const config = getConfig();
    const logger = getLogger();

    // Prisma 7+ adapter: direct database connection via the SQLite adapter
    const adapter = new PrismaSqlite({
      url: config.database.url,
    });

    _prisma = new PrismaClient({
      adapter,
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    const childLogger = logger.child({ component: 'prisma' });
    _prisma.$on('warn', (e) => childLogger.warn(e));
    _prisma.$on('error', (e) => childLogger.error(e));
  }
  return _prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = undefined;
  }
}
