import { useStore } from "@nanostores/react";
import React, { useEffect, useState } from "react";
import { productosSeleccionadosVenta } from "../../../../context/store";
import { showToast } from "../../../../utils/toast/toastShow";
import ModalConfirmacion from "./ModalConfirmacion";
import { loader } from "../../../../utils/loader/showLoader";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import BusquedaCliente from "./BusquedaCliente";
import BotoneraCarrito from "./BotoneraCarrito";
import Table from "../../../../components/tablaComponentes/Table";
import { clienteColumns } from "../../../../types/columnasTables";

export default function CarritoVenta({ userId }) {
  const $productos = useStore(productosSeleccionadosVenta);
  const [totalVenta, setTotalVenta] = useState(0);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [pagaCon, setPagaCon] = useState(0)
  const [isResultados, setIsResultados] = useState(false)
  const [cliente, setCliente] = useState("");
  const [clientesEncontrados, setClientesEncontrados] = useState([]);

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

  const handleCliente = async (e) => {
    e.preventDefault();
    const valor = e.target.value;
    setCliente(valor);

    if (valor.trim() === "") {
      setClientesEncontrados([]); // Resetea resultados si el input está vacío
      return;
    }

    if (valor.length >= 3) {
      try {
        const responseFetch = await fetch(`/api/clientes/buscarCliente?search=${valor}`);
        const data = await responseFetch.json();

        if (data.status === 200) {
          setClientesEncontrados(data.data); // Suponiendo que `data.clientes` es un array
          setIsResultados(true)
        } else {
          setClientesEncontrados([]);
          showToast(data.msg, { background: "bg-primary-400" });
        }
      } catch (error) {
        console.error("Error en la búsqueda de clientes:", error);
        setClientesEncontrados([]);
        showToast("Error al buscar clientes", { background: "bg-red-500" });
      }
    }
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

  const armandoNewArray = (newArray) => {
    return newArray.map((element, i) => {
      return {
        id: element.id,
        "N°": i + 1,
        nombre: element.nombre,
        dni: element.dni,
        email: element.email,
        celular: element.celular
      }
    })
  }

  return (
    <>
      {
        isResultados &&
        <div className="top-0 left-0 fixed  w-screen h-screen flex items-center justify-center  -blur-sm">
          <div className="w-4/5 bg-white border shadow-md animate-apDeArriba shadow-black/60 h-96 flex items-center justify-normal gap-2 rounded-lg">
            <Table arrayBody={clientesEncontrados} columnas={clienteColumns} />
          </div>
        </div>}
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
        <BusquedaCliente handleCliente={handleCliente} />
        <div className="w-full mt-3 inline-flex">
          <p className="text-3xl mr-2">$</p>
          <InputComponenteJsx name={'dineroAbonado'} placeholder={'Paga con ...'} handleChange={handlePagaCon} />
        </div>
        <div className="w-full text-primary-textoTitle font- text-2xl text-end flex flex-col items-end justify-between mt-3">
          <p className="text-lg">Su vuelto:</p>
          <span className="">${vueltoCalculo}</span>
        </div>
        <BotoneraCarrito totalVenta={totalVenta} finalizarCompra={finalizarCompra} />
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
