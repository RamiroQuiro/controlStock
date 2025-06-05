// En src/services/carricoEcommerce.service.ts
import { carritoStore } from "../context/store";

const IVA = 0.21;

function calcularTotales(state: any) {
  const subtotal = state.items.reduce((sum: number, item: any) => 
    sum + (item.precio * item.cantidad), 0
  );

  const descuento = state.cupon?.tipo === 'porcentaje'
    ? subtotal * (state.cupon.descuento / 100)
    : Math.min(state.cupon?.valor || 0, subtotal);

  const impuestos = (subtotal - descuento) * IVA;
  const total = subtotal - descuento + impuestos + (state.envio || 0);

  return { subtotal, descuento, impuestos, total };
}

function compararOpciones(op1: any, op2: any) {
  return JSON.stringify(op1 || {}) === JSON.stringify(op2 || {});
}

export const carritoService = {
  agregarItem: (item: any, cantidad = 1) => {
    carritoStore.set((state) => {
      const existenteIndex = state.items.findIndex(i => 
        i.id === item.id && compararOpciones(i.opciones, item.opciones)
      );

      const items = [...state.items];
      if (existenteIndex >= 0) {
        items[existenteIndex].cantidad += cantidad;
      } else {
        items.push({ ...item, cantidad, agregadoEl: new Date().toISOString() });
      }

      return {
        ...state,
        items,
        ...calcularTotales({ ...state, items }),
        ultimaActualizacion: new Date().toISOString()
      };
    });
  },

  eliminarItem: (itemId: string, opciones: any = {}) => {
    carritoStore.set((state) => {
      const items = state.items.filter(item => 
        !(item.id === itemId && compararOpciones(item.opciones, opciones))
      );
      
      return {
        ...state,
        items,
        ...calcularTotales({ ...state, items }),
        ultimaActualizacion: new Date().toISOString()
      };
    });
  },

  actualizarCantidad: (itemId: string, cantidad: number, opciones: any = {}) => {
    if (cantidad <= 0) {
      carritoService.eliminarItem(itemId, opciones);
      return;
    }

    carritoStore.set((state) => {
      const items = state.items.map(item => 
        item.id === itemId && compararOpciones(item.opciones, opciones)
          ? { ...item, cantidad }
          : item
      );

      return {
        ...state,
        items,
        ...calcularTotales({ ...state, items }),
        ultimaActualizacion: new Date().toISOString()
      };
    });
  },

  aplicarCupon: (codigo: string, descuento: number, tipo: 'porcentaje' | 'fijo') => {
    carritoStore.set((state) => {
      const cupon = { codigo, descuento, tipo };
      return {
        ...state,
        cupon,
        ...calcularTotales({ ...state, cupon }),
        ultimaActualizacion: new Date().toISOString()
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
      ultimaActualizacion: new Date().toISOString()
    });
  }
};