import { useStore } from "@nanostores/react";
import ConfeccionTablaEgresoTop from "./ConfeccionTablaEgresoTop";
import { stockStore } from "../../../../context/store";
import { useMemo } from "react";

export default function ContenedorTablaTopEgreso({label}) {
  const { data, loading, error } = useStore(stockStore);

  const productosFormateados = useMemo(() => {
    
    if(label=="topMasVendidos"){
      if (!data?.stats.topMasVendidos) return [];
      return data.stats.topMasVendidos.map((prod, i) => ({
        "N°": i + 1,
        descripcion: prod?.descripcion || 'Sin descripción',
        categoria: prod?.categoria || 'Sin categoría',
        vendida: prod?.totalVendido || 0,
      stock: prod?.stock || 0,
    }));}
    else if(label=="topMenosVendidos"){
      if (!data?.stats.topMenosVendidos) return [];
      return data.stats.topMenosVendidos.map((prod, i) => ({
        "N°": i + 1,
        descripcion: prod?.descripcion || 'Sin descripción',
        categoria: prod?.categoria || 'Sin categoría',
        vendida: prod?.totalVendido || 0,
        stock: prod?.stock || 0,
      }));
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-start justify-start bg-primary-bg-componentes w-full p-2 animate-pulse">
        {[1, 2, 3].map((item) => (
          <div key={item} className="w-full h-10 bg-gray-200 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start justify-start bg-primary-bg-componentes w-full p-2">
        <p className="text-red-500">Error al cargar los datos: {error}</p>
      </div>
    );
  }


  if (!productosFormateados.length) {
    return (
      <div className="flex flex-col items-start justify-start bg-primary-bg-componentes w-full p-2">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-start bg-primary-bg-componentes w-full p-2">
      <ConfeccionTablaEgresoTop 
        arrayProduct={productosFormateados} 
      />
    </div>
  );
}