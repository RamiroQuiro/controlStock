import React, { useState } from "react";
import {
  Search,
  Users,
  Truck,
  Package,
  PlusCircle,
  ReceiptText,
} from "lucide-react";
import ModalCliente from "../../ventas/components/ModalCliente";
import BusquedaClientes from "../../ventas/components/BusquedaClientes";
import BusquedaProveedor from "../../stock/components/BusquedaProveedor";
import ReactQueryProvider from "../../../../context/ReactQueryProvider";
import { Card } from "../../../../components/organismos/Card";

export default function AccionesRapidas({ empresaId }) {
  const [modalType, setModalType] = useState(null); // 'cliente', 'proveedor', 'producto', 'gasto'

  const actions = [
    {
      id: "cliente",
      label: "Buscar Cliente",
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Ver libretita y datos",
    },
    {
      id: "proveedor",
      label: "Buscar Proveedor",
      icon: Truck,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Deudas y pedidos",
    },
    {
      id: "producto",
      label: "Buscar Producto",
      icon: Package,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Precios y stock",
    },
    {
      id: "gasto",
      label: "Nuevo Gasto",
      icon: ReceiptText,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
      description: "Registrar egreso",
    },
  ];

  return (
    <ReactQueryProvider>
      <div className="w-full">
        <div className="flex flex-wrap gap-4">
          {actions.map((action) => (
            <Card
              key={action.id}
              onClick={() => {
                if (action.id === "producto") {
                  window.location.href = "/dashboard/stock";
                  return;
                }
                if (action.id === "gasto") {
                  window.location.href = "/dashboard/ajustes/gastos";
                  return;
                }
                setModalType(action.id);
              }}
              className={`flex-1 min-w-[200px] flex items-center gap-4 p-4 hover:${action.bgColor} cursor-pointer bg-white  hover:border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div
                className={`p-3 rounded-xl ${action.bgColor} ${action.textColor} group-hover:scale-110 duration-300`}
              >
                <action.icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-800 text-sm">
                  {action.label}
                </h3>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  {action.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Modales */}
        {modalType === "cliente" && (
          <ModalCliente onClose={() => setModalType(null)}>
            <div className="p-4 bg-white rounded-xl">
              <BusquedaClientes
                onClose={() => setModalType(null)}
                setCliente={(c) => {
                  window.location.href = `/dashboard/clientes/${c.id}`;
                }}
                empresaId={empresaId}
              />
            </div>
          </ModalCliente>
        )}

        {modalType === "proveedor" && (
          <ModalCliente onClose={() => setModalType(null)}>
            <div className="p-4 bg-white rounded-xl">
              <h2 className="text-2xl font-bold mb-4 px-2 text-primary-textoTitle">
                Buscar Proveedor
              </h2>
              <BusquedaProveedor
                empresaId={empresaId}
                onSelect={(p) => {
                  setModalType(null);
                  window.location.href = "/dashboard/stock";
                }}
              />
            </div>
          </ModalCliente>
        )}
      </div>
    </ReactQueryProvider>
  );
}
