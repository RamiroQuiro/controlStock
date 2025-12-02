import React from "react";
import { ShoppingCart, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { useStore } from "@nanostores/react";
import { cart, toggleCart } from "../../context/cart.store";

export default function CatalogoLayoutModerna({ empresa, children }) {
  const $cart = useStore(cart);
  const totalItems = $cart.items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar Moderno */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo / Nombre */}
            <div className="flex items-center gap-3">
              {empresa.srcLogo ? (
                <img
                  src={empresa.srcLogo}
                  alt={empresa.nombreFantasia}
                  className="w-12 h-12 rounded-xl object-cover shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {empresa.nombreFantasia?.charAt(0) || "E"}
                </div>
              )}
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                {empresa.nombreFantasia || empresa.razonSocial}
              </span>
            </div>

            {/* Carrito Button */}
            <button
              onClick={toggleCart}
              className="relative p-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all hover:scale-105 shadow-lg shadow-gray-900/20"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            {empresa.nombreFantasia || "Bienvenido a nuestra tienda"}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Descubre nuestros productos y realiza tu pedido directamente por
            WhatsApp.
          </p>
          {empresa.telefono && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <Phone size={18} />
              <span className="font-medium">{empresa.telefono}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 min-h-[500px]">
          {children}
        </div>
      </main>

      {/* Footer Moderno */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Sobre Nosotros</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Ofrecemos los mejores productos con la mejor atención.
                Contáctanos para cualquier consulta.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contacto</h3>
              <ul className="space-y-3 text-gray-500 text-sm">
                {empresa.direccion && (
                  <li className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    {empresa.direccion}
                  </li>
                )}
                {empresa.telefono && (
                  <li className="flex items-center gap-2">
                    <Phone size={16} className="text-blue-600" />
                    {empresa.telefono}
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Síguenos</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>
              © {new Date().getFullYear()} {empresa.nombreFantasia}. Todos los
              derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
