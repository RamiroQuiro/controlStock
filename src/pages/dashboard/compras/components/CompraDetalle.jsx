import formatDate from "../../../../utils/formatDate";
import { formateoMoneda } from "../../../../utils/formateoMoneda";


export default function CompraDetalle({
  id,
  comprobante,
  cliente,
  fecha,
  items,
  totales,
}) {

  let razonSocial="Mi Negocio"


const subtotal=items?.reduce((acc,producto)=>acc+(producto.subtotal),0)

  return (
    <div className="bg-white px-4 py-6 flex flex-col   h-full mx-auto">
      <div className="pb-5">
            <p className="text-xs">ID de la compra: {id}</p>
        <div className="flex justify-between mt-2">
          <div className="text-sm">
              <p>Fecha: {formatDate(fecha)}</p>
              <p>N°: {comprobante?.numero}</p>
            <p>Proveedor: <span className="text-lg text-primary-textoTitle font-semibold">{cliente?.nombre}</span></p>
            <p>Documento: {cliente?.dni}</p>
            {cliente?.direccion && <p>Dirección: {cliente.direccion}</p>}
          </div>
        </div>
      </div>


      <ul className="text-  space- my-2 border-y py-2 w-full overflow-y-auto space-y-0.5">
        {items?.map((producto, index) => (
          <li
            key={index}
            className="flex justify-between py-0.5 boder-b items-center bg-primary-bg-componentes px-0.5  text-sm gap-3 font-IndieFlower  w-full capitalize "
          >
            <span>
              {producto.descripcion} ({producto.cantidad} x ${producto.subtotal}
              )
            </span>
            <span className="text text-primary-textoTitle">
              ${producto.cantidad * producto.subtotal}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex justify-between mb-2">
        <span>Subtotal:</span>
        <span>{formateoMoneda.format(subtotal)}</span>
      </div>
      {totales?.descuentos > 0 && (
        <div className="flex justify-between mb-2 text-red-500">
          <span>Descuentos:</span>
          <span>-${formateoMoneda.format(totales.descuentos)}</span>
        </div>
      )}
      <div className="flex justify-between mb-2">
        <span>IVA:</span>
        <span>{formateoMoneda.format(totales?.total-subtotal)}</span>
      </div>
      <div className="flex justify-between font-bold text-lg border-t pt-2">
        <span>Total:</span>
        <span>{formateoMoneda.format(totales?.total)}</span>
      </div>

      <div className="flex justify-center text-sm w-full  gap-4 mt-8">
        <button
          onClick={() => comprobanteService.imprimirComprobante()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Imprimir
        </button>
        <button
          onClick={() => comprobanteService.descargarPDF(data)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Descargar PDF
        </button>
      </div>
    </div>
  );
};