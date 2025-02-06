import { Printer, FileText, RefreshCw, EyeClosed, DoorClosed, FolderClosed, X } from "lucide-react"; // Iconos

const Ticket = ({ ticket, handleNuevaVenta,productos ,totalVenta,setModalConfirmacion}) => {

  return (
    <div className="ticket bg-white p-6 border rounded-lg shadow-lg w-full max-w-md">
      {/* Encabezado del ticket */}
      <button onClick={()=>setModalConfirmacion(false)}>X</button>
      <div className="text-center mb-4">
        <img
          src="/logo.png"
          alt="Logo del negocio"
          className="w-16 h-16 mx-auto mb-2"
        />
        <h2 className="text-lg font-bold">Mi Negocio</h2>
        <p className="text-sm text-gray-600">
          Dirección: Calle Falsa 123, Ciudad <br />
          Tel: +54 9 1234 567890
        </p>
        <p className="text-sm font-medium mt-2">
          Fecha: {ticket?.fecha || new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Detalle de la venta */}
      <div className="border-t border-gray-300 mt-4 pt-4">
        <h3 className="font-semibold text-lg mb-2">Productos:</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          {productos.map((producto, index) => (
            <li
              key={index}
              className="flex flex-col justify-between capitalize border-b pb-1 border-dashed"
            >
              <span>
              {producto.descripcion}
                </span>
                <div className="flex justify-between w-full">

              <span>
                 ({producto.cantidad} x ${producto.precio})
              </span>
              <span>${producto.cantidad * producto.precio}</span>
                </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Total */}
      <div className="mt-4">
        <h3 className="font-bold text-lg text-right">
          Total: ${ticket?.total || totalVenta}
        </h3>
      </div>

      {/* Opciones de acción */}
      <div className="mt-6 flex justify-between gap-2 items-center text-xs">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
          onClick={() => window.print()}
        >
          <Printer className="h-5 w-5" />
          Imprimir
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600"
          onClick={() => alert("Descargar PDF (a implementar)")}
        >
          <FileText className="h-5 w-5" />
          PDF
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600"
          onClick={()=>setModalConfirmacion(false)}
        >
          <X className="h-5 w-5" />
          cerrar
        </button>
      </div>
    </div>
  );
};

export default Ticket;
