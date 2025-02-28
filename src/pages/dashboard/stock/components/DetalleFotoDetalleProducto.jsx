import React from "react";
import DivReact from "../../../../components/atomos/DivReact";
import formatDate from "../../../../utils/formatDate";
import InputFormularioSolicitud from "../../../../components/moleculas/InputFormularioSolicitud";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";

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
                    className="w- text-end capitalize py-1 px-1 text-sm text-primary-texto rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50 font-semibold"
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
                <span className="">IVA:</span>
                {disableEdit ? (
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {infoProducto.productData?.iva}
                  </p>
                ) : (
                  <select
                    onChange={handleChangeForm}
                    name="iva"
                    id="iva"
                    className="w- text-end capitalize py-1 px-1 text-sm text-primary-texto rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50 font-semibold"
                  >
                    <option selected>seleccionar </option>
                    <option value="21%" className="px-3 w-full">
                      21% IVA
                    </option>
                    <option value="10.5%" className="px-3 w-full">
                      10.5% IVA
                    </option>
                    <option value="27%" className="px-3 w-full">
                      27% IVA
                    </option>
                    <option value="no aplica" className="px-3 w-full">
                      No Aplica
                    </option>
                  </select>
                )}
              </div>
              <div className="flex w-full items-center justify-start gap-3 ">
                <span className="w- whitespace-nowrap">Descuento:</span>
                {disableEdit ? (
                  <p className="capitalize font-medium text-primary-textoTitle">
                   {infoProducto.productData.signoDescuento}{infoProducto.productData?.descuento}
                  </p>
                ) : 
                <div className="flex w-full items-center justify-normal gap-2">
                  <select
                  onChange={handleChangeForm}
                  value={infoProducto.productData?.signoDescuento}
                    name="signoDescuento"
                    id="signoDescuento"
                    className="w- text-end capitalize py-1 px-1  text-sm text-primary-texto rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50 font-semibold"
                  >
                    <option value="%">%</option>
                    <option value="$">$</option>
                  </select>
                  <InputComponenteJsx
                    placeholder={"ingrese el descuento"}
                    className={"text-sm py-1 px-1"}
                    name={"descuento"}
                    handleChange={handleChangeForm}
                    
                    type={"number"}
                  />
                </div>
                }
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
