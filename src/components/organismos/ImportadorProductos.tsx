import { useState } from 'react';
import BotonChildresIcono from '@/components/atomos/BotonChildresIcono';

export default function ImportadorProductos() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecciona un archivo.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    const formData = new FormData();
    formData.append('file-productos', file);

    try {
      const res = await fetch('/api/ajustes/importarProductos', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Ocurrió un error');
      }

      setResponse(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div class="mb-4">
          <label htmlFor="file-productos" class="block mb-2 text-sm font-medium">
            Seleccionar archivo CSV
          </label>
          <input
            type="file"
            id="file-productos"
            name="file-productos"
            accept=".csv"
            onChange={handleFileChange}
            class="block w-full text-sm text-gray-400 border border-gray-600 rounded-lg cursor-pointer bg-gray-700 file:bg-gray-800 file:border-0 file:text-white file:px-4 file:py-2"
          />
        </div>
        <BotonChildresIcono
          nombre={loading ? 'Importando...' : 'Importar Productos'}
          type="submit"
          disabled={loading}
        />
      </form>

      {error && <p class="text-red-500 mt-4">{error}</p>}

      {response && (
        <div class="mt-6 bg-black/20 p-4 rounded-lg">
          <h3 class="font-bold mb-2">Respuesta del Servidor (Datos Parseados):</h3>
          <pre class="text-xs text-white bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
