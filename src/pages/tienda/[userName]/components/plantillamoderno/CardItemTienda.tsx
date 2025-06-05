import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Image } from 'astro:assets';
import ButtonAñadirCarrito from '../ButtonAñadirCarrito';

interface Product {
  id: string;
  descripcion: string;
  srcPhoto: string;
  pVenta: number;
  pPromocion?: number;
  rating?: number;
  isNew?: boolean;
  isHot?: boolean;
  stock?: number;
}

interface CardItemTiendaProps {
  product: Product;
}

export default function CardItemTienda({ product }: CardItemTiendaProps) {
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
    className="lg:w-[260px] md:w-1/2 py-3 px-4 w-full mb-3 border-lg bg-white rounded-lg md:shadow flex flex-col   items-start justify-around shadow-gray-300/50 h-[350px] hover:-translate-y-0.5 duration-150 hover:shadow-gray-300 animate-[aparecer_.5s]"
    key={product.id}
  >
    <a
      className="block relative h-5/6  w-full rounded mt-5 overflow-hidden"
      href={"/store/" + product.id}
    >
      <img
        sizes="320"
        width="320"
        height="320"  
        alt={product.descripcion}
        src={product.srcPhoto}
        className=" object-contain  object-center rounded"
      />
    </a>
    <div className="mt-5 ml-2">
      <h3 className="text-gray-500 text-xs tracking-widest title-font mb-1">
        <a
          className="block relative rounded overflow-hidden"
          href={"/store/" + product.id}
        >
          {" "}
          {product.categorias}
        </a>
      </h3>
      <a
        href={"/store/" + product.id}
        className="text-gray-900 title-font text-lg font-medium hover:underline cursor-pointer"
      >
        {product.descripcion}
      </a>
    </div>
    <div className="flex w-full items-center justify-between my-2 px-2">
      <p className="font-semibold">${product.pVenta}</p>
      {/* <ButtonLike /> */}
    </div>
    <div className="w-11/12 mx-auto flex  items-center my-3  justify-center">
      <ButtonAñadirCarrito item={product} />
    </div>
  </div>
  );
}