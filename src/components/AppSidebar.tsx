import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Building2,
  Package,
  Plus,
  RefreshCw,
  Layers,
  Sparkles,
  Printer,
  KeyRound,
  AlertTriangle,
  HelpCircle,
  ClipboardList,
  BarChart3,
  CheckCircle2,
  Clock,
  LogOut,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { User, AreaType, ItemStatus, InstitutionalStats } from '../core/domain/entities';

interface AppSidebarProps {
  currentUser: User;
  activeArea: AreaType | 'ALL';
  selectedStatus: ItemStatus | 'ALL';
  stats: InstitutionalStats;
  damageReportsCount: number;
  isRefreshing: boolean;
  onSelectArea: (area: AreaType | 'ALL') => void;
  onSelectStatus: (status: ItemStatus | 'ALL') => void;
  onOpenNewIncident: () => void;
  onOpenReportsTable: () => void;
  onOpenApprovalPanel: () => void;
  onOpenPrintAuthorizedModal: () => void;
  onOpenPasswordModal: () => void;
  onOpenArchitectureModal: () => void;
  onOpenHelpModal: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  onSelectGeneral: () => void;
  // Mobile drawer controls
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentUser,
  activeArea,
  selectedStatus,
  stats,
  damageReportsCount,
  isRefreshing,
  onSelectArea,
  onSelectStatus,
  onOpenNewIncident,
  onOpenReportsTable,
  onOpenApprovalPanel,
  onOpenPrintAuthorizedModal,
  onOpenPasswordModal,
  onOpenArchitectureModal,
  onOpenHelpModal,
  onRefresh,
  onLogout,
  onSelectGeneral,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const scrollToElement = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    // Auto-close on mobile when navigating
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const handleAreaClick = (area: AreaType | 'ALL') => {
    onSelectArea(area);
    scrollToElement('institutional-maintenance-table-view');
  };

  const handleStatusFilter = (status: ItemStatus | 'ALL') => {
    onSelectStatus(status);
    scrollToElement('institutional-maintenance-table-view');
  };

  const canApproveUsers = currentUser.role === 'SUPERIOR' || currentUser.role === 'ADMINISTRATIVO';

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between text-slate-200 select-none">
      
      {/* Top Brand & Header */}
      <div className="p-4 border-b border-indigo-950/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-purple-950/60 ring-2 ring-purple-400/30 shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
                <span className="text-emerald-400">SIGMA</span>
                <span className="text-purple-300">Navegación</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  En Vivo
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  Panel Lateral
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Collapse on Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          className="hidden lg:flex p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-indigo-950 transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Close Button on Mobile */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Scrollable Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
        
        {/* Section: Acciones Rápidas */}
        <div>
          {!isCollapsed && (
            <p className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Acceso Rápido
            </p>
          )}

          <div className="space-y-1.5">
            {/* Nuevo Reporte */}
            <button
              onClick={() => {
                onOpenNewIncident();
                if (window.innerWidth < 1024) setIsMobileOpen(false);
              }}
              title="Registrar Nuevo Reporte o Incidencia"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40 ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>+ Registrar Incidencia</span>}
            </button>

            {/* Tabla de Reportes Modal */}
            <button
              onClick={() => {
                onOpenReportsTable();
                if (window.innerWidth < 1024) setIsMobileOpen(false);
              }}
              title="Ver Tabla Completa de Reportes"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4 text-emerald-400 shrink-0" />
                {!isCollapsed && <span>Tabla de Reportes</span>}
              </div>
              {!isCollapsed && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  {damageReportsCount}
                </span>
              )}
            </button>

            {/* Sincronizar Ahora */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Sincronizar base de datos ahora"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900/50 hover:bg-slate-800 text-slate-300 border border-slate-800/80 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 text-purple-400 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
              {!isCollapsed && (
                <span className="truncate">
                  {isRefreshing ? 'Sincronizando...' : 'Actualizar Datos'}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Section: Áreas de Mantenimiento */}
        <div>
          {!isCollapsed && (
            <p className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Áreas de Trabajo
            </p>
          )}

          <div className="space-y-1">
            {/* Gestión General */}
            <button
              onClick={() => {
                onSelectGeneral();
                scrollToElement('institutional-maintenance-table-view');
              }}
              title="Gestión General (Consolidado)"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeArea === 'ALL'
                  ? 'bg-purple-900/80 text-white font-bold border border-purple-500/50 shadow-md shadow-purple-950/40'
                  : 'text-slate-300 hover:bg-slate-900/70 hover:text-white'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                {!isCollapsed && <span className="truncate">Gestión General</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] text-purple-300 font-mono font-bold bg-purple-950/90 px-1.5 py-0.2 rounded border border-purple-500/30">
                  {stats.totalItems}
                </span>
              )}
            </button>

            {/* 1. Eléctricos */}
            <button
              onClick={() => handleAreaClick('ELECTRICOS')}
              title="1. Zonas Eléctricas"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeArea === 'ELECTRICOS'
                  ? 'bg-amber-950/80 text-amber-200 font-bold border border-amber-500/60 shadow-md shadow-amber-950/40'
                  : 'text-slate-300 hover:bg-slate-900/70 hover:text-amber-200'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                {!isCollapsed && <span className="truncate">1. Eléctricos</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-950/90 px-1.5 py-0.2 rounded border border-amber-500/30">
                  {stats.byArea.electricos}
                </span>
              )}
            </button>

            {/* 2. Estructurales */}
            <button
              onClick={() => handleAreaClick('ESTRUCTURALES')}
              title="2. Estructurales & Obras"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeArea === 'ESTRUCTURALES'
                  ? 'bg-blue-950/80 text-blue-200 font-bold border border-blue-500/60 shadow-md shadow-blue-950/40'
                  : 'text-slate-300 hover:bg-slate-900/70 hover:text-blue-200'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                {!isCollapsed && <span className="truncate">2. Estructurales</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] text-blue-300 font-mono font-bold bg-blue-950/90 px-1.5 py-0.2 rounded border border-blue-500/30">
                  {stats.byArea.estructurales}
                </span>
              )}
            </button>

            {/* 3. Recursos */}
            <button
              onClick={() => handleAreaClick('RECURSOS')}
              title="3. Recursos & Equipos"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeArea === 'RECURSOS'
                  ? 'bg-emerald-950/80 text-emerald-200 font-bold border border-emerald-500/60 shadow-md shadow-emerald-950/40'
                  : 'text-slate-300 hover:bg-slate-900/70 hover:text-emerald-200'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                {!isCollapsed && <span className="truncate">3. Recursos</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-950/90 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  {stats.byArea.recursos}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Section: Navegación de Secciones (Scroll Inmediato) */}
        <div>
          {!isCollapsed && (
            <p className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Vistas Principales
            </p>
          )}

          <div className="space-y-1">
            {/* Estadísticas */}
            <button
              onClick={() => scrollToElement('institutional-stats-overview')}
              title="Ir al Panel de Estadísticas e Indicadores"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900/70 hover:text-white transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Panel de Estadísticas</span>}
            </button>

            {/* Bitácora de Daños */}
            <button
              onClick={() => scrollToElement('damage-reports-list-section')}
              title="Ir a la Bitácora de Reportes de Daños"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900/70 hover:text-rose-200 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                {!isCollapsed && <span className="truncate">Bitácora de Daños</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] text-rose-400 font-bold bg-rose-950/90 px-1.5 py-0.2 rounded border border-rose-500/30">
                  {damageReportsCount}
                </span>
              )}
            </button>

            {/* Tabla General de Mantenimiento */}
            <button
              onClick={() => scrollToElement('institutional-maintenance-table-view')}
              title="Ir a la Tabla de Inventario de Mantenimiento"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900/70 hover:text-white transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Tabla de Inventario</span>}
            </button>
          </div>
        </div>

        {/* Section: Filtrar Rápido por Estado */}
        <div>
          {!isCollapsed && (
            <p className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <span>Filtro por Estado</span>
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
            </p>
          )}

          <div className="space-y-1">
            {/* Dañados */}
            <button
              onClick={() => handleStatusFilter('DANADO')}
              title="Filtrar por Dañado / Por Reparar"
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                selectedStatus === 'DANADO'
                  ? 'bg-rose-950/80 text-rose-200 font-bold border border-rose-500/60'
                  : 'text-slate-300 hover:bg-slate-900/60 hover:text-rose-300'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                {!isCollapsed && <span>Dañados / Falla</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] font-mono text-rose-400 font-bold">
                  {stats.byStatus.danado}
                </span>
              )}
            </button>

            {/* En Mantenimiento */}
            <button
              onClick={() => handleStatusFilter('EN_MANTENIMIENTO')}
              title="Filtrar por En Mantenimiento"
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                selectedStatus === 'EN_MANTENIMIENTO'
                  ? 'bg-amber-950/80 text-amber-200 font-bold border border-amber-500/60'
                  : 'text-slate-300 hover:bg-slate-900/60 hover:text-amber-300'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                {!isCollapsed && <span>En Reparación</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  {stats.byStatus.enMantenimiento}
                </span>
              )}
            </button>

            {/* Operativos */}
            <button
              onClick={() => handleStatusFilter('NUEVO_OPERATIVO')}
              title="Filtrar por Operativo / Nuevo"
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                selectedStatus === 'NUEVO_OPERATIVO'
                  ? 'bg-emerald-950/80 text-emerald-200 font-bold border border-emerald-500/60'
                  : 'text-slate-300 hover:bg-slate-900/60 hover:text-emerald-300'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                {!isCollapsed && <span>Operativos</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {stats.byStatus.nuevoOperativo}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Section: Herramientas Institucionales */}
        <div>
          {!isCollapsed && (
            <p className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Herramientas
            </p>
          )}

          <div className="space-y-1">
            {/* Directorio de Autorizados */}
            <button
              onClick={() => {
                onOpenPrintAuthorizedModal();
                if (window.innerWidth < 1024) setIsMobileOpen(false);
              }}
              title="Directorio de Personal Autorizado"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-300 hover:bg-emerald-950/60 hover:text-emerald-200 border border-emerald-900/40 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Personal Autorizado</span>}
            </button>

            {/* Aprobación Directiva (Si es Superior o Administrativo) */}
            {canApproveUsers && (
              <button
                onClick={() => {
                  onOpenApprovalPanel();
                  if (window.innerWidth < 1024) setIsMobileOpen(false);
                }}
                title="Panel de Autorización y Aprobaciones"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-purple-300 hover:bg-purple-950/60 hover:text-purple-200 border border-purple-900/40 transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-400 shrink-0" />
                  {!isCollapsed && <span className="truncate">Aprobaciones</span>}
                </div>
                {stats.pendingApprovalsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                    {stats.pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            {/* Guía y Manual */}
            <button
              onClick={() => {
                onOpenHelpModal();
                if (window.innerWidth < 1024) setIsMobileOpen(false);
              }}
              title="Guía y Manual de Uso"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-teal-300 hover:bg-teal-950/60 hover:text-teal-200 border border-teal-900/40 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <HelpCircle className="w-4 h-4 text-teal-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Guía de Ayuda</span>}
            </button>

            {/* Arquitectura Hexagonal */}
            <button
              onClick={() => {
                onOpenArchitectureModal();
                if (window.innerWidth < 1024) setIsMobileOpen(false);
              }}
              title="Arquitectura Hexagonal (DDD)"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-indigo-300 hover:bg-indigo-950/60 hover:text-indigo-200 border border-indigo-900/40 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Arq. Hexagonal</span>}
            </button>
          </div>
        </div>

      </div>

      {/* User Session and Footer */}
      <div className="p-3 border-t border-indigo-950/90 bg-slate-950/90 space-y-2">
        
        {/* User Card */}
        <div className={`p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5 ${
          isCollapsed ? 'justify-center p-1.5' : ''
        }`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-black text-xs text-white shrink-0 shadow-inner">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded ${
                    currentUser.role === 'SUPERIOR'
                      ? 'bg-purple-950 text-purple-300 border border-purple-600/50'
                      : currentUser.role === 'ADMINISTRATIVO'
                      ? 'bg-blue-950 text-blue-300 border border-blue-600/50'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  }`}
                >
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {currentUser.department}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons: Change Password & Logout */}
        <div className={`grid gap-1.5 ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <button
            onClick={() => {
              onOpenPasswordModal();
              if (window.innerWidth < 1024) setIsMobileOpen(false);
            }}
            title="Cambiar contraseña de mi cuenta"
            className="w-full py-1.5 px-2 rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-800/40 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            {!isCollapsed && <span>Clave</span>}
          </button>

          <button
            onClick={onLogout}
            title="Cerrar sesión institucional"
            className="w-full py-1.5 px-2 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/40 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            {!isCollapsed && <span>Salir</span>}
          </button>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed / Sticky Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-950/95 border-r border-indigo-950/80 backdrop-blur-xl h-screen sticky top-0 shrink-0 z-30 transition-all duration-300 shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64 xl:w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 transition-opacity animate-in fade-in"
        />
      )}

      {/* 3. Mobile Slide-Over Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-950 border-r border-indigo-950 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
