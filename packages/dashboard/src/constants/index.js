// ---------------------------------------------------------------------------
// MediaVault Dashboard – Constants
// ---------------------------------------------------------------------------
export const APP_NAME = 'MediaVault';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
export const ROUTES = {
    LOGIN: '/login',
    DASHBOARD: '/',
    PROJECTS: '/projects',
    PROJECT_DETAIL: '/projects/:id',
    PROJECT_CREATE: '/projects/new',
    FILES: '/files',
    FILE_DETAIL: '/files/:id',
    UPLOAD: '/upload',
    FOLDERS: '/folders',
    API_KEYS: '/api-keys',
    SETTINGS: '/settings',
    LOGS: '/logs',
};
export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
export const DEFAULT_PAGE_SIZE = 20;
export const DEBOUNCE_MS = 300;
export const MAX_UPLOAD_SIZE = 100 * 1024 * 1024; // 100MB
export const STORAGE_BAR_COLORS = {
    used: 'hsl(var(--primary))',
    available: 'hsl(var(--muted))',
};
export const MIME_CATEGORY_MAP = {
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    document: 'Document',
    archive: 'Archive',
    other: 'Other',
};
export const MIME_ICON_MAP = {
    image: 'Image',
    video: 'Video',
    audio: 'Music',
    document: 'FileText',
    archive: 'Archive',
    other: 'File',
};
//# sourceMappingURL=index.js.map