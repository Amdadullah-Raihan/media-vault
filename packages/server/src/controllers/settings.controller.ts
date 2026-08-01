// ---------------------------------------------------------------------------
// MediaVault – Settings Controller
//
// Returns dashboard-relevant configuration (non-sensitive).
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { getConfig } from '../config';
import { SettingsRepository } from '../repositories/settings.repository';
import { ok } from '../utils/responses';

const DB_USERNAME = 'admin_username';

export class SettingsController {
  // ---------------------------------------------------------------------------
  // GET /settings
  // ---------------------------------------------------------------------------

  get = async (_req: Request, res: Response): Promise<void> => {
    const config = getConfig();
    const settings = new SettingsRepository();
    const dbUsername = await settings.get(DB_USERNAME);

    ok(res, {
      adminUsername: dbUsername ?? config.auth.adminUsername,
      storage: {
        maxFileSizeBytes: config.storage.maxFileSizeBytes,
        allowedMimeTypes: config.storage.allowedMimeTypes,
      },
    });
  };
}
