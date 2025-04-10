import { atom } from 'nanostores';

const busqueda = atom({
  productosBuscados: null,
});

const filtroBusqueda = atom({
  filtro: '',
});
const reportPDF = atom({ cabecera: {}, columnas: [], arrayBody: [] });

const columnSelectTable = atom({ asc: true, seleccion: '' });

// Store para estadísticas del dashboard con estado inicial
const statsDashStore = atom({ loading: true, data: null, error: null });

const fetchStatsData = async (userId) => {
  statsDashStore.set({ loading: true, data: null, error: null }); // Indicar que está cargando
  try {
    const response = await fetch('/api/statesDash/stadisticasDash', {
      headers: {
        'x-user-id': userId
      }
    });

    if (!response.ok) throw new Error('Error en la petición');

    const data = await response.json();
    statsDashStore.set({ loading: false, data, error: null });
  } catch (error) {
    console.error('Error fetching stats:', error);
    statsDashStore.set({ loading: false, data: null, error: error.message });
  }
};

const dataFormularioContexto = atom({});

const productosSeleccionadosVenta=atom([])

export const stockStore = atom({
  loading: true,
  data: null,
  error: null
});

export const fetchStockData = async (userId ) => {
  stockStore.set({ loading: true, data: null, error: null });
  try {
    const response = await fetch('/api/stock/statistStock', {
      headers: {
        'x-user-id': userId
      }
    });
    const data = await response.json();
    stockStore.set({ loading: false, data, error: null });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    stockStore.set({ 
      loading: false, 
      data: null, 
      error: 'Error al cargar los datos de stock'
    });
  }
};



const perfilProducto=atom({
  loading:true,
  data:{
    productData:{},
    stockMovimiento:[]
  },
  error:null
})


const fetchProducto = async (productoId) => {
  if (!productoId) return;

  perfilProducto.set({ loading: true, data: null, error: null });

  try {
    const res = await fetch(`/api/productos/infoProduct/${productoId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Atencion-Id': productoId,
      },
    });

    if (!res.ok) throw new Error('Error al obtener el producto');

    const data = await res.json();
    perfilProducto.set({
      loading: false,
      data: data.data,
      error: null,
    });
  } catch (err) {
    perfilProducto.set({
      loading: false,
      data: null,
      error: err.message,
    });
  }
};

const usuarioActivo = atom({});
export {
  perfilProducto,
  fetchProducto,
  productosSeleccionadosVenta,
  busqueda,
  columnSelectTable,
  dataFormularioContexto,
  filtroBusqueda,
  reportPDF,
  usuarioActivo,
  statsDashStore,
  fetchStatsData
};
