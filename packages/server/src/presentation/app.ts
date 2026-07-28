// ---------------------------------------------------------------------------
// MediaVault – Express Application Factory
// ---------------------------------------------------------------------------

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { apiRouter } from './routes';
import { errorHandler } from './error-handler';
import { getLogger } from '../utils/logger';

const VITE_PORT = 5173;

export async function createApp(): Promise<express.Application> {
  const app = express();
  const logger = getLogger();
  const isDev = process.env['NODE_ENV'] !== 'production';

  // ---------------------------------------------------------------------------
  // Global middleware
  // ---------------------------------------------------------------------------

  app.use(
    helmet({
      contentSecurityPolicy: isDev ? false : undefined,
      crossOriginEmbedderPolicy: isDev ? false : undefined,
    }),
  );
  app.use(cors({ credentials: true, origin: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request logging
  app.use((req, _res, next) => {
    logger.debug({ method: req.method, url: req.url }, 'Incoming request');
    next();
  });

  // ---------------------------------------------------------------------------
  // Health check
  // ---------------------------------------------------------------------------

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ---------------------------------------------------------------------------
  // API routes
  // ---------------------------------------------------------------------------

  app.use('/api/v1', apiRouter);

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------

  if (isDev) {
    // Dev: proxy to Vite standalone dev server
    const { createServer: createViteServer } = await import('vite');
    const dashboardRoot = path.resolve(__dirname, '..', '..', '..', 'dashboard');

    const vite = await createViteServer({
      root: dashboardRoot,
      server: { port: VITE_PORT, strictPort: true },
      appType: 'spa',
    });

    await vite.listen();

    // Proxy all non-API requests to Vite
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/') || req.path === '/health') {
        return next();
      }

      const proxyReq = http.request(
        {
          hostname: 'localhost',
          port: VITE_PORT,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
          proxyRes.pipe(res);
        },
      );
      proxyReq.on('error', () => next());
      req.pipe(proxyReq);
    });

    logger.info({ port: VITE_PORT }, 'Vite dev server started, proxying dashboard requests');
  } else {
    // Production: serve built static files
    const distPath = path.resolve(__dirname, '..', '..', '..', 'dashboard', 'dist');

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      logger.warn(`Dashboard build not found at ${distPath}. Run 'npm run build' first.`);
    }
  }

  // ---------------------------------------------------------------------------
  // Error handler (must be last)
  // ---------------------------------------------------------------------------

  app.use(errorHandler);

  return app;
}
