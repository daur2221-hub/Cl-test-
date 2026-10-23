import React, { useState } from 'react';
import { useComanda } from '../context/ComandaContext';
import {
  UtensilsCrossed,
  Plus,
  ShoppingBag,
  Bike,
  Layers,
} from 'lucide-react';
import { playTapSound } from '../utils/audio';
import { OrderTakingModal } from './OrderTakingModal';
import { TableInfo } from '../types';

interface TableGridProps {
  onSelectTable: (tableNumber: number) => void;
  onShowSuccessToast: (msg: string) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  onSelectTable,
  onShowSuccessToast,
}) => {
  const {
    tables,
    getConsolidatedConsumedForTable,
    soundEnabled,
  } = useComanda();

  const [quickServiceModal, setQuickServiceModal] = useState<'PARA_LLEVAR' | 'DOMICILIO' | null>(null);
  const [directCaptureTable, setDirectCaptureTable] = useState<number | null>(null);

  const handleTableClick = (table: TableInfo) => {
    playTapSound(soundEnabled);
    if (table.status === 'libre') {
      // Mesas LIBRES: abrir directamente captura de productos sin pantalla intermedia
      setDirectCaptureTable(table.tableNumber);
    } else {
      // Mesas ABIERTAS: entrar a ver lo consumido y agregar
      onSelectTable(table.tableNumber);
    }
  };

  const handleQuickComandaSent = (num: number) => {
    onShowSuccessToast(`Comanda enviada a cocina`);
  };

  const handleDirectComandaSent = (num: number) => {
    onShowSuccessToast(`Comanda enviada a cocina`);
    setDirectCaptureTable(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 select-none animate-in fade-in duration-150">
      {/* Top Section Header & Quick Service Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>MESAS</span>
            <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 sm:py-1 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
              12 Mesas en Sala
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Toca una mesa libre para tomar comanda o una mesa abierta para consultar lo consumido.
          </p>
        </div>

        {/* Quick Service Buttons: PARA LLEVAR & DOMICILIO */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setQuickServiceModal('PARA_LLEVAR');
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-950/40 border border-amber-400/40 active:scale-95 transition-all min-h-[44px] sm:min-h-[46px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>+ Para Llevar</span>
          </button>

          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setQuickServiceModal('DOMICILIO');
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-950/40 border border-blue-400/40 active:scale-95 transition-all min-h-[44px] sm:min-h-[46px]"
          >
            <Bike className="w-4 h-4" />
            <span>+ Domicilio</span>
          </button>
        </div>
      </div>

      {/* 12 Tables Grid - Responsive for Portrait & Landscape */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-4">
        {tables.map(table => {
          const isOpen = table.status === 'abierta';
          const isLibre = table.status === 'libre';
          const consumedItems = isOpen
            ? getConsolidatedConsumedForTable(table.tableNumber)
            : [];
          const totalUnits = consumedItems.reduce((acc, it) => acc + it.quantity, 0);

          return (
            <div
              key={table.tableNumber}
              onClick={() => handleTableClick(table)}
              className={`relative rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between text-left transition-all active:scale-[0.98] cursor-pointer min-h-[135px] sm:min-h-[160px] group ${
                isOpen
                  ? 'bg-neutral-850 hover:bg-neutral-800 border-2 border-emerald-500/80 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-400/30'
                  : 'bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 shadow-md'
              }`}
            >
              {/* Card Header: Table Number & Status Pill */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                    Mesa
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight leading-none mt-0.5 sm:mt-1 block">
                    {table.tableNumber}
                  </span>
                </div>

                {/* Visual state: LIBRE vs ABIERTA */}
                <div>
                  {isOpen ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      ABIERTA
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl bg-neutral-800 text-neutral-400 border border-neutral-700 text-xs font-bold tracking-wide">
                      LIBRE
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body: Consumed Info or Prompt */}
              <div className="my-1.5 sm:my-2">
                {isOpen ? (
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                      <span>
                        {totalUnits > 0
                          ? `${totalUnits} ${totalUnits === 1 ? 'producto enviado' : 'productos enviados'}`
                          : 'Abierta'}
                      </span>
                    </div>
                    {consumedItems.length > 0 && (
                      <p className="text-xs text-neutral-400 mt-1 truncate">
                        {consumedItems.slice(0, 2).map(c => `${c.quantity}× ${c.displayTitle}`).join(', ')}
                        {consumedItems.length > 2 && '...'}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 font-medium">
                    Disponible para abrir
                  </p>
                )}
              </div>

              {/* Card Footer: Action Affordance */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold">
                {isOpen ? (
                  <span className="text-neutral-300 group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                    Ver lo consumido →
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <Plus className="w-3.5 h-3.5" /> Tomar comanda
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Capture Modal for LIBRE table - Skips intermediate screen */}
      {directCaptureTable !== null && (
        <OrderTakingModal
          isOpen={true}
          serviceType="MESA"
          tableNumber={directCaptureTable}
          onClose={() => setDirectCaptureTable(null)}
          onComandaSent={handleDirectComandaSent}
        />
      )}

      {/* Quick Service Modal for Para Llevar or Domicilio from Mesas tab */}
      {quickServiceModal && (
        <OrderTakingModal
          isOpen={true}
          serviceType={quickServiceModal}
          onClose={() => setQuickServiceModal(null)}
          onComandaSent={handleQuickComandaSent}
        />
      )}
    </div>
  );
};
