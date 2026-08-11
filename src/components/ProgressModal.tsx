import React, { useState } from 'react';
import {
  X,
  Plus,
  Camera,
  Upload,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  Send,
  UserCheck
} from 'lucide-react';
import { MaintenanceItem, ItemStatus, User } from '../core/domain/entities';
import { MaintenanceService } from '../application/useCases';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MaintenanceItem | null;
  currentUser: User | null;
  onSubmitAdvance: (payload: {
    authorId: string;
    authorName: string;
    authorRole: string;
    note: string;
    statusAfter?: ItemStatus;
    photos?: string[];
    materialsUsed?: string;
  }) => Promise<void>;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  item,
  currentUser,
  onSubmitAdvance
}) => {
  const [note, setNote] = useState('');
  const [statusAfter, setStatusAfter] = useState<ItemStatus>(item?.status || 'EN_MANTENIMIENTO');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync default status when item changes
  React.useEffect(() => {
    if (item) {
      setStatusAfter(item.status === 'DANADO' ? 'EN_MANTENIMIENTO' : item.status);
    }
  }, [item]);

  if (!isOpen || !item) return null;

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

    if (!note.trim()) {
      setError('Por favor escriba la descripción del avance o arreglo efectuado.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitAdvance({
        authorId: currentUser?.id || 'usr_anon',
        authorName: currentUser?.name || 'Personal Institucional',
        authorRole: currentUser?.roleTitle || (currentUser?.role ? currentUser.role : 'Mantenimiento'),
        note: note.trim(),
        statusAfter,
        photos,
        materialsUsed: materialsUsed.trim() || undefined
      });
      setNote('');
      setMaterialsUsed('');
      setPhotos([]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el avance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStatusInfo = MaintenanceService.getStatusInfo(item.status);
  const areaLabel = MaintenanceService.getAreaLabel(item.area);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-2xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <MessageSquare className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-white">
                  {item.code}
                </span>
                <span className="text-xs text-purple-200">{areaLabel}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white line-clamp-1 mt-0.5">
                {item.title}
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

        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Summary Box */}
          <div className="p-3.5 rounded-2xl bg-[#F5EFE4] border border-[#E3DCBD] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Ubicación: </span>
              <span className="font-bold text-slate-800">{item.location}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Responsable: </span>
              <span className="font-bold text-purple-900">{item.assignedTo.name} ({item.assignedTo.cargo})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Estado: </span>
              <span className={`px-2 py-0.5 rounded-full font-bold border ${currentStatusInfo.bgClass} ${currentStatusInfo.textClass} ${currentStatusInfo.borderClass}`}>
                {currentStatusInfo.label.split(' / ')[0]}
              </span>
            </div>
          </div>

          {/* Form to Post New Advance */}
          <form onSubmit={handleSubmit} className="space-y-3.5 bg-white p-4 rounded-2xl border border-[#DDD5C2] shadow-sm">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Enviar Nuevo Avance / Informe de Trabajo</span>
            </h4>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Descripción del Avance o Reparación Realizada *
              </label>
              <textarea
                required
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describa el trabajo ejecutado, qué piezas se cambiaron o qué medidas preventivas se tomaron..."
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-[#DDD5C2] text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Actualizar Estado del Elemento tras este Avance
                </label>
                <select
                  value={statusAfter}
                  onChange={(e) => setStatusAfter(e.target.value as ItemStatus)}
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-[#DDD5C2] text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer"
                >
                  <option value="DANADO">🔴 Mantener como Dañado (Requiere más trabajo)</option>
                  <option value="EN_MANTENIMIENTO">🟡 En Mantenimiento / Arreglo en Curso</option>
                  <option value="NUEVO_OPERATIVO">🟢 Nuevo / Operativo (Reparación Finalizada)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Materiales o Repuestos Utilizados (Opcional)
                </label>
                <input
                  type="text"
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  placeholder="Ej: 2 tubos fluorescentes LED, 1 balastro, cinta aislante"
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-[#DDD5C2] text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Photos for this Advance */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-purple-700" />
                <span>Adjuntar Fotos de Evidencia del Avance</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <label className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-dashed border-purple-400 hover:border-purple-600 text-xs text-purple-900 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-purple-700" />
                  <span>Subir foto</span>
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
                    placeholder="URL de foto..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-stone-50 border border-[#DDD5C2] text-xs text-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {photos.map((img, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shadow-sm">
                      <img src={img} alt="Evidencia" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Publicar Avance en Tablas'}</span>
              </button>
            </div>
          </form>

          {/* Historical Timeline of Advances */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-950 flex items-center gap-1.5 mb-3">
              <History className="w-4 h-4 text-purple-800" />
              <span>Historial Cronológico de Avances ({item.advances ? item.advances.length : 0})</span>
            </h4>

            {(!item.advances || item.advances.length === 0) ? (
              <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200 text-center text-xs text-slate-500">
                Aún no hay avances registrados para este elemento.
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#DDD5C2]">
                {item.advances.map((adv) => {
                  const advStatusInfo = MaintenanceService.getStatusInfo(adv.statusAfter);
                  return (
                    <div key={adv.id} className="relative pl-8 text-xs">
                      <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-purple-700 border-2 border-white ring-1 ring-purple-300" />
                      <div className="p-3 rounded-2xl bg-white border border-[#DDD5C2] shadow-sm space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="font-bold text-slate-900">
                            {adv.authorName} ({adv.authorRole})
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {new Date(adv.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-normal">
                          {adv.note}
                        </p>
                        {adv.materialsUsed && (
                          <p className="text-[11px] text-purple-900 bg-purple-50 p-1.5 rounded-lg border border-purple-100 font-medium">
                            🔧 Materiales: {adv.materialsUsed}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${advStatusInfo.bgClass} ${advStatusInfo.textClass} ${advStatusInfo.borderClass}`}>
                            Estado: {advStatusInfo.label.split(' / ')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
