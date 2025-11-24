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
  descripcion: string;
  pCompra: number;
  pVenta: number;
  srcPhoto: string;
  totalVentas: number;
  ultimaActualizacion: string;
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

export const fetchListadoProductos = async (
  empresaId: string,
  page = 0,
  limit = 20,
  search = ""
) => {
  // 🎯 OPTIMIZACIÓN: No borrar data al buscar para evitar "parpadeo"
  // Solo marcamos loading. Si es page 0, reemplazaremos al final.
  stockStore.setKey("loading", true);

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      query: search,
    });

    const response = await fetch(
      `/api/stock/productos?${queryParams.toString()}`,
      {
        headers: {
          "xx-empresa-id": empresaId,
        },
      }
    );

    const data = await response.json();

    // Si es paginación, concatenamos. Si es búsqueda nueva, reemplazamos.
    const currentProducts = page === 0 ? [] : stockStore.get().productos;

    stockStore.set({
      loading: false,
      productos: [...currentProducts, ...data.data.productosDB],
      totalProductos: data.data.totalProductos,
      paginacion: data.data.paginacion,
      error: null,
    });

    return data;
  } catch (error) {
    console.error("Error fetching productos básicos:", error);
    stockStore.set({
      loading: false,
      productos: [],
      totalProductos: 0,
      paginacion: null,
      error: "Error al cargar los productos",
    });
  }
};

// export const fetchStockCompleto = async (
//   empresaId: string,
//   page = 0,
//   limit = 20
// ) => {
//   stockCompletoStore.set({ loading: true, data: [], error: null });

//   try {
//     const response = await fetch(
//       `/api/stock/completo?page=${page}&limit=${limit}`,
//       {
//         headers: {
//           "xx-empresa-id": empresaId,
//         },
//       }
//     );

//     const data = await response.json();
//     stockCompletoStore.set({ loading: false, data: data.data, error: null });

//     return data;
//   } catch (error) {
//     console.error("Error fetching stock completo:", error);
//     stockCompletoStore.set({
//       loading: false,
//       data: [],
//       error: "Error al cargar los datos de stock",
//     });
//   }
// };
