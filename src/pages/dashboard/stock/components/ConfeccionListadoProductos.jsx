import CardProductosStock from './CardProductosStock';
import { useStore } from '@nanostores/react';
import SkeletorCarProductos from './SkeletorCarProductos';
import { useEffect } from 'react';
import { stockStore, fetchListadoProductos } from '../../../../context/stock.store';

const ConfeccionListadoProductos = ({empresaId}) => {
  // Obtenemos el estado del store
  const { data, loading,productos } = useStore(stockStore);

    useEffect(() => {
  fetchListadoProductos(empresaId);
    }, [empresaId]);
  return (
    <div className="flex w-full flex-col gap-1">
      {!loading ? (
        productos?.length > 0 ? (
          productos.map((producto) => (
            <CardProductosStock key={producto.id} prod={producto} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        )
      ) : (
        [0, 1, 2, 3, 4].map((_, i) => <SkeletorCarProductos key={i} />)
      )}
    </div>
  );
};

export default ConfeccionListadoProductos;