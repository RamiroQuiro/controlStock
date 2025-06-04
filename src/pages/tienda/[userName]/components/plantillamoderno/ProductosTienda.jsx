import { useStore } from '@nanostores/react';
import { tiendaStore } from '../../../../../context/store';
import CarritoAnimacionVacio from '../../../../../components/moleculas/CarritoAnimacionVacio';
import CardItemTienda from './CardItemTienda';

export default function ProductosTienda() {
  const { data } = useStore(tiendaStore);

  return (
    <div className=" flex w-full items-start justify-normal gap-2   flex-wrap">
      {
      data?.productos?.length > 0 ? (
        data?.productos?.map((product) => (
        <CardItemTienda key={product.id} product={product} />
      ))
      ):(
     <CarritoAnimacionVacio/>
      )}
    </div>
  );
}
