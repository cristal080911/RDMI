import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Search,
  Users,
  Building,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Download,
  Copy,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { User, UserRole } from '../core/domain/entities';

interface AuthorizedPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onFetchUsers: () => Promise<User[]>;
}

export const AuthorizedPersonnelModal: React.FC<AuthorizedPersonnelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onFetchUsers
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [includeStatsSummary, setIncludeStatsSummary] = useState(true);
  const [copied, setCopied] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await onFetchUsers();
      // Only approved active users
      const approvedUsers = data.filter((u) => u.status === 'APPROVED');
      setUsers(approvedUsers);
    } catch (err) {
      console.error('Error fetching authorized users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.roleTitle.toLowerCase().includes(term) ||
        u.department.toLowerCase().includes(term);
      return matchRole && matchSearch;
    });
  }, [users, roleFilter, searchTerm]);

  // Counts by role
  const counts = useMemo(() => {
    const superior = users.filter((u) => u.role === 'SUPERIOR').length;
    const admin = users.filter((u) => u.role === 'ADMINISTRATIVO').length;
    const docente = users.filter((u) => u.role === 'DOCENTE').length;
    return { total: users.length, superior, admin, docente };
  }, [users]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTable = () => {
    if (filteredUsers.length === 0) return;
    const headers = ['No.', 'Nombre Completo', 'Rol', 'Cargo', 'Departamento', 'Correo', 'Usuario', 'Estado'];
    const rows = filteredUsers.map((u, i) => [
      i + 1,
      `"${u.name}"`,
      `"${u.role}"`,
      `"${u.roleTitle}"`,
      `"${u.department}"`,
      `"${u.email}"`,
      `"${u.username}"`,
      '"AUTORIZADO"'
    ]);
    const csvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) return;
    const headers = ['No,Nombre,Rol,Cargo,Departamento,Email,Usuario,Estado,Fecha_Aprobacion'];
    const rows = filteredUsers.map((u, i) => [
      i + 1,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.role}"`,
      `"${u.roleTitle.replace(/"/g, '""')}"`,
      `"${u.department.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.username}"`,
      '"AUTORIZADO"',
      `"${u.approvedAt ? new Date(u.approvedAt).toLocaleDateString() : 'Activo'}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `personal_autorizado_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentDateFormatted = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const currentTimeFormatted = new Date().toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-5xl w-full my-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none print:my-0 printable-document">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print p-4 sm:p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 flex items-center justify-center border border-emerald-400/30 text-emerald-300 shrink-0">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded border border-emerald-600">
                  Reporte Institucional
                </span>
                <span className="text-[10px] text-purple-200 bg-purple-900/70 px-2 py-0.5 rounded border border-purple-600/50">
                  {counts.total} Personas Autorizadas
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white mt-0.5">
                Listado y Directorio Oficial de Personal Autorizado
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Lista</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Options Toolbar (Hidden when printing) */}
        <div className="no-print p-3 sm:p-4 bg-[#F2ECE0] border-b border-[#E3DCBD] space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, cargo, departamento, usuario o correo..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-[#E5DEC9] p-1 rounded-xl">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  roleFilter === 'ALL'
                    ? 'bg-white text-purple-950 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Todos ({counts.total})
              </button>
              <button
                onClick={() => setRoleFilter('SUPERIOR')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  roleFilter === 'SUPERIOR'
                    ? 'bg-purple-900 text-purple-100 shadow-sm'
                    : 'text-purple-900 hover:text-purple-950'
                }`}
              >
                Directivos ({counts.superior})
              </button>
              <button
                onClick={() => setRoleFilter('ADMINISTRATIVO')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  roleFilter === 'ADMINISTRATIVO'
                    ? 'bg-blue-900 text-blue-100 shadow-sm'
                    : 'text-blue-900 hover:text-blue-950'
                }`}
              >
                Administrativos ({counts.admin})
              </button>
              <button
                onClick={() => setRoleFilter('DOCENTE')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  roleFilter === 'DOCENTE'
                    ? 'bg-emerald-900 text-emerald-100 shadow-sm'
                    : 'text-emerald-900 hover:text-emerald-950'
                }`}
              >
                Docentes ({counts.docente})
              </button>
            </div>
          </div>

          {/* Additional Print Options & Quick Export */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#DDD5C2]/60 text-xs text-slate-700">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer select-none font-semibold">
                <input
                  type="checkbox"
                  checked={includeSignatures}
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                  className="rounded text-purple-700 focus:ring-purple-600"
                />
                <span>Incluir bloque de firmas y sellos oficiales</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none font-semibold">
                <input
                  type="checkbox"
                  checked={includeStatsSummary}
                  onChange={(e) => setIncludeStatsSummary(e.target.checked)}
                  className="rounded text-purple-700 focus:ring-purple-600"
                />
                <span>Incluir resumen estadístico de cargos</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTable}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-[#DDD5C2] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                title="Copiar datos al portapapeles"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-[#DDD5C2] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                title="Descargar archivo CSV compatible con Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Document Sheet Container */}
        <div
          ref={printAreaRef}
          className="p-4 sm:p-8 space-y-6 max-h-[72vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 print:space-y-4"
        >
          
          {/* Institutional Printable Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-800 to-emerald-700 flex items-center justify-center text-white font-black shadow-md print:border-2 print:border-black print:bg-white print:text-black">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-700">
                  INSTITUCIÓN EDUCATIVA • DIRECCIÓN GENERAL Y RECTORÍA
                </p>
                <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                  LISTADO OFICIAL DE PERSONAL INSTITUCIONAL AUTORIZADO
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Sistema de Gestión de Mantenimiento de Infraestructura (SIGMA)
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] text-slate-600 bg-[#F4EFE6] print:bg-transparent p-2.5 rounded-xl border border-[#E2DBCE] print:border-none print:p-0">
              <p>
                <strong className="text-slate-900">Fecha de Emisión:</strong> {currentDateFormatted}
              </p>
              <p>
                <strong className="text-slate-900">Hora:</strong> {currentTimeFormatted}
              </p>
              <p>
                <strong className="text-slate-900">Emitido por:</strong> {currentUser?.name || 'Administración Central'} ({currentUser?.role || 'SUPERIOR'})
              </p>
              <p className="text-[10px] text-emerald-800 font-bold mt-0.5">
                ● Registro Central Firestore Conectado
              </p>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-center justify-between print:text-[10px] print:p-2">
            <div>
              <span className="font-bold">Validez Oficial:</span> Este documento certifica al personal docente, administrativo y directivo con autorización vigente para el reporte, seguimiento y gestión de incidentes y recursos de la institución.
            </div>
            <div className="font-bold text-amber-900 uppercase shrink-0 pl-2">
              USO OFICIAL
            </div>
          </div>

          {/* Stats Summary Cards (Printed if checked) */}
          {includeStatsSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:grid-cols-4 print:gap-2">
              <div className="p-3 rounded-2xl bg-white border border-[#DDD5C2] shadow-sm print:border-black print:p-2">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
                  <span>Total Personal</span>
                  <Users className="w-4 h-4 text-purple-700 print:text-black" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{counts.total}</p>
                <p className="text-[10px] text-slate-500">Cuentas aprobadas</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 shadow-sm print:border-black print:bg-white print:p-2">
                <div className="flex items-center justify-between text-purple-900 text-[11px] font-bold uppercase">
                  <span>Directivos</span>
                  <Building className="w-4 h-4 text-purple-700 print:text-black" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-purple-950 print:text-black mt-1">{counts.superior}</p>
                <p className="text-[10px] text-purple-800 print:text-black">Rectoría / Coord. Sup.</p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 shadow-sm print:border-black print:bg-white print:p-2">
                <div className="flex items-center justify-between text-blue-900 text-[11px] font-bold uppercase">
                  <span>Administrativos</span>
                  <Briefcase className="w-4 h-4 text-blue-700 print:text-black" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-blue-950 print:text-black mt-1">{counts.admin}</p>
                <p className="text-[10px] text-blue-800 print:text-black">Mantenimiento y Gestión</p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-sm print:border-black print:bg-white print:p-2">
                <div className="flex items-center justify-between text-emerald-900 text-[11px] font-bold uppercase">
                  <span>Docentes</span>
                  <GraduationCap className="w-4 h-4 text-emerald-700 print:text-black" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-950 print:text-black mt-1">{counts.docente}</p>
                <p className="text-[10px] text-emerald-800 print:text-black">Cuerpo de Profesores</p>
              </div>
            </div>
          )}

          {/* Main Table of Authorized Users */}
          <div className="bg-white rounded-2xl border border-[#DDD5C2] shadow-sm overflow-hidden print:border-black print:rounded-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white print:bg-slate-200 print:text-black text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-900">
                    <th className="py-2.5 px-3 w-10 text-center border-r border-slate-700 print:border-black">No.</th>
                    <th className="py-2.5 px-3 border-r border-slate-700 print:border-black">Funcionario / Nombre</th>
                    <th className="py-2.5 px-3 border-r border-slate-700 print:border-black">Rol Institucional</th>
                    <th className="py-2.5 px-3 border-r border-slate-700 print:border-black">Cargo / Asignación</th>
                    <th className="py-2.5 px-3 border-r border-slate-700 print:border-black">Departamento</th>
                    <th className="py-2.5 px-3 border-r border-slate-700 print:border-black">Correo Institucional</th>
                    <th className="py-2.5 px-3 border-r border-slate-700 print:border-black">Usuario</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D2] print:divide-black text-xs text-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500 font-semibold">
                        Cargando directorio de personal...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500 font-semibold">
                        No se encontraron registros de personal con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <tr
                        key={user.id}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7EE] print:bg-slate-50'}
                      >
                        <td className="py-2.5 px-3 text-center font-bold text-slate-600 border-r border-[#EAE3D2] print:border-black print:text-black">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-[#EAE3D2] print:border-black">
                          <div className="flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.role === 'SUPERIOR' && (
                              <span className="text-[10px] text-purple-700 no-print" title="Directivo Superior">
                                ★
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-[#EAE3D2] print:border-black">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              user.role === 'SUPERIOR'
                                ? 'bg-purple-100 text-purple-950 border border-purple-300 print:border-none print:p-0'
                                : user.role === 'ADMINISTRATIVO'
                                ? 'bg-blue-100 text-blue-950 border border-blue-300 print:border-none print:p-0'
                                : 'bg-emerald-100 text-emerald-950 border border-emerald-300 print:border-none print:p-0'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium border-r border-[#EAE3D2] print:border-black">
                          {user.roleTitle || 'Sin especificar'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 border-r border-[#EAE3D2] print:border-black">
                          {user.department || 'General'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 border-r border-[#EAE3D2] print:border-black">
                          {user.email}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-purple-900 font-semibold border-r border-[#EAE3D2] print:border-black print:text-black">
                          {user.username}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 print:border-none print:bg-transparent print:text-black">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700 print:hidden" />
                            AUTORIZADO
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Summary Count */}
            <div className="p-3 bg-[#F4EFE6] border-t border-[#DDD5C2] flex items-center justify-between text-xs text-slate-600 print:bg-transparent print:border-black">
              <span>
                Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> personas autorizadas
              </span>
              <span className="font-bold text-slate-800">
                Padrón Oficial de Funcionarios Activos
              </span>
            </div>
          </div>

          {/* Institutional Signatures & Stamp Block */}
          {includeSignatures && (
            <div className="pt-6 mt-4 border-t-2 border-slate-900 space-y-4 print:pt-4">
              <div className="text-center font-bold text-xs text-slate-700 uppercase tracking-wider mb-6">
                Constancia y Firmas de Autorización Institucional
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                {/* Signature 1 */}
                <div className="space-y-1">
                  <div className="border-b-2 border-slate-800 w-4/5 mx-auto h-12 flex items-end justify-center pb-1">
                    <span className="font-script text-slate-400 italic text-sm">Firma Autorizada</span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 mt-2">Dra. Carmen Valencia / Cristal Pulecio</p>
                  <p className="text-[10px] text-slate-600">Rectoría / Dirección General</p>
                </div>

                {/* Signature 2 */}
                <div className="space-y-1">
                  <div className="border-b-2 border-slate-800 w-4/5 mx-auto h-12 flex items-end justify-center pb-1">
                    <span className="font-script text-slate-400 italic text-sm">Firma y Visto Bueno</span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 mt-2">Ing. Carlos Ruiz / W. A. Espinosa</p>
                  <p className="text-[10px] text-slate-600">Coordinación de Infraestructura y Mantenimiento</p>
                </div>

                {/* Stamp 3 */}
                <div className="space-y-1">
                  <div className="border-2 border-dashed border-slate-400 rounded-xl w-4/5 mx-auto h-14 flex items-center justify-center p-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                      SELLO INSTITUCIONAL<br />SIGMA CENTRAL
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 mt-1">Folio de Certificación</p>
                  <p className="text-[10px] text-slate-500 font-mono">SIGMA-AUTH-{Date.now().toString().slice(-6)}</p>
                </div>
              </div>

              {/* Security Footnote */}
              <p className="text-[9px] sm:text-[10px] text-slate-500 text-center leading-relaxed pt-2">
                Documento emitido conforme a las políticas de seguridad institucional. Prohibida la divulgación no autorizada de credenciales o datos de contacto. Cualquier irregularidad debe ser notificada a la Dirección General.
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions (Hidden when printing) */}
        <div className="no-print p-4 bg-[#F5EFE4] border-t border-[#ECE5D8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Tip: Para guardar como PDF, seleccione <strong>"Guardar como PDF"</strong> en el destino de su impresora.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Documento</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
