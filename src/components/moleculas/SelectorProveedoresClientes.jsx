import React from "react";
import FormularioDeBusqueda from "../organismos/FormularioDeBusqueda";

export default function SelectorProveedoresClientes({
  dataSelect,
  proveedoresData,
  clientesData,
  formulario,
}) {
  return (
    <>
      {" "}
      <FormularioDeBusqueda
        arrayABuscar={
          formulario?.tipo == "ingreso" ? proveedoresData : clientesData
        }
        opcionesFiltrado={["nombre", "email", "dni", "id"]}
        placeholder={formulario?.tipo == "ingreso" ? 'Ingrese nombre, dni, id de proveedor' : 'Ingrese nombre, dni, id de cliente'}
      />
      <div
        className={`w-full my-3 - bg-red- h-7 flex items-center justify-evenly shadow-md text-sm ${dataSelect.nombre ? "bg-primary-400/70" : "bg-primary-texto"}  text-white font-semibold text-center rounded-md shadow-md text-primary-texto`}
      >
        {!dataSelect.nombre ? (
          <p>No hay {formulario?.tipo == "ingreso" ?'Proveedor':'Cliente' } seleccionado</p>
        ) : (
          <>
            {" "}
            <p>
              {" "}
              Nombre :{" "}
              <span className="uppercase text-primary- font-semibold">
                {dataSelect.nombre}
              </span>
            </p>
            <p>
              DNI:{" "}
              <span className="text-primary- font-semibold">
                {dataSelect.dni}
              </span>
            </p>
            <p>
              id:{" "}
              <span className="text-primary- font-semibold">
                {dataSelect.id}
              </span>
            </p>
          </>
        )}
      </div>
    </>
  );
}
