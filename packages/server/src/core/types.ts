// ---------------------------------------------------------------------------
// MediaVault – Core Domain Types
// ---------------------------------------------------------------------------

/** Visibility of a file: private (API key required) or public (accessible without auth). */
export enum FileVisibility {
  Private = 'private',
  Public = 'public',
}

/** Supported MIME categories the server explicitly handles. */
export enum MimeCategory {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Document = 'document',
  Archive = 'archive',
  Other = 'other',
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string | null;
}

// ---------------------------------------------------------------------------
// API Key
// ---------------------------------------------------------------------------

export interface ApiKey {
  id: string;
  projectId: string;
  key: string;
  label: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

export interface CreateApiKeyInput {
  projectId: string;
  label?: string;
}

// ---------------------------------------------------------------------------
// Folder
// ---------------------------------------------------------------------------

export interface Folder {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFolderInput {
  projectId: string;
  parentId?: string | null;
  name: string;
}

// ---------------------------------------------------------------------------
// File Metadata
// ---------------------------------------------------------------------------

export interface FileMetadata {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFileMetadataInput {
  projectId: string;
  folderId?: string | null;
  filename: string;
  originalFilename: string;
  extension: string;
  mimeType: string;
  size: number;
  hash: string;
  visibility?: FileVisibility;
}

// ---------------------------------------------------------------------------
// Signed URL
// ---------------------------------------------------------------------------

export interface SignedUrl {
  url: string;
  fileId: string;
  expiresAt: Date;
}

export interface CreateSignedUrlInput {
  fileId: string;
  expiresInSeconds: number;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

/**
 * A file ready to be stored. The storage driver receives this from the upload
 * pipeline and decides how to persist bytes.
 */
export interface StorableFile {
  /** Unique filename on disk (UUID-based, not the original name). */
  filename: string;
  /** Original filename as provided by the client. */
  originalFilename: string;
  /** MIME type detected during upload. */
  mimeType: string;
  /** File size in bytes. */
  size: number;
  /** Readable stream of the file contents. */
  stream: NodeJS.ReadableStream;
}

/**
 * Result returned after a successful store operation.
 */
export interface StorageResult {
  filename: string;
  size: number;
  hash: string;
  mimeType: string;
}
