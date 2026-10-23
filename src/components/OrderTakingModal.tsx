import React, { useState } from 'react';
import { Product, ProductCategory, ComandaItem, ServiceType } from '../types';
import { MENU_PRODUCTS } from '../data/menu';
import { RollCustomizerModal } from './RollCustomizerModal';
import { EditCartItemModal } from './EditCartItemModal';
import { useComanda } from '../context/ComandaContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Search,
  Sparkles,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Edit2,
  Receipt,
} from 'lucide-react';
import { playTapSound } from '../utils/audio';

interface OrderTakingModalProps {
  isOpen: boolean;
  serviceType: ServiceType;
  tableNumber?: number;
  onClose: () => void;
  onComandaSent: (comandaNumber: number) => void;
}

export const OrderTakingModal: React.FC<OrderTakingModalProps> = ({
  isOpen,
  serviceType,
  tableNumber,
  onClose,
  onComandaSent,
}) => {
  const {
    soundEnabled,
    sendTableComanda,
    sendTakeoutComanda,
    sendDeliveryComanda,
    products,
    categories: contextCategories,
    primaryColor,
  } = useComanda();

  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [draftItems, setDraftItems] = useState<ComandaItem[]>([]);
  const [configuringProduct, setConfiguringProduct] = useState<Product | null>(null);
  const [editingDraftItem, setEditingDraftItem] = useState<ComandaItem | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  if (!isOpen) return null;

  const handleAttemptClose = () => {
    playTapSound(soundEnabled);
    if (draftItems.length > 0) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExitWithoutSending = () => {
    playTapSound(soundEnabled);
    setDraftItems([]);
    setShowExitConfirm(false);
    setIsDrawerExpanded(false);
    onClose();
  };

  // Filter products: Only active products are available for taking orders
  const activeProducts = products.filter(p => p.isActive !== false);
  const filteredProducts = activeProducts.filter(product => {
    const matchesCategory =
      activeCategory === 'todos' || product.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Handle tapping a product in catalog
  const handleSelectProduct = (product: Product) => {
    playTapSound(soundEnabled);
    if (product.isConfigurableRoll) {
      setConfiguringProduct(product);
      return;
    }

    // Regular product: Add or increment quantity
    setDraftItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === product.id && !item.details && !item.notes
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        const newItem: ComandaItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: product.id,
          productName: product.name,
          category: product.category,
          quantity: 1,
          displayTitle: product.name,
        };
        return [...prev, newItem];
      }
    });
  };

  // Add or update customized roll from modal
  const handleAddOrUpdateCustomRoll = (item: ComandaItem) => {
    setDraftItems(prev => {
      const existsIndex = prev.findIndex(it => it.id === item.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = item;
        return copy;
      }
      return [...prev, item];
    });
    setConfiguringProduct(null);
    setEditingDraftItem(null);
  };

  // Update regular cart item from EditCartItemModal
  const handleUpdateCartItem = (updatedItem: ComandaItem) => {
    setDraftItems(prev =>
      prev.map(it => (it.id === updatedItem.id ? updatedItem : it))
    );
    setEditingDraftItem(null);
  };

  // Handle clicking an item in cart to edit it
  const handleClickItemToEdit = (item: ComandaItem) => {
    playTapSound(soundEnabled);
    if (item.category === 'rollos' && item.rollCustomization) {
      // Find matching product in menu
      const product =
        products.find(p => p.id === item.productId) || {
          id: item.productId,
          name: item.productName,
          category: item.category,
          isConfigurableRoll: true,
        };
      setConfiguringProduct(product);
      setEditingDraftItem(item);
    } else {
      setEditingDraftItem(item);
    }
  };

  // Adjust draft item quantity
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    playTapSound(soundEnabled);
    setDraftItems(prev =>
      prev
        .map(item => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is ComandaItem => item !== null)
    );
  };

  const handleRemoveItem = (itemId: string) => {
    playTapSound(soundEnabled);
    setDraftItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Submit to kitchen
  const handleSendToKitchen = () => {
    if (draftItems.length === 0) return;

    let createdComanda;
    if (serviceType === 'MESA' && tableNumber !== undefined) {
      createdComanda = sendTableComanda(tableNumber, draftItems);
    } else if (serviceType === 'PARA_LLEVAR') {
      createdComanda = sendTakeoutComanda(draftItems);
    } else {
      createdComanda = sendDeliveryComanda(draftItems);
    }

    setDraftItems([]);
    setIsDrawerExpanded(false);
    onComandaSent(createdComanda.comandaNumber);
    onClose();
  };

  // Dynamic categories with 'Todos' guaranteed first
  const categories = [
    { id: 'todos', label: 'Todos' },
    ...contextCategories.filter(c => c.id !== 'todos'),
  ];

  const totalItemCount = draftItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-neutral-950 flex flex-col animate-in fade-in duration-150 select-none overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {serviceType === 'MESA' && (
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
            )}
            {serviceType === 'PARA_LLEVAR' && (
              <div className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
            )}
            {serviceType === 'DOMICILIO' && (
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold shrink-0">
                <Bike className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight leading-tight">
                  {serviceType === 'MESA'
                    ? `MESA ${tableNumber}`
                    : serviceType === 'PARA_LLEVAR'
                    ? 'PEDIDO PARA LLEVAR'
                    : 'PEDIDO DOMICILIO'}
                </h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${
                    serviceType === 'MESA'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : serviceType === 'PARA_LLEVAR'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}
                >
                  {serviceType === 'MESA' ? 'Comanda en sala' : 'Comanda rápida'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 hidden sm:block">
                Toca productos para agregar al ticket · Toca un producto del ticket para editarlo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAttemptClose}
            className="px-3.5 sm:px-4 py-2 rounded-2xl bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1.5 border border-neutral-750 active:scale-95 transition-all text-xs sm:text-sm font-bold shrink-0"
            title="Salir de la toma de comanda"
          >
            <X className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>

        {/* Main Content Area: Responsive POS Split (Catalog dominant on Left, Compact Ticket on Right in Horizontal) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
          {/* ================= LEFT / CENTER: PRODUCT CATALOG (DOMINANT AREA) ================= */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-neutral-950">
            {/* Search + Categories Bar */}
            <div className="p-2.5 sm:p-4 bg-neutral-900/90 border-b border-neutral-800/90 space-y-2.5 shrink-0">
              {/* Buscador más visible y cómodo para tocar */}
              <div className="relative">
                <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar producto o ingrediente..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-12 sm:h-13 bg-neutral-950 border border-neutral-750 hover:border-neutral-600 focus:border-emerald-500 rounded-2xl pl-11 sm:pl-12 pr-11 text-sm sm:text-base text-neutral-100 placeholder:text-neutral-500 font-medium focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1.5 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Categorías claramente visibles */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(cat => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        playTapSound(soundEnabled);
                        setActiveCategory(cat.id);
                      }}
                      style={
                        isActive
                          ? { backgroundColor: primaryColor, borderColor: primaryColor }
                          : undefined
                      }
                      className={`h-11 sm:h-12 px-4 sm:px-5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center justify-center shrink-0 active:scale-95 ${
                        isActive
                          ? 'text-white shadow-lg scale-[1.02] border'
                          : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-750/80 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Productos en cuadrícula: botones grandes y táctiles */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-28 md:pb-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3.5 auto-rows-max">
              {filteredProducts.map(prod => (
                <button
                  key={prod.id}
                  onClick={() => handleSelectProduct(prod)}
                  className="flex flex-col justify-between text-left p-3.5 sm:p-4 rounded-3xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 active:scale-[0.98] transition-all min-h-[125px] sm:min-h-[135px] group shadow-sm relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <span className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                        {prod.name}
                      </span>
                      {prod.isConfigurableRoll && (
                        <span
                          title="Personalizable: Base, Relleno y Cobertura"
                          className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30"
                        >
                          <Sparkles className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    {prod.description && (
                      <p className="text-[11px] sm:text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="text-neutral-500 font-semibold capitalize truncate">
                      {prod.category}
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                      <Plus className="w-3.5 h-3.5" /> Agregar
                    </span>
                  </div>
                </button>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center text-neutral-500">
                  <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-neutral-400">
                    No se encontraron productos con "{searchQuery}"
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('todos');
                    }}
                    className="mt-3 text-xs text-emerald-400 underline font-bold"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT: COMPACT TICKET IN HORIZONTAL (POS LAYOUT) ================= */}
          <aside className="hidden md:flex md:w-80 lg:w-96 flex-col bg-neutral-900 border-l border-neutral-800 shrink-0 h-full select-none">
            {/* Ticket Header */}
            <div className="p-3.5 lg:p-4 bg-neutral-850/90 border-b border-neutral-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span className="text-xs lg:text-sm font-black tracking-wide text-white uppercase">
                  Ticket de Comanda
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                  {totalItemCount} {totalItemCount === 1 ? 'prod.' : 'prods.'}
                </span>
                {draftItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound(soundEnabled);
                      setDraftItems([]);
                    }}
                    className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                    title="Limpiar comanda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Ticket Scrollable Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {draftItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-neutral-500">
                  <Receipt className="w-12 h-12 text-neutral-700 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-bold text-neutral-400">Ticket vacío</p>
                  <p className="text-xs text-neutral-600 mt-1 max-w-[200px]">
                    Toca cualquier producto del catálogo para agregarlo a la comanda.
                  </p>
                </div>
              ) : (
                draftItems.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 hover:border-neutral-700 transition-all group flex flex-col gap-2"
                  >
                    {/* Tapping this row opens the configuration editor */}
                    <div
                      onClick={() => handleClickItemToEdit(item)}
                      className="cursor-pointer"
                      title="Toca para editar opciones o cantidad"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs lg:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                          {item.quantity} × {item.displayTitle}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 transition-opacity shrink-0">
                          <Edit2 className="w-3 h-3" /> Editar
                        </span>
                      </div>
                      {item.details && (
                        <p className="text-[11px] text-amber-400 font-medium mt-0.5 leading-snug">
                          {item.details}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[11px] text-neutral-400 italic mt-0.5 leading-snug">
                          Nota: {item.notes}
                        </p>
                      )}
                    </div>

                    {/* Steppers & Delete */}
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center active:scale-95 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="w-7 h-7 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 flex items-center justify-center ml-1 transition-colors"
                          title="Eliminar del ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ticket Footer with Prominent ENVIAR A COCINA (Loyverse style anchored at bottom) */}
            <div className="p-3.5 lg:p-4 bg-neutral-900/98 border-t border-neutral-800 space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Total productos:</span>
                <span className="font-bold text-white font-mono text-sm">
                  {totalItemCount} {totalItemCount === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>

              {/* ENVIAR A COCINA (Clearly destacado en la parte inferior del ticket) */}
              <button
                type="button"
                disabled={draftItems.length === 0}
                onClick={handleSendToKitchen}
                className={`w-full h-14 lg:h-16 rounded-2xl font-black text-sm lg:text-base flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-xl ${
                  draftItems.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 border border-emerald-400/50'
                    : 'bg-neutral-800 text-neutral-500 border border-neutral-750 cursor-not-allowed opacity-50'
                }`}
              >
                <span className="text-lg lg:text-xl">🖨️</span>
                <span className="tracking-wide">ENVIAR A COCINA</span>
              </button>
            </div>
          </aside>
        </div>

        {/* ================= VERTICAL LAYOUT: EXPANDABLE BOTTOM DOCK & DRAWER ================= */}
        {/* Expandable Order Details Drawer (Mobile & Tablet Portrait) */}
        {isDrawerExpanded && (
          <div className="md:hidden absolute inset-x-0 bottom-16 max-h-[65vh] bg-neutral-900 border-t-2 border-emerald-500/70 rounded-t-3xl shadow-2xl z-20 flex flex-col animate-in slide-in-from-bottom-5 duration-150">
            {/* Drawer Header */}
            <div className="px-4 py-3 bg-neutral-850/90 border-b border-neutral-750 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Productos en la comanda:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-400 text-xs font-bold border border-emerald-500/40">
                  {totalItemCount} {totalItemCount === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {draftItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound(soundEnabled);
                      setDraftItems([]);
                      setIsDrawerExpanded(false);
                    }}
                    className="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    playTapSound(soundEnabled);
                    setIsDrawerExpanded(false);
                  }}
                  className="text-xs font-bold text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 flex items-center gap-1"
                >
                  <span>Ocultar</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Items List in Drawer */}
            <div className="overflow-y-auto p-3 space-y-2 max-h-[50vh]">
              {draftItems.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 flex items-start justify-between gap-3 transition-colors group cursor-pointer"
                >
                  <div
                    onClick={() => handleClickItemToEdit(item)}
                    className="flex-1 min-w-0"
                    title="Toca para editar opciones o cantidad"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white block leading-snug group-hover:text-emerald-300 transition-colors">
                        {item.quantity} × {item.displayTitle}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                        <Edit2 className="w-3 h-3" /> Editar
                      </span>
                    </div>
                    {item.details && (
                      <span className="text-[11px] text-amber-400 font-medium block mt-0.5">
                        {item.details}
                      </span>
                    )}
                    {item.notes && (
                      <span className="text-[11px] text-neutral-400 italic block mt-0.5">
                        Nota: {item.notes}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center active:scale-95 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-white font-mono">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="w-8 h-8 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 flex items-center justify-center ml-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Docked Bottom Bar (Portrait / Mobile) */}
        <div className="md:hidden bg-neutral-900/98 backdrop-blur-md border-t border-neutral-800 px-3 py-2.5 flex items-center justify-between gap-3 z-30 shrink-0">
          <div className="flex items-center min-w-0 flex-1">
            {draftItems.length === 0 ? (
              <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium truncate">
                <UtensilsCrossed className="w-4 h-4 text-neutral-500 shrink-0" />
                <span className="truncate">Comanda vacía</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setIsDrawerExpanded(!isDrawerExpanded);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/80 active:scale-95 transition-all min-w-0"
              >
                <span className="px-2 py-0.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/40 shrink-0">
                  {totalItemCount} {totalItemCount === 1 ? 'prod.' : 'prods.'}
                </span>

                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1 shrink-0">
                  {isDrawerExpanded ? (
                    <>
                      <span>Ocultar</span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    </>
                  ) : (
                    <>
                      <span>Ver detalle</span>
                      <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                    </>
                  )}
                </span>
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={draftItems.length === 0}
            onClick={handleSendToKitchen}
            className={`h-12 px-5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shrink-0 transition-all active:scale-[0.98] whitespace-nowrap ${
              draftItems.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/60 border border-emerald-400/50'
                : 'bg-neutral-800 text-neutral-500 border border-neutral-750 cursor-not-allowed opacity-50'
            }`}
          >
            <span className="text-base">🖨️</span>
            <span className="tracking-wide">ENVIAR A COCINA</span>
          </button>
        </div>
      </div>

      {/* Roll Customizer Submodal (For new roll or editing existing roll) */}
      {configuringProduct && (
        <RollCustomizerModal
          product={configuringProduct}
          isOpen={true}
          initialItem={editingDraftItem || undefined}
          onClose={() => {
            setConfiguringProduct(null);
            setEditingDraftItem(null);
          }}
          onConfirm={handleAddOrUpdateCustomRoll}
        />
      )}

      {/* Regular Item Editor Submodal (Non-roll products in cart) */}
      {editingDraftItem && !configuringProduct && (
        <EditCartItemModal
          item={editingDraftItem}
          isOpen={true}
          onClose={() => setEditingDraftItem(null)}
          onConfirm={handleUpdateCartItem}
        />
      )}

      {/* Confirmation modal: ¿Salir sin enviar? */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                ¿Salir sin enviar comanda?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                Tienes productos seleccionados que aún no has enviado a cocina. Si sales ahora, se descartarán estos productos.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setShowExitConfirm(false);
                }}
                className="flex-1 h-12 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs sm:text-sm hover:bg-neutral-750 transition-colors border border-neutral-700"
              >
                Seguir capturando
              </button>
              <button
                type="button"
                onClick={handleConfirmExitWithoutSending}
                className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm transition-colors shadow-lg shadow-rose-950/40"
              >
                Descartar y salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
