import { ScanBarcode } from "lucide-react";
import { formateoMoneda } from "../../../../utils/formateoMoneda.js";

export default function CardProductosStock({ prod }) {
  if (!prod) return null;

  // 🎯 CÁLCULO DE INTENSIDAD basado en stock total (suma de todas las sucursales)
  const stockTotal = prod?.stock ?? 0;
  const alertaStock = prod?.alertaStock ?? 5;
  const porcentajeStock = (stockTotal / alertaStock) * 100;
  const intensidad = Math.max(0, Math.min(1, 1 - porcentajeStock / 100));
  const stockPorDeposito = prod?.stockPorDeposito ?? [];
  const esMultiSucursal = stockPorDeposito.length > 1;

  // 🎯 SISTEMA DE ALERTAS basado en stock TOTAL
  const getStockStatus = () => {
    if (stockTotal === 0) {
      return { nivel: "agotado", color: "rgba(239, 68, 68, 0.9)", bgColor: "rgba(239, 68, 68, 0.05)", texto: "Sin stock", icon: "❌" };
    } else if (stockTotal <= alertaStock) {
      return { nivel: "bajo", color: `rgba(245, 158, 11, ${0.7 + intensidad * 0.3})`, bgColor: `rgba(245, 158, 11, ${0.05 + intensidad * 0.05})`, texto: "Stock bajo", icon: "⚠️" };
    } else if (stockTotal <= alertaStock * 2) {
      return { nivel: "medio", color: "rgba(34, 197, 94, 0.7)", bgColor: "rgba(34, 197, 94, 0.05)", texto: "Stock medio", icon: "📦" };
    } else {
      return { nivel: "optimo", color: "rgba(34, 197, 94, 0.5)", bgColor: "rgba(34, 197, 94, 0.03)", texto: "Stock óptimo", icon: "✅" };
    }
  };

  const stockStatus = getStockStatus();
  const estiloCard = {
    background: `linear-gradient(to right, ${stockStatus.bgColor}, ${stockStatus.bgColor})`,
    border: `1px solid ${stockStatus.color}`,
    boxShadow: `0 2px 8px ${stockStatus.color}20`,
    transition: "all 0.3s ease",
  };

  return (
    <a
      href={`/dashboard/stock/producto/${prod.id}`}
      style={estiloCard}
      className="rounded-lg p-3 flex items-center hover:-translate-y-0.5 hover:shadow-lg duration-200 cursor-pointer justify-between w-full group"
    >
      {/* LADO IZQUIERDO */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
          {prod?.srcPhoto ? (
            <img src={prod.srcPhoto} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600">📦</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate capitalize">{prod?.nombre}</h3>
            <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: stockStatus.color }}>
              {stockStatus.icon} {stockStatus.texto}
            </span>
          </div>

          <p className="text-xs text-gray-600 truncate mb-1">{prod?.descripcion}</p>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="font-medium" style={{ color: stockStatus.color }}>
              {stockTotal} unidades {esMultiSucursal && <span className="text-gray-400">(total)</span>}
            </span>
            <div className="flex items-center gap-1">
              <ScanBarcode size={12} />
              <span>{prod?.codigoBarra}</span>
            </div>
            {prod?.categoria && (
              <span className="bg-gray-100 px-2 py-0.5 rounded">{prod.categoria}</span>
            )}
          </div>

          {/* 🆕 DESGLOSE POR SUCURSAL — visible para admins con stock distribuido */}
          {esMultiSucursal && (
            <div className="flex items-center gap-1 flex-wrap mt-1.5">
              <span className="text-[10px] text-blue-500 font-semibold">📍 Sucursales:</span>
              {stockPorDeposito.map((dep) => (
                <span
                  key={dep.depositoId}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                    dep.principal
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {dep.depositoNombre ?? "—"}{dep.principal ? " ★" : ""}: <strong>{dep.cantidad}</strong>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LADO DERECHO */}
      <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
        <div className="text-right">
          <div className="text-xs text-gray-500">Costo Total</div>
          <div className="text-sm font-semibold text-gray-700">
            {formateoMoneda.format((prod?.pCompra ?? 0) * stockTotal)}
          </div>
        </div>
        <div className="text-right mt-1">
          <div className="text-xs text-gray-500">Valor Venta</div>
          <div className="text-sm font-bold text-green-600">
            {formateoMoneda.format((prod?.pVenta ?? 0) * stockTotal)}
          </div>
        </div>
        {(stockStatus.nivel === "agotado" || stockStatus.nivel === "bajo") && (
          <div className="text-xs px-2 py-1 rounded-full text-white font-medium mt-1 animate-pulse" style={{ backgroundColor: stockStatus.color }}>
            {stockStatus.nivel === "agotado" ? "REPONER" : "ALERTA"}
          </div>
        )}
      </div>
    </a>
  );
}
