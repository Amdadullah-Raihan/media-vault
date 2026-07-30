// ---------------------------------------------------------------------------
// MediaVault – Upload Validator
//
// Centralized validation used by every upload endpoint.
// Checks file existence, size, category enablement, extension allowlist,
// MIME type, and category/extension size limits.
// ---------------------------------------------------------------------------

import { UploadRuleService } from '../services/upload-rule.service';
import { EXTENSION_MIME_MAP, ERROR_CODES, DEFAULT_CATEGORIES } from '../core/upload-defaults';

export interface ValidationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type ValidationResult = { valid: true } | { valid: false; error: ValidationError };

export class UploadValidator {
  private readonly ruleService = new UploadRuleService();

  // ---------------------------------------------------------------------------
  // Validate a file before upload
  // ---------------------------------------------------------------------------

  async validate(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): Promise<ValidationResult> {
    // 1. File size > 0
    if (file.size <= 0) {
      return this.fail(ERROR_CODES.EMPTY_FILE, 'File is empty.');
    }

    // 2. Determine category + extension
    const ext = this.getExtension(file.originalname);
    const category = this.getCategory(ext);

    if (!category) {
      return this.fail(
        ERROR_CODES.FILE_TYPE_NOT_ALLOWED,
        `File extension ".${ext}" is not recognized.`,
      );
    }

    // 4. Category enabled
    const rule = await this.ruleService.getEffectiveMaxSize(category, ext);
    if (!rule.enabled) {
      return this.fail(ERROR_CODES.CATEGORY_DISABLED, `The "${category}" category is disabled.`);
    }

    // 4. Extension allowed (check defaults — base list)
    const catDefaults = DEFAULT_CATEGORIES.find((c) => c.category === category);
    if (!catDefaults?.extensions.includes(ext)) {
      return this.fail(ERROR_CODES.FILE_TYPE_NOT_ALLOWED, `".${ext}" files are not allowed.`);
    }

    // 6. MIME type valid
    const allowedMimes = EXTENSION_MIME_MAP[ext];
    if (!allowedMimes) {
      return this.fail(ERROR_CODES.INVALID_MIME, `No MIME type mapping for ".${ext}".`);
    }

    if (!allowedMimes.includes(file.mimetype)) {
      return this.fail(
        ERROR_CODES.INVALID_MIME,
        `Invalid MIME type "${file.mimetype}" for ".${ext}". Expected: ${allowedMimes.join(', ')}.`,
      );
    }

    // 7. Category max size
    // 8. Extension max size override (handled by getEffectiveMaxSize)
    if (file.size > rule.maxSize) {
      const maxMB = (rule.maxSize / (1024 * 1024)).toFixed(1);
      const receivedMB = (file.size / (1024 * 1024)).toFixed(1);
      return this.fail(
        ERROR_CODES.FILE_TOO_LARGE,
        `File size (${receivedMB} MB) exceeds the maximum allowed (${maxMB} MB) for ".${ext}".`,
        {
          extension: ext,
          maxSizeBytes: rule.maxSize,
          receivedSizeBytes: file.size,
        },
      );
    }

    return { valid: true };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private getExtension(filename: string): string {
    const idx = filename.lastIndexOf('.');
    if (idx === -1) return '';
    return filename.slice(idx + 1).toLowerCase();
  }

  private getCategory(ext: string): string | null {
    for (const cat of DEFAULT_CATEGORIES) {
      if (cat.extensions.includes(ext)) return cat.category;
    }
    return null;
  }

  private fail(code: string, message: string, details?: Record<string, unknown>): ValidationResult {
    return { valid: false, error: { code, message, details } };
  }
}
