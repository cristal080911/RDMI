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
  ShieldAlert
} from 'lucide-react';
import { User, UserRole } from '../core/domain/entities';

interface SuperiorApprovalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onApproveUser: (userId: string, approve: boolean, newRole?: UserRole) => Promise<void>;
  onRefreshUsers: () => Promise<{ pending: User[]; all: User[] }>;
}

export const SuperiorApprovalPanel: React.FC<SuperiorApprovalPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  onApproveUser,
  onRefreshUsers
}) => {
  const [tab, setTab] = useState<'PENDING' | 'ACTIVE'>('PENDING');
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
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
            <div className="space-y-2.5">
              {allUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#DDD5C2] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                    <p className="text-slate-500 text-[11px]">
                      {user.email} • <span className="font-mono text-purple-950 font-semibold">{user.username}</span>
                    </p>
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
                    <p className="text-[10px] text-slate-400 mt-0.5">{user.roleTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F5EFE4] border-t border-[#ECE5D8] flex justify-end">
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
