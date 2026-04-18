import { useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";

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
import Table from "../../../../components/tablaComponentes/Table";

const InputCantidad = ({ prod }) => {
  const [localVal, setLocalVal] = useState(prod.cantidad);

  // Sincronizar con el store si cambia desde afuera (ej: sumar/restar)
  useEffect(() => {
    setLocalVal(prod.cantidad);
  }, [prod.cantidad]);

  const handleChangeLocal = (e) => {
    const val = e.target.value.replace(/[^0-9.,]/g, "");
    setLocalVal(val);

    // Si el valor es un número válido (no termina en punto/coma ni está vacío), actualizamos el store
    if (val !== "" && !val.endsWith(".") && !val.endsWith(",")) {
      setCantidad(prod.codigoBarra, val);
    }
  };

  const handleBlur = () => {
    // Al salir, nos aseguramos de que el store tenga el valor final limpio
    setCantidad(prod.codigoBarra, localVal);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localVal}
      onChange={handleChangeLocal}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
      className="w-20 p-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white text-black font-mono font-bold"
    />
  );
};

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
  ];

  useEffect(() => {
    if ($filtro && Object.keys($filtro).length > 0) {
      // Pasamos el producto y la cantidadManual (si existe, viene de la balanza)
      agregarProductoVenta($filtro, $filtro.cantidadManual);
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
        cantidad: <InputCantidad prod={prod} />,
      })),
    [$productosSeleccionados],
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
