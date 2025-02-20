import formatDate from "../../utils/formatDate";
import {
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import ContenedorBotonera from "../moleculas/ContenedorBotonera";
import HistorialMovimientosDetalleProducto from "../../pages/dashboard/stock/components/HistorialMovimientosDetalleProducto";
import StatsInfoDetalleProducto from "../../pages/dashboard/stock/components/StatsInfoDetalleProducto";
import DetalleFotoDetalleProducto from "../../pages/dashboard/stock/components/DetalleFotoDetalleProducto";
import { calcularMargenGanancia, calcularPrecioStock, calcularStockInicial, obtenerMovimientosOrdenados, obtenerUltimaReposicion } from "../../lib/detallesProducto";
import { useState } from "react";
import { showToast } from "../../utils/toast/toastShow";

export default function PerfilProducto({ infoProducto }) {
  const [modalConfirmacion, setModalConfirmacion] = useState(false)

  const columnas = [
    { label: "N°", id: 1, selector: (row, index) => index + 1 },
    { label: "Tipo", id: 2, selector: (row) => row.tipo },
    { label: "Cantidad", id: 3, selector: (row) => row.cantidad },
    { label: "Motivo", id: 4, selector: (row) => row.motivo },
    { label: "Cliente/Proveedor", id: 5, selector: (row) => row.efectuado },
    { label: "Fecha", id: 6, selector: (row) => row.fecha },
    { label: "Stock Restante", id: 7, selector: (row) => row.stockRestante },
  ];

  const stockInicial = calcularStockInicial(infoProducto.stockMovimiento)
  const movimientosOrdenados = obtenerMovimientosOrdenados(infoProducto.stockMovimiento)
  const totalStockProducto = calcularPrecioStock(infoProducto.productData)
  const margenGanancia = calcularMargenGanancia(infoProducto.productData?.pVenta, infoProducto.productData?.pCompra);
  const ultimaRepo = obtenerUltimaReposicion(infoProducto.stockMovimiento)

  // **Inicializar stock con el stock inicial**
  let stockActual = stockInicial;

  // **Mapear los movimientos con el cálculo correcto del stock**
  const newArray = movimientosOrdenados.map((mov, i) => {
    // Determinar si es egreso
    const esEgreso = mov.tipo === "egreso";

    // Actualizar el stock
    if (mov.motivo !== "StockInicial") {
      stockActual = esEgreso ? stockActual - mov.cantidad : stockActual + mov.cantidad;
    }

    return {
      n: i + 1,
      tipo:
        mov.tipo === "ingreso" ? (
          <p className="flex items-center justify gap-2 text-green-600 normal">
            <TrendingUp className="h-4 w-4" /> Ingreso
          </p>
        ) : (
          <p className="flex text-primary-400 items-center justify-normal gap-2">
            <TrendingDown className="h-4 w-4" /> Egreso
          </p>
        ),
      cantidad: mov.cantidad,
      motivo: mov.motivo,
      efectuado: mov.tipo === "egreso" ? mov.clienteId : mov.proveedorId,
      fecha: formatDate(mov.fecha),
      stockRestante: stockActual,
    };
  });

  const confirmarConModal=()=>{
    setModalConfirmacion(true)
  }

  const handleEliminar = async (e) => {
    e.preventDefault()
  
    try {
      const res = await fetch(`/api/productos/productos?search=${infoProducto.productData.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        window.location.href = '/dashboard/stock'
      }
    } catch (error) {
      console.log(error)
      setModalConfirmacion(false)
      showToast('error al eliminar', { backgorund: 'bg-red-500' })
    }
  }


  return (
    
    <div className="w-full flex flex-col h-full text-sm px-3 relative -translate-y-5 rounded-lg items-stretch  ">
      {
        modalConfirmacion&&(
          <div className="fixed h-full inset-0 flex items-center justify-center -translate-y-3 backdrop-blur-sm bg-black bg-opacity-50 z-50">
            <div className="bg-white p-4 rounded-md absolute top-16 shadow-md">
              <h3 className="text-lg font-semibold mb-2">¿Estás seguro de eliminar este producto?</h3>  
              <div className="flex justify-evenly gap-2">
                <button onClick={() => setModalConfirmacion(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
                  Cancelar
                </button>
                <button onClick={handleEliminar} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )
      }
      <div className="flex justify-between pr-16 items-center mb-4">
        <h2 className="text-lg  font-semibold text-primary-textoTitle">
          Detalle del Producto
        </h2>
        {/* botonera */}
        <ContenedorBotonera  handleDelete={confirmarConModal}/>
      </div>
      <div className="flex flex-col w-full -mt- items-center justify-normal gap-3">
        {/* info dle prodcutos */}
        <DetalleFotoDetalleProducto infoProducto={infoProducto} ultimaRepo={ultimaRepo} />
        {/* info stats */}
        <StatsInfoDetalleProducto infoProducto={infoProducto} totalStockProducto={totalStockProducto} margenGanancia={margenGanancia} />
        {/* historial Movimientos */}
        <HistorialMovimientosDetalleProducto newArray={newArray} columnas={columnas} />
      </div>
    </div>
  );
}
