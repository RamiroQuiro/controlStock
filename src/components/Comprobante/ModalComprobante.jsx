import React from 'react';
import Comprobante from './Comprobante';
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
  setModalConfirmacion,
}) {
  const data = {
    codigo: ventaFinalizada?.codigo || ventaFinalizada?.id,
    fecha: ventaFinalizada.fecha,
    cliente: cliente,
    dataEmpresa:{
      razonSocial: ventaFinalizada.dataEmpresa.razonSocial,
      documento: ventaFinalizada.dataEmpresa.documento,
      direccion: ventaFinalizada.dataEmpresa.direccion,
      telefono: ventaFinalizada.dataEmpresa?.telefono,
      email: ventaFinalizada.dataEmpresa?.email,
      web: ventaFinalizada.dataEmpresa?.web,
      logo: ventaFinalizada.dataEmpresa?.logo,
    },
    items: $productos.map((p) => ({
      producto: p.nombre,
      cantidad: p.cantidad,
      precioUnitario: p.pVenta,
      subtotal: p.cantidad * p.pVenta,
      impuesto: p.iva,
      descripcion: p.descripcion,
    })),
    tipo: esPresupuesto,
    subtotal,
    impuestos: ivaMonto,
    descuentos: descuento,
    total: totalVenta,
    expira_at: esPresupuesto ? ventaFinalizada.expira_at : null,
  };

  const handleClose = () => {
    window.location.reload();
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
        className="bg-white rounded-lg md:p-6 p-2 md:w-10/12 z-50 w-11/12 md:h-[90vh] h-[97vh]"
        onClick={handleModalClick} // Evita que el modal se cierre al hacer clic dentro
      >
        <Comprobante
          onClose={handleClose}
          tipo={esPresupuesto}
          data={data}
          onPrint={() => comprobanteService.imprimirComprobante(data)}
          onDownload={() => comprobanteService.descargarPDF(data)}
          onShare={() =>
            comprobanteService.compartirComprobante(ventaFinalizada.codigo)
          }
        />
      </div>
    </div>
  );
}
