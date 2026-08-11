/**
 * ADAPTER LAYER - HEXAGONAL ARCHITECTURE
 * REST API Client & Persistent Gateway for UI Components
 */

import {
  MaintenanceItem,
  ProgressAdvance,
  User,
  InstitutionalStats,
  AreaType,
  ItemStatus,
  UrgencyLevel,
  UserRole
} from '../../core/domain/entities';

const API_BASE = '/api';

export class ApiClient {
  static async getHealth(): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }

  // --- AUTHENTICATION ---
  static async login(username: string, password: string): Promise<{ success: boolean; user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }
    return data;
  }

  static async register(payload: {
    username: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    roleTitle: string;
    department: string;
    isStudent?: boolean;
  }): Promise<{ success: boolean; message: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al registrar usuario');
    }
    return data;
  }

  static async getPendingUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users/pending`);
    if (!res.ok) throw new Error('Error al cargar usuarios pendientes');
    return res.json();
  }

  static async getAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Error al cargar usuarios');
    return res.json();
  }

  static async approveUser(userId: string, approve: boolean, approverName: string, newRole?: UserRole, newRoleTitle?: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/users/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, approve, approverName, newRole, newRoleTitle })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al procesar aprobación');
    return data;
  }

  // --- MAINTENANCE ITEMS ---
  static async getMaintenanceItems(filters?: {
    area?: AreaType | 'ALL';
    status?: ItemStatus | 'ALL';
    urgency?: UrgencyLevel | 'ALL';
    search?: string;
  }): Promise<MaintenanceItem[]> {
    const params = new URLSearchParams();
    if (filters?.area && filters.area !== 'ALL') params.append('area', filters.area);
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.urgency && filters.urgency !== 'ALL') params.append('urgency', filters.urgency);
    if (filters?.search) params.append('search', filters.search);

    const url = `${API_BASE}/maintenance${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener mantenimientos');
    return res.json();
  }

  static async getMaintenanceItemById(id: string): Promise<MaintenanceItem> {
    const res = await fetch(`${API_BASE}/maintenance/${id}`);
    if (!res.ok) throw new Error('Registro no encontrado');
    return res.json();
  }

  static async createMaintenanceItem(item: {
    area: AreaType;
    title: string;
    description: string;
    location: string;
    status: ItemStatus;
    urgency: UrgencyLevel;
    reportedBy: {
      id: string;
      name: string;
      role: UserRole;
      roleTitle: string;
    };
    assignedTo: {
      name: string;
      cargo: string;
      phone?: string;
      email?: string;
    };
    photos: string[];
    notes?: string;
    initialAdvanceNote?: string;
  }): Promise<MaintenanceItem> {
    const res = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear reporte de mantenimiento');
    return data;
  }

  static async updateMaintenanceItem(id: string, updates: Partial<MaintenanceItem>): Promise<MaintenanceItem> {
    const res = await fetch(`${API_BASE}/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar reporte');
    return data;
  }

  static async addProgressAdvance(itemId: string, payload: {
    authorId: string;
    authorName: string;
    authorRole: string;
    note: string;
    statusAfter?: ItemStatus;
    photos?: string[];
    materialsUsed?: string;
  }): Promise<{ advance: ProgressAdvance; item: MaintenanceItem }> {
    const res = await fetch(`${API_BASE}/maintenance/${itemId}/advances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al registrar avance');
    return data;
  }

  static async deleteMaintenanceItem(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/maintenance/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar reporte');
    return true;
  }

  static async getStats(): Promise<InstitutionalStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Error al obtener estadísticas');
    return res.json();
  }
}
