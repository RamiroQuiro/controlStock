import { useStore } from '@nanostores/react';
import { columnSelectTable } from '../../context/store';
import Tr from './Tr';

interface Columna {
  label: string;
  selector: string | ((row: any, index?: number) => any);
  cell?: (row: any) => any;
}

interface Props {
  arrayBody: any[];
  renderBotonActions?: ((row: any) => React.ReactNode) | null;
  onClickRegistro?: ((row: any) => void) | null;
  columnas: Columna[];
}

export default function TBody({ arrayBody, renderBotonActions, onClickRegistro, columnas }: Props) {
  const $columnSelect = useStore(columnSelectTable);

  const sortData = (data: any[]) => {
    if (!$columnSelect.seleccion || !data.length) return data;

    return [...data].sort((a: any, b: any) => {
      const getVal = (item: any) => {
        const col = columnas?.find(c => c.selector === $columnSelect.seleccion);
        if (col && typeof col.selector === 'function') {
          return col.selector(item);
        }
        return item[$columnSelect.seleccion];
      };

      const aValue = getVal(a);
      const bValue = getVal(b);

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string') {
        const result = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
        return $columnSelect.asc ? result : -result;
      }

      return $columnSelect.asc ? aValue - bValue : bValue - aValue;
    });
  };

  const sortedData = sortData(arrayBody || []);

  return (
    <tbody className="divide-y divide-primary-100/10">
      {sortedData.length === 0 ? (
        <tr>
          <td
            colSpan={(columnas?.length || 0) + (renderBotonActions ? 1 : 0)}
            className="text-sm font-medium text-gray-400 text-center py-10 bg-white/50"
          >
            No hay elementos para mostrar
          </td>
        </tr>
      ) : (
        sortedData.map((item: any, i: number) => (
          <Tr 
            key={item.id || i} 
            data={item} 
            columnas={columnas}
            onClick={onClickRegistro || undefined} 
            renderBotonActions={renderBotonActions || undefined} 
          />
        ))
      )}
    </tbody>
  );
}
