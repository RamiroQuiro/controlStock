import React, { useEffect, useState } from "react";

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  srcPhoto?: string;
};

type CarritoItem = Producto & { cantidad: number };

const TiendaOnline: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  useEffect(() => {
    fetch("/api/productos/tiendaOnline")
      .then((res) => res.json())
      .then((data) => setProductos(data));
  }, []);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (id: number) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  return (
    <div>
      {/* Botón carrito fijo */}
      <button
        className="fixed top-6 right-6 bg-blue-700 text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2 z-50 hover:bg-blue-800 transition"
        onClick={() => setMostrarCarrito((v) => !v)}
      >
        <span className="material-icons">shopping_cart</span>
        {carrito.length > 0 && (
          <span className="bg-white text-blue-700 rounded-full px-2 font-bold">
            {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
          </span>
        )}
        <span className="hidden sm:inline">Carrito</span>
      </button>

      {/* Catálogo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col hover:scale-105 transition"
          >
            {producto.srcPhoto && (
              <img
                src={producto.srcPhoto}
                alt={producto.nombre}
                className="h-40 w-full object-cover rounded mb-3"
                loading="lazy"
              />
            )}
            <h2 className="text-xl font-bold text-blue-800 mb-1">{producto.nombre}</h2>
            <p className="text-gray-500 flex-1 mb-2">{producto.descripcion}</p>
            <span className="text-lg font-bold text-blue-600 mb-2">
              ${producto.precio.toFixed(2)}
            </span>
            <button
              className="mt-auto bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
              onClick={() => agregarAlCarrito(producto)}
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>

      {/* Carrito (sidebar/modal) */}
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full p-8 shadow-2xl flex flex-col animate-slide-in-right">
            <h2 className="text-2xl font-extrabold mb-4 text-blue-700">Carrito de compras</h2>
            {carrito.length === 0 ? (
              <p className="text-gray-500">El carrito está vacío.</p>
            ) : (
              <ul className="flex-1 overflow-y-auto">
                {carrito.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center mb-4 border-b pb-2"
                  >
                    <div>
                      <span className="font-semibold">{item.nombre}</span>
                      <span className="ml-2 text-gray-400">
                        x{item.cantidad}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </span>
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => quitarDelCarrito(item.id)}
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 border-t pt-4 flex flex-col gap-2">
              <span className="font-bold text-lg text-blue-700">
                Total: ${total.toFixed(2)}
              </span>
              <button
                className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold"
                onClick={() => alert("¡Checkout pronto!")}
              >
                Finalizar compra
              </button>
            </div>
            <button
              className="mt-4 bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition"
              onClick={() => setMostrarCarrito(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiendaOnline;