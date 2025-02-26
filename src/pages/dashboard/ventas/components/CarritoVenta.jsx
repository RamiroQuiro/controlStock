import { useStore } from "@nanostores/react";
import React, { useEffect, useState } from "react";
import { productosSeleccionadosVenta } from "../../../../context/store";
import { showToast } from "../../../../utils/toast/toastShow";
import ModalConfirmacion from "./ModalConfirmacion";
import { loader } from "../../../../utils/loader/showLoader";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import BotoneraCarrito from "./BotoneraCarrito";
import ClientesSelect from "./ClientesSelect";
import ImpuestosDescuentos from "./ImpuestosDescuentos";
import { formateoMoneda } from "../../../../utils/formateoMoneda";

export default function CarritoVenta({ userId }) {
  const $productos = useStore(productosSeleccionadosVenta);
  const [totalVenta, setTotalVenta] = useState(0);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [pagaCon, setPagaCon] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [cliente, setCliente] = useState({
    nombre: "consumidor final",
    dni: "00000000",
    celular: "0000000000",
    id: "1",
  });
  const formularioVenta = {
    clienteId: cliente.id,
    pagaCon: 0,
    descuento: 0,
    impuesto: 0,
    totalVenta: 0,
  };

  const [vueltoCalculo, setVueltoCalculo] = useState(0);
  useEffect(() => {
    const sumaTotal = $productos.reduce(
      (acc, producto) => acc + producto.precio * producto.cantidad,
      0
    );
    setTotalVenta(sumaTotal);
  }, [$productos]);

  const vuelto = (e) => {
    const montoIngresado = Number(e.target.value);
    const sumaTotal = $productos.reduce(
      (acc, producto) => acc + producto.precio * producto.cantidad,
      0
    );
    const vueltoCalculado = montoIngresado - sumaTotal;
    return formateoTotal(vueltoCalculado >= 0 ? vueltoCalculado : 0);
  };

  const handlePagaCon = (e) => {
    setPagaCon(e);
    setVueltoCalculo(vuelto(e));
  };

  const finalizarCompra = async () => {
    loader(true);
    if (totalVenta == 0) {
      showToast("monto total 0", {
        background: "bg-primary-400",
      });
      return;
    }
    try {
      const responseFetch = await fetch("/api/sales/finalizarVenta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productos: $productos,
          totalVenta,
          userId,
          clienteId: cliente.id,
        }),
      });
      const data = await responseFetch.json();
      if (data.status == 200) {
        showToast(data.msg, { background: "bg-green-600" });
        setTotalVenta(0);
        setModalConfirmacion(true);
        loader(false);
        // setTimeout(()=>window.location.reload(),1000)
      }
    } catch (error) {
      console.log(error);
      loader(false);
      showToast("error al transaccionar", { background: "bg-primary-400" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormularioVenta({
      ...formularioVenta,
      [name]: value,
    });
  };

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
                  {producto.precio})
                </span>
                <span className="text text-primary-textoTitle">
                  ${producto.cantidad * producto.precio}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* select cliente */}
        <ClientesSelect cliente={cliente} setCliente={setCliente} />
        {/* impuestos y descuentos */}
       
        <div className="w-full mt-3 inline-flex">
          <p className="text-3xl mr-2">$</p>
          <InputComponenteJsx
            name={"dineroAbonado"}
            placeholder={"Paga con ..."}
            handleChange={handlePagaCon}
          />
        </div>
        <div className="w-full text-primary-textoTitle font- text-end flex flex-col items-end justify-between mt-3">
          <div className="w-full flex gap-4 justify-between border-t border-primary-150 items-center">
            <p className="text-lg capitalize">subtotal:</p>
            <p className="md:text-xl text-end -tracking-wider text-primary-textoTitle font-mono now">
              {formateoMoneda.format(totalVenta)}
            </p>
          </div>
          <div className="w-full flex gap-4 justify-between border-y border-primary-150 items-center">
            <p className="text-lg capitalize">total:</p>
            <p className="md:text-3xl text-end -tracking-wider text-primary-textoTitle font-mono now">
              {formateoMoneda.format(totalVenta)}
            </p>
          </div>
          <div className="w-full flex gap-4 justify-between text-2xl  border-b border-primary-150 items-center">
            <p className="text-lg">Su vuelto:</p>
            <span className="">${vueltoCalculo}</span>
          </div>
        </div>
        <BotoneraCarrito
          totalVenta={totalVenta}
          finalizarCompra={finalizarCompra}
        />
      </div>

      {modalConfirmacion && (
        <ModalConfirmacion
          setModalConfirmacion={setModalConfirmacion}
          finalizarCompra={finalizarCompra}
          productos={$productos}
          totalVenta={totalVenta}
        />
      )}
    </>
  );
}
