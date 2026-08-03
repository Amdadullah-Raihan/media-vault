# @media-vault/sdk

Official TypeScript SDK for [MediaVault](https://github.com/your-org/media-vault) — a self-hosted media management server. This SDK wraps every REST API endpoint so you never need to build HTTP requests manually.

## Before You Start (Required)

This SDK connects to your own MediaVault server. Before using it, you must:

1. Go to the official repository: https://github.com/Amdadullah-Raihan/media-vault
2. Download/clone the project
3. Host and run it yourself (for example on shared hosting, a VPS, or your own server)

After your server is running, use the SDK in your project to use media-vault to manage your media`.

## Features

- 🚀 **Full API coverage** — Projects, API Keys, Folders, Files (upload, download, stream)
- 🔒 **Type-safe** — Written in TypeScript with complete type definitions
- 🌐 **Universal** — Works in Node.js and modern browsers
- 📦 **Lightweight** — Only one dependency: [axios](https://axios-http.com/)
- 📚 **Paginated responses** — Built-in pagination support for list endpoints

## Installation

```bash
npm install @media-vault/sdk
```

```bash
yarn add @media-vault/sdk
```

```bash
pnpm add @media-vault/sdk
```

## Quick Start

```typescript
import { MediaVaultClient } from '@media-vault/sdk';

const client = new MediaVaultClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'mv_your_api_key_here',
});

// Create a project
const project = await client.createProject({
  name: 'my-app',
  description: 'My first MediaVault project',
});

console.log(`Project created: ${project.id}`);

// Upload a file
const file = await client.uploadFile(
  project.id,
  fileBuffer, // Buffer (Node.js) or Blob (browser)
  'photo.jpg',
  { visibility: 'public' },
);

// Get the download URL
const downloadUrl = client.getDownloadUrl(file.id);

// Stream the file (for <video>, <audio>, etc.)
const streamUrl = client.getStreamUrl(file.id);
```

## API Reference

### Constructor

```typescript
new MediaVaultClient(options: MediaVaultClientOptions)
```

| Option    | Type     | Description                                                       |
| --------- | -------- | ----------------------------------------------------------------- |
| `baseUrl` | `string` | Base URL of your MediaVault server (e.g. `http://localhost:3000`) |
| `apiKey`  | `string` | API key for authentication (prefixed with `mv_`)                  |

### Projects

```typescript
// Create a new project
client.createProject(input: { name: string; description?: string | null }): Promise<Project>

// List all projects (paginated)
client.listProjects(params?: { page?: number; limit?: number }): Promise<PaginatedResult<Project>>

// Get a single project by ID
client.getProject(id: string): Promise<Project>

// Delete a project
client.deleteProject(id: string): Promise<void>
```

### API Keys

```typescript
// Create a new API key (rawKey returned only once)
client.createApiKey(input: { projectId: string; label?: string }): Promise<ApiKey>

// List all API keys for a project
client.listApiKeys(projectId: string): Promise<ApiKey[]>

// Delete an API key
client.deleteApiKey(id: string, projectId: string): Promise<void>
```

### Folders

```typescript
// Create a folder
client.createFolder(input: {
  projectId: string;
  parentId?: string | null;
  name: string;
}): Promise<Folder>

// List folders in a project (paginated)
client.listFolders(projectId: string, params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<Folder>>

// Get a single folder
client.getFolder(id: string): Promise<Folder>

// List child folders
client.listFolderChildren(id: string): Promise<Folder[]>

// Delete a folder
client.deleteFolder(id: string): Promise<void>
```

### Files

```typescript
// Upload a file
client.uploadFile(
  projectId: string,
  file: Blob | Buffer,
  filename: string,
  options?: {
    folderId?: string | null;
    visibility?: FileVisibility;
  }
): Promise<FileMetadata>

// List files (paginated, filterable by project/folder)
client.listFiles(params: {
  projectId?: string;
  folderId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<FileMetadata>>

// Get file metadata
client.getFile(id: string): Promise<FileMetadata>

// Update file (move to folder, change visibility)
client.updateFile(id: string, data: {
  folderId?: string | null;
  visibility?: FileVisibility;
}): Promise<FileMetadata>

// Delete a file
client.deleteFile(id: string): Promise<void>

// Get download URL (open in browser or pipe)
client.getDownloadUrl(id: string): string

// Get stream URL (for <video>, <audio>, etc.)
client.getStreamUrl(id: string): string
```

## Types

```typescript
enum FileVisibility {
  Private = 'private',
  Public = 'public',
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiKey {
  id: string;
  projectId: string;
  key: string;
  rawKey?: string; // Only returned on creation
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface Folder {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

interface FileMetadata {
  id: string;
  projectId: string;
  folderId: string | null;
  filename: string;
  originalFilename: string;
  extension: string;
  mimeType: string;
  size: number;
  hash: string;
  visibility: FileVisibility;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Error Handling

All API methods throw on failure. Wrap calls in `try/catch` to handle errors:

```typescript
import { MediaVaultClient } from '@media-vault/sdk';
import type { ApiError } from '@media-vault/sdk';
import axios from 'axios';

try {
  const project = await client.getProject('non-existent-id');
} catch (error) {
  if (axios.isAxiosError(error) && error.response) {
    const apiError = error.response.data as ApiError;
    console.error(`[${apiError.error.code}] ${apiError.error.message}`);
  }
}
```

## Usage in Node.js

```typescript
import { MediaVaultClient } from '@media-vault/sdk';
import { readFileSync } from 'fs';

const client = new MediaVaultClient({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.MEDIAVAULT_API_KEY!,
});

const buffer = readFileSync('./photo.jpg');
const file = await client.uploadFile(projectId, buffer, 'photo.jpg');
```

## Usage in Browsers

```typescript
import { MediaVaultClient } from '@media-vault/sdk';

const client = new MediaVaultClient({
  baseUrl: 'https://media-vault.example.com',
  apiKey: 'mv_your_api_key',
});

const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
const blob = input.files![0]!;

const file = await client.uploadFile(projectId, blob, blob.name);
```

## Requirements

- Node.js >= 18
- TypeScript >= 5.4 (for type definitions)

## License

MIT
