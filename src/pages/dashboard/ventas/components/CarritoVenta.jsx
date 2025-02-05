import { useStore } from "@nanostores/react";
import React, { useEffect, useState } from "react";
import { productosSeleccionadosVenta } from "../../../../context/store";
import { Captions } from "lucide-react";

export default function CarritoVenta({ userId }) {
  const $productos = useStore(productosSeleccionadosVenta);
  const [totalVenta, setTotalVenta] = useState(0);
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
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full flex flex-col mt-5 ">
      <p className="md:text-4xl text-primary-textoTitle">
        $ {formateoTotal(totalVenta)}
      </p>

      <button
        onClick={finalizarCompra}
        className="rounded-lg text-white flex items-center pl-4 justify-start hover:bg-blue-600/80 duration-300 mt-10 mb-4 border-2 border-gray-200 h-16 w-full bg-blue-600"
      >
        <Captions className="w-10 h-10" />{" "}
        <p className="text-3xl ml-4 font-bold tracking-widest ">Pagar</p>
      </button>
    </div>
  );
}
