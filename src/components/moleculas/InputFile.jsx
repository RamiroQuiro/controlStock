import React, { useState } from "react";
import { showToast } from "../../utils/toast/toastShow";

export default function InputFile({ name }) {
  const [previewUrlFrente, setPreviewUrlFrente] = useState(null);

  const handleImageFrente = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setPreviewUrlFrente(URL.createObjectURL(file));
    } else {
      console.error("Por favor selecciona un archivo de imagen válido");
      showToast("Por favor selecciona un archivo de imagen válido", {
        background: "bg-red-600",
      });
      // Limpiar el input
      event.target.value = '';
      setPreviewUrlFrente(null);
    }
  };

  return (
    <div>
      <div className=" h-[250px] w-[250px] flex mx-auto items-center justify-center overflow-hidden rounded-lg shadow ">
        {previewUrlFrente ? (
          <div className="relative w-full h-full group">
            <label
              htmlFor={name}
              className="border-dashed border absolute top-0 left-0 rounded-lg hidden group-hover:flex  border-primary-100 w-full h-full items-center justify-center uppercase font-semibold  m-auto cursor-pointer hover:bg-primary-100/40 duration-300 bg-transparent hover:text-white text-xs"
            >
              cambiar foto
              <input
                type="file"
                name={name}
                onChange={handleImageFrente}
                id={name}
                className="hidden absolute inset-0 w-full cursor-pointer"
                accept="image/*"
              />
            </label>
            <img
              src={previewUrlFrente}
              alt="Vista previa"
              width={"100%"}
              height={"100%"}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <label
            htmlFor={name}
            className="border-dashed border rounded-lg  border-primary-100 w-full h-full items-center justify-center flex uppercase font-semibold  m-auto cursor-pointer hover:bg-primary-100/40 duration-300 hover:text-white text-xs"
          >
            Subir Imagen
            <input
              type="file"
              name={name}
              onChange={handleImageFrente}
              id={name}
              className="hidden absolute inset-0  cursor-pointer"
              accept="image/*"
            />
          </label>
        )}
      </div>
    </div>
  );
}
