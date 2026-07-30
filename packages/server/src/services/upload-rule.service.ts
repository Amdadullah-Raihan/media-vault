// ---------------------------------------------------------------------------
// MediaVault – Upload Rule Service
//
// Manages upload rules: seed defaults, CRUD, and lookup for validation.
// ---------------------------------------------------------------------------

import { UploadRuleRepository, UploadRuleRow } from '../repositories/upload-rule.repository';
import { DEFAULT_CATEGORIES } from '../core/upload-defaults';
import { getLogger } from '../utils/logger';

export interface CategoryWithExtensions {
  category: string;
  label: string;
  enabled: boolean;
  maxSize: number;
  extensions: ExtensionRule[];
}

export interface ExtensionRule {
  extension: string;
  enabled: boolean;
  maxSize: number | null; // null = use category default
}

export interface UploadRuleResult {
  categories: CategoryWithExtensions[];
}

export class UploadRuleService {
  private readonly repo = new UploadRuleRepository();
  private readonly logger = getLogger().child({ service: 'UploadRuleService' });

  // ---------------------------------------------------------------------------
  // Seed defaults on first run
  // ---------------------------------------------------------------------------

  async seedIfEmpty(): Promise<void> {
    const count = await this.repo.count();
    if (count > 0) return;

    this.logger.info('Seeding default upload rules');

    const rows: {
      category: string;
      extension: string | null;
      enabled: boolean;
      maxSize: number;
    }[] = [];

    for (const cat of DEFAULT_CATEGORIES) {
      // Category-level rule
      rows.push({
        category: cat.category,
        extension: null,
        enabled: cat.enabled,
        maxSize: cat.maxSize,
      });
    }

    await this.repo.createMany(rows);
    this.logger.info({ count: rows.length }, 'Default upload rules seeded');
  }

  // ---------------------------------------------------------------------------
  // Get all rules with defaults merged
  // ---------------------------------------------------------------------------

  async getAll(): Promise<UploadRuleResult> {
    const rows = await this.repo.findAll();

    const catMap = new Map<string, CategoryWithExtensions>();

    for (const cat of DEFAULT_CATEGORIES) {
      catMap.set(cat.category, {
        category: cat.category,
        label: cat.label,
        enabled: cat.enabled,
        maxSize: cat.maxSize,
        extensions: [],
      });
    }

    for (const row of rows) {
      if (row.extension === null) {
        // Category-level rule — override defaults
        const existing = catMap.get(row.category);
        if (existing) {
          existing.enabled = row.enabled;
          existing.maxSize = row.maxSize;
        }
      }
    }

    // Populate extensions
    for (const cat of DEFAULT_CATEGORIES) {
      const catEntry = catMap.get(cat.category);
      if (!catEntry) continue;

      for (const ext of cat.extensions) {
        const extRule = rows.find((r) => r.category === cat.category && r.extension === ext);
        catEntry.extensions.push({
          extension: ext,
          enabled: extRule?.enabled ?? true,
          maxSize: extRule?.maxSize ?? null,
        });
      }
    }

    return { categories: Array.from(catMap.values()) };
  }

  // ---------------------------------------------------------------------------
  // Update a category rule
  // ---------------------------------------------------------------------------

  async updateCategory(
    category: string,
    data: { enabled?: boolean; maxSize?: number },
  ): Promise<UploadRuleRow> {
    const cat = DEFAULT_CATEGORIES.find((c) => c.category === category);
    if (!cat) throw new Error(`Unknown category: ${category}`);

    const existing = await this.repo.findCategoryRule(category);
    return this.repo.upsert(category, null, {
      enabled: data.enabled ?? existing?.enabled ?? cat.enabled,
      maxSize: data.maxSize ?? existing?.maxSize ?? cat.maxSize,
    });
  }

  // ---------------------------------------------------------------------------
  // Update an extension override
  // ---------------------------------------------------------------------------

  async updateExtension(
    category: string,
    extension: string,
    data: { enabled?: boolean; maxSize?: number | null },
  ): Promise<UploadRuleRow> {
    const cat = DEFAULT_CATEGORIES.find((c) => c.category === category);
    if (!cat) throw new Error(`Unknown category: ${category}`);
    if (!cat.extensions.includes(extension))
      throw new Error(`Extension "${extension}" not in category "${category}"`);

    if (data.maxSize === null) {
      // Reset — delete the DB row so fallback to category default
      await this.repo.delete(category, extension).catch(() => {
        /* already gone */
      });
      // Return a synthetic row
      return { id: '', category, extension, enabled: true, maxSize: cat.maxSize };
    }

    const existing = await this.repo.findExtensionRule(category, extension);
    return this.repo.upsert(category, extension, {
      enabled: data.enabled ?? existing?.enabled ?? true,
      maxSize: data.maxSize ?? existing?.maxSize ?? cat.maxSize,
    });
  }

  // ---------------------------------------------------------------------------
  // Get effective max size for a category+extension pair
  // ---------------------------------------------------------------------------

  async getEffectiveMaxSize(
    category: string,
    extension: string,
  ): Promise<{ enabled: boolean; maxSize: number }> {
    const catRule = await this.repo.findCategoryRule(category);
    const extRule = await this.repo.findExtensionRule(category, extension);

    const catDefaults = DEFAULT_CATEGORIES.find((c) => c.category === category);

    const catEnabled = catRule?.enabled ?? catDefaults?.enabled ?? false;
    const catMaxSize = catRule?.maxSize ?? catDefaults?.maxSize ?? 0;

    const extEnabled = extRule?.enabled ?? true;
    const extMaxSize = extRule?.maxSize ?? null;

    return {
      enabled: catEnabled && extEnabled,
      maxSize: extMaxSize ?? catMaxSize,
    };
  }
}
