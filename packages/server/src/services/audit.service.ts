// ---------------------------------------------------------------------------
// MediaVault – Audit Service
// ---------------------------------------------------------------------------

import { AuditRepository } from '../repositories/audit.repository';
import { AuditEntry, CreateAuditEntryInput } from '../core/types';

export class AuditService {
  constructor(private readonly audit: AuditRepository) {}

  async log(input: CreateAuditEntryInput): Promise<AuditEntry> {
    return this.audit.create(input);
  }

  async list(limit = 100, offset = 0): Promise<AuditEntry[]> {
    return this.audit.findAll(limit, offset);
  }

  async findByUser(userId: string, limit = 50): Promise<AuditEntry[]> {
    return this.audit.findByUser(userId, limit);
  }
}
