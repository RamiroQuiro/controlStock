import { useState } from "react";
import TablaHistorialTraslados from "./TablaHistorialTraslados";
import RemitoImprimible from "./RemitoImprimible";

const ContenedorHistorial = ({ user }) => {
  const [trasladoSeleccionado, setTrasladoSeleccionado] = useState(null);

  const handleVerDetalle = (traslado) => {
    setTrasladoSeleccionado(traslado);
  };

  const handleCerrarRemito = () => {
    setTrasladoSeleccionado(null);
  };

  return (
    <div className="w-full">
      <TablaHistorialTraslados user={user} onVerDetalle={handleVerDetalle} />

      {trasladoSeleccionado && (
        <RemitoImprimible
          traslado={trasladoSeleccionado}
          onCerrar={handleCerrarRemito}
        />
      )}
    </div>
  );
};

export default ContenedorHistorial;
