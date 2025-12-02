import React from "react";
import Button3 from "../../../../components/atomos/Button3";
import { useStore } from "@nanostores/react";
import { carritoStore } from "../../../../context/tiendaOnline.store";
import { Trash2, Plus, Minus, CarTaxiFront, ShoppingCart } from "lucide-react";
import CardProductoCarritoEcommerceCostado from "./CardProductoCarritoEcommerceCostado";
import { carritoService } from "../../../../services/carricoEcommerce.service";
export default function CarritoCostadoDetalles() {
  const $carritoStore = useStore(carritoStore);
  const isOpen = $carritoStore.isOpen;

  const getTotalItems = () =>
    $carritoStore.items.reduce((sum, item) => sum + item.cantidad, 0);
  const getSubtotal = () =>
    $carritoStore.items.reduce(
      (sum, item) => sum + item.pVenta * item.cantidad,
      0
    );
  const getTotal = () =>
    getSubtotal() + $carritoStore.envio + $carritoStore.impuestos;

  const handleCantidad = (itemId, cantidad) => {
    const item = $carritoStore.items.find((i) => i.id === itemId);
    if (item) {
      carritoStore.set({
        ...$carritoStore,
        items: $carritoStore.items.map((i) =>
          i.id === itemId ? { ...i, cantidad: cantidad } : i
        ),
      });
    }
  };

  if ($carritoStore.items.length === 0) return null;

  return (
    <div
      className={`fixed top-0 right-0 w-full md:w-3/4 lg:w-1/3 h-screen bg-white border-l border-primary-100 z-[9999] transform transition-transform transition-shadow duration-300 ${isOpen ? "translate-x-0 shadow-[-10px_0px_100px_0px_rgba(0,0,0,0.5)]" : "translate-x-full"}`}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="text-primary-100 px-6 py-4 border-b w-full inline-flex items-center justify-start gap-2 border-gray-200">
          <h2 className="text-xl font-semibold">Carrito de Compras</h2>
          <ShoppingCart className="w-6 h-6" />
        </div>

        {/* Items */}
        <CardProductoCarritoEcommerceCostado $carritoStore={$carritoStore} />

        {/* Resumen */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${getSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>${$carritoStore.envio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (21%)</span>
              <span>${$carritoStore.impuestos.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex  gap-2">
            <Button3
              onClick={() =>
                carritoStore.set({ ...$carritoStore, isOpen: false })
              }
              className="w-1/2 bg-gray-200 hover:bg-gray-300 text-primary-texto"
            >
              Continuar Comprando
            </Button3>
            <Button3
              onClick={() => console.log("Ir a Pago")}
              className="w-1/2 bg-primary-100 hover:bg-primary-500 text-white hover:text-primary-textoTitle duration-300"
            >
              Proceder al Pago
            </Button3>
          </div>
        </div>
      </div>
    </div>
  );
}
