/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Zap,
  Building2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

import {
  MaintenanceItem,
  AreaType,
  ItemStatus,
  UrgencyLevel,
  User,
  InstitutionalStats
} from './core/domain/entities';
import { ApiClient } from './adapters/api/apiClient';
import { MaintenanceService } from './application/useCases';

import { Navbar } from './components/Navbar';
import { StatsDashboard } from './components/StatsDashboard';
import { AreaTableView } from './components/AreaTableView';
import { NewIncidentModal } from './components/NewIncidentModal';
import { ProgressModal } from './components/ProgressModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AuthModal } from './components/AuthModal';
import { SuperiorApprovalPanel } from './components/SuperiorApprovalPanel';
import { HexagonalArchitectureModal } from './components/HexagonalArchitectureModal';
import { LoginView } from './components/LoginView';

export default function App() {
  // Authentication State: defaults to null if not stored in localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sigma_institutional_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Maintenance Data State
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [stats, setStats] = useState<InstitutionalStats>({
    totalItems: 0,
    byArea: { electricos: 0, estructurales: 0, recursos: 0 },
    byStatus: { danado: 0, enMantenimiento: 0, nuevoOperativo: 0 },
    byUrgency: { urgente: 0, importante: 0, nadaUrgente: 0 },
    recentAdvancesCount: 0,
    pendingApprovalsCount: 0
  });

  // Filtering and Search State
  const [activeArea, setActiveArea] = useState<AreaType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | 'ALL'>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals Visibility State
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isApprovalPanelOpen, setIsApprovalPanelOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Selected Item for Detail / Advance Modal
  const [activeSelectedItem, setActiveSelectedItem] = useState<MaintenanceItem | null>(null);

  // Loading and Sync State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Load Data from API
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [fetchedItems, fetchedStats] = await Promise.all([
        ApiClient.getMaintenanceItems(),
        ApiClient.getStats()
      ]);
      if (Array.isArray(fetchedItems)) {
        setItems(fetchedItems);
      }
      if (fetchedStats && typeof fetchedStats === 'object') {
        setStats(fetchedStats);
      }
    } catch (err: any) {
      console.warn('Sincronización en segundo plano completada con datos institucionales locales.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial Load & Multi-device Live Polling (every 8 seconds)
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle Login
  const handleLogin = async (username: string, pass: string) => {
    const res = await ApiClient.login(username, pass);
    setCurrentUser(res.user);
    localStorage.setItem('sigma_institutional_user', JSON.stringify(res.user));
    await fetchData();
    return res.user;
  };

  // Handle Register
  const handleRegister = async (payload: any) => {
    const res = await ApiClient.register(payload);
    await fetchData();
    return res;
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sigma_institutional_user');
  };

  // Handle Creating New Maintenance Item
  const handleCreateItem = async (itemData: any) => {
    const created = await ApiClient.createMaintenanceItem({
      ...itemData,
      reportedBy: currentUser ? {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        roleTitle: currentUser.roleTitle
      } : {
        id: 'usr_anon',
        name: 'Personal Institucional',
        role: 'DOCENTE',
        roleTitle: 'Docente'
      }
    });

    setSyncFeedback(`Reporte ${created.code} guardado exitosamente.`);
    setTimeout(() => setSyncFeedback(null), 4000);
    await fetchData();
  };

  // Handle Adding Progress Advance
  const handleAddAdvance = async (advanceData: any) => {
    if (!activeSelectedItem) return;
    const res = await ApiClient.addProgressAdvance(activeSelectedItem.id, advanceData);
    setActiveSelectedItem(res.item);
    setSyncFeedback(`Avance registrado para ${res.item.code}.`);
    setTimeout(() => setSyncFeedback(null), 4000);
    await fetchData();
  };

  // Handle Superior User Approval
  const handleApproveUser = async (userId: string, approve: boolean, newRole?: any) => {
    await ApiClient.approveUser(userId, approve, currentUser?.name || 'Directivo Superior', newRole);
    await fetchData();
  };

  const handleRefreshUsers = async () => {
    const [pending, all] = await Promise.all([
      ApiClient.getPendingUsers(),
      ApiClient.getAllUsers()
    ]);
    return { pending, all };
  };

  // IF NOT AUTHENTICATED: Display the Institutional Login & Registration Screen First
  if (!currentUser) {
    return (
      <>
        <LoginView
          onLogin={handleLogin}
          onRegister={handleRegister}
          onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        />
        <HexagonalArchitectureModal
          isOpen={isArchitectureModalOpen}
          onClose={() => setIsArchitectureModalOpen(false)}
        />
      </>
    );
  }

  // IF AUTHENTICATED: Display the Full Main Dashboard & Maintenance Areas
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#131131] to-[#2e0854] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      
      {/* Sticky Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeArea={activeArea}
        onSelectArea={(area) => setActiveArea(area)}
        onOpenNewIncident={() => setIsNewIncidentOpen(true)}
        onOpenApprovalPanel={() => setIsApprovalPanelOpen(true)}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        onLogout={handleLogout}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        pendingApprovalsCount={stats.pendingApprovalsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        
        {/* Pending Approvals Notice Banner for Superiors & Admins */}
        {(currentUser.role === 'SUPERIOR' || currentUser.role === 'ADMINISTRATIVO') && stats.pendingApprovalsCount > 0 && (
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 border-2 border-purple-400 text-white text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span>
                👑 Hay <strong className="text-amber-300 underline">{stats.pendingApprovalsCount} solicitud(es) de registro</strong> de personal institucional esperando tu revisión y aprobación.
              </span>
            </div>
            <button
              onClick={() => setIsApprovalPanelOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              Revisar y Autorizar Personal
            </button>
          </div>
        )}

        {/* Sync / Live Status Alert */}
        {syncFeedback && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{syncFeedback}</span>
            </div>
            <button onClick={() => setSyncFeedback(null)} className="text-emerald-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Hero Section & Area Summary */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Gestión Institucional en Vivo
              </span>
              <span className="flex items-center gap-1 text-[11px] text-purple-300 font-semibold bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Sincronizado Multi-dispositivo
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
              Control de Daños, Mantenimientos y Recursos
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
              Supervisión de zonas eléctricas, infraestructura estructural y equipamiento para docentes, administrativos y directivos.
            </p>
          </div>

          {/* Quick Refresh & Quick New Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData()}
              disabled={isRefreshing}
              title="Actualizar tablas ahora"
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 text-purple-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={() => setIsNewIncidentOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Reporte</span>
            </button>
          </div>
        </div>

        {/* Dashboard Statistics Overview (Warm Beige Containers) */}
        <StatsDashboard
          stats={stats}
          onFilterByStatus={(st) => setSelectedStatus(st)}
          onSelectArea={(ar) => setActiveArea(ar)}
        />

        {/* Interactive Maintenance Tables (Beige Container) */}
        <AreaTableView
          items={items}
          currentArea={activeArea}
          selectedStatus={selectedStatus}
          selectedUrgency={selectedUrgency}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onStatusChange={setSelectedStatus}
          onUrgencyChange={setSelectedUrgency}
          onViewItemDetail={(item) => {
            setActiveSelectedItem(item);
            setIsDetailModalOpen(true);
          }}
          onAddAdvance={(item) => {
            setActiveSelectedItem(item);
            setIsProgressModalOpen(true);
          }}
          onOpenNewIncident={() => setIsNewIncidentOpen(true)}
          currentUser={currentUser}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-950/80 bg-slate-950/90 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-900/60 flex items-center justify-center text-purple-300">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-200">
              Sistema de Mantenimiento Institucional
            </span>
            <span className="text-[11px] text-slate-400">
              • Arquitectura Hexagonal
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-emerald-400 font-semibold">1. Eléctricos</span>
            <span className="text-blue-400 font-semibold">2. Estructurales</span>
            <span className="text-purple-400 font-semibold">3. Recursos</span>
          </div>

          <button
            onClick={() => setIsArchitectureModalOpen(true)}
            className="text-[11px] text-purple-300 hover:text-purple-100 underline cursor-pointer"
          >
            Ver Detalle Arquitectura Hexagonal
          </button>
        </div>
      </footer>

      {/* MODALS */}

      {/* 1. New Maintenance Incident / Element Modal */}
      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onSubmit={handleCreateItem}
        currentUser={currentUser}
        defaultArea={activeArea === 'ALL' ? 'ELECTRICOS' : activeArea}
      />

      {/* 2. Progress Advances Modal */}
      <ProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => {
          setIsProgressModalOpen(false);
          setActiveSelectedItem(null);
        }}
        item={activeSelectedItem}
        currentUser={currentUser}
        onSubmitAdvance={handleAddAdvance}
      />

      {/* 3. Full Detail Inspection Modal */}
      <ItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setActiveSelectedItem(null);
        }}
        item={activeSelectedItem}
        onOpenAdvanceModal={(item) => {
          setIsDetailModalOpen(false);
          setActiveSelectedItem(item);
          setIsProgressModalOpen(true);
        }}
      />

      {/* 4. Login & Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* 5. Superior Approval Management Panel */}
      <SuperiorApprovalPanel
        isOpen={isApprovalPanelOpen}
        onClose={() => setIsApprovalPanelOpen(false)}
        currentUser={currentUser}
        onApproveUser={handleApproveUser}
        onRefreshUsers={handleRefreshUsers}
      />

      {/* 6. Hexagonal Architecture Explainer Modal */}
      <HexagonalArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

    </div>
  );
}
