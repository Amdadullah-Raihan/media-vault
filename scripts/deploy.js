#!/usr/bin/env node
// ---------------------------------------------------------------------------
// MediaVault – Deployment Script
//
// Creates a self-contained deployment directory that works on any shared
// hosting (cPanel, Plesk, etc.) — no npm workspaces, no hoisted node_modules.
//
// Usage: node scripts/deploy.js
//
// Output: media-vault-deploy/
//   ├── package.json       # Flat, no workspaces, production-only
//   ├── server.js          # Simple entry point launcher
//   ├── dist/              # Compiled server
//   ├── dashboard/         # Built dashboard (served by server)
//   ├── node_modules/      # Self-contained production deps
//   └── .env.example       # Environment template
// ---------------------------------------------------------------------------

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const DEPLOY = path.join(ROOT, 'media-vault-deploy');
const SERVER_SRC = path.join(ROOT, 'packages', 'server');
const DASHBOARD_SRC = path.join(ROOT, 'packages', 'dashboard');

// ---------------------------------------------------------------------------
// Step 1: Build everything
// ---------------------------------------------------------------------------

console.log('┌─────────────────────────────────────────┐');
console.log('│  MediaVault – Deployment Builder        │');
console.log('└─────────────────────────────────────────┘\n');

console.log('[1/6] Building all packages...');
execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

// ---------------------------------------------------------------------------
// Step 2: Clean and create deploy directory
// ---------------------------------------------------------------------------

console.log('\n[2/6] Preparing deploy directory...');
if (fs.existsSync(DEPLOY)) {
  fs.rmSync(DEPLOY, { recursive: true, force: true });
}
fs.mkdirSync(DEPLOY, { recursive: true });

// ---------------------------------------------------------------------------
// Step 3: Copy server dist
// ---------------------------------------------------------------------------

console.log('[3/6] Copying server build...');
const serverDist = path.join(SERVER_SRC, 'dist');
if (!fs.existsSync(serverDist)) {
  console.error('ERROR: Server build not found. Run npm run build first.');
  process.exit(1);
}
copyDir(serverDist, path.join(DEPLOY, 'dist'));

// ---------------------------------------------------------------------------
// Step 4: Copy dashboard dist
// ---------------------------------------------------------------------------

console.log('[4/6] Copying dashboard build...');
const dashboardDist = path.join(DASHBOARD_SRC, 'dist');
if (!fs.existsSync(dashboardDist)) {
  console.error('ERROR: Dashboard build not found. Run npm run build first.');
  process.exit(1);
}
copyDir(dashboardDist, path.join(DEPLOY, 'dashboard', 'dist'));

// ---------------------------------------------------------------------------
// Step 5: Create flat package.json with production deps only
// ---------------------------------------------------------------------------

console.log('[5/6] Creating standalone package.json...');
const serverPkg = JSON.parse(fs.readFileSync(path.join(SERVER_SRC, 'package.json'), 'utf-8'));

// Also include vite in production so the server can run in dev mode if needed
// But for shared hosting, we strip dev deps
const deployPkg = {
  name: 'media-vault-deploy',
  version: serverPkg.version,
  private: true,
  description: 'MediaVault self-contained deployment',
  main: 'server.js',
  scripts: {
    start: 'node server.js',
  },
  dependencies: serverPkg.dependencies,
  engines: { node: '>=18.0.0' },
};

fs.writeFileSync(path.join(DEPLOY, 'package.json'), JSON.stringify(deployPkg, null, 2), 'utf-8');

// ---------------------------------------------------------------------------
// Step 6: Create entry point launcher
// ---------------------------------------------------------------------------

console.log('[6/6] Creating launcher...');
const launcher = `// MediaVault – Self-contained launcher for shared hosting
// Points the server at the flat deploy structure.

const path = require('node:path');

// Tell the server where the dashboard lives in the flat deploy layout
process.env.MEDIAVAULT_DASHBOARD_PATH =
  process.env.MEDIAVAULT_DASHBOARD_PATH ||
  path.join(__dirname, 'dashboard', 'dist');

// Load the server
require('./dist/index.js');
`;

fs.writeFileSync(path.join(DEPLOY, 'server.js'), launcher, 'utf-8');

// Copy .env.example if it exists
const envExample = path.join(ROOT, '.env');
if (fs.existsSync(envExample)) {
  const envContent = fs.readFileSync(envExample, 'utf-8');
  // Add note about MEDIAVAULT_DASHBOARD_PATH
  const deployEnv =
    envContent +
    '\n# Dashboard path (auto-detected in deploy mode)\n# MEDIAVAULT_DASHBOARD_PATH=./dashboard/dist\n';
  fs.writeFileSync(path.join(DEPLOY, '.env.example'), deployEnv, 'utf-8');
}

// ---------------------------------------------------------------------------
// Install production deps in the deploy directory
// ---------------------------------------------------------------------------

console.log('\nInstalling production dependencies in deploy/...');
execSync('npm install --omit=dev --ignore-scripts', {
  cwd: DEPLOY,
  stdio: 'inherit',
});

// Also copy vite for dev fallback (optional, shared hosting won't use it)
// Skip vite — shared hosting runs in production mode.

console.log('\n✅ Deployment package ready at: media-vault-deploy/');
console.log('\nTo deploy to shared hosting:');
console.log('  1. Upload the entire media-vault-deploy/ folder to your server');
console.log('  2. Copy .env.example to .env and configure it');
console.log('  3. Set the app entry point to: server.js');
console.log('  4. Set the app root to the media-vault-deploy/ directory');
console.log('  5. Ensure Node.js >= 18 is enabled\n');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
