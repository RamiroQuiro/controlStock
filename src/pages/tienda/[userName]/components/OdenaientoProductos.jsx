import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { tiendaStore } from "../../../../context/store";

export default function OdenaientoProductos() {

    const { data } = useStore(tiendaStore);
const [ordenamiento, setOrdenamiento] = useState('')
    const handleOrdenar = (tipo) => {
        let productosOrdenados = [...(data.productos || [])];
        setOrdenamiento(tipo)
        switch (tipo) {
          case "precioBajo":
            productosOrdenados.sort((a, b) => a.pVenta - b.pVenta);
            break;
          case "masVendidos":
            productosOrdenados.sort((a, b) => (b.ventas || 0) - (a.ventas || 0));
            break;
          case "ofertas":
            productosOrdenados = productosOrdenados.filter(p => p.oferta === true);
            break;
          case "nuevos":
            productosOrdenados.sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso));
            break;
          default:
            break;
        }
      
        tiendaStore.set({
          ...tiendaStore.get(),
          data: { ...data, productos: productosOrdenados },
        });
      };
      
      
  return (
    <div className="flex flex-wrap w-full text-gray-500 border px-1 py-2 text-xs rounded-lg gap-1 lowercase tracking-tight">
    <button
      className={`px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-100 transition ${ordenamiento === "precioBajo" ? "bg-gray-100" : ""}`}
      onClick={() => handleOrdenar("precioBajo")}
    >
      Por Precio bajo
    </button>
    <button
      className={`px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-100 transition ${ordenamiento === "masVendidos" ? "bg-gray-100" : ""}`}
      onClick={() => handleOrdenar("masVendidos")}
    >
      Más Vendidos
    </button>
    <button
      className={`px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-100 transition ${ordenamiento === "ofertas" ? "bg-gray-100" : ""}`}
      onClick={() => handleOrdenar("ofertas")}
    >
      Ofertas
    </button>
    <button
      className={`px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-100 transition ${ordenamiento === "nuevos" ? "bg-gray-100" : ""}`}
      onClick={() => handleOrdenar("nuevos")}
    >
      Nuevos Ingresos
    </button>
  </div>
  
  );
}
