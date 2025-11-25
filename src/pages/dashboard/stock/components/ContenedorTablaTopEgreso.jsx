import { useStore } from "@nanostores/react";
import ConfeccionTablaEgresoTop from "./ConfeccionTablaEgresoTop";
import { useEffect, useMemo } from "react";
import {
  fetchStatsStock,
  stockStatsStore,
} from "../../../../context/stock.store";

export default function ContenedorTablaTopEgreso({ user, label }) {
  const { data, loading, error } = useStore(stockStatsStore);

  useEffect(() => {
    // Si no hay datos, los pedimos (aunque ya deberían estar por SSR o fetch anterior)
    if (!data && user) {
      fetchStatsStock(user.id, user.empresaId);
    }
  }, [user]);

  const productosFormateados = useMemo(() => {
    if (!data?.stats) return [];

    let sourceData = [];

    if (label === "topMasVendidos") {
      sourceData = data.stats.topMasVendidos || [];
    } else if (label === "topMenosVendidos") {
      sourceData = data.stats.topMenosVendidos || [];
    } else if (label === "topHuesos") {
      sourceData = data.stats.topHuesos || [];
    }

    return sourceData.map((prod, i) => {
      let vendidaTexto = prod?.totalVendido || 0;

      if (label === "topHuesos") {
        if (!prod.ultimaVenta) {
          vendidaTexto = "Nunca vendido";
        } else {
          // prod.ultimaVenta viene como timestamp en segundos (SQLite strftime('%s'))
          const ultimaVentaDate = new Date(prod.ultimaVenta * 1000);
          const now = new Date();
          const diffTime = Math.abs(now - ultimaVentaDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          vendidaTexto = `${diffDays} días`;
        }
      }

      return {
        "N°": i + 1,
        descripcion: prod?.nombre || "Sin nombre",
        categoria: prod?.categoria || "Sin categoría",
        vendida: vendidaTexto,
        stock: prod?.stock || 0,
      };
    });
  }, [data, label]);

  if (loading) {
    return (
      <div className="flex flex-col items-start justify-start bg-primary-bg-componentes w-full p-2 animate-pulse">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="w-full h-10 bg-gray-200 rounded mb-2"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start justify-start bg-primary-bg-componentes w-full p-2">
        <p className="text-red-500">Error al cargar los datos: {error}</p>
      </div>
    );
  }

  if (!productosFormateados?.length) {
    return (
      <div className="flex flex-col items-start justify-start bg-primary-bg-componentes w-full p-2">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-start bg-primary-bg-componentes w-full p-2">
      <ConfeccionTablaEgresoTop arrayProduct={productosFormateados} />
    </div>
  );
}
