// ---------------------------------------------------------------------------
// MediaVault – Storage Driver Factory
// ---------------------------------------------------------------------------

import { StorageDriver } from './storage-driver.interface';
import { LocalStorageDriver } from './local-storage.driver';
import { getConfig } from '../config';
import { getLogger } from '../utils/logger';

let _driver: StorageDriver | undefined;

export function getStorageDriver(): StorageDriver {
  if (!_driver) {
    const config = getConfig();
    const logger = getLogger();

    switch (config.storage.driver) {
      case 'local':
        logger.info('Initializing local storage driver');
        _driver = new LocalStorageDriver();
        break;
      // Future drivers:
      // case 's3':    _driver = new S3StorageDriver();    break;
      // case 'minio': _driver = new MinioStorageDriver(); break;
      default:
        throw new Error(`Unknown storage driver: ${config.storage.driver}`);
    }
  }
  return _driver;
}

/** For testing: reset the cached driver. */
export function resetStorageDriver(): void {
  _driver = undefined;
}
