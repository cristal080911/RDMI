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
  onSelectArea: (area: AreaType | 'ALL') => void;
  onSelectGeneral?: () => void;
  activeStatus?: ItemStatus | 'ALL';
  activeArea?: AreaType | 'ALL';
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  onFilterByStatus,
  onSelectArea,
  onSelectGeneral,
  activeStatus = 'ALL',
  activeArea = 'ALL'
}) => {
  const isGeneralActive = activeStatus === 'ALL' && activeArea === 'ALL';

  const handleGeneralClick = () => {
    if (onSelectGeneral) {
      onSelectGeneral();
    } else {
      onFilterByStatus('ALL');
      onSelectArea('ALL');
    }
  };

  const handleStatusClick = (status: ItemStatus) => {
    // If clicking already selected status, toggle back to Gestión General
    if (activeStatus === status) {
      handleGeneralClick();
    } else {
      onFilterByStatus(status);
    }
  };

  return (
    <div id="institutional-stats-overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6 scroll-mt-6">
      
      {/* 1. Total & Urgencias Críticas Card (Beige Container) - GESTIÓN GENERAL */}
      <button
        type="button"
        onClick={handleGeneralClick}
        title="Haga clic para ingresar a Gestión General (Mostrar todo el inventario y restablecer filtros)"
        className={`text-left rounded-2xl p-4 border shadow-md shadow-indigo-950/20 flex flex-col justify-between transition-all cursor-pointer group ${
          isGeneralActive
            ? 'bg-[#FAF6EC] border-purple-500 ring-2 ring-purple-600/60 shadow-purple-950/20'
            : 'bg-[#FDFBF7] hover:bg-[#FAF6EC] border-[#E7DFD0] hover:border-purple-400'
        }`}
      >
        <div className="flex items-start justify-between w-full">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full border transition-colors ${
                isGeneralActive
                  ? 'bg-purple-900 text-white border-purple-700 shadow-sm'
                  : 'text-purple-900 bg-purple-100/90 border-purple-200 group-hover:bg-purple-200'
              }`}>
                Gestión General
              </span>
              {isGeneralActive ? (
                <span className="text-[10px] font-bold text-purple-800 bg-purple-200/80 px-1.5 py-0.2 rounded border border-purple-300">
                  Activo
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 group-hover:bg-purple-100">
                  Clic para entrar
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              {stats.totalItems} <span className="text-xs font-semibold text-slate-500">items</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">Registrados en la institución</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
            isGeneralActive ? 'bg-purple-900 text-white shadow-sm' : 'bg-purple-900/10 text-purple-800'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#ECE5D8] flex items-center justify-between text-xs text-purple-900 font-semibold w-full">
          <div className="flex items-center gap-1.5 text-rose-700 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>{stats.byUrgency.urgente} Urgencias</span>
          </div>
          <div className="flex items-center gap-1 text-purple-800 group-hover:text-purple-950 font-bold">
            <span>{isGeneralActive ? 'Ver Todo' : 'Ingresar a General'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </button>

      {/* 2. Dañados / Por Atender (Beige Container with Rose Accents) */}
      <button
        type="button"
        onClick={() => handleStatusClick('DANADO')}
        title={activeStatus === 'DANADO' ? 'Filtro activo. Clic para volver a Gestión General' : 'Filtrar elementos dañados'}
        className={`text-left rounded-2xl p-4 border shadow-md shadow-indigo-950/20 flex flex-col justify-between transition-all cursor-pointer group ${
          activeStatus === 'DANADO'
            ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/60 shadow-rose-950/20'
            : 'bg-[#FDFBF7] hover:bg-[#FAF6EC] border-[#E7DFD0] hover:border-rose-300'
        }`}
      >
        <div className="flex items-start justify-between w-full">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold tracking-wider uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                Requiere Arreglo
              </span>
              {activeStatus === 'DANADO' && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-200 px-1.5 py-0.2 rounded border border-rose-300">
                  Activo
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-rose-700 mt-2">
              {stats.byStatus.danado}
            </h3>
            <p className="text-xs text-slate-600 font-medium">Elementos en estado Dañado</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#ECE5D8] flex items-center justify-between text-xs text-rose-800 font-semibold w-full">
          <span>{activeStatus === 'DANADO' ? 'Mostrar Gestión General' : 'Ver reportes dañados'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </button>

      {/* 3. En Mantenimiento / Avances (Beige Container with Amber Accents) */}
      <button
        type="button"
        onClick={() => handleStatusClick('EN_MANTENIMIENTO')}
        title={activeStatus === 'EN_MANTENIMIENTO' ? 'Filtro activo. Clic para volver a Gestión General' : 'Filtrar elementos en mantenimiento'}
        className={`text-left rounded-2xl p-4 border shadow-md shadow-indigo-950/20 flex flex-col justify-between transition-all cursor-pointer group ${
          activeStatus === 'EN_MANTENIMIENTO'
            ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/60 shadow-amber-950/20'
            : 'bg-[#FDFBF7] hover:bg-[#FAF6EC] border-[#E7DFD0] hover:border-amber-300'
        }`}
      >
        <div className="flex items-start justify-between w-full">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold tracking-wider uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                En Reparación
              </span>
              {activeStatus === 'EN_MANTENIMIENTO' && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-1.5 py-0.2 rounded border border-amber-300">
                  Activo
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-amber-700 mt-2">
              {stats.byStatus.enMantenimiento}
            </h3>
            <p className="text-xs text-slate-600 font-medium">Con avances de técnicos</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#ECE5D8] flex items-center justify-between text-xs text-amber-900 font-semibold w-full">
          <span>{activeStatus === 'EN_MANTENIMIENTO' ? 'Mostrar Gestión General' : 'Ver trabajos en curso'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </button>

      {/* 4. Nuevo / Operativo (Beige Container with Emerald Accents) */}
      <button
        type="button"
        onClick={() => handleStatusClick('NUEVO_OPERATIVO')}
        title={activeStatus === 'NUEVO_OPERATIVO' ? 'Filtro activo. Clic para volver a Gestión General' : 'Filtrar elementos nuevos y reparados'}
        className={`text-left rounded-2xl p-4 border shadow-md shadow-indigo-950/20 flex flex-col justify-between transition-all cursor-pointer group ${
          activeStatus === 'NUEVO_OPERATIVO'
            ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/60 shadow-emerald-950/20'
            : 'bg-[#FDFBF7] hover:bg-[#FAF6EC] border-[#E7DFD0] hover:border-emerald-300'
        }`}
      >
        <div className="flex items-start justify-between w-full">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Nuevos & Reparados
              </span>
              {activeStatus === 'NUEVO_OPERATIVO' && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200 px-1.5 py-0.2 rounded border border-emerald-300">
                  Activo
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-emerald-700 mt-2">
              {stats.byStatus.nuevoOperativo}
            </h3>
            <p className="text-xs text-slate-600 font-medium">100% operativos para la sede</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#ECE5D8] flex items-center justify-between text-xs text-emerald-900 font-semibold w-full">
          <span>{activeStatus === 'NUEVO_OPERATIVO' ? 'Mostrar Gestión General' : 'Ver inventario al día'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </button>
    </div>
  );
};
