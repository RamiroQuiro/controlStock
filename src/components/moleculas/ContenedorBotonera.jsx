import { useEffect, useState } from 'react';
import BotonEditar from '../atomos/BotonEditarLts';
import BotonEliminarLts from '../atomos/BotonEliminarLts';
import BotonPdfLts from '../atomos/BotonPdfLts';
import {
  Check,
  Circle,
  CircleOff,
  CircleX,
  EggIcon,
  StopCircle,
} from 'lucide-react';
import { showToast } from '../../utils/toast/toastShow';
import BotonChildresIcono from '../atomos/BotonChildresIcono';
import { toggleEcommerceProduct } from '../../services/productos.services';

export default function ContenedorBotonera({
  handleDelete,
  handleEdit,
  onClose,
  disableEdit,
  downloadPdf,
  data,
}) {
  const [isEcommerce, setIsEcommerce] = useState(false);

  useEffect(() => {
    setIsEcommerce(data?.productData.isEcommerce);
  }, [data]);

  const handleIsEcommerce = async () => {
    const result = await toggleEcommerceProduct(
      data?.productData.id,
      !isEcommerce
    );

    if (result.status === 200) {
      setIsEcommerce(!isEcommerce);
      showToast('Producto actualizado', { background: 'bg-green-500' });
    } else {
      showToast(result.msg || 'Error al actualizar', { background: 'bg-red-500' });
    }
  };

  return (
    <div className="flex text-sm gap-2">
      <label
        htmlFor="isEcommerce"
        onClick={handleIsEcommerce}
        className={`flex items-center gap-2 border rounded-lg p-2 justify-center font-semibold cursor-pointer ${
          isEcommerce ? 'bg-primary-300/80' : 'bg-primary-300/40'
        }`}
      >
        Tienda Online?
        {isEcommerce ? (
          <Check width={16} className="duration-300 font-bold text-primary-100 animate-aparecer" />
        ) : (
          <CircleOff width={16} className="duration-300 font-bold text-primary-100 animate-aparecer" />
        )}
        <input
          type="checkbox"
          id="isEcommerce"
          className="hidden"
          checked={isEcommerce}
          onChange={() => setIsEcommerce(!isEcommerce)}
        />
      </label>

      <BotonEliminarLts handleClick={handleDelete} />
      <BotonPdfLts handleClick={downloadPdf} />
      <BotonEditar handleClick={handleEdit} disabled={disableEdit} />
      <BotonChildresIcono
        children="Cerrar"
        handleClick={() => onClose(false)}
        icono={CircleX}
        className="bg-red-400 hover:bg-red-500 text-white"
      />
    </div>
  );
}
