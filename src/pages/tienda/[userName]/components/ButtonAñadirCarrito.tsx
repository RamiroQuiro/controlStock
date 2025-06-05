import { useStore } from '@nanostores/react';
import React, { useEffect } from 'react'
import { carritoStore } from '../../../../context/store';
import { CarritoService } from '../../../../services/carricoEcommerce.service';

export default function ButtonAñadirCarrito({item}: {item: any}) {
    const $carritoStore = useStore(carritoStore);
const carritoService = new CarritoService()
    console.log('este es mi carrito en button añadir: ->',$carritoStore)
    const handleRestarItems = () => {
        
    }


    const handleButton = (e: React.MouseEvent,prod: any) => {
      const qtyItems = $carritoStore.items.find((item)=>item.id === prod.id)
      console.log('qtyItems',qtyItems)
      const newArray=[...$carritoStore.items,prod]
      console.log('newArray',newArray)
      carritoStore.set({
          ...$carritoStore,
          items:newArray
        }
      )
    }
  return (
    <>
      {/* {$carritoStore.items.length  > 0 && (
        <button 
        onClick={handleRestarItems}
        className="w-auto animate-[aparecer_0.5s_ease-in-out] px-3 py-3 text-xs text-white bg-primary-100 border-0 duration-200  focus:outline-none  mx-auto items-center hover:bg-primary-600 rounded-lg ">
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

      {$carritoStore.existeEnCarrito(item.id, item.opciones) ?
      <span className={`py-2.5 w-4/12 mx-auto text-white border-0 font-medium  focus:outline-none bg-primary-500 text-center `}>{qtyItems  }</span>
      :
      null
    } */}
      <button
        onClick={(e)=>handleButton(e,item)}
        className={`flex py-2 w-11/12 flex-auto items-center  border-0 font-medium  focus:outline-none hover:bg-primary-600 `}
      >
        <span className="text-sm text-center mx-auto"> Añadir al Carrito</span>
      </button>
      </>
  )
}
