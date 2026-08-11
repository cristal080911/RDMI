import React from 'react';
import {
  Zap,
  Building2,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { InstitutionalStats, AreaType, ItemStatus } from '../core/domain/entities';

interface StatsDashboardProps {
  stats: InstitutionalStats;
  onFilterByStatus: (status: ItemStatus | 'ALL') => void;
  onSelectArea: (area: AreaType) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  onFilterByStatus,
  onSelectArea
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      
      {/* 1. Total & Urgencias Críticas Card (Beige Container) */}
      <div className="bg-[#FDFBF7] rounded-2xl p-4 border border-[#E7DFD0] shadow-md shadow-indigo-950/20 flex flex-col justify-between transition-all hover:shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-purple-900 bg-purple-100/90 px-2 py-0.5 rounded-full border border-purple-200">
              Gestión General
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              {stats.totalItems} <span className="text-xs font-semibold text-slate-500">items</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">Registrados en la institución</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-900/10 text-purple-800 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#ECE5D8] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-rose-700 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>{stats.byUrgency.urgente} Urgencias Activas</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {stats.recentAdvancesCount} avances
          </span>
        </div>
      </div>

      {/* 2. Dañados / Por Atender (Beige Container with Rose Accents) */}
      <button
        onClick={() => onFilterByStatus('DANADO')}
        className="text-left bg-[#FDFBF7] hover:bg-[#FAF6EC] rounded-2xl p-4 border border-[#E7DFD0] hover:border-rose-300 shadow-md shadow-indigo-950/20 flex flex-col justify-between transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
              Requiere Arreglo
            </span>
            <h3 className="text-2xl font-black text-rose-700 mt-2">
              {stats.byStatus.danado}
            </h3>
            <p className="text-xs text-slate-600 font-medium">Elementos en estado Dañado</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#ECE5D8] flex items-center justify-between text-xs text-rose-800 font-semibold">
          <span>Ver reportes dañados</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </button>

      {/* 3. En Mantenimiento / Avances (Beige Container with Amber Accents) */}
      <button
        onClick={() => onFilterByStatus('EN_MANTENIMIENTO')}
        className="text-left bg-[#FDFBF7] hover:bg-[#FAF6EC] rounded-2xl p-4 border border-[#E7DFD0] hover:border-amber-300 shadow-md shadow-indigo-950/20 flex flex-col justify-between transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
              En Reparación
            </span>
            <h3 className="text-2xl font-black text-amber-700 mt-2">
              {stats.byStatus.enMantenimiento}
            </h3>
            <p className="text-xs text-slate-600 font-medium">Con avances de técnicos</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#ECE5D8] flex items-center justify-between text-xs text-amber-900 font-semibold">
          <span>Ver trabajos en curso</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </button>

      {/* 4. Nuevo / Operativo (Beige Container with Emerald Accents) */}
      <button
        onClick={() => onFilterByStatus('NUEVO_OPERATIVO')}
        className="text-left bg-[#FDFBF7] hover:bg-[#FAF6EC] rounded-2xl p-4 border border-[#E7DFD0] hover:border-emerald-300 shadow-md shadow-indigo-950/20 flex flex-col justify-between transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              Nuevos & Reparados
            </span>
            <h3 className="text-2xl font-black text-emerald-700 mt-2">
              {stats.byStatus.nuevoOperativo}
            </h3>
            <p className="text-xs text-slate-600 font-medium">100% operativos para la sede</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#ECE5D8] flex items-center justify-between text-xs text-emerald-900 font-semibold">
          <span>Ver inventario al día</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </button>
    </div>
  );
};
