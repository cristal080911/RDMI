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
  Sparkles,
  Send,
  ExternalLink,
  ShieldAlert,
  Inbox,
  FileCheck2,
  Clock,
  Laptop
} from 'lucide-react';
import { User as UserEntity, SecurityEmailNotification } from '../core/domain/entities';
import { ApiClient } from '../adapters/api/apiClient';
import { EmailNotificationService } from '../services/emailNotificationService';

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

  // 2-Step OTP Code Flow (Optional enhancement for user convenience)
  const [requireCodeFlow, setRequireCodeFlow] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [codeSentToEmail, setCodeSentToEmail] = useState<string | null>(null);

  // Change State (Logged-in user)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastDispatchedEmail, setLastDispatchedEmail] = useState<SecurityEmailNotification | null>(null);

  // Email Preview Modal / Drawer
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);

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
      setRequireCodeFlow(false);
      setGeneratedCode(null);
      setEnteredCode('');
      setCodeSentToEmail(null);
      setLastDispatchedEmail(null);
      setShowEmailPreviewModal(false);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSendVerificationCode = async () => {
    setError(null);
    const cleanIdent = recoverIdentifier.trim();
    if (!cleanIdent) {
      setError('Por favor ingrese su usuario o correo institucional antes de solicitar el código.');
      return;
    }
    if (recoverIdentifier.includes(' ') || /\s/.test(recoverIdentifier)) {
      setError('El nombre de usuario o correo no puede contener espacios. No se pueden usar usuarios con espacios.');
      return;
    }

    setIsSendingCode(true);
    try {
      // Find user
      const users = await ApiClient.getAllUsers();
      const user = users.find(
        u => u.username.toLowerCase() === cleanIdent.toLowerCase() || u.email.toLowerCase() === cleanIdent.toLowerCase()
      );

      if (!user) {
        throw new Error('No se encontró ningún usuario o correo institucional con esos datos.');
      }

      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setCodeSentToEmail(user.email);

      // Dispatch security email
      const notif = await ApiClient.sendSecurityEmailNotification({
        type: 'RECOVERY_CODE',
        toEmail: user.email,
        recipientName: user.name,
        recipientUsername: user.username,
        roleTitle: user.roleTitle,
        securityCode: code
      });

      setLastDispatchedEmail(notif);
      setRequireCodeFlow(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al generar código de seguridad.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanIdent = recoverIdentifier.trim();
    if (!cleanIdent) {
      setError('Por favor ingrese su usuario institucional o correo electrónico.');
      return;
    }
    if (recoverIdentifier.includes(' ') || /\s/.test(recoverIdentifier)) {
      setError('El nombre de usuario o correo no puede contener espacios. No se pueden usar usuarios con espacios.');
      return;
    }

    if (requireCodeFlow && generatedCode) {
      if (enteredCode.trim() !== generatedCode.trim()) {
        setError('El código de verificación ingresado no es correcto.');
        return;
      }
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
      
      // Fetch latest email notification for preview
      const notifs = await ApiClient.getRecentEmailNotifications();
      if (notifs && notifs.length > 0) {
        setLastDispatchedEmail(notifs[0]);
      }

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

      // Fetch latest email notification for preview
      const notifs = await ApiClient.getRecentEmailNotifications();
      if (notifs && notifs.length > 0) {
        setLastDispatchedEmail(notifs[0]);
      }

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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
          
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
                  {activeTab === 'RECOVER' ? 'Recuperación de Contraseña con Notificación' : 'Cambio Seguro de Contraseña'}
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

          {/* Email Notification Information Banner */}
          <div className="px-5 py-2.5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border-b border-[#E7DEC9] flex items-center gap-2 text-[11px] text-slate-700">
            <Mail className="w-4 h-4 text-purple-800 shrink-0" />
            <span>
              <strong>Notificación Electrónica Obligatoria:</strong> Cada restablecimiento o cambio de clave envía un comprobante formal a la cuenta de correo registrada.
            </span>
          </div>

          {/* Tab Switcher if user is logged in */}
          {currentUser && (
            <div className="p-2 bg-[#F2ECE0] border-b border-[#E3DCBD] flex gap-1">
              <button
                onClick={() => {
                  setActiveTab('CHANGE');
                  setError(null);
                  setSuccessMessage(null);
                  setRequireCodeFlow(false);
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
                  setRequireCodeFlow(false);
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

          <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
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

            {/* Success message with Email Notification Card */}
            {successMessage && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-3.5 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-sm text-emerald-950">¡Operación Completada y Notificada!</p>
                    <p className="text-emerald-900 mt-0.5">{successMessage}</p>
                  </div>
                </div>

                {/* Email Dispatch Confirmation Card */}
                <div className="p-3.5 rounded-xl bg-white/90 border border-emerald-200 text-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                      <Mail className="w-4 h-4 text-emerald-700" />
                      Comprobante de Notificación por Correo
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Despachado
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Se ha generado y enviado el aviso de seguridad con sello de tiempo, código de encriptación institucional e instrucciones de protección.
                  </p>

                  <div className="pt-1 flex flex-wrap gap-2 items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowEmailPreviewModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>Ver Vista Previa del Correo Enviado</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors cursor-pointer"
                    >
                      Cerrar y Continuar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FORM: RECOVER PASSWORD */}
            {activeTab === 'RECOVER' && !successMessage && (
              <form onSubmit={handleRecoverSubmit} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <span>Protocolo de Recuperación & Notificación Oficial</span>
                  </div>
                  <p>
                    Ingrese su usuario o correo registrado. Podrá establecer su nueva clave institucional (máx. 10 caracteres) y se enviará la confirmación electrónica formal a su buzón.
                  </p>
                </div>

                {/* Identifier Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Usuario o Correo Institucional *
                    </label>
                    {recoverIdentifier.includes(' ') && (
                      <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        ⚠️ Sin espacios
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={recoverIdentifier}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRecoverIdentifier(val);
                        if (val.includes(' ')) {
                          setError('El nombre de usuario o correo no puede contener espacios. No se pueden usar usuarios con espacios.');
                        } else if (error && error.includes('espacio')) {
                          setError(null);
                        }
                      }}
                      placeholder="ej: rectoria o profesor@institucion.edu.co"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border text-xs sm:text-sm text-slate-900 focus:ring-2 focus:outline-none shadow-sm ${
                        recoverIdentifier.includes(' ')
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40 text-rose-900'
                          : 'border-[#DDD5C2] focus:ring-purple-700'
                      }`}
                    />
                  </div>
                  {recoverIdentifier.includes(' ') && (
                    <p className="mt-1 text-[11px] font-bold text-rose-700 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Error: El nombre de usuario o correo no puede tener espacios. Elimine los espacios en blanco.</span>
                    </p>
                  )}
                </div>

                {/* Optional Verification Code Step */}
                <div className="p-3 rounded-2xl bg-[#F6F2E9] border border-[#E2DAC8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-purple-800" />
                      Validación de Código Electrónico
                    </span>
                    {!requireCodeFlow ? (
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={isSendingCode || !recoverIdentifier.trim()}
                        className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[11px] border border-purple-300 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        <Send className={`w-3 h-3 ${isSendingCode ? 'animate-spin' : ''}`} />
                        <span>{isSendingCode ? 'Enviando...' : 'Enviar Código al Correo'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        ✓ Código enviado a {codeSentToEmail}
                      </span>
                    )}
                  </div>

                  {requireCodeFlow && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[11px] font-bold text-purple-950">
                        Ingrese el código de 6 dígitos recibido en su correo:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={enteredCode}
                          onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ej: 849201"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-purple-300 text-center font-mono text-base tracking-widest font-bold text-purple-950 focus:ring-2 focus:ring-purple-700 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmailPreviewModal(true)}
                          title="Ver correo con el código"
                          className="px-3 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Inbox className="w-3.5 h-3.5" />
                          <span>Ver Código</span>
                        </button>
                      </div>
                    </div>
                  )}
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
                  <span>{isLoading ? 'Verificando y Notificando por Correo...' : 'Restablecer y Notificar al Correo'}</span>
                </button>
              </form>
            )}

            {/* FORM: CHANGE PASSWORD (LOGGED-IN USER) */}
            {activeTab === 'CHANGE' && !successMessage && currentUser && (
              <form onSubmit={handleLoggedChangeSubmit} className="space-y-4">
                {/* User info header with notification target email */}
                <div className="p-3.5 rounded-2xl bg-[#F4EFE6] border border-[#DDD5C2] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-slate-600 text-[11px] font-mono">{currentUser.username}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-950 border border-purple-300">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E3DAC8] flex items-center gap-2 text-[11px] text-purple-950 font-medium">
                    <Mail className="w-3.5 h-3.5 text-purple-800 shrink-0" />
                    <span>
                      Correo de notificación institucional: <strong>{currentUser.email}</strong>
                    </span>
                  </div>
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
                  <span>{isLoading ? 'Guardando y Notificando al Correo...' : 'Actualizar y Notificar por Correo'}</span>
                </button>
              </form>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 bg-[#F5EFE4] border-t border-[#ECE5D8] flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Cifrado y Notificación a Correos Institucionales</span>
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

      {/* Embedded Email Preview Modal */}
      {showEmailPreviewModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#DCD3BE] shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[88vh]">
            
            {/* Modal Top Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-purple-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-400/30 text-purple-200">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    Vista Previa del Correo Electrónico Institucional
                  </h4>
                  <p className="text-[11px] text-purple-300">
                    Notificación despachada con sello de seguridad institucional
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Metadata Header Bar */}
            <div className="p-3 bg-[#F8F5EE] border-b border-[#E7DEC9] text-xs text-slate-700 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-purple-950">
                  Para:{' '}
                  <span className="text-slate-800 font-mono">
                    {lastDispatchedEmail?.toEmail || codeSentToEmail || currentUser?.email || 'correo@institucion.edu.co'}
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {new Date().toLocaleString('es-CO')}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                <strong>Asunto:</strong> {lastDispatchedEmail?.subject || '[Seguridad Institucional] Notificación de Clave'}
              </p>
            </div>

            {/* Email HTML Body View */}
            <div className="p-4 overflow-y-auto flex-1 bg-[#F4EFEB]">
              {lastDispatchedEmail?.htmlContent ? (
                <div
                  className="rounded-2xl overflow-hidden shadow-md"
                  dangerouslySetInnerHTML={{ __html: lastDispatchedEmail.htmlContent }}
                />
              ) : (
                <div className="p-6 rounded-2xl bg-white border border-[#DCD3BE] shadow text-xs space-y-4">
                  <div className="text-center p-4 bg-purple-950 text-white rounded-xl">
                    <h3 className="font-black text-sm">SISTEMA DE MANTENIMIENTO INSTITUCIONAL</h3>
                    <p className="text-[10px] text-purple-300 uppercase">Aviso Oficial de Seguridad</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <p className="font-bold text-purple-900">
                      Notificación de Seguridad: Clave de acceso actualizada
                    </p>
                    <p className="text-slate-700 mt-1">
                      Se ha completado el proceso de actualización para su cuenta institucional.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="p-3.5 bg-[#F8F5EE] border-t border-[#E7DEC9] flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                Entrega confirmada y registrada en Firestore
              </span>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-4 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold transition-colors cursor-pointer"
              >
                Cerrar Vista Previa
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
