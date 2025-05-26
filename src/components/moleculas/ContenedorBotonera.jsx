import { useEffect, useState } from "react";
import BotonEditar from "../atomos/BotonEditarLts";
import BotonEliminarLts from "../atomos/BotonEliminarLts";
import BotonPdfLts from "../atomos/BotonPdfLts";
import { Check, Circle, CircleOff, EggIcon, StopCircle } from "lucide-react";
import { showToast } from "../../utils/toast/toastShow";

export default function ContenedorBotonera({
  handleDelete,
  handleEdit,
  disableEdit,
  downloadPdf,
  data,
}) {
  const [isEcommerce, setIsEcommerce] = useState(false);
  useEffect(() => {
    setIsEcommerce(data?.productData.isEcommerce);
  }, [data]);
console.log('viendo el data en el modal del perfilPrdocuto',data)
  const handleIsEcommerce = async () => {
    try {
      const response = await fetch(`/api/productos/tiendaOnline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data?.productData.id ,isEcommerce: !isEcommerce}),
      });
      const dataRes = await response.json();
      console.log(dataRes);
      if (dataRes.status === 200) {
        showToast("producto actualizado", { background: "bg-green-500" });
        
      } else if (dataRes.status === 400) {
        showToast(dataRes.msg, { background: "bg-red-500" });
      }
    } catch (error) {
      console.log(error);
      showToast("error al actualizar", { background: "bg-red-500" });
    }
  };

  return (
    <div className="flex text-sm gap-2">
      <label
        htmlFor="isEcommerce"
        onClick={handleIsEcommerce}
        className={
          isEcommerce
            ? "flex items-center gap-2 border rounded-lg p-2 bg-primary-300/80 justify-center font-semibold cursor-pointer"
            : "flex items-center gap-2 border rounded-lg p-2 bg-primary-300/40 justify-center font-semibold cursor-pointer"
        }
      >
        Tienda Online?
        {isEcommerce ? (
          <Check
            width={16}
            className="duration-300 font-bold text-primary-100 animate-aparecer"
          />
        ) : (
          <CircleOff
            width={16}
            className="duration-300 font-bold text-primary-100 animate-aparecer"
          />
        )}
        <input
          type="checkbox"
          name="isEcommerce"
          value={isEcommerce}
          id="isEcommerce"
          className="hidden"
          onChange={() => setIsEcommerce(!isEcommerce)}
          checked={isEcommerce}
        />
      </label>
      <BotonEditar disable={disableEdit} handleClick={handleEdit} />
      <BotonEliminarLts handleClick={handleDelete} />
      <BotonPdfLts handleClick={downloadPdf} />
    </div>
  );
}
