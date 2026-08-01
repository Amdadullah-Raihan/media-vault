// ---------------------------------------------------------------------------
// MediaVault – Entry Point
// ---------------------------------------------------------------------------

import { createApp } from './presentation';
import { getConfig } from './config';
import { getLogger } from './utils/logger';

async function main(): Promise<void> {
  const config = getConfig();
  const logger = getLogger();

  const app = await createApp();

  const server = app.listen(config.server.port, config.server.host, () => {
    const baseUrl = `http://${config.server.host === '0.0.0.0' ? 'localhost' : config.server.host}:${String(config.server.port)}`;
    logger.info(
      { host: config.server.host, port: config.server.port },
      'MediaVault server started',
    );
    logger.info({ url: baseUrl }, 'Dashboard');
    logger.info({ url: `${baseUrl}/api/v1` }, 'API');
  });

  // Graceful shutdown
  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'Shutting down...');
    server.close(() => {
      logger.info('Server stopped');
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });
}

main().catch((err: unknown) => {
  const logger = getLogger();
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
