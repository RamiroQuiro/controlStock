import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { filtroBusqueda } from "../../../../context/store";
import Table from "../../../../components/tablaComponentes/Table";
import { RenderActionsVentas } from "../../../../components/tablaComponentes/RenderBotonesActions";

export default function ResultadoDeBusqueda() {
  const $filtro = useStore(filtroBusqueda).filtro;
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  useEffect(() => {
    if ($filtro && Object.keys($filtro).length > 0) {
      setProductosSeleccionados((prev) => {
        const productoExistente = prev.find(
          (prod) => prod.codigoBarra === $filtro.codigoBarra
        );

        if (productoExistente) {
          return prev.map((producto) =>
            producto.codigoBarra === $filtro.codigoBarra
              ? { ...producto, cantidad: producto.cantidad + 1 }
              : producto
          );
        } else {
          return [...prev, { ...$filtro, cantidad: 1 }];
        }
      });
    }
  }, [$filtro]);

  const columnas = [
    { label: 'N°', id: 1, selector: (row, index) => index + 1},
    { label: 'codigo de barra', id: 2, selector: row => row.codigoBarra },
    { label: 'descripcion', id: 3, selector: row => row.descripcion },
    { label: 'categoria', id: 4, selector: row => row.categoria },
    { label: 'Precio', id: 6, selector: row => row.precio },
    { label: 'Cantidad', id: 7, selector: row => row.cantidad },
    { label: 'Acciones', id: 8, selector: '' }
  ];

  const sumarCantidad = (data) => () => {
    setProductosSeleccionados((prev) =>
      prev.map((producto) =>
        producto.codigoBarra === data.codigoBarra 
          ? { ...producto, cantidad: producto.cantidad + 1 } 
          : producto
      )
    );
  };

  const restarCantidad = (data) => () => {
    setProductosSeleccionados((prev) =>
      prev
        .map((producto) =>
          producto.codigoBarra === data.codigoBarra && producto.cantidad > 1
            ? { ...producto, cantidad: producto.cantidad - 1 }
            : producto
        )
        .filter((producto) => producto.cantidad > 0)
    );
  };

  const eliminarProducto = (data) => () => {
    setProductosSeleccionados((prev) =>
      prev.filter((producto) => producto.codigoBarra !== data.codigoBarra)
    );
  };

  return (
    <div className="w-full p-4 rounded-lg bg-primarycomponentes">
      {productosSeleccionados.length === 0 ? (
        <div className="p-3">
          <p>No hay elementos para mostrar</p>
        </div>
      ) : (
        <Table 
          arrayBody={productosSeleccionados} 
          columnas={columnas} 
          renderBotonActions={(data) => RenderActionsVentas(data, restarCantidad, sumarCantidad, eliminarProducto)}
        />
      )}
    </div>
  );
}
