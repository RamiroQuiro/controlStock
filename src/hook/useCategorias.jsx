import { useState, useCallback } from "react";
import debounce from "debounce";

export function useCategorias(empresaId, isAll) {
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchCategorias = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 3) {
        setCategorias([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log("isAll", isAll);
      try {
        const response = await fetch(
          isAll
            ? `/api/categorias?search=${searchTerm}&all=true`
            : `/api/categorias?search=${searchTerm}`
        );
        const data = await response.json();

        if (data.status === 200) {
          setCategorias(data.data);
        } else {
          setCategorias([]);
          if (data.status !== 205) {
            // No es un error que no se encuentren categorías
            setError(data.msg);
          }
        }
      } catch (error) {
        console.error("Error al buscar categorías:", error);
        setError("Error al buscar categorías");
        setCategorias([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [empresaId]
  );

  const addCategoria = async (nombre, descripcion) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          empresaId,
        }),
      });

      const data = await response.json();

      if (data.status === 200) {
        return { success: true, data: data.data };
      } else {
        setError(data.msg);
        return { success: false, error: data.msg };
      }
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      setError("Error al agregar categoría");
      return { success: false, error: "Error al agregar categoría" };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categorias,
    isLoading,
    error,
    searchCategorias,
    addCategoria,
  };
}
