import { useStore } from "@nanostores/react";
import FormularioDeBusqueda from "../organismos/FormularioDeBusqueda";
import { filtroBusqueda } from "../../context/store";
import { useEffect, useState } from "react";
import SelectorProveedoresClientes from "./SelectorProveedoresClientes";
import SelectorProductos from "./SelectorProductos";
import { showToast } from "../../utils/toast/toastShow";

export default function FormularioIngresoEgreso({
  userId,
  proveedoresData,
  clientesData,
  listaProductos,
}) {
  const [formulario, setFormulario] = useState({
    productoId: "",
    fecha: "",
    motivo: "",
    cantidad: "",
    observaciones: "",
    tipo: "ingreso",
  });
  const [productoSelect, setProductoSelect] = useState({});
  const [dataSelect, setDataSelect] = useState({});
  const [error, setError] = useState({msg:'',status:0})
  const $filtrado = useStore(filtroBusqueda)?.filtro;
  useEffect(() => {
    if ($filtrado) {
      console.log($filtrado);
      if (!formulario.productoId) {
        setProductoSelect(() => $filtrado);
        setFormulario((formulario) => ({
          ...formulario,
          productoId: $filtrado.id,
        }));
        filtroBusqueda.set({ filtro: "" });
        return;
      }
      setDataSelect($filtrado);
      setFormulario({
        ...formulario,
        [formulario.tipo === "ingreso" ? "proveedorId" : "clienteId"]:
          $filtrado.id,
      });
      filtroBusqueda.set({ filtro: "" });
    }
  }, [$filtrado, productoSelect]);

  const handleSelect = (tipo) => {
    setFormulario({ ...formulario, tipo: tipo });
  };
  const handleChange = (e) => {
    const { value, name } = e.target;

    setFormulario((state) => ({ ...state, [name]: value }));
  };
  const handleClick = async (e) => {
    e.preventDefault()
    try {
      const responseFetch = await fetch(`/api/movimientos/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      const data = await responseFetch.json();
      console.log(data);
      if (responseFetch.status == 400) {
        setError({error:data.error});
      } else if (data.status == 200) {
        showToast("registro exitoso");
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      setError({error:data.error});
    }
  };

  const motivoEgreso = [
    {
      id: 1,
      value: "venta",
      label: "Venta",
    },
    {
      id: 2,
      value: "devolucion",
      label: "Devolución",
    },
    {
      id: 3,
      value: "robo",
      label: "Robo",
    },
    {
      id: 4,
      value: "vencimiento",
      label: "Vencimiento",
    },
    {
      id: 5,
      value: "ajuste",
      label: "Ajuste",
    },
    {
      id: 6,
      value: "otro",
      label: "Otro",
    },
  ];
  const motivoIngreso = [
    {
      id: 1,
      value: "compra",
      label: "Compra",
    },
    {
      id: 2,
      value: "recarga",
      label: "Recarga",
    },
    {
      id: 3,
      value: "devolucion",
      label: "Devolucion",
    },
  ];

  return (
    <div className=" mx-auto mt-1 p-6 w-full  rounded-lg">
      <form>
        <div className="flex flex-col  gap-2 mb-6 ">
          {/* selector de productos */}
          <SelectorProductos
            listaProductos={listaProductos}
            productoSelect={productoSelect}
            key={0}
          />
          <div className="flex justify-around my-3 border-b">
            <div
              onClick={() => handleSelect("ingreso")}
              name="ingreso"
              className={`${formulario.tipo == "ingreso" ? "text-primary-100 border-b-2 border-primary-100" : "text-primary-texto"} pb-2 px-4 text- font-medium  cursor-pointer `}
            >
              <p>Ingreso de Mercadería</p>
            </div>
            <div
              onClick={() => handleSelect("egreso")}
              name="egreso"
              className={`${formulario.tipo == "egreso" ? "text-primary-100 border-b-2 border-primary-100" : "text-primary-texto"} pb-2 px-4 text- font-medium  cursor-pointer `}
            >
              Egreso de Mercadería
            </div>
          </div>
          {/* buscar proveedor o cliente, segun corresponda */}
          <div>
            <SelectorProveedoresClientes
              proveedoresData={proveedoresData}
              clientesData={clientesData}
              dataSelect={dataSelect}
              formulario={formulario}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label
                for="unidad"
                className="block text-sm font-medium text-gray-700"
              >
                Motivo
              </label>
              <select
                onChange={handleChange}
                name="motivo"
                id="motivo"
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione</option>
                {formulario.tipo === "egreso"
                  ? motivoEgreso.map((motivo) => (
                      <option key={motivo.id} value={motivo.value}>
                        {motivo.label}
                      </option>
                    ))
                  : motivoIngreso.map((motivo) => (
                      <option key={motivo.id} value={motivo.value}>
                        {motivo.label}
                      </option>
                    ))}
              </select>
            </div>
            <div>
              <label
                for="fecha"
                className="block text-sm font-medium text-gray-700"
              >
                Fecha
              </label>
              <input
                onChange={handleChange}
                name="fecha"
                type="date"
                id="fecha"
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              for="cantidad"
              name="cantidad"
              className="block text-sm font-medium text-gray-700"
            >
              Cantidad
            </label>
            <input
              name="cantidad"
              onChange={handleChange}
              type="number"
              id="cantidad"
              min="0"
              className="mt-1  py-2 px-1 block w-full border-gray-300 rounded-lg shadow-sm outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 50"
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            for="observaciones"
            name="observaciones"
            className="block text-sm font-medium text-gray-700"
          >
            Observaciones
          </label>
          <textarea
            onChange={handleChange}
            id="observaciones"
            name="observaciones"
            rows="4"
            className="mt-1 block w-full p-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Agregue comentarios o detalles adicionales..."
          ></textarea>
        </div>

        <div className="flex flex-col mb-1 justify-between  bottom-0 left-0 w-full">
                    <div className="w-full h-6  text-center mx-auto">
                        <p className="p text-sm font-semibold text-primary-400">{error.error}</p>
                    </div>
          <div className="w-full items-center justify-evenly flex">

          <button
            type="reset"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
            Limpiar
          </button>
          <button
            onClick={handleClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
            Guardar Movimiento
          </button>
            </div>
        </div>
      </form>
    </div>
  );
}
