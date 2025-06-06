import React from "react";
import { useStore } from "@nanostores/react";
import { carritoStore } from "../../../../context/store";
import { CarTaxiFront, ShoppingBag, Store } from "lucide-react";
export default function CarritoFixed() {
  const $carritoStore = useStore(carritoStore);
  const isOpen = $carritoStore.isOpen;
  const getNumberOfItem = $carritoStore.items.reduce(
    (sum, item) => sum + item.cantidad,
    0
  );
  const getSubtotal = $carritoStore.items.reduce(
    (sum, item) => sum + item.pVenta * item.cantidad,
    0
  );
  const openCart = () => {
    carritoStore.set({ ...$carritoStore, isOpen: true });
  };
  console.log("carritoStore", $carritoStore);
  if ($carritoStore.items.length > 0)
    return (
      <div
        onClick={openCart}
        className="flex w-64 animate-[aparecerDeAbajo_.5s] fixed bottom-4 left-1/2 -translate-x-1/2 cursor-pointer items-center text-neutral-700 font-semibold bg-gray-50/95
     border p-2 focus:outline-none group hover:bg-paleta-200 hover:scale-105 duration-300 rounded-3xl shadow-lg z-50 text-base mt-4 md:mt-0"
      >
        <div className="w-1/2   inline-flex items-center justify-center gap-2">
        <img src="/favicon.svg" width={30} height={30}  alt="carrito"/>
          <span className="text-neutral-600 group-hover:text-neutral-100">
            Items
          </span>
        </div>
        <div className="w-1/3 bg-white rounded-lg text-neutral-600 items-center text-center justify-center px-2 py-1">
          ${getSubtotal}
        </div>
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className={`${isOpen ? "rotate-180" : ""} duration-200 w-4 h-4 ml-3`}
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
      </div>
    );
}
