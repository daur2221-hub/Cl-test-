import React from 'react';
import { InternalComanda, ComandaItem } from '../types';
import { Printer, Check, X } from 'lucide-react';
import { playTapSound } from '../utils/audio';
import { useComanda } from '../context/ComandaContext';

interface PrintCancellationSimModalProps {
  isOpen: boolean;
  item: ComandaItem;
  comanda: InternalComanda;
  onClose: () => void;
}

export const PrintCancellationSimModal: React.FC<PrintCancellationSimModalProps> = ({
  isOpen,
  item,
  comanda,
  onClose,
}) => {
  const { soundEnabled } = useComanda();

  if (!isOpen) return null;

  const nowStr = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const serviceName =
    comanda.serviceType === 'MESA'
      ? `MESA ${comanda.tableNumber}`
      : comanda.orderLabel || comanda.serviceType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-neutral-850 border-b border-neutral-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Simulación de Impresión · Cocina
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Paper Simulation */}
        <div className="p-4 sm:p-6 bg-neutral-950/60 overflow-y-auto">
          <div className="bg-white text-neutral-900 font-mono p-5 rounded-xl shadow-xl border border-neutral-300 text-xs space-y-3">
            <div className="text-center pb-3 border-b-2 border-dashed border-neutral-400">
              <span className="inline-block px-2 py-0.5 bg-rose-600 text-white font-black text-xs rounded mb-1">
                *** CANCELACIÓN ***
              </span>
              <h3 className="text-base font-black tracking-tight uppercase">
                AVISO A COCINA
              </h3>
              <p className="text-[11px] text-neutral-600 font-sans">
                COMANDA LIGHT
              </p>
            </div>

            <div className="space-y-1 py-1 border-b border-dashed border-neutral-400 text-[11px]">
              <div className="flex justify-between font-bold text-neutral-950">
                <span>SERVICIO:</span>
                <span className="uppercase">{serviceName}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>HORA CANCELACIÓN:</span>
                <span>{nowStr}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>MOTIVO:</span>
                <span className="font-bold text-rose-700">CANCELADO POR SALA</span>
              </div>
            </div>

            {/* Cancelled product highlight */}
            <div className="py-2.5 bg-rose-50 border-2 border-rose-300 rounded p-2 text-rose-950">
              <div className="text-xs font-black uppercase text-rose-800 mb-1">
                PRODUCTO A CANCELAR:
              </div>
              <div className="text-sm font-black">
                {item.quantity} × {item.displayTitle}
              </div>
              {item.details && (
                <div className="text-[11px] text-neutral-700 mt-0.5">
                  • {item.details}
                </div>
              )}
              {item.notes && (
                <div className="text-[11px] text-rose-800 font-bold mt-0.5">
                  *** {item.notes} ***
                </div>
              )}
            </div>

            <div className="pt-2 text-center text-[10px] text-neutral-500 border-t border-dashed border-neutral-400">
              <p>NO PREPARAR ESTE PRODUCTO</p>
              <p className="mt-0.5">Simulación completada con éxito</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-850 border-t border-neutral-750">
          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>ENTENDIDO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
