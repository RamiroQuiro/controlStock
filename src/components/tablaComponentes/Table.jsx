import React from "react";
import THead from "./THead";
import TBody from "./TBody";
import { reportPDF } from "../../context/store";

export default function Table({ columnas, arrayBody, styleTable, renderBotonActions,onClickRegistro }) {
  const onClick = (e) => {
    // Acción en caso de clic (vacío por ahora)
    onClickRegistro && onClickRegistro(e);
  };

  reportPDF.set({
    columnas,
    arrayBody,
  });

  return (
    <table
      className={`${styleTable} table-auto items-start bg-transparent w-full border-collapse  rounded-md border overflow-hidden`}
    >
      <THead columnas={columnas} arrayBody={arrayBody} />
      <TBody
        onClickRegistro={onClick}
        arrayBody={arrayBody}
        renderBotonActions={renderBotonActions} // Corregido
      />
    </table>
  );
}
