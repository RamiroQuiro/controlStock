import React, { useEffect, useState } from 'react'
import Table from '../../../../components/tablaComponentes/Table'
import { useStore } from '@nanostores/react';
import { filtroBusqueda } from '../../../../context/store';
import {  RenderActionsProductos } from '../../../../components/tablaComponentes/RenderBotonesActions';
export default function ConfeccionTabla({productosData}) {

    const [pacientesFiltrados, setPacientesFiltrados] = useState(productosData); // Estado inicial igual a los datos completos
    const $filtro = useStore(filtroBusqueda).filtro;
  
    useEffect(() => {
      // Filtrar pacientes en función del filtr
      const filtrados = productosData?.filter(producto => {
        if ($filtro === 'todos') return true; // Mostrar todos si el filtro es 'todos'
        return (
        
          producto.codigoBarra.toString().includes($filtro) ||
          (producto?.descripcion?.toLowerCase() || '').includes($filtro) ||
          (producto?.categoria?.toLowerCase() || '').includes($filtro) ||
          (producto?.pCompra?.toString() || '').includes($filtro)
          (producto?.pVenta?.toString() || '').includes($filtro)
          (producto?.stock?.toString() || '').includes($filtro)
          (producto?.ultimaActualizacion?.toString() || '').includes($filtro)
        );
      });
  
      setPacientesFiltrados(filtrados);
    }, [$filtro, productosData]); // Ejecutar cada vez que cambie $filtro o productosData
  
    const columnas = [
      { label: 'N°', id: 1, selector: (row, index) => index + 1 },
      { label: 'Código', id: 2, selector: 'codigoBarra' },
      { label: 'Descripción', id: 3, selector: 'descripcion' },
      { label: 'Categoría', id: 4, selector: 'categoria' },
      { label: 'P. Compra', id: 5, selector: 'pCompra' },
      { label: 'P. Venta', id: 6, selector: 'pVenta' },
      { label: 'Stock', id: 7, selector: 'stock' },
      { label: 'Actualización', id: 8, selector: 'ultimaActualizacion' },
    ];
  
    return (
      <div className="w-full">
        {/* Tabla de pacientes */}
        <Table
          columnas={columnas}
          arrayBody={pacientesFiltrados}
          renderBotonActions={RenderActionsProductos}
        />
      </div>
    );
  }