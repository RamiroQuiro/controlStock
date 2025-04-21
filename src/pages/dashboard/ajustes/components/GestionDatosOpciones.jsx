import { useRef, useState } from "react";
import Button3 from "../../../../components/atomos/Button3";

export default function GestionDatosOpciones() {
  const fileInputRef = useRef(null);
  const [mensaje, setMensaje] = useState("");

  const handleBackup = () => {
    // Lógica para descargar backup (ejemplo: fetch a un endpoint que devuelva un .zip/.json)
    setMensaje("Backup generado y descargado correctamente.");
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Lógica para enviar el archivo al backend y restaurar
    setMensaje(`Archivo ${file.name} cargado para restauración.`);
  };

  const handleExport = () => {
    // Lógica para exportar datos
    setMensaje("Datos exportados correctamente.");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Lógica para importar datos desde archivo
    setMensaje(`Archivo ${file.name} cargado para importar.`);
  };

  return (
    <div className="w-1/3  mx-auto bg-primary-bg-componentes p-6 rounded shadow flex flex-col gap-5">
      <h2 className="text-2xl font-bold mb-2">Gestión de Datos</h2>
      <div className="flex flex-col gap-3 w-">
        <Button3 onClick={handleBackup}>
          Descargar Backup
        </Button3>
        <Button3 onClick={() => fileInputRef.current.click()}>
          Restaurar Backup
        </Button3>
        <input
          type="file"
          accept=".json,.zip"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleRestore}
        />
        <Button3 onClick={handleExport}>
          Exportar Datos
        </Button3>
        <label className="btn-secondary">
          Importar Datos
          <input
            type="file"
            accept=".csv,.json"
            style={{ display: "none" }}
            onChange={handleImport}
          />
        </label>
      </div>
      {mensaje && <div className="mt-4 text-green-600">{mensaje}</div>}
    </div>
  );
}