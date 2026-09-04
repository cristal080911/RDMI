import React, { useState } from 'react';
import {
  X,
  ClipboardList,
  AlertTriangle,
  Zap,
  Building2,
  Package,
  Search,
  Plus,
  Printer,
  Calendar,
  MapPin,
  UserCheck,
  CheckCircle2,
  Clock,
  Wrench,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DamageReport, AreaType, UrgencyLevel, User } from '../core/domain/entities';

interface ReportsTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  damageReports: DamageReport[];
  onOpenNewIncident: () => void;
  onUpdateReportStatus?: (
    reportId: string,
    newStatus: 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO',
    solutionNotes?: string
  ) => Promise<void>;
  onViewItemDetail?: (itemId: string) => void;
  currentUser: User | null;
  onScrollToSection?: () => void;
}

export const ReportsTableModal: React.FC<ReportsTableModalProps> = ({
  isOpen,
  onClose,
  damageReports,
  onOpenNewIncident,
  onUpdateReportStatus,
  onViewItemDetail,
  currentUser,
  onScrollToSection
}) => {
  const [selectedArea, setSelectedArea] = useState<AreaType | 'ALL'>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Quick resolution dialog state
  const [resolvingReport, setResolvingReport] = useState<DamageReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  // Filter damage reports
  const filteredReports = damageReports.filter((report) => {
    if (selectedArea !== 'ALL' && report.area !== selectedArea) return false;
    if (selectedUrgency !== 'ALL' && report.urgency !== selectedUrgency) return false;
    if (selectedStatus !== 'ALL' && report.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        report.title.toLowerCase().includes(q) ||
        report.reportCode.toLowerCase().includes(q) ||
        (report.itemCode && report.itemCode.toLowerCase().includes(q)) ||
        report.damageDescription.toLowerCase().includes(q) ||
        report.location.toLowerCase().includes(q) ||
        report.assignedTo.name.toLowerCase().includes(q) ||
        report.reportedBy.name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate metrics
  const totalPending = damageReports.filter((r) => r.status === 'PENDIENTE').length;
  const totalInRepair = damageReports.filter((r) => r.status === 'EN_REPARACION').length;
  const totalResolved = damageReports.filter((r) => r.status === 'RESUELTO').length;
  const totalUrgent = damageReports.filter(
    (r) => r.urgency === 'URGENTE' && r.status !== 'RESUELTO'
  ).length;

  const handleConfirmResolution = async () => {
    if (!resolvingReport || !onUpdateReportStatus) return;
    setIsUpdating(true);
    try {
      await onUpdateReportStatus(
        resolvingReport.id,
        'RESUELTO',
        resolutionNotes.trim() || 'Reporte de daño atendido y resuelto satisfactoriamente.'
      );
      setResolvingReport(null);
      setResolutionNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const getAreaBadge = (area: AreaType) => {
    switch (area) {
      case 'ELECTRICOS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
            <Zap className="w-3 h-3 text-amber-700" />
            Eléctricos
          </span>
        );
      case 'ESTRUCTURALES':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 whitespace-nowrap">
            <Building2 className="w-3 h-3 text-blue-700" />
            Estructurales
          </span>
        );
      case 'RECURSOS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap">
            <Package className="w-3 h-3 text-emerald-700" />
            Recursos
          </span>
        );
    }
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'URGENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            URGENTE
          </span>
        );
      case 'IMPORTANTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
            🟡 Importante
          </span>
        );
      case 'NADA_URGENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300 whitespace-nowrap">
            ⚪ Baja Prioridad
          </span>
        );
    }
  };

  const getStatusBadge = (status: 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO') => {
    switch (status) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-sm whitespace-nowrap">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      case 'EN_REPARACION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-sm whitespace-nowrap">
            <Wrench className="w-3 h-3" />
            En Arreglo
          </span>
        );
      case 'RESUELTO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-sm whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" />
            Resuelto
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#FDFBF7] rounded-3xl border-2 border-[#DCD3BE] shadow-2xl shadow-slate-950/40 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#F5EFEB] via-[#F8F5EE] to-[#EFE7D8] border-b border-[#E3D9C4] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/20">
              <ClipboardList className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-purple-950 tracking-tight">
                  Tabla de Reportes Institucionales
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {damageReports.length} reportes registrados
                </span>
                {totalUrgent > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300 animate-pulse">
                    ⚠️ {totalUrgent} urgentes
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Listado consolidado de todas las averías, daños e incidentes reportados en las tres áreas institucionales.
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNewIncident();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/30 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Reportar Daño / Nuevo</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              title="Imprimir Listado de Reportes"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#D5CAA8] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Cerrar ventana"
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-[#D5CAA8] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="bg-[#FAF7F0] px-4 sm:px-6 py-2.5 border-b border-[#ECE5D8] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold flex-wrap">
            <span className="text-slate-500">Métricas:</span>
            <span className="inline-flex items-center gap-1.5 text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              {totalPending} Pendientes
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {totalInRepair} En Arreglo
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              {totalResolved} Resueltos
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#DDD5C2] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-purple-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vista Tabla
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                viewMode === 'CARDS' ? 'bg-purple-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vista Tarjetas
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 sm:p-5 bg-white/70 border-b border-[#ECE5D8] shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Search Input */}
            <div className="sm:col-span-6 lg:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código, título, aula, reportante o daño..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/40 placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* Filter Area */}
            <div className="sm:col-span-6 lg:col-span-3">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value as AreaType | 'ALL')}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/40 shadow-sm cursor-pointer"
              >
                <option value="ALL">🏢 Todas las Áreas</option>
                <option value="ELECTRICOS">⚡ Eléctricos</option>
                <option value="ESTRUCTURALES">🏛️ Estructurales</option>
                <option value="RECURSOS">📦 Recursos</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="sm:col-span-6 lg:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/40 shadow-sm cursor-pointer"
              >
                <option value="ALL">🔍 Todo Estado</option>
                <option value="PENDIENTE">🔴 Pendiente</option>
                <option value="EN_REPARACION">🟡 En Arreglo</option>
                <option value="RESUELTO">🟢 Resuelto</option>
              </select>
            </div>

            {/* Filter Urgency */}
            <div className="sm:col-span-6 lg:col-span-2">
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value as UrgencyLevel | 'ALL')}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/40 shadow-sm cursor-pointer"
              >
                <option value="ALL">⚡ Toda Urgencia</option>
                <option value="URGENTE">🚨 Urgente</option>
                <option value="IMPORTANTE">🟡 Importante</option>
                <option value="NADA_URGENTE">⚪ Baja Prioridad</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body: List of Reports */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF7F0]/40">
          
          {filteredReports.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-[#DCD3BE] my-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {damageReports.length === 0
                  ? 'No hay reportes de daños registrados aún'
                  : 'No se encontraron reportes con los filtros seleccionados'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                {damageReports.length === 0
                  ? 'Todos los elementos se encuentran en estado óptimo o no se han cargado incidencias al sistema.'
                  : 'Prueba modificando la búsqueda o seleccionando "Todas las Áreas" y "Todo Estado".'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewIncident();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primer Reporte de Daño</span>
              </button>
            </div>
          ) : viewMode === 'TABLE' ? (
            
            /* Table View */
            <div className="overflow-x-auto bg-white rounded-2xl border border-[#E3D9C4] shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#ECE5D8] bg-[#F7F3EA] text-slate-700 text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-3.5">Código & Fecha</th>
                    <th className="py-3 px-3.5">Área</th>
                    <th className="py-3 px-3.5">Daño / Título</th>
                    <th className="py-3 px-3.5">Ubicación</th>
                    <th className="py-3 px-3.5">Reportado por</th>
                    <th className="py-3 px-3.5">Urgencia</th>
                    <th className="py-3 px-3.5">Estado</th>
                    <th className="py-3 px-3.5 text-center">Foto</th>
                    <th className="py-3 px-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE5D8] text-xs">
                  {filteredReports.map((report) => {
                    const hasPhoto = Boolean(report.evidencePhoto || (report.photos && report.photos.length > 0));
                    const photoSrc = report.evidencePhoto || (report.photos && report.photos[0]);

                    return (
                      <tr key={report.id} className="hover:bg-[#FBF9F4] transition-colors">
                        <td className="py-3 px-3.5">
                          <span className="font-mono font-black text-purple-950 text-xs block">
                            {report.reportCode}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(report.createdAt).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>

                        <td className="py-3 px-3.5">
                          {getAreaBadge(report.area)}
                        </td>

                        <td className="py-3 px-3.5 max-w-[220px]">
                          <p className="font-bold text-slate-900 line-clamp-1">
                            {report.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {report.damageDescription}
                          </p>
                        </td>

                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            {report.location}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <p className="font-semibold text-slate-800">
                            {report.reportedBy.name}
                          </p>
                          <span className="text-[10px] text-slate-500">
                            {report.reportedBy.role}
                          </span>
                        </td>

                        <td className="py-3 px-3.5">
                          {getUrgencyBadge(report.urgency)}
                        </td>

                        <td className="py-3 px-3.5">
                          {getStatusBadge(report.status)}
                        </td>

                        <td className="py-3 px-3.5 text-center">
                          {hasPhoto && photoSrc ? (
                            <button
                              type="button"
                              onClick={() => setSelectedPhoto(photoSrc)}
                              title="Ver foto del reporte"
                              className="relative inline-block w-8 h-8 rounded-lg overflow-hidden border border-[#D5CAA8] shadow-sm hover:ring-2 hover:ring-purple-600 transition-all cursor-pointer"
                            >
                              <img
                                src={photoSrc}
                                alt="Evidencia"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic">
                              Sin foto
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {report.status !== 'RESUELTO' && onUpdateReportStatus && (
                              <button
                                type="button"
                                onClick={() => {
                                  setResolvingReport(report);
                                  setResolutionNotes('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                              >
                                Resolver
                              </button>
                            )}

                            {report.itemId && onViewItemDetail && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onViewItemDetail(report.itemId!);
                                }}
                                title="Ver elemento en inventario"
                                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((report) => {
                const hasPhoto = Boolean(report.evidencePhoto || (report.photos && report.photos.length > 0));
                const photoSrc = report.evidencePhoto || (report.photos && report.photos[0]);

                return (
                  <div
                    key={report.id}
                    className="p-4 rounded-2xl bg-white border border-[#E3D9C4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      {/* Top Bar inside Card */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-purple-950 text-xs">
                            {report.reportCode}
                          </span>
                          {getAreaBadge(report.area)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {getUrgencyBadge(report.urgency)}
                          {getStatusBadge(report.status)}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-sm font-black text-slate-900 leading-snug mb-1">
                        {report.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                        {report.damageDescription}
                      </p>

                      {/* Photo Thumbnail if any */}
                      {hasPhoto && photoSrc && (
                        <div className="mb-3">
                          <button
                            type="button"
                            onClick={() => setSelectedPhoto(photoSrc)}
                            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors w-full text-left cursor-pointer"
                          >
                            <img
                              src={photoSrc}
                              alt="Evidencia"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-300 shrink-0"
                            />
                            <div className="truncate">
                              <span className="text-[11px] font-bold text-slate-800 block">
                                Evidencia fotográfica adjunta
                              </span>
                              <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-0.5">
                                <ExternalLink className="w-3 h-3" />
                                Clic para ampliar imagen
                              </span>
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#ECE5D8]">
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{report.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{new Date(report.createdAt).toLocaleDateString('es-CO')}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1 text-slate-600">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            Reportado por: <strong>{report.reportedBy.name}</strong> ({report.reportedBy.role})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-3 pt-2.5 border-t border-[#ECE5D8] flex items-center justify-between gap-2">
                      {report.itemId && onViewItemDetail && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onViewItemDetail(report.itemId!);
                          }}
                          className="text-[11px] font-bold text-purple-900 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver en Inventario</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {report.status !== 'RESUELTO' && onUpdateReportStatus && (
                        <button
                          type="button"
                          onClick={() => {
                            setResolvingReport(report);
                            setResolutionNotes('');
                          }}
                          className="ml-auto px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          Marcar Resuelto
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-[#F5EFEB] border-t border-[#E3D9C4] flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-600 font-medium">
            Mostrando <strong>{filteredReports.length}</strong> de <strong>{damageReports.length}</strong> reportes institucionales.
          </div>

          <div className="flex items-center gap-2">
            {onScrollToSection && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onScrollToSection();
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#D5CAA8] text-xs font-bold transition-all cursor-pointer"
              >
                Ver en panel principal
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>

      {/* Photo Zoom Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-3xl max-h-[85vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto}
              alt="Evidencia ampliada"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <p className="text-white text-xs mt-3 font-semibold">
              Foto de evidencia institucional del reporte de daño
            </p>
          </div>
        </div>
      )}

      {/* Quick Resolution Dialog */}
      {resolvingReport && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Resolver Reporte: {resolvingReport.reportCode}
                  </h3>
                  <p className="text-xs text-slate-500">{resolvingReport.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResolvingReport(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Al marcar este reporte como <strong>Resuelto</strong>, quedará registrado en el historial de mantenimiento y se notificará que la avería fue subsanada.
            </p>

            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notas de la Solución o Reparación (opcional):
            </label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describa el trabajo realizado para reparar el daño..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setResolvingReport(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmResolution}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? 'Guardando...' : 'Confirmar y Resolver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
