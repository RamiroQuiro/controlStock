import { useState, useEffect } from "react";
import { DetalleProveedor } from "./DetalleProveedor";
import { ContenedorEstadisticaProveedor } from "./ContenedorEstadisticaProveedor";
import { HistorialComprasProveedor } from "./HistorialComprasProveedor";
import type { Proveedor } from "../../../../../types";
import ConfeccionTablaEgresoTop from "../../../stock/components/ConfeccionTablaEgresoTop";
import DivBox1 from "../../../../../components/atomos/DivBox1.astro";
import DivReact from "../../../../../components/atomos/DivReact";
import VariacionPrecioProductos from "./VariacionPrecioProductos";

interface Compra {
  id: string;
  fecha: number;
  total: number;
  estado: string;
}

export default function PerfilProveedor({ proveedor }: { proveedor: Proveedor }) {
  const [comprasProveedor, setComprasProveedor] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [estadisticas, setEstadisticas] = useState({
    totalGastado: 0,
    promedioCompra: 0,
    frecuenciaCompra: 0,
    productosMasVendidos:[],
    cantidadCompras: 0,
    ultimaCompra: null,
    variacionPrecios: [],
  });
console.log('proveedor',proveedor)
  useEffect(() => {
    cargarHistorialCompras();
  }, []);

  const cargarHistorialCompras = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/proveedores/${proveedor.id}/compras`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": proveedor.userId,
        },
      });
      const data = await response.json();
      setComprasProveedor(data.compras);
      console.log(data);
      setEstadisticas(data.estadisticas);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setLoading(false);
      setError(error instanceof Error ? error.message : "Error desconocido");
    }
  };
  // const cargarEstadisticas = async () => {
  //   try {
  //     const response = await fetch(`/api/proveedores/${proveedor.id}/estadisticas`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         "x-user-id": proveedor.userId,
  //       },
  //     });
  //     const data = await response.json();

  //     if (!response.ok) throw new Error(data.message);
  //     console.log(data)
  //     setEstadisticas(data.estadisticas);
  //     setLoading(prev => ({ ...prev, estadisticas: false }));
  //   } catch (error) {
  //     console.error("Error al cargar estadísticas:", error);
  //     setError(prev => ({
  //       ...prev,
  //       estadisticas: error instanceof Error ? error.message : 'Error desconocido'
  //     }));
  //     setLoading(prev => ({ ...prev, estadisticas: false }));
  //   }
  // };
  
  const newArray=estadisticas?.productosMasVendidos?.map((prod,i)=>{
    return {
      "N°":i+1,
      descripcion:prod?.producto?.descripcion,
      categoria:prod?.producto?.categoria,
      vendida:prod?.totalVendido,
      stock:prod?.producto?.stock,
    }
  })
  
  return (
    <div className="flex flex-col w-full items-center justify-normal gap-3">
      <div className="flex md:flex-row flex-col items-stretch justify-between w-full gap-3">
        {/* Información Principal */}
        <div className="w-1/3 flex">
          <DetalleProveedor proveedor={proveedor} />
        </div>
        <div className="w-2/3 flex">
          {/* Estadísticas */}
          <ContenedorEstadisticaProveedor
            loading={loading}
            estadisticasProveedor={estadisticas}
          />
        </div>
      </div>
      <div className="flex w-full items-start justify-center gap-3">
        <div className="w-2/3 flex">
          {/* Historial de Compras */}
          <HistorialComprasProveedor
            loading={loading}
            comprasProveedor={comprasProveedor}
          />
        </div>
        <div className="w-1/3 flex items-stretch justify-normal">
          <DivReact className="w-full">
            <h2 className="text-xl font-semibold mb-4">
              Top Productos Vendidos
            </h2>
            <ConfeccionTablaEgresoTop arrayProduct={newArray} client:load />
            <h2 className="text-xl font-semibold mt-4 mb-2">
            Variacion de Precios
            </h2>
            <VariacionPrecioProductos variacionPrecios={estadisticas?.variacionPrecios} />
          </DivReact>
        </div>
      </div>
    </div>
  );
}
