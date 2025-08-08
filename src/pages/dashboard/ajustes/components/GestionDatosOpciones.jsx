import { useRef, useState } from 'react';
import { Download, Upload, FileText, FileDown } from 'lucide-react';
import DivReact from '../../../../components/atomos/DivReact';

// Pequeño componente para las tarjetas para no repetir código
const ActionCard = ({ icon: Icon, title, description, children }) => (
  <DivReact className="rounded-lg p-6 flex flex-col text-center items-center shadow-md hover:bg-primary-bg-componentes hover:shadow  duration-300">
    <Icon className="w-12 h-12 text-primary-100 mb-4" />
    <h3 className="text-lg font-semibold text-primary-textoTitle mb-2">
      {title}
    </h3>
    <p className="text-gray-400 text-sm mb-6 flex-grow">{description}</p>
    {children}
  </DivReact>
);

export default function GestionDatosOpciones() {
  const fileInputRef = useRef(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBackup = () => {
    window.open('/api/ajustes/respaldoDatos', '_blank');
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('backup', file);
    setLoading(true);
    setMensaje('');
    setError('');

    try {
      const res = await fetch('/api/ajustes/restaurarDatos', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setMensaje('¡Respaldo restaurado con éxito!');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Error al restaurar el respaldo.');
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
    </div>
  );
}
