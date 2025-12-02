import React from "react";
import { ShoppingCart, Phone, MapPin } from "lucide-react";
import { cart, toggleCart } from "../../context/cart.store";
import { useStore } from "@nanostores/react";

export default function CatalogoLayout({ empresa, children }) {
  const $cart = useStore(cart);
  const totalItems = $cart.items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {empresa.srcLogo ? (
              <img
                src={empresa.srcLogo}
                alt={empresa.nombreFantasia}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {empresa.nombreFantasia?.charAt(0) || "E"}
              </div>
            )}
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">
                {empresa.nombreFantasia || empresa.razonSocial}
              </h1>
              {empresa.telefono && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone size={10} /> {empresa.telefono}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={toggleCart}
            className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-8 text-center text-gray-500 text-sm">
        <p>
          © {new Date().getFullYear()} {empresa.nombreFantasia}
        </p>
        <p className="mt-1 text-xs">Powered by ControlStock</p>
      </footer>
    </div>
  );
}
