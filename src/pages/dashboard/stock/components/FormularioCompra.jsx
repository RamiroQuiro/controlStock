import { useState, useEffect } from "react";
import InputDate from "../../../../components/atomos/InputDate";
import InputFormularioSolicitud from "../../../../components/moleculas/InputFormularioSolicitud";
import FiltroProductos from "../../../../components/moleculas/FiltroProductos";
import DetallesVentas from "../../ventas/components/DetallesVentas";
import DetalleMontoCompra from "./FormularioCompra/DetalleMontoCompra";
import ProveedorSelect from "./ProveedorSelect";
import { showToast } from "../../../../utils/toast/toastShow";
import { productos } from "../../../../db/schema";
import { useStore } from "@nanostores/react";
import { productosSeleccionadosVenta } from "../../../../context/store";
const FormularioCompra = ({ userId, filtrado, filtroBusqueda }) => {
  const [totalVenta, setTotalVenta] = useState(0);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [error, setError] = useState({ msg: "", status: 0 });
  const $productos = useStore(productosSeleccionadosVenta);
  const [cargando, setCargando] = useState(false);

  const [subtotal, setSubtotal] = useState(0);
  const [ivaMonto, setIvaMonto] = useState(0);

  const [proveedor, setProveedor] = useState({
    nombre: "",
    dni: "00000000",
    celular: "0000000000",
    id: "1",
  });
  const [formulario, setFormulario] = useState({
    proveedorId: proveedor.id,
    metodoPago: "efectivo",
    nComprobante: "",
    nCheque: "",
    vencimientoCheque: "",
    total: 0,
    impuesto: 0,
    descuento: 0,
    observacion: "",
    productos: [],
  });

  useEffect(() => {
    const sumaTotal = $productos.reduce(
      (acc, producto) => acc + producto.pVenta * producto.cantidad,
      0
    );

    const sumaSubtotal = $productos.reduce(
      (acc, producto) =>
        acc + (producto.pVenta * producto.cantidad) / (1 + producto.iva / 100),
      0
    );

    setTotalVenta(sumaTotal);
    setSubtotal(sumaSubtotal);
    setIvaMonto(sumaTotal - sumaSubtotal);
  }, [$productos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ msg: "", status: 0 });

    formulario.total = totalVenta;
    formulario.proveedorId = proveedor.id;
    console.log(formulario)
    try {
      setCargando(true);
      const response = await fetch(`/api/compras/comprasProv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          data: formulario,
          productos: $productos,
          userId: "1",
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error en la solicitud");

      showToast("Compra registrada exitosamente");
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      setError({ msg: error.message, status: 400 });
      showToast(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="text-primary-texto gap-4 p-4 flex flex-col ">
      <h2 className="text-xl font-semibold">Registro de Compra</h2>
      {/* Sección proveedor */}
      <div className="flex w-full items-start justify-normal  flex-col">
        <h3 className="text-lg ">Proveedor</h3>
        <ProveedorSelect proveedor={proveedor} setProveedor={setProveedor} />
        {proveedor.id !== "1" && (
          <div className="mt-2 text-sm w-full flex items-start justify-normal gap-3 text-gray-600">
            <p>DNI: {proveedor?.dni}</p>
            <p>Dirección: {proveedor?.direccion}</p>
            <p>Celular: {proveedor?.celular}</p>
          </div>
        )}
      </div>
      <div className="flex w-full items-center justify-normal gap-3">
        <InputDate
          name={"fechaCompra"}
          onChange={handleChange}
          id={"fechaCompra"}
        >
          fecha de compra
        </InputDate>
        <InputFormularioSolicitud
          type="text"
          name="nComprobante"
          value={formulario?.nComprobante}
          onchange={handleChange}
        >
          {" "}
          Número de Factura
        </InputFormularioSolicitud>

        <div className="flex flex-col w-full">
          <label className="block text-sm font-medium text-gray-700">
            Forma de Pago
          </label>
          <select
            name="metodoPago"
            value={formulario.metodoPago}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg py-0.5 border-2 border-primary-100/50  focus:ring focus:border-transparent focus:ring-primary-100"
          >
            <option value="efectivo">Efectivo</option>
            <option value="credito">Crédito</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        {formulario.metodoPago === "credito" && (
          <InputDate
            name={"fechaVencimiento"}
            value={formulario.fechaVencimiento}
            onChange={handleChange}
            id={"fechaVencimiento"}
          >
            fecha de Vencimiento
          </InputDate>
        )}
      </div>

      <div className="flex flex-col items-start justify-normal">
        <h3 className="text-lg font-medium">Productos</h3>
        <FiltroProductos mostrarProductos={true} />
        <DetallesVentas />
      </div>
      <DetalleMontoCompra
        subtotal={subtotal}
        ivaMonto={ivaMonto}
        totalVenta={totalVenta}
      />

      <div className="">
        <label className="block text-sm font-medium text-gray-700">
          Observaciones
        </label>
        <textarea
          name="observaciones"
          value={formulario?.observaciones}
          onChange={handleChange}
          className="mt-1 block w-full p-1 rounded-lg py-0.5 border-2 focus:outline-none border-primary-100/50  focus:ring focus:border-transparent focus:ring-primary-100"
          rows="3"
          placeholder="Ingrese observaciones adicionales"
        />
      </div>

      {error.msg && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {error.msg}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={cargando}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {cargando ? "Registrando..." : "Registrar Compra"}
        </button>
      </div>
    </form>
  );
};

export default FormularioCompra;
