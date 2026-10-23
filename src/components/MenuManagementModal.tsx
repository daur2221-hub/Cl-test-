import React, { useState } from 'react';
import { useComanda } from '../context/ComandaContext';
import { Product, CategoryInfo } from '../types';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  UtensilsCrossed,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { playTapSound } from '../utils/audio';

interface MenuManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSuccessToast: (msg: string) => void;
}

type MenuTab = 'productos' | 'categorias' | 'rollos';

export const MenuManagementModal: React.FC<MenuManagementModalProps> = ({
  isOpen,
  onClose,
  onShowSuccessToast,
}) => {
  const {
    products,
    categories,
    rollIngredients,
    addProduct,
    updateProduct,
    toggleProductActive,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateRollIngredients,
    soundEnabled,
  } = useComanda();

  const [activeTab, setActiveTab] = useState<MenuTab>('productos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');

  // State for creating / editing product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsConfigurable, setFormIsConfigurable] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // State for deleting product confirmation
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // State for new category
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryInfo | null>(null);

  // Inputs for adding roll ingredients
  const [newBaseInput, setNewBaseInput] = useState('');
  const [newRellenoInput, setNewRellenoInput] = useState('');
  const [newCoberturaInput, setNewCoberturaInput] = useState('');

  if (!isOpen) return null;

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCat =
      selectedCategoryFilter === 'todos' || p.category === selectedCategoryFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Open Form for New Product
  const handleOpenCreateProduct = () => {
    playTapSound(soundEnabled);
    setIsCreatingProduct(true);
    setEditingProduct(null);
    setFormName('');
    const firstCat = categories.find(c => c.id !== 'todos')?.id || 'rollos';
    setFormCategory(firstCat);
    setFormDescription('');
    setFormIsConfigurable(firstCat === 'rollos');
    setFormIsActive(true);
    setFormError(null);
  };

  // Open Form for Editing Product
  const handleOpenEditProduct = (prod: Product) => {
    playTapSound(soundEnabled);
    setEditingProduct(prod);
    setIsCreatingProduct(false);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormDescription(prod.description || '');
    setFormIsConfigurable(!!prod.isConfigurableRoll);
    setFormIsActive(prod.isActive !== false);
    setFormError(null);
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound(soundEnabled);

    if (!formName.trim()) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }
    if (!formCategory) {
      setFormError('Selecciona una categoría válida.');
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim() || undefined,
        isConfigurableRoll: formIsConfigurable,
        isActive: formIsActive,
      });
      onShowSuccessToast(`Producto "${formName.trim()}" actualizado`);
    } else {
      addProduct({
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim() || undefined,
        isConfigurableRoll: formIsConfigurable,
        isActive: formIsActive,
      });
      onShowSuccessToast(`Producto "${formName.trim()}" registrado`);
    }

    setEditingProduct(null);
    setIsCreatingProduct(false);
  };

  // Toggle active state with 1 tap
  const handleToggleActive = (productId: string, name: string, currentState: boolean) => {
    playTapSound(soundEnabled);
    toggleProductActive(productId);
    onShowSuccessToast(
      currentState ? `"${name}" desactivado del catálogo` : `"${name}" activado en el catálogo`
    );
  };

  // Confirm product deletion
  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    playTapSound(soundEnabled);
    deleteProduct(productToDelete.id);
    onShowSuccessToast(`"${productToDelete.name}" eliminado del catálogo`);
    setProductToDelete(null);
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound(soundEnabled);
    const label = newCategoryLabel.trim();
    if (!label) return;

    const id = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `cat-${Date.now()}`;

    addCategory({ id, label });
    setNewCategoryLabel('');
    onShowSuccessToast(`Categoría "${label}" creada`);
  };

  // Save edited category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    playTapSound(soundEnabled);
    updateCategory(editingCategory);
    onShowSuccessToast(`Categoría actualizada`);
    setEditingCategory(null);
  };

  // Confirm delete category
  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    playTapSound(soundEnabled);
    deleteCategory(categoryToDelete.id);
    onShowSuccessToast(`Categoría "${categoryToDelete.label}" eliminada`);
    setCategoryToDelete(null);
  };

  // Roll Ingredients Handlers
  const handleAddBase = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newBaseInput.trim();
    if (!val || rollIngredients.bases.includes(val)) return;
    playTapSound(soundEnabled);
    updateRollIngredients({
      ...rollIngredients,
      bases: [...rollIngredients.bases, val],
    });
    setNewBaseInput('');
    onShowSuccessToast(`Base "${val}" agregada`);
  };

  const handleRemoveBase = (base: string) => {
    playTapSound(soundEnabled);
    updateRollIngredients({
      ...rollIngredients,
      bases: rollIngredients.bases.filter(b => b !== base),
    });
  };

  const handleAddRelleno = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newRellenoInput.trim();
    if (!val || rollIngredients.rellenos.includes(val)) return;
    playTapSound(soundEnabled);
    updateRollIngredients({
      ...rollIngredients,
      rellenos: [...rollIngredients.rellenos, val],
    });
    setNewRellenoInput('');
    onShowSuccessToast(`Relleno "${val}" agregado`);
  };

  const handleRemoveRelleno = (rel: string) => {
    playTapSound(soundEnabled);
    updateRollIngredients({
      ...rollIngredients,
      rellenos: rollIngredients.rellenos.filter(r => r !== rel),
    });
  };

  const handleAddCobertura = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCoberturaInput.trim();
    if (!val || rollIngredients.coberturas.includes(val)) return;
    playTapSound(soundEnabled);
    updateRollIngredients({
      ...rollIngredients,
      coberturas: [...rollIngredients.coberturas, val],
    });
    setNewCoberturaInput('');
    onShowSuccessToast(`Cobertura "${val}" agregada`);
  };

  const handleRemoveCobertura = (cob: string) => {
    playTapSound(soundEnabled);
    updateRollIngredients({
      ...rollIngredients,
      coberturas: rollIngredients.coberturas.filter(c => c !== cob),
    });
  };

  const activeCategoriesList = categories.filter(c => c.id !== 'todos');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-3xl w-full max-w-5xl h-[95vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-neutral-850 border-b border-neutral-750 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Administrar Menú
              </h2>
              <p className="text-xs text-neutral-400">
                Catálogo de platillos, categorías e ingredientes de cocina
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-700 active:scale-95 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-neutral-900 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              setActiveTab('productos');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'productos'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40 border border-amber-400/40'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-700/50'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Platillos y Productos</span>
            <span className="text-xs px-2 py-0.2 rounded-full bg-black/30 font-mono">
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              setActiveTab('categorias');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'categorias'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40 border border-amber-400/40'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-700/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categorías</span>
            <span className="text-xs px-2 py-0.2 rounded-full bg-black/30 font-mono">
              {activeCategoriesList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              setActiveTab('rollos');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rollos'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40 border border-amber-400/40'
                : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-700/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Opciones de Rollos</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-950">
          {/* ================= TAB 1: PRODUCTOS ================= */}
          {activeTab === 'productos' && (
            <div className="space-y-4">
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o descripción..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full h-11 bg-neutral-900 border border-neutral-750 rounded-xl pl-10 pr-9 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateProduct}
                  className="h-11 px-4 sm:px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-950/40 border border-amber-400/40 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Registrar Producto</span>
                </button>
              </div>

              {/* Category Pills Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playTapSound(soundEnabled);
                      setSelectedCategoryFilter(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-neutral-100 text-neutral-950 shadow-sm'
                        : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Product Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProducts.map(prod => {
                  const isActive = prod.isActive !== false;
                  return (
                    <div
                      key={prod.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isActive
                          ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 shadow-sm'
                          : 'bg-neutral-950/70 border-neutral-850 opacity-60'
                      }`}
                    >
                      <div>
                        {/* Top: Name & Badges */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-0.5 font-mono">
                              {prod.category}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                              {prod.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {prod.isConfigurableRoll ? (
                              <span
                                title="Rollo personalizable"
                                className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Rollo</span>
                              </span>
                            ) : (
                              <span
                                title="Producto directo / sencillo"
                                className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700 text-[10px] font-bold"
                              >
                                Sencillo
                              </span>
                            )}
                          </div>
                        </div>

                        {prod.description && (
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Controls: Toggle Active + Edit + Delete */}
                      <div className="pt-2.5 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                        {/* Active Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(prod.id, prod.name, isActive)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all active:scale-95 ${
                            isActive
                              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/50 hover:bg-emerald-950/50'
                              : 'bg-neutral-850 text-neutral-400 border-neutral-750 hover:bg-neutral-800'
                          }`}
                          title={isActive ? 'Desactivar del catálogo' : 'Activar en catálogo'}
                        >
                          {isActive ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Inactivo</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
                            title="Editar producto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playTapSound(soundEnabled);
                              setProductToDelete(prod);
                            }}
                            className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-neutral-700 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-16 text-center text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
                    <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-bold text-neutral-300">
                      No hay productos registrados en esta sección
                    </p>
                    <p className="text-xs text-neutral-500 mt-1 mb-4">
                      Pulsa "+ Registrar Producto" para agregar un nuevo platillo o bebida al catálogo.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenCreateProduct}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                    >
                      + Registrar Primer Producto
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: CATEGORÍAS ================= */}
          {activeTab === 'categorias' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Form to add category */}
              <form
                onSubmit={handleAddCategory}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3"
              >
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                  Crear Nueva Categoría
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Postres, Entradas, Cervezas..."
                    value={newCategoryLabel}
                    onChange={e => setNewCategoryLabel(e.target.value)}
                    className="flex-1 h-12 bg-neutral-950 border border-neutral-750 rounded-xl px-4 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-5 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shrink-0 active:scale-95 transition-all shadow-md"
                  >
                    + Agregar
                  </button>
                </div>
              </form>

              {/* Categories List */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Categorías Registradas ({activeCategoriesList.length})
                </span>

                <div className="divide-y divide-neutral-800">
                  {activeCategoriesList.map(cat => {
                    const count = products.filter(p => p.category === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white capitalize">
                              {cat.label}
                            </span>
                            <span className="text-xs font-mono text-neutral-500">
                              (id: {cat.id})
                            </span>
                          </div>
                          <span className="text-xs text-neutral-400">
                            {count} {count === 1 ? 'producto asociado' : 'productos asociados'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              playTapSound(soundEnabled);
                              setEditingCategory(cat);
                            }}
                            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
                            title="Editar nombre de categoría"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playTapSound(soundEnabled);
                              setCategoryToDelete(cat);
                            }}
                            className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-neutral-700 transition-colors"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: OPCIONES DE ROLLOS ================= */}
          {activeTab === 'rollos' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-amber-950/20 border border-amber-800/30 rounded-2xl p-4 text-xs text-amber-200 leading-relaxed">
                <span className="font-bold block mb-1">
                  🍣 Configuración de Rollos Personalizables:
                </span>
                Estos ingredientes e insumos aparecen automáticamente en la pantalla de captura cuando un mesero selecciona un producto marcado como "Rollo personalizable".
              </div>

              {/* 1. Ingredientes Base */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    1. Ingredientes Base (Incluidos por defecto)
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {rollIngredients.bases.length} opciones
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {rollIngredients.bases.map(b => (
                    <span
                      key={b}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-200 flex items-center gap-2 group"
                    >
                      <span>{b}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBase(b)}
                        className="text-neutral-500 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={handleAddBase} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nuevo ingrediente base (Ej: Pepino)"
                    value={newBaseInput}
                    onChange={e => setNewBaseInput(e.target.value)}
                    className="flex-1 h-10 bg-neutral-950 border border-neutral-750 rounded-xl px-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-amber-400 font-bold text-xs border border-neutral-700 active:scale-95"
                  >
                    + Agregar
                  </button>
                </form>
              </div>

              {/* 2. Rellenos */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    2. Rellenos Principales
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {rollIngredients.rellenos.length} opciones
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {rollIngredients.rellenos.map(r => (
                    <span
                      key={r}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-bold text-amber-300 flex items-center gap-2 group"
                    >
                      <span>{r}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRelleno(r)}
                        className="text-neutral-500 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={handleAddRelleno} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nuevo relleno (Ej: Atún Picante)"
                    value={newRellenoInput}
                    onChange={e => setNewRellenoInput(e.target.value)}
                    className="flex-1 h-10 bg-neutral-950 border border-neutral-750 rounded-xl px-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-amber-400 font-bold text-xs border border-neutral-700 active:scale-95"
                  >
                    + Agregar
                  </button>
                </form>
              </div>

              {/* 3. Coberturas */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    3. Coberturas
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {rollIngredients.coberturas.length} opciones
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {rollIngredients.coberturas.map(c => (
                    <span
                      key={c}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-bold text-emerald-300 flex items-center gap-2 group"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCobertura(c)}
                        className="text-neutral-500 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={handleAddCobertura} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nueva cobertura (Ej: Masago)"
                    value={newCoberturaInput}
                    onChange={e => setNewCoberturaInput(e.target.value)}
                    className="flex-1 h-10 bg-neutral-950 border border-neutral-750 rounded-xl px-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-amber-400 font-bold text-xs border border-neutral-700 active:scale-95"
                  >
                    + Agregar
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-850 border-t border-neutral-750 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-400">
            Los cambios se guardan localmente y se reflejan al instante en la captura de comandas.
          </span>
          <button
            type="button"
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white font-bold text-xs border border-neutral-700 active:scale-95 transition-all"
          >
            Listo
          </button>
        </div>
      </div>

      {/* ================= SUBMODAL: CREAR / EDITAR PRODUCTO ================= */}
      {(isCreatingProduct || editingProduct) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveProduct}
            className="bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden space-y-4"
          >
            {/* Header */}
            <div className="p-5 bg-neutral-850 border-b border-neutral-750 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setEditingProduct(null);
                  setIsCreatingProduct(false);
                }}
                className="w-9 h-9 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fields */}
            <div className="p-5 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 font-medium">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Rollo Mango Crunch, Coca-Cola 355ml..."
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full h-12 bg-neutral-950 border border-neutral-750 rounded-xl px-4 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Categoría *
                </label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full h-12 bg-neutral-950 border border-neutral-750 rounded-xl px-4 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 capitalize"
                >
                  {activeCategoriesList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Descripción / Ingredientes de referencia (Opcional)
                </label>
                <textarea
                  placeholder="Ej: Base de pepino y queso crema, cubierto de mango con salsa dulce..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-750 rounded-xl p-3 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Toggle Configurable vs Simple */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      ¿Es un rollo personalizable?
                    </span>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">
                      {formIsConfigurable
                        ? 'Al seleccionarlo abrirá la configuración de Base, Relleno y Cobertura'
                        : 'Producto directo/sencillo: se agrega con 1 toque sin pedir ingredientes'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsConfigurable(!formIsConfigurable)}
                    className={`w-12 h-7 rounded-full p-1 transition-colors relative shrink-0 ${
                      formIsConfigurable ? 'bg-amber-600' : 'bg-neutral-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formIsConfigurable ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Toggle Active */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Disponible en el catálogo (Activo)
                  </span>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    Puedes desactivarlo temporalmente si se agotan ingredientes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors relative shrink-0 ${
                    formIsActive ? 'bg-emerald-600' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      formIsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-5 bg-neutral-850 border-t border-neutral-750 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setEditingProduct(null);
                  setIsCreatingProduct(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-950/40"
              >
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= SUBMODAL: EDITAR CATEGORÍA ================= */}
      {editingCategory && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveCategory}
            className="bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-white">Editar Categoría</h3>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Nombre</label>
              <input
                type="text"
                value={editingCategory.label}
                onChange={e =>
                  setEditingCategory({ ...editingCategory, label: e.target.value })
                }
                className="w-full h-11 bg-neutral-950 border border-neutral-750 rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= SUBMODAL: CONFIRMAR ELIMINAR PRODUCTO ================= */}
      {productToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¿Eliminar producto?</h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                ¿Estás seguro de eliminar permanentemente "{productToDelete.name}"?
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Tip: También puedes simplemente desactivarlo con el botón "Activo / Inactivo" sin borrarlo.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 h-11 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBMODAL: CONFIRMAR ELIMINAR CATEGORÍA ================= */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¿Eliminar categoría?</h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                ¿Eliminar la categoría "{categoryToDelete.label}"? Los productos asignados conservarán su nombre.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 h-11 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
