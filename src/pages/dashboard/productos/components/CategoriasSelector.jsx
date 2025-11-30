import React, { useState, useCallback, useEffect, useRef } from "react";
import InputComponenteJsx from "../../dashboard/componente/InputComponenteJsx";
import { CircleX, PlusCircle } from "lucide-react";
import ModalAgregarCat from "./ModalAgregarCat";

import { CategoriaTag } from "./CategoriaTag";
import { useCategorias } from "../../../../hook/useCategorias";
import BotonAgregarCat from "../../../../components/moleculas/BotonAgregarCat";
import CategoriasListMejorado from "./CategoriaListMejorado";

// Componente para la lista de sugerencias

export default function CategoriasSelector({
  empresaId,
  onCategoriasChange,
  categoriasIniciales = [], // Categorías que ya tiene el producto
}) {
  const [categoria, setCategoria] = useState("");
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] =
    useState(categoriasIniciales);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mostrarPopulares, setMostrarPopulares] = useState(true); // 🎯 NUEVO ESTADO
  const inputRef = useRef(null);

  const { categorias, isLoading, error, searchCategorias } =
    useCategorias(empresaId);

  // Sincronizar con categorías iniciales SOLO al montar el componente
  useEffect(() => {
    if (categoriasIniciales && categoriasIniciales.length > 0) {
      setCategoriasSeleccionadas(categoriasIniciales);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  const onChangeCategoria = useCallback(
    (e) => {
      const value = e.target.value;
      setCategoria(value);

      if (value.length > 1) {
        setShowSuggestions(true);

        searchCategorias(value);
      } else if (value.length === 0) {
        setShowSuggestions(false);
      }
    },
    [searchCategorias]
  );

  const handleCategoriaClick = (cat) => {
    if (!categoriasSeleccionadas.some((c) => c.id === cat.id)) {
      const nuevasCategorias = [...categoriasSeleccionadas, cat];
      setCategoriasSeleccionadas(nuevasCategorias);
      onCategoriasChange?.(nuevasCategorias);
    }
    setCategoria("");
    setShowSuggestions(false);

    inputRef.current?.focus();
  };

  const handleRemoveCategoria = (categoriaId) => {
    console.log("🗑️ Intentando remover categoría ID:", categoriaId);
    console.log("📋 Categorías actuales:", categoriasSeleccionadas);
    const categoriasFiltradas = categoriasSeleccionadas.filter(
      (c) => c.id !== categoriaId
    );
    console.log("✅ Categorías después de filtrar:", categoriasFiltradas);
    setCategoriasSeleccionadas(categoriasFiltradas);
    onCategoriasChange?.(categoriasFiltradas);
  };

  return (
    <div className="w-full flex flex-col gap-3 relative">
      {/* TAGS DE CATEGORÍAS SELECCIONADAS */}
      {categoriasSeleccionadas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoriasSeleccionadas.map((cat) => (
            <CategoriaTag
              key={cat.id}
              categoria={cat}
              onRemove={handleRemoveCategoria}
            />
          ))}
        </div>
      )}

      {/* INPUT DE BÚSQUEDA */}
      <div className="relative">
        <InputComponenteJsx
          ref={inputRef}
          name="categoria"
          value={categoria}
          className="text-sm pr-10"
          type="search"
          handleChange={onChangeCategoria}
          placeholder="Buscar categoría..."
        />

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
        </div>
      </div>

      {/* SUGERENCIAS DE BÚSQUEDA */}
      {showSuggestions && (
        <CategoriasListMejorado
          categorias={categorias}
          isLoading={isLoading}
          onSelect={handleCategoriaClick}
          onClose={() => {
            setShowSuggestions(false);
          }}
          searchQuery={categoria}
        />
      )}

      {/* BOTÓN AGREGAR NUEVA CATEGORÍA */}
      {categoria.length > 0 && !isLoading && categorias.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>¿No encuentras la categoría?</span>
          <BotonAgregarCat
            empresaId={empresaId}
            categoriaNombre={categoria}
            onCategoriaCreada={(nuevaCat) => {
              handleCategoriaClick(nuevaCat);
              setCategoria("");
            }}
          />
        </div>
      )}
    </div>
  );
}
