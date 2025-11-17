// components/CategoriasListMejorado.jsx
import { Search, Clock, TrendingUp } from "lucide-react";

  // 🎯 DESTACAR COINCIDENCIAS EN EL TEXTO
  const resaltarCoincidencia = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-0.5 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
const CategoriasListMejorado = ({ 
  categorias, 
  isLoading, 
  onSelect, 
  onClose, 
  searchQuery,
  showPopularBadge = true 
}) => {


  // 🎯 CATEGORIZAR RESULTADOS
  const categoriasConCoincidenciaExacta = categorias.filter(cat => 
    cat.nombre.toLowerCase().startsWith(searchQuery.toLowerCase())
  );
  
  const categoriasConCoincidenciaParcial = categorias.filter(cat => 
    !cat.nombre.toLowerCase().startsWith(searchQuery.toLowerCase()) &&
    cat.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute top-full left-0 right-0 mt-1 max-h-80 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fade-in">
      
      {/* 🎯 HEADER MEJORADO */}
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-2">
          <Search size={14} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {isLoading ? 'Buscando...' : `Categorías (${categorias.length})`}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-200 rounded transition-colors"
          title="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* 🎯 ESTADO DE CARGA */}
      {isLoading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Buscando categorías...</p>
          <p className="text-xs text-gray-500 mt-1">Usando búsqueda inteligente</p>
        </div>
      ) : categorias.length > 0 ? (
        <div className="py-2">
          {/* 🎯 COINCIDENCIAS EXACTAS */}
          {categoriasConCoincidenciaExacta.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-blue-50">
                Coincidencias exactas
              </div>
              {categoriasConCoincidenciaExacta.map((categoria) => (
                <CategoriaListItem
                  key={categoria.id}
                  categoria={categoria}
                  onSelect={onSelect}
                  searchQuery={searchQuery}
                  highlightType="exact"
                />
              ))}
            </div>
          )}

          {/* 🎯 COINCIDENCIAS PARCIALES */}
          {categoriasConCoincidenciaParcial.length > 0 && (
            <div>
              {categoriasConCoincidenciaExacta.length > 0 && (
                <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                  Otras coincidencias
                </div>
              )}
              {categoriasConCoincidenciaParcial.map((categoria) => (
                <CategoriaListItem
                  key={categoria.id}
                  categoria={categoria}
                  onSelect={onSelect}
                  searchQuery={searchQuery}
                  highlightType="partial"
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // 🎯 ESTADO VACÍO MEJORADO
        <div className="p-6 text-center">
          <Search size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">
            No se encontraron categorías
          </p>
          <p className="text-xs text-gray-500">
            No hay resultados para "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
};

// 🎯 COMPONENTE ITEM DE LISTA MEJORADO
const CategoriaListItem = ({ categoria, onSelect, searchQuery, highlightType }) => {
  const getPopularityBadge = (productoCount) => {
    if (productoCount === 0) return null;
    
    if (productoCount > 10) {
      return {
        icon: <TrendingUp size={10} />,
        text: 'Popular',
        class: 'bg-orange-100 text-orange-700'
      };
    } else if (productoCount > 5) {
      return {
        icon: <Clock size={10} />,
        text: 'Usada',
        class: 'bg-green-100 text-green-700'
      };
    }
    
    return {
      text: `${productoCount} prod`,
      class: 'bg-gray-100 text-gray-600'
    };
  };

  const popularityBadge = getPopularityBadge(categoria.productoCount);

  return (
    <div
      onClick={() => onSelect(categoria)}
      className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors group"
    >
      {/* 🎯 INDICADOR DE COLOR */}
      {categoria.color && (
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0 border border-gray-300"
          style={{ backgroundColor: categoria.color }}
        ></div>
      )}
      
      {/* 🎯 INFORMACIÓN DE LA CATEGORÍA */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm mb-1">
          {resaltarCoincidencia(categoria.nombre, searchQuery)}
        </div>
        {categoria.descripcion && (
          <div className="text-xs text-gray-600 line-clamp-1">
            {categoria.descripcion}
          </div>
        )}
      </div>
      
      {/* 🎯 BADGES INFORMATIVOS */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {popularityBadge && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${popularityBadge.class}`}>
            {popularityBadge.icon}
            <span>{popularityBadge.text}</span>
          </div>
        )}
        
        {highlightType === 'exact' && (
          <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            Exacta
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriasListMejorado;