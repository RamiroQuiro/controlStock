import { useState } from "react";
import { showToast } from "../../../../utils/toast/toastShow";
import { loader } from "../../../../utils/loader/showLoader";
import LoaderReact from "../../../../utils/loader/LoaderReact";
import Input from "../../../../components/atomos/Input";
import Button from "../../../../components/atomos/Button";
import Selector from "../../../../components/atomos/Selector";

interface Props {
  userId: string;
  depositos: { id: string; nombre: string }[];
  roles: { id: string; value: string; name: string }[];
}

interface NuevoUsuario {
  dni: number;
  id: string;
  isEdit: boolean;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: string;
  tipoUsuario: "empleado" | "cliente" | "proveedor";
  depositoId?: string;
}

export default function FormularioNuevoUser({
  userId,
  depositos = [],
  roles = [],
}: Props) {
  const [formData, setFormData] = useState<NuevoUsuario>({
    dni: 0,
    id: "",
    isEdit: false,
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "vendedor",
    tipoUsuario: "empleado",
    depositoId: "",
  });
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

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
      !formData.email ||
      !formData.password
    ) {
      setErrors("Todos los campos son obligatorios");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors("Email inválido");
      return false;
    }

    if (formData.password.length < 6) {
      setErrors("La contraseña debe tener al menos 6 caracteres");
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

      const response = await fetch("/api/users/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          ...formData,
          rol: rolBase, // Rol base (admin/vendedor/repositor)
          rolPersonalizadoId, // ID del rol personalizado si aplica
          creadoPor: userId,
        }),
      });

      const result = await response.json();

      if (result.status === 400 || result.status === 403) {
        setErrors(result.data || "Error al crear usuario");
      } else {
        showToast("Usuario creado exitosamente", {
          background: "bg-green-600",
        });
        setFormData({
          dni: 0,
          id: "",
          isEdit: false,
          nombre: "",
          apellido: "",
          email: "",
          password: "",
          rol: "vendedor",
          tipoUsuario: "empleado",
          depositoId: "",
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
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

      <div>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Selector
            name="rol"
            className="text-black"
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
        <Button variant="primary" type="submit">
          Crear Usuario
        </Button>
      </div>
    </form>
  );
}
