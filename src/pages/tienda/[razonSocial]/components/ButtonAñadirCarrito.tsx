import { useStore } from '@nanostores/react';
import React, { useEffect, useState } from 'react';
import { carritoStore } from '../../../../context/store';
import { carritoService } from '../../../../services/carricoEcommerce.service';
export default function ButtonAñadirCarrito({ item }: { item: any }) {
  const $carritoStore = useStore(carritoStore);
  const [qtyItems, setQtyItems] = useState(0);
  const handleRestarItems = () => {
    carritoService.restarItem(item.id, $carritoStore.items);
  };
  useEffect(() => {
    const qtyItems = $carritoStore.items.find(
      (prod) => prod.id === item.id
    )?.cantidad;
    setQtyItems(qtyItems);
  }, [$carritoStore]);
  const handleButtonAdd = (e: React.MouseEvent, prod: any) => {
    carritoService.agregarItem(prod, 1, $carritoStore.items);
  };
  return (
    <>
      {qtyItems > 0 && (
        <button
          onClick={handleRestarItems}
          className="w-auto animate-[aparecer_0.5s_ease-in-out] px-3 py-2 text-xs text-white bg-primary-100 border-0 duration-300 hover:bg-primary-600  focus:outline-none  mx-auto items-center rounded-l-lg "
        >
          <svg
            width="18"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 2H8C4 2 2 4 2 8V21C2 21.55 2.45 22 3 22H16C20 22 22 20 22 16V8C22 4 20 2 16 2Z"
              stroke="#f1f2f3"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              opacity="1"
              d="M8.5 12H15.5"
              stroke="#f1f2f3"
              strokeWidth="1.8"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {$carritoStore.items.some((prod) => prod.id === item.id) ? (
        <span
          className={`py-2 w-4/12 mx-auto text-primary-textoTitle  font-medium  focus:outline-none bg-primary-100/30 border  text-center rounded-md border-primary-texto/50 shadow-md`}
        >
          {qtyItems}
        </span>
      ) : null}
      <button
        onClick={(e) => handleButtonAdd(e, item)}
        className={`flex py-2 w-11/12 flex-auto items-center  border-0 font-medium  focus:outline-none hover:bg-primary-100/80 duration-300 bg-primary-100 text-primary-textoTitle ${qtyItems > 0 ? 'rounded-r-lg' : 'rounded-lg'} shadow-md`}
      >
        <span className="text-sm text-center mx-auto"> Añadir al Carrito</span>
      </button>
    </>
  );
}
