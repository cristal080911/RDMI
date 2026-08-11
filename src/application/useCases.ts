/**
 * APPLICATION LAYER - HEXAGONAL ARCHITECTURE
 * Orchestrates business logic and domain rules
 */

import { MaintenanceItem, ProgressAdvance, AreaType, ItemStatus, UrgencyLevel, InstitutionalStats } from '../core/domain/entities';

export class MaintenanceService {
  static filterItems(
    items: MaintenanceItem[],
    options: {
      area?: AreaType | 'ALL';
      status?: ItemStatus | 'ALL';
      urgency?: UrgencyLevel | 'ALL';
      search?: string;
    }
  ): MaintenanceItem[] {
    return items.filter(item => {
      if (options.area && options.area !== 'ALL' && item.area !== options.area) {
        return false;
      }
      if (options.status && options.status !== 'ALL' && item.status !== options.status) {
        return false;
      }
      if (options.urgency && options.urgency !== 'ALL' && item.urgency !== options.urgency) {
        return false;
      }
      if (options.search && options.search.trim() !== '') {
        const query = options.search.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCode = item.code.toLowerCase().includes(query);
        const matchesLocation = item.location.toLowerCase().includes(query);
        const matchesDescription = item.description.toLowerCase().includes(query);
        const matchesAssigned = item.assignedTo.name.toLowerCase().includes(query) || item.assignedTo.cargo.toLowerCase().includes(query);
        const matchesReporter = item.reportedBy.name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCode && !matchesLocation && !matchesDescription && !matchesAssigned && !matchesReporter) {
          return false;
        }
      }
      return true;
    });
  }

  static calculateStats(items: MaintenanceItem[], pendingUsersCount = 0): InstitutionalStats {
    const stats: InstitutionalStats = {
      totalItems: items.length,
      byArea: {
        electricos: 0,
        estructurales: 0,
        recursos: 0
      },
      byStatus: {
        danado: 0,
        enMantenimiento: 0,
        nuevoOperativo: 0
      },
      byUrgency: {
        urgente: 0,
        importante: 0,
        nadaUrgente: 0
      },
      recentAdvancesCount: 0,
      pendingApprovalsCount: pendingUsersCount
    };

    items.forEach(item => {
      // By Area
      if (item.area === 'ELECTRICOS') stats.byArea.electricos++;
      else if (item.area === 'ESTRUCTURALES') stats.byArea.estructurales++;
      else if (item.area === 'RECURSOS') stats.byArea.recursos++;

      // By Status
      if (item.status === 'DANADO') stats.byStatus.danado++;
      else if (item.status === 'EN_MANTENIMIENTO') stats.byStatus.enMantenimiento++;
      else if (item.status === 'NUEVO_OPERATIVO') stats.byStatus.nuevoOperativo++;

      // By Urgency
      if (item.urgency === 'URGENTE') stats.byUrgency.urgente++;
      else if (item.urgency === 'IMPORTANTE') stats.byUrgency.importante++;
      else if (item.urgency === 'NADA_URGENTE') stats.byUrgency.nadaUrgente++;

      // Advances
      if (item.advances && item.advances.length > 0) {
        stats.recentAdvancesCount += item.advances.length;
      }
    });

    return stats;
  }

  static getAreaLabel(area: AreaType): string {
    switch (area) {
      case 'ELECTRICOS':
        return 'Zonas Eléctricas';
      case 'ESTRUCTURALES':
        return 'Estructuras y Obras';
      case 'RECURSOS':
        return 'Recursos y Equipamiento';
      default:
        return area;
    }
  }

  static getStatusInfo(status: ItemStatus): { label: string; bgClass: string; textClass: string; borderClass: string; dotColor: string } {
    switch (status) {
      case 'DANADO':
        return {
          label: 'Dañado / Requiere Atención',
          bgClass: 'bg-rose-50',
          textClass: 'text-rose-700',
          borderClass: 'border-rose-200',
          dotColor: 'bg-rose-500'
        };
      case 'EN_MANTENIMIENTO':
        return {
          label: 'En Mantenimiento / Arreglo',
          bgClass: 'bg-amber-50',
          textClass: 'text-amber-700',
          borderClass: 'border-amber-200',
          dotColor: 'bg-amber-500'
        };
      case 'NUEVO_OPERATIVO':
        return {
          label: 'Nuevo / Operativo',
          bgClass: 'bg-emerald-50',
          textClass: 'text-emerald-700',
          borderClass: 'border-emerald-200',
          dotColor: 'bg-emerald-500'
        };
      default:
        return {
          label: status,
          bgClass: 'bg-slate-50',
          textClass: 'text-slate-700',
          borderClass: 'border-slate-200',
          dotColor: 'bg-slate-500'
        };
    }
  }

  static getUrgencyInfo(urgency: UrgencyLevel): { label: string; badgeBg: string; badgeText: string; iconColor: string } {
    switch (urgency) {
      case 'URGENTE':
        return {
          label: 'Urgente (Prioridad Máxima)',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-800 border-red-300',
          iconColor: 'text-red-600'
        };
      case 'IMPORTANTE':
        return {
          label: 'Importante (Atención Regular)',
          badgeBg: 'bg-orange-100',
          badgeText: 'text-orange-800 border-orange-300',
          iconColor: 'text-orange-600'
        };
      case 'NADA_URGENTE':
        return {
          label: 'Nada Urgente / Rutinario',
          badgeBg: 'bg-blue-100',
          badgeText: 'text-blue-800 border-blue-300',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          label: urgency,
          badgeBg: 'bg-slate-100',
          badgeText: 'text-slate-800 border-slate-300',
          iconColor: 'text-slate-600'
        };
    }
  }
}
