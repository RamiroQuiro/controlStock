import React, { useState, useEffect } from "react";
import { showToast } from "../../../../utils/toast/toastShow";
import InputFile from "../../../../components/moleculas/InputFile";
import CategoriasSelector from "./CategoriasSelector";
import BotonAgregarDeposito from "../../../../components/moleculas/BotonAgregarDepositojsx.jsx";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx.jsx";
import BotonAgregarUbicacion from "../../../../components/moleculas/BotonAgregarUbicacion.jsx";
import { fetchListadoProductos } from "../../../../context/stock.store";

// Interfaces para las props
interface Deposito {
  id: string;
  nombre: string;
}
interface Ubicacion {
  id: string;
  nombre: string;
  depositoId: string;
}
interface Props {
  depositos: Deposito[];
  ubicaciones: Ubicacion[];
  userId: string;
  empresaId: string;
}
const FormularioCargaProducto: React.FC<Props> = ({
  depositos,
  ubicaciones,
  userId,
  empresaId,
}) => {
  const initialFormData = {
    nombre: "",
    codigoBarra: "",
    descripcion: "",
    marca: "",
    modelo: "",
    alertaStock: 0,
    depositoId: "",
    ubicacionId: "",
    pCompra: "",
    pVenta: "",
    iva: "21",
    stock: 0,
    unidadMedida: "unidad",
    fechaVencimiento: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categoriasIds, setCategoriasIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🎯 NUEVO: Estado para errores específicos por campo
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [validando, setValidando] = useState<Record<string, boolean>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [localDepositos, setLocalDepositos] = useState<Deposito[]>(depositos);
  const [localUbicaciones, setLocalUbicaciones] =
    useState<Ubicacion[]>(ubicaciones);

  // 🎯 FUNCIONES DE VALIDACIÓN (las mismas que antes)
  const validarCodigoBarra = async (codigo: string) => {
    if (!codigo || codigo.length < 2) return;

    setValidando((prev) => ({ ...prev, codigoBarra: true }));

    try {
      const res = await fetch(
        `/api/productos/verificar-codigo?codigo=${codigo}&empresaId=${empresaId}`,
      );
      const data = await res.json();

      if (data.existe) {
        setErrores((prev) => ({
          ...prev,
          codigoBarra: `❌ Ya existe un producto con el código: ${codigo}`,
        }));
      } else {
        setErrores((prev) => ({ ...prev, codigoBarra: "" }));
      }
    } catch (error) {
      console.error("Error validando código:", error);
    } finally {
      setValidando((prev) => ({ ...prev, codigoBarra: false }));
    }
  };

  const validarNombre = async (nombre: string) => {
    if (!nombre || nombre.length < 3) return;

    setValidando((prev) => ({ ...prev, nombre: true }));

    try {
      const res = await fetch(
        `/api/productos/verificar-nombre?nombre=${encodeURIComponent(nombre)}&empresaId=${empresaId}`,
      );
      const data = await res.json();

      if (data.existe) {
        setErrores((prev) => ({
          ...prev,
          nombre: `❌ Ya existe un producto con el nombre: "${nombre}"`,
        }));
      } else {
        setErrores((prev) => ({ ...prev, nombre: "" }));
      }
    } catch (error) {
      console.error("Error validando nombre:", error);
    } finally {
      setValidando((prev) => ({ ...prev, nombre: false }));
    }
  };

  // 🎯 MANEJADOR MEJORADO CON VALIDACIONES EN TIEMPO REAL
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      if (name === "depositoId") {
        newFormData.ubicacionId = "";
      }
      return newFormData;
    });

    // Limpiar errores generales y de campo al escribir
    if (generalError) setGeneralError(null);
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: "" }));
    }

    // 🎯 VALIDACIONES EN TIEMPO REAL
    if (name === "codigoBarra") {
      setTimeout(() => validarCodigoBarra(value), 500);
    }

    if (name === "nombre") {
      setTimeout(() => validarNombre(value), 500);
    }

    // 🎯 VALIDACIONES BÁSICAS
    if (name === "pVenta" && formData.pCompra) {
      const pCompra = parseFloat(formData.pCompra);
      const pVenta = parseFloat(value);
      if (pVenta < pCompra) {
        setErrores((prev) => ({
          ...prev,
          pVenta:
            "⚠️ El precio de venta no puede ser menor al precio de compra",
        }));
      }
    }

    if (name === "stock" && formData.alertaStock) {
      const stock = parseInt(value);
      const alerta = formData.alertaStock;
      if (stock < alerta) {
        setErrores((prev) => ({
          ...prev,
          stock: `⚠️ Stock inicial (${stock}) es menor que la alerta (${alerta})`,
        }));
      }
    }
  };

  // 🎯 FUNCIÓN DE ENVÍO MEJORADA (la misma que antes)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar antes de enviar
    const erroresFinales: Record<string, string> = {};

    if (!formData.codigoBarra)
      erroresFinales.codigoBarra = "Código de barras es requerido";
    if (!formData.nombre) erroresFinales.nombre = "Nombre es requerido";
    if (!formData.descripcion)
      erroresFinales.descripcion = "Descripción es requerida";
    if (!formData.pVenta)
      erroresFinales.pVenta = "Precio de venta es requerido";

    if (Object.keys(erroresFinales).length > 0) {
      setErrores(erroresFinales);
      showToast("error", "Por favor completa los campos requeridos");
      return;
    }

    if (Object.values(errores).some((error) => error)) {
      showToast("error", "Corrige los errores antes de guardar");
      return;
    }

    setIsSubmitting(true);

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, String(value));
    });
    submissionData.append("userId", userId);
    submissionData.append("empresaId", empresaId);
    submissionData.append("categoriasIds", JSON.stringify(categoriasIds));
    if (selectedFile) {
      submissionData.append("fotoProducto", selectedFile);
    }

    try {
      const response = await fetch("/api/productos/create", {
        method: "POST",
        body: submissionData,
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrores({ codigoBarra: data.msg });
          throw new Error(data.msg);
        }
        throw new Error(data.msg || "Error en el servidor");
      }

      showToast("success", "¡Producto guardado con éxito!");

      // 🎯 Refrescar la lista de productos en el store global
      await fetchListadoProductos(empresaId);

      resetForm();
      if (window.parent) {
        window.parent.postMessage({ type: "PRODUCTO_CREADO" }, "*");
      }
    } catch (err: any) {
      console.error("Error al guardar:", err);
      setGeneralError(err.message);
      showToast("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedFile(null);
    setCategoriasIds([]);
    setErrores({}); 
    setGeneralError(null);
  };

  const filteredUbicaciones = formData.depositoId
    ? localUbicaciones.filter((u) => u.depositoId === formData.depositoId)
    : [];

  const handleDepositoAgregado = (nuevoDeposito: Deposito) => {
    setLocalDepositos((prev) => [...prev, nuevoDeposito]);
  };

  const handleUbicacionAgregada = (nuevaUbicacion: Ubicacion) => {
    setLocalUbicaciones((prev) => [...prev, nuevaUbicacion]);
    setFormData((prev) => ({
      ...prev,
      ubicacionId: nuevaUbicacion.id,
      depositoId: nuevaUbicacion.depositoId || prev.depositoId,
    }));
  };

  return (
    <div className="p-4 bg-white w-full rounded-lg shadow-md max-h-[85vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Banner de error general */}
        {generalError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 text-red-700">
                <p className="text-sm font-bold">Atención </p>
                <p className="text-xs">{generalError}</p>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 1: FOTO, CÓDIGO, NOMBRE, DESCRIPCIÓN */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <div className="md:col-span-1 flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto del Producto (Opcional)
            </label>
            <InputFile name="fotoProducto" onFileChange={setSelectedFile} />
          </div>

          <div className="md:col-span-2 flex flex-col gap-4 w-full">
            {/* CÓDIGO DE BARRA CON VALIDACIÓN */}
            <div>
              <label
                htmlFor="codigoBarra"
                className="block text-sm font-medium text-gray-700"
              >
                Código de Barra ✅
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="codigoBarra"
                  id="codigoBarra"
                  value={formData.codigoBarra}
                  onChange={handleChange}
                  className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${
                    errores.codigoBarra
                      ? "border-red-500 bg-red-50"
                      : validando.codigoBarra
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                  }`}
                  required
                />
                {validando.codigoBarra && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              {errores.codigoBarra && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  {errores.codigoBarra}
                </p>
              )}
            </div>

            {/* NOMBRE CON VALIDACIÓN */}
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre ✅
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${
                    errores.nombre
                      ? "border-red-500 bg-red-50"
                      : validando.nombre
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                  }`}
                  required
                />
                {validando.nombre && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              {errores.nombre && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  {errores.nombre}
                </p>
              )}
            </div>

            {/* DESCRIPCIÓN CON VALIDACIÓN */}
            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-gray-700"
              >
                Descripción ✅
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${
                  errores.descripcion
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Color, tamaño, detalles..."
                required
              ></textarea>
              {errores.descripcion && (
                <p className="mt-1 text-sm text-red-600">
                  {errores.descripcion}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: CATEGORÍAS, MARCA, MODELO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
          <div className="">
            <label className="block text-sm font-medium text-gray-700">
              Categorías
            </label>
            <CategoriasSelector
              empresaId={empresaId}
              onCategoriasChange={(cats: any[]) =>
                setCategoriasIds(cats.map((c) => c.id))
              }
            />
          </div>

          <div>
            <label
              htmlFor="marca"
              className="block text-sm font-medium text-gray-700"
            >
              Marca
            </label>
            <InputComponenteJsx
              name="marca"
              id="marca"
              type="text"
              value={formData.marca}
              handleChange={handleChange}
              placeholder="Marca"
              disable={isSubmitting}
              tab={0}
              className=""
            />
          </div>

          <div>
            <label
              htmlFor="modelo"
              className="block text-sm font-medium text-gray-700"
            >
              Modelo
            </label>
            <InputComponenteJsx
              name="modelo"
              id="modelo"
              type="text"
              value={formData.modelo}
              handleChange={handleChange}
              placeholder="Modelo"
              disable={isSubmitting}
              tab={0}
              className=""
            />
          </div>
        </div>

        {/* SECCIÓN 3: DEPÓSITO Y UBICACIÓN */}
        <div className="flex w-full justify-between items-center gap-6 border-t pt-4">
          <div className="flex items-center w-full gap-2">
            <div className="w-full flex flex-col">
              <label
                htmlFor="depositoId"
                className="block text-sm font-medium text-gray-700"
              >
                Depósito
              </label>
              <select
                id="depositoId"
                name="depositoId"
                value={formData.depositoId}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="" disabled>
                  Selecciona un depósito
                </option>
                {localDepositos?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            <BotonAgregarDeposito
              handleDepositoAgregado={handleDepositoAgregado}
              empresaId={empresaId}
            />
          </div>

          <div className="flex items-center w-full gap-2">
            <div className="w-full flex flex-col">
              <label
                htmlFor="ubicacionId"
                className="block text-sm font-medium text-gray-700"
              >
                Ubicación
              </label>
              <select
                id="ubicacionId"
                name="ubicacionId"
                value={formData.ubicacionId}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                disabled={!formData.depositoId}
              >
                <option value="" disabled>
                  Selecciona una ubicación
                </option>
                {filteredUbicaciones?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>
            <BotonAgregarUbicacion
              depositos={localDepositos}
              handleUbicacionAgregada={handleUbicacionAgregada}
              empresaId={empresaId}
            />
          </div>
        </div>

        {/* SECCIÓN 4: PRECIOS, IVA, STOCK */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t pt-6">
          <div>
            <label
              htmlFor="pCompra"
              className="block text-sm font-medium text-gray-700"
            >
              Precio Compra
            </label>
            <input
              type="number"
              name="pCompra"
              id="pCompra"
              step="any"
              value={formData.pCompra}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="0.00"
            />
          </div>

          <div>
            <label
              htmlFor="pVenta"
              className="block text-sm font-medium text-gray-700"
            >
              Precio Venta ✅
            </label>
            <input
              type="number"
              name="pVenta"
              id="pVenta"
              step="any"
              value={formData.pVenta}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${
                errores.pVenta ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              required
            />
            {errores.pVenta && (
              <p className="mt-1 text-sm text-red-600">{errores.pVenta}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="iva"
              className="block text-sm font-medium text-gray-700"
            >
              IVA
            </label>
            <select
              name="iva"
              value={formData.iva}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="21">21% IVA</option>
              <option value="27">27% IVA</option>
              <option value="10.5">10.5% IVA</option>
              <option value="0">No Aplica</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="unidadMedida"
              className="block text-sm font-medium text-gray-700"
            >
              Unidad de Medida
            </label>
            <select
              name="unidadMedida"
              value={formData.unidadMedida}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="unidad">Unidad</option>
              <option value="kg">Kilogramos</option>
              <option value="gr">Gramos</option>
              <option value="lt">Litros</option>
              <option value="mt">Metros</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t pt-6">
          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
              Stock Inicial
            </label>
            <input
              type="number"
              name="stock"
              id="stock"
              step="any"
              value={formData.stock}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${
                errores.stock ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              required
            />
            {errores.stock && (
              <p className="mt-1 text-sm text-red-600">{errores.stock}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="alertaStock"
              className="block text-sm font-medium text-gray-700"
            >
              Alerta Stock
            </label>
            <input
              type="number"
              name="alertaStock"
              id="alertaStock"
              step="any"
              value={formData.alertaStock}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="0"
            />
          </div>

          <div>
            <label
              htmlFor="fechaVencimiento"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              name="fechaVencimiento"
              id="fechaVencimiento"
              value={formData.fechaVencimiento}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        {/* BOTÓN DE ENVÍO MEJORADO */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={
              isSubmitting || Object.values(errores).some((error) => error)
            }
            className={`px-6 py-2 rounded-md font-medium ${
              isSubmitting || Object.values(errores).some((error) => error)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </span>
            ) : (
              "Guardar Producto"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default FormularioCargaProducto;
