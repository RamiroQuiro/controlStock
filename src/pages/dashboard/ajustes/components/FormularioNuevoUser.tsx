import { useEffect, useState } from 'react';
import { showToast } from '../../../../utils/toast/toastShow';
import { loader } from '../../../../utils/loader/showLoader';
import InputFormularioSolicitud from '../../../../components/moleculas/InputFormularioSolicitud';
import LoaderReact from '../../../../utils/loader/LoaderReact';
import { useStore } from '@nanostores/react';
import { dataFormularioContexto } from '../../../../context/store';

interface Props {
  userId: string; // ID del admin que está creando el usuario
  datosFormulario: NuevoUsuario;
}

interface NuevoUsuario {
  dni: number;
  id: string;
  isEdit: boolean;
  nombre: string;
  apellido: string;
  email: string;
  password: string;

  rol: 'admin' | 'vendedor' | 'repositor';
  tipoUsuario: 'empleado' | 'cliente' | 'proveedor';
}

export default function FormularioNuevoUser({
  userId,
  datosFormulario,
}: Props) {
  const $dataFormularioContexto = useStore(dataFormularioContexto);

  console.log($dataFormularioContexto);
  const [formData, setFormData] = useState<NuevoUsuario>({
    dni: 0,
    id: '',
    isEdit: false,
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'vendedor',
    tipoUsuario: 'empleado',
  });
  const [errors, setErrors] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ($dataFormularioContexto?.isEdit) {
      setFormData({
        dni: $dataFormularioContexto.dni || 0,
        id: $dataFormularioContexto.id || '',
        isEdit: true,
        nombre: $dataFormularioContexto.nombre || '',
        apellido: $dataFormularioContexto.apellido || '',
        email: $dataFormularioContexto.email || '',
        password: '', // Nunca mostrar password existente
        rol: $dataFormularioContexto.rol || 'vendedor',
        tipoUsuario: $dataFormularioContexto.tipoUsuario || 'empleado',
      });
    }
  }, [$dataFormularioContexto]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'dni' ? Number(value) : value,
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
      setErrors('Todos los campos son obligatorios');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors('Email inválido');
      return false;
    }

    if (formData.password.length < 6) {
      setErrors('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loader(true);
    setErrors('');

    if (!validateForm()) {
      loader(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          ...formData,
          creadoPor: userId,
        }),
      });

      const result = await response.json();

      if (result.status === 400 || result.status === 403) {
        setErrors(result.data || 'Error al crear usuario');
      } else {
        showToast('Usuario creado exitosamente', {
          background: 'bg-green-600',
        });
        setFormData({
          ...formData,
          isEdit: false,
        });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      showToast('Ocurrió un error inesperado', {
        background: 'bg-red-600',
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
      <h2 className="text-xl font-semibold">
        {formData.isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      </h2>

      <div className="flex gap-2">
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

      <div className="flex gap-2">
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

      <div>
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

      <div>
        <label className="block text-sm font-medium">Rol</label>
        <select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          className="mt-1 w-full border rounded px-3 py-2"
        >
          <option value="vendedor">Vendedor</option>
          <option value="repositor">Repositor</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Tipo de Usuario</label>
        <select
          name="tipoUsuario"
          value={formData.tipoUsuario}
          onChange={handleChange}
          className="mt-1 w-full border rounded px-3 py-2"
        >
          <option value="empleado">Empleado</option>
          <option value="cliente">Cliente</option>
          <option value="proveedor">Proveedor</option>
        </select>
      </div>

      <div className="text-center">
        {loading && <LoaderReact />}
        {errors && <span className="text-primary-400 py-2">{errors}</span>}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => (window.location.href = '/dashboard/ajustes/usuarios')}
          className="px-4 py-1 border rounded text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-1 bg-primary-100 text-white rounded hover:bg-primary-100/80"
        >
          {formData.isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
}
