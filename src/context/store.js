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


const usuarioActivo = atom({});
export {
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
