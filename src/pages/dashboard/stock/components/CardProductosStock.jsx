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

  if(!prod)return
  const totalStock = prod?.pVenta * prod?.stock;
  const resta = prod?.stock - prod?.alertaStock;
  const intensidad = Math.max(0, Math.min(1, 1 - prod?.stock / prod?.alertaStock)); 
  
  const estiloAlerta = prod?.stock <= prod?.alertaStock 
    ? {
        background: `linear-gradient(to right, rgba(255, 87, 51, 0.05), rgba(255, 87, 51, ${0.1 + intensidad * 0.1}))`,
        border: `1px solid rgba(255, 87, 51, ${0.4 + intensidad * 0.1})`,
        boxShadow: `0 0 8px rgba(255, 87, 51, ${0.2 + intensidad * 0.3})`,
        transition: 'all 0.3s ease'
      }
    : {}; 
  return (
    <>
    <div onClick={()=>setModalActive(true)}
    style={estiloAlerta}
    className={`rounded-lg py-1 md:px-2 px-1 flex items-center border border-transparent md:shadow-md hover:-translate-y-0.5 hover:shadow-lg duration-200 cursor-pointer justify-between w-full`}>
      <div className="md:min-w-[75%] flex items-center justify-start gap-2 capitalize">
        <div className="bg-gray-200 w-1/3">
          <img
            src={prod?.srcPhoto}
            alt="logo"
            className="rounded-lg h-20 object-contain w-full"
          />
        </div>
        <div className="flex flex-col items-start justify-normal">
          {/* <!-- tiltulo del producto --> */}
          <h3 className="text- font-semibold text-primary-textoTitle capitalize tracking-tight">
            {prod?.descripcion}
          </h3>
          {/* <!-- detalles --> */}
          <div className="flex border-t w-full pt-1 gap-4">
            <div>
              <p className="text-sm">{prod?.stock} en stock</p>
              <div className="inline-flex md:block items-center gap-2">
                <ScanBarcode className="w-6 h-5" />
                <p className="text-sm  lowercase">{prod?.codigoBarra}</p>
              </div>
            </div>
            <div className="md:flex hidden flex-col items-start justify-">
              <p className="text-sm">Categoria: {prod?.categoria}</p>
              <p className="text-sm">Lugar: {prod?.localizacion}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="text-end">
        <h3 className="text-sm md:text-base md:font-semibold text-primary-textoTitle capitalize tracking-tight">
          P. Venta :{formateoMoneda.format(prod?.pVenta)}
        </h3>
        <h3 className="text-sm md:text-base md:font-semibold text-primary-textoTitle capitalize tracking-tight">
          Total :{formateoMoneda.format(totalStock)}
        </h3>
      </div>
    </div>
    {
      modalActive&&(
        <ModalProducto productoId={prod?.id} onClose={setModalActive}/>
      )
    }
    </>    
  );
}
