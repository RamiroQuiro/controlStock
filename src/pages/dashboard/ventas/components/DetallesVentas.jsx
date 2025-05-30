import { useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import Table from "../../../../components/tablaComponentes/Table";
import { RenderActionsVentas } from "../../../../components/tablaComponentes/RenderBotonesActions";
import {
  filtroBusqueda,
  productosSeleccionadosVenta,
} from "../../../../context/store";
import ModalCliente from "./ModalCliente";

export default function DetallesVentas() {
  const $filtro = useStore(filtroBusqueda).filtro;
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [openModal, setOpenModal] = useState(false);

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
      setProductosSeleccionados((prev) => {
        const productoExistente = prev.find(
          (prod) => prod.codigoBarra === $filtro.codigoBarra
        );

        if (productoExistente) {
          const newArray = prev.map((producto) =>
            producto.codigoBarra === $filtro.codigoBarra
              ? { ...producto, cantidad: producto.cantidad + 1 }
              : producto
          );
          productosSeleccionadosVenta.set(newArray);
          return newArray;
        } else {
          const newArray = [...prev, { ...$filtro, cantidad: 1 }];
          productosSeleccionadosVenta.set(newArray);
          return newArray;
        }
      });
    }
    filtroBusqueda.set({ filtro: "" });
  }, [$filtro]);
  // Formatear datos para la tabla
  const datosTabla = useMemo(
    () =>
      productosSeleccionados.map((prod, i) => ({
        "N°": i + 1,
        codigoBarra: prod.codigoBarra,
        descripcion: prod.descripcion,
        categoria: prod.categoria,
        precio: prod.pVenta,
        stock: prod.stock,
        cantidad: prod.cantidad,
      })),
    [productosSeleccionados]
  );
  const sumarCantidad = (data) => () => {
    setProductosSeleccionados((prev) => {
      const newArray = prev.map((producto) =>
        producto.codigoBarra === data.codigoBarra
          ? { ...producto, cantidad: producto.cantidad + 1 }
          : producto
      );
      productosSeleccionadosVenta.set(newArray);
      return newArray;
    });
  };

  const restarCantidad = (data) => () => {
    setProductosSeleccionados((prev) => {
      const newArray = prev
        .map((producto) =>
          producto.codigoBarra === data.codigoBarra && producto.cantidad > 1
            ? { ...producto, cantidad: producto.cantidad - 1 }
            : producto
        )
        .filter((producto) => producto.cantidad > 0);
      productosSeleccionadosVenta.set(newArray);
      return newArray;
    });
  };

  const eliminarProducto = (data) => () => {
    setProductosSeleccionados((prev) =>
      prev.filter((producto) => producto.codigoBarra !== data.codigoBarra)
    );
    const newArray = productosSeleccionadosVenta
      .get()
      .filter((prod) => prod.codigoBarra !== data.codigoBarra);
    productosSeleccionadosVenta.set(newArray);
  };

  const aplicaDescuento = (data) => () => {
    setOpenModal(true);
  };

  return (
    <>
      {openModal && (
        <ModalCliente onClose={() => setOpenModal(false)}>hola</ModalCliente>
      )}
      <div className="w-full md:p-4 p-1 rounded-lg bg-primarycomponentes">
        {productosSeleccionados.length === 0 ? (
          <div className="p-3">
            <p>No hay elementos para mostrar</p>
          </div>
        ) : (
          <div className="overflow-y-auto">
            <Table
              arrayBody={datosTabla}
              columnas={columnas}
              renderBotonActions={(data) =>
                RenderActionsVentas(
                data,
                restarCantidad,
                sumarCantidad,
                aplicaDescuento,
                eliminarProducto
              )
            }
            />
            </div>
        )}
      </div>
    </>
  );
}
