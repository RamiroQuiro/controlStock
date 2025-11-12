import { atom } from 'nanostores';

export const busqueda = atom({
  productosBuscados: null,
});

export const filtroBusqueda = atom({
  filtro: '',
});

export const productosSeleccionadosVenta = atom([]);


// --- Acciones del Carrito de Venta ---

export function agregarProductoVenta(producto) {
  const productos = productosSeleccionadosVenta.get();
  const productoExistente = productos.find(
    (p) => p.codigoBarra === producto.codigoBarra
  );

  if (productoExistente) {
    // Si el producto ya existe, simplemente incrementamos su cantidad
    sumarCantidad(producto.codigoBarra);
  } else {
    // Si es un producto nuevo, lo añadimos al array con cantidad 1
    productosSeleccionadosVenta.set([...productos, { ...producto, cantidad: 1 }]);
  }
}

export function sumarCantidad(codigoBarra) {
  const productos = productosSeleccionadosVenta.get();
  const nuevosProductos = productos.map((p) =>
    p.codigoBarra === codigoBarra ? { ...p, cantidad: p.cantidad + 1 } : p
  );
  productosSeleccionadosVenta.set(nuevosProductos);
}

export function restarCantidad(codigoBarra) {
  const productos = productosSeleccionadosVenta.get();
  
  const producto = productos.find(p => p.codigoBarra === codigoBarra);

  // Si la cantidad es 1, al restar se elimina el producto
  if (producto && producto.cantidad <= 1) {
    eliminarProducto(codigoBarra);
  } else {
    const nuevosProductos = productos.map((p) =>
      p.codigoBarra === codigoBarra ? { ...p, cantidad: p.cantidad - 1 } : p
    );
    productosSeleccionadosVenta.set(nuevosProductos);
  }
}

export function eliminarProducto(codigoBarra) {
  const productos = productosSeleccionadosVenta.get();
  const nuevosProductos = productos.filter((p) => p.codigoBarra !== codigoBarra);
  productosSeleccionadosVenta.set(nuevosProductos);
}