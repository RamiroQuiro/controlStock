import { useRef, useState, useEffect } from 'react';
import Button3 from '../../../../components/atomos/Button3';

export default function GestionDatosOpciones() {
  const fileInputRef = useRef(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
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
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
      // Reset el input para poder subir el mismo archivo de nuevo si es necesario
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card para Respaldar Datos */}
        <ActionCard
          icon={Download}
          title="Crear Respaldo"
          description="Descarga un archivo de respaldo con todos los datos de la empresa (excepto usuarios)."
        >
          <button
            onClick={handleBackup}
            className="bg-primary-textoTitle text-white px-4 text-xs py-2 rounded hover:bg-primary-textoTitle/80 transition"
          >
            Descargar
          </button>
        </ActionCard>

        {/* Card para Restaurar Datos */}
        <ActionCard
          icon={Upload}
          title="Restaurar Respaldo"
          description="Sube un archivo de respaldo para restaurar los datos del sistema a un punto anterior."
        >
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
            className="bg-primary-textoTitle text-white px-4 text-xs py-2 rounded hover:bg-primary-textoTitle/80 transition disabled:bg-gray-500"
          >
            {loading ? 'Restaurando...' : 'Seleccionar Archivo'}
          </button>
          <input
            type="file"
            accept=".json,.zip"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleRestore}
          />
        </ActionCard>

        {/* Card para Importar Datos */}
        <ActionCard
          icon={FileText}
          title="Importar Datos"
          description="Carga masiva de productos, clientes o proveedores usando plantillas CSV."
        >
          <a
            href="/dashboard/ajustes/datos/importar" // Apuntamos a la página que crearemos
            className="bg-primary-textoTitle text-white px-4 text-xs py-2 rounded hover:bg-primary-textoTitle/80 transition"
          >
            Ir a Importación
          </a>
        </ActionCard>
      </div>

      {/* Mensajes de estado */}
      <div className="mt-6 text-center">
        {loading && (
          <div className="flex items-center justify-center gap-2 animate-pulse text-primary-100 font-semibold">
            <div className="loader border-3 border-t-3 border-t-blue-500 rounded-full w-5 h-5 animate-spin"></div>
            <span>Procesando...</span>
          </div>
        )}
        {mensaje && (
          <div className="mt-4 text-green-500 font-semibold">{mensaje}</div>
        )}
        {error && (
          <div className="mt-4 text-red-500 font-semibold">{error}</div>
        )}
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
