import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import Table from "../../../../../components/tablaComponentes/Table";
import { RenderActionsVentas } from "../../../../../components/tablaComponentes/RenderBotonesActions";
import {
  productosSeleccionadosCompra,
  sumarCantidadCompra,
  restarCantidadCompra,
  eliminarProductoCompra,
  setCantidadCompra,
  setPrecioCompra,
} from "../../../../../context/compra.store";
import { formateoMoneda } from "../../../../../utils/formateoMoneda";

export default function DetallesCompras() {
  const $productosSeleccionados = useStore(productosSeleccionadosCompra);

  const columnas = [
    { label: "Código", id: 2, selector: (row) => row.codigoBarra },
    { label: "Nombre", id: 2, selector: (row) => row.nombre },
    { label: "Descripción", id: 3, selector: (row) => row.descripcion },
    { 
      label: "Costo Unit.", 
      id: 4, 
      selector: (row) => row.costoInput 
    },
    { 
      label: "Cantidad", 
      id: 5, 
      selector: (row) => row.cantidadInput 
    },
    { label: "Acciones", id: 7, selector: "" },
  ];

  const datosTabla = useMemo(
    () =>
      $productosSeleccionados.map((prod, i) => {
        const costo = Number(prod.pCompra) || 0;
        const cantidad = Number(prod.cantidad) || 0;
        const subtotal = costo * cantidad;

        return {
          id: prod.id,
          codigoBarra: prod.codigoBarra,
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          costoInput: (
            <input
              type="number"
              min="0"
              step="0.01"
              value={costo}
              placeholder="Ingrese costo"
              onChange={(e) =>
                setPrecioCompra(prod.codigoBarra, e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
              className="w-28 p-2 border-2 border-indigo-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50 text-black font-mono font-semibold"
            />
          ),
          cantidadInput: (
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) =>
                setCantidadCompra(prod.codigoBarra, e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
              className="w-20 p-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white text-black"
            />
          ),
        };
      }),
    [$productosSeleccionados]
  );

  return (
    <div className="w-full md:p-4 p-1 rounded-lg bg-primarycomponentes">
      {$productosSeleccionados.length === 0 ? (
        <div className="p-3 text-center text-gray-500">
          <p>El carrito de compras está vacío</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            arrayBody={datosTabla}
            columnas={columnas}
            renderBotonActions={(data) => (
              <RenderActionsVentas
                onRestar={() => restarCantidadCompra(data.codigoBarra)}
                onSumar={() => sumarCantidadCompra(data.codigoBarra)}
                onEliminar={() => eliminarProductoCompra(data.codigoBarra)}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}
