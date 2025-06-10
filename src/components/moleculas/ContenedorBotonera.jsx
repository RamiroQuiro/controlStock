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
    try {
      const response = await fetch(`/api/productos/tiendaOnline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: data?.productData.id,
          isEcommerce: !isEcommerce,
        }),
      });
      const dataRes = await response.json();
      console.log(dataRes);
      if (dataRes.status === 200) {
        showToast('producto actualizado', { background: 'bg-green-500' });
      } else if (dataRes.status === 400) {
        showToast(dataRes.msg, { background: 'bg-red-500' });
      }
    } catch (error) {
      console.log(error);
      showToast('error al actualizar', { background: 'bg-red-500' });
    }
  };

  return (
    <div className="flex text-sm gap-2">
      <label
        htmlFor="isEcommerce"
        onClick={handleIsEcommerce}
        className={
          isEcommerce
            ? 'flex items-center gap-2 border rounded-lg p-2 bg-primary-300/80 justify-center font-semibold cursor-pointer'
            : 'flex items-center gap-2 border rounded-lg p-2 bg-primary-300/40 justify-center font-semibold cursor-pointer'
        }
      >
        Tienda Online?
        {isEcommerce ? (
          <Check
            width={16}
            className="duration-300 font-bold text-primary-100 animate-aparecer"
          />
        ) : (
          <CircleOff
            width={16}
            className="duration-300 font-bold text-primary-100 animate-aparecer"
          />
        )}
        <input
          type="checkbox"
          name="isEcommerce"
          value={isEcommerce}
          id="isEcommerce"
          className="hidden"
          onChange={() => setIsEcommerce(!isEcommerce)}
          checked={isEcommerce}
        />
      </label>
      <BotonEliminarLts handleClick={handleDelete} />
      <BotonPdfLts handleClick={downloadPdf} />
      <BotonEditar handleClick={handleEdit} />
      <BotonChildresIcono
        children="Cerrar"
        handleClick={() => onClose(false)}
        icono={CircleX}
        className={`bg-red-400 hover:bg-red-500 text-white`}
      >
        Cerrar
      </BotonChildresIcono>
    </div>
  );
}
