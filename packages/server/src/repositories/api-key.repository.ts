// ---------------------------------------------------------------------------
// MediaVault – API Key Repository
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../utils/store';
import { ApiKey, CreateApiKeyInput } from '../core/types';

const COLLECTION = 'apiKeys';

export class ApiKeyRepository {
  private readonly store = getStore();

  public async create(input: CreateApiKeyInput & { key: string }): Promise<ApiKey> {
    const apiKey: ApiKey = {
      id: uuidv4(),
      projectId: input.projectId,
      key: input.key,
      label: input.label ?? 'default',
      createdAt: new Date(),
      lastUsedAt: null,
    };
    return this.store.insert<ApiKey>(COLLECTION, apiKey);
  }

  public async findById(id: string): Promise<ApiKey | undefined> {
    return this.store.findOne<ApiKey>(COLLECTION, (k) => k.id === id);
  }

  public async findByKey(key: string): Promise<ApiKey | undefined> {
    return this.store.findOne<ApiKey>(COLLECTION, (k) => k.key === key);
  }

  public async findByProjectId(projectId: string): Promise<ApiKey[]> {
    return this.store
      .findMany<ApiKey>(COLLECTION, (k) => k.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async findAll(): Promise<ApiKey[]> {
    return this.store
      .all<ApiKey>(COLLECTION)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async delete(id: string): Promise<ApiKey | undefined> {
    return this.store.delete<ApiKey>(COLLECTION, (k) => k.id === id);
  }

  public async countByProjectId(projectId: string): Promise<number> {
    return this.store.count(COLLECTION, (k: { projectId: string }) => k.projectId === projectId);
  }

  public async updateLastUsed(id: string): Promise<void> {
    this.store.update<ApiKey>(
      COLLECTION,
      (k) => k.id === id,
      (k) => ({
        ...k,
        lastUsedAt: new Date(),
      }),
    );
  }
}
