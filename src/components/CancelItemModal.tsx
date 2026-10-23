import React from 'react';
import { InternalComanda, ComandaItem } from '../types';
import { X, Printer, Ban } from 'lucide-react';
import { playTapSound } from '../utils/audio';
import { useComanda } from '../context/ComandaContext';

interface CancelItemModalProps {
  isOpen: boolean;
  item: ComandaItem;
  comanda: InternalComanda;
  onConfirm: (printKitchenCancellation: boolean) => void;
  onClose: () => void;
}

export const CancelItemModal: React.FC<CancelItemModalProps> = ({
  isOpen,
  item,
  comanda,
  onConfirm,
  onClose,
}) => {
  const { soundEnabled } = useComanda();

  if (!isOpen) return null;

  const comandaServiceLabel =
    comanda.serviceType === 'MESA'
      ? `Mesa ${comanda.tableNumber}`
      : comanda.orderLabel || comanda.serviceType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-neutral-850/90 border-b border-neutral-750 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <Ban className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Cancelación de producto enviado
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono text-[11px] font-bold">
                {comandaServiceLabel}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
              ¿Cancelar {item.quantity} × {item.displayTitle}?
            </h3>
            {item.details && (
              <p className="text-xs text-amber-400/90 font-medium mt-0.5 truncate">
                {item.details}
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

        {/* Body & Explanation */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2">
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
              El producto se mantendrá en el historial de la comanda marcado como{' '}
              <strong className="text-rose-400 font-bold">CANCELADO</strong>.
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No se modifican destructivamente los demás productos ni se genera una nueva comanda.
            </p>
          </div>

          {/* Prompt: ¿Enviar cancelación a cocina? */}
          <div className="pt-2 text-center">
            <p className="text-base sm:text-lg font-bold text-white tracking-tight">
              ¿Enviar cancelación a cocina?
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Selecciona si deseas generar el ticket de cancelación para cocina:
            </p>
          </div>

          {/* Action Buttons: NO IMPRIMIR vs IMPRIMIR CANCELACIÓN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                playTapSound(soundEnabled);
                onConfirm(false);
              }}
              className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white font-bold text-sm border border-neutral-700/80 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>NO IMPRIMIR</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTapSound(soundEnabled);
                onConfirm(true);
              }}
              className="h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow-xl shadow-rose-950/50 border border-rose-400/40 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>IMPRIMIR CANCELACIÓN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
