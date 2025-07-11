import { useState, useEffect } from 'react';

export default function ConfiguracionSistema({ user }) {
  const [config, setConfig] = useState({
    razonSocial: '',
    logoUrl: '',
    email: '',
    telefono: '',
    direccion: '',
    documento: '',
    colorAcento: '#3056D3', // Color por defecto
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        // Asumimos que tienes un endpoint para obtener los datos de la empresa
        const response = await fetch(`/api/empresas/${user.empresaId}`);
        if (!response.ok) throw new Error('No se pudieron cargar los datos de la empresa.');
        const data = await response.json();
        setConfig({
          razonSocial: data.razonSocial || '',
          logoUrl: data.srcPhoto || '',
          email: data.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          documento: data.documento || '',
          colorAcento: data.colorAcento || '#3056D3',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.empresaId) {
      fetchEmpresaData();
    }
  }, [user]);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
    setSuccess('');
    setError('');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/ajustes/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al guardar la configuración.');
      }

      setSuccess('¡Configuración guardada con éxito!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando configuración...</p>;

  return (
    <form className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Configuración de la Empresa</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1 text-gray-700">Razón Social</label>
          <input type="text" name="razonSocial" value={config.razonSocial} onChange={handleChange} className="input w-full" required />
        </div>
        
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Documento (CUIT/CUIL)</label>
          <input type="text" name="documento" value={config.documento} onChange={handleChange} className="input w-full" required />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">Email de Contacto</label>
          <input type="email" name="email" value={config.email} onChange={handleChange} className="input w-full" />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">Teléfono</label>
          <input type="text" name="telefono" value={config.telefono} onChange={handleChange} className="input w-full" />
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold mb-1 text-gray-700">Dirección</label>
          <input type="text" name="direccion" value={config.direccion} onChange={handleChange} className="input w-full" />
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold mb-1 text-gray-700">Logo de la Empresa</label>
          <div className="flex items-center gap-4">
            {config.logoUrl && <img src={config.logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-md border p-1" />}
            <input type="file" name="logoUrl" onChange={handleLogoUpload} className="input" />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">Color de Marca (para comprobantes)</label>
          <div className="flex items-center gap-2">
            <input type="color" name="colorAcento" value={config.colorAcento} onChange={handleChange} className="w-10 h-10 rounded-md" />
            <span className="font-mono text-sm text-gray-600">{config.colorAcento}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-right">
        <button type="submit" className="bg-primary-100 text-white px-6 py-2 rounded-lg hover:bg-primary-200 transition shadow-md" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      {success && <p className="text-green-600 mt-4 text-center">{success}</p>}
    </form>
  );
}