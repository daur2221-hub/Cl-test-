import React from 'react';
import { useComanda } from '../context/ComandaContext';
import { ActiveTab } from '../types';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Printer,
  History,
  Menu,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { playTapSound } from '../utils/audio';
import { getRestaurantInitials } from '../utils/appearance';

interface HeaderProps {
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const {
    activeTab,
    setActiveTab,
    tables,
    comandas,
    soundEnabled,
    setSoundEnabled,
    setSelectedTable,
    restaurantName,
    restaurantLogo,
    primaryColor,
  } = useComanda();

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const updateFs = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    updateFs();
    document.addEventListener('fullscreenchange', updateFs);
    document.addEventListener('webkitfullscreenchange', updateFs);
    return () => {
      document.removeEventListener('fullscreenchange', updateFs);
      document.removeEventListener('webkitfullscreenchange', updateFs);
    };
  }, []);

  const toggleFullscreen = async () => {
    playTapSound(soundEnabled);
    if (!document.fullscreenElement) {
      try {
        const docEl = document.documentElement as any;
        const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen;
        if (req) {
          await req.call(docEl);
        }
      } catch (err) {
        console.warn('Fullscreen request denied', err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } catch (err) {
        console.warn('Exit fullscreen denied', err);
      }
    }
  };

  const openTablesCount = tables.filter(t => t.status === 'abierta').length;
  const takeoutCount = comandas.filter(c => c.serviceType === 'PARA_LLEVAR').length;
  const deliveryCount = comandas.filter(c => c.serviceType === 'DOMICILIO').length;

  const handleTabChange = (tab: ActiveTab) => {
    playTapSound(soundEnabled);
    setActiveTab(tab);
    if (tab !== 'mesas') {
      setSelectedTable(null);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-neutral-900 border-b border-neutral-800 text-neutral-100 px-3 sm:px-6 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {restaurantLogo ? (
              <img
                src={restaurantLogo}
                alt={restaurantName || 'Logotipo'}
                className="w-10 h-10 rounded-xl object-cover border border-neutral-700/60 shrink-0 shadow-sm"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xl tracking-tight shrink-0 shadow-sm transition-colors"
                style={{
                  backgroundColor: `${primaryColor}22`,
                  borderColor: `${primaryColor}60`,
                  color: primaryColor,
                }}
              >
                {getRestaurantInitials(restaurantName)}
              </div>
            )}
            <div className="min-w-0 flex items-center">
              <h1
                className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight truncate max-w-[180px] xs:max-w-[240px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[540px]"
                title={restaurantName || 'COMANDA LIGHT'}
              >
                {restaurantName || 'COMANDA LIGHT'}
              </h1>
            </div>
          </div>

          {/* Quick utility controls on mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playTapSound(!soundEnabled);
              }}
              title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
              className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-300 hover:text-white active:bg-neutral-700 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-neutral-500" />}
            </button>
            <button
              onClick={() => {
                playTapSound(soundEnabled);
                onOpenMenu();
              }}
              title="Menú principal (☰)"
              className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-300 hover:text-white active:bg-neutral-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Service Selector (MESAS / PARA LLEVAR / DOMICILIO / REIMPRIMIR) */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          {/* MESAS */}
          <button
            onClick={() => handleTabChange('mesas')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap min-h-[46px] ${
              activeTab === 'mesas'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/40'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-700/50'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>MESAS</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'mesas'
                  ? 'bg-emerald-700 text-emerald-100'
                  : 'bg-neutral-700 text-neutral-300'
              }`}
            >
              {openTablesCount} / 12
            </span>
          </button>

          {/* PARA LLEVAR */}
          <button
            onClick={() => handleTabChange('para_llevar')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap min-h-[46px] ${
              activeTab === 'para_llevar'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40 border border-amber-400/40'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-700/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>PARA LLEVAR</span>
            {takeoutCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'para_llevar'
                    ? 'bg-amber-700 text-amber-100'
                    : 'bg-neutral-700 text-neutral-300'
                }`}
              >
                {takeoutCount}
              </span>
            )}
          </button>

          {/* DOMICILIO */}
          <button
            onClick={() => handleTabChange('domicilio')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap min-h-[46px] ${
              activeTab === 'domicilio'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40 border border-blue-400/40'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-700/50'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>DOMICILIO</span>
            {deliveryCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'domicilio'
                    ? 'bg-blue-700 text-blue-100'
                    : 'bg-neutral-700 text-neutral-300'
                }`}
              >
                {deliveryCount}
              </span>
            )}
          </button>

          {/* HISTORIAL */}
          <button
            onClick={() => handleTabChange('historial')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap min-h-[46px] ${
              activeTab === 'historial' || activeTab === 'reimpresion'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40 border border-purple-400/40'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-700/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>HISTORIAL</span>
          </button>
        </nav>

        {/* Desktop Utility Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa (Modo Tablet)'}
            className="w-11 h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 flex items-center justify-center text-neutral-300 hover:text-white active:scale-95 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playTapSound(!soundEnabled);
            }}
            title={soundEnabled ? 'Sonido táctil activado' : 'Sonido silenciado'}
            className="w-11 h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 flex items-center justify-center text-neutral-300 hover:text-white active:scale-95 transition-all"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-neutral-500" />}
          </button>

          {/* Hamburger Menu (☰) */}
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onOpenMenu();
            }}
            title="Menú principal (☰)"
            className="w-11 h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 flex items-center justify-center text-neutral-300 hover:text-white active:scale-95 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
