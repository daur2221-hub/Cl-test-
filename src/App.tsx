/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ComandaProvider, useComanda } from './context/ComandaContext';
import { Header } from './components/Header';
import { TableGrid } from './components/TableGrid';
import { TableDetailView } from './components/TableDetailView';
import { TakeoutView } from './components/TakeoutView';
import { DeliveryView } from './components/DeliveryView';
import { ReprintView } from './components/ReprintView';
import { SettingsModal } from './components/SettingsModal';
import { NavigationDrawer } from './components/NavigationDrawer';
import { MenuManagementModal } from './components/MenuManagementModal';
import { DiagnosticsTestModal } from './components/DiagnosticsTestModal';
import { CheckCircle2, Printer, X } from 'lucide-react';

function MainContent() {
  const {
    activeTab,
    selectedTable,
    setSelectedTable,
    lastSentComanda,
    clearLastSentComanda,
  } = useComanda();

  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuManagementOpen, setIsMenuManagementOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none antialiased">
      {/* App Header */}
      <Header onOpenMenu={() => setIsNavDrawerOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 pb-12">
        {selectedTable !== null ? (
          <TableDetailView
            tableNumber={selectedTable}
            onBack={() => setSelectedTable(null)}
            onShowSuccessToast={showToast}
          />
        ) : (
          <>
            {activeTab === 'mesas' && (
              <TableGrid
                onSelectTable={tableNum => setSelectedTable(tableNum)}
                onShowSuccessToast={showToast}
              />
            )}
            {activeTab === 'para_llevar' && (
              <TakeoutView onShowSuccessToast={showToast} />
            )}
            {activeTab === 'domicilio' && (
              <DeliveryView onShowSuccessToast={showToast} />
            )}
            {(activeTab === 'historial' || activeTab === 'reimpresion') && (
              <ReprintView onShowSuccessToast={showToast} />
            )}
          </>
        )}
      </main>

      {/* Instant Kitchen Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-emerald-600 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-2xl shadow-emerald-950/60 border border-emerald-400/50 flex items-center gap-3">
            <span className="text-xl">🖨️</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Last Sent Comanda Banner / Quick Glaze (Discreet) */}
      {lastSentComanda && (
        <div className="fixed bottom-6 right-6 z-40 hidden sm:block animate-in slide-in-from-bottom-4 duration-150">
          <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-2xl p-4 shadow-2xl max-w-sm flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Comanda #{lastSentComanda.comandaNumber} enviada
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {lastSentComanda.serviceType === 'MESA'
                  ? `Mesa ${lastSentComanda.tableNumber}`
                  : lastSentComanda.orderLabel || lastSentComanda.serviceType}{' '}
                · {lastSentComanda.items.reduce((a, b) => a + b.quantity, 0)} productos en cocina
              </p>
            </div>
            <button
              onClick={clearLastSentComanda}
              className="text-neutral-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMenuManagement={() => setIsMenuManagementOpen(true)}
        onOpenTest={() => setIsTestOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onShowSuccessToast={showToast}
      />

      {/* Menu Management Modal */}
      <MenuManagementModal
        isOpen={isMenuManagementOpen}
        onClose={() => setIsMenuManagementOpen(false)}
        onShowSuccessToast={showToast}
      />

      {/* Diagnostics & Test Modal */}
      <DiagnosticsTestModal
        isOpen={isTestOpen}
        onClose={() => setIsTestOpen(false)}
        onShowSuccessToast={showToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <ComandaProvider>
      <MainContent />
    </ComandaProvider>
  );
}
