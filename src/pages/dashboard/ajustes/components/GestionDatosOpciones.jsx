import { useRef, useState, useEffect } from 'react';
import Button3 from '../../../../components/atomos/Button3';

export default function GestionDatosOpciones() {
  const fileInputRef = useRef(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressMessages, setProgressMessages] = useState([]);

  useEffect(() => {
    if (loading) {
      const eventSource = new EventSource('/api/ajustes/restauracion-stream');

      eventSource.addEventListener('restore-progress', (event) => {
        const data = JSON.parse(event.data);
        setProgressMessages((prev) => [...prev, data.message]);
      });

      eventSource.addEventListener('restore-complete', (event) => {
        const data = JSON.parse(event.data);
        setMensaje(data.message);
        setLoading(false);
        eventSource.close();
      });

      eventSource.addEventListener('restore-error', (event) => {
        const data = JSON.parse(event.data);
        setMensaje(data.message);
        setLoading(false);
        eventSource.close();
      });

      eventSource.onerror = () => {
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [loading]);

  const handleBackup = () => {
    window.open('/api/ajustes/respaldoDatos', '_blank');
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('backup', file);
    setLoading(true);
    setProgressMessages([]);
    setMensaje('');

    try {
      const res = await fetch('/api/ajustes/restaurarDatos', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        setMensaje('Error al iniciar la restauración.');
        setLoading(false);
      }
    } catch (err) {
      setMensaje('Error al conectar con el servidor.');
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Lógica para exportar datos
    setMensaje('Datos exportados correctamente.');
    setLoading(true);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Lógica para importar datos desde archivo
    setMensaje(`Archivo ${file.name} cargado para importar.`);
  };

  return (
    <div className="w-1/3  mx-auto bg-primary-bg-componentes p-6 rounded shadow flex flex-col gap-5">
      <h2 className="text-lg font-bold mb-2">Acciones</h2>
      <div className="flex flex-col gap-3 w-">
        <Button3 onClick={handleBackup}>
          Descargar Backup (todo el sistema)
        </Button3>
        <Button3 onClick={() => fileInputRef.current.click()}>
          Restaurar Backup
        </Button3>
        <input
          type="file"
          accept=".json,.zip"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleRestore}
        />
        <Button3 onClick={handleExport} disabled={true}>
          Exportar Datos
        </Button3>
        <label
          htmlFor="importFile"
          className=" bg-transparent hover:bg-primary-100/80 hover:text-white  border-primary-100 text-center px-3 py-1 rounded-lg font-semibold capitalize duration-300 text-xs  border disabled:bg-gray-300 disabled:text-red-300"
        >
          Importar Datos
          <input
            type="file"
            accept=".csv,.json"
            id="importFile"
            disabled
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </label>
      </div>
      {loading && (
        <div className="flex flex-col gap-2 animate-pulse text-primary-100 font-semibold mt-2">
          <div className="flex items-center gap-2">
            <span
              style={{
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #3498db',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                animation: 'spin 1s linear infinite',
              }}
              className="loader"
            ></span>
            <span>Restaurando datos...</span>
          </div>
          <div className="flex flex-col gap-1 text-xs overflow-auto">
            {progressMessages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
        </div>
      )}
      {mensaje && <div className="mt-4 text-green-600">{mensaje}</div>}
    </div>
  );
}
