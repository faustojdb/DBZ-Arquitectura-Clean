// src/types/budget.ts
import { Timestamp } from 'firebase/firestore';

export interface Presupuesto {
  id: string;                       // ID único del presupuesto
  titulo: string;                   // Título del presupuesto
  fecha: Timestamp;                 // Fecha de creación
  comitente: string;                // Cliente o comitente
  obra: string;                     // Descripción de la obra
  tipoEncomenda: string;            // Tipo de obra/encomienda
  beneficioExplicito: number;       // Beneficio explícito (porcentaje)
  beneficioImplicito: number;       // Beneficio implícito (porcentaje)
  ubicacion: string;                // Ubicación de la obra
  items: PresupuestoItem[];         // Items del presupuesto
  total: number;                    // Total calculado del presupuesto
}

export interface PresupuestoItem {
  id: string;                       // ID único del ítem
  indice: string;                   // Índice jerárquico (1.0.0, 1.1.0, etc.)
  esRubro: boolean;                 // Indica si es un rubro o un insumo
  nombre: string;                   // Nombre del ítem/insumo
  abreviatura?: string;             // Abreviatura (solo para insumos)
  analisisId?: string;              // ID del análisis relacionado (si aplica)
  unidad: string;                   // Unidad de medida
  cantidad: number;                 // Cantidad
  precioUnitario: number;           // Precio unitario (con beneficio implícito)
  importe: number;                  // Importe calculado
  incidencia?: number;              // Incidencia porcentual sobre el total
  subItems?: PresupuestoItem[];     // Subitems (para rubros)
  nivel: number;                    // Nivel jerárquico (1, 2, 3...)
  parentId?: string;                // ID del ítem padre (si es subitem)
}

export interface AnalisisSeleccionado {
  id: string;
  codigoDisplay: string;
  nombre: string;
  unidad: string;
  costo_total: number;
  insumos: {
    [key: string]: {
      item_id: string;
      cantidad: number;
      unidad: string;
      precio_unitario: number;
      subtotal: number;
    }
  }
}

// Constantes
export const TIPO_ENCOMENDAS = [
  'Obra - Construcción',
  'Obra - Remodelación',
  'Proyecto - Arquitectura',
  'Consultoría',
  'Dirección de Obra'
];

// Tipos de notificación
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

// Estado de edición
export enum BudgetEditMode {
  NONE = 'none',
  CREATE = 'create',
  EDIT = 'edit',
  VIEW = 'view'
}