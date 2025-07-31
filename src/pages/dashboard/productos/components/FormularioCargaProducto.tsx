import React, { useState, useEffect } from "react";
import { showToast } from "../../../../utils/toast/toastShow";
import InputFile from "../../../../components/moleculas/InputFile";
import CategoriasSelector from "./CategoriasSelector";
import Button3 from "../../../../components/atomos/Button3.jsx"; // Asumiendo que Button3 es un componente React
import Button5 from "../../../../components/atomos/Button5.jsx";
import BotonAgregarDeposito from "../../../../components/moleculas/BotonAgregarDepositojsx.jsx";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx.jsx";
import BotonAgregarUbicacion from "../../../../components/moleculas/BotonAgregarUbicacion.jsx";

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
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categoriasIds, setCategoriasIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [localDepositos, setLocalDepositos] = useState<Deposito[]>(depositos);
  const [localUbicaciones, setLocalUbicaciones] = useState<Ubicacion[]>(ubicaciones);

  useEffect(() => {
    setLocalDepositos(depositos);
  }, [depositos]);

  useEffect(() => {
    setLocalUbicaciones(ubicaciones);
  }, [ubicaciones]);

  const filteredUbicaciones = formData.depositoId
    ? localUbicaciones.filter((u) => u.depositoId === formData.depositoId)
    : [];

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedFile(null);
    setCategoriasIds([]);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      if (name === "depositoId") {
        newFormData.ubicacionId = "";
      }
      return newFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
        throw new Error(data.msg || "Error en el servidor");
      }
      showToast("success", "¡Producto guardado con éxito!");
      resetForm();
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      showToast("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="p-4 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* ... (resto del JSX del formulario) ... */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <div className="md:col-span-1 flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto del Producto (Opcional)
            </label>
            <InputFile name="fotoProducto" onFileChange={setSelectedFile} />
          </div>
          <div className="md:col-span-2 flex flex-col gap-4 w-full">
            <div>
              <label
                htmlFor="codigoBarra"
                className="block text-sm font-medium text-gray-700"
              >
                Código de Barra
              </label>
              <input
                type="text"
                name="codigoBarra"
                id="codigoBarra"
                value={formData.codigoBarra}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-gray-700"
              >
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Color, tamaño, detalles..."
                required
              ></textarea>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categorías
            </label>
            <CategoriasSelector
              empresaId={empresaId}
              onCategoriasChange={setCategoriasIds}
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
              value={formData.marca}
              handleChange={handleChange}
              placeholder="Marca"
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
              value={formData.modelo}
              handleChange={handleChange}
              placeholder="Modelo"
            />
          </div>
        </div>

        <div className="flex w-full justify-between items-cente gap-6 border-t pt-4">
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
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm w-f"
              >
                <option value="" disabled>
                  Selecciona un depósito
                </option>
                {localDepositos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            <BotonAgregarDeposito handleDepositoAgregado={handleDepositoAgregado} empresaId={empresaId} />
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
                {filteredUbicaciones.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>
            <BotonAgregarUbicacion depositos={localDepositos} handleUbicacionAgregada={handleUbicacionAgregada} empresaId={empresaId} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t pt-6">
          <div>
            <label
              htmlFor="pCompra"
              className="block text-sm font-medium text-gray-700"
            >
              Precio Compra
            </label>
            <InputComponenteJsx
              type="number"
              name="pCompra"
              id="pCompra"
              value={formData.pCompra}
              handleChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="pVenta"
              className="block text-sm font-medium text-gray-700"
            >
              Precio Venta
            </label>
            <InputComponenteJsx
              type="number"
              name="pVenta"
              id="pVenta"
              value={formData.pVenta}
              handleChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t pt-6">
          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
              Stock Inicial
            </label>
            <InputComponenteJsx
              type="number"
              name="stock"
              id="stock"
              value={formData.stock}
              handleChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
              Alerta Stock
            </label>
            <InputComponenteJsx
              type="number"
              name="alertaStock"
              id="alertaStock"
              value={formData.alertaStock}
              handleChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button5 type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Producto"}
          </Button5>
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center mt-2">{error}</div>
        )}
      </form>
    </div>
  );
};

export default FormularioCargaProducto;
