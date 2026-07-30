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
│   │   ├── repositories/   # Data access (Prisma)
│   │   ├── storage/        # Storage driver interface + local driver
│   │   ├── core/           # Domain types, interfaces, errors
│   │   ├── config/         # Configuration loader
│   │   ├── auth/           # API key authentication
│   │   ├── validation/     # Zod schemas
│   │   └── utils/          # Shared helpers
│   └── prisma/             # Database schema & migrations
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

# Initialize database
npm run db:migrate --workspace=@media-vault/server

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

```typescript
import { MediaVaultClient } from '@media-vault/sdk';

const client = new MediaVaultClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'mv_your_key_here',
});

// Create a project
const project = await client.createProject({ name: 'my-app' });

// Upload a file
const file = await client.uploadFile(project.id, buffer, 'photo.jpg');

// Stream URL (for <video> / <audio> tags)
const streamUrl = client.getStreamUrl(file.id);
```

## Deployment

MediaVault is a single Node.js process backed by SQLite — no external databases or caches required.

### VPS / Dedicated Server

```bash
# 1. Clone and install
git clone <repo-url> media-vault && cd media-vault && npm install

# 2. Build the dashboard for production
npm run build --workspace=@media-vault/dashboard

# 3. Configure .env — set ADMIN_USERNAME, ADMIN_PASSWORD, MEDIAVAULT_SIGNED_URL_SECRET
cp packages/server/.env.example packages/server/.env
nano packages/server/.env

# 4. Run database migration
npm run db:migrate --workspace=@media-vault/server

# 5. Start with PM2 (recommended)
npm install -g pm2
NODE_ENV=production pm2 start packages/server/dist/index.js --name mediavault
pm2 save && pm2 startup
```

### Shared Hosting (cPanel / Plesk)

- **Node.js version:** >= 18 required
- **Application root:** Point to the repo root
- **Startup file:** `packages/server/dist/index.js` (build with `npm run build --workspace=@media-vault/server`)
- **SQLite:** Requires write permission on the `data/` directory — no database server needed
- **Uploads:** Set `MEDIAVAULT_STORAGE_LOCAL_PATH` to a path outside the web root
- **Dashboard:** Build it first (`npm run build --workspace=@media-vault/dashboard`), then the server serves it automatically in production

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

| Variable                        | Default                     | Description                         |
| ------------------------------- | --------------------------- | ----------------------------------- |
| `MEDIAVAULT_PORT`               | `3000`                      | Server port                         |
| `MEDIAVAULT_HOST`               | `0.0.0.0`                   | Server host                         |
| `DATABASE_URL`                  | `file:./data/mediavault.db` | SQLite database path                |
| `MEDIAVAULT_STORAGE_DRIVER`     | `local`                     | Storage driver (local only for now) |
| `MEDIAVAULT_STORAGE_LOCAL_PATH` | `./uploads`                 | Local storage directory             |
| `MEDIAVAULT_MAX_FILE_SIZE`      | `104857600`                 | Max upload size in bytes (100MB)    |
| `MEDIAVAULT_AUTH_ENABLED`       | `true`                      | Enable/disable authentication       |
| `ADMIN_USERNAME`                | `admin`                     | Dashboard admin username            |
| `ADMIN_PASSWORD`                | `admin123456`               | Dashboard admin password            |
| `MEDIAVAULT_SIGNED_URL_SECRET`  | —                           | Secret for signed URL generation    |

## Storage Drivers

Storage is abstracted behind the `StorageDriver` interface. The current implementation supports:

- **Local** — Files stored on the local filesystem

Future drivers: S3, MinIO, Cloudinary, Azure Blob, Google Cloud Storage.

## License

MIT
