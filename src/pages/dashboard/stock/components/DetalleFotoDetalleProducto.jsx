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
  return (
    <DivReact>
      {/* Sección de imagen */}
      <div className="flex items-start justify-normal gap-3">
        <div className="w-full flex flex-col md:w-[50%] items-center justify-start relative rounded-lg overflow-hidden ">
          <div className="h-[80%] flex w-full rounded-lg  items-center ">
            <img
              src={infoProducto.productData?.srcPhoto}
              alt={infoProducto.productData?.descripcion}
              className=" object-scale-down w-full h-60 rounded-lg overflow-hidden hover:scale-105 duration-500"
            />
          </div>
        </div>

        {/* Sección de detalles */}
        <div className="w-full md:w-1/2 flex text-sm flex-col relative gap-">
          <div className="flex flex-col w-full gap-1">
            <div className="flex w-full items-center justify-start gap-3 ">
              <div className="flex w- items-center justify-start gap-3 ">
                <span className="">Codigo/ID:</span>
                <p className="font-medium text-primary-textoTitle">
                  {" "}
                  {infoProducto.productData?.id}
                </p>
              </div>
              <div className="flex w-full items-center justify-start gap-3 ">
                <span className="whitespace-nowrap">Codigo de Barra:</span>
                <InputFormularioSolicitud
                  disabled={disableEdit}
                  className={
                    "text-primary-textoTitle w-full font-semibold animate-aparecer "
                  }
                  value={
                    disableEdit
                      ? infoProducto.productData?.codigoBarra
                      : formulario?.codigoBarra
                  }
                  name={"codigoBarra"}
                  type={"text"}
                  onchange={handleChangeForm}
                />
              </div>
            </div>
            <div className="flex w-full items-center justify-start gap-3 ">
              <span className="">Descripción:</span>
              <InputFormularioSolicitud
                disabled={disableEdit}
                onchange={handleChangeForm}
                className={
                  "text-primary-textoTitle font-semibold animate-aparecer"
                }
                value={
                  disableEdit
                    ? infoProducto.productData?.descripcion
                    : formulario?.descripcion
                }
                name={"descripcion"}
                type={"text"}
              />
            </div>
            <div className="flex w-full items-center justify-start gap-3 ">
              <div className="flex w-full items-center justify-start gap-3 ">
                <span className="">Categoria:</span>
                <InputFormularioSolicitud
                  disabled={disableEdit}
                  onchange={handleChangeForm}
                  className={
                    "text-primary-textoTitle font-semibold animate-aparecer"
                  }
                  value={
                    disableEdit
                      ? infoProducto.productData?.categoria
                      : formulario?.categoria
                  }
                  name={"categoria"}
                  type={"text"}
                />
              </div>
              <div className="flex w-full items-center justify-start gap-3 ">
                <span className="">Marca:</span>
                <InputFormularioSolicitud
                  className={
                    "text-primary-textoTitle font-semibold animate-aparecer"
                  }
                  value={
                    disableEdit
                      ? infoProducto.productData?.marca
                      : formulario?.marca
                  }
                  name={"marca"}
                  type={"text"}
                  onchange={handleChangeForm}
                  disabled={disableEdit}
                />
              </div>
            </div>
            <div className="flex w-full items-center justify-start gap-3 ">
            <div className="flex w-full items-center justify-start gap-3 ">
                <span className="">Modelo:</span>
                <InputFormularioSolicitud
                  className={
                    "text-primary-textoTitle font-semibold animate-aparecer"
                  }
                  value={
                    disableEdit
                      ? infoProducto.productData?.modelo
                      : formulario?.modelo
                  }
                  name={"modelo"}
                  type={"text"}
                  onchange={handleChangeForm}
                  disabled={disableEdit}
                />
              </div>
            <div className="flex w-full items-center justify-start gap-3 ">
                <span className="">Reservado:</span>
                <InputFormularioSolicitud
                  className={
                    "text-primary-textoTitle font-semibold animate-aparecer"
                  }
                  value={
                    disableEdit
                      ? infoProducto.productData?.reservado
                      : formulario?.reservado
                  }
                  name={"reservado"}
                  type={"text"}
                  onchange={handleChangeForm}
                  disabled={disableEdit}
                />
              </div>
              </div>
            <div className="flex w-full items-center justify-start gap-3 ">
              <div className="flex w-full items-center justify-start gap-3 ">
                <span className="">Deposito:</span>
                <InputFormularioSolicitud
                  disabled={disableEdit}
                  onchange={handleChangeForm}
                  className={
                    "text-primary-textoTitle font-semibold capitalize animate-aparecer"
                  }
                  value={
                    disableEdit
                      ? infoProducto.productData?.deposito
                      : formulario?.deposito
                  }
                  name={"deposito"}
                  type={"text"}
                />
              </div>
              <div className="flex w-full items-center justify-start gap-3 ">
                <span className="">Localización:</span>
                <InputFormularioSolicitud
                  disabled={disableEdit}
                  onchange={handleChangeForm}
                  className={
                    "text-primary-textoTitle font-semibold animate-aparecer"
                  }
                  value={
                    disableEdit
                      ? infoProducto.productData?.localizacion
                      : formulario?.localizacion
                  }
                  name={"localizacion"}
                  type={"text"}
                />
              </div>
            </div>

            <div className="flex w-full items-center justify-start gap-3 ">
              <div className="flex w-full items-center justify-start gap-3 ">
                <span className="">Stock:</span>
                <p className="capitalize font-medium text-primary-textoTitle">
                  {infoProducto.productData?.stock}
                </p>
              </div>
              <div className="flex w-full items-center justify-start gap-3 ">
                <span className="w-full whitespace-nowrap">
                  Alerta de Stock:
                </span>
                <InputFormularioSolicitud
                  disabled={disableEdit}
                  className={
                    "text-primary-textoTitle font-semibold animate-aparecer"
                  }
                  value={
                    disableEdit
                      ? infoProducto.productData?.alertaStock
                      : formulario?.alertaStock
                  }
                  name={"alertaStock"}
                  type={"text"}
                  onchange={handleChangeForm}
                />
              </div>
            </div>
            <div className="flex wfull items-center justify-start gap-3 ">
            <div className="flex wfull items-center justify-start gap-3 ">
                <span className="w-full whitespace-nowrap">
                  Unidad de Medida:
                </span>
                {disableEdit ? (
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {infoProducto.productData?.unidadMedida}
                  </p>
                ) : (
                  <select
                  onChange={handleChangeForm}
                    name="unidadMedida"
                    id="unidadMedida"
                    className="w-full rounded-lg px-2 py-1 text-primary-textoTitle capitalize"
                  >
                    <option value="unidad" className="px-3 w-full">
                      Unidad
                    </option>
                    <option value="kilogramos" className="px-3 w-full">
                      Kilogramos
                    </option>
                    <option value="litros" className="px-3 w-full">
                      Litros
                    </option>
                    <option value="decena" className="px-3 w-full">
                      Decena
                    </option>
                  </select>
                )}
                
              </div>
            </div>
            <div className="flex w-full items-center justify-start gap-3 ">
              <div className="flex w-full items-center justify-start gap-3 ">
                <span className="">Impuesto:</span>
                {disableEdit ? (
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {infoProducto.productData?.impuesto}
                  </p>
                ) : (
                  <select
                  onChange={handleChangeForm}
                    name="impuesto"
                    id="impuesto"
                    className="w-full rounded-lg px-2 py-1 text-primary-textoTitle capitalize"
                  >
                    <option value="iva21" className="px-3 w-full">
                      Iva 21%
                    </option>
                    <option value="iva27" className="px-3 w-full">
                      Iva 27%
                    </option>
                    <option value="iva10" className="px-3 w-full">
                      Iva 10%
                    </option>
                    <option value="noAplica" className="px-3 w-full">
                      No Aplica
                    </option>
                  </select>
                )}
              </div>
              <div className="flex w-full items-center justify-start gap-3 ">
                <span className="w-full whitespace-nowrap">Descuento:</span>
                <InputFormularioSolicitud
                  disabled={disableEdit}
                  className={
                    "text-primary-textoTitle font-semibold animate-aparecer"
                  }
                  value={
                    disableEdit
                      ? infoProducto.productData?.descuento
                      : formulario?.descuento
                  }
                  name={"descuento"}
                  type={"text"}
                  onchange={handleChangeForm}
                />
              </div>
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
