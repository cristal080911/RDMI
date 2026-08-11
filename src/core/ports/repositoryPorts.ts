/**
 * PORTS LAYER - HEXAGONAL ARCHITECTURE
 * Input & Output interface contracts
 */

import { MaintenanceItem, ProgressAdvance, User, InstitutionalStats, AreaType, ItemStatus, UrgencyLevel, UserRole } from '../domain/entities';

export interface IMaintenanceRepository {
  getAll(filters?: { area?: AreaType; status?: ItemStatus; urgency?: UrgencyLevel; search?: string }): Promise<MaintenanceItem[]>;
  getById(id: string): Promise<MaintenanceItem | null>;
  create(item: Omit<MaintenanceItem, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'advances'>): Promise<MaintenanceItem>;
  update(id: string, updates: Partial<MaintenanceItem>): Promise<MaintenanceItem | null>;
  delete(id: string): Promise<boolean>;
  addAdvance(itemId: string, advance: Omit<ProgressAdvance, 'id' | 'date'>): Promise<MaintenanceItem | null>;
  getStats(): Promise<InstitutionalStats>;
}

export interface IUserRepository {
  getByUsername(username: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getPending(): Promise<User[]>;
  getAllApproved(): Promise<User[]>;
  create(userData: {
    username: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    roleTitle: string;
    department: string;
  }): Promise<{ user: User; message: string }>;
  approve(userId: string, approvedBy: string, updatedRole?: UserRole): Promise<User | null>;
  reject(userId: string, rejectedBy: string): Promise<boolean>;
}
