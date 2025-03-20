export interface Rubro {
  id: number;
  nombre: string;
}

export interface Indice {
  mayor: number;
  menor: number;
}

export interface AnalisisCosto {
  id: string;
  rubro: Rubro;
  indice: Indice;
  codigoDisplay: string;
  nombre: string;
  unidad: string;
  rendimiento: number;
  costo_total: number;
  fecha_actualizacion: any; // timestamp de Firebase
  insumos: Record<string, any>;
}