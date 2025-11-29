import { useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import Table from "../../../../components/tablaComponentes/Table";
import { RenderActionsVentas } from "../../../../components/tablaComponentes/RenderBotonesActions";
import {
  filtroBusqueda,
  productosSeleccionadosVenta,
  agregarProductoVenta,
  sumarCantidad,
  restarCantidad,
  setCantidad,
  eliminarProducto,
} from "../../../../context/venta.store";
import ModalCliente from "./ModalCliente";

export default function DetallesVentasV2() {
  const $filtro = useStore(filtroBusqueda).filtro;
  const $productosSeleccionados = useStore(productosSeleccionadosVenta);
  const [openModal, setOpenModal] = useState(false);
  console.log("productosSeleccionados", $productosSeleccionados);
  const columnas = [
    { label: "N°", id: 1, selector: (row, index) => index + 1 },
    { label: "codigo de barra", id: 2, selector: (row) => row.codigoBarra },
    { label: "descripcion", id: 3, selector: (row) => row.descripcion },
    { label: "categoria", id: 4, selector: (row) => row.categoria },
    { label: "Precio", id: 6, selector: (row) => row.precio },
    { label: "Stock", id: 7, selector: (row) => row.stock },
    { label: "Cantidad", id: 7, selector: (row) => row.cantidad },
    { label: "Acciones", id: 8, selector: "" },
  ];

  useEffect(() => {
    if ($filtro && Object.keys($filtro).length > 0) {
      agregarProductoVenta($filtro);
      filtroBusqueda.set({ filtro: "" });
    }
  }, [$filtro]);

  // Formatear datos para la tabla
  const datosTabla = useMemo(
    () =>
      $productosSeleccionados.map((prod, i) => ({
        "N°": i + 1,
        codigoBarra: prod.codigoBarra,
        descripcion: prod.descripcion,
        categoria: prod.categoria,
        precio: prod.pVenta,
        stock: prod.stock,
        cantidad: (
          <input
            type="number"
            min="1"
            value={prod.cantidad}
            onChange={(e) => setCantidad(prod.codigoBarra, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-20 p-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white text-black"
          />
        ),
      })),
    [$productosSeleccionados]
  );

  return (
    <>
      {openModal && (
        <ModalCliente onClose={() => setOpenModal(false)}>hola</ModalCliente>
      )}
      <div className="w-full md:p-4 p-1 rounded-lg bg-primarycomponentes">
        {$productosSeleccionados.length === 0 ? (
          <div className="p-3">
            <p>No hay elementos para mostrar</p>
          </div>
        ) : (
          <div className="overflow-y-auto">
            <Table
              arrayBody={datosTabla}
              columnas={columnas}
              renderBotonActions={(data) => (
                <RenderActionsVentas
                  onRestar={() => restarCantidad(data.codigoBarra)}
                  onSumar={() => sumarCantidad(data.codigoBarra)}
                  onAplicarDescuento={() => setOpenModal(true)}
                  onEliminar={() => eliminarProducto(data.codigoBarra)}
                />
              )}
            />
          </div>
        )}
      </div>
    </>
  );
}
