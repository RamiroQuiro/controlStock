import { useStore } from '@nanostores/react';
import { columnSelectTable } from '../../context/store';
import Th from './Th';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

interface Columna {
  label: string;
  selector: string | ((row: any, index?: number) => any);
  cell?: (row: any) => any;
}

interface Props {
  columnas: Columna[];
  renderBotonActions?: ((row: any) => React.ReactNode) | null;
}

export default function THead({ columnas, renderBotonActions }: Props) {
  const $columnSelect = useStore(columnSelectTable);

  const handleSort = (selector) => {
    if (!selector) return;
    columnSelectTable.set({
      asc: selector === $columnSelect.seleccion ? !$columnSelect.asc : true,
      seleccion: selector,
    });
  };

  return (
    <thead className="bg-gray-50/50 backdrop-blur-sm sticky top-0 z-20 border-b border-primary-100/10">
      <tr>
        {columnas?.map((columna, i) => (
          <Th
            key={i}
            onClick={() => handleSort(columna.selector)}
            styleTh={`group transition-colors over:bg-primary-100/5 ${
              $columnSelect.seleccion === columna.selector ? 'text-primary-100' : 'text-gray-500'
            }`}
          >
            <div className="flex items-center gap-1.5 justify-start">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {columna.label}
              </span>
              {columna.selector && (
                <div className="text-gray-400 group-hover:text-primary-100 transition-colors">
                  {$columnSelect.seleccion === columna.selector ? (
                    $columnSelect.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  ) : (
                    <ChevronsUpDown size={14} className="opacity-0 group-hover:opacity-100" />
                  )}
                </div>
              )}
            </div>
          </Th>
        ))}
        {renderBotonActions && (
          <th className="py-3 px-4 text-right sticky right-0 bg-gray-50/50 border-0">
             <span className="font-semibold uppercase tracking-wider text-[11px] text-gray-500">Acciones</span>
          </th>
        )}
      </tr>
    </thead>
  );
}
