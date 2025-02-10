import { ScanBarcode } from "lucide-react";
import { formateoMoneda } from "../../../../utils/formateoMoneda.js";
import { useState } from "react";
import ModalProducto from "../../../../components/organismos/ModalProducto.jsx";

// interface ProductoType {
//   srcPhoto: string;
//   descripcion: string;
//   pVenta: string;
//   stock: number;
//   codigoBarra: string;
// };

export default function CardProductosStock({ prod }) {
  const [modalActive, setModalActive] = useState(false)
  const totalStock = prod?.pVenta * prod?.stock;
  return (
<>
    <div onClick={()=>setModalActive(true)} className="bg-white rounded-lg py-1 px-2 flex items-center shadow-md hover:-translate-y-0.5 hover:shadow-lg duration-200 cursor-pointer justify-between w-full">
      <div class="min-w-[75%] flex items-center justify-start gap-2 capitalize">
        <div class="bg-gray-200 w-1/3">
          <img
            src={prod?.srcPhoto}
            alt="logo"
            class="rounded-lg h-20 object-cover w-full"
          />
        </div>
        <div class="flex flex-col items-start justify-normal">
          {/* <!-- tiltulo del producto --> */}
          <h3 class="text- font-semibold text-primary-textoTitle capitalize tracking-tight">
            {prod.descripcion}
          </h3>
          {/* <!-- detalles --> */}
          <div class="flex border-t w-full pt-1 gap-4">
            <div>
              <p class="text-sm">{prod.stock} en stock</p>
              <div class="inline-flex items-center gap-2">
                <ScanBarcode className="w-6 h-5" />
                <p class="text-sm lowercase">{prod.codigoBarra}</p>
              </div>
            </div>
            <div class="flex flex-col items-start justify-">
              <p class="text-sm">Categoria: {prod?.categoria}</p>
              <p class="text-sm">Lugar: {prod?.localizacion}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="text-end">
        <h3 class="text-lg font-semibold text-primary-textoTitle capitalize tracking-tight">
          {formateoMoneda.format(prod?.pVenta)}
        </h3>
        <h3 class="text-lg font-semibold text-primary-textoTitle capitalize tracking-tight">
          {formateoMoneda.format(totalStock)}
        </h3>
      </div>
    </div>
    {
      modalActive&&(
        <ModalProducto productoId={prod.id} onClose={setModalActive}/>
      )
    }
    </>    
  );
}
