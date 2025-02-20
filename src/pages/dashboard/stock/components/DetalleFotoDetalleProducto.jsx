import React from "react";
import DivReact from "../../../../components/atomos/DivReact";
import formatDate from "../../../../utils/formatDate";
import InputFormularioSolicitud from "../../../../components/moleculas/InputFormularioSolicitud";

export default function DetalleFotoDetalleProducto({
  infoProducto,
  disableEdit,
  ultimaRepo,
  handleChangeForm,
  formulario,
}) {


  console.log('esta disable?',infoProducto)
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
              <InputFormularioSolicitud
                disabled={disableEdit}
                onchange={handleChangeForm}
                className={"text-primary-textoTitle font-semibold animate-aparecer"}
                value={disableEdit ? infoProducto.productData?.descripcion : formulario?.descripcion}
                name={"descripcion"}
                type={"text"}
              />
            </div>
            <div className="flex w-full items-center justify-start gap-3 ">
              <span className="">Categoria:</span>
              <InputFormularioSolicitud
                disabled={disableEdit}
                onchange={handleChangeForm}
                className={"text-primary-textoTitle font-semibold animate-aparecer"}
                value={disableEdit ? infoProducto.productData?.categoria : formulario?.categoria}
                name={"categoria"}
                type={"text"}
              />
            </div>
            
            <div className="flex w-full items-center justify-start gap-3 ">
              <span className="">Localización:</span>
              <InputFormularioSolicitud
                disabled={disableEdit}
                onchange={handleChangeForm}
                className={"text-primary-textoTitle font-semibold animate-aparecer"}
                value={disableEdit ? infoProducto.productData?.localizacion : formulario?.localizacion}
                name={"localizacion"}
                type={"text"}
              />
            </div>
            <div className="flex w-full items-center justify-start gap-3 ">
              <span className="">Marca:</span>
              <InputFormularioSolicitud
                className={"text-primary-textoTitle font-semibold animate-aparecer"}
                value={disableEdit ? infoProducto.productData?.marca : formulario?.marca}
                name={"marca"}
                type={"text"}
                onchange={handleChangeForm}
                disabled={disableEdit}
              />
            </div>
            <div className="flex w-full items-center justify-start gap-3 ">
              <span className="">Stock:</span>
              <p className="capitalize font-medium text-primary-textoTitle">
                {infoProducto.productData?.stock}
              </p>
            </div>
            <div className="flex w-full items-center justify-start gap-3 ">
              <span className="">Alerta de Stock:</span>
              <InputFormularioSolicitud
                disabled={disableEdit}
                className={"text-primary-textoTitle font-semibold animate-aparecer"}
                value={disableEdit ? infoProducto.productData?.alertaStock : formulario?.alertaStock}
                name={"alertaStock"}
                type={"text"}
                onchange={handleChangeForm}
              />
            </div>
            <div className="flex w-full items-center justify-start gap-3 ">
              <span className="">Codigo de Barra:</span>
              <InputFormularioSolicitud
                disabled={disableEdit}
                className={"text-primary-textoTitle font-semibold animate-aparecer"}
                value={disableEdit ? infoProducto.productData?.codigoBarra : formulario?.codigoBarra}
                name={"codigoBarra"}
                type={"text"}
                onchange={handleChangeForm}
              />
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
  );
}
