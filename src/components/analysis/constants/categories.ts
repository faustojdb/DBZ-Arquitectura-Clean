// src/components/analysis/constants/categories.ts
export const CATEGORIES = {
  'CATEGORY_1': 'GENERALES VARIABLES',
  'CATEGORY_2': 'INICIO DE OBRA',
  'CATEGORY_3': 'TRABAJOS PRELIMINARES',
  'CATEGORY_4': 'CERCADOS',
  'CATEGORY_5': 'MOVIMIENTO DE SUELOS',
  'CATEGORY_6': 'DEMOLICIONES',
  'CATEGORY_7': 'ESTRUCTURA HºAº',
  'CATEGORY_8': 'MAMPOSTERIA',
  'CATEGORY_9': 'AISLACIONE E IMPREMEABILIZACIONES HIDROFUGAS',
  'CATEGORY_10': 'CONTRAPISOS CARPETAS Y CORDONES',
  'CATEGORY_11': 'PAVIMENTOS',
  'CATEGORY_12': 'REVESTIMIENTOS Y PISOS',
  'CATEGORY_13': 'ZOCALOS UMBRALES Y SOLIAS',
  'CATEGORY_14': 'REVOQUES',
  'CATEGORY_15': 'CIELORRASOS',
  'CATEGORY_16': 'CONSTRUCCION EN SECO',
  'CATEGORY_17': 'CUBIERTAS',
  'CATEGORY_18': 'AISLACIONES_TERMICAS',
  'CATEGORY_19': 'CARPINTERIA',
  'CATEGORY_20': 'HERRERIA',
  'CATEGORY_21': 'AGUA FRIA Y CALIENTE',
  'CATEGORY_22': 'ARTEFACTOS Y ACCESORIOS SANITARIOS',
  'CATEGORY_23': 'BASICO SANITARIO PLUVIAL',
  'CATEGORY_24': 'ZINGERIA',
  'CATEGORY_25': 'MESADAS',
  'CATEGORY_26': 'INSTALACION DE GAS',
  'CATEGORY_27': 'ARTEFACTOS',
  'CATEGORY_28': 'INSTALACION ELECTRICA',
  'CATEGORY_29': 'ELECTROMECANICA',
  'CATEGORY_30': 'INSTALACION CONTRA INCENDIO Y SEGURIDAD',
  'CATEGORY_31': 'CALEFACCION',
  'CATEGORY_32': 'CONDUCTOS Y VENTILACIONES',
  'CATEGORY_33': 'PINTURAS',
  'CATEGORY_34': 'VIDRIOS',
  'CATEGORY_35': 'LIMPIEZA',
  'CATEGORY_36': 'TAREAS VARIAS',
  'CATEGORY_37': 'RESERVADO'
};

// Nueva estructura adaptada para el componente actualizado
export const categories = [
  {
    id: "preliminares",
    name: "TRABAJOS PRELIMINARES",
    minCode: "01",
    maxCode: "10",
    color: "#4CAF50"
  },
  {
    id: "movimiento_suelos",
    name: "MOVIMIENTO DE SUELOS",
    minCode: "10",
    maxCode: "20",
    color: "#FF9800"
  },
  {
    id: "estructura",
    name: "ESTRUCTURA",
    minCode: "20",
    maxCode: "30",
    color: "#2196F3"
  },
  {
    id: "albañileria",
    name: "MAMPOSTERIA Y ALBAÑILERÍA",
    minCode: "30",
    maxCode: "40",
    color: "#F44336"
  },
  {
    id: "instalaciones",
    name: "INSTALACIONES",
    minCode: "40",
    maxCode: "50",
    color: "#673AB7"
  },
  {
    id: "terminaciones",
    name: "TERMINACIONES",
    minCode: "50",
    maxCode: "60",
    color: "#795548"
  },
  {
    id: "revestimientos",
    name: "REVESTIMIENTOS Y PISOS",
    minCode: "60",
    maxCode: "70",
    color: "#009688"
  },
  {
    id: "otros",
    name: "VARIOS",
    minCode: "90",
    maxCode: "100",
    color: "#9E9E9E"
  }
];

export default categories;