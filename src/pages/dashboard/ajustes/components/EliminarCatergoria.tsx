import { useState } from 'react';
import Button3 from '../../../../components/atomos/Button3';
import { Trash2 } from 'lucide-react';

type Props = {
  item: any;
};

export default function EliminarCatergoria({ item }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalConfirmacion = () => {
    setModalOpen(true);
  };
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/categorias?id=${item.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Categoria eliminada');
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      {modalOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow w-fit animate-">
            <h2 className="text-lg text-primary-textoTitle font-semibold mb-4">
              Eliminar Categoria
            </h2>
            <p className="mb-4 text-sm">
              ¿Estas seguro de eliminar la categoria {item.nombre}?
            </p>
            {item.cantidadProductos > 0 && (
              <span className="text-xs mx-auto font-semibold 4 text-primary-400">
                para esto necesita eliminar {item.cantidadProductos}{' '}
                {item.cantidadProductos === 1 ? 'producto' : 'productos'}{' '}
                {item.cantidadProductos === 1 ? 'relacionado' : 'relacionados'}
              </span>
            )}
            <div className="flex justify-end gap-2 text-white mt-3">
              <Button3
                className="bg-gray-600 py-1"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button3>
              <Button3 className="bg-red-600" onClick={handleDelete}>
                Eliminar
              </Button3>
            </div>
          </div>
        </div>
      )}
      <Button3
        id="delete"
        onClick={handleModalConfirmacion}
        className="h-full text-red-600 mr-2"
      >
        <Trash2 className="stroke-red-600 w-4 h-4" />
      </Button3>
    </div>
  );
}
