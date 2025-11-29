import { useRef } from "react";

const RemitoImprimible = ({ traslado, onCerrar }) => {
  const printRef = useRef();

  const handleImprimir = () => {
    window.print();
  };

  if (!traslado) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Botones de acción (no se imprimen) */}
        <div className="flex justify-end gap-2 p-4 border-b print:hidden">
          <button
            onClick={handleImprimir}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🖨️ Imprimir
          </button>
          <button
            onClick={onCerrar}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>

        {/* Contenido imprimible */}
        <div ref={printRef} className="p-8">
          {/* Encabezado */}
          <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              REMITO DE TRASLADO
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              N° {traslado.numeroRemito}
            </p>
          </div>

          {/* Información del traslado */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Origen:</h3>
              <p className="text-gray-600">{traslado.origenNombre}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Destino:</h3>
              <p className="text-gray-600">{traslado.destinoNombre}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Fecha de Envío:
              </h3>
              <p className="text-gray-600">
                {new Date(traslado.fechaCreacion).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Estado:</h3>
              <p
                className={`font-medium ${
                  traslado.estado === "recibido"
                    ? "text-green-600"
                    : traslado.estado === "cancelado"
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              >
                {traslado.estado.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Observaciones */}
          {traslado.observaciones && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">
                Observaciones:
              </h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {traslado.observaciones}
              </p>
            </div>
          )}

          {/* Tabla de productos */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">
              Detalle de Productos:
            </h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Código
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Producto
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Cant. Enviada
                  </th>
                  {traslado.estado === "recibido" && (
                    <>
                      <th className="border border-gray-300 px-4 py-2 text-center">
                        Cant. Recibida
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center">
                        Diferencia
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {traslado.detalles?.map((detalle, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {detalle.codigoProducto || "-"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {detalle.nombreProducto}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                      {detalle.cantidadEnviada}
                    </td>
                    {traslado.estado === "recibido" && (
                      <>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {detalle.cantidadRecibida || "-"}
                        </td>
                        <td
                          className={`border border-gray-300 px-4 py-2 text-center font-medium ${
                            detalle.diferencia > 0
                              ? "text-green-600"
                              : detalle.diferencia < 0
                                ? "text-red-600"
                                : ""
                          }`}
                        >
                          {detalle.diferencia !== null &&
                          detalle.diferencia !== undefined
                            ? detalle.diferencia > 0
                              ? `+${detalle.diferencia}`
                              : detalle.diferencia
                            : "-"}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td
                    colSpan="2"
                    className="border border-gray-300 px-4 py-2 text-right"
                  >
                    Total de Items:
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {traslado.detalles?.reduce(
                      (sum, d) => sum + d.cantidadEnviada,
                      0
                    )}
                  </td>
                  {traslado.estado === "recibido" && (
                    <>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {traslado.detalles?.reduce(
                          (sum, d) => sum + (d.cantidadRecibida || 0),
                          0
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2"></td>
                    </>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Firmas */}
          <div className="grid grid-cols-2 gap-12 mt-12 pt-6 border-t border-gray-300">
            <div>
              <div className="border-t border-gray-400 pt-2 mt-16">
                <p className="text-center text-sm text-gray-600">
                  Firma y Aclaración - Quien Envía
                </p>
                <p className="text-center text-xs text-gray-500 mt-1">
                  {traslado.enviadoPorNombre}
                </p>
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 pt-2 mt-16">
                <p className="text-center text-sm text-gray-600">
                  Firma y Aclaración - Quien Recibe
                </p>
              </div>
            </div>
          </div>

          {/* Pie de página */}
          <div className="text-center text-xs text-gray-400 mt-8">
            <p>Documento generado el {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${printRef.current} * {
            visibility: visible;
          }
          ${printRef.current} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default RemitoImprimible;
