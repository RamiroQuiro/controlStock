import React from "react";
import Button3 from "../atomos/Button3";
import Table from "../tablaComponentes/Table";

export default function PerfilProducto({ infoProducto }) {
  const columnas = [
    { label: "N°", id: 1, selector: (row, index) => "N°" },
    { label: "Tipo", id: 2, selector: (row) => row.tipo },
    { label: "Cantidad", id: 3, selector: (row) => row.cantidad },
    { label: "Fecha", id: 6, selector: (row) => row.fecha },
  ];

  const newArray = infoProducto.stockMovimiento?.map((mov, i) => {
    return {
      "N°": i + 1,
      tipo: mov.tipo,
      cantidad: mov.cantidad,
      fecha: mov.fecha,
    };
  });
  return (
    <div className="w-full flex flex-col gap-6   rounded-lg items-stretch p-3">
      <div className="flex items-start justify-normal bg-white w-full gap-5 sticky  top-5">
        {/* Sección de imagen */}
        <div className="w-full flex flex-col md:w-3/4 items-center justify-start relative pb-8 rounded-lg overflow-hidden ">
          <div className="h-[80%] flex w-full  items-center ">
            <img
              src={infoProducto.productData?.srcPhoto}
              alt={infoProducto.productData?.descripcion}
              className=" object-cover w-full h-60  hover:scale-110 duration-500"
            />
          </div>
          <div className="w-full items-center justify-evenly flex gap-4 mt-6">
          
            <Button3 className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg shadow-md transition duration-300">
              Editar
            </Button3>
            <Button3 className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition duration-300">
              Eliminar
            </Button3>
          </div>
        </div>

        {/* Sección de detalles */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800">
            Detalles del Producto
          </h2>
          <div className="flex flex-col gap-2">
            <p>
              <span className="font-medium text-gray-600">ID:</span>{" "}
              {infoProducto.productData?.id}
            </p>
            <p>
              <span className="font-medium text-gray-600">Descripción:</span>{" "}
              {infoProducto.productData?.descripcion}
            </p>
            <p>
              <span className="font-medium text-gray-600">Categoría:</span>{" "}
              {infoProducto.productData?.categoria}
            </p>
            <p>
              <span className="font-medium text-gray-600">Localización:</span>{" "}
              {infoProducto.productData?.localizacion}
            </p>
            <p>
              <span className="font-medium text-gray-600">Marca:</span>{" "}
              {infoProducto.productData?.marca}
            </p>
            <p>
              <span className="font-medium text-gray-600">Stock:</span>{" "}
              {infoProducto.productData?.stock}
            </p>
            <p>
              <span className="font-medium text-gray-600">
                Alerta de Stock:
              </span>{" "}
              {infoProducto.productData?.alertaStock}
            </p>
          </div>
        </div>
      </div>
      {/* Historial de movimiento */}
      <div className="mt-6">
        <h3 className="text-lg font-bold text-gray-700 mb-2">
          Historial de Movimiento
        </h3>
        <Table arrayBody={newArray} columnas={columnas} />
      </div>
    </div>
  );
}
