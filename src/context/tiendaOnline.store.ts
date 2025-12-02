import { atom } from "nanostores";

export const carritoStore = atom({
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
if (typeof window !== "undefined") {
  const carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
    try {
      const parsed = JSON.parse(carritoGuardado);
      carritoStore.set(parsed);
    } catch (error) {
      console.error("Error al cargar el carrito:", error);
    }
  }
}
