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
  Info
} from 'lucide-react';
import { UserRole, User as UserEntity } from '../core/domain/entities';

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<UserEntity>;
  onRegister: (payload: {
    username: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    roleTitle: string;
    department: string;
    isStudent?: boolean;
  }) => Promise<{ success: boolean; message: string; user?: UserEntity }>;
  onOpenArchitectureModal: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onRegister,
  onOpenArchitectureModal
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('DOCENTE');
  const [regRoleTitle, setRegRoleTitle] = useState('');
  const [regDepartment, setRegDepartment] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccessInfo, setRegisteredSuccessInfo] = useState<{
    message: string;
    username: string;
    name: string;
    role: string;
  } | null>(null);

  // Demo shortcut login
  const handleQuickLogin = async (username: string, pass: string) => {
    setError(null);
    setRegisteredSuccessInfo(null);
    setIsSubmitting(true);
    try {
      await onLogin(username, pass);
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
    setError(null);
    setRegisteredSuccessInfo(null);
    setIsSubmitting(true);
    try {
      await onLogin(loginUsername.trim(), loginPassword);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
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

    setIsSubmitting(true);
    try {
      const res = await onRegister({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        name: regName.trim(),
        role: regRole,
        roleTitle: regRoleTitle.trim() || (regRole === 'DOCENTE' ? 'Docente Titular' : regRole === 'ADMINISTRATIVO' ? 'Coordinador Administrativo' : 'Directivo Institucional'),
        department: regDepartment.trim() || 'Sede Principal'
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
      setTab('LOGIN');
    } catch (err: any) {
      setError(err.message || 'Error en el registro institucional');
    } finally {
      setIsSubmitting(false);
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
              <span className="text-emerald-400">SIGMA</span>
              <span className="text-purple-300">Institucional</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300">
              Sistema de Mantenimiento • Eléctricos • Estructurales • Recursos
            </p>
          </div>
        </div>

        <button
          onClick={onOpenArchitectureModal}
          className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-700/50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Arquitectura Hexagonal</span>
        </button>
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

          {/* Tab Navigation: Iniciar Sesión / Registrarse */}
          <div className="grid grid-cols-2 p-2 bg-[#F2ECE0] border-b border-[#E3DCBD] gap-1.5">
            <button
              type="button"
              onClick={() => { setTab('LOGIN'); setError(null); }}
              className={`py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'LOGIN'
                  ? 'bg-[#FDFBF7] text-purple-950 shadow-md border border-[#DDD5C2]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <KeyRound className="w-4 h-4 text-purple-800" />
              <span>1. Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => { setTab('REGISTER'); setError(null); }}
              className={`py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'REGISTER'
                  ? 'bg-[#FDFBF7] text-purple-950 shadow-md border border-[#DDD5C2]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>2. Registrarse</span>
            </button>
          </div>

          <div className="p-5 sm:p-7 space-y-4">
            
            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-bold flex items-start gap-2.5 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="leading-snug">{error}</p>
                </div>
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
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                    Usuario o Correo Institucional *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="ej: rectoria o j.martinez@institucion.edu.co"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Contraseña *
                    </label>
                    <span className="text-[11px] text-purple-900 font-semibold">
                      Seguridad institucional
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm placeholder:text-slate-400"
                    />
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
                      <span>Administradores Generales (Firebase Cloud)</span>
                    </p>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Firestore
                    </span>
                  </div>

                  {/* Registered General Administrators */}
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('cristalpulecio@gmail.com', 'password123')}
                      disabled={isSubmitting}
                      className="p-2 rounded-xl bg-purple-100/90 hover:bg-purple-200 text-purple-950 text-left text-xs font-bold border border-purple-300 transition-all cursor-pointer shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-purple-950 font-black">
                          <span>👑 Cristal Pulecio</span>
                          <span className="text-[10px] text-purple-700 font-normal">cristalpulecio@gmail.com</span>
                        </div>
                        <p className="text-[10px] text-purple-800 font-normal">
                          Administradora General • Privilegios Totales
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded-lg">Entrar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('waespinosa2017@gmail.com', 'password123')}
                      disabled={isSubmitting}
                      className="p-2 rounded-xl bg-indigo-100/90 hover:bg-indigo-200 text-indigo-950 text-left text-xs font-bold border border-indigo-300 transition-all cursor-pointer shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-indigo-950 font-black">
                          <span>👑 W. A. Espinosa</span>
                          <span className="text-[10px] text-indigo-700 font-normal">waespinosa2017@gmail.com</span>
                        </div>
                        <p className="text-[10px] text-indigo-800 font-normal">
                          Administrador General • Control de Infraestructura
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-900 bg-indigo-200/80 px-2 py-0.5 rounded-lg">Entrar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('karollsofiaac19@gmail.com', 'password123')}
                      disabled={isSubmitting}
                      className="p-2 rounded-xl bg-emerald-100/90 hover:bg-emerald-200 text-emerald-950 text-left text-xs font-bold border border-emerald-300 transition-all cursor-pointer shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-950 font-black">
                          <span>👑 Karoll Sofía</span>
                          <span className="text-[10px] text-emerald-700 font-normal">karollsofiaac19@gmail.com</span>
                        </div>
                        <p className="text-[10px] text-emerald-800 font-normal">
                          Administradora General • Coordinación Superior
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-lg">Entrar</span>
                    </button>
                  </div>

                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pt-1">
                    Otras Cuentas Demo:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('coord.mantenimiento', 'password123')}
                      disabled={isSubmitting}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 text-left text-xs font-bold border border-blue-200 transition-all cursor-pointer"
                    >
                      <span>🛠️ Mantenimiento</span>
                      <p className="text-[10px] text-blue-700 font-normal">coord.mantenimiento</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('prof.martinez', 'password123')}
                      disabled={isSubmitting}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-950 text-left text-xs font-bold border border-slate-300 transition-all cursor-pointer"
                    >
                      <span>📚 Docente de Aula</span>
                      <p className="text-[10px] text-slate-700 font-normal">prof.martinez</p>
                    </button>
                  </div>
                </div>

              </form>
            ) : (
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
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                      Nombre de Usuario *
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="ej: p.gomez"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-sm"
                    />
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
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-sm"
                  />
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
        <p>© SIGMA Institucional - Control Integral de Infraestructura y Equipamiento</p>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400">⚡ Eléctricos</span>
          <span className="text-blue-400">🏢 Estructurales</span>
          <span className="text-purple-400">📦 Recursos</span>
        </div>
      </footer>

    </div>
  );
};
