import { atom, map } from "nanostores";
import { statsDashStore } from "./store";

interface StockStore {
  loading: boolean;
  productos: Productos[];
  totalProductos: number;
  paginacion: any | null;
  error: string | null;
}

interface Productos {
  id: string;
  codigoBarra: string;
  descripcion:string;
  pCompra:number;
  pVenta:number;
  srcPhoto:string;
  totalVentas:number;
  ultimaActualizacion:string;
  nombre: string;
  precio: number;
  stock: number;
}

export const stockStore = map<StockStore>({
  loading: true,
  productos: [],
  totalProductos: 0,
  paginacion: null,
  error: null,
});


// Store de estadísticas (carga secundaria)
export const stockStatsStore = map({
  loading: false,
  stats: null,
  filtros: null,
  datosAdicionales: null,
  error: null,
});


export const fetchListadoProductos = async (empresaId:string, page = 0, limit = 20) => {
  stockStore.set({ 
    loading: true, 
    productos: [], 
    totalProductos: 0, 
    paginacion: null, 
    error: null 
  });

  try {
    const response = await fetch(`/api/stock/productos?page=${page}&limit=${limit}`, {
      headers: {
        'xx-empresa-id': empresaId,
      },
    });
    
    const data = await response.json();
    stockStore.set({
      loading: false,
      productos: data.data.productosDB,
      totalProductos: data.data.totalProductos[0].cantidad,
      paginacion: data.data.paginacion,
      error: null,
    });

    return data;
  } catch (error) {
    console.error('Error fetching productos básicos:', error);
    stockStore.set({
      loading: false,
      productos: [],
      totalProductos: 0,
      paginacion: null,
      error: 'Error al cargar los productos',
    });
  }
};

/**
 * 📊 CARGA SECUNDARIA - Estadísticas y datos pesados
 */
// export const fetchEstadisticasStock = async (empresaId: string) => {
//   stockStatsStore.set({ 
//     loading: true, 
//     stats: null, 
//     filtros: null, 
//     datosAdicionales: null, 
//     error: null 
//   });

//   try {
//     const response = await fetch('/api/stock/estadisticas', {
//       headers: {
//         'xx-empresa-id': empresaId,
//       },
//     });
    
//     const data = await response.json();
    
//     stockStatsStore.set({
//       loading: false,
//       stats: data.stats,
//       filtros: data.filtros,
//       datosAdicionales: data.datosAdicionales,
//       error: null,
//     });

//     return data;
//   } catch (error) {
//     console.error('Error fetching estadísticas:', error);
//     stockStatsStore.set({
//       loading: false,
//       stats: null,
//       filtros: null,
//       datosAdicionales: null,
//       error: 'Error al cargar las estadísticas',
//     });
//   }
// };
export const fetchStatsStock = async (userId:string, empresaId:string) => {
  statsDashStore.set({ loading: true, data: null, error: null }); // Indicar que está cargando
  try {
  const response = await fetch('/api/stock/statistStock', {
      headers: {
        'x-user-id': userId,
        'xx-empresa-id': empresaId,
      },
    });
    if (!response.ok) throw new Error('Error en la petición');

    const data = await response.json();
    
    stockStatsStore.set({
      loading: false,
      stats: data.data.stats,
      filtros: data.data.filtros,
      datosAdicionales: data.data.datosAdicionales,
      error: null,
    });

    return data;
  } catch (error) {
    console.error('Error fetching estadísticas:', error);
    stockStatsStore.set({
      loading: false,
      stats: null,
      filtros: null,
      datosAdicionales: null,
      error: 'Error al cargar las estadísticas',
    });
  }
};
/**
 * 🔄 CARGA COMPLETA (para compatibilidad)
 */
export const fetchStockCompleto = async (empresaId:string, page = 0, limit = 20) => {
  stockCompletoStore.set({ loading: true, data: [], error: null });
  
  try {
    const response = await fetch(`/api/stock/completo?page=${page}&limit=${limit}`, {
      headers: {
        'xx-empresa-id': empresaId,
      },
    });
    
    const data = await response.json();
    stockCompletoStore.set({ loading: false, data: data.data, error: null });
    
    return data;
  } catch (error) {
    console.error('Error fetching stock completo:', error);
    stockCompletoStore.set({
      loading: false,
      data: [],
      error: 'Error al cargar los datos de stock',
    });
  }
};