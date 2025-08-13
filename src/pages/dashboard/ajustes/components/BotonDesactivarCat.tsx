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
  const { data } = useStore(categoriasStore);
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
        console.log('Respuesta exitosa:', response);
        
        // Obtener el estado actual del store
        const currentState = categoriasStore.get();
        
        // Verificar que data existe
        if (!currentState.data) {
          console.error('No hay datos en el store');
          setLoading(false);
          return;
        }
        
        // Crear el array actualizado con la categoría modificada
        const categoriasActualizadas = (currentState.data as any[]).map((cat: any) => {
          if (cat.id === item.id) {
            return { ...cat, activo: !cat.activo };
          }
          return cat;
        });
        
        // Crear el nuevo estado completo
        const nuevoEstado = {
          ...currentState,
          data: categoriasActualizadas,
        };
        
        console.log('Categoría actualizada:', item.nombre, 'Nuevo estado activo:', !item.activo);
        
        // Actualizar el store con el nuevo estado
        categoriasStore.set(nuevoEstado as any);
        
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
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
