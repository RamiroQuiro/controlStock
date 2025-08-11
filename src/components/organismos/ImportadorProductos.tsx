import { useState } from 'react';
import BotonChildresIcono from '../atomos/BotonChildresIcono';
import { Upload } from 'lucide-react';
import Table from '../tablaComponentes/Table';
import { exportacionProductosClomuns } from '../../utils/columnasTables';
import LoaderReact from '../../utils/loader/LoaderReact';

export default function ImportadorProductos() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [importResults, setImportResults] = useState<any[]>([]);

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
      setImportResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div >
      <form onSubmit={handleSubmit}>
          <label
            htmlFor="file-productos"
            className="block mb-2 text-sm font-medium"
          >
            Seleccionar archivo CSV
          </label>
        <div className="mb-4 flex justify-between items-center gap-4">
          <input
            type="file"
            id="file-productos"
            name="file-productos"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400 border border-gray-600 rounded-lg cursor-pointer bg-gray-700 file:bg-gray-800 file:border-0 file:text-white file:px-4 file:py-2"
          />
        <BotonChildresIcono
          type="submit"
          
          disabled={file === null}
          icono={Upload}
          className=" bg-gray-700 text-sm px-2 py-1  hover:bg-gray-700/70 text-white"
          children="Importar Productos"
          />
          </div>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
{/* 
      {response && (
        <div className="mt-6 bg-black/20 p-4 rounded-lg">
          <h3 className="font-bold mb-2">
            Respuesta del Servidor (Datos Parseados):
          </h3>
          <pre className="text-xs text-white bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )} */}
      {
         importResults?.length > 0 && (
          <div>
            <h3>Resultados de la Importación:</h3>
            <Table 
            columnas={exportacionProductosClomuns}
            arrayBody={importResults}
            styleTable="min-w-full bg-white"
            renderBotonActions={false}
            onClickRegistro={false}
            />
     
   </div>
     )}
     {loading && <LoaderReact />}
    </div>
  );
}
