import { atom } from 'nanostores';

const reportPDF = atom({ cabecera: {}, columnas: [], arrayBody: [] });

const columnSelectTable = atom({ asc: true, seleccion: '' });

// Store para estadísticas del dashboard con estado inicial
const statsDashStore = atom({ loading: true, data: null, error: null });

const fetchStatsData = async (userId, empresaId) => {
  statsDashStore.set({ loading: true, data: null, error: null }); // Indicar que está cargando
  try {
    const response = await fetch('/api/statesDash/stadisticasDash', {
      headers: {
        'x-user-id': userId,
        'xx-empresa-id': empresaId,
      },
    });

    if (!response.ok) throw new Error('Error en la petición');

    const data = await response.json();
    statsDashStore.set({ loading: false, data, error: null });
  } catch (error) {
    console.error('Error fetching stats:', error);
    statsDashStore.set({ loading: false, data: null, error: error.message });
  }
};

const dataFormularioContexto = atom({
  isEdit: false,
});



const perfilProducto = atom({
  loading: true,
  data: {
    productData: {},
    stockMovimiento: [],
  },
  error: null,
});

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

const categoriasStore = atom({
  loading: true,
  data: null,
  error: null,
});

const rolesStore = atom({
  loading: true,
  data: { userDB: [], rolesDB: [] },
  error: null,
});

const fetchRolesData = async (userId) => {
  rolesStore.set({ loading: true, data: null, error: null });
  try {
    const response = await fetch('/api/users/getUsers', {
      headers: {
        'xx-user-id': userId,
      },
    });
    const data = await response.json();
    rolesStore.set({ loading: false, data: data.data, error: null });
  } catch (error) {
    console.error('Error fetching roles data:', error);
    rolesStore.set({
      loading: false,
      data: null,
      error: 'Error al cargar los roles',
    });
  }
};

const tiendaStore = atom({
  loading: true,
  data: { empresa: {}, productos: [], configuracionEmpresa: {} },
  error: null,
});

const fetchTiendaData = async (empresaId) => {
  tiendaStore.set({ loading: true, data: null, error: null });
  try {
    const response = await fetch(`/api/tienda/${empresaId}`, {
      headers: {
        'xx-empresa-id': empresaId,
      },
    });
    const data = await response.json();
    console.log('trayendo -> tiendaStore', data);
    tiendaStore.set({ loading: false, data: data.data, error: null });
  } catch (error) {
    console.error('Error fetching tienda data:', error);
    tiendaStore.set({
      loading: false,
      data: null,
      error: 'Error al cargar los datos de tienda',
    });
  }
};

const usuarioActivo = atom({});

// Store para el carrito de compras
const IVA = 0.21;

function compararOpciones(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;

  const clavesA = Object.keys(a).sort();
  const clavesB = Object.keys(b).sort();

  if (clavesA.length !== clavesB.length) return false;

  return clavesA.every((key) => a[key] === b[key]);
}

const carritoStore = atom({
  items: [],
  subtotal: 0,
  descuento: 0,
  envio: 0,
  impuestos: 0,
  total: 0,
  cupon: null,
  isOpen: false,
  direccionEnvio: null,
  metodoPago: null,
  ultimaActualizacion: null,
});

// // Suscripción para depuración
// carritoStore.subscribe((state) => {
//   console.log('Estado actual del carrito:', state);
//   if (typeof window !== 'undefined') {
//     localStorage.setItem('carrito', JSON.stringify(state));
//   }
// });

// Cargar estado inicial desde localStorage
if (typeof window !== 'undefined') {
  const carritoGuardado = localStorage.getItem('carrito');
  if (carritoGuardado) {
    try {
      const parsed = JSON.parse(carritoGuardado);
      carritoStore.set(parsed);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }
  }
}

export {
  rolesStore,
  fetchRolesData,
  perfilProducto,
  fetchProducto,
  columnSelectTable,
  dataFormularioContexto,
  reportPDF,
  usuarioActivo,
  statsDashStore,
  fetchStatsData,
  tiendaStore,
  fetchTiendaData,
  carritoStore,
  categoriasStore,
};
