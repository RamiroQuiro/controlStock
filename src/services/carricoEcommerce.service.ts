// En src/services/carricoEcommerce.service.ts
import { carritoStore } from '../context/store';

const IVA = 0.21;

function calcularTotales(items: any) {
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + item.pVenta * item.cantidad,
    0
  );
  const descuento =
    items.cupon?.tipo === 'porcentaje'
      ? subtotal * (items.cupon.descuento / 100)
      : Math.min(items.cupon?.valor || 0, subtotal);

  const impuestos = (subtotal - descuento) * IVA;
  const total = subtotal - descuento + impuestos + (items.envio || 0);

  carritoStore.set({
    ...carritoStore.get(),
    subtotal,
    descuento,
    impuestos,
    total,
    ultimaActualizacion: new Date().toISOString(),
  });
}

function compararOpciones(op1: any, op2: any) {
  return JSON.stringify(op1 || {}) === JSON.stringify(op2 || {});
}

export const carritoService = {
  agregarItem: (item: any, cantidad = 1, prevArray: []) => {
    const existenteIndex = prevArray.findIndex(
      (i: any) =>
        i.id === item.id && compararOpciones(i.opciones, item.opciones)
    );
    if (existenteIndex >= 0) {
      prevArray[existenteIndex].cantidad += cantidad;
    } else {
      prevArray.push({
        ...item,
        cantidad,
        agregadoEl: new Date().toISOString(),
      });
    }

    calcularTotales(prevArray);
    carritoStore.set({
      ...carritoStore.get(),
      items: prevArray,
      ultimaActualizacion: new Date().toISOString(),
    });
  },

  restarItem: (itemId: string, prevArray: []) => {
    // Primero, verificar si el item existe
    const itemIndex = prevArray.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      return;
    }
    // Crear una nueva copia del array sin mutar el original
    const updatedArray = prevArray.map((item) => {
      if (item.id === itemId) {
        // Si la cantidad es 1, no devolvemos este item
        if (item.cantidad === 1) {
          return null;
        }
        // Si la cantidad es mayor a 1, restamos 1
        return {
          ...item,
          cantidad: item.cantidad - 1,
        };
      }
      return item;
    });
    // Filtrar los items null (cuando cantidad era 1)
    const finalArray = updatedArray.filter(
      (item): item is typeof item => item !== null
    );

    carritoStore.set({
      ...carritoStore.get(),
      items: finalArray,
      ultimaActualizacion: new Date().toISOString(),
    });
  },

  eliminarItem: (itemId: string, prevArray: []) => {
    prevArray = prevArray.filter((item) => item.id !== itemId);
    carritoStore.set({
      ...carritoStore.get(),
      items: prevArray,
      ultimaActualizacion: new Date().toISOString(),
    });
  },

  actualizarCantidad: (
    itemId: string,
    cantidad: number,
    opciones: any = {}
  ) => {
    if (cantidad <= 0) {
      carritoService.eliminarItem(itemId, opciones);
      return;
    }

    carritoStore.set((state) => {
      const items = state.items.map((item) =>
        item.id === itemId && compararOpciones(item.opciones, opciones)
          ? { ...item, cantidad }
          : item
      );

      return {
        ...state,
        items,
        ...calcularTotales({ ...state, items }),
        ultimaActualizacion: new Date().toISOString(),
      };
    });
  },

  aplicarCupon: (
    codigo: string,
    descuento: number,
    tipo: 'porcentaje' | 'fijo'
  ) => {
    carritoStore.set((state) => {
      const cupon = { codigo, descuento, tipo };
      return {
        ...state,
        cupon,
        ...calcularTotales({ ...state, cupon }),
        ultimaActualizacion: new Date().toISOString(),
      };
    });
  },

  vaciarCarrito: () => {
    carritoStore.set({
      items: [],
      subtotal: 0,
      descuento: 0,
      envio: 0,
      impuestos: 0,
      total: 0,
      cupon: null,
      direccionEnvio: null,
      metodoPago: null,
      ultimaActualizacion: new Date().toISOString(),
    });
  },
};
