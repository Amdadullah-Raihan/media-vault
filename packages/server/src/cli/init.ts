// ---------------------------------------------------------------------------
// MediaVault – Admin Initialization CLI
//
// Usage: npx tsx src/cli/init.ts
//
// Creates the administrator account. Must be run once before using the
// dashboard. Prompts for username and password interactively.
// ---------------------------------------------------------------------------

import { createInterface } from 'node:readline';
import { getPrisma } from '../utils/prisma';
import { SettingsRepository } from '../repositories/settings.repository';
import { SessionRepository } from '../repositories/session.repository';
import { AuthService } from '../services/auth.service';
import { getLogger } from '../utils/logger';

async function prompt(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => resolve(answer.trim()));
  });
}

async function main(): Promise<void> {
  const logger = getLogger();
  const prisma = getPrisma();
  const settingsRepo = new SettingsRepository(prisma);
  const sessionRepo = new SessionRepository(prisma);
  const authService = new AuthService(settingsRepo, sessionRepo);

  const initialized = await authService.isInitialized();

  if (initialized) {
    logger.info('Admin account already initialized.');
    logger.info('To reset, delete the settings rows from the database and re-run this script.');
    await prisma.$disconnect();
    return;
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('');
  console.log('  ╔═══════════════════════════════════╗');
  console.log('  ║   MediaVault – Admin Setup       ║');
  console.log('  ╚═══════════════════════════════════╝');
  console.log('');
  console.log('  Create the administrator account.');
  console.log('  This account is used to log into the dashboard.');
  console.log('');

  const username = await prompt(rl, '  Admin Username: ');
  if (!username) {
    logger.error('Username is required.');
    process.exit(1);
  }

  const password = await prompt(rl, '  Admin Password:  ');
  if (!password || password.length < 8) {
    logger.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const confirm = await prompt(rl, '  Confirm Password: ');
  if (password !== confirm) {
    logger.error('Passwords do not match.');
    process.exit(1);
  }

  rl.close();

  await authService.initialize(username, password);
  logger.info({ username }, 'Admin account created successfully.');
  logger.info('You can now log into the dashboard at http://localhost:5173');

  await prisma.$disconnect();
}

main().catch((err) => {
  const logger = getLogger();
  logger.error({ err }, 'Initialization failed');
  process.exit(1);
});
