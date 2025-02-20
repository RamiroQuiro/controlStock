import React from 'react'
import DivReact from '../../../../components/atomos/DivReact'
import formatDate from '../../../../utils/formatDate'

export default function DetalleFotoDetalleProducto({ infoProducto,ultimaRepo }) {
  return (
    <DivReact>
    {/* Sección de imagen */}
    <div className="flex items-start justify-normal gap-3">
      <div className="w-full flex flex-col md:w-[60%] items-center justify-start relative rounded-lg overflow-hidden ">
        <div className="h-[80%] flex w-full rounded-lg  items-center ">
          <img
            src={infoProducto.productData?.srcPhoto}
            alt={infoProducto.productData?.descripcion}
            className=" object-scale-down w-full h-60 rounded-lg overflow-hidden hover:scale-105 duration-500"
          />
        </div>
      </div>

      {/* Sección de detalles */}
      <div className="w-full md:w-1/3 flex text-sm flex-col relative gap-">
        <div className="flex flex-col gap-1">
          <div className="flex w-full items-center justify-start gap-3 ">
            <span className="">Codigo/ID:</span>
            <p className="font-medium text-primary-textoTitle">
              {" "}
              {infoProducto.productData?.id}
            </p>
          </div>
          <div className="flex w-full items-center justify-start gap-3 ">
            <span className="">Descripción:</span>
            <p className="capitalize font-medium text-primary-textoTitle">
              {infoProducto.productData?.descripcion}
            </p>
          </div>
          <div className="flex w-full items-center justify-start gap-3 ">
            <span className="">Categoria:</span>
            <p className="capitalize font-medium text-primary-textoTitle">
              {infoProducto.productData?.categoria}
            </p>
          </div>
          <div className="flex w-full items-center justify-start gap-3 ">
            <span className="">Localización:</span>
            <p className="capitalize font-medium text-primary-textoTitle">
              {infoProducto.productData?.localizacion}
            </p>
          </div>
          <div className="flex w-full items-center justify-start gap-3 ">
            <span className="">Marca:</span>
            <p className="capitalize font-medium text-primary-textoTitle">
              {infoProducto.productData?.marca}
            </p>
          </div>
          <div className="flex w-full items-center justify-start gap-3 ">
            <span className="">Stock:</span>
            <p className="capitalize font-medium text-primary-textoTitle">
              {infoProducto.productData?.stock}
            </p>
          </div>
          <div className="flex w-full items-center justify-start gap-3 ">
            <span className="">Alerta de Stock:</span>
            <p className="capitalize font-medium text-primary-textoTitle">
              {infoProducto.productData?.alertaStock}
            </p>
          </div>
          <div className="flex w-full items-center justify-start gap-3 ">
            <span className="">Codigo de Barra:</span>
            <p className="capitalize font-medium text-primary-textoTitle">
              {infoProducto.productData?.codigoBarra}
            </p>
          </div>
          <div className="flex w-full items-center justify-start gap-3 ">
            <span className="">Ultima Reposición:</span>
            <p className="capitalize font-medium text-primary-textoTitle">
              {formatDate(ultimaRepo)}
            </p>
          </div>
        </div>
      </div>
    </div>
  </DivReact>
  )
}
