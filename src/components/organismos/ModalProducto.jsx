import { DoorClosed, EyeClosed, LogOut, Outdent } from "lucide-react";
import { useEffect, useState } from "react";
import PerfilProducto from "./PerfilProducto";

const ModalProducto = ({ productoId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [infoProducto, setInfoProducto] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!productoId) return;

    const fetchAtencionData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/productos/infoProduct/${productoId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json", // Especifica el tipo de contenido
              "X-Atencion-Id": productoId, // Aquí envías el id como header personalizado
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener los datos del producto");
        }
        const data = await response.json();
        console.log(data)
        setInfoProducto(data.data);
        // console.log("atencion consultada", data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAtencionData();
  }, [productoId]);

  if (!productoId) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm"
      onClick={() => onClose(false)} // Detectar clic fuera del modal
    >
      <div
        className="bg-primary-bg-componentes relative rounded-lg border-l-2 text-border-primary-100/80 shadow-lg h-[95vh] overflow-y-auto  w-2/3"
        onClick={(e) => e.stopPropagation()} // Evitar cerrar el modal al hacer clic dentro de él
      >
        <button
          onClick={() => onClose(false)}
          className="sticky bg-gray-100 p-1 rounded-full hover:translate-x-0.5 active:scale-95 duration-200 top-3 left-[95%] z-40"
        >
          <LogOut />
        </button>
        {isLoading ? (
          <div className="text-center">Cargando...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <PerfilProducto infoProducto={infoProducto} />
        )}
      </div>
    </div>
  );
};

export default ModalProducto;
