import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Mail,
  Building,
  KeyRound,
  AlertOctagon,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Briefcase,
  UserCheck,
  UserPlus,
  Layers,
  HelpCircle,
  Clock,
  ShieldCheck,
  Info,
  Eye,
  EyeOff,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  X
} from 'lucide-react';
import { UserRole, User as UserEntity } from '../core/domain/entities';
import { ApiClient } from '../adapters/api/apiClient';

interface LoginViewProps {
  onLogin: (username: string, password: string, adminCode?: string) => Promise<UserEntity>;
  onRegister: (payload: {
    username: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    roleTitle: string;
    department: string;
    isStudent?: boolean;
    adminCode?: string;
  }) => Promise<{ success: boolean; message: string; user?: UserEntity }>;
  onOpenArchitectureModal: () => void;
  onOpenPasswordRecovery?: (initialIdentifier?: string) => void;
  onOpenHelpModal?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onRegister,
  onOpenArchitectureModal,
  onOpenPasswordRecovery,
  onOpenHelpModal
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'RECOVER'>('LOGIN');

  // Recovery Form State (Mandar correo para cambiar contraseña)
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverStep, setRecoverStep] = useState<1 | 2>(1);
  const [recoverOtpCode, setRecoverOtpCode] = useState('');
  const [recoverNewPassword, setRecoverNewPassword] = useState('');
  const [recoverConfirmPassword, setRecoverConfirmPassword] = useState('');
  const [recoverShowNewPassword, setRecoverShowNewPassword] = useState(false);
  const [recoverIsSending, setRecoverIsSending] = useState(false);
  const [recoverIsSaving, setRecoverIsSaving] = useState(false);
  const [recoverSuccessMessage, setRecoverSuccessMessage] = useState<string | null>(null);
  const [recoverDevOtp, setRecoverDevOtp] = useState<string | null>(null);
  const [recoverResetLink, setRecoverResetLink] = useState<string | null>(null);
  const [recoverSmtpDelivered, setRecoverSmtpDelivered] = useState<boolean | null>(null);
  const [recoverSmtpNotice, setRecoverSmtpNotice] = useState<string | null>(null);
  const [recoverCopied, setRecoverCopied] = useState(false);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginAdminCode, setLoginAdminCode] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('DOCENTE');
  const [regRoleTitle, setRegRoleTitle] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regAdminCode, setRegAdminCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccessInfo, setRegisteredSuccessInfo] = useState<{
    message: string;
    username: string;
    name: string;
    role: string;
  } | null>(null);

  // Modal for requesting admin access code upon login attempt
  const [adminCodePrompt, setAdminCodePrompt] = useState<{
    isOpen: boolean;
    username: string;
    pass: string;
    displayName: string;
    roleTitle: string;
    enteredCode: string;
    error: string | null;
    isSubmitting: boolean;
  } | null>(null);

  const isAdminIdentifier = (id: string): boolean => {
    const clean = id.trim().toLowerCase();
    const known = [
      'rectoria',
      'rectoria@institucion.edu.co',
      'coord.mantenimiento',
      'mantenimiento@institucion.edu.co',
      'cristalpulecio@gmail.com',
      'cristalpulecio',
      'waespinosa2017@gmail.com',
      'waespinosa',
      'karollsofiaac19@gmail.com',
      'karollsofia'
    ];
    return known.includes(clean);
  };

  const openAdminCodePrompt = (username: string, pass: string, displayName: string, roleTitle: string) => {
    setError(null);
    setRegisteredSuccessInfo(null);
    setAdminCodePrompt({
      isOpen: true,
      username,
      pass,
      displayName,
      roleTitle,
      enteredCode: '',
      error: null,
      isSubmitting: false
    });
  };

  const handleAdminCodeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminCodePrompt) return;
    const code = adminCodePrompt.enteredCode.trim();
    if (!code) {
      setAdminCodePrompt(prev => prev ? {
        ...prev,
        error: 'Por favor ingrese el código de acceso del administrador.'
      } : null);
      return;
    }

    setAdminCodePrompt(prev => prev ? { ...prev, isSubmitting: true, error: null } : null);
    try {
      setLoginAdminCode(code);
      await onLogin(adminCodePrompt.username, adminCodePrompt.pass, code);
      setAdminCodePrompt(null);
    } catch (err: any) {
      setAdminCodePrompt(prev => prev ? {
        ...prev,
        isSubmitting: false,
        error: err.message || 'Código de acceso incorrecto. Verifique e intente de nuevo.'
      } : null);
    }
  };

  // Demo shortcut login (using standard passwords <= 10 characters)
  const handleQuickLogin = async (username: string, pass: string, code?: string) => {
    setError(null);
    setRegisteredSuccessInfo(null);
    setIsSubmitting(true);
    try {
      if (code !== undefined) {
        setLoginAdminCode(code);
      }
      await onLogin(username, pass, code !== undefined ? code : loginAdminCode.trim());
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) {
      setError('Por favor ingrese su usuario o correo y su contraseña.');
      return;
    }
    if (loginUsername.includes(' ') || /\s/.test(loginUsername)) {
      setError('El nombre de usuario o correo no puede contener espacios. No se pueden usar usuarios con espacios.');
      return;
    }
    if (loginPassword.length > 10) {
      setError('La contraseña no puede exceder el límite de 10 dígitos o caracteres.');
      return;
    }

    // If identifier is an admin and code field is empty, prompt immediately
    if (isAdminIdentifier(loginUsername) && !loginAdminCode.trim()) {
      openAdminCodePrompt(
        loginUsername.trim(),
        loginPassword,
        loginUsername.trim(),
        'Cuenta Administrativa Institucional'
      );
      return;
    }

    setError(null);
    setRegisteredSuccessInfo(null);
    setIsSubmitting(true);
    try {
      await onLogin(loginUsername.trim(), loginPassword, loginAdminCode.trim());
    } catch (err: any) {
      const errMsg = err.message || 'Error al iniciar sesión';
      if (
        errMsg.toLowerCase().includes('código') ||
        errMsg.toLowerCase().includes('codigo') ||
        errMsg.toLowerCase().includes('bloqueo') ||
        isAdminIdentifier(loginUsername.trim())
      ) {
        setAdminCodePrompt({
          isOpen: true,
          username: loginUsername.trim(),
          pass: loginPassword,
          displayName: loginUsername.trim(),
          roleTitle: 'Cuenta con Privilegios Administrativos',
          enteredCode: loginAdminCode.trim(),
          error: errMsg.includes('REQUERIDO') ? null : errMsg,
          isSubmitting: false
        });
      } else {
        setError(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegisteredSuccessInfo(null);

    if (!regUsername.trim() || !regEmail.trim() || !regPassword || !regName.trim()) {
      setError('Por favor diligencie todos los campos obligatorios (*).');
      return;
    }

    if (regUsername.includes(' ') || /\s/.test(regUsername)) {
      setError('El nombre de usuario no puede contener espacios. No se pueden usar usuarios con espacios. Por favor ingrese un formato continuo (ej: j.martinez, pedrogomez o prof_ruiz).');
      return;
    }

    if (regPassword.length > 10) {
      setError('La contraseña no puede superar los 10 dígitos o caracteres.');
      return;
    }

    if (regPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onRegister({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        name: regName.trim(),
        role: regRole,
        roleTitle: regRoleTitle.trim() || (regRole === 'DOCENTE' ? 'Docente Titular' : regRole === 'ADMINISTRATIVO' ? 'Coordinador Administrativo' : 'Directivo Institucional'),
        department: regDepartment.trim() || 'Sede Principal',
        adminCode: regRole === 'ADMINISTRATIVO' ? (regAdminCode.trim().toUpperCase() || undefined) : undefined
      });

      setRegisteredSuccessInfo({
        message: res.message,
        username: regUsername.trim(),
        name: regName.trim(),
        role: regRole
      });

      // Clear register inputs
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegName('');
      setRegRoleTitle('');
      setRegDepartment('');
      setRegAdminCode('');
      setTab('LOGIN');
    } catch (err: any) {
      setError(err.message || 'Error en el registro institucional');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enviar correo de recuperación desde la pestaña "3. Mandar Correo"
  const handleRecoverSendEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setRecoverSuccessMessage(null);
    const targetEmail = recoverEmail.trim() || loginUsername.trim();
    if (!targetEmail) {
      setError('Por favor ingresa tu correo electrónico registrado o nombre de usuario.');
      return;
    }

    setRecoverIsSending(true);
    try {
      const resp = await ApiClient.solicitarCodigo(targetEmail);
      if (resp.email) setRecoverEmail(resp.email);
      setRecoverDevOtp(resp.codigo || null);
      setRecoverResetLink(resp.resetLink || null);
      setRecoverSmtpDelivered(resp.smtpDelivered === true);
      setRecoverSmtpNotice(resp.smtpNotice || null);
      setRecoverStep(2);
      setRecoverSuccessMessage(resp.message || 'Código generado y enviado al correo.');
    } catch (err: any) {
      setError(err?.message || 'Error al enviar la solicitud de recuperación.');
    } finally {
      setRecoverIsSending(false);
    }
  };

  // Guardar nueva contraseña con el código de 6 dígitos recibido por correo
  const handleRecoverSavePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanCode = recoverOtpCode.trim();
    if (!cleanCode) {
      setError('Por favor ingresa el código numérico de 6 dígitos que recibiste.');
      return;
    }
    if (!recoverNewPassword) {
      setError('Por favor ingresa tu nueva contraseña.');
      return;
    }
    if (recoverNewPassword.length < 4 || recoverNewPassword.length > 20) {
      setError('La contraseña debe tener entre 4 y 20 caracteres.');
      return;
    }
    if (recoverNewPassword !== recoverConfirmPassword) {
      setError('Las contraseñas no coinciden. Verifica que ambas sean iguales.');
      return;
    }

    setRecoverIsSaving(true);
    try {
      const resp = await ApiClient.cambiarClave({
        email: recoverEmail.trim().toLowerCase(),
        codigo: cleanCode,
        nuevaContrasena: recoverNewPassword,
        confirmarContrasena: recoverConfirmPassword
      });

      setRecoverSuccessMessage(resp.message || '¡Contraseña actualizada con éxito!');
      // Cambiar a la pestaña de login y rellenar credenciales
      setLoginUsername(recoverEmail);
      setLoginPassword(recoverNewPassword);
      setRecoverStep(1);
      setRecoverOtpCode('');
      setRecoverNewPassword('');
      setRecoverConfirmPassword('');
      setRecoverDevOtp(null);
      setTab('LOGIN');
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la contraseña. Revisa el código.');
    } finally {
      setRecoverIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#131131] to-[#2e0854] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white p-3 sm:p-6">
      
      {/* Top Header Branding */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-purple-950/50 ring-2 ring-purple-400/30">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span className="text-emerald-400">RDMI</span>
              <span className="text-purple-300">Institucional</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300">
              Sistema de Mantenimiento • Eléctricos • Estructurales • Recursos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHelpModal && (
            <button
              onClick={onOpenHelpModal}
              title="Abrir guía de ayuda: ¿Cómo manejar y usar la aplicación?"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-emerald-100 hover:text-white text-xs font-bold border border-emerald-500/50 flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <HelpCircle className="w-4 h-4 text-emerald-300" />
              <span>Ayuda / Guía de Uso</span>
            </button>
          )}

          <button
            onClick={onOpenArchitectureModal}
            className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-700/50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Arquitectura Hexagonal</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Center Box */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10">
        <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Card Header */}
          <div className="p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white text-center relative border-b border-indigo-900/60">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-purple-950/60 ring-2 ring-purple-300/40">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ingreso al Sistema de Mantenimiento
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-md mx-auto">
              Plataforma para docentes, coordinadores, personal administrativo y directivos de la institución
            </p>
          </div>

          {/* Warning Banner: Students forbidden */}
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center gap-2.5 text-rose-900 text-xs font-bold">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Acceso de uso exclusivo para personal institucional. Prohibido el ingreso de estudiantes.</span>
          </div>

          {/* Quick Help Guide Banner */}
          {onOpenHelpModal && (
            <div className="bg-emerald-50/90 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs text-emerald-950 font-medium">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>¿Primera vez aquí? Aprende a manejar la app:</span>
              </div>
              <button
                type="button"
                onClick={onOpenHelpModal}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-sm flex items-center gap-1"
              >
                <span>Ver Guía de Ayuda</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Tab Navigation: Iniciar Sesión / Registrarse / Cambiar por Correo */}
          <div className="grid grid-cols-3 p-2 bg-[#F2ECE0] border-b border-[#E3DCBD] gap-1.5">
            <button
              type="button"
              onClick={() => { setTab('LOGIN'); setError(null); }}
              className={`py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'LOGIN'
                  ? 'bg-[#FDFBF7] text-purple-950 shadow-md border border-[#DDD5C2]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <KeyRound className="w-4 h-4 text-purple-800 shrink-0" />
              <span className="truncate">1. Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => { setTab('REGISTER'); setError(null); }}
              className={`py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'REGISTER'
                  ? 'bg-[#FDFBF7] text-purple-950 shadow-md border border-[#DDD5C2]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="truncate">2. Registrarse</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('RECOVER');
                setError(null);
                if (loginUsername && !recoverEmail) {
                  setRecoverEmail(loginUsername);
                }
              }}
              className={`py-2.5 px-1.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'RECOVER'
                  ? 'bg-[#FDFBF7] text-purple-950 shadow-md border border-purple-400 ring-2 ring-purple-600/30'
                  : 'text-purple-950 hover:bg-purple-100/80 bg-purple-50/70 border border-purple-200/90 hover:shadow-xs'
              }`}
              title="Mandar correo para cambiar contraseña"
            >
              <Mail className="w-4 h-4 text-purple-700 shrink-0" />
              <span className="truncate">3. Mandar Correo</span>
            </button>
          </div>

          <div className="p-5 sm:p-7 space-y-4">
            
            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-bold space-y-2 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="leading-snug">{error}</p>
                  </div>
                </div>
                {tab === 'LOGIN' && (
                  <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between text-xs">
                    <span className="text-rose-800 font-normal">¿No recuerdas tu contraseña?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('RECOVER');
                        if (loginUsername && !recoverEmail) setRecoverEmail(loginUsername);
                        setError(null);
                      }}
                      className="font-black text-purple-950 hover:text-purple-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-purple-800" />
                      <span>Mandar correo para cambiarla</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Registration Success Banner (Notifies that it reached the admin) */}
            {registeredSuccessInfo && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs sm:text-sm font-medium space-y-2 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-emerald-900 font-black">
                  <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>¡Solicitud de Registro Enviada al Administrador!</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {registeredSuccessInfo.message}
                </p>
                <div className="bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-200 text-[11px] text-emerald-950">
                  <p><strong>Funcionario:</strong> {registeredSuccessInfo.name}</p>
                  <p><strong>Usuario:</strong> <span className="font-mono">{registeredSuccessInfo.username}</span></p>
                  <p><strong>Rol Solicitado:</strong> {registeredSuccessInfo.role}</p>
                  <p className="mt-1 text-emerald-800 italic">
                    💡 El administrador o superior directivo revisará y aprobará su cuenta desde el panel de control.
                  </p>
                </div>
              </div>
            )}

            {tab === 'LOGIN' ? (
              /* --- FORMULARIO DE INICIO DE SESIÓN --- */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Usuario o Correo Institucional *
                    </label>
                    {loginUsername.includes(' ') && (
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
                      value={loginUsername}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLoginUsername(val);
                        if (val.includes(' ')) {
                          setError('El nombre de usuario o correo no puede contener espacios. No se pueden usar usuarios con espacios.');
                        } else if (error && error.includes('espacio')) {
                          setError(null);
                        }
                      }}
                      placeholder="ej: rectoria o j.martinez@institucion.edu.co"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white border text-xs sm:text-sm text-slate-900 focus:ring-2 focus:outline-none shadow-sm placeholder:text-slate-400 ${
                        loginUsername.includes(' ')
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40 text-rose-900'
                          : 'border-[#DDD5C2] focus:ring-purple-700'
                      }`}
                    />
                  </div>
                  {loginUsername.includes(' ') && (
                    <p className="mt-1 text-[11px] font-bold text-rose-700 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Error: El nombre de usuario no puede contener espacios. No se puede usar usuarios con espacio.</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Contraseña *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-purple-900 font-semibold bg-purple-100/80 px-2 py-0.5 rounded-md border border-purple-200">
                        Máx. 10 dígitos ({loginPassword.length}/10)
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      maxLength={10}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value.slice(0, 10))}
                      placeholder="Máximo 10 caracteres"
                      className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4 text-purple-800" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-500 hover:text-purple-800" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-slate-500">¿Problemas para acceder?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('RECOVER');
                        if (loginUsername && !recoverEmail) setRecoverEmail(loginUsername);
                        setError(null);
                      }}
                      className="text-[11px] font-bold text-purple-900 hover:text-purple-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-purple-700" />
                      <span>Mandar correo para cambiar contraseña</span>
                    </button>
                  </div>
                </div>

                {/* Tarjeta Destacada: Cambiar contraseña por medio de un mensaje por correo */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/70 to-purple-50 border border-purple-200/90 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-purple-950">
                        ¿Olvidaste tu contraseña o necesitas cambiarla?
                      </p>
                      <p className="text-[11px] text-purple-900/80 mt-0.5 leading-relaxed">
                        Recibe un mensaje con el código numérico de 6 dígitos y enlace en tu correo para restablecerla de forma inmediata.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTab('RECOVER');
                            if (loginUsername && !recoverEmail) setRecoverEmail(loginUsername);
                            setError(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Mandar correo para cambiar contraseña</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        {onOpenPasswordRecovery && (
                          <button
                            type="button"
                            onClick={() => onOpenPasswordRecovery(loginUsername)}
                            className="text-[11px] text-purple-900 hover:underline font-semibold cursor-pointer"
                          >
                            Ventana emergente
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-black shadow-lg shadow-purple-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmitting ? 'Verificando con el servidor...' : 'Ingresar a la Página Principal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Switch to Register Banner inside Login */}
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold text-purple-950">¿Eres nuevo funcionario?</p>
                    <p className="text-slate-600 text-[11px]">Regístrate para solicitar autorización al administrador.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setTab('REGISTER'); setError(null); }}
                    className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-sm"
                  >
                    Registrarme
                  </button>
                </div>

                {/* Quick Access Demo Accounts */}
                <div className="pt-3 border-t border-[#ECE5D8] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Cuentas de Administradores (Acceso Protegido por Código)</span>
                    </p>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Firestore
                    </span>
                  </div>

                  {/* Registered General Administrators */}
                  <div className="grid grid-cols-1 gap-1.5">
                    {/* Dra. Carmen Valencia - Rectoría */}
                    <button
                      type="button"
                      onClick={() => openAdminCodePrompt('rectoria', 'admin123', 'Dra. Carmen Valencia', 'Rectora General • Superior')}
                      disabled={isSubmitting}
                      className="p-2 rounded-xl bg-purple-100/90 hover:bg-purple-200 text-purple-950 text-left text-xs font-bold border border-purple-300 transition-all cursor-pointer shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-purple-950 font-black">
                          <span>👑 Dra. Carmen Valencia</span>
                          <span className="text-[10px] text-purple-700 font-normal">rectoria</span>
                        </div>
                        <p className="text-[10px] text-purple-800 font-normal">
                          Rectoría General • Requiere código de administrador
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Entrar</span>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAdminCodePrompt('cristalpulecio@gmail.com', 'admin123', 'Cristal Pulecio', 'Administradora General • Superior')}
                      disabled={isSubmitting}
                      className="p-2 rounded-xl bg-purple-100/90 hover:bg-purple-200 text-purple-950 text-left text-xs font-bold border border-purple-300 transition-all cursor-pointer shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-purple-950 font-black">
                          <span>👑 Cristal Pulecio</span>
                          <span className="text-[10px] text-purple-700 font-normal">cristalpulecio@gmail.com</span>
                        </div>
                        <p className="text-[10px] text-purple-800 font-normal">
                          Administradora General • Requiere código de administrador
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Entrar</span>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAdminCodePrompt('waespinosa2017@gmail.com', 'admin123', 'W. A. Espinosa', 'Administrador General • Superior')}
                      disabled={isSubmitting}
                      className="p-2 rounded-xl bg-indigo-100/90 hover:bg-indigo-200 text-indigo-950 text-left text-xs font-bold border border-indigo-300 transition-all cursor-pointer shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-indigo-950 font-black">
                          <span>👑 W. A. Espinosa</span>
                          <span className="text-[10px] text-indigo-700 font-normal">waespinosa2017@gmail.com</span>
                        </div>
                        <p className="text-[10px] text-indigo-800 font-normal">
                          Administrador General • Requiere código de administrador
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-900 bg-indigo-200/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Entrar</span>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAdminCodePrompt('karollsofiaac19@gmail.com', 'admin123', 'Karoll Sofía', 'Administradora General • Superior')}
                      disabled={isSubmitting}
                      className="p-2 rounded-xl bg-emerald-100/90 hover:bg-emerald-200 text-emerald-950 text-left text-xs font-bold border border-emerald-300 transition-all cursor-pointer shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-950 font-black">
                          <span>👑 Karoll Sofía</span>
                          <span className="text-[10px] text-emerald-700 font-normal">karollsofiaac19@gmail.com</span>
                        </div>
                        <p className="text-[10px] text-emerald-800 font-normal">
                          Administradora General • Requiere código de administrador
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Entrar</span>
                      </span>
                    </button>
                  </div>

                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pt-1">
                    Cuentas de Prueba por Rol Institucional:
                  </p>
                  <div className="space-y-2">
                    {/* Cuenta Administrativa con Bloqueo y Código */}
                    <div className="p-3 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-blue-950">
                            <span>🛠️ Ing. Carlos Ruiz</span>
                            <span className="text-[10px] text-blue-700 font-mono font-normal">coord.mantenimiento</span>
                          </div>
                          <p className="text-[10px] text-blue-800">
                            Rol: <strong>ADMINISTRATIVO</strong> • Acceso: <span className="font-bold text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">Código Protegido</span>
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Bloqueo Activo</span>
                        </span>
                      </div>
                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={() => openAdminCodePrompt('coord.mantenimiento', 'admin123', 'Ing. Carlos Ruiz', 'Coordinador de Infraestructura • Administrativo')}
                          disabled={isSubmitting}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                          title="Pedir código de acceso del administrador para ingresar"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Entrar como Administrador (Pide Código de Acceso)</span>
                        </button>
                      </div>
                    </div>

                    {/* Cuenta Docente (Sin necesidad de código) */}
                    <button
                      type="button"
                      onClick={() => {
                        setLoginUsername('prof.martinez');
                        setLoginPassword('admin123');
                        setLoginAdminCode('');
                        handleQuickLogin('prof.martinez', 'admin123', '');
                      }}
                      disabled={isSubmitting}
                      className="w-full p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-950 text-left text-xs font-bold border border-slate-300 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span>📚 Lic. Jorge Martínez (Docente)</span>
                        <p className="text-[10px] text-slate-600 font-normal">prof.martinez • Sin código requerido</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                        Entrar Libre
                      </span>
                    </button>
                  </div>
                </div>

              </form>
            ) : tab === 'REGISTER' ? (
              /* --- FORMULARIO DE REGISTRO INSTITUCIONAL --- */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Al registrarte, tu solicitud se enviará a la <strong>Rectoría / Administrador</strong> para su aprobación antes de poder acceder.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                    Nombre Completo del Funcionario *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ej: Lic. Pedro Gómez Rodríguez"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Nombre de Usuario *
                      </label>
                      <span className={`text-[10px] font-semibold ${regUsername.includes(' ') ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                        {regUsername.includes(' ') ? '⚠️ Sin espacios' : 'Sin espacios'}
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegUsername(val);
                        if (val.includes(' ')) {
                          setError('El nombre de usuario no puede contener espacios. No se pueden usar usuarios con espacios.');
                        } else if (error && error.includes('espacio')) {
                          setError(null);
                        }
                      }}
                      placeholder="ej: p.gomez o pedrogomez"
                      className={`w-full px-3.5 py-2 rounded-xl bg-white border text-xs sm:text-sm text-slate-900 focus:ring-2 focus:outline-none shadow-sm ${
                        regUsername.includes(' ')
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40 text-rose-900'
                          : 'border-[#DDD5C2] focus:ring-emerald-600'
                      }`}
                    />
                    {regUsername.includes(' ') && (
                      <p className="mt-1 text-[11px] font-bold text-rose-700 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span>Error: El nombre de usuario no puede contener espacios. No se puede usar usuarios con espacio.</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      Correo Institucional *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="p.gomez@institucion.edu.co"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Contraseña *
                    </label>
                    <span className="text-[11px] text-emerald-900 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                      Máx. 10 dígitos ({regPassword.length}/10)
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      maxLength={10}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value.slice(0, 10))}
                      placeholder="Máximo 10 caracteres"
                      className="w-full px-3.5 pr-11 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      title={showRegPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-4 h-4 text-emerald-800" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-500 hover:text-emerald-800" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Institutional Role Selection */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                    Rol Institucional Solicitado *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('DOCENTE')}
                      className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                        regRole === 'DOCENTE'
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'bg-white border-[#DDD5C2] text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      📚 Docente
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('ADMINISTRATIVO')}
                      className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                        regRole === 'ADMINISTRATIVO'
                          ? 'bg-blue-100 border-blue-500 text-blue-950 ring-2 ring-blue-500/20'
                          : 'bg-white border-[#DDD5C2] text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🛠️ Administrativo
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('SUPERIOR')}
                      className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                        regRole === 'SUPERIOR'
                          ? 'bg-purple-100 border-purple-500 text-purple-950 ring-2 ring-purple-500/20'
                          : 'bg-white border-[#DDD5C2] text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      👑 Directivo / Superior
                    </button>
                  </div>
                </div>

                {/* Aviso especial de seguridad para registro de administrativos */}
                {regRole === 'ADMINISTRATIVO' && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/90 border-2 border-blue-200 text-xs text-blue-950 space-y-2">
                    <div className="flex items-center gap-1.5 font-extrabold text-blue-900">
                      <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>Política de Bloqueo para Personal Administrativo</span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Por seguridad institucional, las cuentas de funcionarios administrativos permanecen <strong>bloqueadas</strong> contra accesos no autorizados. Solo se puede ingresar suministrando el <strong>Código de Seguridad Administrativo</strong>.
                    </p>
                    <div>
                      <label className="block text-[11px] font-bold text-blue-950 uppercase tracking-wider mb-1">
                        Código de Seguridad Administrativo Preferido (Opcional)
                      </label>
                      <input
                        type="text"
                        value={regAdminCode}
                        onChange={(e) => setRegAdminCode(e.target.value.toUpperCase())}
                        placeholder="Ej: ADM-5520 (Dejar en blanco para autogenerar)"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-blue-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase"
                      />
                      <span className="text-[10px] text-blue-700 italic block mt-0.5">
                        Si lo dejas en blanco, el sistema generará automáticamente un código único como ADM-XXXX.
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      Cargo o Título Institucional
                    </label>
                    <input
                      type="text"
                      value={regRoleTitle}
                      onChange={(e) => setRegRoleTitle(e.target.value)}
                      placeholder="Ej: Docente de Matemáticas"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs text-slate-900 focus:outline-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      Departamento o Área
                    </label>
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="Ej: Área de Ciencias / Bloque B"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs text-slate-900 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-black shadow-lg shadow-emerald-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registrando y notificando...' : 'Enviar Registro al Administrador'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setTab('LOGIN'); setError(null); }}
                    className="text-xs text-purple-900 hover:text-purple-700 font-bold underline cursor-pointer"
                  >
                    ¿Ya tienes una cuenta aprobada? Inicia sesión aquí
                  </button>
                </div>

              </form>
            ) : (
              /* --- FORMULARIO DIRECTO: MANDAR CORREO PARA CAMBIAR CONTRASEÑA --- */
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Encabezado explicativo */}
                <div className="p-3.5 bg-gradient-to-r from-purple-100 via-indigo-50 to-purple-50 rounded-2xl border border-purple-200/90 text-purple-950 flex items-start gap-3 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-purple-900 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Mail className="w-5 h-5 text-purple-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-purple-950 flex items-center gap-1.5">
                      <span>Mandar correo para cambiar contraseña</span>
                    </h3>
                    <p className="text-xs text-purple-900/85 mt-0.5 leading-relaxed">
                      {recoverStep === 1 
                        ? 'Ingresa tu correo institucional o nombre de usuario registrado. Te enviaremos un mensaje con el código numérico de 6 dígitos con validez de 15 minutos.'
                        : 'Ingresa el código que recibiste por correo y escribe tu nueva contraseña.'}
                    </p>
                  </div>
                </div>

                {/* Mensaje de éxito si lo hay */}
                {recoverSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{recoverSuccessMessage}</span>
                  </div>
                )}

                {/* PASO 1: Ingreso de correo y botón para mandar correo */}
                {recoverStep === 1 && (
                  <form onSubmit={handleRecoverSendEmail} className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        Correo Electrónico o Usuario Registrado *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          autoFocus
                          value={recoverEmail}
                          onChange={(e) => {
                            setRecoverEmail(e.target.value);
                            setError(null);
                          }}
                          onBlur={(e) => {
                            setRecoverEmail(e.target.value.trim().toLowerCase());
                          }}
                          placeholder="ej: cristalpulecio@gmail.com o tu usuario"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm placeholder:text-slate-400"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Se enviará un código de verificación seguro a la bandeja del correo registrado.
                      </p>
                    </div>

                    {/* Botón Principal para mandar el correo */}
                    <button
                      type="submit"
                      disabled={recoverIsSending}
                      id="btn-mandar-correo-login"
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-black shadow-lg shadow-purple-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {recoverIsSending ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Despachando correo y registrando en base de datos...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Mandar correo para cambiar contraseña</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Accesos Rápidos: Cuentas para prueba inmediata */}
                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/60 text-xs">
                      <p className="text-[11px] font-bold text-purple-950 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                        <span>Correos rápidos registrados en el sistema:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['cristalpulecio@gmail.com', 'nicoleespinosa464@gmail.com', 'rectoria'].map((correo) => (
                          <button
                            key={correo}
                            type="button"
                            onClick={() => {
                              setRecoverEmail(correo);
                              setError(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-semibold text-purple-900 hover:bg-purple-100 hover:border-purple-300 transition-colors cursor-pointer"
                          >
                            {correo}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Botones secundarios */}
                    <div className="flex items-center justify-between pt-2 text-xs">
                      {onOpenPasswordRecovery && (
                        <button
                          type="button"
                          onClick={() => onOpenPasswordRecovery(recoverEmail || loginUsername)}
                          className="font-bold text-purple-900 hover:text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir ventana completa</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { setTab('LOGIN'); setError(null); }}
                        className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer ml-auto"
                      >
                        ← Volver a Iniciar Sesión
                      </button>
                    </div>
                  </form>
                )}

                {/* PASO 2: Ingresar código y nueva contraseña */}
                {recoverStep === 2 && (
                  <form onSubmit={handleRecoverSavePassword} className="space-y-4">
                    
                    {/* Tarjeta de estado de entrega de correo */}
                    {recoverSmtpDelivered ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <p className="font-bold text-emerald-900">¡Correo enviado con éxito!</p>
                          <p className="text-[11px] text-emerald-800">Revisa la bandeja de entrada o spam de <strong>{recoverEmail}</strong>.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2 shadow-xs">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-amber-950">Aviso del servidor de correo Gmail</p>
                            <p className="text-[11px] text-amber-900 leading-relaxed">
                              Google requiere una contraseña de aplicación de 16 caracteres para enviar correos directamente por SMTP. ¡Sin embargo, el código está activo y puedes mandar el correo con 1 clic!
                            </p>
                          </div>
                        </div>

                        {/* Botones para mandar el correo en 1 clic */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recoverEmail)}&su=${encodeURIComponent('Código de Recuperación RDMI: ' + (recoverDevOtp || ''))}&body=${encodeURIComponent('Tu código de recuperación de contraseña para el Sistema RDMI es: ' + (recoverDevOtp || '') + '\n\nTiene una validez de 15 minutos.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white border border-amber-300 text-amber-950 hover:bg-amber-100/60 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                            <span>Mandar correo en Gmail Web</span>
                          </a>

                          <a
                            href={`mailto:${recoverEmail}?subject=${encodeURIComponent('Código de Recuperación RDMI')}&body=${encodeURIComponent('Tu código de recuperación de contraseña es: ' + (recoverDevOtp || '') + ' (válido por 15 minutos).')}`}
                            className="p-2 rounded-xl bg-white border border-amber-300 text-amber-950 hover:bg-amber-100/60 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-amber-700" />
                            <span>Abrir en mi app de correo</span>
                          </a>
                        </div>

                        {/* Mostrar código activo con botón de pegar */}
                        {recoverDevOtp && (
                          <div className="p-2 bg-purple-100/80 rounded-xl border border-purple-300 flex items-center justify-between text-purple-950">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-purple-800">Código activo en BD:</span>
                              <p className="font-mono text-base font-black tracking-widest text-purple-950">{recoverDevOtp}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setRecoverOtpCode(recoverDevOtp);
                                setRecoverCopied(true);
                                setTimeout(() => setRecoverCopied(false), 2500);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            >
                              {recoverCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{recoverCopied ? 'Pegado!' : 'Pegar código'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Campo: Código de 6 dígitos */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        Código de Verificación (6 dígitos) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={recoverOtpCode}
                        onChange={(e) => setRecoverOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Ej: 123456"
                        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-center font-mono text-lg tracking-widest font-black text-purple-950 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm"
                      />
                    </div>

                    {/* Campo: Nueva Contraseña */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        Nueva Contraseña (4 a 20 caracteres) *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={recoverShowNewPassword ? 'text' : 'password'}
                          required
                          maxLength={20}
                          value={recoverNewPassword}
                          onChange={(e) => setRecoverNewPassword(e.target.value.slice(0, 20))}
                          placeholder="Ingresa tu nueva contraseña"
                          className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setRecoverShowNewPassword(!recoverShowNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-purple-900"
                        >
                          {recoverShowNewPassword ? <EyeOff className="w-4 h-4 text-purple-800" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Campo: Confirmar Contraseña */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        Confirmar Nueva Contraseña *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={recoverShowNewPassword ? 'text' : 'password'}
                          required
                          maxLength={20}
                          value={recoverConfirmPassword}
                          onChange={(e) => setRecoverConfirmPassword(e.target.value.slice(0, 20))}
                          placeholder="Repite tu nueva contraseña"
                          className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm placeholder:text-slate-400"
                        />
                      </div>
                      {recoverNewPassword && recoverConfirmPassword && (
                        <p className={`text-[11px] mt-1 font-bold ${recoverNewPassword === recoverConfirmPassword ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {recoverNewPassword === recoverConfirmPassword ? '✓ Las contraseñas coinciden' : '⚠️ Las contraseñas no coinciden'}
                        </p>
                      )}
                    </div>

                    {/* Botón de Guardar Contraseña */}
                    <button
                      type="submit"
                      disabled={recoverIsSaving}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-black shadow-lg shadow-purple-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {recoverIsSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Guardando nueva contraseña con encriptación segura...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Guardar y Cambiar Contraseña</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Botones para regresar */}
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setRecoverStep(1);
                          setError(null);
                        }}
                        className="text-purple-900 hover:text-purple-700 font-bold underline cursor-pointer"
                      >
                        ← Solicitar otro código / correo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTab('LOGIN');
                          setError(null);
                        }}
                        className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                      >
                        Volver al inicio
                      </button>
                    </div>

                  </form>
                )}

              </div>
            )}

          </div>

          {/* Footer note inside card */}
          <div className="p-3.5 bg-[#F5EFE4] border-t border-[#ECE5D8] text-center text-[11px] text-slate-600">
            <span>🛡️ Sistema de Gestión y Mantenimiento Escolar • Arquitectura Hexagonal</span>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="max-w-6xl w-full mx-auto py-3 text-center text-xs text-slate-400 border-t border-indigo-950/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© RDMI Institucional - Control Integral de Infraestructura y Equipamiento</p>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400">⚡ Eléctricos</span>
          <span className="text-blue-400">🏢 Estructurales</span>
          <span className="text-purple-400">📦 Recursos</span>
        </div>
      </footer>

      {/* Modal para solicitar el Código de Acceso del Administrador al presionar Entrar */}
      {adminCodePrompt && adminCodePrompt.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FDFBF7] rounded-3xl border-2 border-amber-400/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-950 via-purple-950 to-slate-950 text-white flex items-center justify-between border-b border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/40">
                    Seguridad Institucional
                  </span>
                  <h4 className="text-base font-black text-white mt-0.5">
                    Código de Acceso del Administrador
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminCodePrompt(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAdminCodeSubmit} className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950">
                    {adminCodePrompt.displayName}
                  </span>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                    Administrador
                  </span>
                </div>
                <p className="text-[11px] text-amber-900">
                  {adminCodePrompt.roleTitle} • <span className="font-mono">{adminCodePrompt.username}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Código de Acceso Determinado por el Administrador *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    required
                    value={adminCodePrompt.enteredCode}
                    onChange={(e) => setAdminCodePrompt(prev => prev ? { ...prev, enteredCode: e.target.value, error: null } : null)}
                    placeholder="Ingrese el código de acceso"
                    className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-amber-400 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-600 focus:outline-none shadow-sm tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  🛡️ Para ingresar a esta cuenta administrativa, debe suministrar el código de acceso institucional determinado por el administrador.
                </p>
              </div>

              {adminCodePrompt.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>{adminCodePrompt.error}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminCodePrompt(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adminCodePrompt.isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-black shadow-md shadow-amber-950/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{adminCodePrompt.isSubmitting ? 'Verificando...' : 'Verificar y Entrar'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
