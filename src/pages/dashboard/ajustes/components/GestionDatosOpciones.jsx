import { useRef, useState } from 'react';
import Button3 from '../../../../components/atomos/Button3';

export default function GestionDatosOpciones() {
  const fileInputRef = useRef(null);
  const [mensaje, setMensaje] = useState('');

  const handleBackup = () => {
    window.open('/api/ajustes/respaldoDatos', '_blank');
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('backup', file);

    try {
      const res = await fetch('/api/ajustes/restaurarDatos', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setMensaje('¡Backup restaurado correctamente!');
      } else {
        setMensaje('Error al restaurar el backup.');
      }
    } catch (err) {
      setMensaje('Error al conectar con el servidor.');
    }
  };

  const handleExport = () => {
    // Lógica para exportar datos
    setMensaje('Datos exportados correctamente.');
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
        <Button3 onClick={handleExport}>Exportar Datos</Button3>
        <label className=" bg-transparent hover:bg-primary-100/80 hover:text-white  border-primary-100 text-center px-3 py-1 rounded-lg font-semibold capitalize duration-300 text-xs  border ">
          Importar Datos
          <input
            type="file"
            accept=".csv,.json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </label>
      </div>
      {mensaje && <div className="mt-4 text-green-600">{mensaje}</div>}
    </div>
  );
}
