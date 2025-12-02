import { useStore } from "@nanostores/react";
import { carritoStore } from "../../../../context/tiendaOnline.store";
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
  const openCart = (e) => {
    e.stopPropagation();
    const isValor = $carritoStore.isOpen;
    carritoStore.set({ ...$carritoStore, isOpen: !isValor });
  };
  if ($carritoStore.items.length > 0)
    return (
      <div
        onClick={(e) => openCart(e)}
        className="flex min-w- w-fit animate-aparecer fixed bottom-4 left-1/2 -translate-x-1/2 cursor-pointer items-center text-neutral-700 font-semibold bg-gray-50/70 backdrop-blur-sm
     border p-1 focus:outline-none group hover:bg-paleta-200 hover:scale-105 duration-300 rounded-lg shadow-lg gap-3 justify-center z-50 text-base md:mt-0"
      >
        <div className="inline-flex items-center relative justify-center gap-2">
          <span className="absolute -top-2 left-5 w-5 h-5 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {getNumberOfItem}
          </span>
          <img src="/favicon.svg" width={30} height={30} alt="carrito" />
        </div>
        <div className=" text-neutral-600 items-center text-center justify-center  ">
          ${getSubtotal}
        </div>
        <div className=" rounded-lg text-neutral-600 items-center text-center  justify-center p-1">
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className={`${isOpen ? "rotate-180" : ""} duration-200 w-4 h-4 `}
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    );
}
