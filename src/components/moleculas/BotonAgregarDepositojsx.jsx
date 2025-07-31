import React from "react";
import { CircleX, PlusCircle } from "lucide-react";
import FormularioNuevoDeposito from "../../pages/dashboard/ajustes/components/FormularioNuevoDeposito";

export default function BotonAgregarDeposito({ empresaId ,handleDepositoAgregado}) {
  const [mostrarModalAgregar, setMostrarModalAgregar] = React.useState(false);

  const handleCerrar = () => setMostrarModalAgregar(false);

  return (
    <div className="flex items-center justify-center">
      {mostrarModalAgregar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <button
              onClick={handleCerrar}
              className="absolute top-2 right-2 cursor-pointer text-primary-texto active:-scale-95 duration-200 hover:text-primary-100"
            >
              <CircleX />
            </button>
            <FormularioNuevoDeposito empresaId={empresaId} onClose={() => setMostrarModalAgregar(false)} handleDepositoAgregado={handleDepositoAgregado} />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setMostrarModalAgregar(true)}
        className="flex items-center gap-2 p-2 bg-primary-texto text-white rounded-lg hover:bg-primary-100 transition"
      >
        <PlusCircle />
      </button>
    </div>
  );
}