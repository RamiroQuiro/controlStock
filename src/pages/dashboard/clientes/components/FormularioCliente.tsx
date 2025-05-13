import { useState } from 'react';
import InputFormularioSolicitud from '../../../../components/moleculas/InputFormularioSolicitud';
import LoaderReact from '../../../../utils/loader/LoaderReact';

interface Cliente {
  id?: string;
  nombre: string;
  dni: number;
  telefono: string;
  email: string;
  direccion: string;
  categoria: 'VIP' | 'regular' | 'nuevo';
  estado: 'activo' | 'inactivo';
  limiteCredito: number;
  observaciones: string;
}

interface Props {
  cliente?: Cliente; // Opcional para nuevo cliente
  modo: 'crear' | 'editar';
  empresaId: string;
  userId: string;
}

export default function FormularioCliente({
  cliente,
  modo,
  empresaId,
  userId,
}: Props) {
  const [formData, setFormData] = useState<Cliente>(
    cliente || {
      nombre: '',
      dni: 0,
      telefono: '',
      email: '',
      direccion: '',
      categoria: 'nuevo',
      estado: 'activo',
      limiteCredito: 0,
      observaciones: '',
    }
  );
  const [errors, setErrors] = useState('');
  console.log(empresaId);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre || !formData.dni) {
      setErrors('Todos los campos son obligatorios');
      return;
    }

    // Activar estado de carga
    setLoading(true);
    setErrors('');

    try {
      const url =
        modo === 'crear'
          ? '/api/clientes/crear'
          : `/api/clientes/${cliente?.id}/actualizar`;

      const response = await fetch(url, {
        method: modo === 'crear' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'xx-empresa-id': empresaId,
          'x-user-id': userId,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(
          errorData.message ||
            `Error al ${modo === 'crear' ? 'crear' : 'actualizar'}`
        );
        throw new Error(
          `Error al ${modo === 'crear' ? 'crear' : 'actualizar'}`
        );
      }

      // Redirigir
      const data = await response.json();
      window.location.href = `/dashboard/clientes/${modo === 'crear' ? data.id : cliente?.id}`;
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      setErrors(
        `Error al ${modo === 'crear' ? 'crear' : 'actualizar'} cliente`
      );
    } finally {
      // Desactivar estado de carga sin importar el resultado
      setLoading(false);
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
    <form
      onSubmit={handleSubmit}
      className=" flex flex-col gap-4 w-full text-primary-texto p-6"
    >
      <h2 className="text-xl text-primary-textoTitle font-semibold ">
        {modo == 'crear' ? 'Crear' : 'Modificar'} Cliente
      </h2>
      <div className="flex flex-col gap-4 items-center w-full justify-normal">
        {/* Datos básicos */}
        <div className="w-full flex items-center justify-normal gap-2 ">
          <InputFormularioSolicitud
            id={'nombre'}
            type={'text'}
            name={'nombre'}
            placeholder={'nombre'}
            value={formData.nombre}
            onchange={handleChange}
          >
            Nombre
          </InputFormularioSolicitud>
          <InputFormularioSolicitud
            id={'dni'}
            type={'text'}
            name={'dni'}
            placeholder={'DNI'}
            value={formData.dni}
            onchange={handleChange}
          >
            DNI
          </InputFormularioSolicitud>
        </div>
        <div className="w-full flex items-center justify-normal gap-2 ">
          <InputFormularioSolicitud
            id={'telefono'}
            type={'text'}
            name={'telefono'}
            placeholder={'telefono'}
            value={formData.telefono}
            onchange={handleChange}
          >
            Telefono
          </InputFormularioSolicitud>

          <InputFormularioSolicitud
            id={'email'}
            type={'text'}
            name={'email'}
            placeholder={'email'}
            value={formData.email}
            onchange={handleChange}
          >
            Email
          </InputFormularioSolicitud>
        </div>
        <div className="w-full flex items-center justify-normal gap-2 ">
          <InputFormularioSolicitud
            id={'direccion'}
            type={'text'}
            name={'direccion'}
            placeholder={'Direccion'}
            value={formData.direccion}
            onchange={handleChange}
          >
            Dirección
          </InputFormularioSolicitud>
          <InputFormularioSolicitud
            id={'limiteCredito'}
            type={'number'}
            name={'limiteCredito'}
            placeholder={'Limite de Credito'}
            value={formData.limiteCredito}
            onchange={handleChange}
          >
            Limite de Credito
          </InputFormularioSolicitud>
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium w-full">Categoría</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
          >
            <option value="nuevo">Nuevo</option>
            <option value="regular">Regular</option>
            <option value="VIP">VIP</option>
          </select>
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
        {loading && <LoaderReact />}
        {/* Estado */}

        {errors && <span className="text-primary-400 py-2">{errors}</span>}
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => (window.location.href = '/dashboard/clientes')}
          className="px-4 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-1 bg-primary-100 text-white rounded-md hover:bg-primary-100/80"
        >
          {modo == 'crear' ? ' Guardar Cliente' : 'Actualizar Cliente'}
        </button>
      </div>
    </form>
  );
}
