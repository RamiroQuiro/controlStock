import CardProductosStock from './CardProductosStock';
import { useStore } from '@nanostores/react';
import SkeletorCarProductos from './SkeletorCarProductos';
import { useEffect } from 'react';
import { stockStore, fetchListadoProductos } from '../../../../context/stock.store';

const ConfeccionListadoProductos = ({ empresaId }) => {
  const { data, loading, productos } = useStore(stockStore);

  useEffect(() => {
    fetchListadoProductos(empresaId);
  }, [empresaId]);

  // 🎯 FILTRADO POR ESTADO DE STOCK
  const productosFiltrados = productos?.filter(prod => prod.stock !== undefined) || [];

  const productosAgotados = productosFiltrados.filter(prod => prod.stock === 0);
  const productosBajoStock = productosFiltrados.filter(prod => 
    prod.stock > 0 && prod.stock <= prod.alertaStock
  );
  const productosNormales = productosFiltrados.filter(prod => 
    prod.stock > prod.alertaStock
  );

  return (
    <div className="flex w-full flex-col gap-3">
      {!loading ? (
        productosFiltrados.length > 0 ? (
          <>
            {/* 🎯 SECCIÓN DE ALERTAS (OPCIONAL) */}
            {(productosAgotados.length > 0 || productosBajoStock.length > 0) && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  ⚠️ Alertas de Stock
                </h3>
                
                {productosAgotados.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-red-600 font-medium mb-1">
                      Productos agotados ({productosAgotados.length})
                    </div>
                    {productosAgotados.map((producto) => (
                      <CardProductosStock key={producto.id} prod={producto} />
                    ))}
                  </div>
                )}
                
                {productosBajoStock.length > 0 && (
                  <div>
                    <div className="text-xs text-orange-600 font-medium mb-1">
                      Stock bajo ({productosBajoStock.length})
                    </div>
                    {productosBajoStock.map((producto) => (
                      <CardProductosStock key={producto.id} prod={producto} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 🎯 PRODUCTOS CON STOCK NORMAL */}
            {productosNormales.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  📦 Stock normal ({productosNormales.length})
                </h3>
                {productosNormales.map((producto) => (
                  <CardProductosStock key={producto.id} prod={producto} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg mb-2">No hay productos</p>
            <p className="text-gray-400 text-sm">Agrega tu primer producto para comenzar</p>
          </div>
        )
      ) : (
        // 🎯 SKELETON MEJORADO
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
              <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConfeccionListadoProductos;