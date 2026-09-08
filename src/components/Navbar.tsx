import React from 'react';
import {
  Shield,
  Zap,
  Building2,
  Package,
  PlusCircle,
  Users,
  LogOut,
  Layers,
  Sparkles,
  Printer,
  KeyRound,
  AlertTriangle,
  HelpCircle,
  ClipboardList,
  Menu
} from 'lucide-react';
import { User, AreaType } from '../core/domain/entities';

interface NavbarProps {
  currentUser: User | null;
  activeArea: AreaType | 'ALL';
  onSelectArea: (area: AreaType | 'ALL') => void;
  onOpenNewIncident: () => void;
  onOpenReportsTable?: () => void;
  onOpenApprovalPanel: () => void;
  onOpenPrintAuthorizedModal?: () => void;
  onOpenPasswordModal?: () => void;
  onOpenArchitectureModal: () => void;
  onOpenHelpModal?: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  pendingApprovalsCount: number;
  damageReportsCount?: number;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeArea,
  onSelectArea,
  onOpenNewIncident,
  onOpenReportsTable,
  onOpenApprovalPanel,
  onOpenPrintAuthorizedModal,
  onOpenPasswordModal,
  onOpenArchitectureModal,
  onOpenHelpModal,
  onLogout,
  onOpenLogin,
  pendingApprovalsCount,
  damageReportsCount,
  onToggleMobileSidebar
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/85 border-b border-indigo-900/60 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Institution Branding */}
          <div className="flex items-center gap-3">
            {/* Sidebar Drawer Toggle Button */}
            {onToggleMobileSidebar && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                title="Abrir Menú y Barra Lateral de la Aplicación"
                className="lg:hidden p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-900/80 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-950/30"
              >
                <Menu className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 hidden sm:inline">Menú</span>
              </button>
            )}

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-purple-900/40 ring-2 ring-purple-400/30 shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">SIGMA</span>
                  <span className="text-purple-300 hidden xs:inline">Institucional</span>
                </h1>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-900/70 text-purple-200 border border-purple-500/40">
                  Hexagonal v2.0
                </span>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Firebase DB Activa
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium hidden sm:block">
                Control de Mantenimientos: Eléctricos • Estructurales • Recursos
              </p>
            </div>
          </div>

          {/* Quick Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Interactive Help & User Guide Button */}
            {onOpenHelpModal && (
              <button
                onClick={onOpenHelpModal}
                title="Abrir Manual y Guía de Uso de la Aplicación"
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-gradient-to-r from-emerald-900/90 to-teal-900/90 hover:from-emerald-800 hover:to-teal-800 text-emerald-100 hover:text-white text-xs font-bold border border-emerald-500/50 flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">Guía de Ayuda</span>
              </button>
            )}

            {/* Print / View Authorized Staff Directory */}
            {onOpenPrintAuthorizedModal && (
              <button
                onClick={onOpenPrintAuthorizedModal}
                title="Ver e Imprimir Lista de Personal Autorizado"
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Lista Autorizados</span>
              </button>
            )}

            {/* Architecture Info Button */}
            <button
              onClick={onOpenArchitectureModal}
              title="Ver especificaciones de Arquitectura Hexagonal"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 text-xs font-medium border border-indigo-500/30 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Arq. Hexagonal</span>
            </button>

            {currentUser ? (
              <>
                {/* Superior Approval Badge (Only for Superiors) */}
                {currentUser.role === 'SUPERIOR' && (
                  <button
                    onClick={onOpenApprovalPanel}
                    className="relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-purple-900/70 hover:bg-purple-800 text-purple-200 text-xs font-medium border border-purple-400/40 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-purple-300" />
                    <span className="hidden lg:inline">Aprobaciones</span>
                    {pendingApprovalsCount > 0 && (
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-rose-600 rounded-full animate-pulse">
                        {pendingApprovalsCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Tabla de Reportes Button */}
                <button
                  onClick={onOpenReportsTable || onOpenNewIncident}
                  title="Abrir Tabla y Listado Completo de Reportes de Daños"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/50 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4 text-emerald-100" />
                  <span>Tabla de Reportes</span>
                  {typeof damageReportsCount === 'number' && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-950/80 text-emerald-200 border border-emerald-400/40">
                      {damageReportsCount}
                    </span>
                  )}
                </button>

                {/* User Profile Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-700/80">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white leading-tight">
                      {currentUser.name}
                    </p>
                    <div className="flex items-center justify-end gap-1">
                      <span
                        className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                          currentUser.role === 'SUPERIOR'
                            ? 'bg-purple-950 text-purple-300 border border-purple-600/50'
                            : currentUser.role === 'ADMINISTRATIVO'
                            ? 'bg-blue-950 text-blue-300 border border-blue-600/50'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                        }`}
                      >
                        {currentUser.role}
                      </span>
                      <span className="text-[10px] text-slate-400 max-w-[120px] truncate">
                        {currentUser.department}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenPasswordModal && (
                      <button
                        onClick={onOpenPasswordModal}
                        title="Cambiar contraseña de mi cuenta institucional"
                        className="px-2.5 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-600/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                        <span className="hidden xl:inline">Cambiar Clave</span>
                      </button>
                    )}

                    <button
                      onClick={onLogout}
                      title="Cerrar sesión institucional"
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-950/60 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Ingresar / Registro</span>
              </button>
            )}
          </div>
        </div>

        {/* Areas Navigation Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 pb-2.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => onSelectArea('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeArea === 'ALL'
                ? 'bg-purple-700 text-white shadow-md shadow-purple-900/50 ring-1 ring-purple-400/50'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Gestión General (Consolidado)</span>
          </button>

          <button
            onClick={() => onSelectArea('ELECTRICOS')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeArea === 'ELECTRICOS'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60 ring-1 ring-amber-400/50'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-amber-200 border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Zonas Eléctricas</span>
          </button>

          <button
            onClick={() => onSelectArea('ESTRUCTURALES')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeArea === 'ESTRUCTURALES'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/60 ring-1 ring-blue-400/50'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-blue-200 border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>2. Estructurales & Obras</span>
          </button>

          <button
            onClick={() => onSelectArea('RECURSOS')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeArea === 'RECURSOS'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/60 ring-1 ring-emerald-400/50'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-emerald-200 border border-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. Recursos & Equipos</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('damage-reports-list-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            title="Ir directamente a la lista y bitácora de reportes de daños"
            className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/50 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shadow-sm ml-auto"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>⚠️ Bitácora de Daños</span>
          </button>
        </div>
      </div>
    </header>
  );
};
