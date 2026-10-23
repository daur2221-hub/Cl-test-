import { Product } from '../types';

export const MENU_PRODUCTS: Product[] = [
  // --- ROLLOS ---
  {
    id: 'rollo-normal',
    name: 'Rollo Normal (Personalizable)',
    category: 'rollos',
    description: 'Base: Pepino, Philadelphia, Aguacate. Elige relleno y cobertura.',
    isConfigurableRoll: true,
  },
  {
    id: 'rollo-california',
    name: 'Rollo California Especial',
    category: 'rollos',
    description: 'Base tradicional con ajonjolí tostado y masago.',
    isConfigurableRoll: true,
  },
  {
    id: 'rollo-dragon',
    name: 'Rollo Dragón',
    category: 'rollos',
    description: 'Camarón tempura y pepino, cubierto de láminas de aguacate con salsa dulce.',
    isConfigurableRoll: false,
  },
  {
    id: 'rollo-filadelfia',
    name: 'Rollo Filadelfia Clásico',
    category: 'rollos',
    description: 'Salmón fresco, queso crema y ajonjolí negro.',
    isConfigurableRoll: false,
  },

  // --- ESPECIALIDADES ---
  {
    id: 'kushiages-queso',
    name: 'Kushiages de Queso (3 pzas)',
    category: 'especialidades',
    description: 'Brochetas empanizadas de queso manchego fundido.',
    isConfigurableRoll: false,
  },
  {
    id: 'gyozas-cerdo',
    name: 'Gyozas de Cerdo y Col (5 pzas)',
    category: 'especialidades',
    description: 'Empanaditas japonesas doradas a la plancha.',
    isConfigurableRoll: false,
  },
  {
    id: 'edamames',
    name: 'Edamames al Vapor con Sal de Mar',
    category: 'especialidades',
    description: 'Vainas de soya tiernas al vapor.',
    isConfigurableRoll: false,
  },
  {
    id: 'tempura-mixto',
    name: 'Tempura Mixto de Verduras',
    category: 'especialidades',
    description: 'Calabaza, zanahoria, cebolla y brócoli capeados estilo tempura.',
    isConfigurableRoll: false,
  },

  // --- YAKIMESHI ---
  {
    id: 'yakimeshi-tradicional',
    name: 'Yakimeshi Tradicional',
    category: 'yakimeshi',
    description: 'Arroz frito al wok con verduras finas, cebollín y huevo.',
    isConfigurableRoll: false,
  },
  {
    id: 'yakimeshi-mixto',
    name: 'Yakimeshi Mixto',
    category: 'yakimeshi',
    description: 'Arroz frito con pollo, carne de res y camarón salteado.',
    isConfigurableRoll: false,
  },
  {
    id: 'yakimeshi-especial',
    name: 'Yakimeshi Especial con Tampico',
    category: 'yakimeshi',
    description: 'Con porción generosa de pasta tampico y cubos de aguacate.',
    isConfigurableRoll: false,
  },

  // --- BEBIDAS ---
  {
    id: 'coca-cola',
    name: 'Coca-Cola (355ml)',
    category: 'bebidas',
    description: 'Refresco clásico.',
    isConfigurableRoll: false,
  },
  {
    id: 'coca-cola-zero',
    name: 'Coca-Cola Sin Azúcar (355ml)',
    category: 'bebidas',
    description: 'Refresco sin azúcar.',
    isConfigurableRoll: false,
  },
  {
    id: 'sprite',
    name: 'Sprite (355ml)',
    category: 'bebidas',
    description: 'Refresco sabor lima-limón.',
    isConfigurableRoll: false,
  },
  {
    id: 'calpis',
    name: 'Calpis Natural',
    category: 'bebidas',
    description: 'Bebida japonesa refrescante fermentada.',
    isConfigurableRoll: false,
  },
  {
    id: 'agua-mineral',
    name: 'Agua Mineral (355ml)',
    category: 'bebidas',
    description: 'Agua gasificada con rodaja de limón.',
    isConfigurableRoll: false,
  },
  {
    id: 'te-verde-frio',
    name: 'Té Verde Frío',
    category: 'bebidas',
    description: 'Infusión japonesa de sencha servida fría.',
    isConfigurableRoll: false,
  },
  {
    id: 'agua-natural',
    name: 'Agua Natural (500ml)',
    category: 'bebidas',
    description: 'Botella de agua purificada.',
    isConfigurableRoll: false,
  },
];

export const INITIAL_CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'rollos', label: 'Rollos' },
  { id: 'especialidades', label: 'Especialidades' },
  { id: 'yakimeshi', label: 'Yakimeshi' },
  { id: 'bebidas', label: 'Bebidas' },
];

export const INITIAL_ROLL_INGREDIENTS = {
  bases: ['Aguacate', 'Philadelphia', 'Pepino'],
  rellenos: ['Surimi', 'Camarón', 'Pollo', 'Salmón'],
  coberturas: ['Aguacate', 'Mango', 'Empanizado', 'Tampico'],
};

export const ROLL_BASE_INGREDIENTS = ['Pepino', 'Philadelphia', 'Aguacate'];

export const ROLL_RELLENOS = [
  'Surimi',
  'Camarón',
  'Pollo',
  'Salmón',
];

export const ROLL_COBERTURAS = [
  'Aguacate',
  'Mango',
  'Empanizado',
  'Tampico',
];

export const QUICK_NOTES = [
  'Sin cebollín',
  'Sin ajonjolí',
  'Salsa soya aparte',
  'Extra wasabi',
  'Empanizado extra crujiente',
  'Para compartir al centro',
  'Servir de inmediato',
];
