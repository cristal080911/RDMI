import React, { useState } from 'react';
import {
  AlertTriangle,
  Zap,
  Building2,
  Package,
  Clock,
  CheckCircle2,
  Wrench,
  Search,
  Filter,
  Plus,
  Printer,
  ChevronDown,
  ChevronUp,
  MapPin,
  UserCheck,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Check,
  RefreshCw
} from 'lucide-react';
import { DamageReport, AreaType, UrgencyLevel, User } from '../core/domain/entities';

interface DamageReportsSectionProps {
  damageReports: DamageReport[];
  onOpenNewIncident: () => void;
  onUpdateReportStatus: (
    reportId: string,
    newStatus: 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO',
    solutionNotes?: string
  ) => Promise<void>;
  onViewItemDetail?: (itemId: string) => void;
  currentUser: User | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DamageReportsSection: React.FC<DamageReportsSectionProps> = ({
  damageReports,
  onOpenNewIncident,
  onUpdateReportStatus,
  onViewItemDetail,
  currentUser,
  onRefresh,
  isRefreshing = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedArea, setSelectedArea] = useState<AreaType | 'ALL'>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Quick resolution modal/dialog state
  const [resolvingReport, setResolvingReport] = useState<DamageReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Calculate quick metrics
  const totalPending = damageReports.filter((r) => r.status === 'PENDIENTE').length;
  const totalInRepair = damageReports.filter((r) => r.status === 'EN_REPARACION').length;
  const totalResolved = damageReports.filter((r) => r.status === 'RESUELTO').length;
  const totalUrgent = damageReports.filter(
    (r) => r.urgency === 'URGENTE' && r.status !== 'RESUELTO'
  ).length;

  const handleConfirmResolution = async () => {
    if (!resolvingReport) return;
    setIsUpdating(true);
    try {
      await onUpdateReportStatus(
        resolvingReport.id,
        'RESUELTO',
        resolutionNotes.trim() || 'Daño reparado e inspeccionado satisfactoriamente.'
      );
      setResolvingReport(null);
      setResolutionNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrintDamageList = () => {
    window.print();
  };

  const getAreaBadge = (area: AreaType) => {
    switch (area) {
      case 'ELECTRICOS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Zap className="w-3 h-3 text-amber-700" />
            Eléctricos
          </span>
        );
      case 'ESTRUCTURALES':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <Building2 className="w-3 h-3 text-blue-700" />
            Estructurales
          </span>
        );
      case 'RECURSOS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            URGENTE
          </span>
        );
      case 'IMPORTANTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            🟡 Importante
          </span>
        );
      case 'NADA_URGENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
            ⚪ Baja Prioridad
          </span>
        );
    }
  };

  const getStatusBadge = (status: 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO') => {
    switch (status) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-sm">
            <AlertTriangle className="w-3 h-3" />
            Pendiente de Arreglo
          </span>
        );
      case 'EN_REPARACION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-sm">
            <Wrench className="w-3 h-3" />
            En Reparación
          </span>
        );
      case 'RESUELTO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            Solucionado
          </span>
        );
    }
  };

  return (
    <div id="damage-reports-list-section" className="mb-8 scroll-mt-6">
      {/* Main Container Card (Warm Beige Aesthetic) */}
      <div className="bg-[#FDFBF7] rounded-2xl border-2 border-[#DCD3BE] shadow-xl shadow-slate-950/20 overflow-hidden">
        
        {/* Header Ribbon / Section Bar */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#F5EFEB] via-[#F8F5EE] to-[#EFE7D8] border-b border-[#E3D9C4] flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-950/20">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300">
                  Lista Oficial Separada
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-purple-950 tracking-tight">
                  Bitácora y Reportes de Daños Institucionales
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Seguimiento focalizado e independiente de todas las averías, daños estructurales y fallas registradas antes de las tablas generales.
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Sincronizar lista de daños"
                className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#D5CAA8] text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-700 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline">Sincronizar</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrintDamageList}
              title="Imprimir / Exportar lista de reportes de daños"
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#D5CAA8] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimir Lista</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewIncident}
              className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs sm:text-sm font-black shadow-md shadow-rose-900/30 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Reporte de Daño</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Contraer lista de daños' : 'Expandir lista de daños'}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-[#D5CAA8] transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Strips (Placed Above Content) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#ECE3D2] border-b border-[#E3D9C4] bg-[#FAF7F0] text-slate-800">
          <div
            onClick={() => setSelectedStatus(selectedStatus === 'PENDIENTE' ? 'ALL' : 'PENDIENTE')}
            className={`p-3 sm:p-4 text-center cursor-pointer transition-colors hover:bg-rose-50/60 ${
              selectedStatus === 'PENDIENTE' ? 'bg-rose-50 border-b-2 border-rose-600' : ''
            }`}
          >
            <div className="text-xl sm:text-2xl font-black text-rose-700">{totalPending}</div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              Daños Pendientes
            </div>
          </div>

          <div
            onClick={() => setSelectedStatus(selectedStatus === 'EN_REPARACION' ? 'ALL' : 'EN_REPARACION')}
            className={`p-3 sm:p-4 text-center cursor-pointer transition-colors hover:bg-amber-50/60 ${
              selectedStatus === 'EN_REPARACION' ? 'bg-amber-50 border-b-2 border-amber-500' : ''
            }`}
          >
            <div className="text-xl sm:text-2xl font-black text-amber-700">{totalInRepair}</div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              En Reparación / Taller
            </div>
          </div>

          <div
            onClick={() => setSelectedUrgency(selectedUrgency === 'URGENTE' ? 'ALL' : 'URGENTE')}
            className={`p-3 sm:p-4 text-center cursor-pointer transition-colors hover:bg-rose-50/60 ${
              selectedUrgency === 'URGENTE' ? 'bg-rose-50 border-b-2 border-rose-600' : ''
            }`}
          >
            <div className="text-xl sm:text-2xl font-black text-rose-600">{totalUrgent}</div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              Atención Urgente
            </div>
          </div>

          <div
            onClick={() => setSelectedStatus(selectedStatus === 'RESUELTO' ? 'ALL' : 'RESUELTO')}
            className={`p-3 sm:p-4 text-center cursor-pointer transition-colors hover:bg-emerald-50/60 ${
              selectedStatus === 'RESUELTO' ? 'bg-emerald-50 border-b-2 border-emerald-600' : ''
            }`}
          >
            <div className="text-xl sm:text-2xl font-black text-emerald-700">{totalResolved}</div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Daños Solucionados
            </div>
          </div>
        </div>

        {/* Collapsible Content Area */}
        {isExpanded && (
          <div className="p-4 sm:p-6">
            
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between pb-5 border-b border-[#E8DFC9]">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar daño por código (REP-DAN-...), avería, aula, o responsable..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#D5CAA8] text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-600 transition-all shadow-inner"
                />
              </div>

              {/* Filter Selects & View Toggle */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                
                {/* Area Filter */}
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value as AreaType | 'ALL')}
                  className="px-3 py-2 rounded-xl bg-white border border-[#D5CAA8] text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600/40 cursor-pointer shadow-inner"
                >
                  <option value="ALL">🏢 Todas las Áreas</option>
                  <option value="ELECTRICOS">⚡ Eléctricos</option>
                  <option value="ESTRUCTURALES">🏢 Estructurales</option>
                  <option value="RECURSOS">📦 Recursos</option>
                </select>

                {/* Urgency Filter */}
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value as UrgencyLevel | 'ALL')}
                  className="px-3 py-2 rounded-xl bg-white border border-[#D5CAA8] text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600/40 cursor-pointer shadow-inner"
                >
                  <option value="ALL">🎯 Toda Urgencia</option>
                  <option value="URGENTE">🔴 Urgente</option>
                  <option value="IMPORTANTE">🟡 Importante</option>
                  <option value="NADA_URGENTE">⚪ Nada Urgente</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as 'ALL' | 'PENDIENTE' | 'EN_REPARACION' | 'RESUELTO')
                  }
                  className="px-3 py-2 rounded-xl bg-white border border-[#D5CAA8] text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600/40 cursor-pointer shadow-inner"
                >
                  <option value="ALL">📋 Todos los Estados</option>
                  <option value="PENDIENTE">🔴 Pendiente</option>
                  <option value="EN_REPARACION">🟡 En Reparación</option>
                  <option value="RESUELTO">🟢 Solucionado</option>
                </select>

                {/* Mode Selector */}
                <div className="flex rounded-xl bg-[#EDE6D4] p-0.5 border border-[#D5CAA8]">
                  <button
                    type="button"
                    onClick={() => setViewMode('CARDS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'CARDS'
                        ? 'bg-white text-purple-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tarjetas
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('TABLE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'TABLE'
                        ? 'bg-white text-purple-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tabla
                  </button>
                </div>
              </div>
            </div>

            {/* List Result Counter */}
            <div className="py-2.5 flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>
                Mostrando <strong className="text-purple-950 font-black">{filteredReports.length}</strong> reportes de daño en la lista
              </span>
              {(selectedArea !== 'ALL' || selectedUrgency !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedArea('ALL');
                    setSelectedUrgency('ALL');
                    setSelectedStatus('ALL');
                    setSearchQuery('');
                  }}
                  className="text-purple-800 hover:underline font-bold"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>

            {/* If Empty */}
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white/70 rounded-2xl border border-dashed border-[#DDD2B8] mt-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  No hay reportes de daños con los filtros seleccionados
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Todas las averías se encuentran solventadas o no coinciden con la búsqueda actual.
                </p>
                <button
                  type="button"
                  onClick={onOpenNewIncident}
                  className="mt-4 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Reportar Nuevo Daño Ahora</span>
                </button>
              </div>
            ) : viewMode === 'CARDS' ? (
              
              /* CARD VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className={`bg-white rounded-2xl border ${
                      report.status === 'PENDIENTE'
                        ? 'border-rose-300 shadow-rose-950/5'
                        : report.status === 'EN_REPARACION'
                        ? 'border-amber-300 shadow-amber-950/5'
                        : 'border-emerald-300 shadow-emerald-950/5'
                    } p-4 sm:p-5 shadow-md flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden`}
                  >
                    {/* Top Status Strip */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 ${
                        report.status === 'PENDIENTE'
                          ? 'bg-rose-600'
                          : report.status === 'EN_REPARACION'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                    />

                    <div>
                      {/* Tags & Code */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-slate-900 text-purple-200">
                            {report.reportCode}
                          </span>
                          {getAreaBadge(report.area)}
                        </div>
                        {getUrgencyBadge(report.urgency)}
                      </div>

                      {/* Title & Damage Description */}
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight line-clamp-2">
                        {report.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-normal mt-1.5 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        {report.damageDescription}
                      </p>

                      {/* Location & Reported Info */}
                      <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span className="truncate">{report.location}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-600">
                          <UserCheck className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span className="truncate">
                            Reportado por: <strong>{report.reportedBy.name}</strong> ({report.reportedBy.roleTitle})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Wrench className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">
                            Asignado a: <strong>{report.assignedTo.name}</strong> - {report.assignedTo.cargo}
                          </span>
                        </div>
                      </div>

                      {/* Photo Evidence Thumbnail Preview */}
                      {report.photos && report.photos.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>Evidencias fotográficas ({report.photos.length}):</span>
                          </div>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {report.photos.map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt="Evidencia de daño"
                                onClick={() => setSelectedPhoto(img)}
                                className="w-12 h-12 rounded-lg object-cover border border-slate-300 hover:scale-105 transition-transform cursor-pointer shadow-xs"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Solution Note if Resolved */}
                      {report.status === 'RESUELTO' && report.solutionNotes && (
                        <div className="mt-3 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                          <strong>Solución registrada:</strong> {report.solutionNotes}
                        </div>
                      )}
                    </div>

                    {/* Bottom Status & Quick Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div>{getStatusBadge(report.status)}</div>

                      <div className="flex items-center gap-1.5">
                        {report.status !== 'RESUELTO' ? (
                          <div className="flex items-center gap-1">
                            {report.status === 'PENDIENTE' && (
                              <button
                                type="button"
                                onClick={() => onUpdateReportStatus(report.id, 'EN_REPARACION')}
                                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 transition-colors cursor-pointer"
                              >
                                En Reparación
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setResolvingReport(report);
                                setResolutionNotes('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Marcar Resuelto</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onUpdateReportStatus(report.id, 'PENDIENTE')}
                            className="text-[11px] text-slate-500 hover:text-rose-700 font-semibold underline cursor-pointer"
                          >
                            Reabrir Reporte
                          </button>
                        )}

                        {report.itemId && onViewItemDetail && (
                          <button
                            type="button"
                            onClick={() => onViewItemDetail(report.itemId!)}
                            title="Ver ficha completa en inventario"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              
              /* TABLE VIEW */
              <div className="mt-3 overflow-x-auto rounded-xl border border-[#D5CAA8] bg-white shadow-inner">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-[#F6F1E3] text-purple-950 font-black uppercase text-[11px] border-b border-[#D5CAA8]">
                    <tr>
                      <th className="p-3">Código</th>
                      <th className="p-3">Área</th>
                      <th className="p-3">Descripción del Daño</th>
                      <th className="p-3">Ubicación</th>
                      <th className="p-3">Urgencia</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Responsable</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE2CF]">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-[#FCFAF5] transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {report.reportCode}
                        </td>
                        <td className="p-3 whitespace-nowrap">{getAreaBadge(report.area)}</td>
                        <td className="p-3 max-w-xs">
                          <div className="font-bold text-slate-900 line-clamp-1">{report.title}</div>
                          <div className="text-slate-500 text-[11px] line-clamp-2">{report.damageDescription}</div>
                        </td>
                        <td className="p-3 whitespace-nowrap text-slate-700 font-medium">
                          {report.location}
                        </td>
                        <td className="p-3 whitespace-nowrap">{getUrgencyBadge(report.urgency)}</td>
                        <td className="p-3 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                        <td className="p-3 whitespace-nowrap text-slate-700">
                          <div className="font-semibold">{report.assignedTo.name}</div>
                          <div className="text-[10px] text-slate-500">{report.assignedTo.cargo}</div>
                        </td>
                        <td className="p-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {report.status !== 'RESUELTO' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setResolvingReport(report);
                                  setResolutionNotes('');
                                }}
                                className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Resolver
                              </button>
                            ) : (
                              <span className="text-emerald-700 font-bold text-[11px]">✓ Reparado</span>
                            )}
                            {report.itemId && onViewItemDetail && (
                              <button
                                type="button"
                                onClick={() => onViewItemDetail(report.itemId!)}
                                className="p-1 rounded bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-900"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RESOLUTION DIALOG MODAL */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border-2 border-emerald-500 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 text-emerald-800 mb-3">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-black tracking-tight">
                Marcar Daño como Solucionado
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 mb-3">
              Reporte: <strong className="text-slate-900">{resolvingReport.reportCode}</strong> - {resolvingReport.title}
            </p>

            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notas de Intervención Técnica o Reparación Realizada:
            </label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Ej: Se cambió el interruptor averiado y se verificó el voltaje con multímetro. Queda 100% operativo."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setResolvingReport(null)}
                disabled={isUpdating}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmResolution}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black shadow-md transition-all flex items-center gap-1 cursor-pointer"
              >
                {isUpdating ? 'Guardando...' : 'Confirmar y Guardar Solución'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700 relative">
            <img
              src={selectedPhoto}
              alt="Evidencia ampliada"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 px-3 py-1 bg-black/70 hover:bg-black text-white text-xs font-bold rounded-lg"
            >
              Cerrar (✕)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
