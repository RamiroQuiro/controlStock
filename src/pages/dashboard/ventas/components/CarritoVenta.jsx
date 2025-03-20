import { useStore } from "@nanostores/react";
import React, { useEffect, useState } from "react";
import { productosSeleccionadosVenta } from "../../../../context/store";
import { showToast } from "../../../../utils/toast/toastShow";
import ModalConfirmacion from "./ModalConfirmacion";
import { loader } from "../../../../utils/loader/showLoader";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import BotoneraCarrito from "./BotoneraCarrito";
import { formateoMoneda } from "../../../../utils/formateoMoneda";
import ModalPago from "./ModalPago/ModalPago";

export default function CarritoVenta({ userId }) {
  const $productos = useStore(productosSeleccionadosVenta);
  const [totalVenta, setTotalVenta] = useState(0);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);

  const [subtotal, setSubtotal] = useState(0);
  const [ivaMonto, setIvaMonto] = useState(0);


  useEffect(() => {
    const sumaTotal = $productos.reduce(
      (acc, producto) => acc + producto.pVenta * producto.cantidad,
      0
    );

    const sumaSubtotal = $productos.reduce(
      (acc, producto) =>
        acc + (producto.pVenta * producto.cantidad) / (1 + producto.iva / 100),
      0
    );

    setTotalVenta(sumaTotal);
    setSubtotal(sumaSubtotal);
    setIvaMonto(sumaTotal - sumaSubtotal);

  }, [$productos]);
  const pagar = () => setModalConfirmacion(true)
  // console.log('este es le $produc',$productos)


  return (
    <>
      <div className="w-full flex flex-col items-start justify-start h-full mt- ">
        <div className="flex flex-col items-start justify-start mt-2  w-full pb-3 mb-3">
          <p className="text-sm font-semibold">Resumen de la venta:</p>
          <ul className="text-  space- mt-2 w-full overflow-y-auto space-y-0.5">
            {$productos.map((producto, index) => (
              <li
                key={index}
                className="flex justify-between py-0.5 boder-b items-center bg-primary-bg-componentes px-0.5  text-sm gap-3 font-IndieFlower  w-full capitalize "
              >
                <span>
                  {producto.descripcion} ({producto.cantidad} x $
                  {producto.pVenta})
                </span>
                <span className="text text-primary-textoTitle">
                  ${producto.cantidad * producto.pVenta}
                </span>
              </li>
            ))}
          </ul>
        </div>


        <div className="w-full text-primary-textoTitle font- text-end flex flex-col items-end justify-between mt-3">
          <div className="w-full flex gap-4 justify-between border-t border-primary-150 items-center">
            <p className="text-lg capitalize">Subtotal:</p>
            <p className="md:text-xl text-end -tracking-wider text-primary-textoTitle font-mono">
              {formateoMoneda.format(subtotal)}
            </p>
          </div>
          <div className="w-full flex gap-4 justify-between border-y border-primary-150 items-center">
            <p className="text-lg capitalize">IVA:</p>
            <p className="md:text-xl text-end -tracking-wider text-primary-textoTitle font-mono">
              {formateoMoneda.format(ivaMonto)}
            </p>
          </div>
          <div className="w-full flex gap-4 justify-between border-y border-primary-150 items-center">
            <p className="text-lg capitalize">Total:</p>
            <p className="md:text-3xl text-end -tracking-wider text-primary-textoTitle font-mono">
              {formateoMoneda.format(totalVenta)}
            </p>
          </div>

        </div>
        <BotoneraCarrito
          totalVenta={totalVenta}
          pagar={pagar}
        />
      </div>

      {/* Modal de Pago */}
      {modalConfirmacion && (
        <ModalPago totalVenta={totalVenta} subtotal={subtotal} setModalConfirmacion={setModalConfirmacion} ivaMonto={ivaMonto} $productos={$productos} userId={userId} />
      )}
    </>
  );
}
