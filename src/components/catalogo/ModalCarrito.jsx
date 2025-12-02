import React from "react";
import { useStore } from "@nanostores/react";

import { X, Trash2, MessageCircle, Minus, Plus } from "lucide-react";
import { formateoMoneda } from "../../utils/formateoMoneda";
import {
  cart,
  toggleCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../context/cart.store";

export default function ModalCarrito({ telefonoEmpresa }) {
  const $cart = useStore(cart);

  if (!$cart.isOpen) return null;

  const total = $cart.items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const handleWhatsAppCheckout = () => {
    if (!telefonoEmpresa) {
      alert(
        "La empresa no tiene un teléfono configurado para recibir pedidos."
      );
      return;
    }

    let mensaje = `Hola! Quiero realizar el siguiente pedido:\n\n`;
    $cart.items.forEach((item) => {
      mensaje += `• ${item.cantidad}x ${item.nombre} - ${formateoMoneda.format(
        item.precio * item.cantidad
      )}\n`;
    });
    mensaje += `\n*Total: ${formateoMoneda.format(total)}*`;
    mensaje += `\n\nQuedo a la espera de la confirmación. Gracias!`;

    const url = `https://wa.me/${telefonoEmpresa}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity"
        onClick={toggleCart}
      />

      {/* Modal Content */}
      <div className="bg-white w-full max-w-md sm:rounded-xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] animate-slide-up sm:animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50 sm:rounded-t-xl">
          <h2 className="font-bold text-lg text-gray-800">Tu Pedido</h2>
          <button
            onClick={toggleCart}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {$cart.items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Tu carrito está vacío</p>
              <button
                onClick={toggleCart}
                className="mt-4 text-blue-600 font-medium hover:underline"
              >
                Ver productos
              </button>
            </div>
          ) : (
            $cart.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                {/* Imagen pequeña opcional */}
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-900">
                    {item.nombre}
                  </h3>
                  <div className="text-blue-600 font-bold text-sm mt-1">
                    {formateoMoneda.format(item.precio * item.cantidad)}
                  </div>
                </div>

                {/* Controles cantidad */}
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1 h-fit">
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                    className="p-1 hover:bg-white rounded-md transition-colors text-gray-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-medium w-4 text-center">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                    className="p-1 hover:bg-white rounded-md transition-colors text-gray-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {$cart.items.length > 0 && (
          <div className="p-4 border-t bg-gray-50 sm:rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total estimado</span>
              <span className="text-xl font-bold text-gray-900">
                {formateoMoneda.format(total)}
              </span>
            </div>
            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
            >
              <MessageCircle size={20} />
              Enviar Pedido por WhatsApp
            </button>
            <p className="text-center text-xs text-gray-500 mt-3">
              El pedido se enviará como un mensaje de WhatsApp para coordinar el
              pago y la entrega.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
