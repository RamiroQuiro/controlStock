
import React from 'react'
import Comprobante from './Comprobante'
import { ComprobanteService } from '../../services/comprobante.service';

const comprobanteService = new ComprobanteService();

export default function ModalComprobante({
  esPresupuesto,
  ventaFinalizada,
  $productos,
  cliente,
  ivaMonto,
  descuento,
  totalVenta,
  subtotal,
  setModalConfirmacion
}) {
  const data = {
    codigo: ventaFinalizada.codigo,
    fecha: ventaFinalizada.fecha,
    cliente: cliente,
    items: $productos.map(p => ({
      producto: p.nombre,
      cantidad: p.cantidad,
      precioUnitario: p.pVenta,
      subtotal: p.cantidad * p.pVenta,
      impuesto: p.iva,
      descripcion: p.descripcion
    })),
    tipo: esPresupuesto,
    subtotal,
    impuestos: ivaMonto,
    descuentos: descuento,
    total: totalVenta,
    expira_at: esPresupuesto ? ventaFinalizada.expira_at : undefined
  }

  const handleClose = () => {
window.location.reload()
  };

  const handleModalClick = (e) => {
    e.stopPropagation(); // Evita que el clic se propague al fondo
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      onClick={handleClose} // Cierra el modal al hacer clic en el fondo
    >
      <div 
        className="bg-white rounded-lg p-6 w-10/12 h-[90vh]"
        onClick={handleModalClick} // Evita que el modal se cierre al hacer clic dentro
      >
        <Comprobante
          onClose={handleClose}
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