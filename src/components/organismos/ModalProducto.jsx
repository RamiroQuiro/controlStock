import { DoorClosed, EyeClosed, LogOut, Outdent } from "lucide-react";
import { useEffect, useState } from "react";
import PerfilProducto from "./PerfilProducto";
import { useStore } from "@nanostores/react";
import { fetchProducto, perfilProducto } from "../../context/store";

const ModalProducto = ({ productoId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  const [infoProducto, setInfoProducto] = useState(null);
  const { loading, data, error } = useStore(perfilProducto);

  useEffect(() => {
    if (productoId) {
      fetchProducto(productoId);
    }
  }, [productoId]);

  console.log("esta es la data del stroage ->", data);

  return (
    <div
      style={{ margin: 0, position: "fixed" }}
      className="fixed top-0 left-0 mt-0 w-full h-screen z-[80] bg-black bg-opacity-50 flex items-center  justify-center backdrop-blur-sm"
      onClick={() => onClose(false)}
    >
      <div
        className="bg-primary-bg-componentes relative rounded-lg overflow-hidden border-l-2 text-border-primary-100/80 mt-0 shadow-lg h-[95vh] overflow-y-auto w-[95vw] md:w-[80vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onClose(false)}
          className="sticky bg-gray-100 p-1 rounded-full hover:translate-x-0.5 active:scale-95 duration-200 top-3 left-[95%] z-40"
        >
          <LogOut />
        </button>
        <PerfilProducto infoProducto={data} />
      </div>
    </div>
  );
};

export default ModalProducto;
