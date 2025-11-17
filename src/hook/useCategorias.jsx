import { useState, useCallback, useRef } from "react";
import { cache } from "../utils/cache"; // Asumiendo que tienes un sistema de cache

export function useCategorias(empresaId, isAll) {
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const searchCategorias = useCallback((searchTerm) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    if (!searchTerm || searchTerm.length < 2) {
      setCategorias([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const endpoint = isAll 
          ? `/api/categorias/buscar?q=${encodeURIComponent(searchTerm)}&empresaId=${empresaId}&all=true`
          : `/api/categorias/buscar?q=${encodeURIComponent(searchTerm)}&empresaId=${empresaId}`;

        const response = await fetch(endpoint, {
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        setCategorias(data.data || []);

      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error al buscar categorías:", error);
          setError("Error al buscar categorías");
          setCategorias([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [empresaId, isAll]);

  // 🎯 FUNCIÓN MEJORADA PARA AGREGAR CATEGORÍA
  const addCategoria = async (nombre, descripcion, color = null) => {
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
          color,
          empresaId,
        }),
      });

      const data = await response.json();

      if (data.status === 200) {
        // 🎯 INVALIDAR CACHÉ RELACIONADO
        await cache.invalidate(`categorias_${empresaId}`);
        
        
        return { 
          success: true, 
          data: data.data,
          // 🎯 DEVOLVER OBJETO COMPLETO PARA USO INMEDIATO
          categoria: {
            id: data.data.id,
            nombre: data.data.nombre,
            descripcion: data.data.descripcion,
            color: data.data.color,
            productoCount: 0
          }
        };
      } else {
        setError(data.msg);
        return { 
          success: false, 
          error: data.msg,
          code: data.status 
        };
      }
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      setError("Error al agregar categoría");
      return { 
        success: false, 
        error: "Error al agregar categoría",
        code: 500 
      };
    } finally {
      setIsLoading(false);
    }
  };


  // 🎯 NUEVA FUNCIÓN: LIMPIAR BÚSQUEDA
  const clearSearch = useCallback(() => {
    setCategorias([]);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    categorias,
    isLoading,
    error,
    searchCategorias,
    addCategoria,
    clearSearch,
  };
}