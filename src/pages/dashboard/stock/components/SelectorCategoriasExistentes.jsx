import React, { useState, useEffect } from "react";
import { Search, PlusCircle } from "lucide-react";
import { useCategorias } from "../../../../hook/useCategorias";

export default function SelectorCategoriasExistentes({ 
  empresaId, 
  onAgregarCategoria,
  categoriasActuales = []
}) {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  
  const { categorias, isLoading, searchCategorias } = useCategorias(empresaId);
  // Filtrar categorías que ya están en el producto
  const categoriasFiltradas = categorias.filter(
    cat => !categoriasActuales.some(c => c.id === cat.id)
  );

  useEffect(() => {
    // Limpiar búsqueda al desmontar
    return () => {
      if (searchCategorias && searchCategorias.cancel) {
        searchCategorias.cancel();
      }
    };
  }, [searchCategorias]);

  // Manejar cambio en el input de búsqueda
  const handleBusquedaChange = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    
    if (valor.length >= 2) {
      searchCategorias(valor);
      setMostrarSugerencias(true);
    } else {
      setMostrarSugerencias(false);
    }
  };

  // Seleccionar una categoría
  const handleSeleccionarCategoria = (categoria) => {
    if (onAgregarCategoria) {
      onAgregarCategoria(categoria);
    }
    setBusqueda("");
    setMostrarSugerencias(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={busqueda}
            onChange={handleBusquedaChange}
            placeholder="Buscar categoría..."
            className="w-full text-xs py-1 px-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
            onFocus={() => busqueda.length >= 2 && setMostrarSugerencias(true)}
            onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
          />
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Lista de sugerencias */}
      {mostrarSugerencias && categoriasFiltradas.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-40 overflow-y-auto">
          {categoriasFiltradas.map((cat) => (
            <div
              key={cat.id}
              className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-sm flex items-center"
              onClick={() => handleSeleccionarCategoria(cat)}
            >
              <PlusCircle className="w-4 h-4 mr-2 text-primary-400" />
              {cat.nombre}
            </div>
          ))}
        </div>
      )}
      
      {mostrarSugerencias && busqueda.length >= 2 && categoriasFiltradas.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-2 text-sm text-gray-500">
          No se encontraron categorías
        </div>
      )}
      
      {isLoading && busqueda.length >= 2 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-2 text-sm text-gray-500">
          Buscando...
        </div>
      )}
    </div>
  );
}
