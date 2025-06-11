import { useStore } from "@nanostores/react";
import React, { useEffect } from "react";
import { tiendaStore } from "../../../../../context/store";

export default function Titulo1({empresaId}) {
  const { data } = useStore(tiendaStore);
  useEffect(() => {
    const fetcheoProductos=async()=>{
      try {
        const response = await fetch(`/api/tienda/${empresaId}`);
        const data = await response.json();
        tiendaStore.set({loading:false,data:data,error:null})
      } catch (error) {
        console.error('Error fetching products:', error);
        tiendaStore.set({loading:false,data:null,error:error.message})
      }
    }
    fetcheoProductos()
  }, []); 

  return (
    <h1 className="bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
      {data?.configuracionEmpresa?.titulo1}
    </h1>
  );
}
