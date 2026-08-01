// ---------------------------------------------------------------------------
// MediaVault – Routes
// ---------------------------------------------------------------------------

import { Router } from 'express';
import multer from 'multer';
import { getConfig } from '../config';
import {
  ProjectController,
  ApiKeyController,
  FolderController,
  FileController,
  AuthController,
  SettingsController,
  UploadRulesController,
} from '../controllers';
import { SettingsRepository, SessionRepository } from '../repositories';
import { AuthService } from '../services';
import { authenticate, requireProject } from '../auth';
import { validate } from '../validation';
import {
  createProjectSchema,
  createApiKeySchema,
  createFolderSchema,
  updateFileMetadataSchema,
  paginationSchema,
  uuidParamSchema,
} from '../validation';

const router = Router();

const projectController = new ProjectController();
const apiKeyController = new ApiKeyController();
const folderController = new FolderController();
const fileController = new FileController();
const settingsController = new SettingsController();
const uploadRulesController = new UploadRulesController();

const config = getConfig();

// Auth setup
const settingsRepo = new SettingsRepository();
const sessionRepo = new SessionRepository();
const authService = new AuthService(
  settingsRepo,
  sessionRepo,
  config.auth.adminUsername,
  config.auth.adminPassword,
);
const authController = new AuthController(authService);

// Multer: in-memory storage (streamed to the storage driver)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.storage.maxFileSizeBytes },
});

// =========================================================================
// Auth (dashboard login — no API key required)
// =========================================================================

router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/session', authController.session);
router.post('/auth/change-password', authController.changePassword);

// Settings (dashboard configuration)
/* eslint-disable @typescript-eslint/no-unsafe-argument */
router.get('/settings', (req, res, next) => {
  settingsController.get(req, res).catch((err: unknown) => {
    next(err);
  });
});
/* eslint-enable @typescript-eslint/no-unsafe-argument */

// Upload Rules
router.get('/upload-rules', uploadRulesController.list);
router.patch(
  '/upload-rules/category/:category',
  authenticate,
  uploadRulesController.updateCategory,
);
router.patch(
  '/upload-rules/extension/:category/:extension',
  authenticate,
  uploadRulesController.updateExtension,
);

// =========================================================================
// Projects
// =========================================================================

router.post('/projects', authenticate, validate(createProjectSchema), projectController.create);

router.get('/projects', authenticate, validate(paginationSchema, 'query'), projectController.list);

router.get(
  '/projects/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  projectController.getById,
);

router.delete(
  '/projects/:id',
  authenticate,
  requireProject,
  validate(uuidParamSchema, 'params'),
  projectController.delete,
);

// =========================================================================
// API Keys
// =========================================================================

router.post('/api-keys', authenticate, validate(createApiKeySchema), apiKeyController.create);

router.get('/api-keys', authenticate, apiKeyController.list);

router.delete(
  '/api-keys/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  apiKeyController.delete,
);

// =========================================================================
// Folders
// =========================================================================

router.post('/folders', authenticate, validate(createFolderSchema), folderController.create);

router.get('/folders', authenticate, folderController.listByProject);

router.get(
  '/folders/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  folderController.getById,
);

router.get(
  '/folders/:id/children',
  authenticate,
  validate(uuidParamSchema, 'params'),
  folderController.children,
);

router.delete(
  '/folders/:id',
  authenticate,
  requireProject,
  validate(uuidParamSchema, 'params'),
  folderController.delete,
);

// =========================================================================
// Files
// =========================================================================

/* eslint-disable @typescript-eslint/no-unsafe-argument */
router.post('/files/upload', authenticate, upload.single('file'), fileController.upload);

router.get('/files', authenticate, fileController.list);

router.get('/files/:id', authenticate, validate(uuidParamSchema, 'params'), fileController.getById);

router.get(
  '/files/:id/download',
  authenticate,
  validate(uuidParamSchema, 'params'),
  fileController.download,
);

router.get(
  '/files/:id/stream',
  authenticate,
  validate(uuidParamSchema, 'params'),
  fileController.stream,
);

router.patch(
  '/files/:id',
  authenticate,
  requireProject,
  validate(uuidParamSchema, 'params'),
  validate(updateFileMetadataSchema),
  fileController.update,
);

router.delete(
  '/files/:id',
  authenticate,
  requireProject,
  validate(uuidParamSchema, 'params'),
  fileController.delete,
);

/* eslint-enable @typescript-eslint/no-unsafe-argument */

export { router as apiRouter };
