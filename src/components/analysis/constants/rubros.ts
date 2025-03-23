import { Rubro } from '../types/rubros';

export const RUBROS: Record<number, Rubro> = {
 1: { id: 1, nombre: "GENERALES VARIABLES" },
 2: { id: 2, nombre: "INICIO DE OBRA" },
 3: { id: 3, nombre: "TRABAJOS PRELIMINARES" },
 4: { id: 4, nombre: "CERCADOS" },
 5: { id: 5, nombre: "MOVIMIENTO DE SUELOS" },
 6: { id: 6, nombre: "DEMOLICIONES" },
 7: { id: 7, nombre: "ESTRUCTURA DE HºAº" },
 8: { id: 8, nombre: "MAMPOSTERIA" },
 9: { id: 9, nombre: "AISLACIONES E IMPREMEABILIZACIONES HIDROFUGAS" },
 10: { id: 10, nombre: "CONTRAPISOS CARPETAS Y CORDONES" },
 11: { id: 11, nombre: "PAVIMENTOS" },
 12: { id: 12, nombre: "REVESTIMIENTOS Y PISOS" },
 13: { id: 13, nombre: "ZOCALOS UMBRALES Y SOLIAS" },
 14: { id: 14, nombre: "REVOQUES" },
 15: { id: 15, nombre: "CIELORRASOS" },
 16: { id: 16, nombre: "CONSTRUCCION EN SECO" },
 17: { id: 17, nombre: "CUBIERTAS" },
 18: { id: 18, nombre: "AISLACIONES TERMICAS" },
 19: { id: 19, nombre: "CARPINTERIA" },
 20: { id: 20, nombre: "HERRERIA" },
 21: { id: 21, nombre: "AGUA FRIA Y CALIENTE" },
 22: { id: 22, nombre: "ARTEFACTOS Y ACCESORIOS SANITARIOS" },
 23: { id: 23, nombre: "BASICO SANITARIO PLUVIAL" },
 24: { id: 24, nombre: "ZINGERIA" },
 25: { id: 25, nombre: "MESADAS" },
 26: { id: 26, nombre: "INSTALACION DE GAS" },
 27: { id: 27, nombre: "ARTEFACTOS" },
 28: { id: 28, nombre: "INSTALACION ELECTRICA" },
 29: { id: 29, nombre: "ELECTROMECANICA" },
 30: { id: 30, nombre: "INSTALACION CONTRA INCENDIO SEGURIDAD" },
 31: { id: 31, nombre: "CALEFACCION" },
 32: { id: 32, nombre: "CONDUCTOS Y VENTILACIONES" },
 33: { id: 33, nombre: "PINTURAS" },
 34: { id: 34, nombre: "VIDRIOS" },
 35: { id: 35, nombre: "LIMPIEZA" },
 36: { id: 36, nombre: "TAREAS VARIAS" },
 37: { id: 37, nombre: "RESERVADO" }
} as const;

// Función helper para verificar si un ID de rubro existe
export const isValidRubro = (id: number): boolean => {
 return id in RUBROS;
};

// Función helper para obtener un rubro por ID
export const getRubroById = (id: number): Rubro | undefined => {
 return RUBROS[id];
};

// Función helper para obtener todos los rubros como array
export const getAllRubros = (): Rubro[] => {
 return Object.values(RUBROS);
};

export default RUBROS;