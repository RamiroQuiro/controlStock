import { useState } from "react";
import { busqueda, filtroBusqueda } from "../../context/store";
import { Search } from "lucide-react";

export default function FiltroProductos({ mostrarProductos }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(null);
  const [encontrados, setEncontrados] = useState(0);

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
      const res = await fetch(`/api/productos/productos?search=${query}`);
      const data = await res.json();
      busqueda.set({ productosBuscados: data.data });
      setEncontrados(data.data);
      // console.log('productos encxontrados',data)
    } catch (error) {
      console.error("Error en la búsqueda de productos:", error);
    } finally {
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
      {/* Input de búsqueda */}
      <input
        onChange={handleSearch}
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
                    <td className="px-3 py-2 border-b">{producto.codigoBarra}</td>
                    <td className="px-3 py-2 border-b">{producto.descripcion}</td>
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
