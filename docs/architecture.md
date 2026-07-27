# MediaVault Architecture

## Layers

```
HTTP Request
    │
    ▼
┌─────────────────────────────────────────────┐
│  Presentation Layer (Express routes,        │
│  middleware, error handler)                 │
│  - Validates input with Zod                 │
│  - Authenticates via API key                │
│  - Maps errors to consistent JSON responses │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Controllers                                │
│  - Extract data from Request                │
│  - Call services                            │
│  - Send Response (via helpers)              │
│  - NEVER contain business logic             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Services (Business Logic)                  │
│  - Orchestrate operations                   │
│  - Coordinate repositories & storage        │
│  - Throw domain errors                      │
│  - NEVER access Request/Response            │
└──────┬────────────────────┬─────────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐   ┌──────────────────┐
│  Repositories│   │  Storage Drivers │
│  (Prisma)    │   │  (Interface)     │
│              │   │       │          │
│  - CRUD      │   │  Local │  S3 ... │
│  - Queries   │   │       │          │
└──────┬───────┘   └───┬───┴──────────┘
       │               │
       ▼               ▼
┌──────────────┐   ┌──────────────┐
│  SQLite DB   │   │  Filesystem  │
└──────────────┘   └──────────────┘
```

## Key Design Decisions

### 1. Clean Architecture

Every layer has a single responsibility. No layer reaches across boundaries.

### 2. Storage Driver Interface

Business logic never couples to a specific storage implementation. Switching from local to S3 requires only a new driver class.

### 3. Project Isolation

Projects are the top-level isolation boundary. API keys belong to projects. Files belong to projects. No cross-project access.

### 4. Metadata Separate from Files

File metadata lives in SQLite. Files live on the filesystem. This separation allows metadata queries without touching the filesystem.

### 5. Consistent Error Responses

Every error uses the `AppError` hierarchy. The error handler middleware maps errors to:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "File with id \"xyz\" was not found"
  }
}
```

### 6. Zod Validation

Every request body, query param, and route param is validated with Zod schemas before reaching controllers.

## Data Model

```
Project 1──* ApiKey
Project 1──* Folder
Project 1──* FileMetadata
Folder  1──* Folder (self-referencing, parentId)
Folder  1──* FileMetadata
```

## Future Roadmap

- S3 / MinIO / Cloudinary storage drivers
- Signed URLs (local driver)
- JWT authentication
- Admin Dashboard (separate frontend)
- File transformation (thumbnails, resizing)
- Webhook support
- Rate limiting
- Bulk operations
