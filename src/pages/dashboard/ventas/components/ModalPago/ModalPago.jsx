import { useEffect, useState } from "react";
import { showToast } from "../../../../../utils/toast/toastShow";
import ClientesSelect from "../ClientesSelect";
import MetodoDePago from "./MetodoDePago";
import { formateoMoneda } from "../../../../../utils/formateoMoneda";
import { loader } from "../../../../../utils/loader/showLoader";
import { Table2 } from "lucide-react";
import Comprobante from "../../../../../components/Comprobante/Comprobante";
import ModalComprobante from "../../../../../components/Comprobante/ModalComprobante";

export default function ModalPago({
  isOpen,
  setModalConfirmacion,
  $productos,
  totalVenta,
  subtotal,
  userId,
  ivaMonto,
}) {
  const [cliente, setCliente] = useState({
    nombre: "consumidor final",
    dni: "00000000",
    celular: "0000000000",
    id: "1",
  });
  const [formularioVenta, setFormularioVenta] = useState({
    clienteId: cliente.id,
    descuento: 0,
    metodoPago: "efectivo",
    nComprobante: 0,
    fotoComprobante: "",
    nCheque: 0,
    vencimientoCheque: 0,
    total: totalVenta,
  });
  const [vueltoCalculo, setVueltoCalculo] = useState(0);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [comprobantePago, setComprobantePago] = useState(null);
  const [pagaCon, setPagaCon] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [ventaFinalizada, setVentaFinalizada] = useState({});
  const [esPresupuesto, setEsPresupuesto] = useState("comprobante");
  const handlePagaCon = (e) => {
    const montoIngresado = Number(e.target.value);
    const total = montoIngresado - totalVenta;
    setVueltoCalculo(total);
    setFormularioVenta({ ...formularioVenta, total: total });
  };

  // Actualizar clienteId cuando cambie el cliente
  useEffect(() => {
    setFormularioVenta((prev) => ({
      ...prev,
      clienteId: cliente.id,
    }));
  }, [cliente]);

  const finalizarCompra = async () => {
    loader(true);
    setEsPresupuesto("comprobante");
    console.log("quiero ver el cliente", formularioVenta);
    if (totalVenta == 0) {
      showToast("monto total 0", {
        background: "bg-primary-400",
      });
      return;
    }
    try {
      const responseFetch = await fetch("/api/sales/finalizarVenta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productos: $productos,
          totalVenta,
          userId,
          data: formularioVenta,
        }),
      });
      const data = await responseFetch.json();
      if (data.status == 200) {
        showToast(data.msg, { background: "bg-green-600" });
        loader(false);
        setMostrarComprobante(true);
        setVentaFinalizada(data.data);
        // setTimeout(()=>window.location.reload(),1000)
      }
    } catch (error) {
      console.log(error);
      loader(false);
      showToast("error al transaccionar", { background: "bg-primary-400" });
    }
  };
  const guardarPresupuesto = async () => {
    loader(true);
    setEsPresupuesto("presupuesto");
    if (totalVenta == 0) {
      showToast("monto total 0", {
        background: "bg-primary-400",
      });
      return;
    }
    try {
      const responseFetch = await fetch("/api/sales/presupuestar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productos: $productos,
          totalVenta,
          userId,
          data: formularioVenta,
        }),
      });
      const data = await responseFetch.json();
      if (data.status == 200) {
        showToast(data.msg, { background: "bg-green-600" });
        loader(false);
        setMostrarComprobante(true);
        setVentaFinalizada(data.data);
        // setTimeout(()=>window.location.reload(),1000)
      }
    } catch (error) {
      console.log(error);
      loader(false);
      showToast("error al transaccionar", { background: "bg-primary-400" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormularioVenta({
      ...formularioVenta,
      [name]: value,
    });
  };

  const clickMetodoPago = (metodo) => {
    setMetodoPago(metodo);
    setFormularioVenta({ ...formularioVenta, metodoPago: metodo });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white relative h-screen rounded-lg p-6 md:h-auto md:w-full z-50 max-w-2xl md:mb-0 mb-24 animate-aparecer">
          <h2 className="text-2xl font-semibold mb-2">Finalizar Venta</h2>
          <div className=" flex flex-col h-full w-full overflow-y-auto pb-10">
            {/* Sección Cliente */}
            <div className="mb-6">
              <h3 className="text-lg mb-2">Cliente</h3>
              <ClientesSelect cliente={cliente} setCliente={setCliente} userId={userId}/>
              {cliente.id !== "1" && (
                <div className="mt-2 text-sm w-full flex items-start justify-normal gap-3 text-gray-600">
                  <p>DNI: {cliente.dni}</p>
                  <p>Dirección: {cliente.direccion}</p>
                  <p>Celular: {cliente.direccion}</p>
                </div>
              )}
            </div>

            {/* Sección Método de Pago */}
            <div className="mb-6">
              <h3 className="text-lg mb-2">Método de Pago</h3>
              <div className="flex flex-wrap  gap-3 mb-4">
                {["efectivo", "transferencia", "cheque", "deposito"].map(
                  (metodo) => (
                    <button
                      key={metodo}
                      onClick={() => clickMetodoPago(metodo)}
                      className={`md:px-4 px-2 md:py-2 py-1 rounded-lg capitalize ${
                        metodoPago === metodo
                          ? "bg-primary-100 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {metodo}
                    </button>
                  )
                )}
              </div>

              {/* Campos según método de pago */}
              {metodoPago === "efectivo" && (
                <div className="flex gap-4 w-full">
                  <div className="flex-1 w-full">
                    <label className="text-sm">Monto recibido</label>
                    <input
                      type="number"
                      className="w-full border rounded-lg p-2"
                      onChange={handlePagaCon}
                    />
                  </div>
                  <div className="flex-">
                    <label className="text-sm">Vuelto</label>
                    <p className="md:text-2xl text-xl font-mono">
                      {formateoMoneda.format(vueltoCalculo)}
                    </p>
                  </div>
                </div>
              )}

              {["transferencia", "deposito"].includes(metodoPago) && (
                <div className="space-y-1">
                  <div>
                    <label className="text-sm">Número de comprobante</label>
                    <input
                      type="text"
                      onChange={handleChange}
                      name="nComprobante"
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Comprobante de pago</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border rounded-lg p-2"
                      onChange={(e) =>
                        setFormularioVenta({
                          ...formularioVenta,
                          fotoComprobante: e.target.files[0],
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {metodoPago === "cheque" && (
                <div className="space-y-1">
                  <div>
                    <label className="text-sm">Número de cheque</label>
                    <input
                      type="text"
                      onChange={handleChange}
                      name="nCheque"
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Fecha de vencimiento</label>
                    <input
                      type="date"
                      onChange={handleChange}
                      name="vencimientoCheque"
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sección Descuento */}
            <div className="mb-4 border-t pt-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-sm mb-1 block">Descuento manual</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="descuento"
                      className="w-24 border rounded-lg p-2"
                      value={formularioVenta.descuento}
                      onChange={handleChange}
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 block">
                    Monto descuento
                  </span>
                  <span className="text-lg font-mono">
                    -
                    {formateoMoneda.format(
                      totalVenta * (formularioVenta.descuento / 100)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Actualizar el Resumen y Totales */}
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>{formateoMoneda.format(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>IVA:</span>
                <span>{formateoMoneda.format(ivaMonto)}</span>
              </div>
              {formularioVenta.descuento > 0 && (
                <div className="flex justify-between mb-2 text-primary-100">
                  <span>Descuento ({formularioVenta.descuento}%):</span>
                  <span>
                    -
                    {formateoMoneda.format(
                      totalVenta * (formularioVenta.descuento / 100)
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold">
                <span>Total Final:</span>
                <span>
                  {formateoMoneda.format(
                    totalVenta * (1 - formularioVenta.descuento / 100)
                  )}
                </span>
              </div>
            </div>
          </div>
          {/* Botones de acción */}
          <div className="flex absolute bottom-2 left-0 h-10 w-full justify-end gap-3 bg-white pr-5 ">
            <button
              onClick={() => setModalConfirmacion(false)}
              className="md:px-4 px-1 md:py-2 py-1 rounded-lg bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={guardarPresupuesto}
              className="md:px-4 px-1 md:py-2 py-1 rounded-lg bg-primary-texto hover:bg-primary-texto/80 text-white"
            >
              Presupuesto
            </button>

            <button
              onClick={finalizarCompra}
              className="md:px-4 px-1 md:py-2 py-1 rounded-lg bg-primary-100 hover:bg-primary-100/80 text-white"
            >
              Confirmar Venta
            </button>
          </div>
        </div>
      </div>
      {/* Modal de comprobante */}
      {mostrarComprobante && (
        <ModalComprobante
          setModalConfirmacion={setModalConfirmacion}
          $productos={$productos}
          cliente={cliente}
          descuento={descuento}
          esPresupuesto={esPresupuesto}
          ivaMonto={ivaMonto}
          totalVenta={totalVenta}
          ventaFinalizada={ventaFinalizada}
          subtotal={subtotal}
          key={21}
        />
      )}
    </>
  );
}
