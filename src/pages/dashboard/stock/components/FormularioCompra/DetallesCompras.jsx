import { useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import Table from "../../../../../components/tablaComponentes/Table";
import { RenderActionsVentas } from "../../../../../components/tablaComponentes/RenderBotonesActions";
import {
  productosSeleccionadosCompra,
  sumarCantidadCompra,
  restarCantidadCompra,
  eliminarProductoCompra,
  setCantidadCompra,
} from "../../../../../context/compra.store";
import { formateoMoneda } from "../../../../../utils/formateoMoneda";

export default function DetallesCompras() {
  const $productosSeleccionados = useStore(productosSeleccionadosCompra);

  const columnas = [
    { label: "N°", id: 1, selector: (row, index) => index + 1 },
    { label: "Código", id: 2, selector: (row) => row.codigoBarra },
    { label: "Descripción", id: 3, selector: (row) => row.descripcion },
    { label: "Categoría", id: 4, selector: (row) => row.categoria },
    {
      label: "Costo Unit.",
      id: 6,
      selector: (row) => formateoMoneda.format(row.pCompra),
    },
    { label: "Stock Actual", id: 7, selector: (row) => row.stock },
    { label: "Cantidad", id: 8, selector: (row) => row.cantidad },
    {
      label: "Subtotal",
      id: 9,
      selector: (row) => formateoMoneda.format(row.pCompra * row.cantidad),
    },
    { label: "Acciones", id: 10, selector: "" },
  ];

  // Formatear datos para la tabla
  const datosTabla = useMemo(
    () =>
      $productosSeleccionados.map((prod, i) => ({
        "N°": i + 1,
        codigoBarra: prod.codigoBarra,
        descripcion: prod.descripcion,
        categoria: prod.categoria,
        pCompra: prod.pCompra,
        stock: prod.stock,
        cantidad: (
          <input
            type="number"
            min="1"
            value={prod.cantidad}
            onChange={(e) =>
              setCantidadCompra(prod.codigoBarra, e.target.value)
            }
            onClick={(e) => e.stopPropagation()}
            className="w-20 p-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white text-black"
          />
        ),
      })),
    [$productosSeleccionados]
  );

  return (
    <div className="w-full md:p-4 p-1 rounded-lg bg-primarycomponentes">
      {$productosSeleccionados.length === 0 ? (
        <div className="p-3 text-center text-gray-500">
          <p>El carrito de compras está vacío</p>
        </div>
      ) : (
        <div className="overflow-y-auto">
          <Table
            arrayBody={datosTabla}
            columnas={columnas}
            renderBotonActions={(data) => (
              <RenderActionsVentas
                onRestar={() => restarCantidadCompra(data.codigoBarra)}
                onSumar={() => sumarCantidadCompra(data.codigoBarra)}
                // En compras no solemos aplicar descuento por ítem de esta forma visual,
                // pero mantenemos la estructura si se requiere.
                // onAplicarDescuento={() => ...}
                onEliminar={() => eliminarProductoCompra(data.codigoBarra)}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}
