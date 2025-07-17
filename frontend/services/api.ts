// Archivo: frontend/services/api.ts

/**
 * Un objeto placeholder para manejar futuras llamadas a la API.
 */
export const apiService = {
  post: async (endpoint: string, data: any) => {
    console.log(`Simulando una petición POST a ${endpoint} con:`, data);
    // En el futuro, aquí iría la lógica real con 'fetch' para llamar al backend.
    return { success: true, message: 'Conversión simulada exitosa' };
  }
};

/**
 * Una función placeholder para calcular el coste de una conversión.
 */
export const getConversionCost = (fromFormat: string, toFormat: string): number => {
  console.log(`Calculando coste para: ${fromFormat} -> ${toFormat}`);
  // Devolvemos un coste de ejemplo para que funcione
  return 2; 
};

/**
 * Una función de ayuda para formatear el tamaño de un archivo de bytes a KB, MB, etc.
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};