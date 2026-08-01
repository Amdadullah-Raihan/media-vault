// ---------------------------------------------------------------------------
// MediaVault – JSON Store Singleton
// ---------------------------------------------------------------------------

import { JsonStore } from './json-store';
import { getConfig } from '../config';

let _store: JsonStore | undefined;

export function getStore(): JsonStore {
  if (!_store) {
    const config = getConfig();
    _store = new JsonStore(config.database.url);
  }
  return _store;
}

/** For testing: reset the cached store. */
export function resetStore(): void {
  _store = undefined;
}
