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
// User Status
// ---------------------------------------------------------------------------

export enum UserStatus {
  Pending = 'pending',
  Active = 'active',
  Locked = 'locked',
  Suspended = 'suspended',
  Disabled = 'disabled',
  Archived = 'archived',
  Deleted = 'deleted',
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  avatar: string | null;
  firstName: string;
  lastName: string;
  displayName: string;
  username: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  status: UserStatus;
  roleId: string;
  assignedProjectIds: string[];
  preferredLanguage: string;
  timezone: string;
  loginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  lastActiveAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
  assignedProjectIds?: string[];
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
  assignedProjectIds?: string[];
  status?: UserStatus;
}

/** Public user profile — never exposes passwordHash, passwordSalt, or loginAttempts. */
export interface UserProfile {
  id: string;
  avatar: string | null;
  firstName: string;
  lastName: string;
  displayName: string;
  username: string;
  email: string;
  status: UserStatus;
  roleId: string;
  assignedProjectIds: string[];
  preferredLanguage: string;
  timezone: string;
  lastLoginAt: Date | null;
  lastActiveAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Role
// ---------------------------------------------------------------------------

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleInput {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
}

// ---------------------------------------------------------------------------
// Audit Log
// ---------------------------------------------------------------------------

export interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  previousValue: unknown;
  newValue: unknown;
  ip: string;
  userAgent: string;
  success: boolean;
  timestamp: Date;
}

export interface CreateAuditEntryInput {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
  ip: string;
  userAgent: string;
  success?: boolean;
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
