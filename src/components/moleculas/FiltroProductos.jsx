import { useState } from "react";
import { busqueda } from "../../context/store";
import { Search } from "lucide-react";

export default function FiltroProductos() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(null);

  const handleSearch = (e) => {
    setSearch(e.target.value.toLowerCase());
    console.log('value ->', e.target.value);
  
    if (timer) clearTimeout(timer); // 🔥 Limpiamos el timer anterior
  
    if (e.target.value === '') {
      busqueda.set({ productosBuscados: null }); // ✅ Ahora guarda `null` en vez de "todos"
    } else {
      setTimer(
        setTimeout(() => {
          fetchProductos(e.target.value.toLowerCase());
        }, 300) // ⏳ Debounce de 300ms
      );
    }
  };
  

  const fetchProductos = async (query) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/productos/productos?search=${query}`);
      const data = await res.json();
      busqueda.set({productosBuscados:data.data}); // 🔥 Guardamos los productos en el store
      console.log(data)
    } catch (error) {
      console.error("Error en la búsqueda de productos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col relative">
      <input
        onChange={handleSearch}
        placeholder="Ingrese código de barra, descripción, etc."
        value={search}
        type="search"
        className="w-full text-sm bg-white rounded-lg px-2 py-2 border-primary-textoTitle focus:ring-2 outline-none transition duration-200"
      />
      {loading && <div className="text-sm py-3 flex items-center justify-center bg-white border top-12 rounded-lg shadow-lg text-center font-semibold animate-aparecer w-full text-gray-500 absolute"><Search/> Buscando...</div>}
    </div>
  );
}
