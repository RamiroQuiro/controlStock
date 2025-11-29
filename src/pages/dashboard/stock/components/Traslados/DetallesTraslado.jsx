import { useMemo } from "react";
import { useStore } from "@nanostores/react";

import Table from "../../../../../components/tablaComponentes/Table";
import { RenderActionsVentas } from "../../../../../components/tablaComponentes/RenderBotonesActions";
import {
  productosSeleccionadosTraslado,
  sumarCantidadTraslado,
  restarCantidadTraslado,
  eliminarProductoTraslado,
  setCantidadTraslado,
} from "../../../../../context/traslado.store";

export default function DetallesTraslado() {
  const $productosSeleccionados = useStore(productosSeleccionadosTraslado);

  const columnas = [
    { label: "N°", id: 1, selector: (row, index) => index + 1 },
    { label: "Código", id: 2, selector: (row) => row.codigoBarra },
    { label: "Descripción", id: 3, selector: (row) => row.descripcion },
    { label: "Categoría", id: 4, selector: (row) => row.categoria },
    { label: "Stock Origen", id: 5, selector: (row) => row.stock },
    { label: "Cantidad a Trasladar", id: 6, selector: (row) => row.cantidad },
    { label: "Acciones", id: 7, selector: "" },
  ];

  // Formatear datos para la tabla
  const datosTabla = useMemo(
    () =>
      $productosSeleccionados.map((prod, i) => ({
        "N°": i + 1,
        codigoBarra: prod.codigoBarra,
        descripcion: prod.descripcion,
        categoria: prod.categoria,
        stock: prod.stock,
        cantidad: (
          <input
            type="number"
            min="1"
            max={prod.stock} // No permitir trasladar más de lo que hay
            value={prod.cantidad}
            onChange={(e) => {
              const valor = Number(e.target.value);
              // Validar que no exceda el stock disponible
              if (valor <= prod.stock) {
                setCantidadTraslado(prod.codigoBarra, e.target.value);
              }
            }}
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
          <p>No hay productos en el remito de traslado</p>
          <p className="text-xs mt-1">
            Busca y agrega productos para trasladar
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto">
          <Table
            arrayBody={datosTabla}
            columnas={columnas}
            renderBotonActions={(data) => (
              <RenderActionsVentas
                onRestar={() => restarCantidadTraslado(data.codigoBarra)}
                onSumar={() => {
                  // Validar que no exceda el stock
                  const producto = $productosSeleccionados.find(
                    (p) => p.codigoBarra === data.codigoBarra
                  );
                  if (producto && producto.cantidad < producto.stock) {
                    sumarCantidadTraslado(data.codigoBarra);
                  }
                }}
                onEliminar={() => eliminarProductoTraslado(data.codigoBarra)}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}
