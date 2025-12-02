import React from "react";
import { ShoppingCart } from "lucide-react";
import { useStore } from "@nanostores/react";
import { cart } from "../../context/cart.store";

export default function CatalogoLayoutMinimal({ empresa, children }) {
  const $cart = useStore(cart);
  const totalItems = $cart.items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Header Minimalista */}
      <header className="py-12 px-4 text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto relative">
          <h1 className="text-3xl md:text-4xl font-light tracking-widest uppercase mb-2">
            {empresa.nombreFantasia || empresa.razonSocial}
          </h1>
          {empresa.telefono && (
            <p className="text-sm text-gray-400 tracking-wide">
              PEDIDOS: {empresa.telefono}
            </p>
          )}

          <button
            onClick={toggleCart}
            className="absolute top-0 right-0 p-2 hover:bg-gray-50 rounded-full transition-colors group"
          >
            <ShoppingCart
              size={24}
              className="text-gray-800 group-hover:text-black"
              strokeWidth={1.5}
            />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">{children}</main>

      {/* Footer Minimal */}
      <footer className="py-12 text-center text-xs text-gray-400 uppercase tracking-widest">
        <p>
          © {new Date().getFullYear()} {empresa.nombreFantasia}
        </p>
      </footer>
    </div>
  );
}
