import React, { useEffect, useState } from 'react'
import CardProductosStock from './CardProductosStock'
import { useStore } from '@nanostores/react'
import { filtroBusqueda } from '../../../../context/store'

export default function ConfeccionListadoProductos({productosArray}) {
 
    const [filtradoPaceiente, setFiltradoPaceiente] = useState(productosArray)
    const $filtro = useStore(filtroBusqueda).filtro;
  
    useEffect(() => {
      // Filtrar pacientes en función del filtr
      const filtrados = productosArray.filter(prod => {
        if ($filtro === 'todos') return true; // Mostrar todos si el filtro es 'todos'
        return (
          prod.codigoBarra.toLowerCase().includes($filtro) ||
          prod.descripcion.toLowerCase().includes($filtro) ||
          prod?.categoria?.toLowerCase().includes($filtro) ||
          prod?.marca?.toLowerCase().includes($filtro) ||
          prod?.modelo?.toLowerCase().includes($filtro) ||
          prod?.stock?.toString().includes($filtro) ||
          prod?.localizacion?.toLowerCase().includes($filtro)
        );
      });
  
      setFiltradoPaceiente(filtrados);
    }, [$filtro, productosArray]); // Ejecutar cada vez que cambie $filtro o pacientesData
  
 
    return filtradoPaceiente?.map((prod, i) => <CardProductosStock prod={prod} key={i} />)
  
}
