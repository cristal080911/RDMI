import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
  ShieldAlert,
  Printer,
  KeyRound,
  Edit3,
  Save
} from 'lucide-react';
import { User, UserRole } from '../core/domain/entities';
import { ApiClient } from '../adapters/api/apiClient';

interface SuperiorApprovalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onApproveUser: (userId: string, approve: boolean, newRole?: UserRole) => Promise<void>;
  onRefreshUsers: () => Promise<{ pending: User[]; all: User[] }>;
  onOpenPrintModal?: () => void;
}

export const SuperiorApprovalPanel: React.FC<SuperiorApprovalPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  onApproveUser,
  onRefreshUsers,
  onOpenPrintModal
}) => {
  const [tab, setTab] = useState<'PENDING' | 'ACTIVE'>('PENDING');
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [editingCodeUserId, setEditingCodeUserId] = useState<string | null>(null);
  const [newAdminCodeVal, setNewAdminCodeVal] = useState<string>('');
  const [savingCode, setSavingCode] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await onRefreshUsers();
      setPendingUsers(data.pending);
      setAllUsers(data.all);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = async (userId: string, approve: boolean, newRole?: UserRole) => {
    setProcessingId(userId);
    setFeedback(null);
    try {
      await onApproveUser(userId, approve, newRole);
      setFeedback({
        text: approve ? 'Usuario aprobado exitosamente.' : 'Solicitud de acceso rechazada.',
        type: approve ? 'success' : 'error'
      });
      await loadData();
    } catch (err: any) {
      setFeedback({
        text: err.message || 'Error al procesar acción',
        type: 'error'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveAdminCode = async (userId: string) => {
    const clean = newAdminCodeVal.trim();
    if (!clean) return;
    setSavingCode(true);
    try {
      await ApiClient.updateAdminCode(userId, clean);
      setFeedback({
        text: `Código de acceso actualizado exitosamente a: ${clean}`,
        type: 'success'
      });
      setEditingCodeUserId(null);
      await loadData();
    } catch (err: any) {
      setFeedback({
        text: err.message || 'Error al actualizar código institucional',
        type: 'error'
      });
    } finally {
      setSavingCode(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-3xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 flex items-center justify-center border border-purple-400/30 text-purple-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-purple-800 text-purple-200 px-2 py-0.5 rounded border border-purple-600">
                  Panel Superior / Directivo
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Aprobación y Gestión de Personal Institucional
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenPrintModal && (
              <button
                onClick={onOpenPrintModal}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 border border-emerald-400/40 shadow-sm transition-colors cursor-pointer"
                title="Imprimir listado oficial de personas autorizadas"
              >
                <Printer className="w-4 h-4 text-emerald-200" />
                <span className="hidden sm:inline">Imprimir Lista Oficial</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Alert Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center gap-2 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Verifique la identidad de docentes y administrativos antes de autorizar su acceso. Recuerde que el ingreso de estudiantes está prohibido.
          </span>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 p-2 bg-[#F2ECE0] border-b border-[#E3DCBD] gap-1">
          <button
            onClick={() => setTab('PENDING')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'PENDING'
                ? 'bg-[#FDFBF7] text-purple-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Solicitudes Pendientes ({pendingUsers.length})</span>
          </button>
          <button
            onClick={() => setTab('ACTIVE')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'ACTIVE'
                ? 'bg-[#FDFBF7] text-purple-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-purple-700" />
            <span>Personal Autorizado ({allUsers.filter(u => u.status === 'APPROVED').length})</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {feedback && (
            <div className={`p-3 rounded-xl border text-xs font-bold ${
              feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {feedback.text}
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs font-semibold">
              Cargando registros institucionales...
            </div>
          ) : tab === 'PENDING' ? (
            pendingUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-stone-100/70 rounded-2xl border border-stone-200 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No hay solicitudes pendientes</p>
                <p className="text-xs text-slate-500">
                  Todo el personal registrado ha sido revisado y procesado.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-2xl bg-white border border-[#DDD5C2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          Pendiente
                        </span>
                      </div>
                      <p className="text-xs text-purple-900 font-semibold mt-0.5">
                        Rol Solicitado: {user.role} • {user.roleTitle}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Usuario: <span className="font-mono">{user.username}</span> • Correo: {user.email} • Dept: {user.department}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(user.id, true)}
                        disabled={processingId === user.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Aprobar Ingreso</span>
                      </button>

                      <button
                        onClick={() => handleAction(user.id, false)}
                        disabled={processingId === user.id}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold flex items-center gap-1 border border-rose-300 transition-colors cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="text-purple-950">
                  <p className="font-bold">Directorio de Funcionarios Activos</p>
                  <p className="text-[11px] text-purple-800">
                    {allUsers.filter(u => u.status === 'APPROVED').length} personas autorizadas para operar el sistema institucional.
                  </p>
                </div>
                {onOpenPrintModal && (
                  <button
                    onClick={onOpenPrintModal}
                    className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Lista Completa</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {allUsers
                  .filter(u => u.status === 'APPROVED')
                  .map((user) => (
                  <div
                    key={user.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#DDD5C2] flex items-center justify-between text-xs shadow-sm hover:border-purple-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Autorizado
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {user.email} • <span className="font-mono text-purple-950 font-semibold">{user.username}</span> • {user.department}
                      </p>
                      {/* Administrative Access Code (Determined by Admin / Superiors) */}
                      {(user.role === 'ADMINISTRATIVO' || user.role === 'SUPERIOR') && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="text-amber-950 font-bold flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-amber-700" />
                            <span>Código de Acceso:</span>
                          </span>

                          {editingCodeUserId === user.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                autoFocus
                                value={newAdminCodeVal}
                                onChange={(e) => setNewAdminCodeVal(e.target.value)}
                                placeholder="Ej: 2026-admin"
                                className="px-2 py-0.5 rounded border border-amber-400 bg-white font-mono font-bold text-xs text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-600"
                              />
                              <button
                                type="button"
                                disabled={savingCode}
                                onClick={() => handleSaveAdminCode(user.id)}
                                className="px-2 py-0.5 rounded bg-amber-700 hover:bg-amber-800 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Save className="w-2.5 h-2.5" />
                                <span>{savingCode ? 'Guardando...' : 'Guardar'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCodeUserId(null)}
                                className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-[10px] cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                                {user.adminCode || '2026-admin'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCodeUserId(user.id);
                                  setNewAdminCodeVal(user.adminCode || '2026-admin');
                                }}
                                className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer transition-colors"
                                title="Determinar o cambiar el código de acceso para esta cuenta"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                                <span>Determinar Código</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.role === 'SUPERIOR'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : user.role === 'ADMINISTRATIVO'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {user.role}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{user.roleTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F5EFE4] border-t border-[#ECE5D8] flex items-center justify-between">
          <div>
            {onOpenPrintModal && (
              <button
                onClick={onOpenPrintModal}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-emerald-700" />
                <span>Vista de Impresión / PDF</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};
