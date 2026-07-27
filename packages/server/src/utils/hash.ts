// ---------------------------------------------------------------------------
// MediaVault – Hashing Utilities
// ---------------------------------------------------------------------------

import { createHash, randomBytes } from 'node:crypto';

/**
 * Compute the SHA-256 hex digest of the given buffer or string.
 */
export function sha256(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a cryptographically secure random hex string.
 */
export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a URL-safe API key prefix for identification (first 8 chars).
 */
export function keyPrefix(key: string): string {
  return key.slice(0, 8);
}
