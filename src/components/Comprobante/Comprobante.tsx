import { formateoMoneda } from '../../utils/formateoMoneda';

interface ComprobanteProps {
  esPresupuesto: 'comprobante' | 'presupuesto';
  data: {
    numeroFormateado: string;
    puntoVenta: number;
    tipo: string;
    codigo: string;
    fecha: number;
    dataEmpresa:{
      razonSocial: string;
      documento: string;
      direccion?: string;
      telefono?: string;
      email?: string;
    }
    cliente?: {
      nombre: string;
      documento: string;
      direccion?: string;
    };
    items: Array<{
      producto: string;
      descripcion: string;
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
  onClose?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const Comprobante = ({
  esPresupuesto,
  data,
  onPrint,
  onDownload,
  onShare,
  onClose,
}: ComprobanteProps) => {

  console.log('estos son los datos del comprobante', esPresupuesto );
  return (
    <div
      className="bg-white relative p-6 flex items-stretch justify-normal flex-col h-full  mx-auto"
      id="comprobante-para-imprimir"
    >
      {/* Encabezado */}
      <div className="border-b md:pb-4 md:mb-4">
        <h1 className="text-2xl font-bold">
          {esPresupuesto == "comprobante" ? "Comprobante" : "Presupuesto"}
        </h1>
        <div className="flex justify-between mt-2">
          <div>
            <p>N°: {data.numeroFormateado}</p>
            <p>Fecha: {new Date(data.fecha).toLocaleDateString()}</p>
            {esPresupuesto === "presupuesto" && (
              <p className="text-red-500">
                Válido hasta: {new Date(data.expira_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <div>
            {/* Logo o datos de la empresa */}
            <h1 className="font-semibold text-xl ">
              {data.dataEmpresa.razonSocial}
            </h1>
            <p className="font- text-sm ">
              CUIT:{data.dataEmpresa.documento}
            </p>
            <p className="font- text-sm ">Dirección:{data.dataEmpresa.direccion}</p>
            <p className="font- text-sm ">Telefono:{data.dataEmpresa.telefono}</p>
            <p className="font- text-sm ">Email:{data.dataEmpresa.email}</p>
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
              <td className="py-2">{item.descripcion}</td>
              <td className="text-right">{item.cantidad}</td>
              <td className="text-right">${item.precioUnitario}</td>
              <td className="text-right">${item.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="ml-auto w-full">
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
      <div className="flex flex-wrap md:justify-end justify-start  bg-white absolute bottom-0 left-0 w-full md:gap-4 gap-2 md:mt-8 print:hidden z-[100]">
        <button
          onClick={onClose}
          className="md:px-4 md:py-2 px-2 py-1 bg-primary-texto text-white rounded hover:bg-gray-600"
        >
          Cerrar
        </button>
        {onPrint && (
          <button
            onClick={onPrint}
            className="md:px-4 md:py-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Imprimir
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="md:px-4 md:py-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Descargar PDF
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="md:px-4 md:py-2 px-2 py-1 bg-purple-400 text-white rounded hover:bg-purple-500"
          >
            Compartir
          </button>
        )}
      </div>
    </div>
  );
};

export default Comprobante;
