import { useStore } from "@nanostores/react";
import FormularioDeBusqueda from "../organismos/FormularioDeBusqueda";
import { filtroBusqueda } from "../../context/store";
import { useEffect, useState } from "react";

export default function FormularioIngresoEgreso({ userId, proveedoresData,clientesData,listaProductos }) {
  const [formulario, setFormulario] = useState({
    tipo:'ingreso'
  });
  const [productoSelect, setProductoSelect] = useState({})
  const $filtrado = useStore(filtroBusqueda)?.filtro;

  console.log(proveedoresData)
  useEffect(() => {
    if($filtrado){
      setProductoSelect(()=>($filtrado))
      setFormulario({...formulario,productoId:$filtrado.id})
      filtroBusqueda.set({filtro:''})
    }
  
  }, [])
  

  const handleSelect = (tipo) => {
    setFormulario({ ...formulario, tipo: tipo });
  };
  const handleClick = async () => {
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
    } catch (error) {}
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

  console.log(productoSelect);
  return (
    <div className=" mx-auto mt-1 p-6 w-full rounded-lg">
      <form>
        <div className="flex flex-col  gap-2 mb-6 ">
          <FormularioDeBusqueda
            placeholder={
              "Buscar producto por codigo de barra, descripcion, marca, modelo..."
            }
            arrayABuscar={listaProductos}
            opcionesFiltrado={[
              "codigoBarra",
              "descripcion",
              "categoria",
              "marca",
              "modelo",
            ]}
          />
          <div className="w-full bg-red- py-1 text-sm bg-primary-300/50 text-center rounded-md shadow-md text-primary-texto">Producto : <span className="text-primary-textoTitle font-semibold">{productoSelect.descripcion}</span> codigo: <span className="text-primary-textoTitle font-semibold">
          {productoSelect.codigoBarra}</span></div>
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
<div>
  <FormularioDeBusqueda arrayABuscar={proveedoresData} opcionesFiltrado={['nombre','email']}/>
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
                id="motivo"
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione</option>
                {formulario.tipoMovimiento === "ingreso"
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
                type="date"
                id="fecha"
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              for="cantidad"
              className="block text-sm font-medium text-gray-700"
            >
              Cantidad
            </label>
            <input
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
            className="block text-sm font-medium text-gray-700"
          >
            Observaciones
          </label>
          <textarea
            id="observaciones"
            rows="4"
            className="mt-1 block w-full p-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Agregue comentarios o detalles adicionales..."
          ></textarea>
        </div>

        <div className="flex justify-between">
          <button
            type="reset"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Guardar Movimiento
          </button>
        </div>
      </form>
    </div>
  );
}
