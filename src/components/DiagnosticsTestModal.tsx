import React, { useState } from 'react';
import { useComanda } from '../context/ComandaContext';
import {
  X,
  Volume2,
  Sparkles,
  CheckCircle2,
  FlaskConical,
  RotateCcw,
  AlertTriangle,
  Trash2,
  Database,
} from 'lucide-react';
import { playKitchenChime, playTapSound } from '../utils/audio';

interface DiagnosticsTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSuccessToast: (msg: string) => void;
}

export const DiagnosticsTestModal: React.FC<DiagnosticsTestModalProps> = ({
  isOpen,
  onClose,
  onShowSuccessToast,
}) => {
  const {
    soundEnabled,
    seedSampleData,
    resetAllData,
  } = useComanda();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [lastChimeStatus, setLastChimeStatus] = useState<string | null>(null);
  const [lastTapStatus, setLastTapStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestChime = () => {
    try {
      playKitchenChime(true);
      setLastChimeStatus('Timbre de cocina reproducido (Web Audio API: 587Hz / 880Hz)');
      setTimeout(() => setLastChimeStatus(null), 3500);
    } catch (err: any) {
      setLastChimeStatus(`Error de audio: ${err?.message || 'Bloqueado'}`);
    }
  };

  const handleTestTap = () => {
    try {
      playTapSound(true);
      setLastTapStatus('Respuesta táctil reproducida (Web Audio API: clic instantáneo)');
      setTimeout(() => setLastTapStatus(null), 2500);
    } catch (err: any) {
      setLastTapStatus(`Error: ${err?.message || 'Bloqueado'}`);
    }
  };

  const handleLoadDemo = () => {
    playTapSound(soundEnabled);
    seedSampleData();
    onShowSuccessToast('Datos de demostración cargados');
    onClose();
  };

  const handleExecuteReset = () => {
    playKitchenChime(soundEnabled);
    resetAllData();
    setConfirmResetOpen(false);
    onShowSuccessToast('Turno limpiado: todas las mesas están libres');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-800/80 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Test y Diagnóstico</h2>
              <p className="text-xs text-neutral-400">Pruebas de audio y gestión de datos de prueba</p>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-700 active:scale-95 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* 1. Audio Test Section */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Pruebas de Síntesis Web Audio
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Verifica las señales sonoras generadas por osciladores nativos del navegador, útiles para confirmar volumen y altavoces en comandas de cocina y barra.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleTestChime}
                className="p-4 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700/80 text-left text-neutral-200 active:scale-95 transition-all flex items-center justify-between min-h-[58px]"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Timbre de Cocina</span>
                  <span className="text-[11px] text-neutral-400">Doble tono 587Hz / 880Hz</span>
                </div>
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleTestTap}
                className="p-4 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700/80 text-left text-neutral-200 active:scale-95 transition-all flex items-center justify-between min-h-[58px]"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Respuesta Táctil</span>
                  <span className="text-[11px] text-neutral-400">Pulso breve de confirmación</span>
                </div>
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              </button>
            </div>

            {(lastChimeStatus || lastTapStatus) && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="leading-snug">{lastChimeStatus || lastTapStatus}</span>
              </div>
            )}
          </div>

          {/* 2. GESTIÓN DE DATOS LOCALES */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                Gestión de Datos Locales
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Herramientas para poblar comandas de muestra en mesas o vaciar el turno operativo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleLoadDemo}
                className="p-3.5 rounded-2xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-left text-neutral-200 active:scale-95 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Cargar Demo</span>
                </div>
                <span className="text-[11px] text-neutral-400">
                  Rellena Mesa 5, Mesa 3 y pedidos de prueba.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setConfirmResetOpen(true);
                }}
                className="p-3.5 rounded-2xl bg-neutral-850 hover:bg-rose-950/30 border border-neutral-750 hover:border-rose-900/50 text-left text-neutral-300 hover:text-rose-300 active:scale-95 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-1">
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-white">Limpiar Turno</span>
                </div>
                <span className="text-[11px] text-neutral-400">
                  Vacía todas las mesas y reinicia comandas.
                </span>
              </button>
            </div>

            {/* In-App Confirmation Card for Reset */}
            {confirmResetOpen && (
              <div className="mt-3 p-4 rounded-2xl bg-rose-950/40 border border-rose-600/50 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-bold text-white block">
                      ¿Confirmar limpieza del turno?
                    </span>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      Se cerrarán todas las mesas abiertas y se limpiará el historial de comandas para iniciar un turno nuevo desde cero.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound(soundEnabled);
                      setConfirmResetOpen(false);
                    }}
                    className="flex-1 h-11 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteReset}
                    className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-950/50 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, limpiar turno</span>
                  </button>
                </div>
              </div>
            )}
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
            className="px-6 py-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
