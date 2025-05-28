import { useStore } from "@nanostores/react";
import { tiendaStore } from "../../../../../context/store";
import { Heart, Star } from "lucide-react";

export default function ProductosTienda() {
 const {data} = useStore(tiendaStore)


  return (
    <div className=" flex w-full items-start justify-normal gap-2  bg-white  flex-wrap">
      {data?.productos?.map((product) => (
        <div key={product.id} className="group w-1/4 h-96 cursor-pointer bg-white rounded-lg border border-primary-texto/30 p-4 shadow-sm hover:shadow-md transition-all duration-300 transform flex flex-col">
            <div className="relative aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
              <img
                src={product.srcPhoto}
                alt={product.descripcion}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
              />
              {product.isHot && (
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  🔥 HOT
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ✨ NUEVO
                </div>
              )}
              <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <Heart className={`w-4 h-4`} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {product.rating}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{product.descripcion}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-pink-600">
                  ${product.pVenta}
                </span>
                {product.pPromocion && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.pPromocion}
                  </span>
                )}
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Agregar al carrito
              </button>
          </div>
        </div>
      ))}
    </div>
  );
}
