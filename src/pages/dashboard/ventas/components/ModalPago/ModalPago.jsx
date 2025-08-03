import { useEffect, useState, useRef } from 'react';
import { showToast } from '../../../../../utils/toast/toastShow';
import ClientesSelect from '../ClientesSelect';
import MetodoDePago from './MetodoDePago';
import { formateoMoneda } from '../../../../../utils/formateoMoneda';
import { loader } from '../../../../../utils/loader/showLoader';
import { Table2 } from 'lucide-react';
import Comprobante from '../../../../../components/Comprobante/Comprobante';
import ModalComprobante from '../../../../../components/Comprobante/ModalComprobante';

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
    nombre: 'consumidor final',
    dni: '00000000',
    celular: '0000000000',
    id: user?.clienteDefault,
  });
  const [formularioVenta, setFormularioVenta] = useState({
    clienteId: cliente.id,
    descuento: 0,
    tipoComprobante: 'FC_B',
    puntoVenta: user.puntoVenta || 1,
    metodoPago: 'efectivo',
    nComprobante: 0,
    fotoComprobante: '',
    nCheque: 0,
    vencimientoCheque: 0,
    total: totalVenta,
  });
  const [vueltoCalculo, setVueltoCalculo] = useState(0);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [descuento, setDescuento] = useState(0);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [ventaFinalizada, setVentaFinalizada] = useState({});
  const [esPresupuesto, setEsPresupuesto] = useState('comprobante');
  
  const montoRecibidoRef = useRef(null);

  const handlePagaCon = (e) => {
    const montoIngresado = Number(e.target.value);
    const total = montoIngresado - totalVenta;
    setVueltoCalculo(total);
    setFormularioVenta({ ...formularioVenta, total: total });
  };

  // --- EFECTOS SECUNDARIOS ---

  // Efecto para el autofoco en el campo de monto recibido
  useEffect(() => {
    if (metodoPago === 'efectivo' && montoRecibidoRef.current) {
      montoRecibidoRef.current.focus();
    }
  }, [metodoPago]);

  // Efecto para manejar los atajos de teclado F10 (Confirmar) y F7 (Presupuesto)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F10') {
        event.preventDefault();
        finalizarCompra();
      }
      if (event.key === 'F7') {
        event.preventDefault();
        guardarPresupuesto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Limpieza: remover el event listener cuando el modal se cierra
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // El array vacío asegura que se ejecute solo una vez

  // Efecto para actualizar el clienteId en el formulario cuando el cliente cambia
  useEffect(() => {
    setFormularioVenta((prev) => ({
      ...prev,
      clienteId: cliente.id,
    }));
  }, [cliente]);

  // --- LÓGICA DE IMPRESIÓN ---

  // Función para imprimir el ticket de venta
  const imprimirTicket = async (ventaId) => {
    try {
      // 1. Solicitar el HTML del ticket a la API
      const response = await fetch('/api/comprobantes/generar-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventaId }),
      });

      if (!response.ok) {
        throw new Error('Error al generar el HTML del ticket');
      }

      const htmlTicket = await response.text();

      // 2. Crear un iframe oculto para la impresión
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // 3. Escribir el HTML en el iframe y llamar a la impresión
      iframe.contentDocument.write(htmlTicket);
      iframe.contentDocument.close();
      iframe.contentWindow.print();

      // 4. Limpiar el iframe después de un tiempo
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);

    } catch (error) {
      console.error('Error al imprimir el ticket:', error);
      showToast('Error al imprimir ticket', { background: 'bg-red-500' });
    }
  };

  const finalizarCompra = async () => {
    loader(true);
    setEsPresupuesto('comprobante');
    if (totalVenta == 0) {
      showToast('monto total 0', { background: 'bg-primary-400' });
      return;
    }
    try {
      const responseFetch = await fetch('/api/sales/finalizarVenta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: $productos,
          totalVenta,
          userId: user.id,
          empresaId: user.empresaId,
          data: formularioVenta,
        }),
      });
      const data = await responseFetch.json();
      if (data.status == 200) {
        showToast(data.msg, { background: 'bg-green-600' });
        
        // --- IMPRESIÓN AUTOMÁTICA DEL TICKET ---
        await imprimirTicket(data.data.id);

        loader(false);
        setVentaFinalizada(data.data);
        setMostrarComprobante(true);
      }
    } catch (error) {
      console.log(error);
      loader(false);
      showToast('error al transaccionar', { background: 'bg-primary-400' });
    }
  };
  const guardarPresupuesto = async () => {
    loader(true);
    setEsPresupuesto('presupuesto');
    if (totalVenta == 0) {
      showToast('monto total 0', {
        background: 'bg-primary-400',
      });
      return;
    }
    try {
      const responseFetch = await fetch('/api/sales/presupuestar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productos: $productos,
          totalVenta,
          userId: user.id,
          empresaId: user.empresaId,
          data: formularioVenta,
        }),
      });
      const data = await responseFetch.json();
      if (data.status == 200) {
        showToast(data.msg, { background: 'bg-green-600' });
        
        // --- IMPRESIÓN AUTOMÁTICA DEL TICKET ---
        await imprimirTicket(data.data.id);

        loader(false);
        setVentaFinalizada(data.data);
        setMostrarComprobante(true);
      }
    } catch (error) {
      console.log(error);
      loader(false);
      showToast('error al transaccionar', { background: 'bg-primary-400' });
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
        <div className="bg-white relative h-4/5 rounded-lg py-4 px-6 md:h-[95vh] md:w-full z-50 max-w-2xl md:mb-0 mb-24 animate-aparecer">
        <div className='w-full flex items-start justify-between mb-2'>

          <h2 className="text-2xl font-semibold ">Finalizar Venta</h2>
              
              {/* Agregar selector de tipo de comprobante */}
              <div className=" flex items-center md:w-1/3 justify-start gap-">
                <label className="text-xs block w-fit">Tipo de Comp.</label>
                <select
                  name="tipoComprobante"
                  value={formularioVenta.tipoComprobante}
                  onChange={handleChange}
                  className="w-full border text-sm rounded-lg p-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  <option value="FC_B">Factura B</option>
                  <option value="FC_A">Factura A</option>
                  <option value="FC_C">Factura C</option>
                  <option value="PR">Presupuesto</option>
                  <option value="NT">Nota Credito</option>
                </select>
              </div>

        </div>
          <div className=" flex flex-col h-full w-full overflow-y-auto pb-10">
            {/* Sección Cliente */}
            <div className="mb-6">
              <h3 className=" ">Cliente</h3>
              <ClientesSelect
                cliente={cliente}
                setCliente={setCliente}
                empresaId={user.empresaId}
              />
          
              {cliente.id !== '1' && (
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
                {['efectivo', 'transferencia', 'cheque', 'deposito'].map(
                  (metodo) => (
                    <button
                      key={metodo}
                      onClick={() => clickMetodoPago(metodo)}
                      className={`md:px-4 px-2 md:py-2 py-1 rounded-lg capitalize ${
                        metodoPago === metodo
                          ? 'bg-primary-100 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {metodo}
                    </button>
                  )
                )}
              </div>

              {/* Campos según método de pago */}
              {metodoPago === 'efectivo' && (
                <div className="flex gap-4 w-full">
                  <div className="flex-1 w-full">
                    <label className="text-sm">Monto recibido</label>
                    <input
                      ref={montoRecibidoRef} // Asignar la referencia al input
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

              {['transferencia', 'deposito'].includes(metodoPago) && (
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

              {metodoPago === 'cheque' && (
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
            <div className="border-t pt-4 mb-10 md:mb-2">
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
