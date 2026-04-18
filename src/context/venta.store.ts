import { atom } from "nanostores";
import type { Producto } from "../types";

export interface ProductoCarrito extends Producto {
  cantidad: number;
}

export const busqueda = atom({
  productosBuscados: null,
});

export const filtroBusqueda = atom({
  filtro: "",
});

export const productosSeleccionadosVenta = atom<ProductoCarrito[]>([]);

// --- Acciones del Carrito de Venta ---

export function agregarProductoVenta(producto: Producto, cantidad: number = 1) {
  const productos = productosSeleccionadosVenta.get();
  const productoExistente = productos.find(
    (p) => p.codigoBarra === producto.codigoBarra
  );

  if (productoExistente) {
    // Si el producto ya existe, sumamos la cantidad (puede ser 1 o el peso de la balanza)
    sumarCantidad(producto.codigoBarra, cantidad);
  } else {
    // Si es un producto nuevo, lo añadimos al array con la cantidad especificada
    productosSeleccionadosVenta.set([
      ...productos,
      { ...producto, cantidad: cantidad } as ProductoCarrito,
    ]);
  }
}

export function sumarCantidad(codigoBarra: string, cantidad: number = 1) {
  const productos = productosSeleccionadosVenta.get();
  const nuevosProductos = productos.map((p) =>
    p.codigoBarra === codigoBarra ? { ...p, cantidad: p.cantidad + cantidad } : p
  );
  productosSeleccionadosVenta.set(nuevosProductos);
}

export function restarCantidad(codigoBarra: string) {
  const productos = productosSeleccionadosVenta.get();

  const producto = productos.find((p) => p.codigoBarra === codigoBarra);

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

export function eliminarProducto(codigoBarra: string) {
  const productos = productosSeleccionadosVenta.get();
  const nuevosProductos = productos.filter(
    (p) => p.codigoBarra !== codigoBarra
  );
  productosSeleccionadosVenta.set(nuevosProductos);
}

export function setCantidad(codigoBarra: string, cantidad: string | number) {
  const productos = productosSeleccionadosVenta.get();
  
  // Normalizamos el valor: convertimos coma en punto para que Number() lo entienda
  const valorLimpio = cantidad.toString().replace(",", ".");
  const nuevaCantidad = cantidad === "" ? 0 : Number(valorLimpio);

  // Si no es un número válido (ej: solo pusieron un punto o coma), no actualizamos o ponemos 0
  if (isNaN(nuevaCantidad)) return;

  const nuevosProductos = productos.map((p) =>
    p.codigoBarra === codigoBarra ? { ...p, cantidad: nuevaCantidad } : p
  );
  productosSeleccionadosVenta.set(nuevosProductos);
}

export function limpiarVenta() {
  productosSeleccionadosVenta.set([]);
  busqueda.set({ productosBuscados: null });
  filtroBusqueda.set({ filtro: "" });
}
