import { useStore } from "@nanostores/react";
import {
  AlertTriangle,
  Rocket,
  TrendingUp,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { statsDashStore } from "../../../../context/store";
import StatsDashboard from "./StatsDashboard";

interface PropsStatsDash {
  h2: string;
  icon: LucideIcon;
  data: string | number;
  descripcion: string;
  dataInfo: number;
  textColor: string;
}

interface DataDB {
  nVentasDelMes: { nVentasMes: number };
  productosBajoStock: { cantidadBajoStock: number };
  clientesNuevosMes: { nClientesNuevos: number };
  ticketPromedio?: { promedio: number };
}
export default function ContenedorStats() {
  const { data, loading, error } = useStore(statsDashStore);

  // Estructura base de las estadísticas que siempre se muestra
  const statsDataDashboard = [
    {
      id: 1,
      dataInfo: 0,
      descripcion: "ventas",
      textColor: "text-primary-100",
      h2: "Ventas del Mes",
      icon: Rocket,
    },
    {
      id: 2,
      dataInfo: 0,
      descripcion: "Productos",
      textColor: "text-primary-400",
      h2: "Productos Bajo Stock",
      icon: AlertTriangle,
    },
    {
      id: 3,
      dataInfo: 0,
      textColor: "text-primary-500",
      h2: "Clientes Nuevos",
      descripcion: "este mes",
      icon: Users2,
    },
    {
      id: 4,
      dataInfo: 0,
      h2: "Ticket Promedio del Mes",
      icon: TrendingUp,
      textColor: "text-primary-100",
      descripcion: "Promedio de Venta",
    },
  ];
console.log("data", data)
  // console.log("este son los datos", data?.data);
  return (
    <div className="w-full animate-fadeIn">
      <div className="w-full flex md:flex-nowrap flex- overflow-x-auto pb-1 items-center justify-between gap-1 md:gap-2">
        {statsDataDashboard.map((stat) => {
          let dataInfo =
            stat.id === 1
              ? data?.data?.dataDb?.nVentasDelMes
              : stat.id === 2
                ? data?.data?.dataDb?.productosBajoStock?.cantidadBajoStock
                : stat.id === 3
                  ? data?.data?.dataDb?.clientesNuevosMes?.nClientesNuevos
                  : data?.data?.dataDb?.ticketPromedioMes;
          stat.dataInfo = dataInfo;
          return (

            <StatsDashboard key={stat.id} {...stat} />
          );
        })}
      </div>
      {error && (
        <div className="w-full mt-4 p-4 bg-red-100 rounded-lg text-red-600">
          Error al cargar estadísticas: {error}
        </div>
      )}
    </div>
  );
}
