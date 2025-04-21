import { useState } from "react";

export default function NotificacionesOpciones() {
  const [preferencias, setPreferencias] = useState({
    email: true,
    push: false,
    novedades: true,
    avisosSistema: true,
  });

  const handleChange = (e) => {
    setPreferencias({
      ...preferencias,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí guardarías las preferencias en backend o localStorage
    alert("Preferencias guardadas correctamente");
  };

  return (
    <form className="max-w-xl mx-auto bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Notificaciones</h2>
      <p className="mb-4 text-gray-600">Configura cómo quieres recibir avisos importantes y novedades del sistema.</p>
      <div className="flex flex-col gap-3 mb-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="email" checked={preferencias.email} onChange={handleChange} />
          Recibir notificaciones por email
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="push" checked={preferencias.push} onChange={handleChange} />
          Recibir notificaciones emergentes en la app
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="novedades" checked={preferencias.novedades} onChange={handleChange} />
          Recibir novedades y actualizaciones
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="avisosSistema" checked={preferencias.avisosSistema} onChange={handleChange} />
          Avisos críticos del sistema
        </label>
      </div>
      <button type="submit" className="bg-primary-100 text-white px-4 py-2 rounded hover:bg-primary-200 transition">
        Guardar preferencias
      </button>
    </form>
  );
}