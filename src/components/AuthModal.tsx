import React, { useState } from 'react';
import {
  X,
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
  Briefcase
} from 'lucide-react';
import { UserRole, User as UserEntity } from '../core/domain/entities';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  }) => Promise<{ message: string }>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Demo shortcut login
  const handleQuickLogin = async (username: string, pass: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onLogin(username, pass);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onLogin(loginUsername.trim(), loginPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!regUsername.trim() || !regEmail.trim() || !regPassword || !regName.trim()) {
      setError('Por favor diligencie todos los campos requeridos.');
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
        roleTitle: regRoleTitle.trim() || (regRole === 'DOCENTE' ? 'Docente Titular' : regRole === 'ADMINISTRATIVO' ? 'Coordinador Administrativo' : 'Directivo'),
        department: regDepartment.trim() || 'General'
      });
      setSuccessMessage(res.message);
      // Clean register form
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegName('');
      setRegRoleTitle('');
      setRegDepartment('');
    } catch (err: any) {
      setError(err.message || 'Error en el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-md w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white text-center relative border-b border-indigo-900/60">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-purple-950/50 ring-2 ring-purple-400/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-black text-white">
            Sistema de Mantenimiento Institucional
          </h3>
          <p className="text-xs text-purple-200 mt-0.5">
            Acceso seguro para Docentes, Administrativos y Superiores
          </p>
        </div>

        {/* Prohibited for Students Notice Banner */}
        <div className="bg-rose-50 border-y border-rose-200 px-4 py-2 flex items-center gap-2 text-rose-900 text-xs font-semibold">
          <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Acceso exclusivo institucional. Prohibido el ingreso a estudiantes.</span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-[#F2ECE0] border-b border-[#E3DCBD] gap-1">
          <button
            onClick={() => { setTab('LOGIN'); setError(null); setSuccessMessage(null); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'LOGIN'
                ? 'bg-[#FDFBF7] text-purple-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setTab('REGISTER'); setError(null); setSuccessMessage(null); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'REGISTER'
                ? 'bg-[#FDFBF7] text-purple-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registrar Personal
          </button>
        </div>

        <div className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">¡Solicitud Registrada!</p>
                <p className="text-[11px] font-normal mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {tab === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Usuario o Correo Institucional
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ej: rectoria o j.martinez@institucion.edu.co"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSubmitting ? 'Verificando credenciales...' : 'Ingresar a la Plataforma'}</span>
              </button>

              {/* Quick Demo Credentials for instantaneous test */}
              <div className="pt-3 border-t border-[#ECE5D8] space-y-2">
                <p className="text-[11px] font-bold text-slate-500 text-center uppercase tracking-wider">
                  ⚡ Ingreso Rápido con Cuentas Demo
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('rectoria', 'password123')}
                    className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 text-center text-[10px] font-bold border border-purple-300 transition-colors cursor-pointer"
                  >
                    👑 Rectora (Superior)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('coord.mantenimiento', 'password123')}
                    className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-950 text-center text-[10px] font-bold border border-blue-300 transition-colors cursor-pointer"
                  >
                    🛠️ Mantenimiento (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('prof.martinez', 'password123')}
                    className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-center text-[10px] font-bold border border-emerald-300 transition-colors cursor-pointer"
                  >
                    📚 Docente Ciencias
                  </button>
                </div>
              </div>

            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nombre Completo del Funcionario *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ej: Lic. Hernán Rodríguez"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C2] text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="ej: prof.rodriguez"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C2] text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C2] text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="h.rodriguez@institucion.edu.co"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C2] text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-purple-950 mb-1">
                  Rol Institucional Solicitado *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="DOCENTE">Docente (Profesor de Área / Titular)</option>
                  <option value="ADMINISTRATIVO">Administrativo (Coordinador / Servicios Generales / Secretaría)</option>
                  <option value="SUPERIOR">Superior (Rectoría / Directivo General)</option>
                </select>
                <p className="text-[10px] text-purple-900 font-medium mt-1">
                  * Un superior revisará y autorizará su perfil antes de permitir el ingreso.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Cargo Específico
                  </label>
                  <input
                    type="text"
                    value={regRoleTitle}
                    onChange={(e) => setRegRoleTitle(e.target.value)}
                    placeholder="Ej: Docente de Matemáticas"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C2] text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Área / Departamento
                  </label>
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="Ej: Secundaria"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C2] text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Registrando...' : 'Enviar Solicitud de Registro'}</span>
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
