// ---------------------------------------------------------------------------
// MediaVault – Session Repository
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../utils/store';

const COLLECTION = 'sessions';

export interface Session {
  id: string;
  adminId: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

export class SessionRepository {
  private readonly store = getStore();

  public async create(adminId: string, expiresAt: Date): Promise<Session> {
    const now = new Date();
    const session: Session = {
      id: uuidv4(),
      adminId,
      createdAt: now,
      lastActivity: now,
      expiresAt,
    };
    return this.store.insert<Session>(COLLECTION, session);
  }

  public async findById(id: string): Promise<Session | undefined> {
    return this.store.findOne<Session>(COLLECTION, (s) => s.id === id);
  }

  public async touch(id: string): Promise<void> {
    this.store.update<Session>(
      COLLECTION,
      (s) => s.id === id,
      (s) => ({
        ...s,
        lastActivity: new Date(),
      }),
    );
  }

  public async updateExpiry(id: string, expiresAt: Date): Promise<void> {
    this.store.update<Session>(
      COLLECTION,
      (s) => s.id === id,
      (s) => ({
        ...s,
        expiresAt,
      }),
    );
  }

  public async delete(id: string): Promise<void> {
    this.store.delete<Session>(COLLECTION, (s) => s.id === id);
  }

  public async deleteExpired(): Promise<number> {
    return this.store.deleteMany(COLLECTION, (s: Session) => new Date(s.expiresAt) < new Date());
  }
}
