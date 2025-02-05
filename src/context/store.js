import { atom } from 'nanostores';

const busqueda = atom({
  pacienteSelect: '',
});

const filtroBusqueda = atom({
  filtro: '',
});
const reportPDF = atom({ cabecera: {}, columnas: [], arrayBody: [] });

const columnSelectTable = atom({ asc: true, seleccion: '' });


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
};
