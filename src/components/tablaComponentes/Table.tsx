import React from "react";
import THead from "./THead";
import TBody from "./TBody";
import { reportPDF } from "../../context/store";

interface TableProps {
  columnas?: any[];
  arrayBody?: any[];
  styleTable?: string;
  renderBotonActions?: ((row: any) => React.ReactNode) | null;
  onClickRegistro?: ((row: any) => void) | null;
}

export default function Table({
  columnas = [],
  arrayBody = [],
  styleTable = "",
  renderBotonActions = null,
  onClickRegistro = null,
}: TableProps) {
  // Sincronizar con el store para reportes (PDF/Excel)
  React.useEffect(() => {
    reportPDF.set({
      columnas: (columnas as any[]) || [],
      arrayBody: (arrayBody as any[]) || [],
    });
  }, [columnas, arrayBody]);

  return (
    <div
      className={`overflow-x-auto w-full custom-scrollbar animate-aparecer ${styleTable}`}
    >
      <table className="w-full border-collapse text-left border-0">
        <THead columnas={columnas} renderBotonActions={renderBotonActions} />
        <TBody
          columnas={columnas}
          onClickRegistro={onClickRegistro}
          arrayBody={arrayBody}
          renderBotonActions={renderBotonActions}
        />
      </table>
    </div>
  );
}
