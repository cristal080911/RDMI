import React from 'react';
import {
  X,
  Layers,
  Shield,
  Cpu,
  Database,
  ArrowRight,
  Code,
  CheckCircle2,
  Boxes
} from 'lucide-react';

interface HexagonalArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HexagonalArchitectureModal: React.FC<HexagonalArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-3xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 flex items-center justify-center border border-indigo-400/30 text-indigo-200">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded border border-indigo-600">
                Diseño de Software
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Arquitectura Hexagonal (Ports & Adapters)
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          
          <p className="text-sm font-medium text-slate-800 leading-relaxed">
            La plataforma está construida bajo los principios de la <strong className="text-purple-950">Arquitectura Hexagonal</strong>, garantizando que las reglas de negocio de mantenimiento institucional permanezcan completamente desacopladas de las interfaces gráficas y los mecanismos de persistencia.
          </p>

          {/* Hexagonal Interactive Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            
            {/* 1. Core Domain Layer */}
            <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4 text-purple-700" />
                <span>1. Núcleo de Dominio</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Entidades puras sin dependencias externas:
              </p>
              <ul className="list-disc list-inside text-[11px] text-purple-950 font-medium space-y-1">
                <li><code>MaintenanceItem</code> (Eléctrico, Estructural, Recurso)</li>
                <li><code>ProgressAdvance</code> (Avances con fotos)</li>
                <li><code>User</code> & <code>UserRole</code> (Validaciones)</li>
                <li><code>ItemStatus</code> & <code>UrgencyLevel</code></li>
              </ul>
              <div className="font-mono text-[10px] text-purple-800 bg-purple-100 p-1.5 rounded">
                📁 /src/core/domain/entities.ts
              </div>
            </div>

            {/* 2. Ports & Application */}
            <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-indigo-700" />
                <span>2. Puertos & Casos de Uso</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Contratos e interfaces de orquestación:
              </p>
              <ul className="list-disc list-inside text-[11px] text-indigo-950 font-medium space-y-1">
                <li><code>IMaintenanceRepository</code></li>
                <li><code>IUserRepository</code></li>
                <li><code>MaintenanceService</code> (Filtros, Stats)</li>
                <li>Casos de uso de aprobación de roles</li>
              </ul>
              <div className="font-mono text-[10px] text-indigo-800 bg-indigo-100 p-1.5 rounded">
                📁 /src/core/ports/ & /application/
              </div>
            </div>

              {/* 3. Adapters (HTTP, Firebase & UI) */}
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs uppercase tracking-wider">
                <Boxes className="w-4 h-4 text-emerald-700" />
                <span>3. Adaptadores Primarios & Secundarios</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Conexión con el mundo exterior y BD:
              </p>
              <ul className="list-disc list-inside text-[11px] text-emerald-950 font-medium space-y-1">
                <li><code>Firebase Firestore</code> (Base de Datos en la Nube)</li>
                <li><code>ApiClient</code> (Gateway & Cache Resiliente)</li>
                <li><code>Express Server</code> (/server.ts)</li>
                <li><code>React UI</code> (Tablas, Modales, Vistas)</li>
              </ul>
              <div className="font-mono text-[10px] text-emerald-800 bg-emerald-100 p-1.5 rounded">
                📁 /src/lib/firebase.ts & /src/adapters/
              </div>
            </div>

          </div>

          {/* Benefits Box */}
          <div className="p-4 rounded-2xl bg-[#F5EFE4] border border-[#E3DCBD] space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs">
              Ventajas en el Entorno Escolar:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Independencia total entre interfaz y base de datos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pruebas unitarias sencillas sobre el dominio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Sincronización multi-dispositivo en tiempo real</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Control estricto de roles y permisos institucionales</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F5EFE4] border-t border-[#ECE5D8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
