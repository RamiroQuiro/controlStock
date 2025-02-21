import { useStore } from "@nanostores/react";
import React, { useEffect, useState } from "react";
import { productosSeleccionadosVenta } from "../../../../context/store";
import { showToast } from "../../../../utils/toast/toastShow";
import ModalConfirmacion from "./ModalConfirmacion";
import { loader } from "../../../../utils/loader/showLoader";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import BotoneraCarrito from "./BotoneraCarrito";
import ModalCliente from "./ModalCliente";
import BtnBusquedaCliente from "./BtnBusquedaCliente";
import BusquedaClientes from "./BusquedaClientes";

export default function CarritoVenta({ userId }) {
  const $productos = useStore(productosSeleccionadosVenta);
  const [totalVenta, setTotalVenta] = useState(0);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [pagaCon, setPagaCon] = useState(0);
  const [isBusquedaModal, setIsBusquedaModal] = useState(false);
  const [cliente, setCliente] = useState({
    nombre: "consumidor final",
    dni: "00000000",
    celular: "0000000000",
    id:'1'
  });

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


  const formateoTotal = (number) =>
    new Intl.NumberFormat("ar-AR", {
      style: "currency",
      currency: "ARS",
    }).format(number);

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

  return (
    <>
      {isBusquedaModal && (
        <ModalCliente onClose={() => setIsBusquedaModal(false)}>
          <BusquedaClientes onClose={setIsBusquedaModal} setCliente={setCliente} />
        </ModalCliente>
      )}
      <div className="w-full flex flex-col items-start justify-start h-full mt-5 ">
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
        <p className="md:text-3xl w-full text-end -tracking-wider text-primary-textoTitle font-mono now">
          $ {formateoTotal(totalVenta)}
        </p>
        <div className="w-full mt-3 text-xl capitalize inline-flex gap-3">
          <InputComponenteJsx
            name={"cliente"}
            value={cliente?.nombre}
            type={"text"}
          />
          <BtnBusquedaCliente
            cliente={cliente}
            onClick={() => setIsBusquedaModal(true)}
          />
        </div>
        <div className="w-full mt-3 inline-flex">
          <p className="text-3xl mr-2">$</p>
          <InputComponenteJsx
            name={"dineroAbonado"}
            placeholder={"Paga con ..."}
            handleChange={handlePagaCon}
          />
        </div>
        <div className="w-full text-primary-textoTitle font- text-2xl text-end flex flex-col items-end justify-between mt-3">
          <p className="text-lg">Su vuelto:</p>
          <span className="">${vueltoCalculo}</span>
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
