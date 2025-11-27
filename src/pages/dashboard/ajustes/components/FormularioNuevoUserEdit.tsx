import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { dataFormularioContexto } from "../../../../context/store";
import { showToast } from "../../../../utils/toast/toastShow";
import { loader } from "../../../../utils/loader/showLoader";
import LoaderReact from "../../../../utils/loader/LoaderReact";
import Input from "../../../../components/atomos/Input";
import Button from "../../../../components/atomos/Button";
import Selector from "../../../../components/atomos/Selector";

interface Props {
  depositos: { id: string; nombre: string }[];
  roles: { id: string; value: string; name: string }[];
  onClose?: () => void;
}

interface EditUsuario {
  id: string;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  tipoUsuario: "empleado" | "cliente" | "proveedor";
  depositoId?: string;
}

export default function FormularioNuevoUserEdit({
  depositos = [],
  roles = [],
  onClose,
}: Props) {
  const userToEdit = useStore(dataFormularioContexto);

  const [formData, setFormData] = useState<EditUsuario>({
    id: "",
    dni: 0,
    nombre: "",
    apellido: "",
    email: "",
    rol: "vendedor",
    tipoUsuario: "empleado",
    depositoId: "",
  });
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit && userToEdit.isEdit) {
      // Determinar el rol inicial (si tiene rolPersonalizadoId, usar ese)
      const rolInicial = userToEdit.rolPersonalizadoId || userToEdit.rol;

      setFormData({
        id: userToEdit.id,
        dni: Number(userToEdit.dni || userToEdit.documento) || 0,
        nombre: userToEdit.nombre || "",
        apellido: userToEdit.apellido || "",
        email: userToEdit.email || "",
        rol: rolInicial || "vendedor",
        tipoUsuario: "empleado", // Asumimos empleado por defecto si no viene
        depositoId: userToEdit.depositoId || "",
      });
    }
  }, [userToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dni" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.dni ||
      !formData.nombre ||
      !formData.apellido ||
      !formData.email
    ) {
      setErrors("Todos los campos son obligatorios");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors("Email inválido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loader(true);
    setErrors("");

    if (!validateForm()) {
      loader(false);
      return;
    }

    setLoading(true);

    try {
      // Detectar si es un rol personalizado (prefijo rolCustom-)
      const esRolPersonalizado = formData.rol.startsWith("rolCustom-");
      const rolPersonalizadoId = esRolPersonalizado ? formData.rol : null;
      const rolBase = esRolPersonalizado ? "vendedor" : formData.rol;

      const response = await fetch("/api/users/editUser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          rol: rolBase,
          rolPersonalizadoId,
        }),
      });

      const result = await response.json();

      if (result.status !== 200) {
        setErrors(result.message || "Error al actualizar usuario");
      } else {
        showToast("Usuario actualizado exitosamente", {
          background: "bg-green-600",
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      showToast("Ocurrió un error inesperado", {
        background: "bg-red-600",
      });
    } finally {
      setLoading(false);
      loader(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full text-primary-textoTitle p-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Editar Usuario</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          id="nombre"
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
        />
        <Input
          id="apellido"
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={formData.apellido}
          onChange={handleChange}
        />
      </div>

      <div className="flex gap-2">
        <Input
          id="DNI"
          type="text"
          name="dni"
          placeholder="DNI"
          value={formData.dni}
          onChange={handleChange}
        />
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Selector
            name="rol"
            labelOption="Seleccione un rol"
            defaultSelect={false}
            value={formData.rol}
            handleSelect={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleChange(e)
            }
            options={roles}
          />
        </div>

        <div>
          <Selector
            name="depositoId"
            labelOption="Seleccione una sucursal"
            defaultSelect={false}
            value={formData.depositoId}
            handleSelect={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleChange(e)
            }
            options={depositos.map((dep) => ({
              id: dep.id,
              value: dep.id,
              name: dep.nombre,
            }))}
          />
        </div>
      </div>

      <div>
        <Selector
          name="tipoUsuario"
          labelOption="Seleccione un tipo de usuario"
          defaultSelect={false}
          value={formData.tipoUsuario}
          handleSelect={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange(e)
          }
          options={[
            { id: "empleado", value: "empleado", name: "Empleado" },
            { id: "cliente", value: "cliente", name: "Cliente" },
            { id: "proveedor", value: "proveedor", name: "Proveedor" },
          ]}
        />
      </div>

      <div className="text-center">
        {loading && <LoaderReact />}
        {errors && <span className="text-primary-400 py-2">{errors}</span>}
      </div>

      <div className="flex justify-end gap-4">
        {onClose && (
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button variant="primary" type="submit">
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
}
