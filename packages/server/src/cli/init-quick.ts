// ---------------------------------------------------------------------------
// MediaVault – Admin Initialization (non-interactive)
//
// Usage: npx tsx src/cli/init-quick.ts <username> <password>
// ---------------------------------------------------------------------------

import { getPrisma } from '../utils/prisma';
import { SettingsRepository } from '../repositories/settings.repository';
import { SessionRepository } from '../repositories/session.repository';
import { AuthService } from '../services/auth.service';
import { getLogger } from '../utils/logger';

async function main(): Promise<void> {
  const logger = getLogger();

  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    logger.error('Usage: npx tsx src/cli/init-quick.ts <username> <password>');
    process.exit(1);
  }

  if (password.length < 8) {
    logger.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const prisma = getPrisma();
  const settingsRepo = new SettingsRepository(prisma);
  const sessionRepo = new SessionRepository(prisma);
  const authService = new AuthService(settingsRepo, sessionRepo);

  const initialized = await authService.isInitialized();

  if (initialized) {
    logger.info('Admin account already initialized. Skipping.');
    await prisma.$disconnect();
    process.exit(0);
  }

  await authService.initialize(username, password);
  logger.info({ username }, 'Admin account created successfully.');
  logger.info('Dashboard: http://localhost:5173');

  await prisma.$disconnect();
}

main().catch((err) => {
  const logger = getLogger();
  logger.error({ err }, 'Initialization failed');
  process.exit(1);
});
