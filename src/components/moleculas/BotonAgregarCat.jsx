import React, { useState } from "react";
import ModalAgregarCat from "../../pages/dashboard/productos/components/ModalAgregarCat";
import { PlusCircle } from "lucide-react";

export default function BotonAgregarCat({empresaId}) {
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  
  
  return (
    <div className="flex items-center justify-center">
      {mostrarModalAgregar && (
        <ModalAgregarCat
          setCategoriasSeleccionadas={setCategoriasSeleccionadas}
          onClose={() => setMostrarModalAgregar(false)}
          empresaId={empresaId}
        />
      )}
      <button
        type="button"
        onClick={() => setMostrarModalAgregar(true)}
        className="text-primary-100 px-2 py-1  hover:text-primary-texto/80 active:text-primary-100/80 active:-scale-95 transition-colors duration-150 flex items-center gap-2"
        title="Agregar nueva categoría"
      >
        <PlusCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
