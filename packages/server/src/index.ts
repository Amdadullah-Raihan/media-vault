// ---------------------------------------------------------------------------
// MediaVault – Entry Point
// ---------------------------------------------------------------------------

import { createApp } from './presentation';
import { getConfig } from './config';
import { getLogger } from './utils/logger';
import { disconnectPrisma } from './utils/prisma';

async function main(): Promise<void> {
  const config = getConfig();
  const logger = getLogger();

  const app = createApp();

  const server = app.listen(config.server.port, config.server.host, () => {
    logger.info(
      { host: config.server.host, port: config.server.port },
      'MediaVault server started',
    );
    logger.info({ url: 'http://localhost:5173' }, 'MediaVault Dashboard');
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Shutting down...');
    server.close(async () => {
      await disconnectPrisma();
      logger.info('Server stopped');
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  const logger = getLogger();
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
