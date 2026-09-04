/**
 * DOMAIN LAYER - HEXAGONAL ARCHITECTURE
 * Core entities, enums and domain types for Institutional Maintenance
 */

export type UserRole = 'SUPERIOR' | 'ADMINISTRATIVO' | 'DOCENTE';

export type UserStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  roleTitle: string; // e.g. "Rector / Director", "Coordinador de Sede", "Docente de Ciencias", "Jefe de Mantenimiento"
  department: string; // e.g. "Ciencias Naturales", "Administración General", "Primaria"
  status: UserStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export type AreaType = 'ELECTRICOS' | 'ESTRUCTURALES' | 'RECURSOS';

export type ItemStatus = 'DANADO' | 'EN_MANTENIMIENTO' | 'NUEVO_OPERATIVO';

export type UrgencyLevel = 'URGENTE' | 'IMPORTANTE' | 'NADA_URGENTE';

export interface AssignedPerson {
  name: string;
  cargo: string;
  phone?: string;
  email?: string;
}

export interface ProgressAdvance {
  id: string;
  itemId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  date: string;
  note: string;
  statusAfter: ItemStatus;
  photos: string[];
  materialsUsed?: string;
}

export interface MaintenanceItem {
  id: string;
  code: string; // e.g. ELE-001, EST-002, REC-003
  area: AreaType;
  title: string;
  description: string;
  location: string; // e.g. "Pabellón B - Aula 102", "Laboratorio de Química", "Cancha Central"
  status: ItemStatus;
  urgency: UrgencyLevel;
  reportedBy: {
    id: string;
    name: string;
    role: UserRole;
    roleTitle: string;
  };
  assignedTo: AssignedPerson; // Persona responsable por su cargo y nombre
  photos: string[];
  createdAt: string;
  updatedAt: string;
  advances: ProgressAdvance[];
  notes?: string;
}

export interface DamageReport {
  id: string;
  reportCode: string; // e.g. REP-DAN-101
  itemId?: string;
  itemCode?: string;
  area: AreaType;
  title: string;
  damageDescription: string;
  location: string;
  urgency: UrgencyLevel;
  status: 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO';
  reportedBy: {
    id: string;
    name: string;
    role: UserRole;
    roleTitle: string;
    email?: string;
  };
  assignedTo: AssignedPerson;
  photos: string[];
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  solutionNotes?: string;
}

export interface InstitutionalStats {
  totalItems: number;
  byArea: {
    electricos: number;
    estructurales: number;
    recursos: number;
  };
  byStatus: {
    danado: number;
    enMantenimiento: number;
    nuevoOperativo: number;
  };
  byUrgency: {
    urgente: number;
    importante: number;
    nadaUrgente: number;
  };
  recentAdvancesCount: number;
  pendingApprovalsCount: number;
}

export type EmailNotificationType = 'PASSWORD_RESET' | 'PASSWORD_CHANGED' | 'RECOVERY_CODE';

export interface SecurityEmailNotification {
  id: string;
  type: EmailNotificationType;
  toEmail: string;
  recipientName: string;
  recipientUsername: string;
  subject: string;
  previewSnippet: string;
  htmlContent: string;
  sentAt: string;
  status: 'DELIVERED' | 'SENT';
  ipInfo?: string;
  deviceInfo?: string;
  securityCode?: string;
}
