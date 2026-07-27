// ---------------------------------------------------------------------------
// MediaVault – Prisma Configuration
//
// Prisma 7+ requires the datasource URL to live here instead of the schema.
// The schema file only declares the provider.
// ---------------------------------------------------------------------------

import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';
import path from 'node:path';

// Load .env so DATABASE_URL is available during migrations
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  datasource: {
    url:
      process.env['DATABASE_URL'] ?? `file:${path.resolve(process.cwd(), 'data', 'mediavault.db')}`,
  },
});
