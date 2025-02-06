import { useStore } from "@nanostores/react";
import React, { useEffect, useState } from "react";
import { productosSeleccionadosVenta } from "../../../../context/store";
import { Captions } from "lucide-react";
import { showToast } from "../../../../utils/toast/toastShow";
import ModalConfirmacion from "./ModalConfirmacion";

export default function CarritoVenta({ userId }) {
  const $productos = useStore(productosSeleccionadosVenta);
  const [totalVenta, setTotalVenta] = useState(0);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [ticketOk, setTicketOk] = useState(false)
  useEffect(() => {
    const sumaTotal = $productos.reduce(
      (acc, producto) => acc + producto.precio * producto.cantidad,
      0
    );
    setTotalVenta(sumaTotal);
  }, [$productos]);

  const formateoTotal = (number) =>
    new Intl.NumberFormat("ar-AR", {
      style: "currency",
      currency: "ARS",
    }).format(number);

  const finalizarCompra = async () => {
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
        }),
      });
      const data = await responseFetch.json();
      if (data.status == 200) {
        showToast(data.msg, { background: "bg-green-600" });
        setTotalVenta(0);
        setTicketOk(true)
        // setTimeout(()=>window.location.reload(),1000)
      }
    } catch (error) {
      console.log(error);
      showToast("error al transaccionar", { background: "bg-primary-400" });
    }
  };


  return (
    <>
      <div className="w-full flex flex-col mt-5 ">
        <p className="md:text-3xl -tracking-wider text-primary-textoTitle font-mono now">
          $ {formateoTotal(totalVenta)}
        </p>

        <button
          disabled={totalVenta == 0 ? true : false}
          onClick={()=>setModalConfirmacion(true)}
          className="rounded-lg disabled:bg-blue-600/50 text-white flex items-center pl-4 justify-start hover:bg-blue-600/80 duration-300 mt-10 mb-4 border-2 border-gray-200 h-16 w-full bg-blue-600"
        >
          <Captions className="w-10 h-10" />{" "}
          <p className="text-3xl ml-4 font-semibold font-mono widest ">Pagar</p>
        </button>
      </div>
      {modalConfirmacion && (
       <ModalConfirmacion ticketOk={ticketOk} setModalConfirmacion={setModalConfirmacion} finalizarCompra={finalizarCompra} productos={$productos} totalVenta={totalVenta} />
      )}
    </>
  );
}
