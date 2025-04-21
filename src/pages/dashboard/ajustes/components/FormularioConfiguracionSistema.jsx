// src/pages/dashboard/ajustes/configuracion/ConfiguracionSistema.jsx
import { useState } from "react";

export default function ConfiguracionSistema() {
  const [config, setConfig] = useState({
    nombreEmpresa: "",
    logoUrl: "",
    emailContacto: "",
    telefono: "",
    direccion: "",
    moneda: "ARS",
    formatoFecha: "dd/mm/yyyy",
    zonaHoraria: "America/Argentina/Buenos_Aires",
    // ...otros campos que quieras agregar
  });

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e) => {
    // lógica para subir y mostrar logo
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // lógica para guardar la configuración
  };

  return (
    <form className="max-w-xl mx-auto bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Configuración del Sistema</h2>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Nombre de la empresa</label>
        <input type="text" name="nombreEmpresa" value={config.nombreEmpresa} onChange={handleChange} className="input" />
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Logo</label>
        <input type="file" name="logoUrl" onChange={handleLogoUpload} className="input" />
        {config.logoUrl && <img src={config.logoUrl} alt="Logo" className="h-16 mt-2" />}
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Email de contacto</label>
        <input type="email" name="emailContacto" value={config.emailContacto} onChange={handleChange} className="input" />
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Teléfono</label>
        <input type="text" name="telefono" value={config.telefono} onChange={handleChange} className="input" />
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Dirección</label>
        <input type="text" name="direccion" value={config.direccion} onChange={handleChange} className="input" />
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Moneda</label>
        <select name="moneda" value={config.moneda} onChange={handleChange} className="input">
          <option value="ARS">Peso Argentino (ARS)</option>
          <option value="USD">Dólar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
          {/* agrega más monedas si quieres */}
        </select>
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Formato de fecha</label>
        <select name="formatoFecha" value={config.formatoFecha} onChange={handleChange} className="input">
          <option value="dd/mm/yyyy">dd/mm/yyyy</option>
          <option value="mm/dd/yyyy">mm/dd/yyyy</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Zona horaria</label>
        <input type="text" name="zonaHoraria" value={config.zonaHoraria} onChange={handleChange} className="input" />
      </div>
      <button type="submit" className="bg-primary-100 text-white px-4 py-2 rounded hover:bg-primary-200 transition">Guardar cambios</button>
    </form>
  );
}