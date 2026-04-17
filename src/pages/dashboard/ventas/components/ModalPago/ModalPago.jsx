import { useEffect, useState, useRef } from "react";
import { CreditCard } from "lucide-react";
import { showToast } from "../../../../../utils/toast/toastShow";
import ClientesSelect from "../ClientesSelect";
import MetodoDePago from "./MetodoDePago";
import { formateoMoneda } from "../../../../../utils/formateoMoneda";
import Comprobante from "../../../../../components/Comprobante/Comprobante";
import { actions as cajaActions } from "../../../../../context/caja.store";
import ModalReact from "../../../../../components/moleculas/ModalReact";
import { limpiarVenta } from "../../../../../context/venta.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ComprobanteService } from "../../../../../services/comprobante.service";
import Button from "../../../../../components/atomos/Button";

const comprobanteService = new ComprobanteService();

export default function ModalPago({
  isOpen,
  setModalConfirmacion,
  $productos,
  totalVenta,
  subtotal,
  user,
  ivaMonto,
}) {
  const [cliente, setCliente] = useState({
    nombre: "consumidor final",
    dni: "00000000",
    celular: "0000000000",
    id: user?.clienteDefault,
  });
  const [formularioVenta, setFormularioVenta] = useState({
    clienteId: cliente.id,
    descuento: 0,
    tipoComprobante: "FC_B",
    puntoVenta: user.puntoVenta || 1,
    metodoPago: "efectivo",
    nComprobante: 0,
    fotoComprobante: "",
    nCheque: 0,
    vencimientoCheque: 0,
    total: totalVenta,
  });
  const [vueltoCalculo, setVueltoCalculo] = useState(0);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [descuento, setDescuento] = useState(0);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [ventaFinalizada, setVentaFinalizada] = useState({});
  const [esPresupuesto, setEsPresupuesto] = useState("comprobante");
  const queryClient = useQueryClient();
  const montoRecibidoRef = useRef(null);

  const vueltoCalculadoReal = () => {
    const totalConDescuento =
      totalVenta * (1 - (formularioVenta.descuento || 0) / 100);
    return totalConDescuento;
  };

  const handlePagaCon = (e) => {
    const montoIngresado = Number(e.target.value);
    const vuelto = montoIngresado - vueltoCalculadoReal();
    setVueltoCalculo(vuelto);
  };

  // Efecto para el autofoco en el campo de monto recibido
  useEffect(() => {
    if (metodoPago === "efectivo" && montoRecibidoRef.current) {
      montoRecibidoRef.current.focus();
    }
  }, [metodoPago]);

  // Efecto para actualizar el clienteId en el formulario cuando el cliente cambia
  useEffect(() => {
    setFormularioVenta((prev) => ({
      ...prev,
      clienteId: cliente.id,
    }));
  }, [cliente]);

  // Función para imprimir el ticket de venta
  const imprimirTicket = async (ventaId) => {
    try {
      const response = await fetch("/api/comprobantes/generar-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ventaId }),
      });

      if (!response.ok) throw new Error("Error al generar el HTML del ticket");
      const htmlTicket = await response.text();
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      iframe.contentDocument.write(htmlTicket);
      iframe.contentDocument.close();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    } catch (error) {
      console.error("Error al imprimir el ticket:", error);
      showToast("Error al imprimir ticket", { background: "bg-red-500" });
    }
  };

  // Mutaciones de React Query
  const mutationVenta = useMutation({
    mutationFn: async (datosVenta) => {
      const response = await fetch("/api/sales/finalizarVenta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosVenta),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || "Error al finalizar la venta");
      }
      return response.json();
    },
    onSuccess: (res) => {
      showToast(res.msg, { background: "bg-green-600" });
      setVentaFinalizada(res.data);
      setMostrarComprobante(true);
      if (metodoPago === "efectivo") cajaActions.fetchEstadoCaja();
      imprimirTicket(res.data.id).catch((err) => console.error(err));
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
    onError: (error) => {
      showToast(error.message, { background: "bg-red-500" });
    },
  });

  const mutationPresupuesto = useMutation({
    mutationFn: async (datosPresupuesto) => {
      const response = await fetch("/api/sales/presupuestar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosPresupuesto),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.msg || "Error al presupuestar");
      }
      return response.json();
    },
    onSuccess: (res) => {
      showToast(res.msg, { background: "bg-green-600" });
      setVentaFinalizada(res.data);
      setMostrarComprobante(true);
      imprimirTicket(res.data.id).catch((err) => console.error(err));
    },
    onError: (error) => {
      showToast(error.message, { background: "bg-red-500" });
    },
  });

  const loading = mutationVenta.isPending || mutationPresupuesto.isPending;

  // Efecto para manejar los atajos de teclado F10 (Confirmar) y F7 (Presupuesto)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (mostrarComprobante) return;
      if (event.key === "F10") {
        event.preventDefault();
        finalizarCompra();
      }
      if (event.key === "F7") {
        event.preventDefault();
        guardarPresupuesto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, mostrarComprobante]);

  const finalizarCompra = async () => {
    if (loading || mostrarComprobante) return;
    setEsPresupuesto("comprobante");
    const totalFinalReal = vueltoCalculadoReal();

    mutationVenta.mutate({
      productos: $productos,
      totalVenta: totalFinalReal,
      userId: user.id,
      empresaId: user.empresaId,
      data: { ...formularioVenta, total: totalFinalReal },
    });
  };

  const guardarPresupuesto = async () => {
    if (loading || mostrarComprobante) return;
    setEsPresupuesto("presupuesto");
    if (totalVenta == 0) {
      showToast("monto total 0", { background: "bg-primary-400" });
      return;
    }

    mutationPresupuesto.mutate({
      productos: $productos,
      totalVenta,
      userId: user.id,
      empresaId: user.empresaId,
      data: formularioVenta,
    });
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

  const dataComprobante = mostrarComprobante
    ? {
        codigo: ventaFinalizada?.codigo || ventaFinalizada?.id,
        id: ventaFinalizada?.id,
        fecha: ventaFinalizada.fecha,
        numeroFormateado: ventaFinalizada.numeroFormateado,
        puntoVenta: ventaFinalizada.puntoVenta,
        tipo: ventaFinalizada.tipo,
        empresaId: ventaFinalizada.empresaId,
        cliente: cliente,
        comprobante: {
          numero: ventaFinalizada.numero,
          tipo: ventaFinalizada.tipo,
          puntoVenta: ventaFinalizada.puntoVenta,
          numeroFormateado: ventaFinalizada.numeroFormateado,
          fecha: ventaFinalizada.fecha,
          fechaEmision: ventaFinalizada.fechaEmision,
          clienteId: ventaFinalizada.clienteId,
          total: ventaFinalizada.total,
          estado: ventaFinalizada.estado,
        },
        dataEmpresa: {
          razonSocial: ventaFinalizada.dataEmpresa?.razonSocial,
          documento: ventaFinalizada.dataEmpresa?.documento,
          direccion: ventaFinalizada.dataEmpresa?.direccion,
          telefono: ventaFinalizada.dataEmpresa?.telefono,
          email: ventaFinalizada.dataEmpresa?.email,
          web: ventaFinalizada.dataEmpresa?.web,
          logo: ventaFinalizada.dataEmpresa?.logo,
        },
        items: $productos.map((p) => ({
          producto: p.nombre,
          cantidad: p.cantidad,
          precioUnitario: p.pVenta,
          subtotal: p.cantidad * p.pVenta,
          impuesto: p.iva,
          descripcion: p.descripcion,
        })),
        esPresupuesto: esPresupuesto,
        subtotal,
        impuestos: ivaMonto,
        descuentos: totalVenta * (formularioVenta.descuento / 100),
        total: totalVenta * (1 - formularioVenta.descuento / 100),
        expira_at:
          esPresupuesto === "presupuesto" ? ventaFinalizada.expira_at : null,
      }
    : null;

  const deudaProyectada = (cliente?.saldoPendiente || 0) + (vueltoCalculadoReal() - (formularioVenta.montoEntregadoFiado || 0));
  const superaLimite = (cliente?.limiteCredito > 0) && (deudaProyectada > cliente.limiteCredito);

  return (
    <ModalReact
      title={
        mostrarComprobante
          ? esPresupuesto === "presupuesto"
            ? "Presupuesto Generado"
            : "Venta Exitosa"
          : "Finalizar Venta"
      }
      onClose={() => {
        if (mostrarComprobante) {
          limpiarVenta();
        }
        setModalConfirmacion(false);
      }}
      id="pago"
    >
      {mostrarComprobante ? (
        <div className="md:h-[75vh] h-[85vh] overflow-y-auto">
          <Comprobante
            onClose={() => {
              limpiarVenta();
              setModalConfirmacion(false);
            }}
            esPresupuesto={esPresupuesto === "presupuesto"}
            data={dataComprobante}
            onPrint={() =>
              comprobanteService.imprimirComprobante(dataComprobante)
            }
            onDownload={() => comprobanteService.descargarPDF(dataComprobante)}
            onShare={() =>
              comprobanteService.compartirComprobante(
                ventaFinalizada.codigo || ventaFinalizada.id,
              )
            }
          />
        </div>
      ) : (
        <div className="flex flex-col h-full relative">
          <div className="flex items-center w-full justify-between gap-3 mb-6 bg-gray-50 p-3 rounded-lg border">
            <label className="text-sm font-semibold block w-fit">
              Tipo de Comprobante:
            </label>
            <select
              name="tipoComprobante"
              value={formularioVenta.tipoComprobante}
              onChange={handleChange}
              className="w-1/2 border text-sm rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="FC_B">Factura B</option>
              <option value="FC_A">Factura A</option>
              <option value="FC_C">Factura C</option>
              <option value="PR">Presupuesto</option>
              <option value="NT">Nota de Crédito</option>
            </select>
          </div>

          <div className="flex flex-col h-full w-full overflow-y-auto pb-20">
            {/* Sección Cliente */}
            <div className="mb-6">
              <h3 className="font-bold mb-2">Cliente</h3>
              <ClientesSelect
                cliente={cliente}
                setCliente={setCliente}
                empresaId={user.empresaId}
              />

              {cliente.id !== "1" && (
                <div className="mt-2 text-sm w-full flex items-start justify-normal gap-3 text-gray-600">
                  <p>DNI: {cliente.dni}</p>
                  <p>Dirección: {cliente.direccion}</p>
                  <p>Celular: {cliente.celular}</p>
                </div>
              )}
            </div>

            {/* Sección Método de Pago */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Método de Pago</h3>
              <div className="flex flex-wrap gap-3 mb-4">
                {[
                  "efectivo",
                  "transferencia",
                  "fiado",
                  "cheque",
                  "deposito",
                ].map((metodo) => (
                  <button
                    key={metodo}
                    onClick={() => clickMetodoPago(metodo)}
                    className={`md:px-4 px-2 md:py-2 py-1 rounded-lg capitalize transition-colors ${
                      metodoPago === metodo
                        ? "bg-primary-100 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {metodo}
                  </button>
                ))}
              </div>

              {metodoPago === "fiado" && (
                <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-sm font-semibold mb-1 block text-blue-800">
                        Monto entregado en Efectivo (opcional)
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        onChange={(e) => {
                          const pago = Number(e.target.value);
                          setFormularioVenta((prev) => ({
                            ...prev,
                            montoEntregadoFiado: pago,
                          }));
                        }}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="text-right">
                      <label className="text-sm font-semibold mb-1 block text-blue-800">
                        Saldo a cuenta corriente
                      </label>
                      <p className="text-xl font-mono text-blue-900 font-bold">
                        {formateoMoneda.format(
                          Math.max(
                            0,
                            vueltoCalculadoReal() -
                              (formularioVenta.montoEntregadoFiado || 0),
                          ),
                        )}
                      </p>
                    </div>
                  </div>
                  {superaLimite && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3 animate-pulse">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-orange-800 uppercase">Límite Superado</p>
                        <p className="text-[11px] text-orange-700">
                          Deuda proyectada: <strong>{formateoMoneda.format(deudaProyectada)}</strong> 
                          (Límite: {formateoMoneda.format(cliente.limiteCredito)})
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-blue-600 italic">
                    * El monto entregado se registrará como un "Pago" inmediato
                    y el resto como "Deuda".
                  </p>
                </div>
              )}

              {metodoPago === "efectivo" && (
                <div className="flex gap-4 w-full bg-gray-50 p-4 rounded-lg border">
                  <div className="flex-1">
                    <label className="text-sm font-semibold mb-1 block">
                      Monto recibido
                    </label>
                    <input
                      ref={montoRecibidoRef}
                      type="number"
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-100 outline-none"
                      onChange={handlePagaCon}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="text-right">
                    <label className="text-sm font-semibold mb-1 block">
                      Vuelto
                    </label>
                    <p
                      className={`md:text-2xl text-xl font-mono ${vueltoCalculo < 0 ? "text-red-500" : "text-green-600"}`}
                    >
                      {formateoMoneda.format(vueltoCalculo)}
                    </p>
                  </div>
                </div>
              )}

              {["transferencia", "deposito"].includes(metodoPago) && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">
                      Número de comprobante
                    </label>
                    <input
                      type="text"
                      onChange={handleChange}
                      name="nComprobante"
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-100 outline-none"
                      placeholder="Ej: 12345678"
                    />
                  </div>
                </div>
              )}

              {metodoPago === "cheque" && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">
                      Número de cheque
                    </label>
                    <input
                      type="text"
                      onChange={handleChange}
                      name="nCheque"
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">
                      Fecha de vencimiento
                    </label>
                    <input
                      type="date"
                      onChange={handleChange}
                      name="vencimientoCheque"
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-100 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sección Descuento */}
            <div className="mb-6 border-t pt-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold mb-1 block">
                    Descuento manual (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="descuento"
                    className="w-24 border rounded-lg p-2 focus:ring-2 focus:ring-primary-100 outline-none"
                    value={formularioVenta.descuento}
                    onChange={handleChange}
                  />
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 block italic">
                    Monto a descontar
                  </span>
                  <span className="text-lg font-mono text-red-500">
                    -
                    {formateoMoneda.format(
                      totalVenta * (formularioVenta.descuento / 100),
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Resumen Final */}
            <div className="border-t-2 pt-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-1 text-gray-600">
                <span>Subtotal:</span>
                <span>{formateoMoneda.format(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-1 text-gray-600">
                <span>IVA:</span>
                <span>{formateoMoneda.format(ivaMonto)}</span>
              </div>
              {formularioVenta.descuento > 0 && (
                <div className="flex justify-between mb-1 text-red-500 font-medium">
                  <span>Descuento ({formularioVenta.descuento}%):</span>
                  <span>
                    -
                    {formateoMoneda.format(
                      totalVenta * (formularioVenta.descuento / 100),
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold text-primary-100 mt-2 pt-2 border-t border-gray-200">
                <span>Total Final:</span>
                <span>
                  {formateoMoneda.format(
                    totalVenta * (1 - formularioVenta.descuento / 100),
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Botonera Flotante */}
          <div className="absolute bottom-0 left-0 w-full bg-white border-t p-4 flex justify-end gap-3 z-10">
            <Button
              variant="cancel"
              onClick={() => setModalConfirmacion(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={guardarPresupuesto}
              disabled={loading}
            >
              {loading && esPresupuesto === "presupuesto"
                ? "Procesando..."
                : "Presupuesto"}
            </Button>
            <Button
              variant="green"
              onClick={finalizarCompra}
              disabled={loading}
            >
              {loading && esPresupuesto === "comprobante"
                ? "Procesando..."
                : "Confirmar Venta"}
            </Button>
          </div>
        </div>
      )}
    </ModalReact>
  );
}
