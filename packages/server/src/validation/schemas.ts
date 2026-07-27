// ---------------------------------------------------------------------------
// MediaVault – Zod Validation Schemas
//
// Every request body, query param, and route param is validated with Zod.
// Never trust client input.
// ---------------------------------------------------------------------------

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or less')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Project name may only contain letters, numbers, hyphens, and underscores',
    ),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .nullable()
    .optional(),
});

// ---------------------------------------------------------------------------
// API Key
// ---------------------------------------------------------------------------

export const createApiKeySchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  label: z.string().max(100).optional().default('default'),
});

// ---------------------------------------------------------------------------
// Folder
// ---------------------------------------------------------------------------

export const createFolderSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  parentId: z.string().uuid().nullable().optional(),
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name must be 255 characters or less')
    .regex(/^[a-zA-Z0-9_\-.\s]+$/, 'Folder name contains invalid characters'),
});

// ---------------------------------------------------------------------------
// File Metadata (update)
// ---------------------------------------------------------------------------

export const updateFileMetadataSchema = z.object({
  folderId: z.string().uuid().nullable().optional(),
  visibility: z.enum(['private', 'public']).optional(),
});

// ---------------------------------------------------------------------------
// Signed URL
// ---------------------------------------------------------------------------

export const createSignedUrlSchema = z.object({
  expiresInSeconds: z
    .number()
    .int()
    .min(1, 'Expiry must be at least 1 second')
    .max(604800, 'Expiry cannot exceed 7 days (604800 seconds)'),
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ---------------------------------------------------------------------------
// Shared params
// ---------------------------------------------------------------------------

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const projectIdParamSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});
