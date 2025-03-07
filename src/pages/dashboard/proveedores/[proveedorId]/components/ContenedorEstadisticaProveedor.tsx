import DivReact from "../../../../../components/atomos/DivReact";
import Estadisticas from "./Estadisticas";

type EstadisticaProveedor = {
  totalGastado: number;
  promedioCompra: number;
  cantidadCompras: number;
  frecuenciaCompra: number;
  ultimaCompra: string;
};

export const ContenedorEstadisticaProveedor = ({
  estadisticasProveedor,
}: {
  estadisticasProveedor: EstadisticaProveedor;
}) => {
  return (
    <DivReact >
        <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
            <Estadisticas estadisticasProveedor={estadisticasProveedor} />
    </DivReact>
  );
};
