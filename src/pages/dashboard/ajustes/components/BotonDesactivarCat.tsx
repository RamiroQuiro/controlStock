import React from 'react';
import Button3 from '../../../../components/atomos/Button3';
import { useStore } from '@nanostores/react';
import { categoriasStore } from '../../../../context/store';
import LoaderReact from '../../../../utils/loader/LoaderReact';

type Props = {
  item: any;
};

export default function BotonDesactivarCat({ item }: Props) {
  const [loading, setLoading] = React.useState(false);
  const { categorias } = useStore(categoriasStore);
  const handleDesactivar = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categorias?id=${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          modo: 'activacion',
          activo: !item.activo,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        console.log(response);
        categoriasStore.set((state: any) => {
          const categoriaEdit = state.data.find(
            (cat: any) => cat.id === item.id
          );
          categoriaEdit.activo = !categoriaEdit.activo;
          console.log('dentro del map', categoriaEdit);
          return {
            ...state,
            data: state.data.map((cat: any) =>
              cat.id === item.id ? categoriaEdit : cat
            ),
          };
        });

        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      {loading && <LoaderReact />}
      <Button3
        onClick={handleDesactivar}
        id={`desactivar-${item.id}`}
        className="h-full text-primary-textoTitle"
        isActive={item.activo}
      >
        {item.activo ? 'Desactivar' : 'Activar'}
      </Button3>
    </div>
  );
}
