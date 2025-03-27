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

const dataFormularioContexto = atom({});

const productosSeleccionadosVenta=atom([])

const usuarioActivo = atom({});
export {
  productosSeleccionadosVenta,
  busqueda,
  columnSelectTable,
  dataFormularioContexto,
  filtroBusqueda,
  reportPDF,
  usuarioActivo,
  statsDashStore
};
