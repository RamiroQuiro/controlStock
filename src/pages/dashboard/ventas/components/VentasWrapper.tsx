import React from "react";
import ReactQueryProvider from "../../../../context/ReactQueryProvider";
import FiltroProductos from "../../../../components/moleculas/FiltroProductos";
import DetallesVentas from "./DetallesVentas";
import CarritoVenta from "./CarritoVenta";
import { ShoppingCart } from "lucide-react";
import PanelCajaReact from "../../dashboard/componente/PanelCajaReact";

type Props = {
  user: any;
};

export default function VentasWrapper({ user }: Props) {
  return (
    <ReactQueryProvider>
      <div className="flex flex-col md:flex-row items-start justify-between gap-2 w-full">
        {/* Columna Izquierda: Buscador y Listado */}
        <div className="flex flex-col items-start justify-between gap-2 w-full md:w-3/4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Producto</h2>
            <FiltroProductos
              mostrarProductos={true}
              userId={user?.id}
              empresaId={user?.empresaId}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full mt-2">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Resultado</h2>
            <DetallesVentas />
          </div>
        </div>

        {/* Columna Derecha: Panel de Caja y Carrito */}
        <div className="flex flex-col items-start sticky top-4 justify-between gap-2 w-full md:w-1/4">
          <PanelCajaReact client:load />
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full mt-2">
            <div className="flex items-center w-full justify-start mb-3">
              <ShoppingCart className="h-5 w-5 text-gray-800 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">
                Detalle de Venta
              </h2>
            </div>
            <CarritoVenta user={user} />
          </div>
        </div>
      </div>
    </ReactQueryProvider>
  );
}
