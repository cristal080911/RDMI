import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  ArrowLeft,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { User as UserEntity } from '../core/domain/entities';
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
  // Pasos del flujo exclusivo por correo electrónico:
  // 1: Ingreso de correo registrado
  // 2: Verificación de código de 6 dígitos (OTP)
  // 3: Definición y confirmación de nueva contraseña
  // 'SUCCESS': Confirmación final de éxito
  // 'CHANGE': Cambio directo si el usuario ya está autenticado
  const [step, setStep] = useState<1 | 2 | 3 | 'SUCCESS' | 'CHANGE'>(1);

  // --- PANTALLA 1: CORREO ELECTRÓNICO ---
  const [emailInput, setEmailInput] = useState(initialEmail || '');
  const [isSendingCode, setIsSendingCode] = useState(false);

  // --- PANTALLA 2: CÓDIGO DE 6 DÍGITOS ---
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(900); // 15 minutos
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- PANTALLA 3: NUEVA CONTRASEÑA ---
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // --- CAMBIO PARA USUARIO AUTENTICADO ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Alertas y Mensajes
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [smtpNotice, setSmtpNotice] = useState<string | null>(null);
  const [smtpDelivered, setSmtpDelivered] = useState<boolean | null>(null);

  // Sincronizar estado cuando se abre la ventana
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessInfo(null);
      setDevOtpCode(null);
      setSmtpNotice(null);
      setSmtpDelivered(null);
      setIsSendingCode(false);
      setIsVerifyingCode(false);
      setIsSavingPassword(false);
      setIsCodeExpired(false);
      setOtpDigits(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');

      if (mode === 'CHANGE' && currentUser) {
        setStep('CHANGE');
      } else {
        setStep(1);
      }

      if (initialEmail) {
        setEmailInput(initialEmail);
      }

      if (initialToken && initialToken.length === 6 && /^\d+$/.test(initialToken)) {
        setOtpDigits(initialToken.split('').slice(0, 6));
        setStep(2);
      }
    }
  }, [isOpen, mode, initialToken, initialEmail, currentUser]);

  // Temporizador regresivo para la validez del código (15 minutos)
  useEffect(() => {
    let timer: any = null;
    if (isOpen && step === 2) {
      setTimeRemainingSeconds(900); // 15 minutos = 900 segundos
      setIsCodeExpired(false);

      timer = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCodeExpired(true);
            setError('El código de verificación ha expirado. Por favor solicite un nuevo código.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, step]);

  if (!isOpen) return null;

  // Formato mm:ss para el tiempo de expiración
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // =========================================================================
  // PANTALLA 1: ENVIAR CÓDIGO AL CORREO REGISTRADO
  // =========================================================================
  const handleSolicitarCodigo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    // 1. Normalización en frontend: trim y toLowerCase
    const cleanEmail = emailInput.trim().toLowerCase();
    setEmailInput(cleanEmail);

    if (!cleanEmail) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (cleanEmail.includes(' ') || /\s/.test(cleanEmail)) {
      setError('El correo electrónico no puede contener espacios.');
      return;
    }

    // Validación básica: si tiene '@', debe ser formato correo válido; si no tiene '@', se toma como nombre de usuario institucional
    if (cleanEmail.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('Por favor ingresa un correo electrónico válido (ejemplo: usuario@institucion.edu.co).');
        return;
      }
    } else if (cleanEmail.length < 3) {
      setError('Por favor ingresa tu correo institucional o nombre de usuario (mínimo 3 caracteres).');
      return;
    }

    setIsSendingCode(true);

    try {
      const response = await ApiClient.solicitarCodigo(cleanEmail);
      if (response.email) {
        setEmailInput(response.email);
      }
      setSuccessInfo(response.message || 'Código generado.');
      if (response.codigo) {
        setDevOtpCode(response.codigo);
      }
      setSmtpDelivered((response as any).smtpDelivered ?? null);
      if ((response as any).smtpNotice) {
        setSmtpNotice((response as any).smtpNotice);
      } else {
        setSmtpNotice(null);
      }

      // Avanzar a Pantalla 2 (Ingreso de código de 6 dígitos)
      setStep(2);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      // Mostrar alerta clara de correo no registrado
      setError(err?.message || 'El correo electrónico no está registrado');
    } finally {
      setIsSendingCode(false);
    }
  };

  // =========================================================================
  // GESTIÓN DE CASILLAS DEL CÓDIGO OTP DE 6 DÍGITOS
  // =========================================================================
  const handleOtpChange = (index: number, value: string) => {
    setError(null);
    const cleanValue = value.replace(/\D/g, ''); // Solo números

    if (!cleanValue) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Si el usuario pegó el código completo de 6 dígitos
    if (cleanValue.length > 1) {
      const pasteDigits = cleanValue.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasteDigits[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasteDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    // Ingreso de un solo dígito
    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue.charAt(cleanValue.length - 1);
    setOtpDigits(newDigits);

    // Auto-focus a la siguiente casilla
    if (index < 5 && cleanValue) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);
    const targetFocus = Math.min(pastedData.length, 5);
    otpInputRefs.current[targetFocus]?.focus();
  };

  // =========================================================================
  // PANTALLA 2: VALIDAR CÓDIGO DE 6 DÍGITOS
  // =========================================================================
  const handleValidarCodigo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setError('Por favor ingresa el código completo de 6 dígitos que llegó a tu correo.');
      return;
    }

    if (isCodeExpired || timeRemainingSeconds <= 0) {
      setError('El código de verificación ha expirado');
      return;
    }

    setIsVerifyingCode(true);

    try {
      await ApiClient.validarCodigo(emailInput.trim().toLowerCase(), fullCode);
      // Código válido: avanzar a Pantalla 3 (Definir nueva contraseña)
      setStep(3);
    } catch (err: any) {
      setError(err?.message || 'El código ingresado es incorrecto o ha expirado.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // =========================================================================
  // PANTALLA 3: GUARDAR NUEVA CONTRASEÑA
  // =========================================================================
  const handleGuardarContrasena = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError('Por favor ingresa tu nueva contraseña.');
      return;
    }

    if (newPassword.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPassword.length > 20) {
      setError('La nueva contraseña no puede exceder 20 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifica que ambas sean exactamente iguales.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const fullCode = otpDigits.join('');
      const response = await ApiClient.cambiarClave({
        email: emailInput.trim().toLowerCase(),
        codigo: fullCode,
        nuevaContrasena: newPassword,
        confirmarContrasena: confirmPassword
      });

      setSuccessInfo(response.message || '¡Contraseña actualizada exitosamente!');
      setStep('SUCCESS');

      if (onPasswordChangedSuccessfully) {
        onPasswordChangedSuccessfully(newPassword);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la contraseña. Verifica los datos.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // =========================================================================
  // CAMBIO DE CONTRASEÑA PARA USUARIO CON SESIÓN ACTIVA
  // =========================================================================
  const handleChangeAuthenticated = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!currentUser) return;
    if (!currentPassword) {
      setError('Debes ingresar tu contraseña actual.');
      return;
    }
    if (!newPassword) {
      setError('Debes ingresar la nueva contraseña.');
      return;
    }
    if (newPassword.length < 4) {
      setError('La nueva contraseña debe tener mínimo 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const resp = await ApiClient.changePassword(currentUser.id, currentPassword, newPassword);
      setSuccessInfo(resp.message || 'Contraseña actualizada exitosamente.');
      setStep('SUCCESS');
      if (onPasswordChangedSuccessfully) {
        onPasswordChangedSuccessfully(newPassword);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar la contraseña.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div
      id="password-recovery-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Cabecera del Modal */}
        <div className="p-5 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white relative border-b border-indigo-900/60">
          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-950/50 ring-2 ring-purple-300/40 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1 border border-emerald-400/30">
                <Lock className="w-3 h-3 text-emerald-300" />
                Recuperación por Correo • Gmail / SMTP
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {step === 1 && 'Recuperación de Contraseña'}
                {step === 2 && 'Validar Código de Seguridad'}
                {step === 3 && 'Restablecer Contraseña'}
                {step === 'SUCCESS' && 'Operación Completada'}
                {step === 'CHANGE' && 'Cambiar Mi Contraseña'}
              </h3>
            </div>
          </div>

          {/* Indicador de progreso de los 3 pasos (Solo en flujo de recuperación) */}
          {step !== 'CHANGE' && step !== 'SUCCESS' && (
            <div className="mt-5 pt-3 border-t border-indigo-900/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                    step === 1
                      ? 'bg-purple-500 text-white shadow-md'
                      : step > 1
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className={step === 1 ? 'font-bold text-white' : 'text-slate-400 font-medium'}>
                  1. Correo
                </span>
              </div>

              <div className={`h-0.5 w-8 ${step > 1 ? 'bg-emerald-500' : 'bg-white/20'}`} />

              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                    step === 2
                      ? 'bg-purple-500 text-white shadow-md'
                      : step > 2
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {step > 2 ? '✓' : '2'}
                </div>
                <span className={step === 2 ? 'font-bold text-white' : 'text-slate-400 font-medium'}>
                  2. Código OTP
                </span>
              </div>

              <div className={`h-0.5 w-8 ${step > 2 ? 'bg-emerald-500' : 'bg-white/20'}`} />

              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                    step === 3
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  3
                </div>
                <span className={step === 3 ? 'font-bold text-white' : 'text-slate-400 font-medium'}>
                  3. Nueva Clave
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6">
          
          {/* Mensaje de Error / Alerta Visual */}
          {error && (
            <div
              id="alert-recovery-error"
              className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-start gap-3 shadow-sm animate-in fade-in duration-150"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-900 text-sm">Atención</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* ===================================================================
              PANTALLA 1: FORMULARIO PARA INGRESAR EL CORREO REGISTRADO
             =================================================================== */}
          {step === 1 && (
            <form onSubmit={handleSolicitarCodigo} className="space-y-5">
              <div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Ingresa tu correo electrónico registrado o nombre de usuario institucional. Te enviaremos un mensaje con un código numérico aleatorio de 6 dígitos que tendrá una validez de 15 minutos para que puedas cambiar tu contraseña.
                </p>

                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Correo Electrónico o Usuario Institucional
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setError(null);
                    }}
                    onBlur={(e) => {
                      setEmailInput(e.target.value.trim().toLowerCase());
                    }}
                    placeholder="ej: funcionario@institucion.edu.co o tu usuario"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all font-medium placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSendingCode}
                  id="btn-enviar-codigo"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold shadow-lg shadow-purple-950/30 hover:shadow-purple-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSendingCode ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Consultando base de datos y enviando correo...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar código al correo</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          )}

          {/* ===================================================================
              PANTALLA 2: CASILLAS PARA INGRESAR CÓDIGO DE 6 DÍGITOS
             =================================================================== */}
          {step === 2 && (
            <form onSubmit={handleValidarCodigo} className="space-y-5">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 flex items-start gap-3">
                <Mail className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-indigo-950">
                    {smtpDelivered ? 'Código enviado a tu correo:' : 'Código generado para tu cuenta:'}
                  </p>
                  <p className="font-mono text-indigo-800 font-semibold break-all">{emailInput}</p>
                  <p className="text-indigo-600 mt-1">
                    {smtpDelivered
                      ? 'Revisa tu bandeja de entrada o la carpeta de correo no deseado (spam).'
                      : 'El código OTP ha sido registrado de forma segura en la base de datos institucional.'}
                  </p>
                </div>
              </div>

              {/* Banner de estado de entrega de correo */}
              {smtpDelivered ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-900 text-sm">
                      ¡Correo enviado exitosamente!
                    </p>
                    <p className="text-emerald-800 mt-0.5">
                      Revisa la bandeja de entrada de <strong className="font-mono">{emailInput}</strong> (y la carpeta de spam si no lo ves de inmediato).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2.5 shadow-xs">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-amber-900 text-sm">
                        Google rechazó el envío automático por SMTP
                      </p>
                      <p className="text-amber-800 mt-1 leading-relaxed">
                        Google bloqueó la autenticación con la contraseña <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">perez_y_aldana26</code> porque <strong>Google no permite usar contraseñas habituales</strong> para enviar correos desde sistemas externos. Exige una <strong>Contraseña de Aplicación de 16 caracteres</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200 flex flex-wrap gap-2 items-center justify-between">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailInput)}&su=${encodeURIComponent('Código de restablecimiento RDMI')}&body=${encodeURIComponent(`Hola,\n\nTu código de verificación para RDMI es: ${devOtpCode}\n\nVigencia: 15 minutos.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir y enviarme el correo en Gmail Web</span>
                    </a>

                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:underline"
                    >
                      <span>Crear contraseña de 16 caracteres de Google</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Banner de código generado para agilizar validación */}
              {devOtpCode && (
                <div className="bg-purple-50/90 border border-purple-200 rounded-2xl p-3.5 text-xs text-purple-950 flex items-center justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-purple-900">
                      <KeyRound className="w-3.5 h-3.5 text-purple-700" />
                      <span>Código OTP generado:</span>
                      <span className="font-mono font-black text-sm tracking-widest text-purple-800 bg-white px-2 py-0.5 rounded border border-purple-200">
                        {devOtpCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-700 mt-1 leading-tight">
                      El código está activo en Firestore. Puedes pegarlo directamente para no esperar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const digits = devOtpCode.split('').slice(0, 6);
                      setOtpDigits(digits);
                      otpInputRefs.current[5]?.focus();
                    }}
                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shrink-0 shadow-sm"
                  >
                    Pegar código
                  </button>
                </div>
              )}

              {/* Indicador de Expiración (10 minutos) */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Clock className={`w-4 h-4 ${timeRemainingSeconds < 120 ? 'text-red-600 animate-pulse' : 'text-purple-700'}`} />
                  <span>Vigencia del código:</span>
                </div>
                <div className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-lg ${
                  timeRemainingSeconds < 120
                    ? 'bg-red-100 text-red-700 animate-pulse'
                    : 'bg-purple-100 text-purple-900'
                }`}>
                  {formatTimer(timeRemainingSeconds)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3 text-center">
                  Ingresa el código de 6 dígitos que llegó al correo
                </label>

                {/* Casillas individuales de 6 dígitos con foco dinámico y pegado */}
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-black text-xl sm:text-2xl rounded-xl border bg-white shadow-sm transition-all focus:outline-none ${
                        digit
                          ? 'border-purple-600 ring-2 ring-purple-500/20 text-purple-950 bg-purple-50/30'
                          : 'border-slate-300 text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isVerifyingCode || isCodeExpired || otpDigits.join('').length !== 6}
                  id="btn-verificar-codigo"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-950/20 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isVerifyingCode ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando código con la base de datos...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verificar código</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                    className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cambiar correo</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSendingCode}
                    onClick={handleSolicitarCodigo}
                    className="text-purple-700 hover:text-purple-900 font-bold transition-colors cursor-pointer flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSendingCode ? 'animate-spin' : ''}`} />
                    <span>Reenviar código</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ===================================================================
              PANTALLA 3: FORMULARIO NUEVA CONTRASEÑA Y CONFIRMAR CONTRASEÑA
             =================================================================== */}
          {step === 3 && (
            <form onSubmit={handleGuardarContrasena} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Código verificado correctamente. Ahora define tu nueva contraseña institucional.</span>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all font-medium placeholder:text-slate-400 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Repite la nueva contraseña"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all font-medium placeholder:text-slate-400 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nota de encriptación Bcrypt */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                🔒 Tu contraseña se guardará encriptada con <strong>bcrypt</strong> y se enviará una confirmación automática a tu correo.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  id="btn-guardar-contrasena"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold shadow-lg shadow-purple-950/30 hover:shadow-purple-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSavingPassword ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Encriptando y guardando contraseña...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Guardar contraseña</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ===================================================================
              PANTALLA DE ÉXITO
             =================================================================== */}
          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900">¡Contraseña Guardada con Éxito!</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  {successInfo || 'Tu contraseña ha sido actualizada y encriptada de forma segura. Ya puedes iniciar sesión en el sistema.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
                >
                  Continuar al inicio de sesión
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================
              MODAL DE CAMBIO DIRECTO PARA USUARIO CON SESIÓN ACTIVA
             =================================================================== */}
          {step === 'CHANGE' && currentUser && (
            <form onSubmit={handleChangeAuthenticated} className="space-y-4">
              <p className="text-xs text-slate-600">
                Estás actualizando la contraseña para la cuenta institucional de <strong>{currentUser.name}</strong> ({currentUser.email}).
              </p>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="w-full py-3 rounded-xl bg-purple-800 text-white font-bold text-sm shadow-md"
                >
                  {isSavingPassword ? 'Actualizando...' : 'Guardar contraseña'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
