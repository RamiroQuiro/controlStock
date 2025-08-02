import React, { useEffect, useMemo, useState } from "react";
import formatDate from "../../../../utils/formatDate";
import InputFormularioSolicitud from "../../../../components/moleculas/InputFormularioSolicitud";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import DivReact from "../../../../components/atomos/DivReact";
import { useStore } from "@nanostores/react";
import { perfilProducto } from "../../../../context/store";
import { obtenerUltimaReposicion } from "../../../../utils/detallesProducto";
import { CircleCheck, CircleX, Plus } from "lucide-react";
import BotonAgregarCat from "../../../../components/moleculas/BotonAgregarCat";
import SelectorCategoriasExistentes from "./SelectorCategoriasExistentes";

export default function DetalleFotoDetalleProducto({
  disableEdit,
  handleChangeForm,
  formulario,
  depositosDB,
  ubicacionesDB,
}) {
  const { data: infoProducto, loading } = useStore(perfilProducto);
  const [stateOferta, setStateOferta] = useState(false);

  const ultimaRepo = useMemo(() => {
    if (!infoProducto?.stockMovimiento) return null;
    return obtenerUltimaReposicion(infoProducto.stockMovimiento);
  }, [loading]);

  useEffect(() => {
    if (infoProducto?.productData?.isOferta !== undefined) {
      setStateOferta(infoProducto.productData.isOferta);
    }
  }, [infoProducto]);

  useEffect(() => {
    handleChangeForm({
      target: {
        name: "isOferta",
        value: stateOferta,
      },
    });
  }, [stateOferta]);

  const handleRemoveCategoria = (categoriaId) => {
    // Actualizar el store
    const categoriasFiltradas = infoProducto.productData.categorias.filter(
      (cat) => cat.id !== categoriaId
    );
    perfilProducto.set({
      data: {
        ...infoProducto,
        productData: {
          ...infoProducto?.productData,
          categorias: categoriasFiltradas,
        },
      },
    });

    // Actualizar el formulario
    handleChangeForm({
      target: {
        name: "categorias",
        value: categoriasFiltradas,
      },
    });
  };

  const handleChangeIsOferta = (e) => {
    const { checked } = e.target;
    setStateOferta(checked);
    console.log("checked", checked);
    handleChangeForm({
      target: {
        name: "isOferta",
        value: checked,
      },
    });
  };
  // Función para agregar una categoría existente
  const handleAgregarCategoria = (categoria) => {
    // Verificar si la categoría ya existe en el producto
    const categoriaExistente = infoProducto.productData.categorias.find(
      (cat) => cat.id === categoria.id
    );
    if (categoriaExistente) return; // Evitar duplicados

    // Actualizar el store con la nueva categoría
    const nuevasCategorias = [
      ...infoProducto?.productData?.categorias,
      categoria,
    ];
    perfilProducto.set({
      data: {
        ...infoProducto,
        productData: {
          ...infoProducto?.productData,
          categorias: nuevasCategorias,
        },
      },
    });
    // Actualizar el formulario
    handleChangeForm({
      target: {
        name: "categorias",
        value: nuevasCategorias,
      },
    });
  };

  return (
    <DivReact>
      {/* Sección de imagen */}
      {loading ? (
        <div className="flex items-start flex-col md:flex-row justify-normal gap-3 animate-pulse">
          {/* Imagen */}
          <div className="w-full md:w-[50%] flex flex-col items-center justify-start rounded-lg overflow-hidden">
            <div className="w-full h-60 bg-gray-200 rounded-lg" />
          </div>

          {/* Detalles */}
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            {[...Array(9)].map((_, idx) => (
              <div key={idx} className="flex w-full gap-3">
                <div className="w-1/4 h-5 bg-gray-200 rounded" />
                <div className="w-full h-5 bg-gray-200 rounded" />
              </div>
            ))}
            <div className="flex w-full gap-3">
              <div className="w-1/4 h-5 bg-gray-200 rounded" />
              <div className="w-1/2 h-5 bg-gray-200 rounded" />
            </div>
            <div className="flex w-full gap-3">
              <div className="w-1/4 h-5 bg-gray-200 rounded" />
              <div className="w-1/2 h-5 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start flex-col md:flex-row justify-normal gap-3">
          <div className="w-full flex flex-col md:w-[50%] items-center justify-start relative rounded-lg overflow-hidden ">
            <div className="h-[80%] flex w-full rounded-lg  items-center ">
              <img
                src={infoProducto?.productData?.srcPhoto}
                alt={infoProducto?.productData?.descripcion}
                className=" object-scale-down w-full h-60 rounded-lg overflow-hidden hover:scale-105 duration-500"
              />
            </div>
          </div>

          {/* Sección de detalles */}
          <div className="w-full md:w-1/2 flex text-sm flex-col relative gap-">
            <div className="flex flex-col w-full gap-1">
              <div className="flex flex-col  w-full items-center justify-start gap-1 ">
                <div className="flex w- items-center justify-start gap-3 ">
                  <span className="">Codigo/ID:</span>
                  <p className="font-medium text-primary-textoTitle">
                    {" "}
                    {infoProducto?.productData.id}
                  </p>
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="whitespace-nowrap">Codigo de Barra:</span>
                  <InputFormularioSolicitud
                    className={
                      "text-primary-textoTitle w-full font-semibold animate-aparecer "
                    }
                    value={infoProducto?.productData.codigoBarra}
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
                      ? infoProducto?.productData?.descripcion
                      : formulario?.productData?.descripcion
                  }
                  name={"descripcion"}
                  type={"text"}
                />
              </div>
              <div className="flex w-full items-center justify-start gap-3 ">
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Categorias:</span>
                  {!disableEdit && (
                    <div className="flex items-center gap-2">
                      <BotonAgregarCat empresaId={infoProducto.empresaId} />
                      <div className="w-40">
                        <SelectorCategoriasExistentes
                          empresaId={infoProducto.empresaId}
                          onAgregarCategoria={handleAgregarCategoria}
                          categoriasActuales={
                            infoProducto?.productData.categorias || []
                          }
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-1 flex-wrap items-start justify-normal">
                    {infoProducto?.productData.categorias?.map(
                      (categoria, idx) => (
                        <span
                          title="Eliminar categoria"
                          key={idx}
                          className="inline-flex items-center justify-center text-xs px-1 text-primary-texto py-0.5 rounded-lg border bg-primary-100/20"
                        >
                          {categoria.nombre}
                          {!disableEdit && (
                            <CircleX
                              onClick={() =>
                                handleRemoveCategoria(categoria.id)
                              }
                              className="rounded-full bg-primary-400 ml-2 cursor-pointer text-white px-1 text-center active:-scale-95"
                            />
                          )}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="flex w-full items-center justify-start gap-3 ">
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Marca:</span>
                  <InputFormularioSolicitud
                    className={
                      "text-primary-textoTitle font-semibold animate-aparecer"
                    }
                    value={
                      disableEdit
                        ? infoProducto?.productData?.marca
                        : formulario?.productData?.marca
                    }
                    name={"marca"}
                    type={"text"}
                    onchange={handleChangeForm}
                    disabled={disableEdit}
                  />
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Modelo:</span>
                  <InputFormularioSolicitud
                    className={
                      "text-primary-textoTitle font-semibold animate-aparecer"
                    }
                    value={
                      disableEdit
                        ? infoProducto?.productData?.modelo
                        : formulario?.productData?.modelo
                    }
                    name={"modelo"}
                    type={"text"}
                    onchange={handleChangeForm}
                    disabled={disableEdit}
                  />
                </div>
              </div>
              <div className="flex w-full items-center justify-start gap-3 ">
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Deposito:</span>
                  {disableEdit ? (
                    <p className="capitalize font-medium text-primary-textoTitle">
                      {
                        depositosDB?.find(
                          (deposito) =>
                            deposito.id ===
                            infoProducto?.productData?.depositosId
                        )?.nombre
                      }
                    </p>
                  ) : (
                    <select
                      onChange={handleChangeForm}
                      name="depositosId"
                      id="depositosId"
                      className="w-1/2 text-end capitalize py-1 px-1 text-sm text-primary-texto rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50 font-semibold"
                    >
                      <option value="" selected>
                        seleccionar{" "}
                      </option>
                      {depositosDB?.map((deposito) => (
                        <option key={deposito.id} value={deposito.id}>
                          {deposito.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Ubicación:</span>
                  {disableEdit ? (
                    <p className="capitalize font-medium text-primary-textoTitle">
                      {
                        ubicacionesDB?.find(
                          (ubicacion) =>
                            ubicacion.id ===
                            infoProducto?.productData?.ubicacionesId
                        )?.nombre
                      }
                    </p>
                  ) : (
                    <select
                      onChange={handleChangeForm}
                      name="ubicacionesId"
                      id="ubicacionesId"
                      className="w-1/2 text-end capitalize py-1 px-1 text-sm text-primary-texto rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50 font-semibold"
                    >
                      <option value="" selected>
                        seleccionar{" "}
                      </option>
                      {ubicacionesDB?.filter(
                        (ubicacion) =>
                          ubicacion.depositoId === infoProducto?.productData?.depositosId
                      ).map((ubicacion) => (
                        <option key={ubicacion.id} value={ubicacion.id}>
                          {ubicacion.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex w-full items-center justify-start gap-3 ">
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">Stock:</span>
                  <p className="capitalize font-medium text-primary-textoTitle">
                    {infoProducto?.productData.stock}
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
                        ? infoProducto?.productData?.alertaStock
                        : formulario?.productData?.alertaStock
                    }
                    name={"alertaStock"}
                    type={"text"}
                    onchange={handleChangeForm}
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
                        ? infoProducto?.productData?.reservado
                        : formulario?.productData?.reservado
                    }
                    name={"reservado"}
                    type={"text"}
                    onchange={handleChangeForm}
                    disabled={disableEdit}
                  />
                </div>
              </div>
              <div className="flex wfull items-center justify-between gap-2 ">
                <div className="flex wfull items-center justify-start gap-3 ">
                  <span className="w-full whitespace-nowrap">
                    Unidad de Medida:
                  </span>
                  {disableEdit ? (
                    <p className="capitalize font-medium text-primary-textoTitle">
                      {infoProducto?.productData.unidadMedida}
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
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="">IVA:</span>
                  {disableEdit ? (
                    <p className="capitalize font-medium text-primary-textoTitle">
                      {infoProducto?.productData?.iva}
                    </p>
                  ) : (
                    <select
                      onChange={handleChangeForm}
                      name="iva"
                      id="iva"
                      className="w-1/2 text-end capitalize py-1 px-1 text-sm text-primary-texto rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50 font-semibold"
                    >
                      <option selected>seleccionar </option>
                      <option value={21} className="px-3 w-full">
                        21% IVA
                      </option>
                      <option value={10.5} className="px-3 w-full">
                        10.5% IVA
                      </option>
                      <option value={27} className="px-3 w-full">
                        27% IVA
                      </option>
                      <option value={0} className="px-3 w-full">
                        No Aplica
                      </option>
                    </select>
                  )}
                </div>
              </div>
              <div className="flex w-full items-center justify-between gap-3 ">
                <div
                  className="flex  items-center justify-start gap-1 w-1/3
                 "
                >
                  <label
                    htmlFor="isOferta"
                    className="flex items-center w-  text-primary-textoTitle font-semibold text-xs gap-1 cursor-pointer hover:text-primary-title duration-300 hover:bg-primary-100/50 hover:text-primary-title px-2 py-1 rounded"
                  >
                    <input
                      type="checkbox"
                      name="isOferta"
                      id="isOferta"
                      checked={stateOferta}
                      onChange={handleChangeIsOferta}
                      disabled={disableEdit}
                      className="hidden"
                    />
                    ¿está en oferta?
                  </label>
                  <div>
                    {stateOferta ? (
                      <CircleCheck className="w-6 h-6 stroke-green-500" />
                    ) : (
                      <CircleX className="w-6 h-6 stroke-primary-400" />
                    )}
                  </div>
                </div>
                <div className="flex w-full items-center justify-start gap-3 ">
                  <span className="w- whitespace-nowrap">Descuento:</span>
                  {disableEdit ? (
                    <p className="capitalize font-medium text-primary-textoTitle">
                      {infoProducto?.productData?.signoDescuento}
                      {infoProducto?.productData?.descuento}
                    </p>
                  ) : (
                    <div className="flex w-full items-center justify-normal gap-2">
                      <select
                        onChange={handleChangeForm}
                        name="signoDescuento"
                        value={formulario?.signoDescuento}
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
                        value={formulario?.descuento}
                        handleChange={handleChangeForm}
                        type={"number"}
                      />
                    </div>
                  )}
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
      )}
    </DivReact>
  );
}
