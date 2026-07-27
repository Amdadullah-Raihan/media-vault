// ---------------------------------------------------------------------------
// MediaVault – API Key Service
// ---------------------------------------------------------------------------

import { ApiKeyRepository } from '../repositories';
import { CreateApiKeyInput } from '../core/types';
import { NotFoundError, ForbiddenError } from '../core/errors';
import { generateToken, keyPrefix } from '../utils/hash';
import { getLogger } from '../utils/logger';

export class ApiKeyService {
  private readonly repo = new ApiKeyRepository();
  private readonly logger = getLogger().child({ service: 'ApiKeyService' });

  public async create(input: CreateApiKeyInput) {
    const rawKey = `mv_${generateToken(24)}`;

    const apiKey = await this.repo.create({
      projectId: input.projectId,
      label: input.label ?? 'default',
      key: rawKey,
    });

    this.logger.info(
      { apiKeyId: apiKey.id, projectId: input.projectId, prefix: keyPrefix(rawKey) },
      'API key created',
    );

    // Return the raw key only once – it cannot be retrieved later
    return { ...apiKey, rawKey };
  }

  public async getById(id: string) {
    const key = await this.repo.findById(id);
    if (!key) {
      throw new NotFoundError('API key', id);
    }
    return key;
  }

  public async listByProjectId(projectId: string) {
    return this.repo.findByProjectId(projectId);
  }

  public async delete(id: string, projectId: string) {
    const key = await this.repo.findById(id);
    if (!key) {
      throw new NotFoundError('API key', id);
    }

    // A project can only delete its own keys
    if (key.projectId !== projectId) {
      throw new ForbiddenError('You can only delete API keys belonging to your own project');
    }

    await this.repo.delete(id);
    this.logger.info({ apiKeyId: id, projectId }, 'API key deleted');
  }
}
