// ---------------------------------------------------------------------------
// MediaVault – Project Repository
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../utils/store';
import { CreateProjectInput, PaginatedResult, PaginationParams, Project } from '../core/types';

const COLLECTION = 'projects';

export class ProjectRepository {
  private readonly store = getStore();

  public async create(input: CreateProjectInput): Promise<Project> {
    const now = new Date();
    const project: Project = {
      id: uuidv4(),
      name: input.name,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    return this.store.insert<Project>(COLLECTION, project);
  }

  public async findById(id: string): Promise<Project | undefined> {
    return this.store.findOne<Project>(COLLECTION, (p) => p.id === id);
  }

  public async findByName(name: string): Promise<Project | undefined> {
    return this.store.findOne<Project>(COLLECTION, (p) => p.name === name);
  }

  public async findAll(params: PaginationParams): Promise<PaginatedResult<Project>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const sortBy = (params.sortBy ?? 'createdAt') as keyof Project;
    const sortOrder = params.sortOrder ?? 'desc';

    const all = this.store.all<Project>(COLLECTION);

    const sorted = [...all].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortOrder === 'asc' ? -1 : 1;
      if (bVal == null) return sortOrder === 'asc' ? 1 : -1;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = sorted.length;
    const skip = (page - 1) * limit;
    const data = sorted.slice(skip, skip + limit);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public async delete(id: string): Promise<Project | undefined> {
    const project = this.store.delete<Project>(COLLECTION, (p) => p.id === id);

    if (project) {
      this.store.deleteMany('apiKeys', (k: { projectId: string }) => k.projectId === id);
      this.store.deleteMany('files', (f: { projectId: string }) => f.projectId === id);
      this.store.deleteMany('folders', (f: { projectId: string }) => f.projectId === id);
    }

    return project;
  }

  public async exists(id: string): Promise<boolean> {
    return this.store.count(COLLECTION, (p: { id: string }) => p.id === id) > 0;
  }
}
