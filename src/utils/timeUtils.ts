// utils/timeUtils.ts

/**
 * Devuelve el timestamp actual en segundos (Unix timestamp de 10 dígitos).
 */
export function getFechaUnix(): number {
    return Math.floor(Date.now() / 1000);
  }
  
  /**
   * Convierte un objeto Date o número en timestamp Unix en segundos.
   * @param date Puede ser un Date o un timestamp en milisegundos.
   */
  export function convertirASegundos(date: Date | number): number {
    if (typeof date === 'number') {
      return Math.floor(date / 1000);
    }
    return Math.floor(date.getTime() / 1000);
  }
  
  /**
   * Formatea un timestamp Unix (en segundos) como fecha legible en formato argentino.
   * Ej: '18/07/2025 20:10'
   */
  export function formatearFechaArgentina(timestamp: number): string {
    const date = new Date(timestamp * 1000); // lo pasamos a milisegundos
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  /**
   * Devuelve el inicio y fin del mes actual como timestamps en segundos.
   */
  export function getInicioYFinDeMesActual(): { inicio: number; fin: number } {
    const now = new Date();
    const inicio = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const fin = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return {
      inicio: convertirASegundos(inicio),
      fin: convertirASegundos(fin),
    };
  }
  
  /**
   * Devuelve el inicio y fin del año actual como timestamps en segundos.
   */
  export function getInicioYFinDelAnioActual(): { inicio: number; fin: number } {
    const now = new Date();
    const inicio = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    const fin = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    return {
      inicio: convertirASegundos(inicio),
      fin: convertirASegundos(fin),
    };
  }
  
  /**
   * Devuelve el timestamp de hoy menos N días, y el de hoy actual.
   * Ej: para últimos 7 días → getUltimosNDias(7)
   */
  export function getUltimosNDias(n: number): { desde: number; hasta: number } {
    const ahora = new Date();
    const desde = new Date(ahora.getTime() - n * 24 * 60 * 60 * 1000);
    return {
      desde: convertirASegundos(desde),
      hasta: convertirASegundos(ahora),
    };
  }
  