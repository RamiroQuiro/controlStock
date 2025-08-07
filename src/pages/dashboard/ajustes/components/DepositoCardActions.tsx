import React from "react";
import { CircleX, Edit, Trash2 } from "lucide-react";
import Button3 from "../../../../components/atomos/Button3";
import FormularioNuevoDeposito from "./FormularioNuevoDeposito";
import formatDate from "../../../../utils/formatDate";

interface Depot {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  encargado: string;
  activo: boolean;
  fechaCreacion: string;
  capacidadTotal: number;
  totalLocations: number;
  activeLocations: number;
  currentStock: number;
}

interface DepositoCardActionsProps {
  depot: Depot;
}

const DepositoCardActions: React.FC<DepositoCardActionsProps> = ({ depot }) => {
  const handleToggleDialog = () => {
    const dialog = document.getElementById(`dialog-editar-${depot.id}`) as HTMLDialogElement;
    if (dialog) {
      dialog.showModal();
    }
  };

  return (
    <>
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Creado: {formatDate(depot.fechaCreacion)}</span>
        </div>
        <div className="flex space-x-2">
          <Button3 data-action="edit" data-id={depot.id}>
            <Edit className="h-4 w-4" />
          </Button3>
          <Button3 onClick={handleToggleDialog}>
            {depot.activo ? "Desactivar" : "Activar"}
          </Button3>
          <Button3
            data-action="delete"
            data-id={depot.id}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button3>
        </div>
      </div>
      <dialog
        id={`dialog-editar-${depot.id}`}
        className="modal print:hidden relative duration-300 open:fixed open:flex flex-col w-full md:min-w-[50vw] md:open:max-w-[60vw] open:min-h-[70vh] rounded-lg border-l-2 border-primary-100 backdrop:bg-primary-textoTitle/80 open:backdrop:backdrop-blur-sm"
      >
        <form method="dialog">
          <button
            id={`cerrarModal-editar-${depot.id}`}
            className="absolute top-2 right-2 cursor-pointer text-primary-texto active:-scale-95 duration-200 hover:text-primary-100"
          >
            <CircleX />
          </button>
        </form>
        <FormularioNuevoDeposito deposito={depot} />
      </dialog>
    </>
  );
};

export default DepositoCardActions;
