// ---------------------------------------------------------------------------
// MediaVault – Logging System
//
// Uses pino for structured, high-performance logging. The logger is
// configured once at startup and shared across the application.
// ---------------------------------------------------------------------------

import { pino, Logger } from 'pino';
import { getConfig } from '../config';

let _logger: Logger | undefined;

export function getLogger(): Logger {
  if (!_logger) {
    const config = getConfig();
    _logger = pino({
      level: config.logging.level,
      transport: config.logging.pretty
        ? {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:standard' },
          }
        : undefined,
    });
  }
  return _logger;
}

/** For testing: reset the cached logger. */
export function resetLogger(): void {
  _logger = undefined;
}

/** Convenience: create a child logger with bounded context. */
export function createChildLogger(bindings: Record<string, unknown>): Logger {
  return getLogger().child(bindings);
}
