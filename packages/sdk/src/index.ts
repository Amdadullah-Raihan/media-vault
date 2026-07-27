// ---------------------------------------------------------------------------
// MediaVault – TypeScript SDK
//
// Wraps every API endpoint. Developers should never build HTTP requests manually.
// ---------------------------------------------------------------------------

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// ---------------------------------------------------------------------------
// Types (mirrors server core types)
// ---------------------------------------------------------------------------

export enum FileVisibility {
  Private = 'private',
  Public = 'public',
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  projectId: string;
  key: string;
  rawKey?: string;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface Folder {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface MediaVaultClientOptions {
  baseUrl: string;
  apiKey: string;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class MediaVaultClient {
  private readonly http: AxiosInstance;

  public constructor(options: MediaVaultClientOptions) {
    this.http = axios.create({
      baseURL: options.baseUrl.replace(/\/$/, '') + '/api/v1',
      headers: {
        'x-api-key': options.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  // -----------------------------------------------------------------------
  // Projects
  // -----------------------------------------------------------------------

  public async createProject(input: {
    name: string;
    description?: string | null;
  }): Promise<Project> {
    const res = await this.http.post<ApiResponse<Project>>('/projects', input);
    return res.data.data;
  }

  public async listProjects(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<Project>> {
    const res = await this.http.get<ApiResponse<PaginatedResult<Project>>>('/projects', { params });
    return res.data.data;
  }

  public async getProject(id: string): Promise<Project> {
    const res = await this.http.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data.data;
  }

  public async deleteProject(id: string): Promise<void> {
    await this.http.delete(`/projects/${id}`);
  }

  // -----------------------------------------------------------------------
  // API Keys
  // -----------------------------------------------------------------------

  public async createApiKey(input: { projectId: string; label?: string }): Promise<ApiKey> {
    const res = await this.http.post<ApiResponse<ApiKey>>('/api-keys', input);
    return res.data.data;
  }

  public async listApiKeys(projectId: string): Promise<ApiKey[]> {
    const res = await this.http.get<ApiResponse<ApiKey[]>>('/api-keys', { params: { projectId } });
    return res.data.data;
  }

  public async deleteApiKey(id: string, projectId: string): Promise<void> {
    await this.http.delete(`/api-keys/${id}`, { params: { projectId } });
  }

  // -----------------------------------------------------------------------
  // Folders
  // -----------------------------------------------------------------------

  public async createFolder(input: {
    projectId: string;
    parentId?: string | null;
    name: string;
  }): Promise<Folder> {
    const res = await this.http.post<ApiResponse<Folder>>('/folders', input);
    return res.data.data;
  }

  public async listFolders(
    projectId: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResult<Folder>> {
    const res = await this.http.get<ApiResponse<PaginatedResult<Folder>>>('/folders', {
      params: { projectId, ...params },
    });
    return res.data.data;
  }

  public async getFolder(id: string): Promise<Folder> {
    const res = await this.http.get<ApiResponse<Folder>>(`/folders/${id}`);
    return res.data.data;
  }

  public async listFolderChildren(id: string): Promise<Folder[]> {
    const res = await this.http.get<ApiResponse<Folder[]>>(`/folders/${id}/children`);
    return res.data.data;
  }

  public async deleteFolder(id: string): Promise<void> {
    await this.http.delete(`/folders/${id}`);
  }

  // -----------------------------------------------------------------------
  // Files
  // -----------------------------------------------------------------------

  public async uploadFile(
    projectId: string,
    file: Blob | Buffer,
    filename: string,
    options?: { folderId?: string | null; visibility?: FileVisibility },
  ): Promise<FileMetadata> {
    const formData = new FormData();
    formData.append('file', new Blob([file]), filename);
    formData.append('projectId', projectId);
    if (options?.folderId) formData.append('folderId', options.folderId);
    if (options?.visibility) formData.append('visibility', options.visibility);

    const res = await this.http.post<ApiResponse<FileMetadata>>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  }

  public async listFiles(params: {
    projectId?: string;
    folderId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<FileMetadata>> {
    const res = await this.http.get<ApiResponse<PaginatedResult<FileMetadata>>>('/files', {
      params,
    });
    return res.data.data;
  }

  public async getFile(id: string): Promise<FileMetadata> {
    const res = await this.http.get<ApiResponse<FileMetadata>>(`/files/${id}`);
    return res.data.data;
  }

  public async updateFile(
    id: string,
    data: { folderId?: string | null; visibility?: FileVisibility },
  ): Promise<FileMetadata> {
    const res = await this.http.patch<ApiResponse<FileMetadata>>(`/files/${id}`, data);
    return res.data.data;
  }

  public async deleteFile(id: string): Promise<void> {
    await this.http.delete(`/files/${id}`);
  }

  /**
   * Returns the download URL. The caller can open this in a browser or pipe it.
   */
  public getDownloadUrl(id: string): string {
    return `${this.http.defaults.baseURL}/files/${id}/download`;
  }

  /**
   * Returns the stream URL (for <video>, <audio>, etc.).
   */
  public getStreamUrl(id: string): string {
    return `${this.http.defaults.baseURL}/files/${id}/stream`;
  }
}
