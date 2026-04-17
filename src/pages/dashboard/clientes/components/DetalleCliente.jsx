import { Card } from "../../../../components/organismos/Card";
import { formateoMoneda } from "../../../../utils/formateoMoneda";

export default function DetalleCliente({ cliente }) {
  return (
    <Card className="">
      <h2 className="text-xl font-semibold mb-4 text-primary-texto">Información del Cliente</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600 text-xs uppercase font-bold">DNI / Documento</p>
          <p className="font-medium">{cliente.dni}</p>
        </div>
        <div>
          <p className="text-gray-600 text-xs uppercase font-bold">Saldo Actual (Deuda)</p>
          <p className={`text-lg font-bold ${Number(cliente.saldoPendiente) > 0 ? "text-red-600" : "text-green-600"}`}>
            {formateoMoneda.format(cliente.saldoPendiente || 0)}
          </p>
        </div>
        <div>
          <p className="text-gray-600 text-xs uppercase font-bold">Teléfono</p>
          <p className="font-medium">{cliente.telefono || "-"}</p>
        </div>
        <div>
          <p className="text-gray-600 text-xs uppercase font-bold">Límite de Crédito</p>
          <p className="font-medium text-gray-800">
            {formateoMoneda.format(cliente.limiteCredito || 0)}
          </p>
        </div>
        <div>
          <p className="text-gray-600 text-xs uppercase font-bold">Email</p>
          <p className="font-medium truncate">{cliente.email || "-"}</p>
        </div>
        <div>
          <p className="text-gray-600 text-xs uppercase font-bold">Categoría</p>
          <span
            className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
              cliente.categoria === "VIP"
                ? "bg-purple-100 text-purple-800"
                : cliente.categoria === "regular"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
            }`}
          >
            {cliente.categoria}
          </span>
        </div>
        <div className="col-span-2">
          <p className="text-gray-600 text-xs uppercase font-bold">Dirección</p>
          <p className="font-medium">{cliente.direccion || "-"}</p>
        </div>
      </div>

      {cliente.observaciones && (
        <div className="mt-4">
          <p className="text-gray-600">Observaciones</p>
          <p className="mt-1">{cliente.observaciones}</p>
        </div>
      )}
    </Card>
  );
}
