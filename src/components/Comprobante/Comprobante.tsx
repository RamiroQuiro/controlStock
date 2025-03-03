import { formateoMoneda } from "../../utils/formateoMoneda";

interface ComprobanteProps {
  tipo: 'comprobante' | 'presupuesto';
  data: {
    codigo: string;
    fecha: number;
    cliente?: {
      nombre: string;
      documento: string;
      direccion?: string;
    };
    items: Array<{
      producto: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
      impuesto?: number;
    }>;
    subtotal: number;
    impuestos: number;
    descuentos: number;
    total: number;
    expira_at?: number; // Solo para presupuestos
  };
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}


const Comprobante = ({ tipo, data, onPrint, onDownload, onShare }: ComprobanteProps) => {

console.log(data)

  return (
    <div className="bg-white p-6 flex items-stretch justify-normal flex-col h-full  mx-auto" id="comprobante-para-imprimir">
      {/* Encabezado */}
      <div className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">
          {tipo === 'comprobante' ? 'Comprobante' : 'Presupuesto'}
        </h1>
        <div className="flex justify-between mt-2">
          <div>
            <p>N°: {data.codigo}</p>
            <p>Fecha: {new Date(data.fecha).toLocaleDateString()}</p>
            {tipo === 'presupuesto' && (
              <p className="text-red-500">
                Válido hasta: {new Date(data.expira_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <div>
            {/* Logo o datos de la empresa */}
            <p>Tu Empresa S.A.</p>
            <p>CUIT: XX-XXXXXXXX-X</p>
          </div>
        </div>
      </div>

      {/* Datos del cliente */}
      {data.cliente && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Cliente</h2>
          <p>{data.cliente.nombre}</p>
          <p>{data.cliente.documento}</p>
          {data.cliente.direccion && <p>{data.cliente.direccion}</p>}
        </div>
      )}

      {/* Tabla de items */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Producto</th>
            <th className="text-right">Cant.</th>
            <th className="text-right">Precio</th>
            <th className="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2">{item.producto}</td>
              <td className="text-right">{item.cantidad}</td>
              <td className="text-right">${item.precioUnitario}</td>
              <td className="text-right">${item.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="ml-auto w-64">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>{formateoMoneda.format(data.subtotal)}</span>
        </div>
        {data.descuentos > 0 && (
          <div className="flex justify-between mb-2 text-red-500">
            <span>Descuentos:</span>
            <span>-${formateoMoneda.format(data.descuentos)}</span>
          </div>
        )}
        <div className="flex justify-between mb-2">
          <span>IVA:</span>
          <span>{formateoMoneda.format(data.impuestos)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total:</span>
          <span>{formateoMoneda.format(data.total)}</span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4 mt-8 print:hidden">
        {onPrint && (
          <button
            onClick={onPrint}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Imprimir
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Descargar PDF
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Compartir
          </button>
        )}
      </div>
    </div>
  );
};

export default Comprobante; 