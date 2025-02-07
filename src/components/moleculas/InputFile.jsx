import React, { useState } from "react";
import { showToast } from "../../utils/toast/toastShow";

export default function InputFile({ name }) {
  const [previewUrlFrente, setPreviewUrlFrente] = useState(null);
  const [fileFrente, setFileFrente] = useState(null);

  const handleImageFrente = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setPreviewUrlFrente(URL.createObjectURL(file));
      setFileFrente(file);
    } else {
      console.error("Por favor selecciona un archivo de imagen válido");
      showToast("Por favor selecciona un archivo de imagen válido", {
        background: "bg-red-600",
      });
    }
  };

  return (
    <div>
      <div className="w-52 h-28 flex mx-auto items-center justify-center overflow-hidden rounded-lg shadow ">
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
                className="hidden"
              />
            </label>
            <img
              src={previewUrlFrente}
              alt="frente"
              width={"200px"}
              height={"150px"}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <label
            htmlFor={name}
            className="border-dashed border rounded-lg  border-primary-100 w-full h-full items-center justify-center flex uppercase font-semibold  m-auto cursor-pointer hover:bg-primary-100/40 duration-300 hover:text-white text-xs"
          >
            Dni Frente
            <input
              type="file"
              name={name}
              onChange={handleImageFrente}
              id={name}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
