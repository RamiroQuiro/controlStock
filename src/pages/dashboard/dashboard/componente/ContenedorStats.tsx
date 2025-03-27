import { useStore } from "@nanostores/react";
import {
  AlertTriangle,
  Rocket,
  TrendingUp,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { statsDashStore } from "../../../../context/store";

interface PropsStatsDash {
  h2: string;
  icon: LucideIcon;
  data: string | number;
  descripcion: string;
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
      descripcion: "ventas",
      textColor: "text-primary-100",
      h2: "Ventas del Mes",
      icon: Rocket,
    },
    {
      descripcion: "Productos",
      textColor: "text-primary-400",
      h2: "Productos Bajo Stock",
      icon: AlertTriangle,
    },
    {
      textColor: "text-primary-500",
      h2: "Clientes Nuevos",
      descripcion: "este mes",
      icon: Users2,
    },
    {
      h2: "Ticket Promedio del Mes",
      icon: TrendingUp,
      textColor: "text-primary-100",
      descripcion: "Promedio de Venta",
    },
  ];

  return (
    <div className="w-full animate-fadeIn">
      <div className="w-full flex items-center justify-between gap-2">
        {statsDataDashboard.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow w-1/4">
            <div className="flex items-center justify-between">
              <stat.icon className={`h-8 w-8 ${stat.textColor}`} />
              <span className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <>
                    {index === 0 && (data?.data?.dataDb?.nVentasDelMes?.nVentasMes ?? 0)}
                    {index === 1 && (data?.data?.dataDb?.productosBajoStock?.cantidadBajoStock ?? 0)}
                    {index === 2 && (data?.data?.dataDb?.clientesNuevosMes?.nClientesNuevos ?? 0)}
                    {index === 3 && (
                      data?.data?.dataDb?.ticketPromedio?.promedio 
                        ? `$${data.data.dataDb.ticketPromedio.promedio.toFixed(2)}` 
                        : "$0.00"
                    )}
                  </>
                )}
              </span>
            </div>
            <h2 className="text-lg font-semibold mt-2">{stat.h2}</h2>
            <p className="text-gray-500">{stat.descripcion}</p>
          </div>
        ))}
      </div>
      {error && (
        <div className="w-full mt-4 p-4 bg-red-100 rounded-lg text-red-600">
          Error al cargar estadísticas: {error}
        </div>
      )}
    </div>
  );
}