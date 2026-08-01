// ---------------------------------------------------------------------------
// MediaVault – Configuration System
//
// Loaded from environment variables, .env files, and (future) config file.
// Everything is configurable. Nothing is hardcoded.
// ---------------------------------------------------------------------------

import dotenv from 'dotenv';
import path from 'node:path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function envString(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function envInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function envBool(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (raw === undefined) return fallback;
  return raw.toLowerCase() === 'true' || raw === '1';
}

function envStringArray(key: string, fallback: string[]): string[] {
  const raw = process.env[key];
  if (raw === undefined) return fallback;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface AppConfig {
  server: {
    port: number;
    host: string;
  };
  database: {
    url: string;
  };
  storage: {
    driver: string;
    localPath: string;
    maxFileSizeBytes: number;
    allowedMimeTypes: string[];
  };
  auth: {
    enabled: boolean;
    apiKeyHeader: string;
    signedUrlSecret: string;
    adminUsername: string;
    adminPassword: string;
  };
  logging: {
    level: string;
    pretty: boolean;
  };
}

export function loadConfig(): AppConfig {
  return {
    server: {
      port: envInt('MEDIAVAULT_PORT', 3000),
      host: envString('MEDIAVAULT_HOST', '0.0.0.0'),
    },
    database: {
      url: envString('MEDIAVAULT_DATA_DIR', path.resolve(process.cwd(), 'data')),
    },
    storage: {
      driver: envString('MEDIAVAULT_STORAGE_DRIVER', 'local'),
      localPath: envString('MEDIAVAULT_STORAGE_LOCAL_PATH', path.resolve(process.cwd(), 'uploads')),
      maxFileSizeBytes: envInt('MEDIAVAULT_MAX_FILE_SIZE', 100 * 1024 * 1024), // 100 MB
      allowedMimeTypes: envStringArray('MEDIAVAULT_ALLOWED_MIME_TYPES', [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'video/ogg',
        'audio/mpeg',
        'audio/ogg',
        'audio/wav',
        'audio/webm',
        'application/pdf',
        'application/zip',
        'application/gzip',
        'text/plain',
        'text/csv',
        'text/html',
        'text/css',
        'text/javascript',
        'application/json',
        'application/xml',
      ]),
    },
    auth: {
      enabled: envBool('MEDIAVAULT_AUTH_ENABLED', true),
      apiKeyHeader: envString('MEDIAVAULT_API_KEY_HEADER', 'x-api-key'),
      signedUrlSecret: envString('MEDIAVAULT_SIGNED_URL_SECRET', 'change-me-in-production'),
      adminUsername: envString('ADMIN_USERNAME', 'admin'),
      adminPassword: envString('ADMIN_PASSWORD', 'admin'),
    },
    logging: {
      level: envString('MEDIAVAULT_LOG_LEVEL', 'info'),
      pretty: envBool('MEDIAVAULT_LOG_PRETTY', true),
    },
  };
}

/** Singleton config instance – loaded once at startup. */
let _config: AppConfig | undefined;

export function getConfig(): AppConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

/** For testing: reset the cached config. */
export function resetConfig(): void {
  _config = undefined;
}
