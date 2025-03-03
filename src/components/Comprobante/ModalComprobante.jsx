import React from 'react'
import Comprobante from './Comprobante'
import { ComprobanteService } from '../../services/comprobante.service';
const comprobanteService = new ComprobanteService();
export default function ModalComprobante({esPresupuesto,ventaFinalizada,$productos,cliente, ivaMonto,descuento,totalVenta,subtotal}) {

let data={
    codigo: ventaFinalizada.codigo,
    fecha: ventaFinalizada.fecha,
    cliente: cliente,
    items: $productos.map(p => ({
      producto: p.nombre,
      cantidad: p.cantidad,
      precioUnitario: p.pVenta,
      subtotal: p.cantidad * p.pVenta,
      impuesto: p.iva
    })),
    subtotal,
    impuestos: ivaMonto,
    descuentos: descuento,
    total: totalVenta,
    expira_at: esPresupuesto ? ventaFinalizada.expira_at : undefined
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-10/12 h-[90vh] ">
      <Comprobante
        tipo={esPresupuesto ? 'presupuesto' : 'comprobante'}
        data={data}
        onPrint={() => comprobanteService.imprimirComprobante()}
        onDownload={() => comprobanteService.descargarPDF(data)}
        onShare={() => comprobanteService.compartirComprobante(ventaFinalizada.codigo)}
      />
    </div>
  </div>
  )
}
