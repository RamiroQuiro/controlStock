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
import TablaStockDepositos from "../../../components/TablaStockDepositos";
import CategoriasSelector from "../../../../productos/components/CategoriasSelector";
import { showToast } from "../../../../../../utils/toast/toastShow";

type Props = {
  data: {
    productData: Producto;
    depositosDB: any;
    ubicacionesDB: any;
    stockActualDB: any;
    stockDetalle?: any;
    categorias?: any[]; // Categorías del producto
  };
};

export default function FormProducto({ data }: Props) {
  const [form, setForm] = useState(data.productData);
  const [disableEdit, setDisableEdit] = useState(true);
  const [busy, setBusy] = useState(false);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState(
    data.categorias || []
  );

  // Estados para imagen
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value || "",
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Función para guardar cambios
  const handleSave = async () => {
    const productId = data?.productData?.id;
    if (!productId) return;
    try {
      setBusy(true);

      // 1. Subir imagen si existe
      let currentSrcPhoto = form.srcPhoto;
      if (selectedFile) {
        const formDataImg = new FormData();
        formDataImg.append("productoId", productId);
        formDataImg.append("fotoProducto", selectedFile);

        const resImg = await fetch("/api/productos/update-image", {
          method: "POST",
          body: formDataImg,
        });

        if (!resImg.ok) throw new Error("Error al subir imagen");
        const dataImg = await resImg.json();
        currentSrcPhoto = dataImg.srcPhoto;

        // Actualizar estado local
        setForm((prev) => ({ ...prev, srcPhoto: currentSrcPhoto }));
      }

      // Limpiar el objeto: eliminar undefined y convertir strings vacíos a null
      const cleanedForm = Object.entries(form).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // Agregar categorías y foto al objeto de actualización
      const dataToSend = {
        ...cleanedForm,
        srcPhoto: currentSrcPhoto,
        categorias: categoriasSeleccionadas,
      };

      const response = await fetch(
        `/api/productos/productos?search=${productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Error al actualizar el producto");
      }

      showToast("Producto actualizado correctamente", {
        background: "bg-green-500",
      });
    } catch (err) {
      console.error(err);
      showToast("Error al actualizar el producto", {
        background: "bg-red-500",
      });
      throw err;
    } finally {
      setBusy(false);
    }
  };

  // Función para alternar entre editar y guardar
  const handleEdit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (disableEdit) {
      // Activar modo edición
      setDisableEdit(false);
      return;
    }
    // Estamos editando -> guardamos
    try {
      await handleSave();
      setDisableEdit(true);
    } catch {
      // Si hubo error, no cerramos edición
      setDisableEdit(false);
    }
  };

  // 9) Descargar PDF
  const handleDownloadPdf = async () => {
    const productId = data?.productData?.id;
    if (!productId) return;

    try {
      setBusy(true);
      const res = await fetch(`/api/productos/generarPdf/${productId}`, {
        method: "GET",
        headers: { "xx-user-id": data?.productData?.userId },
      });

      if (!res.ok) throw new Error("Error al generar PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `producto_${productId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      // showToast?.("Error al generar PDF", { background: "bg-red-500" });
    } finally {
      setBusy(false);
    }
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
          <Button variant="primary" onClick={handleEdit} disabled={busy}>
            {disableEdit ? "Editar" : "Guardar"}
          </Button>
          <Button variant="primary" onClick={handleDownloadPdf} disabled={busy}>
            Exportar PDF
          </Button>
          <Switch
            label="¿Online?"
            name="isEcommerce"
            checked={form?.isEcommerce}
            onChange={handleChange}
          />
          <Switch
            label="¿Activo?"
            name="activo"
            checked={form?.activo}
            onChange={handleChange}
          />
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
                disabled={disableEdit}
                placeholder="Nombre"
              />
              <div className="flex w-full flex-col md:flex-row gap-3">
                <Input
                  label="Codigo de Barra"
                  name="codigoBarra"
                  value={form.codigoBarra}
                  onChange={handleChange}
                  disabled={disableEdit}
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
                disabled={disableEdit}
                placeholder="Descripción"
              />
              <div className="flex w-full flex-col md:flex-row gap-3">
                <Input
                  label="Marca"
                  name="marca"
                  value={form.marca}
                  onChange={handleChange}
                  disabled={disableEdit}
                  placeholder="Marca"
                />
                <Input
                  label="Modelo"
                  name="modelo"
                  value={form.modelo}
                  onChange={handleChange}
                  disabled={disableEdit}
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
              <CategoriasSelector
                empresaId={data.productData.empresaId}
                onCategoriasChange={setCategoriasSeleccionadas}
                categoriasIniciales={data.categorias}
              />
            </CardContent>
          </Card>
          {/* SECCIÓN LEGACY - OCULTADA
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
          */}
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
                  disabled={disableEdit}
                  placeholder="Precio de Compbra"
                />
                <Input
                  label="Precio de Venta"
                  name="pVenta"
                  type="number"
                  value={form.pVenta}
                  onChange={handleChange}
                  disabled={disableEdit}
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
                  name="isOferta"
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
                  src={previewUrl || form.srcPhoto || "/placeholder-image.png"}
                  alt={form.descripcion}
                  className=" object-cover w-auto h-full rounded-lg overflow-hidden hover:scale-105 duration-500"
                />
              </div>
              {!disableEdit && (
                <div className="mt-2 w-full px-2 pb-2">
                  <label className="block text-xs font-medium text-primary-texto mb-1">
                    Cambiar Imagen
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-gray-500
                      file:mr-2 file:py-1 file:px-2
                      file:rounded-md file:border-0
                      file:text-xs file:font-semibold
                      file:bg-primary-100 file:text-white
                      hover:file:bg-primary-200
                      cursor-pointer
                    "
                  />
                </div>
              )}
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
                <BadgesIndigo>
                  {form.isEcommerce ? "Disponible" : "No Disponible"}
                </BadgesIndigo>
              </div>
              <div className="flex w-full items-center justify-between">
                <p>Estado de Oferta</p>
                <BadgesIndigo>
                  {form.isOferta ? "En Oferta" : "Precio Normal"}
                </BadgesIndigo>
              </div>
              <div className="flex w-full items-center justify-between">
                <p>Última Actualización</p>
                <BadgesIndigo>2025-11-11</BadgesIndigo>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Stock por Depósito */}
        </div>
      </div>
    </form>
  );
}
