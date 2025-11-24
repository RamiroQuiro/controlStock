import CardProductosStock from "./CardProductosStock";
import { useStore } from "@nanostores/react";
import SkeletorCarProductos from "./SkeletorCarProductos";
import { useEffect, useState } from "react";
import {
  stockStore,
  fetchListadoProductos,
} from "../../../../context/stock.store";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ConfeccionListadoProductos = ({ empresaId }) => {
  const { data, loading, productos, paginacion } = useStore(stockStore);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos"); // 'todos', 'bajo', 'agotado'
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Efecto para búsqueda (resetea a página 0)
  useEffect(() => {
    fetchListadoProductos(empresaId, 0, 20, debouncedSearch);
  }, [empresaId, debouncedSearch]);

  const handleLoadMore = () => {
    if (paginacion && paginacion.paginaActual < paginacion.totalPaginas - 1) {
      fetchListadoProductos(
        empresaId,
        paginacion.paginaActual + 1,
        20,
        debouncedSearch
      );
    }
  };

  // 🎯 LÓGICA DE FILTRADO (Solo estado, la búsqueda ya viene filtrada del server)
  const productosProcesados =
    productos?.filter((prod) => {
      // Filtro por estado (client-side sobre los resultados traídos)
      let matchStatus = true;
      if (filterStatus === "agotado") {
        matchStatus = prod.stock === 0;
      } else if (filterStatus === "bajo") {
        matchStatus = prod.stock > 0 && prod.stock <= prod.alertaStock;
      }
      return matchStatus && prod.stock !== undefined;
    }) || [];

  // Conteos (sobre lo cargado actualmente)
  const countAgotados = productos?.filter((p) => p.stock === 0).length || 0;
  const countBajo =
    productos?.filter((p) => p.stock > 0 && p.stock <= p.alertaStock).length ||
    0;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* 🎯 BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        {/* BUSCADOR */}
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus("todos")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              filterStatus === "todos"
                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus("bajo")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              filterStatus === "bajo"
                ? "bg-orange-100 text-orange-700 border border-orange-200"
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            ⚠️ Bajo Stock
          </button>
          <button
            onClick={() => setFilterStatus("agotado")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              filterStatus === "agotado"
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            ❌ Agotados
          </button>
        </div>
      </div>

      {/* 🎯 LISTADO DE PRODUCTOS */}
      {productosProcesados.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {productosProcesados.map((producto) => (
            <CardProductosStock key={producto.id} prod={producto} />
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 font-medium">
            No se encontraron productos
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Intenta con otro término de búsqueda o cambia los filtros
          </p>
        </div>
      ) : null}

      {/* 🎯 LOADING SKELETON */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-center gap-3 p-3 bg-gray-100 rounded-lg"
            >
              <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🎯 BOTÓN CARGAR MÁS */}
      {!loading &&
        paginacion &&
        paginacion.paginaActual < paginacion.totalPaginas - 1 && (
          <div className="flex justify-center mt-4 pb-8">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm"
            >
              Cargar más productos
            </button>
          </div>
        )}
    </div>
  );
};

export default ConfeccionListadoProductos;
