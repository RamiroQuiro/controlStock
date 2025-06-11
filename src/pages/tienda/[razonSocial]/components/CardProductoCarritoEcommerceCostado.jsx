import { Minus, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { carritoService } from '../../../../services/carricoEcommerce.service';

export default function CardProductoCarritoEcommerceCostado({ $carritoStore }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-4">
        {$carritoStore.items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm p-2 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={item.srcPhoto || '/placeholder.jpg'}
                  alt={item.descripcion}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium text-sm">{item.descripcion}</h3>
                  <p className="text- text-gray-600">${item.pVenta}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      carritoService.restarItem(item.id, $carritoStore.items)
                    }
                    disabled={item.cantidad <= 1}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() =>
                      carritoService.agregarItem(item, 1, $carritoStore.items)
                    }
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() =>
                    carritoService.eliminarItem(item.id, $carritoStore.items)
                  }
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
