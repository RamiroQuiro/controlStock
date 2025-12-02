import React, { useState, useMemo } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { addToCart } from "../../context/cart.store";
import { formateoMoneda } from "../../utils/formateoMoneda";

export default function ListaProductos({ productos, categorias = [] }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideBusqueda = p.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      const coincideCategoria =
        categoriaSeleccionada === "todas" ||
        p.categoria === categoriaSeleccionada || // Si es string
        p.categoriaId === categoriaSeleccionada; // Si es ID

      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  // Obtener categorías únicas de los productos si no se pasan explícitamente
  const categoriasDisponibles = useMemo(() => {
    if (categorias.length > 0) return categorias;

    // Fallback: extraer de productos si no hay tabla categorias
    const cats = new Set(productos.map((p) => p.categoria).filter(Boolean));
    return Array.from(cats).map((c) => ({ id: c, nombre: c }));
  }, [categorias, productos]);

  return (
    <div>
      {/* Buscador y Filtros */}
      <div className="mb-8 space-y-4">
        {/* Buscador */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        </div>

        {/* Categorías (Pills) */}
        {categoriasDisponibles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaSeleccionada("todas")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoriaSeleccionada === "todas"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Todas
            </button>
            {categoriasDisponibles.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaSeleccionada(cat.nombre)} // Usamos nombre para filtrar por ahora si p.categoria es string
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoriaSeleccionada === cat.nombre
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productosFiltrados.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
          >
            <div className="aspect-square bg-gray-50 relative overflow-hidden">
              {producto.srcImagen ? (
                <img
                  src={producto.srcImagen}
                  alt={producto.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                  <span className="text-4xl">📦</span>
                </div>
              )}
              {/* Badge de Stock (Opcional) */}
              {producto.stock <= 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                    Agotado
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="mb-2">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 leading-tight">
                  {producto.nombre}
                </h3>
                {producto.categoria && (
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    {producto.categoria}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {producto.descripcion}
              </p>

              <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="font-bold text-gray-900 text-lg">
                  {formateoMoneda.format(producto.precio)}
                </span>
                <button
                  onClick={() => producto.stock > 0 && addToCart(producto)}
                  disabled={producto.stock <= 0}
                  className={`p-2 rounded-full transition-all ${
                    producto.stock > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  title={
                    producto.stock > 0 ? "Agregar al carrito" : "Sin stock"
                  }
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {productosFiltrados.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No se encontraron productos
          </h3>
          <p className="text-gray-500 mt-1">
            Intenta con otra búsqueda o categoría.
          </p>
          <button
            onClick={() => {
              setBusqueda("");
              setCategoriaSeleccionada("todas");
            }}
            className="mt-4 text-blue-600 font-medium hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
