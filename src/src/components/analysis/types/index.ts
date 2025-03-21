export interface Insumo {
  item_id: string;
  cantidad: number;
  coeficiente: number;
  unidad: string;
  precio_unitario: number;
  subtotal: number;
  item?: any;
}

export interface Analysis {
  id: string;
  codigo: string;
  nombre: string;
  unidad: string;
  rendimiento: number;
  costo_total: number;
  fecha_actualizacion: {
    seconds: number;
    nanoseconds: number;
  };
  insumos: {
    [key: string]: Insumo;
  };
  category?: string;
}

export interface GroupedAnalyses {
  [category: string]: Analysis[];
}

export interface CategoryData {
  id: string;
  name: string;
  pattern: RegExp;
}