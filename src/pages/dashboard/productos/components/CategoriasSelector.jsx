import React, { useState, useCallback, useEffect } from "react";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import { CircleX, PlusCircle } from "lucide-react";
import ModalAgregarCat from "./ModalAgregarCat";
import debounce from "debounce";
import CategoriasList from "./CategoriaList";
import { CategoriaTag } from "./CategoriaTag";
import { useCategorias } from "../../../../hook/useCategorias";
import BotonAgregarCat from "../../../../components/moleculas/BotonAgregarCat";

// Componente para la lista de sugerencias

export default function CategoriasSelector({ empresaId }) {
  const [categoria, setCategoria] = useState("");
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);

  const { categorias, isLoading, error, searchCategorias } =
    useCategorias(empresaId);

  useEffect(() => {
    // Crear un campo oculto o actualizar uno existente con los IDs como JSON
    const hiddenInput =
      document.getElementById("categoriasIds") ||
      document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.value = JSON.stringify(
      categoriasSeleccionadas.map((cat) => cat.id)
    );

    // Si es un campo nuevo, añadirlo al formulario
    if (!document.getElementById("categoriasIds")) {
      document
        .getElementById("formularioCargaProducto")
        .appendChild(hiddenInput);
    }
  }, [categoriasSeleccionadas]);

  useEffect(() => {
    return () => {
      searchCategorias.cancel();
    };
  }, [searchCategorias]);

  const onChangeCategoria = (e) => {
    const value = e.target.value;
    setCategoria(value);
    searchCategorias(value);
  };

  const handleCategoriaClick = (cat) => {
    if (!categoriasSeleccionadas.some((c) => c.id === cat.id)) {
      setCategoriasSeleccionadas([...categoriasSeleccionadas, cat]);
    }
    setCategoria("");
    searchCategorias("");
  };

  const handleRemoveCategoria = (id) => {
    setCategoriasSeleccionadas(
      categoriasSeleccionadas.filter((c) => c.id !== id)
    );
  };

  return (
    <div className="w-full flex items-center justify-between gap-2 relative">
      <div className="flex flex-col gap-1 items-start w-full">
        {/* Tags de categorías seleccionadas */}
        <div className="flex gap-2 flex-wrap mt-2">
          {categoriasSeleccionadas.map((cat) => (
            <CategoriaTag
              key={cat.id}
              categoria={cat}
              onRemove={handleRemoveCategoria}
            />
          ))}
        </div>

        {/* Input de búsqueda */}
        <InputComponenteJsx
          name="categoria"
          value={categoria}
          className={"text-sm"}
          type="search"
          handleChange={onChangeCategoria}
          placeholder="Buscar categoría..."
        />

        {/* Indicador de carga */}
        {isLoading && (
          <span className="text-xs text-gray-500">Buscando...</span>
        )}
      </div>

      {/* Lista de sugerencias */}
      {categorias.length > 0 && categoria.length > 2 && (
        <CategoriasList
          categorias={categorias}
          onSelect={handleCategoriaClick}
        />
      )}

      {/* Botón para agregar nueva categoría */}
     <BotonAgregarCat empresaId={empresaId}/>
    </div>
  );
}
