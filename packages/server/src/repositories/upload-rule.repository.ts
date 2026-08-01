// ---------------------------------------------------------------------------
// MediaVault – Upload Rule Repository
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../utils/store';

const COLLECTION = 'uploadRules';

export interface UploadRuleRow {
  id: string;
  category: string;
  extension: string | null;
  enabled: boolean;
  maxSize: number;
}

export class UploadRuleRepository {
  private readonly store = getStore();

  public async findAll(): Promise<UploadRuleRow[]> {
    return this.store
      .all<UploadRuleRow>(COLLECTION)
      .sort(
        (a, b) =>
          a.category.localeCompare(b.category) ||
          (a.extension ?? '').localeCompare(b.extension ?? ''),
      );
  }

  public async findByCategory(category: string): Promise<UploadRuleRow[]> {
    return this.store
      .findMany<UploadRuleRow>(COLLECTION, (r) => r.category === category)
      .sort((a, b) => (a.extension ?? '').localeCompare(b.extension ?? ''));
  }

  public async findCategoryRule(category: string): Promise<UploadRuleRow | null> {
    return (
      this.store.findOne<UploadRuleRow>(
        COLLECTION,
        (r) => r.category === category && r.extension === null,
      ) ?? null
    );
  }

  public async findExtensionRule(
    category: string,
    extension: string,
  ): Promise<UploadRuleRow | null> {
    return (
      this.store.findOne<UploadRuleRow>(
        COLLECTION,
        (r) => r.category === category && r.extension === extension,
      ) ?? null
    );
  }

  public async count(): Promise<number> {
    return this.store.count(COLLECTION);
  }

  public async upsert(
    category: string,
    extension: string | null,
    data: { enabled: boolean; maxSize: number },
  ): Promise<UploadRuleRow> {
    return this.store.upsert<UploadRuleRow>(
      COLLECTION,
      (r) => r.category === category && r.extension === extension,
      () => ({
        id: uuidv4(),
        category,
        extension,
        enabled: data.enabled,
        maxSize: data.maxSize,
      }),
      (r) => ({ ...r, enabled: data.enabled, maxSize: data.maxSize }),
    );
  }

  public async delete(category: string, extension: string | null): Promise<void> {
    this.store.delete<UploadRuleRow>(
      COLLECTION,
      (r) => r.category === category && r.extension === extension,
    );
  }

  public async createMany(
    rows: { category: string; extension: string | null; enabled: boolean; maxSize: number }[],
  ): Promise<void> {
    const existing = this.store.all<UploadRuleRow>(COLLECTION);
    const newRows: UploadRuleRow[] = [];

    for (const row of rows) {
      const exists = existing.some(
        (r) => r.category === row.category && r.extension === row.extension,
      );
      if (!exists) {
        newRows.push({ id: uuidv4(), ...row });
      }
    }

    if (newRows.length > 0) {
      this.store.insertMany(COLLECTION, newRows);
    }
  }
}
