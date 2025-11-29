import { atom } from "nanostores";

// --- Átomos del Estado de Compra ---

// Lista de productos seleccionados en el carrito de compra
export const productosSeleccionadosCompra = atom([]);

// --- Acciones del Carrito de Compra ---

/**
 * Agrega un producto al carrito de compra.
 * Si ya existe, incrementa la cantidad.
 * @param {Object} producto - El producto a agregar.
 */
export function agregarProductoCompra(producto) {
  const productos = productosSeleccionadosCompra.get();
  const productoExistente = productos.find(
    (p) => p.codigoBarra === producto.codigoBarra
  );

  if (productoExistente) {
    // Si el producto ya existe, incrementamos su cantidad
    sumarCantidadCompra(producto.codigoBarra);
  } else {
    // Si es nuevo, lo agregamos con cantidad 1
    // Aseguramos que tenga pCompra (costo)
    productosSeleccionadosCompra.set([
      ...productos,
      {
        ...producto,
        cantidad: 1,
        pCompra: producto.pCompra || 0, // Asegurar costo
      },
    ]);
  }
}

/**
 * Incrementa la cantidad de un producto en el carrito.
 * @param {string} codigoBarra - Identificador del producto.
 */
export function sumarCantidadCompra(codigoBarra) {
  const productos = productosSeleccionadosCompra.get();
  const nuevosProductos = productos.map((p) =>
    p.codigoBarra === codigoBarra ? { ...p, cantidad: p.cantidad + 1 } : p
  );
  productosSeleccionadosCompra.set(nuevosProductos);
}

/**
 * Resta la cantidad de un producto. Si llega a 0, lo elimina.
 * @param {string} codigoBarra - Identificador del producto.
 */
export function restarCantidadCompra(codigoBarra) {
  const productos = productosSeleccionadosCompra.get();

  const producto = productos.find((p) => p.codigoBarra === codigoBarra);

  if (producto && producto.cantidad <= 1) {
    eliminarProductoCompra(codigoBarra);
  } else {
    const nuevosProductos = productos.map((p) =>
      p.codigoBarra === codigoBarra ? { ...p, cantidad: p.cantidad - 1 } : p
    );
    productosSeleccionadosCompra.set(nuevosProductos);
  }
}

/**
 * Establece una cantidad específica para un producto.
 * @param {string} codigoBarra
 * @param {number} cantidad
 */
export function setCantidadCompra(codigoBarra, cantidad) {
  const productos = productosSeleccionadosCompra.get();
  const nuevaCantidad = Number(cantidad);

  if (nuevaCantidad <= 0) {
    eliminarProductoCompra(codigoBarra);
    return;
  }

  const nuevosProductos = productos.map((p) =>
    p.codigoBarra === codigoBarra ? { ...p, cantidad: nuevaCantidad } : p
  );
  productosSeleccionadosCompra.set(nuevosProductos);
}

/**
 * Elimina un producto del carrito.
 * @param {string} codigoBarra
 */
export function eliminarProductoCompra(codigoBarra) {
  const productos = productosSeleccionadosCompra.get();
  const nuevosProductos = productos.filter(
    (p) => p.codigoBarra !== codigoBarra
  );
  productosSeleccionadosCompra.set(nuevosProductos);
}

/**
 * Limpia todo el carrito de compras.
 */
export function limpiarCarritoCompra() {
  productosSeleccionadosCompra.set([]);
}
