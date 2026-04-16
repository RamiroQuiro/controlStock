import Td from "./Td";

interface Columna {
  label: string;
  selector: string | ((row: any, index?: number) => any);
  cell?: (row: any) => any;
}

interface Props {
  id?: string;
  data: any;
  styleTr?: string;
  onClick?: (row: any) => void;
  renderBotonActions?: (row: any) => React.ReactNode;
  columnas: Columna[];
}

export default function Tr({ id, data, styleTr, onClick, renderBotonActions, columnas }: Props) {
  return (
    <tr
      onClick={() => onClick && onClick(data)}
      id={id}
      className={`
        ${styleTr || ''} 
        group transition-all duration-200 
        hover:bg-primary-100/5 
        ${data.activo === false ? 'opacity-60 bg-gray-50/50' : 'bg-transparent'}
      `}
    >
      {columnas?.map((col, i) => {
        const value = typeof col.selector === 'function' ? col.selector(data) : data[col.selector];
        
        return (
          <Td key={i}>
            {col.cell ? col.cell(data) : value}
          </Td>
        );
      })}
      
      {renderBotonActions && (
        <td className="px-4 py-3 text-right sticky right-0 bg-transparent group-hover:bg-primary-bg-claro/50 transition-colors">
          <div className="flex justify-end gap-2">
            {renderBotonActions(data)}
          </div>
        </td>
      )}
    </tr>
  );
}
