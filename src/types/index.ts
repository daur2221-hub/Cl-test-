export type ServiceType = 'MESA' | 'PARA_LLEVAR' | 'DOMICILIO';

export type TableStatus = 'libre' | 'abierta';

export type OrderStatus = 'EN_PREPARACION' | 'ENTREGADO';

export type ProductCategory = string;

export interface CategoryInfo {
  id: string;
  label: string;
}

export interface RollIngredientsConfig {
  bases: string[];
  rellenos: string[];
  coberturas: string[];
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description?: string;
  isConfigurableRoll?: boolean;
  isActive?: boolean; // Defaults to true. If false, deactivated without permanently deleting
}

export interface RollCustomization {
  base: string[]; // ['Pepino', 'Philadelphia', 'Aguacate']
  relleno: string; // 'Surimi' | 'Camarón' | 'Pollo' | 'Salmón'
  cobertura?: string; // 'Aguacate' | 'Mango' | 'Empanizado' | 'Tampico' | 'Ninguna'
}

export interface ComandaItem {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  rollCustomization?: RollCustomization;
  // Formatted display string like: "2 × Rollo camarón / mango" or "1 × Yakimeshi"
  displayTitle: string;
  details?: string;
  notes?: string;
  // Status of item within comanda: 'ACTIVO' (default) or 'CANCELADO'
  status?: 'ACTIVO' | 'CANCELADO';
  cancelledAt?: string;
}

export interface InternalComanda {
  id: string;
  comandaNumber: number; // Unique internal sequential number: 1001, 1002, etc. (for trace & reprint)
  serviceType: ServiceType;
  tableNumber?: number; // Only for MESA
  orderVisibleNumber?: number; // Sequential visible number for PARA_LLEVAR or DOMICILIO: 1, 2, 3...
  orderLabel?: string; // e.g. "Para Llevar #1", "Domicilio #2"
  orderStatus?: OrderStatus; // 'EN_PREPARACION' | 'ENTREGADO'
  items: ComandaItem[];
  createdAt: string; // ISO string
  printedAt?: string;
}

export interface TableInfo {
  tableNumber: number;
  status: TableStatus;
  openedAt?: string;
}

export type ActiveTab = 'mesas' | 'para_llevar' | 'domicilio' | 'historial' | 'reimpresion';

export type AppTheme = 'dark' | 'light';

export interface AppAppearance {
  theme: AppTheme;
  primaryColor: string;
  restaurantName: string;
  restaurantLogo: string | null;
}
