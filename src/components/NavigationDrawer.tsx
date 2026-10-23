import React from 'react';
import {
  X,
  Settings,
  UtensilsCrossed,
  FlaskConical,
  ChevronRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { playTapSound } from '../utils/audio';
import { useComanda } from '../context/ComandaContext';
import { getRestaurantInitials } from '../utils/appearance';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenMenuManagement: () => void;
  onOpenTest: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenMenuManagement,
  onOpenTest,
}) => {
  const { soundEnabled, restaurantName, restaurantLogo, primaryColor } = useComanda();

  if (!isOpen) return null;

  const handleSelectOption = (action: () => void) => {
    playTapSound(soundEnabled);
    onClose();
    action();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-full max-w-sm h-full bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 bg-neutral-850/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {restaurantLogo ? (
              <img
                src={restaurantLogo}
                alt={restaurantName || 'Logotipo'}
                className="w-10 h-10 rounded-xl object-cover border border-neutral-700/60 shrink-0 shadow-sm"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl border flex items-center justify-center font-black text-lg shrink-0 shadow-sm transition-colors"
                style={{
                  backgroundColor: `${primaryColor}22`,
                  borderColor: `${primaryColor}60`,
                  color: primaryColor,
                }}
              >
                {getRestaurantInitials(restaurantName)}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white tracking-tight leading-none truncate max-w-[200px]">
                {restaurantName || 'COMANDA LIGHT'}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 font-medium">
                Menú de Navegación
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-700 active:scale-95 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {/* 1. Configuración */}
          <button
            type="button"
            onClick={() => handleSelectOption(onOpenSettings)}
            className="w-full p-4 rounded-2xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-750/70 hover:border-neutral-600 text-left transition-all group active:scale-[0.98] flex items-center justify-between gap-3 shadow-sm min-h-[68px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-neutral-800 text-neutral-300 group-hover:text-white border border-neutral-700 flex items-center justify-center shrink-0 transition-colors">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors block">
                  Configuración
                </span>
                <span className="text-xs text-neutral-400 block mt-0.5 leading-snug">
                  Apariencia, pantalla completa y sonidos
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* 2. Administrar menú */}
          <button
            type="button"
            onClick={() => handleSelectOption(onOpenMenuManagement)}
            className="w-full p-4 rounded-2xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-750/70 hover:border-amber-600/50 text-left transition-all group active:scale-[0.98] flex items-center justify-between gap-3 shadow-sm min-h-[68px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors block">
                  Administrar menú
                </span>
                <span className="text-xs text-neutral-400 block mt-0.5 leading-snug">
                  Catálogo, platillos, categorías e ingredientes de rollos
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* 3. Test */}
          <button
            type="button"
            onClick={() => handleSelectOption(onOpenTest)}
            className="w-full p-4 rounded-2xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-750/70 hover:border-purple-600/50 text-left transition-all group active:scale-[0.98] flex items-center justify-between gap-3 shadow-sm min-h-[68px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors block">
                  Test
                </span>
                <span className="text-xs text-neutral-400 block mt-0.5 leading-snug">
                  Pruebas de audio y datos locales de prueba
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
            <span>{soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}</span>
          </div>
          <span className="text-[11px] text-neutral-500">v1.2.0</span>
        </div>
      </div>
    </div>
  );
};
