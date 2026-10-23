import React, { useState } from 'react';
import { useComanda } from '../context/ComandaContext';
import { InternalComanda } from '../types';
import {
  Printer,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Sparkles,
  History,
} from 'lucide-react';
import { playKitchenChime, playTapSound } from '../utils/audio';

interface ReprintViewProps {
  onShowSuccessToast: (msg: string) => void;
}

export const ReprintView: React.FC<ReprintViewProps> = ({ onShowSuccessToast }) => {
  const { comandas, getComandaByNumber, soundEnabled } = useComanda();
  const [searchNum, setSearchNum] = useState('');
  const [selectedComanda, setSelectedComanda] = useState<InternalComanda | null>(() => {
    return comandas.length > 0 ? comandas[0] : null;
  });
  const [reprintFeedback, setReprintFeedback] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound(soundEnabled);
    const parsed = parseInt(searchNum.trim(), 10);
    if (!isNaN(parsed)) {
      const found = getComandaByNumber(parsed);
      if (found) {
        setSelectedComanda(found);
      } else {
        onShowSuccessToast(`No se encontró la comanda #${parsed}`);
      }
    }
  };

  const handleSimulateReprint = () => {
    if (!selectedComanda) return;
    playKitchenChime(soundEnabled);
    setReprintFeedback(true);
    onShowSuccessToast(`Comanda #${selectedComanda.comandaNumber} reimpresa correctamente`);
    setTimeout(() => setReprintFeedback(false), 2000);
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 select-none animate-in fade-in duration-150">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <History className="w-7 h-7 text-purple-400" />
          <span>HISTORIAL DE COMANDAS</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
          Consulta las comandas registradas en el sistema. Puedes buscar por número de comanda, revisar su detalle y reimprimir su ticket cuando sea necesario.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Number Search & Recent List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-xl"
          >
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              Buscar por número interno de comanda:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono font-bold">
                  #
                </span>
                <input
                  type="number"
                  placeholder="Ej: 1024"
                  value={searchNum}
                  onChange={e => setSearchNum(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-8 pr-3.5 py-3 text-base font-mono font-bold text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md shadow-purple-950/40 active:scale-95 transition-all"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Recent Internal Comandas list */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-xl">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-3">
              Comandas Registradas ({comandas.length})
            </span>

            {comandas.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-6">
                No hay comandas registradas todavía
              </p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {comandas.map(c => {
                  const isSelected = selectedComanda?.id === c.id;
                  const totalItems = c.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        playTapSound(soundEnabled);
                        setSelectedComanda(c);
                      }}
                      className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-950/30 border-purple-500/60 ring-1 ring-purple-500/30'
                          : 'bg-neutral-950/50 hover:bg-neutral-850 border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm text-purple-400 w-16">
                          #{c.comandaNumber}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {c.serviceType === 'MESA'
                              ? `Mesa ${c.tableNumber}`
                              : c.orderLabel || c.serviceType}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {totalItems} {totalItems === 1 ? 'producto' : 'productos'} · {formatDateTime(c.createdAt)}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs text-neutral-400 font-semibold">
                        Ver →
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Physical Ticket Preview Simulation */}
        <div className="lg:col-span-7">
          {selectedComanda ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[500px]">
              <div>
                {/* Thermal Ticket Simulation Styling */}
                <div className="bg-neutral-100 text-neutral-900 rounded-2xl p-6 sm:p-8 font-mono shadow-inner border border-neutral-300 max-w-lg mx-auto">
                  {/* Ticket Header */}
                  <div className="text-center pb-4 border-b-2 border-dashed border-neutral-400">
                    <h3 className="text-xl font-black tracking-tight uppercase">
                      *** COCINA ***
                    </h3>
                    <p className="text-xs text-neutral-600 font-sans font-bold">
                      COMANDA LIGHT
                    </p>
                    <div className="mt-2 text-2xl font-black text-neutral-950">
                      COMANDA #{selectedComanda.comandaNumber}
                    </div>
                  </div>

                  {/* Ticket Metadata */}
                  <div className="py-3 border-b border-dashed border-neutral-400 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-sm text-neutral-950">
                      <span>SERVICIO:</span>
                      <span className="uppercase">
                        {selectedComanda.serviceType === 'MESA'
                          ? `MESA ${selectedComanda.tableNumber}`
                          : selectedComanda.orderLabel || selectedComanda.serviceType}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>FECHA Y HORA:</span>
                      <span>{formatDateTime(selectedComanda.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>ESTADO:</span>
                      <span className="font-bold text-emerald-700">ENVIADA A COCINA</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="py-4 space-y-3 border-b-2 border-dashed border-neutral-400">
                    {selectedComanda.items.map(item => {
                      const isCancelled = item.status === 'CANCELADO';
                      return (
                        <div key={item.id} className="text-xs">
                          <div className="flex justify-between font-black text-sm text-neutral-950">
                            <span className={isCancelled ? 'line-through text-neutral-500' : ''}>
                              {item.quantity} × {item.displayTitle}
                            </span>
                            {isCancelled && (
                              <span className="text-xs font-black text-rose-600 border border-rose-600 px-1.5 py-0.2 rounded uppercase">
                                CANCELADO
                              </span>
                            )}
                          </div>
                          {item.details && (
                            <div className={`text-[11px] pl-3 italic mt-0.5 ${isCancelled ? 'text-neutral-400 line-through' : 'text-neutral-700'}`}>
                              • {item.details}
                            </div>
                          )}
                          {item.notes && (
                            <div className={`text-[11px] font-bold pl-3 mt-0.5 ${isCancelled ? 'text-neutral-400' : 'text-rose-700'}`}>
                              *** NOTA: {item.notes} ***
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Ticket Footer */}
                  <div className="pt-4 text-center text-[11px] text-neutral-500">
                    <p>-- COPIA REIMPRESIÓN COCINA --</p>
                    <p className="text-[10px] mt-0.5">Registro inmutable de servicio</p>
                  </div>
                </div>
              </div>

              {/* Action: Simulate Reprint */}
              <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-neutral-400">
                  La comanda #{selectedComanda.comandaNumber} permanece intacta en el historial.
                </span>

                <button
                  type="button"
                  onClick={handleSimulateReprint}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-950/40 border border-purple-400/40 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>REIMPRIMIR TICKET</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
              <Printer className="w-14 h-14 text-neutral-600 mb-3" />
              <h3 className="text-lg font-bold text-neutral-300">
                Selecciona una comanda
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-sm">
                Introduce el número interno en el buscador o selecciona una comanda de la lista.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
