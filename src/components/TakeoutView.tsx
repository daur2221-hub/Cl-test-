import React, { useState } from 'react';
import { useComanda } from '../context/ComandaContext';
import { InternalComanda, ComandaItem } from '../types';
import {
  ShoppingBag,
  Plus,
  Clock,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Ban,
  Printer,
  FileEdit,
} from 'lucide-react';
import { playTapSound } from '../utils/audio';
import { OrderTakingModal } from './OrderTakingModal';
import { CancelItemModal } from './CancelItemModal';
import { PrintCancellationSimModal } from './PrintCancellationSimModal';
import { EditConsumedItemModal } from './EditConsumedItemModal';

interface TakeoutViewProps {
  onShowSuccessToast: (msg: string) => void;
}

export const TakeoutView: React.FC<TakeoutViewProps> = ({ onShowSuccessToast }) => {
  const { comandas, soundEnabled, markOrderAsDelivered, cancelItemInComanda } = useComanda();
  const [selectedComandaId, setSelectedComandaId] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // States for cancelling item
  const [itemToCancel, setItemToCancel] = useState<{
    item: ComandaItem;
    comanda: InternalComanda;
  } | null>(null);

  // States for cancellation print simulation
  const [cancellationSimData, setCancellationSimData] = useState<{
    item: ComandaItem;
    comanda: InternalComanda;
  } | null>(null);

  // Filter all takeout comandas, ordered newest first
  const takeoutComandas = comandas.filter(c => c.serviceType === 'PARA_LLEVAR');
  const selectedComanda = takeoutComandas.find(c => c.id === selectedComandaId) || null;

  const handleOpenNewOrder = () => {
    playTapSound(soundEnabled);
    setIsOrderModalOpen(true);
  };

  const handleComandaSent = (num: number) => {
    onShowSuccessToast(`Comanda enviada a cocina`);
  };

  const handleMarkDelivered = (comandaId: string, label: string) => {
    markOrderAsDelivered(comandaId);
    onShowSuccessToast(`${label} marcado como entregado`);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // If a specific takeout comanda is being inspected
  if (selectedComanda) {
    const totalItems = selectedComanda.items.reduce((acc, it) => acc + it.quantity, 0);
    const isDelivered = selectedComanda.orderStatus === 'ENTREGADO';

    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 select-none animate-in fade-in duration-150">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setSelectedComandaId(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700/80 active:scale-95 transition-all text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Pedidos Para Llevar</span>
          </button>

          {/* Action: MARCAR COMO ENTREGADO (if still in preparation) */}
          {!isDelivered && (
            <button
              onClick={() => handleMarkDelivered(selectedComanda.id, selectedComanda.orderLabel || 'Pedido')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 border border-emerald-400/40 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>MARCAR COMO ENTREGADO</span>
            </button>
          )}
        </div>

        {/* Sealed Comanda Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="border-b border-neutral-800 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">
                  Servicio Para Llevar
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {selectedComanda.orderLabel || 'Para Llevar'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {formatTime(selectedComanda.createdAt)}
              </span>

              {/* Status: EN PREPARACIÓN vs ENTREGADO */}
              {isDelivered ? (
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
                  <span>🟢</span>
                  <span>ENTREGADO</span>
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5">
                  <span>🟠</span>
                  <span>EN PREPARACIÓN</span>
                </span>
              )}
            </div>
          </div>

          {/* Immutability Notice */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-3.5 mb-6 text-xs text-neutral-400 leading-relaxed">
            {isDelivered ? (
              <span>Este pedido ya fue <strong className="text-emerald-400">entregado</strong> y permanece solo para consulta. Si el cliente requiere productos adicionales, crea un nuevo pedido independiente.</span>
            ) : (
              <span>Este pedido está <strong className="text-amber-400">en preparación</strong> en cocina y no puede modificarse. Para productos adicionales, genera un nuevo pedido.</span>
            )}
          </div>

          {/* Items Sent List */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-neutral-200 mb-3 tracking-wide">
              Productos enviados ({totalItems} {totalItems === 1 ? 'unidad' : 'unidades'}):
            </h2>

            <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-2xl p-4 sm:p-6 divide-y divide-neutral-850">
              {selectedComanda.items.map(item => {
                const isCancelled = item.status === 'CANCELADO';
                return (
                  <div
                    key={item.id}
                    className={`py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 ${
                      isCancelled ? 'opacity-65' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className={`text-base sm:text-lg font-bold leading-snug ${
                            isCancelled
                              ? 'text-neutral-400 line-through'
                              : 'text-white'
                          }`}
                        >
                          {item.quantity} × {item.displayTitle}
                        </span>

                        {isCancelled && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-black tracking-wide shrink-0">
                            CANCELADO
                          </span>
                        )}
                      </div>

                      {item.details && (
                        <p
                          className={`text-xs font-medium mt-1 ${
                            isCancelled
                              ? 'text-neutral-500 line-through'
                              : 'text-amber-400/90'
                          }`}
                        >
                          {item.details}
                        </p>
                      )}

                      {item.notes && (
                        <p
                          className={`text-xs italic mt-0.5 ${
                            isCancelled ? 'text-neutral-500' : 'text-neutral-400'
                          }`}
                        >
                          Nota: {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCancelled ? (
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-850 text-neutral-500 text-xs font-mono font-medium">
                          Cancelado
                        </span>
                      ) : (
                        <>
                          <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-neutral-850 text-neutral-400 text-xs font-mono font-medium">
                            Enviado
                          </span>
                          {!isDelivered && (
                            <button
                              type="button"
                              onClick={() => {
                                playTapSound(soundEnabled);
                                setItemToCancel({
                                  item,
                                  comanda: selectedComanda,
                                });
                              }}
                              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700/80 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                              title="Editar o gestionar producto de la comanda"
                            >
                              <FileEdit className="w-3.5 h-3.5 text-neutral-400" />
                              <span>EDITAR</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action: "+ NUEVO PEDIDO PARA LLEVAR" for additional products */}
          <div className="pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={handleOpenNewOrder}
              className="w-full h-16 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-amber-950/40 border border-amber-400/40 active:scale-[0.99] transition-all"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
              <span>+ NUEVO PEDIDO PARA LLEVAR</span>
            </button>
            <p className="text-xs text-neutral-500 text-center mt-2.5">
              Si se necesitan productos adicionales, se genera un nuevo pedido independiente con su propio número visible.
            </p>
          </div>
        </div>

        {/* Modal for additional comanda */}
        <OrderTakingModal
          isOpen={isOrderModalOpen}
          serviceType="PARA_LLEVAR"
          onClose={() => setIsOrderModalOpen(false)}
          onComandaSent={handleComandaSent}
        />

        {/* Edit Consumed Item Modal (Encapsulating cancellation flow) */}
        {itemToCancel && (
          <EditConsumedItemModal
            isOpen={true}
            item={{
              id: itemToCancel.item.id,
              itemId: itemToCancel.item.id,
              comandaId: itemToCancel.comanda.id,
              comandaNumber: itemToCancel.comanda.comandaNumber,
              displayTitle: itemToCancel.item.displayTitle,
              quantity: itemToCancel.item.quantity,
              details: itemToCancel.item.details,
              notes: itemToCancel.item.notes,
              status: itemToCancel.item.status,
            }}
            comanda={itemToCancel.comanda}
            onClose={() => setItemToCancel(null)}
            onConfirmCancel={(printKitchen) => {
              const { item, comanda } = itemToCancel;
              cancelItemInComanda(comanda.id, item.id);
              setItemToCancel(null);
              if (printKitchen) {
                setCancellationSimData({ item, comanda });
                onShowSuccessToast('Producto cancelado con aviso a cocina');
              } else {
                onShowSuccessToast('Producto cancelado (sin imprimir)');
              }
            }}
          />
        )}

        {/* Simulation modal */}
        {cancellationSimData && (
          <PrintCancellationSimModal
            isOpen={true}
            item={cancellationSimData.item}
            comanda={cancellationSimData.comanda}
            onClose={() => setCancellationSimData(null)}
          />
        )}
      </div>
    );
  }

  // List of all Takeout orders
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 select-none animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>PARA LLEVAR</span>
            <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
              {takeoutComandas.length} {takeoutComandas.length === 1 ? 'Pedido' : 'Pedidos'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Cada pedido de Para Llevar es independiente y cerrado tras enviarse a cocina.
          </p>
        </div>

        {/* Main CTA */}
        <button
          onClick={handleOpenNewOrder}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm sm:text-base shadow-lg shadow-amber-950/40 border border-amber-400/40 active:scale-95 transition-all min-h-[50px]"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ NUEVO PEDIDO PARA LLEVAR</span>
        </button>
      </div>

      {/* Orders List / Grid */}
      {takeoutComandas.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 text-center max-w-xl mx-auto">
          <ShoppingBag className="w-16 h-16 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-neutral-300">
            No hay pedidos para llevar activos
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 mb-6">
            Presiona el botón "+ NUEVO PEDIDO PARA LLEVAR" para capturar una orden.
          </p>
          <button
            onClick={handleOpenNewOrder}
            className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-950/40 border border-amber-400/40 active:scale-95 transition-all"
          >
            + Crear Primer Pedido
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {takeoutComandas.map(comanda => {
            const totalItems = comanda.items.reduce((acc, it) => acc + it.quantity, 0);
            const isDelivered = comanda.orderStatus === 'ENTREGADO';

            return (
              <div
                key={comanda.id}
                onClick={() => {
                  playTapSound(soundEnabled);
                  setSelectedComandaId(comanda.id);
                }}
                className={`bg-neutral-900 hover:bg-neutral-850 border rounded-3xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] shadow-md group min-h-[170px] ${
                  isDelivered
                    ? 'border-neutral-800 hover:border-neutral-700 opacity-85'
                    : 'border-neutral-800 hover:border-amber-500/50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {comanda.orderLabel || 'Para Llevar'}
                      </h3>
                      <span className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatTime(comanda.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Status Pill: 🟠 EN PREPARACIÓN vs 🟢 ENTREGADO */}
                  {isDelivered ? (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                      <span>🟢</span>
                      <span>ENTREGADO</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                      <span>🟠</span>
                      <span>EN PREPARACIÓN</span>
                    </span>
                  )}
                </div>

                {/* Items preview */}
                <div className="my-3 space-y-1">
                  <span className="text-xs font-bold text-amber-400">
                    {totalItems} {totalItems === 1 ? 'producto enviado' : 'productos enviados'}:
                  </span>
                  <ul className="text-xs text-neutral-300 space-y-0.5 pl-1">
                    {comanda.items.slice(0, 3).map(it => (
                      <li key={it.id} className="truncate">
                        • {it.quantity} × {it.displayTitle}
                      </li>
                    ))}
                    {comanda.items.length > 3 && (
                      <li className="text-neutral-500 italic">
                        +{comanda.items.length - 3} más...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Footer: Quick delivery action if in preparation */}
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-semibold">
                  {!isDelivered ? (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleMarkDelivered(comanda.id, comanda.orderLabel || 'Pedido');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Marcar como entregado
                    </button>
                  ) : (
                    <span className="text-neutral-500">Entregado</span>
                  )}
                  <span className="text-neutral-400 group-hover:text-amber-300 transition-colors">
                    Ver comanda →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Taking Modal */}
      <OrderTakingModal
        isOpen={isOrderModalOpen}
        serviceType="PARA_LLEVAR"
        onClose={() => setIsOrderModalOpen(false)}
        onComandaSent={handleComandaSent}
      />
    </div>
  );
};
