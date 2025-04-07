
export default function SkeletorCarProductos() {
    return (
      <div className="rounded-lg py-1 px-2 flex items-center border border-transparent shadow-md animate-pulse w-full justify-between">
        <div className="min-w-[75%] flex items-center justify-start gap-2 capitalize">
          {/* Imagen */}
          <div className="bg-gray-200 w-1/3 rounded-lg h-20"></div>
  
          {/* Texto */}
          <div className="flex flex-col gap-2 w-full">
            {/* Título */}
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
  
            {/* Detalles */}
            <div className="flex border-t w-full pt-1 gap-4">
              <div className="flex flex-col gap-1 w-1/2">
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Precio */}
        <div className="flex flex-col gap-2 items-end">
          <div className="h-4 bg-gray-300 rounded w-16"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    );
  };
  
  