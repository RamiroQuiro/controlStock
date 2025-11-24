import {
  Box,
  Calculator,
  CircleX,
  Cuboid,
  DollarSign,
  Hourglass,
  PlusCircle,
  PocketKnife,
  Square,
  SquareActivity,
  TagIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardSubTitle,
} from "../../../../../../components/organismos/Card";
import Input from "../../../../../../components/atomos/Input";
import { useState } from "react";

import { Textarea } from "../../../../../../components/atomos/TextArea";
import BotonAgregarCat from "../../../../../../components/moleculas/BotonAgregarCat";
import SelectorCategoriasExistentes from "../../../components/SelectorCategoriasExistentes";
import Button from "../../../../../../components/atomos/Button";
import BadgesIndigo from "../../../../../../components/atomos/BadgesIndigo";
import Selector from "../../../../../../components/atomos/Selector";
import Switch from "../../../../../../components/atomos/Switch";
import type { Producto } from "../../../../../../types";
import { formateoMoneda } from "../../../../../../utils/formateoMoneda";

type Props = {
  data: {
    productData: Producto;
    depositosDB: any;
    ubicacionesDB: any;
    stockActualDB: any;
  };
};

export default function FormProducto({ data }: Props) {
  const [form, setForm] = useState(data.productData);
  const [depositosIds, setDepositosIds] = useState(data.depositosDB);
  const [ubicacionesIds, setUbicacionesIds] = useState(data.ubicacionesDB);
  const [stockActual, setStockActual] = useState(data.stockActualDB[0]);
  const [disableEdit, setDisableEdit] = useState(false);
  console.log("data del producto", data);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, name: value || "" }));
  };
  // Función para agregar una categoría existente
  const handleAgregarCategoria = (categoria) => {
    // Verificar si la categoría ya existe en el producto
    const categoriaExistente = data.categoriasIds.find(
      (cat) => cat === categoria.id
    );
    if (categoriaExistente) return; // Evitar duplicados

    // Actualizar el store con la nueva categoría
    const nuevasCategorias = [...data?.categoriasIds, categoria];
    setForm({
      ...data,
      categoriasIds: nuevasCategorias,
    });
    // Actualizar el formulario
    handleChange({
      target: {
        name: "categoriasIds",
        value: nuevasCategorias,
      },
    });
  };
  const handleRemoveCategoria = (categoriaId) => {
    // Actualizar el store
    const categoriasFiltradas = data.productData.categorias.filter(
      (cat) => cat.id !== categoriaId
    );
    setForm({
      ...data,
      productData: {
        ...data?.productData,
        categorias: categoriasFiltradas,
      },
    });

    // Actualizar el formulario
    handleChange({
      target: {
        name: "categorias",
        value: categoriasFiltradas,
      },
    });
  };

  return (
    <form
      action=""
      className="w-full gap-2 flex flex-col items-start text-primary-texto "
    >
      <div className="flex items-center justify-between w-full">
        <CardTitle className="flex-1">
          Formulario de Producto {form?.nombre}
        </CardTitle>
        <div className="w-fit flex gap-2 items-center justify-end">
          <Button variant="primary">Guardar</Button>
          <Button variant="downloadPDF">Exportar PDF</Button>
          <Switch label="¿Activo?" value={form?.activo} />
        </div>
      </div>
      <div className="w-full flex flex-col md:flex-row items-stretch justify-between gap-5">
        <div className="w-full md:w-3/4 flex flex-col gap-3 items-start">
          {/* Info Basica */}
          <Card className="">
            <CardHeader>
              <CardSubTitle className="inline-flex items-center gap-1">
                <Cuboid /> Información Básica
              </CardSubTitle>
            </CardHeader>
            <CardContent className="py-3 gap-3 flex flex-col w-full items-center justify-center">
              <Input
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
              />
              <div className="flex w-full flex-col md:flex-row gap-3">
                <Input
                  label="Codigo de Barra"
                  name="codigoBarra"
                  value={form.codigoBarra}
                  onChange={handleChange}
                  placeholder="Codigo de Barra"
                />
                <Input
                  label="Id del Producto"
                  name="id"
                  value={form.id}
                  disabled
                  placeholder="Id del Producto"
                />
              </div>
              <Textarea
                className="w-full"
                label="Descripción"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción"
              />
              <div className="flex w-full flex-col md:flex-row gap-3">
                <Input
                  label="Marca"
                  name="marca"
                  value={form.marca}
                  onChange={handleChange}
                  placeholder="Marca"
                />
                <Input
                  label="Modelo"
                  name="modelo"
                  value={form.modelo}
                  onChange={handleChange}
                  placeholder="Modelo"
                />{" "}
                <Selector
                  labelOption="Unidad de Medida"
                  name="unidadMedida"
                  defaultSelect={form.unidadMedida}
                  options={[
                    { id: "unidad", name: "Unidad", value: "unidad" },
                    {
                      id: "kilogramos",
                      name: "Kilogramos",
                      value: "kilogramos",
                    },
                    { id: "litros", name: "Litros", value: "litros" },
                    { id: "decena", name: "Decena", value: "decena" },
                  ]}
                  handleSelect={handleChange}
                />
              </div>
            </CardContent>
          </Card>
          {/* categorias */}
          <Card>
            <CardHeader>
              <CardSubTitle className="inline-flex items-center gap-1">
                <TagIcon /> Información Categorias
              </CardSubTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full inline-flex gap-3 items-end justify-between">
                <div className="flex flex-col w-full">
                  <label
                    htmlFor="unidadMedida"
                    className="mb-1 text-sm font-semibold text-primary-texto disabled:text-gray-400"
                  >
                    Categorias
                  </label>
                  <select
                    name="unidadMedida"
                    id="unidadMedida"
                    className={`p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-100 focus:border-primary-100 placeholder:text-gray-400 transition`}
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
                </div>
                <Button variant="primary">
                  <PlusCircle /> Agregar
                </Button>
              </div>
              <div className="w-full flex mt-3 flex-wrap gap-3">
                <BadgesIndigo>
                  {" "}
                  gaseosas{" "}
                  <CircleX
                    onClick={() => handleRemoveCategoria(categoria.id)}
                    className="rounded-full bg-primary-400 ml-2 cursor-pointer text-white px-1 text-center active:-scale-95"
                  />
                </BadgesIndigo>
                <BadgesIndigo>
                  sistemas{" "}
                  <CircleX
                    onClick={() => handleRemoveCategoria(categoria.id)}
                    className="rounded-full bg-primary-400 ml-2 cursor-pointer text-white px-1 text-center active:-scale-95"
                  />
                </BadgesIndigo>
                <BadgesIndigo>
                  alimentos{" "}
                  <CircleX
                    onClick={() => handleRemoveCategoria(categoria.id)}
                    className="rounded-full bg-primary-400 ml-2 cursor-pointer text-white px-1 text-center active:-scale-95"
                  />
                </BadgesIndigo>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardSubTitle className="inline-flex items-center gap-1">
                <Hourglass /> Ubicación y Stock
              </CardSubTitle>
            </CardHeader>
            <CardContent className="py-3 gap-3 flex flex-col w-full items-center justify-center">
              <div className="w-full flex md:flex-row flex-col gap-3">
                <Selector
                  labelOption="Deposito"
                  name="deposito"
                  defaultSelect={false}
                  options={depositosIds}
                  handleSelect={handleChange}
                />
                <Selector
                  labelOption="Ubicacion"
                  name="ubicacion"
                  defaultSelect={false}
                  options={ubicacionesIds}
                  handleSelect={handleChange}
                />
              </div>
              <div className="w-full flex md:flex-row flex-col gap-3">
                <Input
                  label="Stock"
                  name="stock"
                  value={stockActual.cantidad}
                  onChange={handleChange}
                  placeholder="Stock"
                />
                <Input
                  label="Alerta de Sotck"
                  name="alertaStock"
                  value={stockActual.alertaStock}
                  onChange={handleChange}
                  placeholder="Alerta de Stock"
                />
                <Input
                  label="Reservado"
                  name="reservado"
                  value={stockActual.reservado}
                  onChange={handleChange}
                  placeholder="Reservado"
                />
              </div>
            </CardContent>
          </Card>
          {/* precios y ofertas */}
          <Card>
            <CardHeader>
              <CardSubTitle className="inline-flex items-center gap-1">
                <DollarSign /> Precios y Ofertas
              </CardSubTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full flex md:flex-row flex-col gap-3">
                <Input
                  label="Precio Compra"
                  name="pCompra"
                  type="number"
                  value={form.pCompra}
                  onChange={handleChange}
                  placeholder="Precio de Compbra"
                />
                <Input
                  label="Precio de Venta"
                  name="pVenta"
                  type="number"
                  value={form.pVenta}
                  onChange={handleChange}
                  placeholder="Precio de Venta"
                />
                <Selector
                  labelOption="IVA (%)"
                  name="iva"
                  defaultSelect={false}
                  options={[
                    {
                      id: "iva",
                      name: "iva",
                      value: "iva",
                    },
                  ]}
                  handleSelect={handleChange}
                />
              </div>
              <div className="w-full mt-3 flex md:flex-row flex-col gap-3">
                <Switch
                  label="¿Es Oferta?"
                  onChange={handleChange}
                  checked={form.isOferta}
                />

                <div className="w-full flex md:flex-row flex-col gap-3">
                  <Input
                    label="Precio Oferta"
                    name="pOferta"
                    type="number"
                    disabled={!form.isOferta}
                    value={form.precioOferta}
                    onChange={handleChange}
                    placeholder="Precio de Oferta"
                  />
                  <Input
                    label="Fecha Inicio"
                    name="fechaInicioOferta"
                    type="date"
                    disabled={!form.isOferta}
                    value={form.fechaInicioOferta}
                    onChange={handleChange}
                    placeholder="Fecha de Inicio"
                  />
                  <Input
                    label="Fecha Fin"
                    name="fechaFinOferta"
                    type="date"
                    disabled={!form.isOferta}
                    value={form.fechaFinOferta}
                    onChange={handleChange}
                    placeholder="Fecha de Fin"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* segunda columna */}
        <div className="w-full md:w-1/4 flex flex-col gap-3 items-start">
          <Card className="w-full  bg-primary-400/10 backdrop-blur-sm border-primary-400">
            <CardSubTitle>Imagen del Producto</CardSubTitle>
            <div className="w-full flex flex-col mt-2  items-center justify-start relative rounded-lg overflow-hidden ">
              <div className="h- flex w-full rounded-lg  items-center ">
                <img
                  src={form.srcPhoto}
                  alt={form.descripcion}
                  className=" object-cover w-auto h-full rounded-lg overflow-hidden hover:scale-105 duration-500"
                />
              </div>
            </div>
          </Card>
          <Card className="w-full  bg-primary-100/20 backdrop-blur-sm border-primary-100">
            <CardHeader>
              <CardSubTitle className="inline-flex items-center gap-1 text-primary-100 ">
                Información Precios
              </CardSubTitle>
            </CardHeader>
            <CardContent className="flex flex-col w-full gap-2 p-0">
              <Card>
                <div className="flex items-center gap-1">
                  <DollarSign className="stroke-primary-100" />
                  <p className="text-primary-textoTitle">Precio de Costo</p>
                </div>
                <p className="font-bold text-2xl trakin text-primary-textoTitle">
                  {formateoMoneda.format(form?.pCompra)}
                </p>
              </Card>
              <Card>
                <div className="flex items-center gap-1">
                  <PocketKnife className="stroke-primary-100" />
                  <p className="text-primary-textoTitle">Motnto Iva</p>
                </div>
                <p className="font-bold text-2xl trakin text-primary-textoTitle">
                  {formateoMoneda.format(form?.iva)}
                </p>
              </Card>
              <Card>
                <div className="flex items-center gap-1">
                  <Box className="stroke-primary-100" />
                  <p className="text-primary-textoTitle">Precio de Venta</p>
                </div>
                <p className="font-bold text-2xl trakin text-primary-textoTitle">
                  {formateoMoneda.format(form?.pVenta)}
                </p>
              </Card>
              <Card>
                <div className="flex items-center gap-1">
                  <Calculator className="stroke-primary-100" />
                  <p className="text-primary-textoTitle">Margen Ganancia</p>
                </div>
                <p className="font-bold text-2xl trakin text-primary-textoTitle">
                  {formateoMoneda.format(form?.pCompra)}
                </p>
              </Card>
            </CardContent>
          </Card>
          <Card>
            <CardSubTitle>Estado del Producto</CardSubTitle>
            <CardContent className="w-full p-0 flex flex-col gap-3 mt-4">
              <div className="flex w-full items-center justify-between">
                <p>Disponibilidad Online</p>
                <BadgesIndigo>No Disponible</BadgesIndigo>
              </div>
              <div className="flex w-full items-center justify-between">
                <p>Estado de Oferta</p>
                <BadgesIndigo>Precio Normal</BadgesIndigo>
              </div>
              <div className="flex w-full items-center justify-between">
                <p>Última Actualización</p>
                <BadgesIndigo>2025-11-11</BadgesIndigo>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
