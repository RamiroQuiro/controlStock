import React, { useState } from 'react'
import Table from '../../../../components/tablaComponentes/Table'

export default function ConfeccionTablaEgresoTop({arrayProduct}) {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const columnas = [
        { label: 'N°', id: 1, selector: (row, index) => index + 1},
        { label: 'Descripcion', id: 3, selector: row => row.descripcion },
        { label: 'Categoria', id: 4, selector: row => row.categoria },
        { label: 'Vendido', id: 7, selector: row => row.vendida },
        { label: 'Stock', id: 8, selector: row => row.stock },
      ];

      const newArray=arrayProduct?.map((prod,i)=>{
        return {
          "N°":i+1,
          descripcion:prod?.producto?.descripcion,
          categoria:prod?.producto?.categoria,
          vendida:prod?.totalVendido,
          stock:prod?.producto?.stock,
        }
      })
      const handleSort = (columnId) => {
      if (sortColumn === columnId) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(columnId);
        setSortDirection("asc");
      }
    };
  

      const sortedRows = [...newArray].sort((a, b) => {
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
