import React, { useState } from 'react';
import {
  X,
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { User as UserEntity } from '../core/domain/entities';
import { ApiClient } from '../adapters/api/apiClient';

interface PasswordManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'RECOVER' | 'CHANGE';
  currentUser?: UserEntity | null;
  onPasswordChangedSuccessfully?: (newPassword?: string) => void;
}

export const PasswordManagementModal: React.FC<PasswordManagementModalProps> = ({
  isOpen,
  onClose,
  mode,
  currentUser,
  onPasswordChangedSuccessfully
}) => {
  const [activeTab, setActiveTab] = useState<'RECOVER' | 'CHANGE'>(mode);

  // Recover State
  const [recoverIdentifier, setRecoverIdentifier] = useState('');
  const [recoverNewPassword, setRecoverNewPassword] = useState('');
  const [recoverConfirmPassword, setRecoverConfirmPassword] = useState('');
  const [showRecoverPass, setShowRecoverPass] = useState(false);
  const [showRecoverConfirmPass, setShowRecoverConfirmPass] = useState(false);

  // Change State (Logged-in user)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset internal states on open
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(mode);
      setError(null);
      setSuccessMessage(null);
      setRecoverIdentifier('');
      setRecoverNewPassword('');
      setRecoverConfirmPassword('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanIdent = recoverIdentifier.trim();
    if (!cleanIdent) {
      setError('Por favor ingrese su usuario institucional o correo electrónico.');
      return;
    }

    if (recoverNewPassword.length < 4) {
      setError('La nueva contraseña debe contener al menos 4 caracteres.');
      return;
    }

    if (recoverNewPassword.length > 10) {
      setError('La nueva contraseña no puede exceder el límite máximo de 10 dígitos.');
      return;
    }

    if (recoverNewPassword !== recoverConfirmPassword) {
      setError('Las contraseñas ingresadas no coinciden. Verifíquelas.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await ApiClient.resetPassword(cleanIdent, recoverNewPassword);
      setSuccessMessage(res.message || 'Contraseña recuperada exitosamente.');
      if (onPasswordChangedSuccessfully) {
        onPasswordChangedSuccessfully(recoverNewPassword);
      }
    } catch (err: any) {
      setError(err.message || 'No fue posible recuperar la contraseña. Verifique los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoggedChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!currentUser?.id) {
      setError('No hay una sesión activa para modificar la contraseña.');
      return;
    }

    if (!currentPassword) {
      setError('Debe ingresar su contraseña actual.');
      return;
    }

    if (newPassword.length < 4) {
      setError('La nueva contraseña debe contener al menos 4 caracteres.');
      return;
    }

    if (newPassword.length > 10) {
      setError('La nueva contraseña no puede exceder el límite máximo de 10 dígitos.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('La confirmación de la nueva contraseña no coincide.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await ApiClient.changePassword(currentUser.id, currentPassword, newPassword);
      setSuccessMessage(res.message || 'Contraseña actualizada exitosamente.');
      if (onPasswordChangedSuccessfully) {
        onPasswordChangedSuccessfully(newPassword);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white flex items-center justify-between border-b border-indigo-900/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/30 flex items-center justify-center border border-purple-400/30 text-purple-300 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-800 text-purple-200 px-2 py-0.5 rounded border border-purple-600">
                  Seguridad Institucional
                </span>
                <span className="text-[10px] font-semibold text-purple-300">
                  Máx. 10 dígitos
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {activeTab === 'RECOVER' ? 'Recuperar o Restablecer Contraseña' : 'Cambio de Contraseña de Acceso'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher if user is logged in */}
        {currentUser && (
          <div className="p-2 bg-[#F2ECE0] border-b border-[#E3DCBD] flex gap-1">
            <button
              onClick={() => {
                setActiveTab('CHANGE');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'CHANGE'
                  ? 'bg-purple-900 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Cambiar Mi Clave</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('RECOVER');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'RECOVER'
                  ? 'bg-purple-900 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recuperar por Correo/Usuario</span>
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Error message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error en la validación:</p>
                <p className="text-rose-800 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-black text-sm text-emerald-950">¡Operación Exitosa!</p>
                  <p className="text-emerald-900 mt-0.5">{successMessage}</p>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors cursor-pointer"
                >
                  Entendido / Volver al Ingreso
                </button>
              </div>
            </div>
          )}

          {/* FORM: RECOVER PASSWORD */}
          {activeTab === 'RECOVER' && !successMessage && (
            <form onSubmit={handleRecoverSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 leading-relaxed">
                <span className="font-bold">Protocolo de Recuperación Institucional:</span> Ingrese su usuario o correo registrado. Podrá establecer una nueva contraseña de acceso de <strong>máximo 10 dígitos</strong>.
              </div>

              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                  Usuario o Correo Institucional *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={recoverIdentifier}
                    onChange={(e) => setRecoverIdentifier(e.target.value)}
                    placeholder="ej: rectoria o profesor@institucion.edu.co"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Nueva Contraseña *
                  </label>
                  <span className="text-[11px] text-purple-950 font-semibold bg-purple-100/90 px-2 py-0.5 rounded-md border border-purple-200">
                    Máx. 10 dígitos ({recoverNewPassword.length}/10)
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRecoverPass ? 'text' : 'password'}
                    required
                    maxLength={10}
                    value={recoverNewPassword}
                    onChange={(e) => setRecoverNewPassword(e.target.value.slice(0, 10))}
                    placeholder="Mínimo 4, máximo 10 caracteres"
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRecoverPass(!showRecoverPass)}
                    title={showRecoverPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                  >
                    {showRecoverPass ? <EyeOff className="w-4 h-4 text-purple-900" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Confirmar Nueva Contraseña *
                  </label>
                  <span className="text-[11px] text-purple-950 font-semibold bg-purple-100/90 px-2 py-0.5 rounded-md border border-purple-200">
                    Máx. 10 dígitos ({recoverConfirmPassword.length}/10)
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRecoverConfirmPass ? 'text' : 'password'}
                    required
                    maxLength={10}
                    value={recoverConfirmPassword}
                    onChange={(e) => setRecoverConfirmPassword(e.target.value.slice(0, 10))}
                    placeholder="Repita la nueva contraseña"
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRecoverConfirmPass(!showRecoverConfirmPass)}
                    title={showRecoverConfirmPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                  >
                    {showRecoverConfirmPass ? <EyeOff className="w-4 h-4 text-purple-900" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-black shadow-lg shadow-purple-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Verificando y Restableciendo...' : 'Restablecer y Guardar Contraseña'}</span>
              </button>
            </form>
          )}

          {/* FORM: CHANGE PASSWORD (LOGGED-IN USER) */}
          {activeTab === 'CHANGE' && !successMessage && currentUser && (
            <form onSubmit={handleLoggedChangeSubmit} className="space-y-4">
              {/* User info header */}
              <div className="p-3 rounded-2xl bg-[#F4EFE6] border border-[#DDD5C2] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-slate-600 text-[11px] font-mono">{currentUser.username} • {currentUser.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-950 border border-purple-300">
                  {currentUser.role}
                </span>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                  Contraseña Actual *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingrese su clave actual"
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4 text-purple-900" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Nueva Contraseña *
                  </label>
                  <span className="text-[11px] text-purple-950 font-semibold bg-purple-100/90 px-2 py-0.5 rounded-md border border-purple-200">
                    Máx. 10 dígitos ({newPassword.length}/10)
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    maxLength={10}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value.slice(0, 10))}
                    placeholder="Mínimo 4, máximo 10 caracteres"
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4 text-purple-900" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Confirmar Nueva Contraseña *
                  </label>
                  <span className="text-[11px] text-purple-950 font-semibold bg-purple-100/90 px-2 py-0.5 rounded-md border border-purple-200">
                    Máx. 10 dígitos ({confirmNewPassword.length}/10)
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmNewPass ? 'text' : 'password'}
                    required
                    maxLength={10}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value.slice(0, 10))}
                    placeholder="Repita la nueva contraseña"
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                  >
                    {showConfirmNewPass ? <EyeOff className="w-4 h-4 text-purple-900" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-black shadow-lg shadow-purple-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isLoading ? 'Actualizando Contraseña...' : 'Actualizar Mi Contraseña Ahora'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F5EFE4] border-t border-[#ECE5D8] flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Encriptación y Respaldo Institucional</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
