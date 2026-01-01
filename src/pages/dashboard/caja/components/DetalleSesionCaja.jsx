import React, { useState, useEffect } from 'react';
import { X, ArrowDown, ArrowUp, ShoppingCart } from 'lucide-react';
import { formateoMoneda } from '../../../../utils/formateoMoneda';

export default function DetalleSesionCaja({ sessionId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetalle = async () => {
        try {
            const res = await fetch(`/api/caja/detalle/${sessionId}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Error al cargar detalle", error);
        } finally {
            setLoading(false);
        }
    };
    if (sessionId) fetchDetalle();
  }, [sessionId]);

  if (!sessionId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-aparecer">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
                <h3 className="text-lg font-bold text-gray-800">Detalle de Sesión de Caja</h3>
                <p className="text-xs text-gray-500 font-mono">ID: {sessionId}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
                <div className="h-40 flex items-center justify-center text-gray-400">Cargando movimientos...</div>
            ) : !data ? (
                <div className="h-40 flex items-center justify-center text-red-500">Error al cargar datos.</div>
            ) : (
                <div className="space-y-6">
                    {/* Resumen de Totales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <span className="text-xs text-blue-600 font-bold uppercase block mb-1">Monto Inicial</span>
                            <span className="text-xl font-mono font-bold text-blue-800">{formateoMoneda.format(data.sesion.montoInicial || 0)}</span>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <span className="text-xs text-emerald-600 font-bold uppercase block mb-1">Ingresos</span>
                            <span className="text-xl font-mono font-bold text-emerald-800">
                                {formateoMoneda.format(data.movimientos.filter(m => m.tipo === 'ingreso' && m.origen !== 'apertura').reduce((acc, m) => acc + m.monto, 0))}
                            </span>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <span className="text-xs text-red-600 font-bold uppercase block mb-1">Egresos</span>
                            <span className="text-xl font-mono font-bold text-red-800">
                                {formateoMoneda.format(data.movimientos.filter(m => m.tipo === 'egreso').reduce((acc, m) => acc + m.monto, 0))}
                            </span>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                            <span className="text-xs text-gray-600 font-bold uppercase block mb-1">Saldo Sistema</span>
                            <span className="text-xl font-mono font-bold text-gray-800">
                                {formateoMoneda.format(data.sesion.montoFinalEsperado ?? 
                                    ((data.sesion.montoInicial || 0) + 
                                     data.movimientos.filter(m => m.tipo === 'ingreso' && m.origen !== 'apertura').reduce((acc, m) => acc + m.monto, 0) - 
                                     data.movimientos.filter(m => m.tipo === 'egreso').reduce((acc, m) => acc + m.monto, 0))
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Tabla de Movimientos */}
                    <div>
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                             <ShoppingCart size={18} /> Movimientos Registrados
                        </h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                                    <tr>
                                        <th className="py-3 px-4">Hora</th>
                                        <th className="py-3 px-4">Tipo</th>
                                        <th className="py-3 px-4">Origen / Descripción</th>
                                        <th className="py-3 px-4">Comprobante</th>
                                        <th className="py-3 px-4">Usuario</th>
                                        <th className="py-3 px-4 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.movimientos.map((mov) => (
                                        <tr key={mov.id} className="hover:bg-gray-50/50">
                                            <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                                                {new Date(mov.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded textxs font-medium uppercase ${
                                                    mov.tipo === 'ingreso' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                                                }`}>
                                                    {mov.tipo === 'ingreso' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                                                    {mov.tipo}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium capitalize text-gray-800">{mov.origen}</span>
                                                    <span className="text-xs text-gray-400">{mov.descripcion}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{mov.comprobante || '-'}</td>
                                            <td className="py-3 px-4 text-gray-600 text-xs">{mov.usuarioNombre}</td>
                                            <td className={`py-3 px-4 text-right font-mono font-medium ${
                                                mov.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                                {mov.tipo === 'egreso' ? '-' : '+'}{formateoMoneda.format(mov.monto)}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.movimientos.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-gray-400 italic">No hay movimientos registrados en esta sesión.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
                Cerrar
            </button>
        </div>
      </div>
    </div>
  );
}
