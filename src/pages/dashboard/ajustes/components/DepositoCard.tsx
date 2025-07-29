import React from "react";
import { Badge, Building2, CircleX, Edit, Trash2 } from "lucide-react";
import formatDate from "../../../../utils/formatDate";
import Button3 from "../../../../components/atomos/Button3";
import DivReact from "../../../../components/atomos/DivReact";
import FormularioNuevoDeposito from "./FormularioNuevoDeposito";

// ... (interfaces remain the same)
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

interface DepositoCardProps {
  depot: Depot;
}

const DepositoCard: React.FC<DepositoCardProps> = ({ depot }) => {
  const occupancyPercentage =
    depot.capacidadTotal > 0
      ? Math.round((depot.currentStock / depot.capacidadTotal) * 100)
      : 0;

  const getOccupancyBadgeClass = (percentage: number) => {
    if (percentage >= 90) return "bg-red-100 text-red-800";
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getOccupancyBarClass = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <DivReact
      key={depot.id}
      className="hover:shadow-lg transition-shadow p-6 duration-300  flex flex-col w-full"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl">{depot.nombre}</h2>
            <p className="text-sm text-gray-500">{depot.direccion}</p>
          </div>
        </div>
        <Badge variant={depot.activo ? "secondary" : "outline"}>
          {depot.activo ? "Activo" : "Inactivo"}
        </Badge>
      </div>
      <div className="flex-grow flex flex-col w-full">
        <p className="text-sm text-gray-600 mb-4">{depot.descripcion}</p>
        {/* Contact Info */}
        <div className="space-y-2 mb-4 text-sm">
          <p>
            <strong>Tel:</strong> {depot.telefono || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {depot.email || "N/A"}
          </p>
          <p>
            <strong>Encargado:</strong> {depot.encargado || "N/A"}
          </p>
        </div>
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">
              {depot.totalLocations}
            </div>
            <div className="text-xs text-gray-600">Ubicaciones</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-600">
              {depot.capacidadTotal || 0}
            </div>
            <div className="text-xs text-gray-600">Capacidad</div>
          </div>
        </div>
        {/* Occupancy Bar */}
        {depot.capacidadTotal > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">
                Ocupación ({depot.currentStock} un.)
              </span>
              <Badge className={getOccupancyBadgeClass(occupancyPercentage)}>
                {occupancyPercentage}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getOccupancyBarClass(occupancyPercentage)}`}
                style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex-grow"></div> {/* Spacer */}
        {/* Actions */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Creado: {formatDate(depot.fechaCreacion)}</span>
          </div>
          <div className="flex space-x-2">
            <Button3 data-action="edit" data-id={depot.id}>
              <Edit className="h-4 w-4" />
            </Button3>
            <Button3 data-action="toggle" id={`dialog-editar-${depot.id}`}>
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
    </DivReact>
  );
};

export default DepositoCard;
