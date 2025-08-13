import DivReact from '../../../../components/atomos/DivReact';
import { CircleX, Edit, Tag } from 'lucide-react';
import formatDate from '../../../../utils/formatDate';
import Button3 from '../../../../components/atomos/Button5';
import BotonDesactivarCat from './BotonDesactivarCat';
import EliminarCatergoria from './EliminarCatergoria';
import ModalReact from '../../../../components/moleculas/ModalReact';
import FormularioNuevaCategoria from './FormularioNuevaCat';
import { useState } from 'react';
import type { Categoria } from '../../../../types';

type Props = {
  item: Categoria;
  type: string;
  };

export default function CategoriasCard({ item, type }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <DivReact
      className={`hover:shadow-lg duration-300 transition-all gap-4 cursor-pointer`}
    >
      <div className="flex p-4 flex-col w-full gap-4">
        <div className="flex flex-col gap-y-2 items-start w-full justify-between">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center gap-x-2 w-full">
              {type === 'categoria' && (
                <div
                  className={`p-2 rounded-lg ${item.color || 'bg-blue-500'} text-white`}
                >
                  <Tag className="w-4 h-4 group-hover:scale-110 duration-300" />
                </div>
              )}
              <div>
                <h3 className="text-lg text-primary-textoTitle capitalize font-medium">
                  {item.nombre}
                </h3>
              </div>
            </div>
            <span
              className={`text-xs lowercase px-2 rounded-lg py-1 text-primary-textoTitle font-semibold ${item.activo ? 'bg-green-500/50' : 'bg-red-600/40'}`}
            >
              {item.activo ? 'activo' : 'inactivo'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-start w-full justify-between">
          <span className="text-sm mb-4">{item.descripcion}</span>

          <div className="flex items-center gap-2 w-full justify-between">
            <div className="text-lg font-semibold text-gray-700">
              {item.cantidadProductos}{' '}
              {item.cantidadProductos === 1 ? 'producto' : 'productos'}
            </div>
            <span className="text-sm text-gray-500">
              Creada: {formatDate(item.created_at)}
            </span>
          </div>
        </div>
        <div className="flex items- gap-2">
          <Button3 onClick={() => setModalOpen(true)}>
            <Edit className="h-4 w-4" />
          </Button3>
          <BotonDesactivarCat item={item} />

          <EliminarCatergoria item={item} />
        </div>
      </div>
      {modalOpen && (
        <ModalReact
          id="crearCategoria"
          title="Editar categoría"
          onClose={() => setModalOpen(false)}
          className="modal print:hidden relative duration-300 open:fixed open:flex flex-col rounded-lg border-l-2 border-primary-100 backdrop:bg-primary-textoTitle/80 open:backdrop:backdrop-blur-sm"
        >
          <FormularioNuevaCategoria category={item} />
        </ModalReact>
      )}
    </DivReact>
  );
}
