import { eq, and, inArray } from "drizzle-orm";
import db from "../db";
import { productos, stockActual } from "../db/schema";

interface ModificacionLoteParams {
  tipoModificacion: 'porcentaje' | 'monto';
  filtroTipo: 'categoria' | 'ubicacion' | 'deposito';
  valorSeleccionado: string;
  valor: number;
  afectarPrecio: 'venta' | 'compra' | 'ambos';
  userId: string;
}

interface ProductoModificado {
  id: string;
  nombre: string;
  precioAnterior: number;
  precioNuevo: number;
}

export class StockService {
  // Obtener datos para los selectores
  async obtenerFiltros(userId: string) {
    try {
      const resultado = await db
        .select({
          categorias: productos.categoria,
          ubicaciones: stockActual.localizacion,
          depositos: stockActual.deposito,
        })
        .from(productos)
        .innerJoin(stockActual,eq(stockActual.productoId,productos.id))
        .where(eq(productos.userId, userId));

      return {
        categorias: [...new Set(resultado.map(r => r.categorias))],
        ubicaciones: [...new Set(resultado.map(r => r.ubicaciones))],
        depositos: [...new Set(resultado.map(r => r.depositos))],
      };
    } catch (error) {
      console.error("Error al obtener filtros:", error);
      throw new Error("Error al obtener filtros");
    }
  }

  // Previsualizar cambios
  async previsualizarModificacion(params: ModificacionLoteParams): Promise<ProductoModificado[]> {
   
  }

  // Aplicar modificación
  async aplicarModificacion(params: ModificacionLoteParams): Promise<boolean> {

  }

  // Registrar historial de modificaciones (opcional)
  async registrarHistorial(params: ModificacionLoteParams, productosModificados: ProductoModificado[]) {
    // Implementar si se necesita un registro de cambios
  }
}
