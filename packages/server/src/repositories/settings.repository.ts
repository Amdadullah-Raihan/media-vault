// ---------------------------------------------------------------------------
// MediaVault – Settings Repository
// ---------------------------------------------------------------------------

import { getStore } from '../utils/store';

const COLLECTION = 'settings';

interface SettingRow {
  key: string;
  value: string;
}

export class SettingsRepository {
  private readonly store = getStore();

  public async get(key: string): Promise<string | null> {
    const row = this.store.findOne<SettingRow>(COLLECTION, (s) => s.key === key);
    return row?.value ?? null;
  }

  public async set(key: string, value: string): Promise<void> {
    this.store.upsert<SettingRow>(
      COLLECTION,
      (s) => s.key === key,
      () => ({ key, value }),
      (s) => ({ ...s, value }),
    );
  }

  public async delete(key: string): Promise<void> {
    this.store.delete<SettingRow>(COLLECTION, (s) => s.key === key);
  }

  public async getMany(keys: string[]): Promise<Record<string, string | null>> {
    const rows = this.store.findMany<SettingRow>(COLLECTION, (s) => keys.includes(s.key));
    const result: Record<string, string | null> = {};
    for (const k of keys) {
      result[k] = rows.find((r) => r.key === k)?.value ?? null;
    }
    return result;
  }
}
