import React, { useState, useEffect } from 'react';
import { formateoMoneda } from '../../../../utils/formateoMoneda';
import { Users, Store, Wallet } from 'lucide-react';

export default function PanelCajasAdmin({ userRole }) {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);

  if (userRole !== 'admin') return null;

  const fetchResumen = async () => {
    try {
      const res = await fetch('/api/caja/resumen-admin');
      if (res.ok) {
        const data = await res.json();
        setSesiones(data);
      }
    } catch (error) {
      console.error('Error fetching resumen admin:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumen();
    // Refresco cada minuto para el admin
    const interval = setInterval(fetchResumen, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="animate-pulse h-32 bg-gray-50 rounded-xl"></div>;
  if (sesiones.length === 0) return null;

  const totalEmpresa = sesiones.reduce((acc, s) => acc + s.saldoActual, 0);

  return (
    <div className="w-full flex items-center flex-col justify-normal gap-3">
        <div className='items-start  flex w-full justify-between'>
          <div className="flex justify-between items-start flex-col">   
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-primary-100" />
            Supervisión de Cajas Activas
          </h2>
          <p className="text-xs text-gray-500">Estado del efectivo en tiempo real por sucursal</p>
          </div>
      <div className="flex justify-between items-start ">
        <div className="text-right flex flex-col items-end">
          <span className="text-sm text-primary-textoTitle block font-medium uppercase tracking-wider">Total en Empresa</span>
          <span className="text-3xl font-black text-primary-100 font-mono">
            {formateoMoneda.format(totalEmpresa)}
          </span>
          <a href="/dashboard/caja/historial" className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline mt-1 font-medium flex items-center gap-1 transition-colors">
            Ver Historial Completo &rarr;
          </a>
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sesiones.map((s) => (
          <div key={s.sesion.id} className="bg-primary-bg-componentes border border-gray-200 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Store size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{s.deposito?.nombre || 'General'}</h4>
                  <p className="text-[10px] text-gray-400 font-medium uppercase">{s.caja?.nombre}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900 font-mono">
                {formateoMoneda.format(s.saldoActual)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
               <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <Users size={12} />
               </div>
               <span className="text-xs text-gray-600 font-medium">{s.usuario?.nombre}</span>
               <span className="ml-auto text-[10px] text-gray-400">
                  Abrió: {new Date(s.sesion.fechaApertura).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
