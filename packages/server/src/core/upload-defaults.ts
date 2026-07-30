// ---------------------------------------------------------------------------
// MediaVault – Default Upload Rules
//
// Built-in categories with default extensions and size limits.
// Seeded on first run if no rules exist in the database.
// ---------------------------------------------------------------------------

export interface CategoryDefaults {
  category: string;
  label: string;
  enabled: boolean;
  maxSize: number; // bytes
  extensions: string[];
}

// Max size presets (bytes)
const MB = 1024 * 1024;

export const DEFAULT_CATEGORIES: CategoryDefaults[] = [
  {
    category: 'images',
    label: 'Images',
    enabled: true,
    maxSize: 20 * MB,
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'ico', 'tif', 'tiff'],
  },
  {
    category: 'videos',
    label: 'Videos',
    enabled: true,
    maxSize: 500 * MB,
    extensions: ['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v', 'flv', 'wmv'],
  },
  {
    category: 'audio',
    label: 'Audio',
    enabled: true,
    maxSize: 50 * MB,
    extensions: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
  },
  {
    category: 'documents',
    label: 'Documents',
    enabled: true,
    maxSize: 50 * MB,
    extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  },
  {
    category: 'archives',
    label: 'Archives',
    enabled: true,
    maxSize: 200 * MB,
    extensions: ['zip', 'rar', '7z', 'tar', 'gz'],
  },
  {
    category: 'text',
    label: 'Text',
    enabled: true,
    maxSize: 10 * MB,
    extensions: ['txt', 'md', 'csv'],
  },
  {
    category: 'code',
    label: 'Code',
    enabled: true,
    maxSize: 10 * MB,
    extensions: ['js', 'ts', 'jsx', 'tsx', 'json', 'xml', 'yaml', 'yml', 'html', 'css'],
  },
  {
    category: 'fonts',
    label: 'Fonts',
    enabled: true,
    maxSize: 5 * MB,
    extensions: ['ttf', 'otf', 'woff', 'woff2'],
  },
  {
    category: 'other',
    label: 'Other',
    enabled: false,
    maxSize: 10 * MB,
    extensions: [],
  },
];

/** Map extension → MIME types (primary first). */
export const EXTENSION_MIME_MAP: Record<string, string[]> = {
  // Images
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  gif: ['image/gif'],
  webp: ['image/webp'],
  avif: ['image/avif'],
  svg: ['image/svg+xml'],
  bmp: ['image/bmp'],
  ico: ['image/x-icon', 'image/vnd.microsoft.icon'],
  tif: ['image/tiff'],
  tiff: ['image/tiff'],
  // Videos
  mp4: ['video/mp4'],
  mov: ['video/quicktime'],
  mkv: ['video/x-matroska'],
  webm: ['video/webm'],
  avi: ['video/x-msvideo'],
  m4v: ['video/x-m4v'],
  flv: ['video/x-flv'],
  wmv: ['video/x-ms-wmv'],
  // Audio
  mp3: ['audio/mpeg'],
  wav: ['audio/wav'],
  ogg: ['audio/ogg'],
  flac: ['audio/flac'],
  aac: ['audio/aac'],
  m4a: ['audio/x-m4a'],
  // Documents
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xls: ['application/vnd.ms-excel'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ppt: ['application/vnd.ms-powerpoint'],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  // Archives
  zip: ['application/zip'],
  rar: ['application/vnd.rar', 'application/x-rar-compressed'],
  '7z': ['application/x-7z-compressed'],
  tar: ['application/x-tar'],
  gz: ['application/gzip'],
  // Text
  txt: ['text/plain'],
  md: ['text/markdown'],
  csv: ['text/csv'],
  // Code
  js: ['text/javascript', 'application/javascript'],
  ts: ['text/typescript', 'application/typescript'],
  jsx: ['text/jsx'],
  tsx: ['text/tsx'],
  json: ['application/json'],
  xml: ['application/xml', 'text/xml'],
  yaml: ['text/yaml', 'application/x-yaml'],
  yml: ['text/yaml', 'application/x-yaml'],
  html: ['text/html'],
  css: ['text/css'],
  // Fonts
  ttf: ['font/ttf'],
  otf: ['font/otf'],
  woff: ['font/woff'],
  woff2: ['font/woff2'],
};

export const ERROR_CODES = {
  INVALID_FILE: 'INVALID_FILE',
  EMPTY_FILE: 'EMPTY_FILE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  CATEGORY_DISABLED: 'CATEGORY_DISABLED',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  INVALID_MIME: 'INVALID_MIME',
  EXTENSION_MISMATCH: 'EXTENSION_MISMATCH',
  UPLOAD_BLOCKED: 'UPLOAD_BLOCKED',
} as const;
