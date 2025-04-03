import React, { useState, useEffect, useMemo } from "react";
import { showToast } from "../../../../utils/toast/toastShow";
import type {
  DataFiltros,
  ModificacionPreciosProps,
  ProductoPrevisualizado,
} from "../../../../types";
import { useStore } from "@nanostores/react";
import {  stockStore } from "../../../../context/store";

const FormularioModificacionPrecios: React.FC<ModificacionPreciosProps> = ({
  userId,
}) => {
  const {data,loading,error:errorStorage} = useStore(stockStore);


  const dataFiltros = useMemo(() => {
    if(loading)return
    if (!data.obtenerFiltros) {
      console.log('No hay datos de filtros');
      return {
        categorias: [],
        ubicaciones: [],
        depositos: []
      };
    }
    
    console.log('Datos de filtros:', data.obtenerFiltros);
    return {
      categorias: data.obtenerFiltros.categorias || [],
      ubicaciones: data.obtenerFiltros.ubicaciones || [],
      depositos: data.obtenerFiltros.depositos || []
    };
  }, [data]);


  const [tipoModificacion, setTipoModificacion] = useState<"porcentaje" | "monto">("porcentaje");
  const [filtroTipo, setFiltroTipo] = useState<"categorias" | "ubicaciones" | "depositos"| "todas">("categorias");
  const [filtros, setFiltros] = useState<DataFiltros>(dataFiltros);
  const [valorSeleccionado, setValorSeleccionado] = useState(
    filtros?.categorias[0] || ""
  );
  const [errors, setErrors] = useState<{msg:string,code?:number}>({msg:'',code:0});
  const [valor, setValor] = useState<number>(0);
  const [afectarPrecio, setAfectarPrecio] = useState<"venta" | "compra" | "ambos">("venta");
  const [productosPreview, setProductosPreview] = useState<ProductoPrevisualizado[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFiltroTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoFiltroTipo = e.target.value as typeof filtroTipo;
    setFiltroTipo(nuevoFiltroTipo);
    setShowPreview(false);
    if (nuevoFiltroTipo === "categorias" && filtros?.categorias?.length) {
      setValorSeleccionado(filtros.categorias[0]);
    } else if (
      nuevoFiltroTipo === "ubicaciones" &&
      filtros?.ubicaciones?.length
    ) {
      setValorSeleccionado(filtros.ubicaciones[0]);
    } else if (nuevoFiltroTipo === "depositos" && filtros?.depositos?.length) {
      setValorSeleccionado(filtros.depositos[0]);
    }
    else if(nuevoFiltroTipo=="todas"){
        setValorSeleccionado("todos");
    }
    else {
      setValorSeleccionado("");
    }
  };

  const handlePrevisualizar = async () => {
    setIsLoading(true);
    try {
      setShowPreview(true);
    } catch (error) {
      setErrors({msg:"Error al previsualizar cambios"});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
if(valor===0){
    setErrors({msg:'El valor es no tiene que ser 0'})
    return
}

    try {
      const response = await fetch("/api/productos/modificacionLotes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          filtroTipo,
          valorSeleccionado,
          tipoModificacion,
          valor,
          afectarPrecio,
        }),
      });

      if (!response.ok) {
          setErrors({msg:"Error en la modificación de precios"})
          throw new Error("Error en la modificación de precios");
      }

      setShowPreview(false);
      setProductosPreview([]);
      window.location.reload()
    } catch (error) {
        setErrors(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-primary-texto p-4">
      <h2 className="text-lg font-semibold mb-4">
        Modificación de Precios por Lote
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Filtro */}
        <div>
          <label className="block text-sm font-medium mb-2">Filtrar por:</label>
          <select
            className="w-full p-2 border rounded"
            value={filtroTipo}
            onChange={handleFiltroTipoChange}
          >
            <option value="categorias">Categorías</option>
            <option value="ubicaciones">Ubicaciónes</option>
            <option value="depositos">Depósitos</option>
            <option value="todas">Todas</option>
          </select>
        </div>

        {/* Selector dinámico según filtro */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Seleccionar {filtroTipo}:
          </label>
          <select
            className="w-full p-2 border rounded"
            value={valorSeleccionado}
            onChange={(e) => {
              setValorSeleccionado(e.target.value);
              setShowPreview(false);
            }}
          >
            {filtroTipo === "todas" &&
                <option value={"todos"} disabled>
                todos
                </option>
                }
            {filtroTipo === "categorias" &&
              filtros?.categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            {filtroTipo === "ubicaciones" &&
              filtros?.ubicaciones.map((ubi) => (
                <option key={ubi} value={ubi}>
                  {ubi}
                </option>
              ))}
            {filtroTipo === "depositos" &&
              filtros?.depositos.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
          </select>
        </div>

        {/* Resto de campos del formulario */}
        <div className="space-y-4">
          {/* Tipo de Modificación */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo de modificación:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="porcentaje"
                  checked={tipoModificacion === "porcentaje"}
                  onChange={() => {
                    setTipoModificacion("porcentaje");
                    setShowPreview(false);
                  }}
                  className="mr-2"
                />
                Porcentaje
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="monto"
                  checked={tipoModificacion === "monto"}
                  onChange={() => {
                    setTipoModificacion("monto");
                    setShowPreview(false);
                  }}
                  className="mr-2"
                />
                Monto Fijo
              </label>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {tipoModificacion === "porcentaje" ? "Porcentaje" : "Monto"} a
              modificar:
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={valor}
                onChange={(e) => {
                  setValor(Number(e.target.value));
                  setShowPreview(false);
                }}
                className="w-full p-2 border rounded"
                step={tipoModificacion === "porcentaje" ? "0.01" : "1"}
              />
              {tipoModificacion === "porcentaje" && (
                <span className="ml-2">%</span>
              )}
            </div>
          </div>

          {/* Precio a afectar */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Afectar precio de:
            </label>
            <select
              className="w-full p-2 border rounded"
              value={afectarPrecio}
              onChange={(e) => {
                setAfectarPrecio(
                  e.target.value as "venta" | "compra" | "ambos"
                );
                setShowPreview(false);
              }}
            >
              <option value="venta">Venta</option>
              <option value="compra">Compra</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrevisualizar}
            disabled={isLoading}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors"
          >
            Previsualizar
          </button>
          <button
            type="submit"
            disabled={isLoading }
            className="flex-1 bg-primary-100 text-white py-2 px-4 rounded hover:bg-primary-200 transition-colors disabled:opacity-50"
          >
            Aplicar Cambios
          </button>
        </div>
        <div className="h-10 w-full flex items-center justify-center text-center">
<span className="text-primary-400 font-semibold">{errors.msg}</span>

        </div>
      </form>

      {/* Previsualización */}
      {showPreview && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Previsualización de cambios</h3>
          <div className="max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Nuevo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosPreview.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatoMoneda.format(producto.precioAnterior)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatoMoneda.format(producto.precioNuevo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioModificacionPrecios;
