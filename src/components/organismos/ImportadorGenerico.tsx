import { useState } from 'react';
import BotonChildresIcono from '../atomos/BotonChildresIcono';
import { Upload } from 'lucide-react';
import Table from '../tablaComponentes/Table';
import LoaderReact from '../../utils/loader/LoaderReact';

interface Props {
  titulo: string;
  endpoint: string;
  inputName: string;
  columnasResultado: any[];
}

export default function ImportadorGenerico({ titulo, endpoint, inputName, columnasResultado }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importResults, setImportResults] = useState<any[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setImportResults(null); // Limpiar resultados anteriores al cambiar de archivo
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
    setImportResults(null);

    const formData = new FormData();
    formData.append(inputName, file);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Ocurrió un error en el servidor');
      }

      setImportResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-primary-bg-componentes mt-4">
      <h3 className="text-lg font-semibold text-primary-textoTitle mb-3">{titulo}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex justify-between items-center gap-4">
          <input
            type="file"
            id={inputName}
            name={inputName}
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400 border border-gray-600 rounded-lg cursor-pointer bg-gray-700 file:bg-gray-800 file:border-0 file:text-white file:px-4 file:py-2"
          />
          <BotonChildresIcono
            type="submit"
            disabled={!file || loading}
            icono={Upload}
            className="bg-gray-700 text-sm px-2 py-1 hover:bg-gray-600 text-white"
            children="Importar"
          />
        </div>
      </form>

      {loading && <LoaderReact />}
      {error && <p className="text-red-500 mt-4 text-sm">Error: {error}</p>}

      {importResults && importResults.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Resultados de la Importación:</h4>
          <div className="max-h-60 overflow-y-auto">
            <Table 
              columnas={columnasResultado}
              arrayBody={importResults}
              styleTable="min-w-full bg-white text-xs"
              renderBotonActions={false}
              onClickRegistro={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
