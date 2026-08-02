// ---------------------------------------------------------------------------
// MediaVault – Audit Repository
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../utils/store';
import { AuditEntry, CreateAuditEntryInput } from '../core/types';

const COLLECTION = 'auditLogs';

export class AuditRepository {
  private readonly store = getStore();

  public async create(input: CreateAuditEntryInput): Promise<AuditEntry> {
    const entry: AuditEntry = {
      id: uuidv4(),
      userId: input.userId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId ?? null,
      previousValue: input.previousValue ?? null,
      newValue: input.newValue ?? null,
      ip: input.ip,
      userAgent: input.userAgent,
      success: input.success ?? true,
      timestamp: new Date(),
    };
    return this.store.insert<AuditEntry>(COLLECTION, entry);
  }

  public async findAll(limit = 100, offset = 0): Promise<AuditEntry[]> {
    const all = this.store.all<AuditEntry>(COLLECTION);
    return all
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
  }

  public async findByUser(userId: string, limit = 50): Promise<AuditEntry[]> {
    const entries = this.store.findMany<AuditEntry>(COLLECTION, (e) => e.userId === userId);
    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  public async count(): Promise<number> {
    return this.store.count<AuditEntry>(COLLECTION);
  }
}
