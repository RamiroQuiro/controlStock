import React from 'react';
import { useState } from 'react';
import InputComponenteJsx from '../../dashboard/componente/InputComponenteJsx';
import { CircleX, PlusCircle } from 'lucide-react';

export default function CategoriasSelector({ empresaId }) {
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);

  const handleBusquedaDeCategoria = async () => {
    try {
      const response = await fetch(`/api/categorias?search=${categoria}`, {
        headers: {
          'xx-empresa-id': empresaId,
        },
      });
      const data = await response.json();
      if (data.status == 200) {
        setCategorias(data.data);
        setMostrarModal(true);
      }
      if (data.status === 205) {
        setCategorias([{ nombre: 'no se encotraron categorias' }]);
      }
      if (data.status == 404) {
        showToast(data.msg, { background: 'bg-red-600' });
      }
    } catch (error) {
      if (data.status == 404) {
        showToast(data.msg, { background: 'bg-red-600' });
      }
      console.log(error);
    }
  };
  const onChangeCategoria = (e) => {
    setCategoria(e.target.value);
    if (e.target.value.length > 3) {
      handleBusquedaDeCategoria();
    }
  };
  const handleCategoriaClick = (cat) => {
    if (!categoriasSeleccionadas.some((c) => c.id === cat.id)) {
      setCategoriasSeleccionadas([...categoriasSeleccionadas, cat]);
    }
    setCategoria('');
    setCategorias([]); // opcional: ocultar sugerencias
  };
  const handleAgregarCategoria = () => {};

  return (
    <div className="w-full flex items-center justify-between gap-2 relative">
      <div className=" flex flex-col gap-1 items-start w-full">
        <div className="flex gap-2 flex-wrap mt-2">
          {categoriasSeleccionadas.map((cat) => (
            <span
              key={cat.id}
              className=" inline-flex items-center justify-center text-xs px-1 text-primary-texto py-0.5  rounded-lg border bg-primary-100/20"
            >
              {cat.nombre}
              <CircleX
                className="rounded-full bg-primary-400 ml-2 cursor-pointer text-white px-1 text-center active:-scale-95"
                onClick={() =>
                  setCategoriasSeleccionadas(
                    categoriasSeleccionadas.filter((c) => c.id !== cat.id)
                  )
                }
              >
                x
              </CircleX>
            </span>
          ))}
        </div>
        <InputComponenteJsx
          name="categoria"
          value={categoria}
          className={'text-sm'}
          type="search"
          handleChange={onChangeCategoria}
          placeholder="Agregar Categoria"
        />
      </div>
      {categorias.length > 0 && categoria.length > 3 && (
        <div className="absolute top-[110%] text-xs animate-aparecer duration-300 text-primary-textoTitle font-semibold right-0 w-full h-full bg-primary-bg-componentes rounded-lg shadow-md  border z-10">
          <ul className="space-y-1">
            {categorias.map((categoria, index) => (
              <li
                onClick={() => {
                  handleCategoriaClick(categoria);
                  setMostrarModal(false);
                }}
                key={index}
                className="cursor-pointer hover:bg-primary-texto/30 duration-300 ease-in-out p-2  rounded-lg"
              >
                {categoria.nombre}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={handleAgregarCategoria}
        className="text-primary-100 px-2 py-1 hover:text-primary-texto/80  active:text-primary-100/80 active:-scale-95 transition-colors duration-150 flex items-center gap-2"
      >
        <PlusCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
