// Agregar desde el principio hasta el final del archivo:
export interface Material {
  id: string;
  descripcion: string;
  precio_unitario: number;
  unidad: string;
  fecha_actualizacion: Date;
}

export interface Insumo {
  material_id: string;
  cantidad: number;
  coeficiente: number;
  precio_unitario: number;
  subtotal: number;
  unidad: string;
}

export interface AnalisisCosto {
  id: string;
  rubro: {
    id: number;
    nombre: string;
  };
  indice: {
    mayor: number;
    menor: number;
  };
  codigo_display: string;
  nombre: string;
  unidad: string;
  rendimiento: number;
  costo_total: number;
  fecha_actualizacion: Date;
  insumos: Record<string, Insumo>;
}