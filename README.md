# MediaVault

A production-ready, open-source, self-hosted media management server.

MediaVault is a lightweight media server that developers can host on their own VPS, dedicated server, or shared hosting. Its purpose is to separate media storage from application backends.

## Philosophy

- **Simplicity First** — No Redis, no RabbitMQ, no Kubernetes required. Everything works locally with minimal configuration.
- **Clean Architecture** — Separated layers: Presentation → Controllers → Services → Repositories → Storage Drivers → Filesystem.
- **SOLID** — Every component follows SOLID principles. Composition over inheritance. Small, focused functions.

## Architecture

```
packages/
├── server/          # Express backend (Clean Architecture)
│   ├── src/
│   │   ├── presentation/   # Routes, error handler, Express app
│   │   ├── controllers/    # Request handlers (no business logic)
│   │   ├── services/       # Business logic (no Express coupling)
│   │   ├── repositories/   # Data access (JSON file store)
│   │   ├── storage/        # Storage driver interface + local driver
│   │   ├── core/           # Domain types, interfaces, errors
│   │   ├── config/         # Configuration loader
│   │   ├── auth/           # API key authentication
│   │   ├── validation/     # Zod schemas
│   │   └── utils/          # Shared helpers (json-store, logger, etc.)
├── sdk/              # TypeScript SDK (wraps REST API)
└── cli/              # CLI tool (init, start, doctor, etc.)
```

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9

### Setup

```bash
# Clone and install
git clone <repo-url> media-vault
cd media-vault
npm install

# Set up environment
cp .env.example .env

# Start development server
npm run dev
```

The server starts on `http://localhost:3000` by default.

### Default Admin Credentials

The dashboard uses the following defaults from `.env`:

| Variable         | Default       |
| ---------------- | ------------- |
| `ADMIN_USERNAME` | `admin`       |
| `ADMIN_PASSWORD` | `admin123456` |

**Change these before deploying.** You can update the password from the dashboard Settings page after logging in — changes persist in the database and survive restarts.

## API Overview

All endpoints are prefixed with `/api/v1`.

### Projects

| Method | Path            | Description       |
| ------ | --------------- | ----------------- |
| POST   | `/projects`     | Create a project  |
| GET    | `/projects`     | List all projects |
| GET    | `/projects/:id` | Get project by ID |
| DELETE | `/projects/:id` | Delete a project  |

### API Keys

| Method | Path                       | Description                 |
| ------ | -------------------------- | --------------------------- |
| POST   | `/api-keys`                | Create an API key           |
| GET    | `/api-keys?projectId=`     | List API keys for a project |
| DELETE | `/api-keys/:id?projectId=` | Delete an API key           |

### Folders

| Method | Path                    | Description        |
| ------ | ----------------------- | ------------------ |
| POST   | `/folders`              | Create a folder    |
| GET    | `/folders?projectId=`   | List folders       |
| GET    | `/folders/:id`          | Get folder by ID   |
| GET    | `/folders/:id/children` | List child folders |
| DELETE | `/folders/:id`          | Delete a folder    |

### Files

| Method | Path                  | Description                        |
| ------ | --------------------- | ---------------------------------- |
| POST   | `/files/upload`       | Upload a file (multipart)          |
| GET    | `/files?projectId=`   | List files                         |
| GET    | `/files/:id`          | Get file metadata                  |
| GET    | `/files/:id/download` | Download a file                    |
| GET    | `/files/:id/stream`   | Stream media (range-request aware) |
| PATCH  | `/files/:id`          | Update file metadata               |
| DELETE | `/files/:id`          | Delete a file                      |

## Authentication

Authentication is enabled by default via API keys.

Include the API key in the `X-Api-Key` header:

```bash
curl -H "X-Api-Key: mv_your_key_here" http://localhost:3000/api/v1/projects
```

To disable authentication, set `MEDIAVAULT_AUTH_ENABLED=false` in your `.env`.

## SDK Usage

### Installation

```bash
npm install @media-vault/sdk
```

### Quick Start

```typescript
import { MediaVaultClient } from '@media-vault/sdk';

const client = new MediaVaultClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'mv_your_key_here',
});
```

### Projects

```typescript
// Create
const project = await client.createProject({ name: 'my-app', description: 'Optional' });

// List (paginated)
const { data, total, page, totalPages } = await client.listProjects({ page: 1, limit: 10 });

// Get by ID
const p = await client.getProject(project.id);

// Delete
await client.deleteProject(project.id);
```

### API Keys

```typescript
// Create (returns rawKey — save it, won't be shown again)
const key = await client.createApiKey({ projectId: project.id, label: 'production' });
console.log(key.rawKey); // mv_abc123...

// List
const keys = await client.listApiKeys(project.id);

// Revoke
await client.deleteApiKey(key.id, project.id);
```

### Folders

```typescript
// Create
const folder = await client.createFolder({ projectId: project.id, name: 'images' });

// Create nested
await client.createFolder({ projectId: project.id, parentId: folder.id, name: '2024' });

// List (paginated)
const folders = await client.listFolders(project.id, { page: 1, limit: 20 });

// Get by ID
const f = await client.getFolder(folder.id);

// List children
const children = await client.listFolderChildren(folder.id);

// Delete
await client.deleteFolder(folder.id);
```

### Files

