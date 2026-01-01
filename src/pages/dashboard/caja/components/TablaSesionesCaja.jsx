import React, { useState, useEffect } from 'react';
import { formateoMoneda } from '../../../../utils/formateoMoneda';
import { Eye, Calendar, User, Store } from 'lucide-react';
import DetalleSesionCaja from './DetalleSesionCaja';

export default function TablaSesionesCaja() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    desde: '', 
    hasta: ''
  });
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
        const query = new URLSearchParams(filtros).toString();
        const res = await fetch(`/api/caja/historial?${query}`);
        if (res.ok) {
            const data = await res.json();
            setSesiones(data);
        }
    } catch (error) {
        console.error("Error cargando historial", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []); // Carga inicial

  const handleVerDetalle = (sesion) => {
    setSesionSeleccionada(sesion);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Desde</label>
            <input 
                type="date" 
                value={filtros.desde}
                onChange={(e) => setFiltros({...filtros, desde: e.target.value})}
                className="border rounded-lg px-3 py-2 text-sm"
            />
        </div>
        <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Hasta</label>
            <input 
                type="date" 
                value={filtros.hasta}
                onChange={(e) => setFiltros({...filtros, hasta: e.target.value})}
                className="border rounded-lg px-3 py-2 text-sm"
            />
        </div>
        <button 
            onClick={fetchHistorial}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
            Filtrar
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="font-semibold py-3 px-2">Estado</th>
                    <th className="font-semibold py-3 px-2">Fecha Apertura</th>
                    <th className="font-semibold py-3 px-2">Sucursal / Caja</th>
                    <th className="font-semibold py-3 px-2">Cajero</th>
                    <th className="font-semibold py-3 px-2 text-right">Saldo Final</th>
                    <th className="font-semibold py-3 px-2 text-right">Diferencia</th>
                    <th className="font-semibold py-3 px-2 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {loading ? (
                    <tr><td colSpan="7" className="text-center py-10 text-gray-400">Cargando historial...</td></tr>
                ) : sesiones.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-10 text-gray-400">No se encontraron sesiones en este rango.</td></tr>
                ) : (
                    sesiones.map((s) => (
                        <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-2">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    s.estado === 'abierta' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {s.estado}
                                </span>
                            </td>
                            <td className="py-3 px-2 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400"/>
                                    {new Date(s.fechaApertura).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(s.fechaApertura).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </td>
                            <td className="py-3 px-2 text-gray-600">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-800">{s.depositoNombre || 'General'}</span>
                                    <span className="text-xs text-gray-400">{s.cajaNombre}</span>
                                </div>
                            </td>
                            <td className="py-3 px-2 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                        {s.usuarioNombre?.charAt(0)}
                                    </div>
                                    <span className="truncate max-w-[120px]">{s.usuarioNombre} {s.usuarioApellido}</span>
                                </div>
                            </td>
                            <td className="py-3 px-2 text-right font-mono font-medium text-gray-800">
                                {s.estado === 'cerrada' ? formateoMoneda.format(s.montoFinalReal || 0) : '-'}
                            </td>
                            <td className="py-3 px-2 text-right font-mono">
                                {s.estado === 'cerrada' && (
                                    <span className={s.diferencia < 0 ? 'text-red-500 font-bold' : s.diferencia > 0 ? 'text-emerald-500 font-bold' : 'text-gray-400'}>
                                        {s.diferencia > 0 ? '+' : ''}{formateoMoneda.format(s.diferencia || 0)}
                                    </span>
                                )}
                            </td>
                            <td className="py-3 px-2 text-center">
                                <button 
                                    onClick={() => handleVerDetalle(s)}
                                    className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                                    title="Ver Detalle"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* Modal Detalle */}
      {sesionSeleccionada && (
        <DetalleSesionCaja 
            sessionId={sesionSeleccionada.id} 
            onClose={() => setSesionSeleccionada(null)} 
        />
      )}
    </div>
  );
}
