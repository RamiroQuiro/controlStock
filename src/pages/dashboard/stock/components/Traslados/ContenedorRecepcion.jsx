import { useState } from "react";
import TablaPendientesRecepcion from "./TablaPendientesRecepcion";
import FormularioRecepcion from "./FormularioRecepcion";

const ContenedorRecepcion = ({ user }) => {
  const [trasladoSeleccionado, setTrasladoSeleccionado] = useState(null);

  const handleSeleccionar = (traslado) => {
    setTrasladoSeleccionado(traslado);
  };

  const handleCancelar = () => {
    setTrasladoSeleccionado(null);
  };

  const handleFinalizar = () => {
    setTrasladoSeleccionado(null);
    // Aquí podríamos recargar la lista si fuera necesario,
    // pero TablaPendientesRecepcion lo hace al montarse
  };

  return (
    <div className="w-full">
      {!trasladoSeleccionado ? (
        <TablaPendientesRecepcion
          user={user}
          onSeleccionarTraslado={handleSeleccionar}
        />
      ) : (
        <FormularioRecepcion
          traslado={trasladoSeleccionado}
          user={user}
          onCancelar={handleCancelar}
          onFinalizar={handleFinalizar}
        />
      )}
    </div>
  );
};

export default ContenedorRecepcion;
