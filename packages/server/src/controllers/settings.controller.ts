// ---------------------------------------------------------------------------
// MediaVault – Settings Controller
//
// Returns dashboard-relevant configuration (non-sensitive).
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { getConfig } from '../config';
import { ok } from '../utils/responses';

export class SettingsController {
  // ---------------------------------------------------------------------------
  // GET /settings
  // ---------------------------------------------------------------------------

  get = (_req: Request, res: Response): void => {
    const config = getConfig();

    ok(res, {
      adminUsername: config.auth.adminUsername,
      storage: {
        maxFileSizeBytes: config.storage.maxFileSizeBytes,
        allowedMimeTypes: config.storage.allowedMimeTypes,
      },
    });
  };
}
