import { useState } from "react";
import InputComponenteJsx from "../../../dashboard/componente/InputComponenteJsx";
import InputFormularioSolicitud from "../../../../../components/moleculas/InputFormularioSolicitud";
import LoaderReact from "../../../../../utils/loader/LoaderReact";

interface Proveedor {
  id?: string;
  nombre: string;
  dni: number;
  celular: string;
  email: string;
  direccion: string;
  estado: "activo" | "inactivo";
  observaciones: string;
}

interface Props {
  proveedor?: Proveedor; // Opcional para nuevo cliente
  modo: "crear" | "editar";
  userId: string;
}

export default function FormularioProveedor({
  proveedor,
  modo,
  userId,
}: Props) {
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false); 
  const [formData, setFormData] = useState<Proveedor>(
    proveedor || {
      nombre: "",
      dni: "",
      celular: "",
      email: "",
      direccion: "",
      estado: "activo",
      observaciones: "",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nombre ||
      !formData.dni ||
      !formData.direccion
    ) {
      setErrors("Todos los campos son obligatorios");
      return;
    }
    setLoading(true);
    setErrors("");
    try {
      const url =
        modo === "crear"
          ? "/api/proveedores/crear"
          : `/api/proveedores/${proveedor?.id}/actualizar`;

      const response = await fetch(url, {
        method: modo === "crear" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        setLoading(false)
        setErrors(
          `Error al ${modo === "crear" ? "crear" : "actualizar"} , ${response.statusText}`
        );
        throw new Error(
          `Error al ${modo === "crear" ? "crear" : "actualizar"}`
        );
      }
      

      // Redirigir
      const data = await response.json();
      setLoading(false)
      window.location.href = `/dashboard/proveedores/${modo === "crear" ? data.id : proveedor?.id}`;
    } catch (error) {
      setLoading(false)
      console.error("Error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form className=" flex flex-col gap-4 w-full text-primary-texto p-6">
      <h2 className="text-xl text-primary-textoTitle font-semibold ">
        {modo == "crear" ? "Crear" : "Modificar"} Cliente
      </h2>
      <div className="flex flex-col gap-4 items-center w-full justify-normal">
        {/* Datos básicos */}
        <div className="w-full flex items-center justify-normal gap-2 ">
          <InputFormularioSolicitud
            id={"nombre"}
            type={"text"}
            name={"nombre"}
            placeholder={"nombre"}
            value={formData.nombre}
            onchange={handleChange}
          >
            Nombre
          </InputFormularioSolicitud>
          <InputFormularioSolicitud
            id={"dni"}
            type={"text"}
            name={"dni"}
            placeholder={"DNI"}
            value={formData.dni}
            onchange={handleChange}
          >
            DNI
          </InputFormularioSolicitud>
        </div>
        <div className="w-full flex items-center justify-normal gap-2 ">
          <InputFormularioSolicitud
            id={"celular"}
            type={"text"}
            name={"celular"}
            placeholder={"celular"}
            value={formData.celular}
            onchange={handleChange}
          >Celular</InputFormularioSolicitud>
          <InputFormularioSolicitud
            id={"email"}
            type={"text"}
            name={"email"}
            placeholder={"email"}
            value={formData.email}
            onchange={handleChange}
          >email</InputFormularioSolicitud>
        </div>
        <div className="w-full flex items-center justify-normal gap-2 ">
          <InputFormularioSolicitud
            id={"direccion"}
            type={"text"}
            name={"direccion"}
            placeholder={"direccion"}
            value={formData.direccion}
            onchange={handleChange}
          >Dirección</InputFormularioSolicitud>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium ">Observaciones</label>
        <textarea
          name="observaciones"
          rows={3}
          value={formData.observaciones}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
        />
      </div>
      <div className="w-full flex items-center  text-center justify-center gap-2 ">
         {/* Laoder */}
                {loading && (
                 <LoaderReact/>
                )}
        {/* Estado */}
        {errors && <span className="text-primary-400 py-2">{errors}</span>}
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => (window.location.href = "/dashboard/clientes")}
          className="px-4 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-1 bg-primary-100 text-white rounded-md hover:bg-primary-100/80"
        >
          {modo == "crear" ? " Guardar Cliente" : "Actualizar Cliente"}
        </button>
      </div>
    </form>
  );
}
