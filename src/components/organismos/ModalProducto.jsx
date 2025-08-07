import { XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import PerfilProducto from './PerfilProducto';
import { useStore } from '@nanostores/react';
import { fetchProducto, perfilProducto } from '../../context/store';
import PerfilProductoV2 from './PerfilProductoV2/PerfilProductoV2';

const ModalProducto = ({ productoId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  const { loading, data, error } = useStore(perfilProducto);
  console.log('datos en el modal productos',data)

  useEffect(() => {
    if (productoId) {
      fetchProducto(productoId);
    }
  }, [productoId]);

  return (
    <div
      style={{ margin: 0, position: 'fixed' }}
      className="fixed top-0 left-0 mt-0 w-full h-screen z-[80] bg-black bg-opacity-50 flex items-center  justify-center backdrop-blur-sm"
      onClick={() => onClose(false)}
    >
      <div
        className="bg-primary-bg-componentes relative rounded-lg overflow-hidden border-l-2 text-border-primary-100/80 mt-0 shadow-lg h-screen md:h-[95vh] overflow-y-auto w-[99vw] md:w-[80vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <PerfilProducto  infoProducto={data} onClose={onClose} />
      </div>
    </div>
  );
};

export default ModalProducto;
