export default function ResumenTotales({ subtotal, ivaMonto, totalVenta, descuento }) {
  const montoDescuento = totalVenta * (descuento / 100);
  const totalFinal = totalVenta * (1 - descuento / 100);

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between mb-2">
        <span>Subtotal:</span>
        <span>{formateoMoneda.format(subtotal)}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>IVA:</span>
        <span>{formateoMoneda.format(ivaMonto)}</span>
      </div>
      {descuento > 0 && (
        <div className="flex justify-between mb-2 text-primary-100">
          <span>Descuento ({descuento}%):</span>
          <span>-{formateoMoneda.format(montoDescuento)}</span>
        </div>
      )}
      <div className="flex justify-between text-xl font-bold">
        <span>Total Final:</span>
        <span>{formateoMoneda.format(totalFinal)}</span>
      </div>
    </div>
  );
} 