import { useState } from 'react';
import InputFormularioSolicitud from '../../../../components/moleculas/InputFormularioSolicitud';
import LoaderReact from '../../../../utils/loader/LoaderReact';

export default function FormularioCambiarPassword({ user }) {
  const [form, setForm] = useState({
    actual: '',
    nueva: '',
    repetir: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (form.nueva !== form.repetir) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    // Aquí llamas a tu API para cambiar la contraseña
    const res = await fetch('/api/users/changePassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
        actual: form.actual,
        nueva: form.nueva,
      }),
    });
    if (res.ok) {
      setLoading(false);
      setSuccess('Contraseña cambiada correctamente.');
      setForm({ actual: '', nueva: '', repetir: '' });
    } else {
      setLoading(false);
      setError('Error al cambiar la contraseña. Verifica la actual.');
    }
  };

  return (
    <form
      className="flex flex-col gap-4 h-full w-full items-start justify-normal relative p-2"
      onSubmit={handleSubmit}
    >
      <h2 className="text-3xl font-bold text-primary-textoTitle flex items-center gap-2">
        Cambiar Contraseña
      </h2>
      <InputFormularioSolicitud
        id="actual"
        type="password"
        name="actual"
        placeholder="Contraseña actual"
        value={form.actual}
        onchange={handleChange}
      >
        Contraseña actual
      </InputFormularioSolicitud>
      <InputFormularioSolicitud
        id="nueva"
        type="password"
        name="nueva"
        placeholder="Nueva contraseña"
        value={form.nueva}
        onchange={handleChange}
      >
        Contraseña actual
      </InputFormularioSolicitud>
      <InputFormularioSolicitud
        id="repetir"
        type="password"
        name="repetir"
        placeholder="Nueva contraseña"
        value={form.repetir}
        onchange={handleChange}
      >
        Contraseña actual
      </InputFormularioSolicitud>
      <div className="w-full h-8 text-sm flex items-center justify-center ">
        {loading && <LoaderReact />}
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </div>
      <div className="w-full flex items-center justify-end mt-">
        <button
          type="submit"
          className="bg-gray-200  text-primary-100 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Cambiar Contraseña
        </button>
      </div>
    </form>
  );
}
