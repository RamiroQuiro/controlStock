import React, { useEffect, useState } from 'react'
import Table from '../../../../components/tablaComponentes/Table'
import { useStore } from '@nanostores/react';
import { filtroBusqueda } from '../../../../context/store';
import { RenderActionsPacientes } from '../../../../components/tablaComponentes/RenderBotonesActions';
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
      { label: 'N°', id: 1, selector: (row, index) => index + 1},
      { label: 'codigo de barra', id: 2, selector: row => row.codigoBarra },
      { label: 'descripcion', id: 3, selector: row => row.descripcion },
      { label: 'categoria', id: 4, selector: row => row.categoria },
      { label: 'P.Compra', id: 5, selector: row => row.pCompra },
      { label: 'P.Venta', id: 6, selector: row => row.pVenta },
      { label: 'Stock', id: 7, selector: row => row.Stock },
      { label: 'Actualizacion', id: 8, selector: row => row.Actualizacion },
      {
        label: 'Acciones',
        id: 7,
        selector: row => (
          <div className="flex gap-x-2">
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => handleEdit(row?.id)}
            >
              Editar
            </button>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => handleDelete(row?.id)}
            >
              Eliminar
            </button>
            <button
              className="bg-green-500 text-white px-2 py-1 rounded"
              onClick={() => handleAtender(row?.id)}
            >
              Atender
            </button>
          </div>
        ),
      },
    ];
  
    return (
      <div className="w-full">
        {/* Tabla de pacientes */}
        <Table
          columnas={columnas}
          arrayBody={pacientesFiltrados}
          renderBotonActions={RenderActionsPacientes}
        />
      </div>
    );
  }