```typescript
// Upload (Node.js Buffer or browser Blob)
const file = await client.uploadFile(project.id, buffer, 'photo.jpg');
const file = await client.uploadFile(project.id, buffer, 'photo.jpg', {
  folderId: folder.id,
  visibility: 'public',
});

// List (paginated, optional projectId/folderId filter)
const files = await client.listFiles({ projectId: project.id, page: 1, limit: 24 });

// Get metadata
const meta = await client.getFile(file.id);

// Update metadata
await client.updateFile(file.id, { folderId: otherFolder.id, visibility: 'public' });

// Delete
await client.deleteFile(file.id);

// Stream URL (for <video>, <audio>, <img> tags)
const streamUrl = client.getStreamUrl(file.id);

// Download URL
const downloadUrl = client.getDownloadUrl(file.id);
```

### Exported Types

```typescript
import type {
  Project,
  ApiKey,
  Folder,
  FileMetadata,
  PaginatedResult,
  FileVisibility,
} from '@media-vault/sdk';
```

### Environment Support

| Platform        | Status           |
| --------------- | ---------------- |
| Node.js (>= 18) | ✅ Supported     |
| Browser         | ✅ Supported     |
| React / Next.js | ✅ Works (axios) |
| Vue / Nuxt      | ✅ Works (axios) |
| React Native    | 🔜 Upcoming      |
| Deno            | 🔜 Upcoming      |
| Bun             | 🔜 Upcoming      |
| Python SDK      | 🔜 Upcoming      |
| PHP SDK         | 🔜 Upcoming      |

## Deployment

MediaVault is a single Node.js process backed by JSON files — no external databases or caches required. The monorepo is the deployable unit. After building, the server automatically serves the dashboard from its relative path — no need to move files around.

```bash
# 1. Clone and install
git clone <repo-url> media-vault && cd media-vault && npm install

# 2. Build everything (SDK → CLI → Dashboard → Server)
npm run build

# 3. Configure environment
cp packages/server/.env.example packages/server/.env
nano packages/server/.env

# 4. Start (dev)
npm run dev

# Or start in production
NODE_ENV=production node packages/server/dist/index.js
```

### Folder structure after build

```
media-vault/
├── packages/
│   ├── server/
│   │   ├── dist/          # Compiled backend
│   │   ├── data/          # JSON data files (projects, keys, sessions, etc.)
│   │   ├── uploads/       # File storage
│   │   └── .env           # Configuration
│   └── dashboard/
│       └── dist/          # Built frontend (served by server)
├── node_modules/
└── package.json
```

The server resolves `packages/dashboard/dist/` relative to its own location — deploy the entire repo and it just works.

### VPS / Dedicated Server

```bash
# 1. Clone and install
git clone <repo-url> media-vault && cd media-vault && npm install

# 2. Build all packages
npm run build

# 3. Configure .env — set ADMIN_USERNAME, ADMIN_PASSWORD, MEDIAVAULT_SIGNED_URL_SECRET
cp packages/server/.env.example packages/server/.env
nano packages/server/.env

# 4. Start with PM2 (recommended)
npm install -g pm2
NODE_ENV=production pm2 start packages/server/dist/index.js --name mediavault
pm2 save && pm2 startup
```

### Shared Hosting (cPanel / Plesk)

npm workspaces and hoisted `node_modules` don't work on most shared hosts. Use the flat deployment builder instead:

```bash
# 1. Clone, install, and build locally
git clone <repo-url> media-vault && cd media-vault && npm install

# 2. Build and create self-contained deployment package
npm run deploy
```

This creates a `media-vault-deploy/` directory with a flat, self-contained structure:

```
media-vault-deploy/
├── server.js            # Entry point (point cPanel here)
├── package.json         # Flat, production-only dependencies
├── node_modules/        # Self-contained (no workspaces)
├── dist/                # Compiled server
├── dashboard/
│   └── dist/            # Built frontend
└── .env.example         # Environment template
```

**Then on your shared host:**

1. Upload the entire `media-vault-deploy/` folder to your server
2. Copy `.env.example` to `.env` and configure credentials
3. In cPanel **Setup Node.js App**:
   - **Application root:** `/home/user/media-vault-deploy`
   - **Startup file:** `server.js`
   - **Node.js version:** >= 18
4. Ensure write permissions on `media-vault-deploy/data/` and `media-vault-deploy/uploads/`

- **JSON:** Requires write permission on `data/` — no database server needed
- **Uploads:** Set `MEDIAVAULT_STORAGE_LOCAL_PATH` to an absolute path outside web root

### Reverse Proxy (nginx)

```nginx
server {
    listen 80;
    server_name media.example.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Configuration

All settings are configurable via environment variables. See `.env.example` for all options.

| Variable                        | Default       | Description                         |
| ------------------------------- | ------------- | ----------------------------------- |
| `MEDIAVAULT_PORT`               | `3000`        | Server port                         |
| `MEDIAVAULT_HOST`               | `0.0.0.0`     | Server host                         |
| `MEDIAVAULT_DATA_DIR`           | `./data`      | JSON data directory                 |
| `MEDIAVAULT_STORAGE_DRIVER`     | `local`       | Storage driver (local only for now) |
| `MEDIAVAULT_STORAGE_LOCAL_PATH` | `./uploads`   | Local storage directory             |
| `MEDIAVAULT_MAX_FILE_SIZE`      | `104857600`   | Max upload size in bytes (100MB)    |
| `MEDIAVAULT_AUTH_ENABLED`       | `true`        | Enable/disable authentication       |
| `ADMIN_USERNAME`                | `admin`       | Dashboard admin username            |
| `ADMIN_PASSWORD`                | `admin123456` | Dashboard admin password            |
| `MEDIAVAULT_SIGNED_URL_SECRET`  | —             | Secret for signed URL generation    |

## Storage Drivers

Storage is abstracted behind the `StorageDriver` interface. The current implementation supports:

- **Local** — Files stored on the local filesystem

Future drivers: S3, MinIO, Cloudinary, Azure Blob, Google Cloud Storage.

## License

MIT
