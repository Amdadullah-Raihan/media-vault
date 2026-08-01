// ---------------------------------------------------------------------------
// MediaVault – JSON File Store
//
// Simple file-based JSON data store. Each "collection" is a single .json
// file. Writes are atomic (write-temp → rename). No external database needed.
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';

export class JsonStore {
  private readonly dir: string;
  private readonly cache = new Map<string, unknown[]>();

  public constructor(dataDir: string) {
    this.dir = dataDir;
    fs.mkdirSync(this.dir, { recursive: true });
  }

  // -----------------------------------------------------------------------
  // Read all records from a collection
  // -----------------------------------------------------------------------

  public all<T>(collection: string): T[] {
    const cached = this.cache.get(collection);
    if (cached !== undefined) return cached as T[];

    const file = this.filePath(collection);
    if (!fs.existsSync(file)) {
      this.cache.set(collection, []);
      return [];
    }

    const raw = fs.readFileSync(file, 'utf-8');
    const data = JSON.parse(raw) as T[];
    this.cache.set(collection, data);
    return data;
  }

  // -----------------------------------------------------------------------
  // Find a single record by predicate
  // -----------------------------------------------------------------------

  public findOne<T>(collection: string, predicate: (item: T) => boolean): T | undefined {
    const items = this.all<T>(collection);
    return items.find(predicate);
  }

  // -----------------------------------------------------------------------
  // Find many records by predicate
  // -----------------------------------------------------------------------

  public findMany<T>(collection: string, predicate: (item: T) => boolean): T[] {
    const items = this.all<T>(collection);
    return items.filter(predicate);
  }

  // -----------------------------------------------------------------------
  // Insert a record
  // -----------------------------------------------------------------------

  public insert<T>(collection: string, item: T): T {
    const items = this.all<T>(collection);
    items.push(item);
    this.flush(collection, items);
    return item;
  }

  // -----------------------------------------------------------------------
  // Insert many records
  // -----------------------------------------------------------------------

  public insertMany<T>(collection: string, newItems: T[]): void {
    const items = this.all<T>(collection);
    items.push(...newItems);
    this.flush(collection, items);
  }

  // -----------------------------------------------------------------------
  // Update records matching a predicate
  // -----------------------------------------------------------------------

  public update<T>(
    collection: string,
    predicate: (item: T) => boolean,
    updater: (item: T) => T,
  ): T | undefined {
    const items = this.all<T>(collection);
    const idx = items.findIndex(predicate);
    if (idx === -1) return undefined;

    const existing = items[idx];
    if (!existing) return undefined;

    const updated = updater(existing);
    items[idx] = updated;
    this.flush(collection, items);
    return updated;
  }

  // -----------------------------------------------------------------------
  // Upsert: update if found, insert if not
  // -----------------------------------------------------------------------

  public upsert<T>(
    collection: string,
    predicate: (item: T) => boolean,
    create: () => T,
    updater: (item: T) => T,
  ): T {
    const items = this.all<T>(collection);
    const idx = items.findIndex(predicate);

    if (idx === -1) {
      const created = create();
      items.push(created);
      this.flush(collection, items);
      return created;
    }

    const existing = items[idx];
    if (!existing) {
      const created = create();
      items.push(created);
      this.flush(collection, items);
      return created;
    }

    const updated = updater(existing);
    items[idx] = updated;
    this.flush(collection, items);
    return updated;
  }

  // -----------------------------------------------------------------------
  // Delete records matching a predicate
  // -----------------------------------------------------------------------

  public delete<T>(collection: string, predicate: (item: T) => boolean): T | undefined {
    const items = this.all<T>(collection);
    const idx = items.findIndex(predicate as (item: unknown) => boolean);
    if (idx === -1) return undefined;

    const [removed] = items.splice(idx, 1);
    this.flush(collection, items);
    return removed as T;
  }

  // -----------------------------------------------------------------------
  // Delete many records matching a predicate
  // -----------------------------------------------------------------------

  public deleteMany<T>(collection: string, predicate: (item: T) => boolean): number {
    const items = this.all<T>(collection);
    const before = items.length;
    const remaining = items.filter((item) => !predicate(item));
    const removed = before - remaining.length;
    this.flush(collection, remaining);
    return removed;
  }

  // -----------------------------------------------------------------------
  // Count records matching a predicate
  // -----------------------------------------------------------------------

  public count<T>(collection: string, predicate?: (item: T) => boolean): number {
    const items = this.all<T>(collection);
    if (!predicate) return items.length;
    return items.filter((item) => predicate(item)).length;
  }

  // -----------------------------------------------------------------------
  // Clear cache (force re-read from disk)
  // -----------------------------------------------------------------------

  public invalidate(collection?: string): void {
    if (collection) {
      this.cache.delete(collection);
    } else {
      this.cache.clear();
    }
  }

  // -----------------------------------------------------------------------
  // Private: atomic file write
  // -----------------------------------------------------------------------

  private flush(collection: string, data: unknown[]): void {
    this.cache.set(collection, data);
    const file = this.filePath(collection);
    const tmpFile = file + '.tmp';

    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, file);
  }

  private filePath(collection: string): string {
    return path.join(this.dir, `${collection}.json`);
  }
}
