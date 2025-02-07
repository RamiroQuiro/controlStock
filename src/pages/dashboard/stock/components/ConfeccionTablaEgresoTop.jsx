import React, { useState } from 'react'
import Table from '../../../../components/tablaComponentes/Table'

export default function ConfeccionTablaEgresoTop() {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const columnas = [
        { label: 'N°', id: 1, selector: (row, index) => index + 1},
        { label: 'descripcion', id: 3, selector: row => row.descripcion },
        { label: 'categoria', id: 4, selector: row => row.categoria },
        { label: 'Vendida', id: 7, selector: row => row.Stock },
        { label: 'Stock', id: 8, selector: row => row.Stock },
      ];

    const handleSort = (columnId) => {
      if (sortColumn === columnId) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(columnId);
        setSortDirection("asc");
      }
    };
  
    const rows = [
        { descripcion: "Producto A", categoria: "Categoría 1", Vendida: 100, Stock: 50 },
        { descripcion: "Producto B", categoria: "Categoría 2", Vendida: 80, Stock: 30 },
        { descripcion: "Producto C", categoria: "Categoría 3", Vendida: 120, Stock: 20 },
      ];

      const sortedRows = [...rows].sort((a, b) => {
        if (!sortColumn) return 0;
        const column = columnas.find(col => col.id === sortColumn);
        const valueA = column.selector(a);
        const valueB = column.selector(b);
    
        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
   
  return (
    <div className="bg-white rounded-lg text-sm shadow py-3 overflow-auto mx-auto">
    <table className="w-full">
      <thead>
        <tr>
          {columnas.map((col) => (
            <th
              key={col.id}
              className="px-2 py-1 font-semibold text-left cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort(col.id)}
            >
              {col.label}
              {sortColumn === col.id && (sortDirection === "asc" ? "⇣" : " ⇡")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row, index) => (
          <tr key={index} className="hover:bg-gray-50">
            {columnas.map((col) => (
              <td key={col.id} className="px-2 py-1 border-t">
                {col.selector(row, index)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  )
}
