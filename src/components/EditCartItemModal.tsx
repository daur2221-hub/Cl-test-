import React, { useState } from 'react';
import { ComandaItem } from '../types';
import { QUICK_NOTES } from '../data/menu';
import { X, Check, Plus, Minus, FileEdit } from 'lucide-react';
import { playTapSound } from '../utils/audio';
import { useComanda } from '../context/ComandaContext';

interface EditCartItemModalProps {
  item: ComandaItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updatedItem: ComandaItem) => void;
}

export const EditCartItemModal: React.FC<EditCartItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { soundEnabled } = useComanda();

  const [quantity, setQuantity] = useState<number>(item.quantity);
  const [selectedNotes, setSelectedNotes] = useState<string[]>(() => {
    if (!item.notes) return [];
    const arr = item.notes.split(' · ').map(s => s.trim());
    return arr.filter(n => QUICK_NOTES.includes(n));
  });
  const [customNote, setCustomNote] = useState<string>(() => {
    if (!item.notes) return '';
    const arr = item.notes.split(' · ').map(s => s.trim());
    const custom = arr.filter(n => !QUICK_NOTES.includes(n));
    return custom.join(' · ');
  });

  if (!isOpen) return null;

  const handleToggleNote = (note: string) => {
    playTapSound(soundEnabled);
    if (selectedNotes.includes(note)) {
      setSelectedNotes(prev => prev.filter(n => n !== note));
    } else {
      setSelectedNotes(prev => [...prev, note]);
    }
  };

  const handleQuantityChange = (delta: number) => {
    playTapSound(soundEnabled);
    setQuantity(prev => Math.max(1, Math.min(25, prev + delta)));
  };

  const handleSave = () => {
    playTapSound(soundEnabled);
    const allNotes = [...selectedNotes];
    if (customNote.trim()) {
      allNotes.push(customNote.trim());
    }

    const updatedItem: ComandaItem = {
      ...item,
      quantity,
      notes: allNotes.length > 0 ? allNotes.join(' · ') : undefined,
    };

    onConfirm(updatedItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-800/80 border-b border-neutral-700/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Editar Producto
              </h2>
              <p className="text-xs text-neutral-400 truncate max-w-[280px]">
                {item.displayTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quantity Selector */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
              Cantidad
            </label>
            <div className="flex items-center justify-between p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-2xl">
              <span className="text-sm font-semibold text-neutral-300">
                Unidades a enviar:
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-11 h-11 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-bold text-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-700 active:scale-95 transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-10 text-center font-black text-2xl text-white font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="w-11 h-11 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-bold text-lg flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Notes */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
              Notas Rápidas para Cocina
            </label>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_NOTES.map(note => {
                const isSelected = selectedNotes.includes(note);
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => handleToggleNote(note)}
                    className={`p-2.5 rounded-xl border-2 text-left text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500/80 text-emerald-950 dark:text-emerald-300 shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-950/40 border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-700'
                    }`}
                  >
                    <span>{note}</span>
                    {isSelected && <span className="font-black text-emerald-700 dark:text-emerald-400">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
              Nota Personalizada / Instrucción
            </label>
            <input
              type="text"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="Ej: salsa de anguila aparte, etc."
              className="w-full h-12 px-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-emerald-500/70"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-neutral-800/80 border-t border-neutral-700 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="flex-1 h-13 rounded-2xl bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold hover:bg-neutral-700 active:scale-95 transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Check className="w-5 h-5" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
