// ---------------------------------------------------------------------------
// MediaVault – Express Application Factory
// ---------------------------------------------------------------------------

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiRouter } from './routes';
import { errorHandler } from './error-handler';
import { getLogger } from '../utils/logger';

export function createApp(): express.Application {
  const app = express();
  const logger = getLogger();

  // ---------------------------------------------------------------------------
  // Global middleware
  // ---------------------------------------------------------------------------

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, _res, next) => {
    logger.debug({ method: req.method, url: req.url }, 'Incoming request');
    next();
  });

  // ---------------------------------------------------------------------------
  // Health check (no auth required)
  // ---------------------------------------------------------------------------

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ---------------------------------------------------------------------------
  // API routes
  // ---------------------------------------------------------------------------

  app.use('/api/v1', apiRouter);

  // ---------------------------------------------------------------------------
  // Error handler (must be last)
  // ---------------------------------------------------------------------------

  app.use(errorHandler);

  return app;
}
