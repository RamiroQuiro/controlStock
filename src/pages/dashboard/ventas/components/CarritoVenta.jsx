import { useStore } from "@nanostores/react";
import React, { useEffect, useState } from "react";
import { productosSeleccionadosVenta } from "../../../../context/store";
import { Captions } from "lucide-react";
import { showToast } from "../../../../utils/toast/toastShow";
import ModalConfirmacion from "./ModalConfirmacion";
import Ticket from "../../../../components/organismos/ticket";
import { loader } from "../../../../utils/loader/showLoader";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";

export default function CarritoVenta({ userId }) {
  const $productos = useStore(productosSeleccionadosVenta);
  const [totalVenta, setTotalVenta] = useState(0);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [pagaCon, setPagaCon] = useState(0)
  const [cliente, setCliente] = useState({})
  const [vueltoCalculo, setVueltoCalculo] = useState(0)
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
    return formateoTotal(vueltoCalculado >= 0 ? vueltoCalculado : 0)
  }


  const handlePagaCon = (e) => {
    setPagaCon(e)
    setVueltoCalculo(vuelto(e))
  }

  const handleCliente=(e)=>{
    setCliente(e)
  }
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
          clienteId: "1",
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
        <div className="w-full mt-3 inline-flex">
          <InputComponenteJsx name={'cliente'} placeholder={'Busqueda Cliente'} handleChange={handleCliente} />
        </div>
        <div className="w-full mt-3 inline-flex">
          <p className="text-3xl mr-2">$</p>
          <InputComponenteJsx name={'dineroAbonado'} placeholder={'Paga con ...'} handleChange={handlePagaCon} />
        </div>
        <div className="w-full text-primary-textoTitle font- text-2xl text-end flex flex-col items-end justify-between mt-3">
          <p className="text-lg">Su vuelto:</p>
          <span className="">${vueltoCalculo}</span>
        </div>
        <div className="flex flex-col items-start justify-normal w-full space-y-2">
          <button
            disabled={totalVenta == 0 ? true : false}
            onClick={finalizarCompra}
            className="rounded-lg disabled:bg-blue-600/50 text-white flex items-center pl-4 justify-start hover:bg-blue-600/80 duration-300 mt-8 m border-2 border-gray-200 h-16 w-full bg-blue-600"
          >
            <Captions className="w-10 h-10" />{" "}
            <p className="text-3xl ml-4 font-semibold font-mono widest ">
              Pagar
            </p>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg disabled:bg-blue-600/50 -translate-y- flex items-center pl-4 justify-start hover:bg-blue-600/40 duration-300 mt-10 mb-4 border-2 border-primary-texto h-16 w-full bg-gray-100 text-primary-texto"
          >
            <Captions className="w-10 h-10" />{" "}
            <p className="text-3xl ml-4 font-semibold font-mono widest ">
              Cancelar
            </p>
          </button>
        </div>
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
