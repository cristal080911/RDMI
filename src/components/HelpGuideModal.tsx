import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  BookOpen,
  Zap,
  Building2,
  Package,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Users,
  KeyRound,
  PlusCircle,
  Clock,
  Eye,
  Camera,
  Layers,
  Sparkles,
  ArrowRight,
  Printer,
  Search,
  SlidersHorizontal,
  FileText,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'INICIO' | 'AREAS' | 'ROLES' | 'REPORTES' | 'SEGURIDAD' | 'FAQ';
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'INICIO'
}) => {
  const [activeSection, setActiveSection] = useState<'INICIO' | 'AREAS' | 'ROLES' | 'REPORTES' | 'SEGURIDAD' | 'FAQ'>(defaultTab);
  const [faqSearch, setFaqSearch] = useState('');

  if (!isOpen) return null;

  const faqs = [
    {
      q: '¿Quiénes pueden utilizar esta aplicación?',
      a: 'La plataforma está diseñada exclusivamente para personal de la institución: Docentes de aula, Coordinadores y Administrativos, y Directivos/Superiores. El acceso a estudiantes no está permitido por normas institucionales.'
    },
    {
      q: '¿Cómo reporto un elemento dañado o consulto la lista de reportes?',
      a: 'Haz clic en el botón "Tabla de Reportes" ubicado en la barra superior. Al ingresar se abrirá el listado consolidado de todos los reportes de daños registrados, donde puedes filtrar por área o urgencia, y hacer clic en "+ Reportar Daño / Nuevo" para registrar una nueva avería con foto y ubicación.'
    },
    {
      q: '¿Cómo registro avances o el arreglo de un elemento?',
      a: 'En la tabla de elementos, haz clic en el botón "Avances" del elemento deseado. Allí podrás registrar la descripción del trabajo realizado, porcentaje de progreso y foto de la evidencia. Al llegar al 100%, el estado pasará automáticamente a "Reparado / Operativo".'
    },
    {
      q: '¿Por qué no se permiten espacios en el nombre de usuario?',
      a: 'Por política de seguridad y estandarización del sistema institucional, los nombres de usuario no pueden contener espacios en blanco. Debe ser un identificador continuo (por ejemplo: j.martinez, pedrogomez o prof_ruiz). Si ingresa espacios, el sistema mostrará una advertencia y bloqueará el formulario hasta corregirlo.'
    },
    {
      q: '¿Por qué mi contraseña tiene un límite de 10 caracteres?',
      a: 'Por política de seguridad y estandarización del sistema institucional, todas las claves de acceso tienen un máximo de 10 dígitos o caracteres para facilitar su memorización y validación segura.'
    },
    {
      q: '¿Cómo recupero o cambio mi contraseña?',
      a: 'En la pantalla de ingreso haz clic en "¿Olvidó su contraseña? Recuperar / Cambiar" para restablecerla mediante tu usuario y correo. Si ya estás conectado, haz clic en el botón "Cambiar Clave" en la barra superior.'
    },
    {
      q: '¿Cómo se aprueba a un nuevo funcionario registrado?',
      a: 'Los directivos y administradores reciben notificaciones en vivo. Al abrir el panel "Aprobaciones" en la barra superior, pueden revisar las solicitudes y autorizar a los nuevos funcionarios asignándoles su rol correspondiente.'
    },
    {
      q: '¿Los datos se guardan y sincronizan entre varios dispositivos?',
      a: 'Sí, la plataforma está conectada a la base de datos en la nube (Firebase Firestore) y cuenta con sincronización automática cada pocos segundos, permitiendo que docentes y directivos vean los cambios en tiempo real desde cualquier computador o celular.'
    },
    {
      q: '¿Cómo imprimo la lista oficial de personal autorizado?',
      a: 'Haz clic en el botón "Lista Autorizados" en la barra superior. Se abrirá un directorio oficial listo con vista de impresión y exportación.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-4xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 flex items-center justify-center border border-purple-400/40 text-white shadow-lg shadow-purple-950/50">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-emerald-900/80 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  Manual Interactivo de Usuario
                </span>
                <span className="text-[10px] text-purple-200 bg-purple-900/60 px-2 py-0.5 rounded-full hidden sm:inline">
                  SIGMA Institucional
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1 tracking-tight">
                ¿Cómo manejar y utilizar la aplicación?
              </h2>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Cerrar ventana de ayuda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 p-2 bg-[#F2ECE0] border-b border-[#E3DCBD] overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveSection('INICIO')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'INICIO'
                ? 'bg-[#FDFBF7] text-purple-950 shadow-sm border border-[#DDD5C2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
            <span>1. Guía Rápida</span>
          </button>

          <button
            onClick={() => setActiveSection('AREAS')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'AREAS'
                ? 'bg-[#FDFBF7] text-purple-950 shadow-sm border border-[#DDD5C2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-700" />
            <span>2. Áreas de Mantenimiento</span>
          </button>

          <button
            onClick={() => setActiveSection('REPORTES')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'REPORTES'
                ? 'bg-[#FDFBF7] text-purple-950 shadow-sm border border-[#DDD5C2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>3. Reportar y Registrar Avances</span>
          </button>

          <button
            onClick={() => setActiveSection('ROLES')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'ROLES'
                ? 'bg-[#FDFBF7] text-purple-950 shadow-sm border border-[#DDD5C2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>4. Roles y Permisos</span>
          </button>

          <button
            onClick={() => setActiveSection('SEGURIDAD')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'SEGURIDAD'
                ? 'bg-[#FDFBF7] text-purple-950 shadow-sm border border-[#DDD5C2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-700" />
            <span>5. Cuentas y Claves</span>
          </button>

          <button
            onClick={() => setActiveSection('FAQ')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'FAQ'
                ? 'bg-[#FDFBF7] text-purple-950 shadow-sm border border-[#DDD5C2]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-700" />
            <span>6. Preguntas Frecuentes</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm">
          
          {/* 1. GUÍA RÁPIDA DE INICIO */}
          {activeSection === 'INICIO' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950">
                <div className="flex items-center gap-2 font-black text-sm text-purple-900 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  <span>Bienvenido a SIGMA Institucional</span>
                </div>
                <p className="text-xs text-purple-900/90 leading-relaxed">
                  Esta plataforma centraliza y simplifica el control, supervisión, reporte de daños y seguimiento del mantenimiento en toda la institución educativa. Sigue estos 4 pasos básicos para dominar la aplicación:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Paso 1 */}
                <div className="p-4 rounded-2xl bg-white border border-[#DDD5C2] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-purple-900 text-white font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <span className="text-[11px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
                      Acceso
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Inicia Sesión o Regístrate
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ingresa con tu usuario y contraseña (máx. 10 caracteres) o utiliza las cuentas de acceso rápido si estás realizando una demostración. Si eres nuevo funcionario, diligencia el formulario de registro y el directivo aprobará tu cuenta.
                  </p>
                </div>

                {/* Paso 2 */}
                <div className="p-4 rounded-2xl bg-white border border-[#DDD5C2] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-amber-700 text-white font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                      Exploración
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Navega por las 3 Áreas Principales
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Usa la barra superior para alternar entre <strong>⚡ Zonas Eléctricas</strong>, <strong>🏢 Estructurales & Obras</strong> y <strong>📦 Recursos & Equipos</strong>, o consulta el <strong>Consolidado General</strong> para ver todo el inventario.
                  </p>
                </div>

                {/* Paso 3 */}
                <div className="p-4 rounded-2xl bg-white border border-[#DDD5C2] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Reportar
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Registra un Daño o Incidencia
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Haz clic en el botón <strong>"Tabla de Reportes"</strong> para ver el listado completo de incidencias y presiona <strong>"+ Reportar Daño / Nuevo"</strong>. Indica el aula o bloque, el elemento averiado, su urgencia y agrega fotos de evidencia.
                  </p>
                </div>

                {/* Paso 4 */}
                <div className="p-4 rounded-2xl bg-white border border-[#DDD5C2] shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-blue-700 text-white font-black text-xs flex items-center justify-center">
                      4
                    </span>
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                      Seguimiento
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Monitorea y Registra Avances
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    En las tablas y en la <strong>Bitácora de Daños</strong> puedes ver el historial, abrir la ficha técnica y registrar avances con evidencias fotográficas hasta completar el 100% de la reparación.
                  </p>
                </div>

              </div>

              {/* Tips Banner */}
              <div className="p-3.5 rounded-2xl bg-[#F5EFE4] border border-[#E3DCBD] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-700">
                  <strong>Consejo práctico:</strong> Puedes usar la barra de búsqueda en tiempo real dentro de las tablas para encontrar cualquier elemento por su código (ej. <code>ELEC-001</code>), ubicación o nombre.
                </div>
              </div>

            </div>
          )}

          {/* 2. ÁREAS Y MÓDULOS DE MANTENIMIENTO */}
          {activeSection === 'AREAS' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <p className="text-xs text-slate-700 leading-relaxed">
                El sistema clasifica todos los activos institucionales en <strong>3 áreas especializadas</strong> y cuenta con una <strong>Bitácora de Daños</strong> en vivo:
              </p>

              <div className="space-y-3">
                
                {/* 1. Eléctricos */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-amber-950 text-sm">
                        1. Zonas Eléctricas (ELEC)
                      </h4>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                        Prioridad de Seguridad
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Cubre tableros de distribución, interruptores termomagnéticos, cableado estructurado, luminarias LED en aulas y pasillos, tomas de corriente 110V/220V, subestaciones eléctricas y plantas de energía.
                    </p>
                    <p className="text-[11px] text-amber-800 font-medium">
                      💡 <em>Urgencias como cortocircuitos o falta de luz deben marcarse como "Urgente".</em>
                    </p>
                  </div>
                </div>

                {/* 2. Estructurales */}
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-blue-950 text-sm">
                        2. Estructurales & Obras Civiles (ESTR)
                      </h4>
                      <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                        Infraestructura Física
                      </span>
                    </div>
                    <p className="text-xs text-blue-900 leading-relaxed">
                      Supervisión de muros, fisuras, cubiertas, techos, filtraciones de agua, ventanas y vidrios rotos, puertas, cerraduras, baterías sanitarias, plomería, canchas y pintura exterior/interior.
                    </p>
                  </div>
                </div>

                {/* 3. Recursos & Equipos */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-emerald-950 text-sm">
                        3. Recursos & Equipamiento (REC)
                      </h4>
                      <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                        Mobiliario y Tecnología
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Inventario y estado de pupitres, escritorios docentes, tableros inteligentes, computadores de salas de informática, proyectores de video (videobeams), microscopios y material didáctico.
                    </p>
                  </div>
                </div>

                {/* Bitácora de Daños */}
                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col sm:flex-row items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-rose-950 text-sm">
                        Bitácora y Tarjetas Rápidas de Daños
                      </h4>
                      <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                        Acción Inmediata
                      </span>
                    </div>
                    <p className="text-xs text-rose-900 leading-relaxed">
                      Ubicada justo encima de las tablas para visualizar de un vistazo los reportes más críticos, cambiar su estado en tiempo real (Pendiente ➔ En Reparación ➔ Solucionado) y registrar notas de solución técnica.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 3. REPORTAR Y REGISTRAR AVANCES */}
          {activeSection === 'REPORTES' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-[#DDD5C2] space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>¿Cómo registrar un nuevo reporte o elemento?</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed">
                    <li>Haz clic en el botón <strong>"Tabla de Reportes"</strong> (arriba a la derecha) para ver la lista de incidencias y presiona <strong>"+ Reportar Daño / Nuevo"</strong>, o pulsa <strong>"Registrar en esta Área"</strong> desde cada tabla.</li>
                    <li>Selecciona el <strong>Área Correspondiente</strong> (Eléctricos, Estructurales o Recursos).</li>
                    <li>Ingresa el <strong>Nombre del Elemento</strong> (ej. <em>Lámpara LED Fluorescente</em>) y su <strong>Ubicación Exacta</strong> (ej. <em>Aula 102 - Bloque A</em>).</li>
                    <li>Selecciona el <strong>Nivel de Urgencia</strong>:
                      <span className="inline-flex items-center gap-1 ml-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">Urgente</span>,
                      <span className="inline-flex items-center gap-1 ml-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">Importante</span> o
                      <span className="inline-flex items-center gap-1 ml-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">Nada Urgente</span>.
                    </li>
                    <li>Describe detalladamente la falla o condición actual.</li>
                    <li>Opcionalmente, haz clic en <strong>"Subir o Tomar Foto"</strong> para adjuntar evidencia visual desde tu computador o teléfono.</li>
                    <li>Haz clic en <strong>"Guardar y Notificar Reporte"</strong>. El sistema le asignará un código único (ej. <code>ELEC-008</code>).</li>
                  </ol>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#DDD5C2] space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 font-extrabold text-sm">
                    <Clock className="w-4 h-4 text-purple-700" />
                    <span>¿Cómo registrar avances y dar por resuelto un trabajo?</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed">
                    <li>Localiza el elemento en la tabla de su área correspondiente.</li>
                    <li>Haz clic en el botón morado <strong>"Avances"</strong> o haz clic en <strong>"Detalles"</strong> y luego en "Registrar Avance".</li>
                    <li>Escribe la descripción del avance (ej. <em>Se reemplazaron los balastros y se probó la continuidad del cableado</em>).</li>
                    <li>Ajusta el porcentaje de progreso (0% a 100%).</li>
                    <li>Si el progreso llega al <strong>100%</strong>, el sistema marcará automáticamente el elemento como <strong>"Reparado / Operativo"</strong>.</li>
                    <li>Adjunta la foto de evidencia del arreglo terminado y haz clic en <strong>"Registrar Avance"</strong>.</li>
                  </ol>
                </div>
              </div>

            </div>
          )}

          {/* 4. ROLES INSTITUCIONALES Y PERMISOS */}
          {activeSection === 'ROLES' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <p className="text-xs text-slate-700 leading-relaxed">
                El sistema implementa <strong>Control de Acceso Basado en Roles (RBAC)</strong> para garantizar la integridad de los datos institucionales:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Docente */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                    <span className="text-lg">📚</span>
                    <span>Docente</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Personal docente de aula y laboratorios.
                  </p>
                  <ul className="list-disc list-inside text-xs text-emerald-950 space-y-1 font-medium">
                    <li>Reportar daños e incidencias de aulas.</li>
                    <li>Consultar estado de sus reportes.</li>
                    <li>Ver avances fotográficos.</li>
                    <li>Filtrar y buscar elementos de su sede.</li>
                  </ul>
                </div>

                {/* Administrativo */}
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-950 font-black text-sm">
                    <span className="text-lg">🛠️</span>
                    <span>Administrativo</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Coordinadores y técnicos de mantenimiento.
                  </p>
                  <ul className="list-disc list-inside text-xs text-blue-950 space-y-1 font-medium">
                    <li>Todo lo del rol Docente.</li>
                    <li>Registrar avances técnicos y fotos.</li>
                    <li>Cambiar estados de la bitácora de daños.</li>
                    <li>Gestionar prioridades y presupuestos.</li>
                  </ul>
                </div>

                {/* Directivo / Superior */}
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2">
                  <div className="flex items-center gap-2 text-purple-950 font-black text-sm">
                    <span className="text-lg">👑</span>
                    <span>Directivo / Superior</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Rectoría, directivos y administradores generales.
                  </p>
                  <ul className="list-disc list-inside text-xs text-purple-950 space-y-1 font-medium">
                    <li>Privilegios y control total.</li>
                    <li>Aprobar solicitudes de nuevos usuarios.</li>
                    <li>Generar e imprimir el directorio oficial.</li>
                    <li>Supervisión de métricas e indicadores.</li>
                  </ul>
                </div>

              </div>

            </div>
          )}

          {/* 5. CUENTAS, CLAVES Y SEGURIDAD */}
          {activeSection === 'SEGURIDAD' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <KeyRound className="w-4 h-4 text-amber-700" />
                  <span>Reglas de Contraseña y Acceso</span>
                </div>
                <ul className="list-disc list-inside text-xs space-y-1 text-amber-900">
                  <li><strong>Formato de usuario (Sin espacios):</strong> El nombre de usuario <u>no puede tener espacios</u>. Debe ser un identificador continuo (ej: <code>j.martinez</code>, <code>pedrogomez</code>, <code>prof_ruiz</code>). Si se colocan espacios, el sistema mostrará un error y no permitirá el registro o inicio de sesión.</li>
                  <li><strong>Límite de caracteres:</strong> La contraseña debe tener entre 4 y máximo 10 dígitos o caracteres.</li>
                  <li><strong>Validación de identidad:</strong> Al registrarse, el funcionario no podrá ingresar hasta que el Administrador o Directivo Superior autorice su solicitud.</li>
                  <li><strong>Cambio de clave:</strong> En cualquier momento puedes cambiar tu clave desde el botón "Cambiar Clave" en la barra superior.</li>
                  <li><strong>Recuperación:</strong> Si olvidaste tu clave, usa la opción "¿Olvidó su contraseña?" en la pantalla de inicio ingresando tu usuario y correo.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed space-y-1">
                  <p className="font-bold text-rose-900">Restricción de Estudiantes:</p>
                  <p>
                    Está terminantemente prohibido el acceso a estudiantes o terceros ajenos a la planta docente y administrativa institucional.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* 6. PREGUNTAS FRECUENTES (FAQ) */}
          {activeSection === 'FAQ' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* FAQ Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-purple-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Buscar en preguntas frecuentes (ej: contraseña, reportar, imprimir)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-700 focus:outline-none shadow-sm"
                />
              </div>

              <div className="space-y-2.5">
                {filteredFaqs.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No se encontraron preguntas que coincidan con "{faqSearch}".
                  </div>
                ) : (
                  filteredFaqs.map((faq, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-white border border-[#DDD5C2] shadow-sm space-y-1.5 transition-all hover:border-purple-300"
                    >
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-start gap-2">
                        <span className="text-purple-700 font-mono text-xs">Q:</span>
                        <span>{faq.q}</span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed pl-5">
                        {faq.a}
                      </p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-[#F5EFE4] border-t border-[#ECE5D8] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <Shield className="w-4 h-4 text-purple-700" />
            <span>SIGMA Institucional • Mantenimiento Escolar Confiable</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                const sections: ('INICIO' | 'AREAS' | 'REPORTES' | 'ROLES' | 'SEGURIDAD' | 'FAQ')[] = ['INICIO', 'AREAS', 'REPORTES', 'ROLES', 'SEGURIDAD', 'FAQ'];
                const currentIndex = sections.indexOf(activeSection);
                if (currentIndex < sections.length - 1) {
                  setActiveSection(sections[currentIndex + 1]);
                } else {
                  onClose();
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{activeSection === 'FAQ' ? 'Cerrar Guía' : 'Siguiente Sección'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
