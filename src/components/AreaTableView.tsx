import React from 'react';
import {
  Zap,
  Building2,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Eye,
  Plus,
  MessageSquare,
  Image as ImageIcon,
  UserCheck,
  Search,
  Filter,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  Shield,
  RotateCcw
} from 'lucide-react';
import { MaintenanceItem, AreaType, ItemStatus, UrgencyLevel, User } from '../core/domain/entities';
import { MaintenanceService } from '../application/useCases';

interface AreaTableViewProps {
  items: MaintenanceItem[];
  currentArea: AreaType | 'ALL';
  selectedStatus: ItemStatus | 'ALL';
  selectedUrgency: UrgencyLevel | 'ALL';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: ItemStatus | 'ALL') => void;
  onUrgencyChange: (urgency: UrgencyLevel | 'ALL') => void;
  onViewItemDetail: (item: MaintenanceItem) => void;
  onAddAdvance: (item: MaintenanceItem) => void;
  onOpenNewIncident: () => void;
  currentUser: User | null;
  onResetToGeneral?: () => void;
}

export const AreaTableView: React.FC<AreaTableViewProps> = ({
  items,
  currentArea,
  selectedStatus,
  selectedUrgency,
  searchQuery,
  onSearchChange,
  onStatusChange,
  onUrgencyChange,
  onViewItemDetail,
  onAddAdvance,
  onOpenNewIncident,
  currentUser,
  onResetToGeneral
}) => {
  const isFiltered = currentArea !== 'ALL' || selectedStatus !== 'ALL' || selectedUrgency !== 'ALL' || searchQuery.trim() !== '';

  const filteredItems = MaintenanceService.filterItems(items, {
    area: currentArea,
    status: selectedStatus,
    urgency: selectedUrgency,
    search: searchQuery
  });

  const getAreaHeaderInfo = () => {
    switch (currentArea) {
      case 'ELECTRICOS':
        return {
          title: 'Tabla de Mantenimientos Eléctricos',
          subtitle: 'Seguimiento de tableros, iluminación, cableado, disyuntores y redes de energía',
          icon: Zap,
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
          titleColor: 'text-purple-900'
        };
      case 'ESTRUCTURALES':
        return {
          title: 'Tabla de Mantenimientos Estructurales',
          subtitle: 'Monitoreo de paredes, cubiertas, techos, pisos, pintura, baterías de baños y cerrajería',
          icon: Building2,
          badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
          titleColor: 'text-purple-900'
        };
      case 'RECURSOS':
        return {
          title: 'Tabla de Recursos y Equipamiento',
          subtitle: 'Inventario y control de pupitres, videoproyectores, computadores, mobiliario y laboratorios',
          icon: Package,
          badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          titleColor: 'text-emerald-900'
        };
      default:
        return {
          title: 'Gestión General y Consolidado Institucional',
          subtitle: 'Visión unificada de las tres áreas críticas: Eléctricos, Estructurales y Recursos',
          icon: Layers,
          badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
          titleColor: 'text-purple-900'
        };
    }
  };

  const areaInfo = getAreaHeaderInfo();
  const HeaderIcon = areaInfo.icon;

  return (
    <div id="institutional-maintenance-table-view" className="bg-[#FDFBF7] rounded-2xl border border-[#E5DEC9] shadow-xl shadow-indigo-950/30 overflow-hidden mb-8">
      
      {/* Header Section (Beige Container with Purple / Emerald Title) */}
      <div className="p-4 sm:p-6 border-b border-[#ECE5D8] bg-[#F7F3EA]/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-900/10 text-purple-900 flex items-center justify-center shrink-0 border border-purple-300/60 shadow-sm">
              <HeaderIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-xl sm:text-2xl font-black ${areaInfo.titleColor} tracking-tight`}>
                  {areaInfo.title}
                </h2>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${areaInfo.badgeColor}`}>
                  {filteredItems.length} registros
                </span>
                {isFiltered && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Filtro activo
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                {areaInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Action in Table Header */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {isFiltered && onResetToGeneral && (
              <button
                type="button"
                onClick={onResetToGeneral}
                title="Volver a ver todo en Gestión General"
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 hover:text-white border border-purple-400/40 text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4 text-purple-300" />
                <span>Ir a Gestión General</span>
              </button>
            )}

            <button
              onClick={onOpenNewIncident}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar en esta Área</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-[#E8E1D2]">
          
          {/* Search Field */}
          <div className="sm:col-span-6 lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por código, daño, aula, o persona asignada..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600 transition-all shadow-inner"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3 lg:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value as ItemStatus | 'ALL')}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600 transition-all shadow-inner cursor-pointer"
            >
              <option value="ALL">🔍 Todos los Estados (Gestión General)</option>
              <option value="DANADO">🔴 Dañado / Requiere Atención</option>
              <option value="EN_MANTENIMIENTO">🟡 En Mantenimiento / Arreglo</option>
              <option value="NUEVO_OPERATIVO">🟢 Nuevo / Operativo</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="sm:col-span-3 lg:col-span-4">
            <select
              value={selectedUrgency}
              onChange={(e) => onUrgencyChange(e.target.value as UrgencyLevel | 'ALL')}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600 transition-all shadow-inner cursor-pointer"
            >
              <option value="ALL">⚡ Todas las Urgencias</option>
              <option value="URGENTE">🔥 Urgente (Prioridad Máxima)</option>
              <option value="IMPORTANTE">⚠️ Importante (Atención Regular)</option>
              <option value="NADA_URGENTE">🟢 Nada Urgente (Rutinario)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Strip with Return to General Button */}
        {isFiltered && onResetToGeneral && (
          <div className="mt-3 pt-2.5 border-t border-[#E8E1D2] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="font-semibold text-slate-600">Filtros aplicados:</span>
              {currentArea !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-medium border border-purple-200">
                  Área: {currentArea}
                </span>
              )}
              {selectedStatus !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium border border-amber-200">
                  Estado: {selectedStatus}
                </span>
              )}
              {selectedUrgency !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-medium border border-rose-200">
                  Urgencia: {selectedUrgency}
                </span>
              )}
              {searchQuery.trim() && (
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-medium border border-slate-300">
                  Texto: "{searchQuery}"
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onResetToGeneral}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer a Gestión General</span>
            </button>
          </div>
        )}
      </div>

      {/* Table Content (Desktop Table + Mobile Cards) */}
      {filteredItems.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-slate-700">No se encontraron registros de mantenimiento</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Intente cambiando los filtros de búsqueda o registre un nuevo reporte de elemento dañado, en arreglo o nuevo para la institución.
          </p>
          <button
            onClick={onOpenNewIncident}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primer Reporte</span>
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7DFD0] bg-[#F2ECE0]/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Código & Área</th>
                  <th className="py-3 px-4">Detalle del Daño / Elemento</th>
                  <th className="py-3 px-4">Ubicación Institucional</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Urgencia</th>
                  <th className="py-3 px-4">Asignado a (Cargo & Nombre)</th>
                  <th className="py-3 px-4 text-center">Avances</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DC] text-xs">
                {filteredItems.map((item) => {
                  const statusInfo = MaintenanceService.getStatusInfo(item.status);
                  const urgencyInfo = MaintenanceService.getUrgencyInfo(item.urgency);
                  const areaLabel = MaintenanceService.getAreaLabel(item.area);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FAF6EC] transition-colors group"
                    >
                      {/* Code & Area */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-xs text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block">
                          {item.code}
                        </div>
                        <p className="text-[10px] font-semibold text-slate-500 mt-1">
                          {areaLabel}
                        </p>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="flex items-start gap-2">
                          {item.photos && item.photos.length > 0 && (
                            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-300 relative group/img">
                              <img
                                src={item.photos[0]}
                                alt="Foto reporte"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs leading-snug group-hover:text-purple-900">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-800 text-xs">
                          {item.location}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Por: {item.reportedBy.name} ({item.reportedBy.roleTitle})
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}>
                          <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
                          {statusInfo.label.split(' / ')[0]}
                        </span>
                      </td>

                      {/* Urgency */}
                      <td className="py-3.5 px-4 align-top">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${urgencyInfo.badgeBg} ${urgencyInfo.badgeText}`}>
                          {item.urgency === 'URGENTE' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                          {urgencyInfo.label.split(' (')[0]}
                        </span>
                      </td>

                      {/* Assigned Person (Cargo y Nombre) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-start gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">
                              {item.assignedTo.name}
                            </p>
                            <p className="text-[10px] font-semibold text-purple-900 bg-purple-100/70 px-1.5 py-0.2 rounded inline-block mt-0.5">
                              {item.assignedTo.cargo}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Advances Count */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 text-slate-700 font-bold text-[11px] border border-stone-200">
                          <MessageSquare className="w-3 h-3 text-slate-500" />
                          {item.advances ? item.advances.length : 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onAddAdvance(item)}
                            title="Enviar avance con fotos o actualizar estado"
                            className="px-2.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold border border-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Avance</span>
                          </button>
                          <button
                            onClick={() => onViewItemDetail(item)}
                            title="Ver detalles completos e historial"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View (Responsive for cellphones and small laptops) */}
          <div className="lg:hidden divide-y divide-[#ECE5D8]">
            {filteredItems.map((item) => {
              const statusInfo = MaintenanceService.getStatusInfo(item.status);
              const urgencyInfo = MaintenanceService.getUrgencyInfo(item.urgency);
              const areaLabel = MaintenanceService.getAreaLabel(item.area);

              return (
                <div key={item.id} className="p-4 hover:bg-[#FAF6EC] transition-colors space-y-3">
                  
                  {/* Top Bar: Code, Area, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {item.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-stone-200/70 px-1.5 py-0.5 rounded">
                        {areaLabel}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                      {statusInfo.label.split(' / ')[0]}
                    </span>
                  </div>

                  {/* Title and Thumbnail */}
                  <div className="flex items-start gap-2.5">
                    {item.photos && item.photos.length > 0 && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-300 shadow-sm">
                        <img
                          src={item.photos[0]}
                          alt="Foto reporte"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Location & Assigned Person Info */}
                  <div className="bg-[#F4EFE4] rounded-xl p-2.5 text-xs space-y-1 border border-[#E3DCBD]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Ubicación:</span>
                      <span className="font-bold text-slate-800">{item.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Asignado a:</span>
                      <span className="font-bold text-purple-900">
                        {item.assignedTo.name} ({item.assignedTo.cargo})
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#E7E0CE]">
                      <span className="text-slate-500 font-medium">Urgencia:</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${urgencyInfo.badgeBg} ${urgencyInfo.badgeText}`}>
                        {urgencyInfo.label.split(' (')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.advances ? item.advances.length : 0} avances registrados</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAddAdvance(item)}
                        className="px-3 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Avance</span>
                      </button>

                      <button
                        onClick={() => onViewItemDetail(item)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Footer Info */}
      <div className="p-3 sm:p-4 bg-[#F5EFE4] border-t border-[#E8E1D2] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-slate-700">Actualización en tiempo real activa en todos los dispositivos</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Mostrando {filteredItems.length} de {items.length} registros totales
        </p>
      </div>

    </div>
  );
};
