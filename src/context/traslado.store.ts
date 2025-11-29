import { atom } from "nanostores";

// --- Átomos del Estado de Traslado ---

// Lista de productos seleccionados para el traslado
export const productosSeleccionadosTraslado = atom([]);

// Información del traslado (sucursal origen, destino, etc.)
export const infoTraslado = atom({
  sucursalOrigenId: null,
  sucursalDestinoId: null,
  observaciones: "",
});

// --- Acciones del Carrito de Traslado ---

/**
 * Agrega un producto al remito de traslado.
 * Si ya existe, incrementa la cantidad.
 * @param {Object} producto - El producto a trasladar.
 */
export function agregarProductoTraslado(producto: any) {
  const productos = productosSeleccionadosTraslado.get();
  const productoExistente = productos.find(
    (p) => p.codigoBarra === producto.codigoBarra
  );

  if (productoExistente) {
    sumarCantidadTraslado(producto.codigoBarra);
  } else {
    productosSeleccionadosTraslado.set([
      ...productos,
      {
        ...producto,
        cantidad: 1,
        // Snapshot de datos del producto al momento del traslado
        nombreSnapshot: producto.nombre,
        pVentaSnapshot: producto.pVenta,
        pCompraSnapshot: producto.pCompra,
      },
    ]);
  }
}

/**
 * Incrementa la cantidad de un producto en el remito.
 * @param {string} codigoBarra - Identificador del producto.
 */
export function sumarCantidadTraslado(codigoBarra) {
  const productos = productosSeleccionadosTraslado.get();
  const nuevosProductos = productos.map((p) =>
    p.codigoBarra === codigoBarra ? { ...p, cantidad: p.cantidad + 1 } : p
  );
  productosSeleccionadosTraslado.set(nuevosProductos);
}

/**
 * Resta la cantidad de un producto. Si llega a 0, lo elimina.
 * @param {string} codigoBarra - Identificador del producto.
 */
export function restarCantidadTraslado(codigoBarra) {
  const productos = productosSeleccionadosTraslado.get();

  const producto = productos.find((p) => p.codigoBarra === codigoBarra);

  if (producto && producto.cantidad <= 1) {
    eliminarProductoTraslado(codigoBarra);
  } else {
    const nuevosProductos = productos.map((p) =>
      p.codigoBarra === codigoBarra ? { ...p, cantidad: p.cantidad - 1 } : p
    );
    productosSeleccionadosTraslado.set(nuevosProductos);
  }
}

/**
 * Establece una cantidad específica para un producto.
 * @param {string} codigoBarra
 * @param {number} cantidad
 */
export function setCantidadTraslado(codigoBarra, cantidad) {
  const productos = productosSeleccionadosTraslado.get();
  const nuevaCantidad = Number(cantidad);

  if (nuevaCantidad <= 0) {
    eliminarProductoTraslado(codigoBarra);
    return;
  }

  const nuevosProductos = productos.map((p) =>
    p.codigoBarra === codigoBarra ? { ...p, cantidad: nuevaCantidad } : p
  );
  productosSeleccionadosTraslado.set(nuevosProductos);
}

/**
 * Elimina un producto del remito.
 * @param {string} codigoBarra
 */
export function eliminarProductoTraslado(codigoBarra) {
  const productos = productosSeleccionadosTraslado.get();
  const nuevosProductos = productos.filter(
    (p) => p.codigoBarra !== codigoBarra
  );
  productosSeleccionadosTraslado.set(nuevosProductos);
}

/**
 * Establece la información del traslado (sucursales, observaciones).
 * @param {Object} info
 */
export function setInfoTraslado(info) {
  infoTraslado.set({ ...infoTraslado.get(), ...info });
}

/**
 * Limpia todo el remito de traslado.
 */
export function limpiarRemitoTraslado() {
  productosSeleccionadosTraslado.set([]);
  infoTraslado.set({
    sucursalOrigenId: null,
    sucursalDestinoId: null,
    observaciones: "",
  });
}
