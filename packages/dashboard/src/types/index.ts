// ---------------------------------------------------------------------------
// MediaVault Dashboard – Core Types
// ---------------------------------------------------------------------------

export enum FileVisibility {
  Private = 'private',
  Public = 'public',
}

export enum MimeCategory {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Document = 'document',
  Archive = 'archive',
  Other = 'other',
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthSession {
  id: string;
  username: string;
  createdAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string | null;
}

export interface UpdateProjectRequest {
  name?: string;
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
  createdAt: string;
  lastUsedAt: string | null;
}

export interface CreateApiKeyRequest {
  projectId: string;
  label?: string;
}

export interface CreateApiKeyResponse {
  id: string;
  projectId: string;
  label: string;
  rawKey: string;
  createdAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderRequest {
  projectId: string;
  parentId?: string | null;
  name: string;
}

// ---------------------------------------------------------------------------
// File
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
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFileMetadataRequest {
  folderId?: string | null;
  visibility?: FileVisibility;
}

// ---------------------------------------------------------------------------
// Signed URL
// ---------------------------------------------------------------------------

export interface SignedUrl {
  url: string;
  fileId: string;
  expiresAt: string;
}

export interface CreateSignedUrlRequest {
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
// API Response
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalFiles: number;
  totalProjects: number;
  totalStorageBytes: number;
  recentUploads: FileMetadata[];
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export interface AppSettings {
  adminUsername: string;
  storage: {
    maxFileSizeBytes: number;
    allowedMimeTypes: string[];
  };
}

export interface UpdateSettingsRequest {
  maxFileSizeBytes?: number;
  allowedMimeTypes?: string[];
}
