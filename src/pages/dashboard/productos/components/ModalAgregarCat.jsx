import { useEffect, useState } from 'react';
import ModalReact from '../../../../components/moleculas/ModalReact';
import InputComponenteJsx from '../../dashboard/componente/InputComponenteJsx';
import BotonGuardar from '../../../../components/atomos/BotonGuardar';
import { useCategorias } from '../../../../hook/useCategorias';

export default function ModalAgregarCat({
  onClose,
  empresaId,
  handleAgregarCategoria,
  setCategoriasSeleccionadas,
}) {
  const [formulario, setformulario] = useState({ nombre: '', descripcion: '' });
  const { categorias, isLoading, error, searchCategorias } = useCategorias(
    empresaId,
    true
  );
  const handleChange = (e) => {
    const { name, value } = e.target;
    setformulario({ ...formulario, [name]: value });
  };

  useEffect(() => {
    console.log(categorias);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formulario, empresaId }),
      });
      const data = await response.json();
      if (data.status === 200) {
        onClose();
        handleAgregarCategoria(data.data);
        setCategoriasSeleccionadas((prev) => [...prev, data.data]);
      } else {
        console.error(data.msg);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <ModalReact onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="p-4 space-y-5 flex flex-col items-center justify-center h-full w-full gap-2"
      >
        <h2 className="text-lg font-semibold text-primary-textoTitle">
          Agregar Categoria
        </h2>
        <div>
          <label htmlFor="nombre">Nombre</label>
          <InputComponenteJsx
            id="nombre"
            handleChange={handleChange}
            name="nombre"
            type="text"
            placeholder="Nombre"
          />
        </div>
        <div>
          <label htmlFor="descripcion">Descripcion</label>
          <InputComponenteJsx
            id="descripcion"
            handleChange={handleChange}
            name="descripcion"
            type="text"
            placeholder="Descripcion"
          />
        </div>
        <div className="w-full flex items-center justify-center">
          <BotonGuardar type="submit">Agregar</BotonGuardar>
        </div>
      </form>
    </ModalReact>
  );
}
