import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TableInfo,
  InternalComanda,
  ComandaItem,
  ActiveTab,
  Product,
  CategoryInfo,
  RollIngredientsConfig,
  AppTheme,
} from '../types';
import {
  MENU_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ROLL_INGREDIENTS,
} from '../data/menu';
import { playKitchenChime, playTapSound } from '../utils/audio';
import { adjustColorBrightness } from '../utils/appearance';

export interface ConsolidatedItem {
  id: string;
  itemId?: string;
  comandaId?: string;
  comandaNumber?: number;
  displayTitle: string;
  quantity: number;
  details?: string;
  notes?: string;
  status?: 'ACTIVO' | 'CANCELADO';
  cancelledAt?: string;
}

interface TableSession {
  tableNumber: number;
  sessionId: string;
  openedAt: string;
}

interface ComandaContextType {
  tables: TableInfo[];
  comandas: InternalComanda[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedTable: number | null;
  setSelectedTable: (tableNum: number | null) => void;

  // Table actions
  openTable: (tableNumber: number) => void;
  closeTable: (tableNumber: number) => void;
  releaseTable: (tableNumber: number) => void;
  getConsolidatedConsumedForTable: (tableNumber: number) => ConsolidatedItem[];
  getTableActiveSessionComandas: (tableNumber: number) => InternalComanda[];
  sendTableComanda: (tableNumber: number, items: ComandaItem[]) => InternalComanda;

  // Takeout & Delivery actions
  sendTakeoutComanda: (items: ComandaItem[]) => InternalComanda;
  sendDeliveryComanda: (items: ComandaItem[]) => InternalComanda;
  markOrderAsDelivered: (comandaId: string) => void;

  // Item cancellation in sent comanda
  cancelItemInComanda: (comandaId: string, itemId: string) => { comanda: InternalComanda; item: ComandaItem } | null;

  // Reprint / History
  getComandaByNumber: (num: number) => InternalComanda | undefined;
  lastSentComanda: InternalComanda | null;
  clearLastSentComanda: () => void;

  // Menu Management
  products: Product[];
  categories: CategoryInfo[];
  rollIngredients: RollIngredientsConfig;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  toggleProductActive: (productId: string) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (category: CategoryInfo) => void;
  updateCategory: (category: CategoryInfo) => void;
  deleteCategory: (categoryId: string) => void;
  updateRollIngredients: (config: RollIngredientsConfig) => void;
  resetMenuToDefaults: () => void;

  // Utility / Settings
  resetAllData: () => void;
  seedSampleData: () => void;

  // Appearance & Identity
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  restaurantName: string;
  setRestaurantName: (name: string) => void;
  restaurantLogo: string | null;
  setRestaurantLogo: (logo: string | null) => void;
  resetAppearance: () => void;
}

const STORAGE_KEYS = {
  TABLES: 'comanda_light_tables_v1',
  COMANDAS: 'comanda_light_comandas_v1',
  SESSIONS: 'comanda_light_sessions_v1',
  COUNTER: 'comanda_light_counter_v1',
  SOUND: 'comanda_light_sound_v1',
  INITIALIZED: 'comanda_light_initialized_v1',
  PRODUCTS: 'comanda_light_products_v2',
  CATEGORIES: 'comanda_light_categories_v2',
  ROLL_INGREDIENTS: 'comanda_light_roll_ingredients_v2',
  THEME: 'comanda_light_theme_v1',
  PRIMARY_COLOR: 'comanda_light_primary_color_v1',
  RESTAURANT_NAME: 'comanda_light_restaurant_name_v1',
  RESTAURANT_LOGO: 'comanda_light_restaurant_logo_v1',
};

const INITIAL_TABLES: TableInfo[] = Array.from({ length: 12 }, (_, i) => ({
  tableNumber: i + 1,
  status: 'libre',
}));

const ComandaContext = createContext<ComandaContextType | undefined>(undefined);

export const ComandaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<TableInfo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TABLES;
  });

  const [activeSessions, setActiveSessions] = useState<TableSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [comandas, setComandas] = useState<InternalComanda[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMANDAS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [comandaCounter, setComandaCounter] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUNTER);
      if (saved) return parseInt(saved, 10);
    } catch {
      // fallback
    }
    return 1024; // starting realistic sequence
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return true;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('mesas');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [lastSentComanda, setLastSentComanda] = useState<InternalComanda | null>(null);

  // Menu Management State (Catalog, Categories & Roll Ingredients)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return MENU_PRODUCTS.map(p => ({ ...p, isActive: p.isActive ?? true }));
  });

  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CATEGORIES;
  });

  const [rollIngredients, setRollIngredients] = useState<RollIngredientsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLL_INGREDIENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ROLL_INGREDIENTS;
  });

  // Appearance & Identity State
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRIMARY_COLOR);
      if (saved) return saved;
    } catch {}
    return '#10b981';
  });

  const [restaurantName, setRestaurantNameState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESTAURANT_NAME);
      if (saved) return saved;
    } catch {}
    return 'COMANDA LIGHT';
  });

  const [restaurantLogo, setRestaurantLogoState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.RESTAURANT_LOGO);
    } catch {}
    return null;
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch (e) {
      console.warn('Failed to save theme', e);
    }
  };

  const setPrimaryColor = (newColor: string) => {
    setPrimaryColorState(newColor);
    try {
      localStorage.setItem(STORAGE_KEYS.PRIMARY_COLOR, newColor);
    } catch (e) {
      console.warn('Failed to save primary color', e);
    }
  };

  const setRestaurantName = (newName: string) => {
    const trimmed = newName.trim();
    const finalVal = trimmed || 'COMANDA LIGHT';
    setRestaurantNameState(finalVal);
    try {
      localStorage.setItem(STORAGE_KEYS.RESTAURANT_NAME, finalVal);
    } catch (e) {
      console.warn('Failed to save restaurant name', e);
    }
  };

  const setRestaurantLogo = (newLogo: string | null) => {
    setRestaurantLogoState(newLogo);
    try {
      if (newLogo) {
        localStorage.setItem(STORAGE_KEYS.RESTAURANT_LOGO, newLogo);
      } else {
        localStorage.removeItem(STORAGE_KEYS.RESTAURANT_LOGO);
      }
    } catch (e) {
      console.warn('Failed to save restaurant logo', e);
    }
  };

  const resetAppearance = () => {
    setTheme('dark');
    setPrimaryColor('#10b981');
    setRestaurantName('COMANDA LIGHT');
    setRestaurantLogo(null);
  };

  // Sync theme & primary color to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.style.setProperty('--app-primary', primaryColor);
    document.documentElement.style.setProperty(
      '--app-primary-hover',
      adjustColorBrightness(primaryColor, -18)
    );
    document.documentElement.style.setProperty('--app-primary-glow', `${primaryColor}40`);
    document.documentElement.style.setProperty('--app-primary-subtle', `${primaryColor}18`);
  }, [theme, primaryColor]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLL_INGREDIENTS, JSON.stringify(rollIngredients));
    } catch {}
  }, [rollIngredients]);

  // Menu Management Handlers
  const addProduct = (newProd: Omit<Product, 'id'>): Product => {
    const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const product: Product = {
      ...newProd,
      id,
      isActive: newProd.isActive !== undefined ? newProd.isActive : true,
    };
    setProducts(prev => [...prev, product]);
    return product;
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const toggleProductActive = (productId: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const current = p.isActive !== false;
          return { ...p, isActive: !current };
        }
        return p;
      })
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addCategory = (category: CategoryInfo) => {
    setCategories(prev => {
      if (prev.some(c => c.id === category.id)) return prev;
      return [...prev, category];
    });
  };

  const updateCategory = (category: CategoryInfo) => {
    setCategories(prev =>
      prev.map(c => (c.id === category.id ? category : c))
    );
  };

  const deleteCategory = (categoryId: string) => {
    if (categoryId === 'todos') return;
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const updateRollIngredients = (config: RollIngredientsConfig) => {
    setRollIngredients(config);
  };

  const resetMenuToDefaults = () => {
    setProducts(MENU_PRODUCTS.map(p => ({ ...p, isActive: true })));
    setCategories(INITIAL_CATEGORIES);
    setRollIngredients(INITIAL_ROLL_INGREDIENTS);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    } catch {}
  }, [tables]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(activeSessions));
    } catch {}
  }, [activeSessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMANDAS, JSON.stringify(comandas));
    } catch {}
  }, [comandas]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COUNTER, comandaCounter.toString());
    } catch {}
  }, [comandaCounter]);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(enabled));
    } catch {}
  };

  /** Open a table */
  const openTable = (tableNumber: number) => {
    playTapSound(soundEnabled);
    const existingSession = activeSessions.find(s => s.tableNumber === tableNumber);
    if (!existingSession) {
      const newSession: TableSession = {
        tableNumber,
        sessionId: `session-m${tableNumber}-${Date.now()}`,
        openedAt: new Date().toISOString(),
      };
      setActiveSessions(prev => [...prev, newSession]);
    }

    setTables(prev =>
      prev.map(t =>
        t.tableNumber === tableNumber
          ? { ...t, status: 'abierta', openedAt: new Date().toISOString() }
          : t
      )
    );
  };

  /** Close an open table (ABIERTA -> LIBRE) when account was paid in POS and diners left */
  const closeTable = (tableNumber: number) => {
    playTapSound(soundEnabled);
    // End active session for this table so future orders start fresh
    setActiveSessions(prev => prev.filter(s => s.tableNumber !== tableNumber));
    // Mesa passes directly to 'libre'
    setTables(prev =>
      prev.map(t =>
        t.tableNumber === tableNumber
          ? { ...t, status: 'libre', openedAt: undefined }
          : t
      )
    );
    if (selectedTable === tableNumber) {
      setSelectedTable(null);
    }
  };

  /** Release table - alias to closeTable */
  const releaseTable = (tableNumber: number) => {
    closeTable(tableNumber);
  };

  /** Get all internal comandas for current table session */
  const getTableActiveSessionComandas = (tableNumber: number): InternalComanda[] => {
    const session = activeSessions.find(s => s.tableNumber === tableNumber);
    if (!session) return [];

    return comandas.filter(
      c =>
        c.serviceType === 'MESA' &&
        c.tableNumber === tableNumber &&
        (c as unknown as { sessionId?: string }).sessionId === session.sessionId
    );
  };

  /** Consolidated consumed products list for a table (No comanda numbers shown!) */
  const getConsolidatedConsumedForTable = (tableNumber: number): ConsolidatedItem[] => {
    const tableComandas = getTableActiveSessionComandas(tableNumber);
    const list: ConsolidatedItem[] = [];

    tableComandas.forEach(comanda => {
      comanda.items.forEach(item => {
        const isCancelled = item.status === 'CANCELADO';
        list.push({
          id: `${comanda.id}-${item.id}`,
          itemId: item.id,
          comandaId: comanda.id,
          comandaNumber: comanda.comandaNumber,
          displayTitle: item.displayTitle,
          quantity: item.quantity,
          details: item.details,
          notes: item.notes,
          status: isCancelled ? 'CANCELADO' : 'ACTIVO',
          cancelledAt: item.cancelledAt,
        });
      });
    });

    return list;
  };

  /** Send comanda for Table */
  const sendTableComanda = (tableNumber: number, items: ComandaItem[]): InternalComanda => {
    let session = activeSessions.find(s => s.tableNumber === tableNumber);
    if (!session) {
      session = {
        tableNumber,
        sessionId: `session-m${tableNumber}-${Date.now()}`,
        openedAt: new Date().toISOString(),
      };
      setActiveSessions(prev => [...prev, session!]);
    }

    const currentNumber = comandaCounter;
    setComandaCounter(prev => prev + 1);

    const newComanda: InternalComanda & { sessionId: string } = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      comandaNumber: currentNumber,
      serviceType: 'MESA',
      tableNumber,
      items,
      createdAt: new Date().toISOString(),
      sessionId: session.sessionId,
    };

    setComandas(prev => [newComanda, ...prev]);

    // Ensure table is open
    setTables(prev =>
      prev.map(t =>
        t.tableNumber === tableNumber ? { ...t, status: 'abierta' } : t
      )
    );

    playKitchenChime(soundEnabled);
    setLastSentComanda(newComanda);
    return newComanda;
  };

  /** Send comanda for Takeout (PARA LLEVAR) - Sealed and immutable */
  const sendTakeoutComanda = (items: ComandaItem[]): InternalComanda => {
    const currentNumber = comandaCounter;
    setComandaCounter(prev => prev + 1);

    // Compute next independent visible sequence number for Para Llevar
    const existingTakeouts = comandas.filter(c => c.serviceType === 'PARA_LLEVAR');
    const maxVisible = existingTakeouts.reduce((max, c) => Math.max(max, c.orderVisibleNumber || 0), 0);
    const visibleNum = maxVisible + 1;

    const newComanda: InternalComanda = {
      id: `cmd-takeout-${Date.now()}`,
      comandaNumber: currentNumber,
      serviceType: 'PARA_LLEVAR',
      orderVisibleNumber: visibleNum,
      orderLabel: `Para Llevar #${visibleNum}`,
      orderStatus: 'EN_PREPARACION',
      items,
      createdAt: new Date().toISOString(),
    };

    setComandas(prev => [newComanda, ...prev]);
    playKitchenChime(soundEnabled);
    setLastSentComanda(newComanda);
    return newComanda;
  };

  /** Send comanda for Delivery (DOMICILIO) - Sealed and immutable */
  const sendDeliveryComanda = (items: ComandaItem[]): InternalComanda => {
    const currentNumber = comandaCounter;
    setComandaCounter(prev => prev + 1);

    // Compute next independent visible sequence number for Domicilio
    const existingDeliveries = comandas.filter(c => c.serviceType === 'DOMICILIO');
    const maxVisible = existingDeliveries.reduce((max, c) => Math.max(max, c.orderVisibleNumber || 0), 0);
    const visibleNum = maxVisible + 1;

    const newComanda: InternalComanda = {
      id: `cmd-delivery-${Date.now()}`,
      comandaNumber: currentNumber,
      serviceType: 'DOMICILIO',
      orderVisibleNumber: visibleNum,
      orderLabel: `Domicilio #${visibleNum}`,
      orderStatus: 'EN_PREPARACION',
      items,
      createdAt: new Date().toISOString(),
    };

    setComandas(prev => [newComanda, ...prev]);
    playKitchenChime(soundEnabled);
    setLastSentComanda(newComanda);
    return newComanda;
  };

  /** Cancel an item in an already sent comanda (Mark as CANCELADO, preserves history) */
  const cancelItemInComanda = (
    comandaId: string,
    itemId: string
  ): { comanda: InternalComanda; item: ComandaItem } | null => {
    playTapSound(soundEnabled);
    let cancelledResult: { comanda: InternalComanda; item: ComandaItem } | null = null;

    setComandas(prev =>
      prev.map(c => {
        if (c.id === comandaId) {
          const now = new Date().toISOString();
          let matchedItem: ComandaItem | null = null;
          const updatedItems = c.items.map(it => {
            if (it.id === itemId) {
              matchedItem = {
                ...it,
                status: 'CANCELADO',
                cancelledAt: now,
              };
              return matchedItem;
            }
            return it;
          });

          const updatedComanda = {
            ...c,
            items: updatedItems,
          };

          if (matchedItem) {
            cancelledResult = {
              comanda: updatedComanda,
              item: matchedItem,
            };
          }

          return updatedComanda;
        }
        return c;
      })
    );

    return cancelledResult;
  };

  /** Mark order as delivered (EN_PREPARACION -> ENTREGADO) */
  const markOrderAsDelivered = (comandaId: string) => {
    playTapSound(soundEnabled);
    setComandas(prev =>
      prev.map(c =>
        c.id === comandaId ? { ...c, orderStatus: 'ENTREGADO' } : c
      )
    );
  };

  const getComandaByNumber = (num: number): InternalComanda | undefined => {
    return comandas.find(c => c.comandaNumber === num);
  };

  const clearLastSentComanda = () => {
    setLastSentComanda(null);
  };

  /** Reset all data to clean initial state */
  const resetAllData = () => {
    playTapSound(soundEnabled);
    setTables(INITIAL_TABLES);
    setActiveSessions([]);
    setComandas([]);
    setComandaCounter(1001);
    setSelectedTable(null);
    setLastSentComanda(null);
    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.COMANDAS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.COUNTER, '1001');
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch {}
  };

  /** Seed demo data so user can immediately test */
  const seedSampleData = () => {
    playTapSound(soundEnabled);
    const now = new Date();

    const m5Session: TableSession = {
      tableNumber: 5,
      sessionId: `session-m5-demo`,
      openedAt: new Date(now.getTime() - 25 * 60000).toISOString(),
    };

    const m3Session: TableSession = {
      tableNumber: 3,
      sessionId: `session-m3-demo`,
      openedAt: new Date(now.getTime() - 10 * 60000).toISOString(),
    };

    // Mesa 5 sample comandas: #1024, #1031
    const cmd1024: InternalComanda & { sessionId: string } = {
      id: 'cmd-seed-1',
      comandaNumber: 1024,
      serviceType: 'MESA',
      tableNumber: 5,
      createdAt: new Date(now.getTime() - 22 * 60000).toISOString(),
      sessionId: m5Session.sessionId,
      items: [
        {
          id: 's1',
          productId: 'rollo-normal',
          productName: 'Rollo Normal',
          category: 'rollos',
          quantity: 2,
          displayTitle: 'Rollo camarón / mango',
          details: 'Base: Pepino, Phil., Aguacate · Relleno: Camarón · Cobertura: Mango',
        },
        {
          id: 's2',
          productId: 'yakimeshi-mixto',
          productName: 'Yakimeshi Mixto',
          category: 'yakimeshi',
          quantity: 1,
          displayTitle: 'Yakimeshi Mixto',
        },
        {
          id: 's3',
          productId: 'coca-cola',
          productName: 'Coca-Cola (355ml)',
          category: 'bebidas',
          quantity: 2,
          displayTitle: 'Coca-Cola',
        },
      ],
    };

    const cmd1031: InternalComanda & { sessionId: string } = {
      id: 'cmd-seed-2',
      comandaNumber: 1031,
      serviceType: 'MESA',
      tableNumber: 5,
      createdAt: new Date(now.getTime() - 12 * 60000).toISOString(),
      sessionId: m5Session.sessionId,
      items: [
        {
          id: 's4',
          productId: 'rollo-normal',
          productName: 'Rollo Normal',
          category: 'rollos',
          quantity: 1,
          displayTitle: 'Rollo pollo / tampico',
          details: 'Base: Pepino, Phil., Aguacate · Relleno: Pollo · Cobertura: Tampico',
        },
      ],
    };

    // Mesa 3 sample comanda
    const cmd1035: InternalComanda & { sessionId: string } = {
      id: 'cmd-seed-3',
      comandaNumber: 1035,
      serviceType: 'MESA',
      tableNumber: 3,
      createdAt: new Date(now.getTime() - 8 * 60000).toISOString(),
      sessionId: m3Session.sessionId,
      items: [
        {
          id: 's5',
          productId: 'kushiages-queso',
          productName: 'Kushiages de Queso (3 pzas)',
          category: 'especialidades',
          quantity: 2,
          displayTitle: 'Kushiages de Queso (3 pzas)',
          notes: 'Servir bien calientes',
        },
        {
          id: 's6',
          productId: 'calpis',
          productName: 'Calpis Natural',
          category: 'bebidas',
          quantity: 2,
          displayTitle: 'Calpis Natural',
        },
      ],
    };

    // Takeout sample
    const cmd1036: InternalComanda = {
      id: 'cmd-seed-4',
      comandaNumber: 1036,
      serviceType: 'PARA_LLEVAR',
      orderVisibleNumber: 1,
      orderLabel: 'Para Llevar #1',
      orderStatus: 'EN_PREPARACION',
      createdAt: new Date(now.getTime() - 15 * 60000).toISOString(),
      items: [
        {
          id: 's7',
          productId: 'rollo-california',
          productName: 'Rollo California Especial',
          category: 'rollos',
          quantity: 2,
          displayTitle: 'Rollo salmón / aguacate',
          details: 'Relleno: Salmón · Cobertura: Aguacate',
        },
        {
          id: 's8',
          productId: 'gyozas-cerdo',
          productName: 'Gyozas de Cerdo y Col (5 pzas)',
          category: 'especialidades',
          quantity: 1,
          displayTitle: 'Gyozas de Cerdo y Col (5 pzas)',
          notes: 'Salsa soya aparte',
        },
      ],
    };

    // Delivery sample
    const cmd1038: InternalComanda = {
      id: 'cmd-seed-5',
      comandaNumber: 1038,
      serviceType: 'DOMICILIO',
      orderVisibleNumber: 1,
      orderLabel: 'Domicilio #1',
      orderStatus: 'EN_PREPARACION',
      createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
      items: [
        {
          id: 's9',
          productId: 'yakimeshi-tradicional',
          productName: 'Yakimeshi Tradicional',
          category: 'yakimeshi',
          quantity: 2,
          displayTitle: 'Yakimeshi Tradicional',
        },
        {
          id: 's10',
          productId: 'coca-cola-zero',
          productName: 'Coca-Cola Sin Azúcar (355ml)',
          category: 'bebidas',
          quantity: 2,
          displayTitle: 'Coca-Cola Sin Azúcar',
        },
      ],
    };

    const newTables = INITIAL_TABLES.map(t => {
      if (t.tableNumber === 5) return { ...t, status: 'abierta' as const, openedAt: m5Session.openedAt };
      if (t.tableNumber === 3) return { ...t, status: 'abierta' as const, openedAt: m3Session.openedAt };
      return t;
    });

    setTables(newTables);
    setActiveSessions([m5Session, m3Session]);
    setComandas([cmd1038, cmd1036, cmd1035, cmd1031, cmd1024]);
    setComandaCounter(1039);
    try {
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch {}
  };

  // Seed sample data only on first run if not yet initialized
  useEffect(() => {
    try {
      const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isInit) {
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
        seedSampleData();
      }
    } catch {
      if (comandas.length === 0 && activeSessions.length === 0) {
        seedSampleData();
      }
    }
  }, []);

  return (
    <ComandaContext.Provider
      value={{
        tables,
        comandas,
        soundEnabled,
        setSoundEnabled,
        activeTab,
        setActiveTab,
        selectedTable,
        setSelectedTable,
        openTable,
        closeTable,
        releaseTable,
        getConsolidatedConsumedForTable,
        getTableActiveSessionComandas,
        sendTableComanda,
        sendTakeoutComanda,
        sendDeliveryComanda,
        markOrderAsDelivered,
        cancelItemInComanda,
        getComandaByNumber,
        lastSentComanda,
        clearLastSentComanda,
        resetAllData,
        seedSampleData,
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
        resetMenuToDefaults,
        theme,
        setTheme,
        primaryColor,
        setPrimaryColor,
        restaurantName,
        setRestaurantName,
        restaurantLogo,
        setRestaurantLogo,
        resetAppearance,
      }}
    >
      {children}
    </ComandaContext.Provider>
  );
};

export const useComanda = () => {
  const context = useContext(ComandaContext);
  if (!context) {
    throw new Error('useComanda must be used within a ComandaProvider');
  }
  return context;
};
