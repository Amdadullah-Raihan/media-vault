// ---------------------------------------------------------------------------
// MediaVault – MIME Type Utilities
// ---------------------------------------------------------------------------

import { getConfig } from '../config';

/**
 * Check whether the given MIME type is in the configured allow-list.
 */
export function isMimeTypeAllowed(mimeType: string): boolean {
  const config = getConfig();
  return config.storage.allowedMimeTypes.includes(mimeType);
}

/**
 * Extract the category from a MIME type string (e.g. "image/png" → "image").
 */
export function getMimeCategory(mimeType: string): string {
  return mimeType.split('/')[0] ?? 'unknown';
}
