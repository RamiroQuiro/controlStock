import React from 'react';

export default function ProductosTienda() {
  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} class="group cursor-pointer">
          <div class="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="relative aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {product.isHot && (
                <div class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  🔥 HOT
                </div>
              )}
              {product.isNew && (
                <div class="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ✨ NUEVO
                </div>
              )}
              <button class="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <Heart className={`w-4 h-4`} />
              </button>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <div class="flex items-center">
                  <Star class="w-4 h-4 text-yellow-400 fill-current" />
                  <span class="text-sm text-gray-600 ml-1">
                    {product.rating}
                  </span>
                </div>
              </div>
              <h3 class="text-lg font-bold text-gray-800">{product.name}</h3>
              <div class="flex items-center space-x-2">
                <span class="text-xl font-bold text-pink-600">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span class="text-sm text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <button class="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
