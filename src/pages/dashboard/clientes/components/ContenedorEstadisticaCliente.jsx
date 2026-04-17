import React from "react";
import EstadisticasCliente from "./EstadisticasCliente";
import { Card } from "../../../../components/organismos/Card";

export default function ContenedorEstadisticaCliente({
  estadisticas,
  loading,
}) {
  return (
    <Card className="">
      <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
      <EstadisticasCliente estadisticas={estadisticas} loading={loading} />
    </Card>
  );
}
