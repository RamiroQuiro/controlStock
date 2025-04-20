import { useState } from "react";
import { showToast } from "../../../../utils/toast/toastShow";
import { loader } from "../../../../utils/loader/showLoader";
import InputFormularioSolicitud from "../../../../components/moleculas/InputFormularioSolicitud";
import LoaderReact from "../../../../utils/loader/LoaderReact";

// Definición de tipos para el usuario
interface NuevoUsuario {
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: 'admin' | 'vendedor' | 'repositor';
  tipoUsuario: 'empleado' | 'cliente' | 'proveedor';
}

interface Props {
  userId: string; // ID del admin que está creando el usuario
}

export default function FormularioNuevoUser({ userId }: Props) {
  // Estado inicial del formulario
  const [formData, setFormData] = useState<NuevoUsuario>({
    dni: 0,
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'empleado',
    tipoUsuario: 'empleado'
  });

  const [errors, setErrors] = useState('');
  const [loading, setLoading] = useState(false);

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validación de formulario
  const validateForm = () => {
    if (!formData.dni || !formData.nombre || !formData.apellido || 
        !formData.email || !formData.password) {
      setErrors('Todos los campos son obligatorios');
      return false;
    }
    
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors('Email inválido');
      return false;
    }

    // Validación de contraseña
    if (formData.password.length < 6) {
      setErrors('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loader(true);
    setErrors('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/users/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          ...formData,
          creadoPor: userId // Pasamos el ID del admin que crea el usuario
        })
      });

      const result = await response.json();

      if (result.status === 400) {
        setErrors(result.data || 'Error al crear usuario');
      } else {
        window.location.reload()
        showToast('Usuario creado exitosamente', {
          background: 'bg-green-600'
        });
        // Limpiar formulario o redirigir
        setFormData({
          dni: 0,
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          rol: 'empleado',
          tipoUsuario: 'empleado'
        });
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      showToast('Ocurrió un error inesperado', {
        background: 'bg-red-600'
      });
    } finally {
      setLoading(false);
      loader(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full text-primary-texto p-6">
      <h2 className="text-xl text-primary-textoTitle font-semibold">
        Crear Nuevo Usuario
      </h2>

      {/* Datos personales */}
      <div className="w-full flex items-center justify-normal gap-2">
        <InputFormularioSolicitud
          id="nombre"
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onchange={handleChange}
        >
          Nombre
        </InputFormularioSolicitud>

        <InputFormularioSolicitud
          id="apellido"
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={formData.apellido}
          onchange={handleChange}
        >
          Apellido
        </InputFormularioSolicitud>
      </div>

      {/* Datos de cuenta */}
      <div className="w-full flex items-center justify-normal gap-2">
        <InputFormularioSolicitud
          id="DNI"
          type="number"
          name="dni"
          placeholder="DNI"
          value={formData.dni}
          onchange={handleChange}
        >
          DNI
        </InputFormularioSolicitud>

        <InputFormularioSolicitud
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onchange={handleChange}
        >
          Email
        </InputFormularioSolicitud>
      </div>

      {/* Contraseña */}
      <div className="w-full flex items-center justify-normal gap-2">
        <InputFormularioSolicitud
          id="password"
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onchange={handleChange}
        >
          Contraseña
        </InputFormularioSolicitud>
      </div>

      {/* Roles y Permisos */}
      <div className="w-full">
        <label className="block text-sm font-medium w-full">Rol</label>
        <select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
        >
          <option value="vendedor">Vendedor</option>
          <option value="repositor">Repositor</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium w-full">Tipo de Usuario</label>
        <select
          name="tipoUsuario"
          value={formData.tipoUsuario}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
        >
          <option value="empleado">Empleado</option>
          <option value="cliente">Cliente</option>
          <option value="proveedor">Proveedor</option>
        </select>
      </div>

      {/* Estado y Errores */}
      <div className="w-full flex items-center text-center justify-center gap-2">
         {/* Laoder */}
            {loading && (
             <LoaderReact/>
            )}

        {errors && (
          <span className="text-primary-400 py-2">{errors}</span>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => window.location.href = '/dashboard/ajustes/usuarios'}
          className="px-4 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-1 bg-primary-100 text-white rounded-md hover:bg-primary-100/80"
        >
          Crear Usuario
        </button>
      </div>
    </form>
  );
}