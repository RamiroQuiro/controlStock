import React from "react";
import FormularioDeBusqueda from "../organismos/FormularioDeBusqueda";

export default function SelectorProductos({listaProductos,productoSelect}) {
  return (
    <>
      {" "}
      <FormularioDeBusqueda
        placeholder={
          "Buscar producto por codigo de barra, descripcion, marca, modelo..."
        }
        arrayABuscar={listaProductos}
        opcionesFiltrado={[
          "codigoBarra",
          "descripcion",
          "categoria",
          'stock',
          "marca",
          "modelo",
        ]}
      />
      <div
        className={`w-full bg-red- h-7 flex items-center justify-evenly shadow-md text-sm ${productoSelect.descripcion ? "bg-primary-400/70" : "bg-primary-texto"}  text-white font-semibold text-center rounded-md shadow-md text-primary-texto`}
      >
        {!productoSelect.descripcion ? (
          <p>No Hay producto seleccionado</p>
        ) : (
          <>
            {" "}
            <p>
              {" "}
              Producto :{" "}
              <span className="uppercase text-primary- font-semibold">
                {productoSelect.descripcion}
              </span>
            </p>
            <p>
           Stock:{" "}
              <span className="text-primary- font-semibold">
                {productoSelect.stock}
              </span>
            </p>
            <p>
              codigo:{" "}
              <span className="text-primary- font-semibold">
                {productoSelect.codigoBarra}
              </span>
            </p>
          </>
        )}
      </div>
    </>
  );
}
