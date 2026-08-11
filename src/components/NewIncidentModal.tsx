import React, { useState } from 'react';
import {
  X,
  Zap,
  Building2,
  Package,
  AlertTriangle,
  Camera,
  Upload,
  UserCheck,
  MapPin,
  FileText,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { AreaType, ItemStatus, UrgencyLevel, User } from '../core/domain/entities';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: {
    area: AreaType;
    title: string;
    description: string;
    location: string;
    status: ItemStatus;
    urgency: UrgencyLevel;
    assignedTo: {
      name: string;
      cargo: string;
      phone?: string;
      email?: string;
    };
    photos: string[];
    notes?: string;
    initialAdvanceNote?: string;
  }) => Promise<void>;
  currentUser: User | null;
  defaultArea?: AreaType;
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  defaultArea = 'ELECTRICOS'
}) => {
  const [area, setArea] = useState<AreaType>(defaultArea);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ItemStatus>('DANADO');
  const [urgency, setUrgency] = useState<UrgencyLevel>('IMPORTANTE');
  
  // Person assignment by cargo and name
  const [assignedName, setAssignedName] = useState('');
  const [assignedCargo, setAssignedCargo] = useState('');
  const [assignedPhone, setAssignedPhone] = useState('');
  
  // Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [initialAdvanceNote, setInitialAdvanceNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset suggested assignees based on selected area for quick convenience
  const handleSelectPredefinedAssignee = (name: string, cargo: string, phone: string) => {
    setAssignedName(name);
    setAssignedCargo(cargo);
    setAssignedPhone(phone);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPhotoUrl = () => {
    if (photoUrlInput.trim()) {
      setPhotos((prev) => [...prev, photoUrlInput.trim()]);
      setPhotoUrlInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Por favor ingrese el título del elemento o problema.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor describa detalladamente el problema o el estado del elemento.');
      return;
    }
    if (!location.trim()) {
      setError('Por favor especifique la ubicación exacta en la institución (aula, pabellón, piso, etc.).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        area,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        status,
        urgency,
        assignedTo: {
          name: assignedName.trim() || 'Servicios Generales / Por Asignar',
          cargo: assignedCargo.trim() || (area === 'ELECTRICOS' ? 'Técnico Electricista' : area === 'ESTRUCTURALES' ? 'Maestro de Mantenimiento Civil' : 'Coordinador de Recursos'),
          phone: assignedPhone.trim()
        },
        photos,
        initialAdvanceNote: initialAdvanceNote.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el reporte institucional');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-2xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Registrar Nuevo Mantenimiento
              </h3>
              <p className="text-xs text-purple-200">
                Reportar elemento dañado, en arreglo o nuevo en la institución
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Area Selection (Eléctricos, Estructurales, Recursos) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1.5">
              1. Seleccione el Área Institucional *
            </label>
            <div className="grid grid-cols-3 gap-2">
              
              <button
                type="button"
                onClick={() => setArea('ELECTRICOS')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  area === 'ELECTRICOS'
                    ? 'bg-amber-100/80 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-400/40 shadow-sm'
                    : 'bg-white border-[#DDD5C2] text-slate-700 hover:bg-stone-50'
                }`}
              >
                <Zap className={`w-5 h-5 ${area === 'ELECTRICOS' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="text-xs">Eléctricos</span>
              </button>

              <button
                type="button"
                onClick={() => setArea('ESTRUCTURALES')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  area === 'ESTRUCTURALES'
                    ? 'bg-blue-100/80 border-blue-500 text-blue-950 font-bold ring-2 ring-blue-400/40 shadow-sm'
                    : 'bg-white border-[#DDD5C2] text-slate-700 hover:bg-stone-50'
                }`}
              >
                <Building2 className={`w-5 h-5 ${area === 'ESTRUCTURALES' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs">Estructurales</span>
              </button>

              <button
                type="button"
                onClick={() => setArea('RECURSOS')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  area === 'RECURSOS'
                    ? 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400/40 shadow-sm'
                    : 'bg-white border-[#DDD5C2] text-slate-700 hover:bg-stone-50'
                }`}
              >
                <Package className={`w-5 h-5 ${area === 'RECURSOS' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs">Recursos</span>
              </button>

            </div>
          </div>

          {/* 2. Status & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Estado Actual del Elemento *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="DANADO">🔴 Dañado / Requiere Atención</option>
                <option value="EN_MANTENIMIENTO">🟡 En Mantenimiento / Arreglo</option>
                <option value="NUEVO_OPERATIVO">🟢 Nuevo / Operativo / Recibido</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nivel de Urgencia / Prioridad *
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="URGENTE">🔥 Urgente (Riesgo inmediato o suspensión de clases)</option>
                <option value="IMPORTANTE">⚠️ Importante (Atención requerida prontamente)</option>
                <option value="NADA_URGENTE">🟢 Nada Urgente (Mantenimiento preventivo/rutinario)</option>
              </select>
            </div>
          </div>

          {/* 3. Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Título Breve del Daño o Elemento *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Falla en interruptor principal de Laboratorio 1"
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* 4. Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Descripción Detallada del Problema *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explique claramente qué ocurrió, cómo se encuentra el elemento dañado o qué equipo nuevo llegó..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* 5. Location */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-purple-700" />
              <span>Ubicación Exacta en el Colegio *</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Pabellón B - Aula 204 (Segundo piso, ala norte)"
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* 6. Assign to Person by Cargo and Name */}
          <div className="p-3.5 rounded-2xl bg-[#F5EFE4] border border-[#E3DCBD] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-purple-800" />
                <span>Asignar Responsable por Cargo y Nombre</span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">Técnico / Encargado</span>
            </div>

            {/* Quick Presets for School Maintenance Personnel */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              <button
                type="button"
                onClick={() => handleSelectPredefinedAssignee('Pedro Gómez', 'Técnico Electricista Certificado', '+57 312 456 7890')}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-[#D5CDBC] text-slate-700 hover:bg-purple-100 hover:text-purple-900 font-medium transition-colors cursor-pointer"
              >
                ⚡ Pedro Gómez (Electricista)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPredefinedAssignee('Manuel Castro', 'Maestro de Obra Civil', '+57 310 987 6543')}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-[#D5CDBC] text-slate-700 hover:bg-purple-100 hover:text-purple-900 font-medium transition-colors cursor-pointer"
              >
                🏢 Manuel Castro (Estructuras)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPredefinedAssignee('Lic. Ana Silva', 'Coordinadora de Recursos Educativos', '+57 315 222 3344')}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-[#D5CDBC] text-slate-700 hover:bg-purple-100 hover:text-purple-900 font-medium transition-colors cursor-pointer"
              >
                📦 Lic. Ana Silva (Recursos)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <input
                  type="text"
                  value={assignedName}
                  onChange={(e) => setAssignedName(e.target.value)}
                  placeholder="Nombre de la persona (Ej: Ing. Carlos Ruiz)"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C2] text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={assignedCargo}
                  onChange={(e) => setAssignedCargo(e.target.value)}
                  placeholder="Cargo institucional (Ej: Jefe de Mantenimiento)"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C2] text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 7. Photos Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-purple-700" />
              <span>Incluir Fotos del Daño o Elemento (Opcional)</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 px-3 py-2 rounded-xl bg-white border border-dashed border-purple-400 hover:border-purple-600 text-xs text-purple-900 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm">
                <Upload className="w-4 h-4 text-purple-700" />
                <span>Subir foto desde dispositivo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 flex gap-1">
                <input
                  type="url"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="O pegar URL de imagen..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C2] text-xs text-slate-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPhotoUrl}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photos.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shadow-sm">
                    <img src={img} alt="Vista previa" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 8. Initial Advance Note */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Nota de Avance Inicial (Opcional)</span>
            </label>
            <input
              type="text"
              value={initialAdvanceNote}
              onChange={(e) => setInitialAdvanceNote(e.target.value)}
              placeholder="Ej: Se acordonó el área con cinta preventiva para proteger a los estudiantes."
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C2] text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#ECE5D8] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-950/40 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando en tablas...' : 'Guardar Reporte'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
