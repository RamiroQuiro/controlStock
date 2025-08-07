import React from "react";
import { CircleX, PlusCircle } from "lucide-react";
import FormularioNuevaCategoria from "../../pages/dashboard/ajustes/components/FormularioNuevaCat";

export default function BotonAgregarCat({ empresaId }) {
  const [mostrarModalAgregar, setMostrarModalAgregar] = React.useState(false);

  const handleCerrar = () => setMostrarModalAgregar(false);

  return (
    <div className="flex items-center justify-center">
      {mostrarModalAgregar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative bg-white rounded-lg shadow-lg p-4 w-full max-w-lg">
            <button
              onClick={handleCerrar}
              className="absolute top-2 right-2 cursor-pointer text-primary-texto active:-scale-95 duration-200 hover:text-primary-100"
            >
              <CircleX />
            </button>
            <FormularioNuevaCategoria empresaId={empresaId} onClose={() => setMostrarModalAgregar(false)} />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setMostrarModalAgregar(true)}
        className="flex items-center gap-2 p-1 bg-primary-texto text-white rounded-lg hover:bg-primary-100 transition"
      >
        <PlusCircle size={20}/>
      </button>
    </div>
  );
}