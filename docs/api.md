# MediaVault API Reference

Base URL: `http://localhost:3000/api/v1`

## Authentication

Include the API key in the `X-Api-Key` header:

```
X-Api-Key: mv_your_key_here
```

---

## Projects

### Create Project

```
POST /projects
```

**Body:**

```json
{
  "name": "my-app",
  "description": "Optional description"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "my-app",
    "description": "Optional description",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### List Projects

```
GET /projects?page=1&limit=20
```

### Get Project

```
GET /projects/:id
```

### Delete Project

```
DELETE /projects/:id
```

---

## API Keys

### Create API Key

```
POST /api-keys
```

**Body:**

```json
{
  "projectId": "uuid",
  "label": "my-key"
}
```

**Response:** `201 Created` — The `rawKey` field contains the key. It is only returned once.

### List API Keys

```
GET /api-keys?projectId=uuid
```

### Delete API Key

```
DELETE /api-keys/:id?projectId=uuid
```

---

## Folders

### Create Folder

```
POST /folders
```

**Body:**

```json
{
  "projectId": "uuid",
  "parentId": "uuid or null",
  "name": "images"
}
```

### List Folders

```
GET /folders?projectId=uuid
```

### Get Folder

```
GET /folders/:id
```

### List Child Folders

```
GET /folders/:id/children
```

### Delete Folder

```
DELETE /folders/:id
```

---

## Files

### Upload File

```
POST /files/upload
Content-Type: multipart/form-data
```

**Fields:**

- `file` — The file (required)
- `projectId` — Project ID (required)
- `folderId` — Optional folder ID
- `visibility` — `private` or `public` (default: `private`)

**Response:** `201 Created`

### List Files

```
GET /files?projectId=uuid&folderId=uuid&page=1&limit=20
```

### Get File Metadata

```
GET /files/:id
```

### Download File

```
GET /files/:id/download
```

Returns the file with `Content-Disposition: attachment`.

- **Public files**: accessible without authentication
- **Private files**: require a valid session cookie or `X-Api-Key` header

### Stream File

```
GET /files/:id/stream
```

Returns the file with `Content-Disposition: inline`. Supports `Range` headers for media streaming.

- **Public files**: accessible without authentication (use directly in `<img>`, `<video>`, `<audio>` tags)
- **Private files**: require a valid session cookie or `X-Api-Key` header

### Update File Metadata

```
PATCH /files/:id
```

**Body:**

```json
{
  "folderId": "uuid or null",
  "visibility": "public"
}
```

### Delete File

```
DELETE /files/:id
```

---

## File Visibility

Every file has a `visibility` property: `private` (default) or `public`.

### Public Files

Public files can be accessed **without authentication**. Use them for images, videos, and audio you want to embed directly in web pages, markdown, or share via link.

**Set a file to public:**

```json
PATCH /files/:id
{ "visibility": "public" }
```

**Using a public image:**

```html
<!-- Direct embed — no auth needed -->
<img src="https://media-vault.amdad.me/api/v1/files/{file-id}/stream" />
```

```markdown
<!-- In markdown / README -->

![My Image](https://media-vault.amdad.me/api/v1/files/{file-id}/stream)
```

### Private Files

Private files require authentication. Use the `X-Api-Key` header (applications) or a valid session cookie (dashboard).

**Using a private image programmatically:**

```typescript
// With the MediaVault SDK
const client = new MediaVaultClient({
  baseUrl: 'https://media-vault.amdad.me',
  apiKey: 'mv_your_api_key',
});

// Get the stream URL (requires API key in requests)
const url = client.getStreamUrl('file-id');

// Use a signed URL for temporary public access (1 hour)
const { url: signedUrl } = await client.getSignedUrl('file-id', { expiresInSeconds: 3600 });
```

```html
<!-- Direct HTTP — must include API key header -->
<!-- Cannot be used in plain <img> tags without a signed URL -->
```

**Set a file back to private:**

```json
PATCH /files/:id
{ "visibility": "private" }
```

### Quick Reference

| Visibility | Auth Required |   Use in `<img>`    | Use with SDK |
| ---------- | :-----------: | :-----------------: | :----------: |
| `public`   |      No       |         ✅          |      ✅      |
| `private`  |      Yes      | ❌ (use signed URL) |      ✅      |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": []
  }
}
```

### Error Codes

| Code                     | HTTP Status | Description                |
| ------------------------ | ----------- | -------------------------- |
| `NOT_FOUND`              | 404         | Resource not found         |
| `VALIDATION_ERROR`       | 400         | Invalid request data       |
| `UNAUTHORIZED`           | 401         | Missing or invalid API key |
| `FORBIDDEN`              | 403         | Insufficient permissions   |
| `CONFLICT`               | 409         | Resource already exists    |
| `PAYLOAD_TOO_LARGE`      | 413         | File exceeds max size      |
| `UNSUPPORTED_MEDIA_TYPE` | 415         | MIME type not allowed      |
| `INTERNAL_ERROR`         | 500         | Unexpected server error    |
| `STORAGE_ERROR`          | 500         | Storage operation failed   |
| `NOT_SUPPORTED`          | 501         | Feature not available      |
