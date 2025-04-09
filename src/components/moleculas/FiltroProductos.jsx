import { useState } from "react";
import { busqueda, filtroBusqueda } from "../../context/store";
import { CheckCircle, CheckCircle2, LoaderCircle, Search } from "lucide-react";
import { cache } from "../../utils/cache";

export default function FiltroProductos({ mostrarProductos }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(null);
  const [encontrados, setEncontrados] = useState(0);
  const [agregarAutomatico, setAgregarAutomatico] = useState(false);

  const handleSearch = (e) => {
    setSearch(e.target.value.toLowerCase());

    if (timer) clearTimeout(timer);

    if (e.target.value === "") {
      busqueda.set({ productosBuscados: null });
      setEncontrados(0);
    } else {
      setTimer(
        setTimeout(() => {
          fetchProductos(e.target.value.toLowerCase());
        }, 300)
      );
    }
  };

  const fetchProductos = async (query) => {
    setLoading(true);
    try {
      // Check cache first
      const cacheKey = `productos_search_${query}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        busqueda.set({ productosBuscados: cachedData });
        setEncontrados(cachedData);
        setLoading(false);
        return;
      }

      // Si está activado el modo automático, primero intentamos búsqueda exacta por código
      if (agregarAutomatico) {
        const res = await fetch(
          `/api/productos/productos?search=${query}&tipo=codigoBarra`
        );
        const data = await res.json();

        if (data.data.length === 1) {
          // Cache the result
          await cache.set(cacheKey, data.data);
          
          busqueda.set({ productosBuscados: data.data });
          setEncontrados(data.data);
          handleClick(data.data[0]);
          setLoading(false);
          return;
        }
      }

      // Si no se encontró por código exacto o no está en modo automático, hacer búsqueda normal
      const res = await fetch(`/api/productos/productos?search=${query}`);
      const data = await res.json();
      
      // Cache the result
      await cache.set(cacheKey, data.data);
      
      busqueda.set({ productosBuscados: data.data });
      setEncontrados(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error en la búsqueda de productos:", error);
      setLoading(false);
    }
  };

  const handleClick = (producto) => {
    filtroBusqueda.set({ filtro: producto });
    setSearch("");
    setEncontrados(0);
  };

  return (
    <div className="w-full flex flex-col relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="relative">
          <input
            type="checkbox"
            id="agregarAutomatico"
            checked={agregarAutomatico}
            onChange={(e) => setAgregarAutomatico(e.target.checked)}
            className="w-3 h-3 rounded-full hidden border-2 border-primary-100 peer text-primary-600 focus:ring-primary-500 focus:ring-offset-0 transition-all duration-200 cursor-pointer"
          />
        </div>
        {agregarAutomatico ? <CheckCircle className="animate-aparecer stroke-primary-100"/> : <LoaderCircle className="animate-aparecer" />}
        <label
          htmlFor="agregarAutomatico"
          className="text-xs up text-primary-texto  cursor-pointer select-none peer-checked:text-primary-100"
        >
          Agregar automáticamente por código de barra
        </label>
      </div>

      {/* Input de búsqueda */}
      <input
        onChange={handleSearch}
        id="busquedaProducto"
        placeholder="Ingrese código de barra, descripción, etc."
        value={search}
        type="search"
        className="w-full text-sm bg-white rounded-lg px-2 py-2 border border-primary-textoTitle/30 focus:border-transparent focus:ring-2 outline-none transition duration-200"
      />

      {/* Loader mientras busca */}
      {loading && (
        <div className="text-sm py-3 flex items-center justify-center bg-white border top-12 rounded-lg shadow-lg text-center font-semibold animate-aparecer w-full text-gray-500 absolute">
          <Search /> Buscando...
        </div>
      )}

      {/* Tabla de productos encontrados */}
      {mostrarProductos && encontrados?.length > 0 && (
        <div className="w-full absolute z-50 shadow-md bg-white top-[110%] rounded-xl animate-apDeArriba border text-sm">
          <div className="overflow-auto max-h-60">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 border-b">Código</th>
                  <th className="px-3 py-2 border-b">Descripción</th>
                  <th className="px-3 py-2 border-b">Marca</th>
                  <th className="px-3 py-2 border-b">Stock</th>
                  <th className="px-3 py-2 border-b">Precio</th>
                </tr>
              </thead>
              <tbody>
                {encontrados.map((producto, i) => (
                  <tr
                    key={i}
                    tabIndex={i}
                    className="cursor-pointer hover:bg-primary-100/40 transition"
                    onClick={() => handleClick(producto)}
                  >
                    <td className="px-3 py-2 border-b">
                      {producto.codigoBarra}
                    </td>
                    <td className="px-3 py-2 border-b">
                      {producto.descripcion}
                    </td>
                    <td className="px-3 py-2 border-b">{producto.marca}</td>
                    <td className="px-3 py-2 border-b">{producto.stock}</td>
                    <td className="px-3 py-2 border-b">${producto.pVenta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mensaje cuando no se encuentran productos */}
      {mostrarProductos && encontrados.length === 0 && !loading && (
        <span className="text-xs py-4 px-3 border w-full  top-[110%]  animate-apDeArriba rounded-lg bg-white text-center absolute font-semibold">
          No se encontraron registros
        </span>
      )}
    </div>
  );
}
