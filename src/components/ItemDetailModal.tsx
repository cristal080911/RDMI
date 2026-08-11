import React, { useState } from 'react';
import {
  X,
  Zap,
  Building2,
  Package,
  MapPin,
  UserCheck,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { MaintenanceItem } from '../core/domain/entities';
import { MaintenanceService } from '../application/useCases';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MaintenanceItem | null;
  onOpenAdvanceModal: (item: MaintenanceItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onOpenAdvanceModal
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const statusInfo = MaintenanceService.getStatusInfo(item.status);
  const urgencyInfo = MaintenanceService.getUrgencyInfo(item.urgency);
  const areaLabel = MaintenanceService.getAreaLabel(item.area);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#E5DEC9] shadow-2xl max-w-3xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              {item.area === 'ELECTRICOS' ? (
                <Zap className="w-6 h-6 text-amber-400" />
              ) : item.area === 'ESTRUCTURALES' ? (
                <Building2 className="w-6 h-6 text-blue-400" />
              ) : (
                <Package className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-white">
                  {item.code}
                </span>
                <span className="text-xs text-purple-200 font-semibold">{areaLabel}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white line-clamp-1 mt-0.5">
                {item.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Imprimir ficha de reporte"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Status & Priority Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F5EFE4] border border-[#E3DCBD]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Estado:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
                {statusInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Prioridad:</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${urgencyInfo.badgeBg} ${urgencyInfo.badgeText}`}>
                {urgencyInfo.label}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 mb-1">
              Descripción del Problema o Elemento
            </h4>
            <div className="p-4 rounded-2xl bg-white border border-[#DDD5C2] text-sm text-slate-800 leading-relaxed font-normal shadow-sm">
              {item.description}
            </div>
          </div>

          {/* Institutional Grid Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* Location & Reported By */}
            <div className="p-4 rounded-2xl bg-white border border-[#DDD5C2] space-y-2 shadow-sm">
              <div className="flex items-start gap-2 text-xs">
                <MapPin className="w-4 h-4 text-purple-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 font-medium">Ubicación Institucional</p>
                  <p className="font-bold text-slate-900 text-sm">{item.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs pt-2 border-t border-[#ECE5D8]">
                <Calendar className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 font-medium">Reportado Por</p>
                  <p className="font-bold text-slate-900">
                    {item.reportedBy.name} ({item.reportedBy.roleTitle})
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Fecha: {new Date(item.createdAt).toLocaleDateString()} a las {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned Personnel */}
            <div className="p-4 rounded-2xl bg-white border border-[#DDD5C2] space-y-2 shadow-sm">
              <div className="flex items-start gap-2 text-xs">
                <UserCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 font-medium">Persona Asignada (Cargo & Nombre)</p>
                  <p className="font-bold text-slate-900 text-sm">{item.assignedTo.name}</p>
                  <p className="text-xs text-purple-900 font-semibold bg-purple-100/80 px-2 py-0.5 rounded inline-block mt-0.5">
                    {item.assignedTo.cargo}
                  </p>
                  {item.assignedTo.phone && (
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      📞 Tel: {item.assignedTo.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Photos Gallery */}
          {item.photos && item.photos.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 mb-2">
                Fotografías y Evidencia ({item.photos.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {item.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhoto(photo)}
                    className="h-32 rounded-2xl overflow-hidden border border-slate-300 shadow-sm cursor-pointer group relative"
                  >
                    <img
                      src={photo}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Ampliar
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advances Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-800" />
                <span>Historial de Avances Registrados ({item.advances ? item.advances.length : 0})</span>
              </h4>
              <button
                onClick={() => onOpenAdvanceModal(item)}
                className="px-3 py-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Avance</span>
              </button>
            </div>

            {(!item.advances || item.advances.length === 0) ? (
              <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 text-center text-xs text-slate-500">
                No se han registrado avances aún. Puede enviar el primer avance con fotos y reporte de trabajo.
              </div>
            ) : (
              <div className="space-y-3">
                {item.advances.map((adv) => (
                  <div key={adv.id} className="p-3.5 rounded-2xl bg-white border border-[#DDD5C2] space-y-1.5 text-xs shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-bold text-slate-900">
                        {adv.authorName} ({adv.authorRole})
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(adv.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-normal">
                      {adv.note}
                    </p>
                    {adv.materialsUsed && (
                      <p className="text-[11px] text-purple-900 bg-purple-50 p-1.5 rounded-lg border border-purple-100">
                        🔧 Materiales: {adv.materialsUsed}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F5EFE4] border-t border-[#ECE5D8] flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Última actualización: {new Date(item.updatedAt).toLocaleString()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar Vista
          </button>
        </div>

      </div>

      {/* Large Image Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={selectedPhoto} alt="Foto ampliada" className="max-w-full max-h-[85vh] rounded-xl object-contain" referrerPolicy="no-referrer" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
