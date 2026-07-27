// ---------------------------------------------------------------------------
// MediaVault – Project Service
// ---------------------------------------------------------------------------

import { ProjectRepository } from '../repositories';
import { CreateProjectInput, PaginationParams } from '../core/types';
import { NotFoundError, ConflictError } from '../core/errors';
import { getLogger } from '../utils/logger';

export class ProjectService {
  private readonly repo = new ProjectRepository();
  private readonly logger = getLogger().child({ service: 'ProjectService' });

  public async create(input: CreateProjectInput) {
    const existing = await this.repo.findByName(input.name);
    if (existing) {
      throw new ConflictError(`A project named "${input.name}" already exists`);
    }

    const project = await this.repo.create(input);
    this.logger.info({ projectId: project.id, name: project.name }, 'Project created');
    return project;
  }

  public async getById(id: string) {
    const project = await this.repo.findById(id);
    if (!project) {
      throw new NotFoundError('Project', id);
    }
    return project;
  }

  public async list(params: PaginationParams) {
    return this.repo.findAll(params);
  }

  public async delete(id: string) {
    const project = await this.repo.findById(id);
    if (!project) {
      throw new NotFoundError('Project', id);
    }

    await this.repo.delete(id);
    this.logger.info({ projectId: id, name: project.name }, 'Project deleted');
  }
}
