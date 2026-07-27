#!/usr/bin/env node
// ---------------------------------------------------------------------------
// MediaVault – CLI
//
// Commands: init, start, build, doctor, migrate, generate-api-key, backup, restore
// ---------------------------------------------------------------------------

import { Command } from 'commander';

const program = new Command();

program
  .name('mediavault')
  .description('MediaVault – self-hosted media management server')
  .version('1.0.0');

// ---------------------------------------------------------------------------
// init – scaffold a new MediaVault project
// ---------------------------------------------------------------------------

program
  .command('init')
  .description('Initialize a new MediaVault project')
  .action(() => {
    console.log('Initialization not yet implemented. Use the manual setup for now.');
  });

// ---------------------------------------------------------------------------
// start – start the server
// ---------------------------------------------------------------------------

program
  .command('start')
  .description('Start the MediaVault server')
  .action(() => {
    console.log('Start the server by running: npm run dev --workspace=@media-vault/server');
  });

// ---------------------------------------------------------------------------
// build – build all packages
// ---------------------------------------------------------------------------

program
  .command('build')
  .description('Build all packages')
  .action(() => {
    console.log('Build all packages by running: npm run build');
  });

// ---------------------------------------------------------------------------
// doctor – diagnose common issues
// ---------------------------------------------------------------------------

program
  .command('doctor')
  .description('Diagnose common issues with the MediaVault setup')
  .action(() => {
    console.log('Doctor check not yet implemented.');
  });

// ---------------------------------------------------------------------------
// migrate – run database migrations
// ---------------------------------------------------------------------------

program
  .command('migrate')
  .description('Run database migrations')
  .action(() => {
    console.log('Run migrations with: npm run db:migrate --workspace=@media-vault/server');
  });

// ---------------------------------------------------------------------------
// generate-api-key – create a new API key via the API
// ---------------------------------------------------------------------------

program
  .command('generate-api-key')
  .description('Generate a new API key for a project')
  .requiredOption('--base-url <url>', 'MediaVault server URL')
  .requiredOption('--api-key <key>', 'Existing API key for auth')
  .requiredOption('--project-id <id>', 'Project ID')
  .option('--label <label>', 'Key label', 'default')
  .action(async (options) => {
    console.log('Use the SDK to generate keys programmatically.');
    console.log(`POST ${options.baseUrl}/api/v1/api-keys`);
  });

// ---------------------------------------------------------------------------
// backup / restore (placeholder)
// ---------------------------------------------------------------------------

program
  .command('backup')
  .description('Backup metadata and files')
  .action(() => {
    console.log('Backup not yet implemented.');
  });

program
  .command('restore')
  .description('Restore from backup')
  .action(() => {
    console.log('Restore not yet implemented.');
  });

program.parse(process.argv);
