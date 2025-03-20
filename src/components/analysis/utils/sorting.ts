// En sorting.ts - Función mejorada para comparar códigos con índices mayor/menor

/**
 * Compara dos análisis basados en sus campos mayor/menor para ordenación correcta
 */
export const compareAnalysisItems = (a, b) => {
  // Primero intentamos comparar por índices estructurados
  if (a.indice && b.indice) {
    // Comparar mayor primero
    const mayorA = a.indice.mayor || 0;
    const mayorB = b.indice.mayor || 0;
    
    if (mayorA !== mayorB) {
      return mayorA - mayorB;
    }
    
    // Si mayor es igual, comparar menor
    const menorA = a.indice.menor || 0;
    const menorB = b.indice.menor || 0;
    
    return menorA - menorB;
  }
  
  // Si no hay índices estructurados, intentar con codigoDisplay
  return compareAnalysisCodes(a.codigoDisplay || "", b.codigoDisplay || "");
};

/**
 * Compara dos códigos de display (como "1.10") numéricamente
 */
export const compareAnalysisCodes = (codeA, codeB) => {
  // Dividir los códigos en sus partes numéricas
  const partsA = codeA.split('.').map(part => parseInt(part, 10) || 0);
  const partsB = codeB.split('.').map(part => parseInt(part, 10) || 0);

  // Comparar cada parte numérica
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    
    if (numA !== numB) {
      return numA - numB;
    }
  }
  
  return 0; // Los códigos son iguales
};