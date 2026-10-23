import React, { useState } from 'react';
import { useComanda, ConsolidatedItem } from '../context/ComandaContext';
import { ComandaItem, InternalComanda } from '../types';
import {
  ArrowLeft,
  Plus,
  UtensilsCrossed,
  Receipt,
  RotateCcw,
  Ban,
  Printer,
  FileEdit,
} from 'lucide-react';
import { playTapSound } from '../utils/audio';
import { OrderTakingModal } from './OrderTakingModal';
import { CancelItemModal } from './CancelItemModal';
import { PrintCancellationSimModal } from './PrintCancellationSimModal';
import { EditConsumedItemModal } from './EditConsumedItemModal';

interface TableDetailViewProps {
  tableNumber: number;
  onBack: () => void;
  onShowSuccessToast: (msg: string) => void;
}

export const TableDetailView: React.FC<TableDetailViewProps> = ({
  tableNumber,
  onBack,
  onShowSuccessToast,
}) => {
  const {
    tables,
    comandas,
    soundEnabled,
    getConsolidatedConsumedForTable,
    closeTable,
    cancelItemInComanda,
  } = useComanda();

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // States for cancelling a sent item
  const [itemToCancel, setItemToCancel] = useState<{
    item: ComandaItem;
    comanda: InternalComanda;
  } | null>(null);

  // States for editing a consumed item (which encapsulates the cancellation flow)
  const [itemToEdit, setItemToEdit] = useState<{
    consolidated: ConsolidatedItem;
    item: ComandaItem;
    comanda: InternalComanda;
  } | null>(null);

  // States for printing simulation modal
  const [cancellationSimData, setCancellationSimData] = useState<{
    item: ComandaItem;
    comanda: InternalComanda;
  } | null>(null);

  const table = tables.find(t => t.tableNumber === tableNumber);
  const status = table?.status || 'libre';
  const isTableOpen = status === 'abierta';

  const consolidatedConsumed = getConsolidatedConsumedForTable(tableNumber);
  // Active (non-cancelled) total items count
  const activeItems = consolidatedConsumed.filter(it => it.status !== 'CANCELADO');
  const totalItemsConsumed = activeItems.reduce(
    (acc, it) => acc + it.quantity,
    0
  );

  const handleOpenOrderModal = () => {
    playTapSound(soundEnabled);
    setIsOrderModalOpen(true);
  };

  const handleComandaSent = (comandaNum: number) => {
    onShowSuccessToast(`Comanda enviada a cocina`);
  };

  const handleConfirmClose = () => {
    playTapSound(soundEnabled);
    closeTable(tableNumber);
    setShowCloseConfirm(false);
    onShowSuccessToast(`Mesa ${tableNumber} cerrada y libre`);
    onBack();
  };

  // Open edit modal for an active item
  const handleOpenEdit = (cItem: ConsolidatedItem) => {
    playTapSound(soundEnabled);
    if (!cItem.comandaId || !cItem.itemId) return;

    const matchedComanda = comandas.find(c => c.id === cItem.comandaId);
    if (!matchedComanda) return;

    const matchedItem = matchedComanda.items.find(it => it.id === cItem.itemId);
    if (!matchedItem) return;

    setItemToEdit({
      consolidated: cItem,
      item: matchedItem,
      comanda: matchedComanda,
    });
  };

  // Perform cancellation through the edit flow
  const handleConfirmCancelFromEdit = (printKitchenCancellation: boolean) => {
    if (!itemToEdit) return;

    const { item, comanda } = itemToEdit;
    cancelItemInComanda(comanda.id, item.id);
    setItemToEdit(null);

    if (printKitchenCancellation) {
      setCancellationSimData({ item, comanda });
      onShowSuccessToast(`Producto cancelado con impresión a cocina`);
    } else {
      onShowSuccessToast(`Producto marcado como CANCELADO (sin impresión)`);
    }
  };

  // Trigger cancel modal when needed directly (legacy fallback)
  const handleInitiateCancel = (item: ConsolidatedItem) => {
    handleOpenEdit(item);
  };

  // Perform cancellation
  const handleConfirmCancelItem = (printKitchenCancellation: boolean) => {
    if (!itemToCancel) return;

    const { item, comanda } = itemToCancel;
    cancelItemInComanda(comanda.id, item.id);
    setItemToCancel(null);

    if (printKitchenCancellation) {
      setCancellationSimData({ item, comanda });
      onShowSuccessToast(`Producto cancelado con impresión a cocina`);
    } else {
      onShowSuccessToast(`Producto marcado como CANCELADO (sin impresión)`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 select-none animate-in fade-in duration-150">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <button
          onClick={() => {
            playTapSound(soundEnabled);
            onBack();
          }}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700/80 active:scale-95 transition-all text-xs sm:text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Mesas</span>
        </button>

        {/* Action: CERRAR MESA */}
        {isTableOpen && (
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setShowCloseConfirm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-2xl bg-neutral-800 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-neutral-700 hover:border-rose-800/60 active:scale-95 transition-all text-xs sm:text-sm font-bold shadow-sm"
          >
            <Receipt className="w-4 h-4 text-rose-400" />
            <span>CERRAR MESA</span>
          </button>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Table Title and Status Banner */}
        <div className="border-b border-neutral-800 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">
              Restaurante · Servicio en Sala
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              MESA {tableNumber}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isTableOpen ? (
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ABIERTA
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-xl bg-neutral-800 text-neutral-400 border border-neutral-700 text-xs font-bold tracking-wide">
                LIBRE
              </span>
            )}

            {totalItemsConsumed > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-700">
                {totalItemsConsumed} {totalItemsConsumed === 1 ? 'producto' : 'productos'} enviados
              </span>
            )}
          </div>
        </div>

        {/* Section: "Lo consumido" */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-200 tracking-wide">
              Lo consumido:
            </h2>
          </div>

          {consolidatedConsumed.length === 0 ? (
            <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-8 text-center">
              <UtensilsCrossed className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-neutral-300">
                Sin comandas enviadas
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Toca "+ AGREGAR PRODUCTOS" para tomar comanda y enviarla a cocina.
              </p>
            </div>
          ) : (
            <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-2xl p-4 sm:p-6 divide-y divide-neutral-850">
              {consolidatedConsumed.map(item => {
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
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700/80 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                            title="Editar o gestionar este producto consumido"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-neutral-400" />
                            <span>EDITAR</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Action: + AGREGAR PRODUCTOS */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleOpenOrderModal}
            className="w-full h-16 sm:h-20 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base sm:text-xl tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/50 border border-emerald-400/40 active:scale-[0.99] transition-all"
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            <span>+ AGREGAR PRODUCTOS</span>
          </button>
          <p className="text-xs text-neutral-500 text-center mt-3">
            Cada envío genera una nueva comanda interna independiente sin duplicar consumos anteriores.
          </p>
        </div>
      </div>

      {/* Confirmation Modal: CERRAR MESA (ABIERTA -> LIBRE) */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                ¿Cerrar Mesa {tableNumber}?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                Al cerrarla se asume que la cuenta ya fue cobrada mediante el POS y que el cliente se retiró.
              </p>
              <p className="text-xs text-neutral-400 mt-2">
                La mesa pasará directamente a <strong className="text-white">LIBRE</strong>. El historial de comandas se conserva en el sistema para reimpresión.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setShowCloseConfirm(false);
                }}
                className="flex-1 h-12 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs sm:text-sm hover:bg-neutral-750 transition-colors border border-neutral-700"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm transition-colors shadow-lg shadow-rose-950/40"
              >
                CERRAR MESA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Taking Drawer/Modal */}
      <OrderTakingModal
        isOpen={isOrderModalOpen}
        serviceType="MESA"
        tableNumber={tableNumber}
        onClose={() => setIsOrderModalOpen(false)}
        onComandaSent={handleComandaSent}
      />

      {/* Edit Consumed Item Modal (Houses the Cancel action within the Edit flow) */}
      {itemToEdit && (
        <EditConsumedItemModal
          isOpen={true}
          item={itemToEdit.consolidated}
          comanda={itemToEdit.comanda}
          onClose={() => setItemToEdit(null)}
          onConfirmCancel={handleConfirmCancelFromEdit}
        />
      )}

      {/* Cancel Item Modal (Confirm & Prompt kitchen print) */}
      {itemToCancel && (
        <CancelItemModal
          isOpen={true}
          item={itemToCancel.item}
          comanda={itemToCancel.comanda}
          onConfirm={handleConfirmCancelItem}
          onClose={() => setItemToCancel(null)}
        />
      )}

      {/* Simulated Cancellation Ticket Modal (Optional) */}
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
};
