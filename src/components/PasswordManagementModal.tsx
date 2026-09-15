import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';
import { User as UserEntity, SecurityEmailNotification } from '../core/domain/entities';
import { ApiClient } from '../adapters/api/apiClient';

interface PasswordManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'FORGOT' | 'RESET' | 'CHANGE' | 'RECOVER';
  initialToken?: string;
  initialEmail?: string;
  currentUser?: UserEntity | null;
  onPasswordChangedSuccessfully?: (newPassword?: string) => void;
}

export const PasswordManagementModal: React.FC<PasswordManagementModalProps> = ({
  isOpen,
  onClose,
  mode = 'FORGOT',
  initialToken = '',
  initialEmail = '',
  currentUser,
  onPasswordChangedSuccessfully
}) => {
  // Active sub-screen: 'FORGOT' (Pantalla 1: Solicitar enlace) or 'RESET' (Pantalla 2: Restablecer con token) or 'CHANGE'
  const getInitialTab = (): 'FORGOT' | 'RESET' | 'CHANGE' => {
    if (initialToken) return 'RESET';
    if (mode === 'CHANGE') return 'CHANGE';
    if (mode === 'RESET') return 'RESET';
    return 'FORGOT';
  };

  const [activeTab, setActiveTab] = useState<'FORGOT' | 'RESET' | 'CHANGE'>(getInitialTab);

  // --- PANTALLA 1: RECUPERAR CONTRASEÑA (EMAIL + ENVIAR ENLACE) ---
  const [emailInput, setEmailInput] = useState(initialEmail || '');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState<string | null>(null);
  const [dispatchedTokenData, setDispatchedTokenData] = useState<{
    token?: string;
    otp?: string;
    resetLink?: string;
    email?: string;
    expiresInMinutes?: number;
    smtpConfigured?: boolean;
  } | null>(null);

  // --- PANTALLA 2: RESTABLECER CONTRASEÑA (TOKEN + NUEVA Y CONFIRMAR CONTRASEÑA) ---
  const [tokenInput, setTokenInput] = useState(initialToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // --- TAB 3: CAMBIAR CONTRASEÑA (USUARIO AUTENTICADO) ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Feedback & Preview
  const [error, setError] = useState<string | null>(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);

  // Synchronize when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setEmailSentSuccess(null);
      setResetSuccessMessage(null);
      setIsSendingEmail(false);
      setIsResetting(false);

      if (initialToken) {
        setTokenInput(initialToken);
        setActiveTab('RESET');
      } else if (mode === 'CHANGE' && currentUser) {
        setActiveTab('CHANGE');
      } else if (mode === 'RESET') {
        setActiveTab('RESET');
      } else {
        setActiveTab('FORGOT');
      }

      if (initialEmail) {
        setEmailInput(initialEmail);
      }
    }
  }, [isOpen, mode, initialToken, initialEmail, currentUser]);

  if (!isOpen) return null;

  // =========================================================================
  // HANDLER: PANTALLA 1 - ENVIAR ENLACE DE RECUPERACIÓN
  // =========================================================================
  const handleSendRecoveryLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setEmailSentSuccess(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Por favor ingrese su correo electrónico institucional registrado.');
      return;
    }

    if (cleanEmail.includes(' ') || /\s/.test(cleanEmail)) {
      setError('El correo electrónico no debe contener espacios.');
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Por favor ingrese un formato de correo electrónico válido (ej. usuario@institucion.edu.co).');
      return;
    }

    setIsSendingEmail(true);

    try {
      const response = await ApiClient.requestForgotPassword(cleanEmail);

      setDispatchedTokenData({
        token: response.token,
        otp: response.otp,
        resetLink: response.resetLink,
        email: cleanEmail,
        expiresInMinutes: response.expiresInMinutes || 15,
        smtpConfigured: response.smtpConfigured
      });

      setEmailSentSuccess(
        response.message ||
        'Correo enviado con éxito. Se ha generado y enviado el enlace de recuperación con validez de 15 minutos.'
      );

      // Pre-fill token input in Pantalla 2
      if (response.token) {
        setTokenInput(response.token);
      } else if (response.otp) {
        setTokenInput(response.otp);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al procesar la solicitud. Verifique que el correo esté registrado.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // =========================================================================
  // HANDLER: PANTALLA 2 - RESTABLECER CONTRASEÑA CON TOKEN (BCRYPT)
  // =========================================================================
  const handleResetPasswordWithToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setResetSuccessMessage(null);

    const cleanToken = tokenInput.trim();
    if (!cleanToken) {
      setError('Debe ingresar o capturar el token / código de recuperación recibido en su correo.');
      return;
    }

    if (!newPassword) {
      setError('Debe ingresar la nueva contraseña.');
      return;
    }

    if (newPassword.length < 4) {
      setError('La nueva contraseña debe tener mínimo 4 caracteres.');
      return;
    }

    if (newPassword.length > 20) {
      setError('La nueva contraseña no puede superar los 20 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor asegúrese de que ambas sean exactamente iguales.');
      return;
    }

    setIsResetting(true);

    try {
      const response = await ApiClient.resetPasswordWithToken({
        token: cleanToken,
        newPassword,
        confirmPassword
      });

      setResetSuccessMessage(
        response.message || '¡Contraseña restablecida exitosamente! Ya puede iniciar sesión con su nueva clave.'
      );

      if (onPasswordChangedSuccessfully) {
        onPasswordChangedSuccessfully(newPassword);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al restablecer la contraseña. El token puede ser inválido o haber expirado.');
    } finally {
      setIsResetting(false);
    }
  };

  // =========================================================================
  // HANDLER: CAMBIO DE CONTRASEÑA DESDE SESIÓN ACTIVA
  // =========================================================================
  const handleChangeActivePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setResetSuccessMessage(null);

    if (!currentUser) {
      setError('Debe tener una sesión iniciada para cambiar la contraseña actual.');
      return;
    }

    if (!currentPassword) {
      setError('Ingrese su contraseña actual.');
      return;
    }

    if (!newPassword) {
      setError('Ingrese la nueva contraseña.');
      return;
    }

    if (newPassword.length < 4 || newPassword.length > 20) {
      setError('La nueva contraseña debe tener entre 4 y 20 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsResetting(true);
    try {
      const resp = await ApiClient.changePassword(currentUser.id, currentPassword, newPassword);
      setResetSuccessMessage(resp.message || 'Contraseña actualizada exitosamente.');
      if (onPasswordChangedSuccessfully) {
        onPasswordChangedSuccessfully(newPassword);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar la contraseña.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      id="password-management-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white relative border-b border-indigo-900/60">
          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-purple-950/50 ring-2 ring-purple-300/40 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1 border border-emerald-400/30">
                <Lock className="w-3 h-3 text-emerald-300" />
                Seguridad Institucional • Encriptación Bcrypt
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {activeTab === 'FORGOT' && 'Recuperar Contraseña'}
                {activeTab === 'RESET' && 'Restablecer Contraseña'}
                {activeTab === 'CHANGE' && 'Cambio de Clave Personal'}
              </h3>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-indigo-900/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('FORGOT');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'FORGOT'
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-900/40 ring-1 ring-purple-400/50'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>1. Enviar Enlace</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('RESET');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'RESET'
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-900/40 ring-1 ring-purple-400/50'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>2. Restablecer con Token</span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('CHANGE');
                  setError(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'CHANGE'
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-900/40 ring-1 ring-purple-400/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cambio Activo</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Global Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-red-950">Atención:</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PANTALLA 1: FORMULARIO "RECUPERAR CONTRASEÑA" (CORREO + ENVIAR ENLACE)     */}
          {/* ========================================================================= */}
          {activeTab === 'FORGOT' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-purple-950 text-xs leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-purple-900">
                  <Clock className="w-3.5 h-3.5 text-purple-700" />
                  Proceso de Recuperación Seguro:
                </p>
                Ingrese el correo electrónico institucional asociado a su cuenta. El sistema consultará la base de datos y le enviará un enlace temporal con un token único de <strong>15 minutos de validez</strong> a través del servicio SMTP/Gmail.
              </div>

              {/* Mensaje de éxito si ya se envió el correo */}
              {emailSentSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-3 animate-in zoom-in-95">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-sm text-emerald-900">¡Correo Enviado con Éxito!</h4>
                      <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                        {emailSentSuccess}
                      </p>
                    </div>
                  </div>

                  {dispatchedTokenData && (
                    <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>📧 Correo destinatario:</span>
                        <strong className="text-slate-900">{dispatchedTokenData.email}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>⏱️ Tiempo de expiración:</span>
                        <strong className="text-amber-700 font-bold">{dispatchedTokenData.expiresInMinutes} minutos</strong>
                      </div>
                      {dispatchedTokenData.otp && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 border border-indigo-200">
                          <span className="font-bold text-indigo-900">Código OTP recibido:</span>
                          <span className="font-mono text-base font-black text-indigo-700 tracking-widest">
                            {dispatchedTokenData.otp}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('RESET')}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <span>Ir al Formulario de Restablecer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEmailPreviewModal(true)}
                          title="Ver la plantilla HTML enviada por correo"
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Inbox className="w-3.5 h-3.5 text-purple-700" />
                          <span>Ver Correo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Formulario de Correo */}
              <form onSubmit={handleSendRecoveryLink} className="space-y-4">
                <div>
                  <label htmlFor="recovery-email-input" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Correo Electrónico Registrado <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-purple-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="recovery-email-input"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="ejemplo@institucion.edu.co o waespinosa2017@gmail.com"
                      disabled={isSendingEmail}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#E5DEC9] focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-950/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando base de datos y enviando correo...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Enlace de Recuperación</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Acceso directo a Pantalla 2 si ya tiene el enlace */}
              <div className="pt-3 border-t border-[#ECE5D8] flex items-center justify-between text-xs text-slate-600">
                <span>¿Ya recibiste el enlace o código OTP?</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('RESET')}
                  className="font-bold text-purple-900 hover:text-purple-700 underline cursor-pointer"
                >
                  Ingresar Token / Restablecer
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PANTALLA 2: FORMULARIO "RESTABLECER CONTRASEÑA" (TOKEN + NUEVA Y CONFIRMAR) */}
          {/* ========================================================================= */}
          {activeTab === 'RESET' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 text-xs leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-indigo-900">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-700" />
                  Paso Final: Configuración de Nueva Clave
                </p>
                El token temporal recibido por correo valida su identidad. Ingrese y confirme su nueva contraseña institucional (será encriptada de forma segura con <strong>bcrypt</strong>).
              </div>

              {/* Mensaje de Éxito al Restablecer */}
              {resetSuccessMessage ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-3 animate-in zoom-in-95">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-black text-base text-emerald-900">¡Contraseña Restablecida con Éxito!</h4>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                        {resetSuccessMessage}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-black shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Ingresar con la Nueva Contraseña</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResetPasswordWithToken} className="space-y-4">
                  
                  {/* Campo de Token / Código Capturado */}
                  <div>
                    <label htmlFor="reset-token-input" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Token o Código de Recuperación (15 min) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-indigo-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reset-token-input"
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="Pegue aquí el token del enlace o el código OTP de 6 dígitos"
                        required
                        disabled={isResetting}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                      />
                    </div>
                    {tokenInput && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Token capturado del enlace o ingresado por el usuario.</span>
                      </p>
                    )}
                  </div>

                  {/* Campo: Nueva Contraseña */}
                  <div>
                    <label htmlFor="new-reset-password-input" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nueva Contraseña (4 a 20 caracteres) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="new-reset-password-input"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ingrese su nueva clave institucional"
                        required
                        minLength={4}
                        maxLength={20}
                        disabled={isResetting}
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4 text-purple-800" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Campo: Confirmar Contraseña */}
                  <div>
                    <label htmlFor="confirm-reset-password-input" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirmar Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="confirm-reset-password-input"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita exactamente la nueva clave"
                        required
                        minLength={4}
                        maxLength={20}
                        disabled={isResetting}
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Ver confirmación de contraseña"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 text-purple-800" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Validación visual de coincidencia */}
                    {confirmPassword && (
                      <p className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${
                        newPassword === confirmPassword ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {newPassword === confirmPassword ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Las contraseñas coinciden perfectamente.</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Las contraseñas aún no coinciden.</span>
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting || !tokenInput || !newPassword || newPassword !== confirmPassword}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-indigo-950/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validando token y encriptando con bcrypt...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Restablecer Contraseña</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('FORGOT')}
                      className="text-xs text-slate-600 hover:text-purple-900 underline cursor-pointer"
                    >
                      ← Volver a solicitar otro enlace por correo
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CAMBIAR CONTRASEÑA (USUARIO CON SESIÓN INICIADA)                   */}
          {/* ========================================================================= */}
          {activeTab === 'CHANGE' && currentUser && (
            <form onSubmit={handleChangeActivePassword} className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-purple-950 text-xs">
                Modificar la contraseña actual para el usuario activo: <strong>{currentUser.name}</strong> ({currentUser.username}).
              </div>

              {resetSuccessMessage ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>¡Cambio Exitoso!</span>
                  </div>
                  <p className="text-xs text-emerald-800">{resetSuccessMessage}</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full mt-2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Listo, cerrar ventana
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="current-user-password-input" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contraseña Actual <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="current-user-password-input"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Contraseña actual"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] focus:border-purple-600 text-xs sm:text-sm font-medium text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? "Ocultar contraseña actual" : "Ver contraseña actual"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4 text-purple-800" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="active-new-password-input" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nueva Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="active-new-password-input"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nueva contraseña (4 a 20 caracteres)"
                        required
                        minLength={4}
                        maxLength={20}
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] focus:border-purple-600 text-xs sm:text-sm font-medium text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? "Ocultar nueva contraseña" : "Ver nueva contraseña"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4 text-purple-800" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="active-confirm-password-input" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="active-confirm-password-input"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita la nueva contraseña"
                        required
                        minLength={4}
                        maxLength={20}
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] focus:border-purple-600 text-xs sm:text-sm font-medium text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Ocultar confirmación" : "Ver confirmación"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 text-purple-800" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting || !newPassword || newPassword !== confirmPassword}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Actualizando clave...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Guardar Nueva Contraseña</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8F5EE] border-t border-[#E5DEC9] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Servicio SMTP / Gmail y Encriptación Bcrypt Activos</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Visor Modal de Plantilla HTML del Correo Enviado */}
      {showEmailPreviewModal && dispatchedTokenData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-purple-200 animate-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-purple-950 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-purple-300" />
                <span className="font-bold text-sm">Vista Previa: Correo Electrónico Institucional (Nodemailer)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-1">
              <p><strong>Para:</strong> {dispatchedTokenData.email}</p>
              <p><strong>Asunto:</strong> [Seguridad Institucional] Enlace de Restablecimiento de Contraseña</p>
              <p><strong>Token temporal:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] font-mono break-all">{dispatchedTokenData.token}</code></p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#F3EFEA]">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm max-w-xl mx-auto text-slate-800 space-y-4">
                <div className="text-center pb-4 border-b border-slate-200">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase border border-amber-300">
                    Seguridad y Control Institucional
                  </span>
                  <h3 className="text-lg font-black text-purple-950 mt-2">SISTEMA DE MANTENIMIENTO</h3>
                  <p className="text-xs text-purple-700">Restablecimiento Oficial de Contraseña</p>
                </div>

                <div className="space-y-2 text-xs leading-relaxed text-slate-700">
                  <p>Estimado(a) usuario institucional,</p>
                  <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta. Haga clic en el botón a continuación para configurar su nueva clave:</p>
                </div>

                <div className="text-center py-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (dispatchedTokenData.token) {
                        setTokenInput(dispatchedTokenData.token);
                        setActiveTab('RESET');
                        setShowEmailPreviewModal(false);
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-black text-xs shadow-lg shadow-purple-900/30 cursor-pointer inline-flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>🔐 Restablecer mi Contraseña (Hacer Clic Aquí)</span>
                  </button>
                  <p className="text-[11px] text-slate-500 mt-2">Validez: 15 minutos desde la emisión</p>
                </div>

                {dispatchedTokenData.otp && (
                  <div className="p-3 bg-slate-50 border-2 border-dashed border-indigo-300 rounded-xl text-center">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase">Código OTP de Verificación Rápida:</p>
                    <p className="text-2xl font-mono font-black text-indigo-700 tracking-widest">{dispatchedTokenData.otp}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-purple-900 text-white font-bold text-xs cursor-pointer"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
