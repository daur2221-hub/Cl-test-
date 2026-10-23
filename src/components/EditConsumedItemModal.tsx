import React, { useState } from 'react';
import { ConsolidatedItem } from '../context/ComandaContext';
import { InternalComanda, ComandaItem } from '../types';
import { X, Ban, Printer, FileEdit, AlertCircle } from 'lucide-react';
import { playTapSound } from '../utils/audio';
import { useComanda } from '../context/ComandaContext';

interface EditConsumedItemModalProps {
  isOpen: boolean;
  item: ConsolidatedItem;
  comanda?: InternalComanda;
  onClose: () => void;
  onConfirmCancel: (printKitchenCancellation: boolean) => void;
}

export const EditConsumedItemModal: React.FC<EditConsumedItemModalProps> = ({
  isOpen,
  item,
  comanda,
  onClose,
  onConfirmCancel,
}) => {
  const { soundEnabled } = useComanda();
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  if (!isOpen) return null;

  const comandaNumber = item.comandaNumber || comanda?.comandaNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-neutral-850/90 border-b border-neutral-750 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center justify-center shrink-0">
            <FileEdit className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Opciones del producto enviado
              </span>
              {comandaNumber && (
                <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono text-[11px] font-bold">
                  Comanda #{comandaNumber}
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
              {item.quantity} × {item.displayTitle}
            </h3>
            {item.details && (
              <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                {item.details}
              </p>
            )}
            {item.notes && (
              <p className="text-xs text-neutral-400 italic mt-0.5">
                Nota: {item.notes}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {!showCancelPrompt ? (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Informational Card */}
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-emerald-400" />
                <span>Estado: Enviado a cocina</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Este producto ya fue enviado a comanda y se encuentra registrado en el consumo de la mesa.
              </p>
            </div>

            {/* Actions Section */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                Acciones sobre este producto:
              </span>

              {/* CANCELAR button (Inside edit flow, not directly on the main table view) */}
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setShowCancelPrompt(true);
                }}
                className="w-full p-4 rounded-2xl bg-neutral-850 hover:bg-rose-950/40 border border-neutral-750 hover:border-rose-800/60 text-left transition-all group active:scale-[0.99] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <Ban className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors block">
                      Cancelar este producto
                    </span>
                    <span className="text-xs text-neutral-400 block mt-0.5">
                      Marcar como CANCELADO en la comanda enviada
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-neutral-400 group-hover:text-rose-400 px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 transition-colors shrink-0">
                  Cancelar
                </span>
              </button>
            </div>

            {/* Footer */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  onClose();
                }}
                className="w-full h-12 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold text-xs sm:text-sm border border-neutral-700 transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: ¿Enviar cancelación a cocina? */
          <div className="p-5 sm:p-6 space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2">
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                El producto se mantendrá en el historial de la comanda marcado como{' '}
                <strong className="text-rose-400 font-bold">CANCELADO</strong>.
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                No se eliminan datos ni se crea una comanda nueva.
              </p>
            </div>

            {/* Question */}
            <div className="pt-2 text-center">
              <p className="text-base sm:text-lg font-bold text-white tracking-tight">
                ¿Enviar cancelación a cocina?
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Selecciona si deseas generar el ticket de cancelación para cocina:
              </p>
            </div>

            {/* Confirmation actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  onConfirmCancel(false);
                }}
                className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white font-bold text-sm border border-neutral-700/80 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>NO IMPRIMIR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  onConfirmCancel(true);
                }}
                className="h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow-xl shadow-rose-950/50 border border-rose-400/40 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>IMPRIMIR CANCELACIÓN</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setShowCancelPrompt(false);
                }}
                className="w-full py-2.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                ← Regresar a opciones
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
