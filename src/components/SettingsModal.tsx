import React, { useState, useEffect, useRef } from 'react';
import { useComanda } from '../context/ComandaContext';
import {
  X,
  VolumeX,
  Maximize,
  Minimize,
  AlertTriangle,
  Check,
  Download,
  Palette,
  Store,
  Upload,
  Sun,
  Moon,
} from 'lucide-react';
import { playTapSound } from '../utils/audio';
import {
  PRESET_COLORS,
  processLogoImage,
  getRestaurantInitials,
} from '../utils/appearance';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSuccessToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onShowSuccessToast,
}) => {
  const {
    soundEnabled,
    setSoundEnabled,
    theme,
    setTheme,
    primaryColor,
    setPrimaryColor,
    restaurantName,
    setRestaurantName,
    restaurantLogo,
    setRestaurantLogo,
  } = useComanda();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Local state for restaurant name input
  const [nameInput, setNameInput] = useState(restaurantName || 'COMANDA LIGHT');
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameInput(restaurantName || 'COMANDA LIGHT');
  }, [restaurantName, isOpen]);

  useEffect(() => {
    const updateFsState = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    updateFsState();
    document.addEventListener('fullscreenchange', updateFsState);
    document.addEventListener('webkitfullscreenchange', updateFsState);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      document.removeEventListener('fullscreenchange', updateFsState);
      document.removeEventListener('webkitfullscreenchange', updateFsState);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };

  const handleSaveName = () => {
    playTapSound(soundEnabled);
    setRestaurantName(nameInput);
    onShowSuccessToast('Nombre de restaurante actualizado');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoLoading(true);
    setLogoError(null);
    try {
      const optimizedDataUrl = await processLogoImage(file);
      setRestaurantLogo(optimizedDataUrl);
      playTapSound(soundEnabled);
      onShowSuccessToast('Logotipo guardado exitosamente');
    } catch (err: any) {
      setLogoError(err?.message || 'Error al procesar el archivo');
    } finally {
      setLogoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    playTapSound(soundEnabled);
    setRestaurantLogo(null);
    onShowSuccessToast('Logotipo removido');
  };

  const handleSelectTheme = (newTheme: 'dark' | 'light') => {
    playTapSound(soundEnabled);
    setTheme(newTheme);
    onShowSuccessToast(`Tema ${newTheme === 'dark' ? 'Oscuro' : 'Claro'} activado`);
  };

  const handleSelectColor = (hex: string) => {
    playTapSound(soundEnabled);
    setPrimaryColor(hex);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playTapSound(true);
    }
  };

  const handleToggleFullscreen = async () => {
    playTapSound(soundEnabled);
    setFullscreenError(null);

    // If currently fullscreen, exit
    if (document.fullscreenElement) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } catch (err) {
        console.warn('Exit fullscreen error', err);
      }
      setIsFullscreen(false);
      return;
    }

    // Try to enter fullscreen
    const docEl = document.documentElement as any;
    const reqFn =
      docEl.requestFullscreen ||
      docEl.webkitRequestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.msRequestFullscreen;

    if (!reqFn) {
      setIsFullscreen(false);
      setFullscreenError('El navegador no permite esta función.');
      return;
    }

    try {
      const res = reqFn.call(docEl);
      if (res && typeof res.then === 'function') {
        await res;
      }
      setTimeout(() => {
        if (document.fullscreenElement) {
          setIsFullscreen(true);
          setFullscreenError(null);
        } else {
          setIsFullscreen(false);
          setFullscreenError('El navegador no permite esta función en este contexto.');
        }
      }, 150);
    } catch (err) {
      setIsFullscreen(false);
      setFullscreenError('El navegador no permite esta función en este contexto.');
    }
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      onShowSuccessToast('Aplicación instalada');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-800/80 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-neutral-700 text-white flex items-center justify-center font-bold shrink-0">
              ⚙️
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">Configuración</h2>
              <p className="text-xs text-neutral-400 truncate">
                {restaurantName || 'Comanda Light'} · Versión Operativa
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-700 active:scale-95 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. SECCIÓN APARIENCIA E IDENTIDAD */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-800">
              <Palette className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Apariencia e Identidad
                </h3>
                <p className="text-xs text-neutral-400">
                  Personaliza tema, color principal y distintivo del restaurante
                </p>
              </div>
            </div>

            {/* Identidad: Nombre del Restaurante */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-neutral-400" />
                Nombre del restaurante:
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
                <input
                  type="text"
                  value={nameInput}
                  onChange={handleNameChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveName();
                    }
                  }}
                  placeholder="Ej. SUSHI ROLL EXPRESS"
                  className="flex-1 min-w-0 h-11 px-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 font-medium w-full"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="h-11 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white font-bold text-xs border border-neutral-700 active:scale-95 transition-all flex items-center justify-center shrink-0 self-stretch sm:self-auto"
                >
                  Guardar
                </button>
              </div>
            </div>

            {/* Identidad: Logotipo del Restaurante */}
            <div className="pt-2">
              <span className="text-xs font-bold text-neutral-300 block mb-2">
                Logotipo del restaurante:
              </span>
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                {restaurantLogo ? (
                  <img
                    src={restaurantLogo}
                    alt="Logo preview"
                    className="w-12 h-12 rounded-xl object-cover border border-neutral-700 shadow-md shrink-0"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl border flex items-center justify-center font-black text-xl shrink-0 shadow-md transition-colors"
                    style={{
                      backgroundColor: `${primaryColor}22`,
                      borderColor: `${primaryColor}60`,
                      color: primaryColor,
                    }}
                  >
                    {getRestaurantInitials(nameInput)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-bold truncate">
                    {restaurantLogo ? 'Logotipo personalizado activo' : 'Distintivo con iniciales'}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    {restaurantLogo
                      ? 'Visible en encabezado y menú'
                      : 'Sube una imagen para reemplazar el recuadro "CL"'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={logoLoading}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-bold border border-neutral-700 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-neutral-300" />
                      <span>{restaurantLogo ? 'Reemplazar logo' : 'Subir logo'}</span>
                    </button>

                    {restaurantLogo && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 text-xs font-bold border border-rose-900/50 active:scale-95 transition-all"
                      >
                        Quitar logo
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>

              {logoError && (
                <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{logoError}</span>
                </p>
              )}
            </div>

            {/* Tema de Interfaz (Claro / Oscuro) */}
            <div className="pt-2 border-t border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-neutral-300 block">
                Tema de interfaz:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectTheme('dark')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between min-h-[50px] ${
                    theme === 'dark'
                      ? 'bg-neutral-850 border-neutral-600 text-white shadow-md'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
                  }`}
                  style={
                    theme === 'dark'
                      ? { borderColor: primaryColor, boxShadow: `0 0 12px -2px ${primaryColor}40` }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Moon className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block text-white">Oscuro</span>
                      <span className="text-[10px] text-neutral-400">Predeterminado</span>
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTheme('light')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between min-h-[50px] ${
                    theme === 'light'
                      ? 'bg-neutral-850 border-neutral-600 text-white shadow-md'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
                  }`}
                  style={
                    theme === 'light'
                      ? { borderColor: primaryColor, boxShadow: `0 0 12px -2px ${primaryColor}40` }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block text-white">Claro</span>
                      <span className="text-[10px] text-neutral-400">Alto contraste</span>
                    </div>
                  </div>
                  {theme === 'light' && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Color Principal de la UI */}
            <div className="pt-2 border-t border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-300 block">
                    Color principal de la interfaz:
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Botones principales, acento e indicadores
                  </span>
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-2 shrink-0">
                  <label
                    htmlFor="custom-primary-color"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 cursor-pointer text-xs font-mono font-bold text-neutral-300 hover:text-white"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span>{primaryColor.toUpperCase()}</span>
                  </label>
                  <input
                    id="custom-primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handleSelectColor(e.target.value)}
                    className="w-0 h-0 opacity-0 pointer-events-none absolute"
                  />
                </div>
              </div>

              {/* Predefined Color Swatches */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                {PRESET_COLORS.map((preset) => {
                  const isSelected = primaryColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => handleSelectColor(preset.hex)}
                      title={preset.name}
                      className={`h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 border ${
                        isSelected
                          ? 'border-white ring-2 ring-white/50 scale-105 shadow-md'
                          : 'border-transparent hover:scale-102 opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed pt-0.5">
                Nota: Los colores de servicio (verde Mesas, naranja Para llevar, azul Domicilio y morado Historial) se conservan para asegurar agilidad operativa.
              </p>
            </div>
          </div>

          {/* 2. MODO PANTALLA COMPLETA */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white block">
                    MODO PANTALLA COMPLETA
                  </span>
                  {isFullscreen && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Aprovecha la mayor cantidad posible de pantalla en tablets Android, evitando que la interfaz quede limitada por las barras del navegador.
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleFullscreen}
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 transition-all active:scale-95 min-h-[42px] ${
                  isFullscreen
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-750'
                    : 'bg-emerald-600 text-white border border-emerald-500/50 hover:bg-emerald-500 shadow-md shadow-emerald-950/40'
                }`}
              >
                {isFullscreen ? (
                  <>
                    <Minimize className="w-4 h-4" />
                    <span>Salir</span>
                  </>
                ) : (
                  <>
                    <Maximize className="w-4 h-4" />
                    <span>Activar</span>
                  </>
                )}
              </button>
            </div>

            {fullscreenError && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-start gap-2 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span>{fullscreenError}</span>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Tip para Android: Puedes instalar la app mediante el menú del navegador (⋮ → Agregar a pantalla principal) para abrir siempre en modo standalone sin barra de navegación.
                  </p>
                </div>
              </div>
            )}

            {deferredPrompt && (
              <div className="pt-2 border-t border-neutral-850 flex items-center justify-between gap-2">
                <span className="text-xs text-neutral-300">
                  Instalar en pantalla de inicio de Android:
                </span>
                <button
                  type="button"
                  onClick={handleInstallPWA}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-emerald-400 text-xs font-bold border border-neutral-700 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar PWA</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Sound Controls */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">
                  Sonidos táctiles y timbres
                </span>
                <span className="text-xs text-neutral-400">
                  Respuesta audible al pulsar botones y enviar comandas
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`w-14 h-8 rounded-full p-1 transition-colors relative ${
                  soundEnabled ? 'bg-emerald-600' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-800/80 border-t border-neutral-700 flex justify-end">
          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="px-6 py-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white font-bold text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
