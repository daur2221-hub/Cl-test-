import React, { useState } from 'react';
import { useComanda } from '../context/ComandaContext';
import { Product, ComandaItem } from '../types';
import { ROLL_RELLENOS, ROLL_COBERTURAS, QUICK_NOTES } from '../data/menu';
import { X, Check, Minus, Plus, Sparkles } from 'lucide-react';
import { playTapSound } from '../utils/audio';

interface RollCustomizerModalProps {
  isOpen: boolean;
  product: Product | null;
  initialItem?: ComandaItem | null;
  onClose: () => void;
  onConfirm: (customizedItem: ComandaItem) => void;
}

export const RollCustomizerModal: React.FC<RollCustomizerModalProps> = ({
  isOpen,
  product,
  initialItem,
  onClose,
  onConfirm,
}) => {
  const { soundEnabled, rollIngredients, primaryColor } = useComanda();

  const ALL_BASE_INGREDIENTS = rollIngredients?.bases || ['Aguacate', 'Philadelphia', 'Pepino'];
  const ALL_RELLENOS = rollIngredients?.rellenos || ROLL_RELLENOS;
  const ALL_COBERTURAS = rollIngredients?.coberturas || ROLL_COBERTURAS;

  const [selectedBase, setSelectedBase] = useState<string[]>(() => {
    if (initialItem?.rollCustomization?.base) {
      return initialItem.rollCustomization.base;
    }
    return ALL_BASE_INGREDIENTS;
  });
  const [relleno, setRelleno] = useState<string>(() => {
    if (initialItem?.rollCustomization?.relleno) {
      return initialItem.rollCustomization.relleno;
    }
    return ALL_RELLENOS[0] || 'Camarón';
  });
  const [cobertura, setCobertura] = useState<string | null>(() => {
    if (initialItem?.rollCustomization?.cobertura) {
      return initialItem.rollCustomization.cobertura;
    }
    return null;
  });
  const [quantity, setQuantity] = useState<number>(() => {
    return initialItem?.quantity || 1;
  });
  const [selectedNotes, setSelectedNotes] = useState<string[]>(() => {
    if (initialItem?.notes) {
      return initialItem.notes.split(' · ').filter(Boolean);
    }
    return [];
  });
  const [customNote, setCustomNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleToggleBase = (ingredient: string) => {
    playTapSound(soundEnabled);
    setSelectedBase(prev => {
      if (prev.includes(ingredient)) {
        return prev.filter(b => b !== ingredient);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const handleSelectRelleno = (r: string) => {
    playTapSound(soundEnabled);
    setRelleno(r);
    setErrorMsg(null);
  };

  const handleSelectCobertura = (c: string) => {
    playTapSound(soundEnabled);
    if (cobertura === c) {
      setCobertura(null);
    } else {
      setCobertura(c);
    }
  };

  const handleToggleNote = (note: string) => {
    playTapSound(soundEnabled);
    setSelectedNotes(prev => {
      if (prev.includes(note)) {
        return prev.filter(n => n !== note);
      } else {
        return [...prev, note];
      }
    });
  };

  const handleQuantityChange = (delta: number) => {
    playTapSound(soundEnabled);
    setQuantity(prev => Math.max(1, Math.min(99, prev + delta)));
  };

  const handleConfirm = () => {
    playTapSound(soundEnabled);
    if (!relleno) {
      setErrorMsg('Debes seleccionar un relleno obligatorio');
      return;
    }

    // Build descriptive title e.g. "Rollo Camarón / Aguacate"
    const title = cobertura
      ? `${product.name} ${relleno} / ${cobertura}`
      : `${product.name} ${relleno}`;

    // Compute details for kitchen
    const missingBases = ALL_BASE_INGREDIENTS.filter(b => !selectedBase.includes(b));
    const detailsParts: string[] = [];

    detailsParts.push(`Relleno: ${relleno}`);
    if (cobertura) {
      detailsParts.push(`Cobertura: ${cobertura}`);
    } else {
      detailsParts.push('Sin cobertura');
    }

    if (missingBases.length > 0) {
      detailsParts.push(`SIN: ${missingBases.join(', ')}`);
    }

    const allNotes = [...selectedNotes];
    if (customNote.trim()) {
      allNotes.push(customNote.trim());
    }

    const item: ComandaItem = {
      id: initialItem?.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      quantity,
      rollCustomization: {
        base: selectedBase,
        relleno,
        cobertura: cobertura || undefined,
      },
      displayTitle: title,
      details: detailsParts.join(' · '),
      notes: allNotes.length > 0 ? allNotes.join(' · ') : undefined,
    };

    onConfirm(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-100 dark:bg-neutral-850/90 border-b border-neutral-300 dark:border-neutral-750 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-900 dark:text-white leading-tight">
                Personalizar Rollo
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                Selecciona relleno obligatorio y cobertura opcional
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white flex items-center justify-center border-2 border-neutral-300 dark:border-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Base Automática Seleccionable */}
          <div className="bg-neutral-50 dark:bg-neutral-950/60 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black text-neutral-900 dark:text-neutral-200 uppercase tracking-wider block">
                Ingredientes Base:
              </span>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-semibold">
                Toca para deseleccionar
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_BASE_INGREDIENTS.map(ing => {
                const isChecked = selectedBase.includes(ing);
                return (
                  <button
                    key={ing}
                    type="button"
                    onClick={() => handleToggleBase(ing)}
                    className={`h-12 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-neutral-850 border-emerald-600 dark:border-emerald-500 text-emerald-950 dark:text-emerald-300 shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-900/60 border-neutral-300 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 line-through'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-md flex items-center justify-center text-xs font-black border transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-neutral-400 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span>{ing}</span>
                  </button>
                );
              })}
            </div>
            {ALL_BASE_INGREDIENTS.filter(b => !selectedBase.includes(b)).length > 0 && (
              <div className="mt-2.5 text-xs text-amber-950 dark:text-amber-200 font-bold flex items-center gap-2 bg-amber-100 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-400 dark:border-amber-800/40">
                <span className="text-sm">⚠️</span>
                <div>
                  <span className="text-neutral-800 dark:text-neutral-300 font-semibold">Se enviará a cocina: </span>
                  <span className="font-black text-amber-950 dark:text-amber-300">
                    {ALL_BASE_INGREDIENTS.filter(b => !selectedBase.includes(b)).map(b => `SIN ${b.toUpperCase()}`).join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Relleno (Obligatorio) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black text-neutral-900 dark:text-white tracking-wide">
                1. Relleno <span className="text-amber-800 dark:text-amber-400 text-xs font-black">(Obligatorio)</span>
              </span>
              {relleno && (
                <span className="text-xs text-emerald-900 dark:text-emerald-300 font-black flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-400 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  Seleccionado: {relleno}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ALL_RELLENOS.map(r => {
                const isSelected = relleno === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSelectRelleno(r)}
                    className={`h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-amber-600 dark:bg-amber-600 border-amber-800 dark:border-amber-700 text-white shadow-md ring-2 ring-amber-500/40 font-black'
                        : 'bg-neutral-100 dark:bg-neutral-850 hover:bg-neutral-200 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-200 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    <span>{r}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cobertura (Opcional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black text-neutral-900 dark:text-white tracking-wide">
                2. Cobertura <span className="text-neutral-600 dark:text-neutral-400 text-xs font-semibold">(Opcional)</span>
              </span>
              <span className="text-xs text-neutral-800 dark:text-neutral-300 font-bold px-2.5 py-0.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                {cobertura ? `Seleccionado: ${cobertura}` : 'Sin cobertura'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ALL_COBERTURAS.map(c => {
                const isSelected = cobertura === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectCobertura(c)}
                    className={`h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-700 dark:bg-emerald-600 border-emerald-900 dark:border-emerald-700 text-white shadow-md ring-2 ring-emerald-500/40 font-black'
                        : 'bg-neutral-100 dark:bg-neutral-850 hover:bg-neutral-200 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-200 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
            {cobertura && (
              <button
                type="button"
                onClick={() => handleSelectCobertura(cobertura)}
                className="mt-2 text-xs text-neutral-700 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white underline font-bold"
              >
                Quitar cobertura (dejar alga por fuera)
              </button>
            )}
          </div>

          {/* Quick Notes / Especificaciones */}
          <div>
            <span className="text-xs font-black text-neutral-800 dark:text-neutral-400 uppercase tracking-wider block mb-2">
              Indicaciones Rápidas de Cocina:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_NOTES.map(note => {
                const isChecked = selectedNotes.includes(note);
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => handleToggleNote(note)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${
                      isChecked
                        ? 'bg-purple-100 dark:bg-purple-600/30 border-purple-600 dark:border-purple-500 text-purple-950 dark:text-purple-200 ring-2 ring-purple-500/30 font-black'
                        : 'bg-neutral-100 dark:bg-neutral-850 hover:bg-neutral-200 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white'
                    }`}
                  >
                    {isChecked ? `✓ ${note}` : note}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Otra especificación especial..."
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              className="mt-2.5 w-full bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 dark:focus:border-neutral-500 font-medium"
            />
          </div>

          {/* Quantity Stepper */}
          <div className="bg-neutral-100 dark:bg-neutral-950/60 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm font-black text-neutral-900 dark:text-white">Cantidad de rollos:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-black text-lg flex items-center justify-center active:scale-95 transition-all shadow-sm"
              >
                <Minus className="w-5 h-5 stroke-[2.5]" />
              </button>
              <span className="text-2xl font-black text-neutral-900 dark:text-white w-10 text-center font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-black text-lg flex items-center justify-center active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-sm text-rose-950 dark:text-rose-200 font-bold bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/40 p-3 rounded-xl flex items-center gap-2">
              <span className="text-base leading-none">⚠️</span>
              <span>{errorMsg}</span>
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-neutral-100 dark:bg-neutral-850/90 border-t border-neutral-300 dark:border-neutral-750 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="flex-1 h-14 rounded-2xl bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-200 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-750 active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{ backgroundColor: primaryColor }}
            className="flex-2 h-14 rounded-2xl text-white keep-white font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span className="text-white keep-white">
              {initialItem ? 'Guardar Cambios' : `Agregar (${quantity} ${quantity > 1 ? 'Rollos' : 'Rollo'})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
