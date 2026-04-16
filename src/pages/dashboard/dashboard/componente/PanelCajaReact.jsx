import React, { useState } from 'react';
import { useCaja } from '../../../../hook/useCaja';
import { formateoMoneda } from '../../../../utils/formateoMoneda';
import Button from '../../../../components/atomos/Button';
import Input from '../../../../components/atomos/Input';
import { Card } from '../../../../components/organismos/Card';

export default function PanelCajaReact() {
  const { caja, loading, abrirCaja, cerrarCaja, registrarMovimiento } = useCaja();
  const [showModalApertura, setShowModalApertura] = useState(false);
  const [showModalCierre, setShowModalCierre] = useState(false);
  const [montoInput, setMontoInput] = useState('');
  
  // Estado para movimiento manual
  const [showModalMovimiento, setShowModalMovimiento] = useState(false);
  const [tipoMov, setTipoMov] = useState('egreso');
  const [bultoMov, setBultoMov] = useState(''); 
  const [descMov, setDescMov] = useState('');

  // Si está cargando, mostramos un placeholder sutil EN LUGAR de ocultar todo, 
  // o simplemente retornamos null para que el esqueleto de Astro se vea (si usamos fallback).
  // Pero aquí queremos que React tome el control suavemente.
  // Sin embargo, para evitar el salto, renderizaremos la estructura vacía o con datos previos si existen.
  
  const saldoDisplay = caja.sesion?.saldoActual !== undefined 
    ? formateoMoneda.format(caja.sesion.saldoActual) 
    : (loading ? '...' : '$0.00');

  const handleAbrir = async () => {
    const exito = await abrirCaja(Number(montoInput));
    if (exito) {
      setShowModalApertura(false);
      setMontoInput('');
    }
  };

  const handleCerrar = async () => {
    const resumen = await cerrarCaja(Number(montoInput));
    if (resumen) {
      setShowModalCierre(false);
      setMontoInput('');
    }
  };

  const handleMovimiento = async () => {
    const exito = await registrarMovimiento(tipoMov, Number(bultoMov), descMov);
    if (exito) {
      setShowModalMovimiento(false);
      setBultoMov('');
      setDescMov('');
    }
  };

  // Renderizado para Caja Cerrada
  if (caja.estado === 'cerrada' && !loading) {
    return (
      <Card className="h-full w-full flex flex-col justify-center">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-bold text-gray-700">🔒 Caja Cerrada</h3>
            <p className="text-xs text-gray-500">Abre caja para comenzar.</p>
          </div>
          <Button 
            onClick={() => setShowModalApertura(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Abrir
          </Button>
        </div>

        {/* Modal Apertura */}
        {showModalApertura && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
              <h4 className="font-bold text-lg mb-4">Abrir Caja</h4>
              <label className="block text-sm mb-1 text-gray-600">Monto Inicial</label>
              <input 
                type="number" 
                value={montoInput}
                onChange={(e) => setMontoInput(e.target.value)}
                autoFocus
                className="w-full border rounded p-2 mb-4 text-xl font-mono"
                placeholder="0.00"
              />
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setShowModalApertura(false)} className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded">Cancelar</Button>
                <Button onClick={handleAbrir} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Confirmar</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Renderizado para Caja Abierta (o Loading inicial, mostrando estructura base)
  return (
    <Card className="h-full w-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-emerald-800 flex items-center gap-2">
            {!loading && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
            {loading ? 'Cargando...' : 'Caja Abierta'}
          </h3>
          <p className="text-xs text-gray-500 truncate max-w-[180px]">
            {caja.sesion?.deposito?.nombre || 'General'} | {caja.sesion?.caja?.nombre || 'Caja'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-800 font-mono">
           {saldoDisplay}
          </p>
          <p className="text-xs text-gray-400">En Caja</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
         <div className="bg-gray-50 p-1.5 rounded text-center">
            <span className="text-gray-500 block text-[10px] uppercase">Ingresos</span>
            <span className="text-green-600 font-semibold text-xs md:text-sm">
                {caja.sesion?.totalIngresos !== undefined ? formateoMoneda.format(caja.sesion.totalIngresos) : '-'}
            </span>
         </div>
         <div className="bg-gray-50 p-1.5 rounded text-center">
            <span className="text-gray-500 block text-[10px] uppercase">Egresos</span>
            <span className="text-red-600 font-semibold text-xs md:text-sm">
                {caja.sesion?.totalEgresos !== undefined ? formateoMoneda.format(caja.sesion.totalEgresos) : '-'}
            </span>
         </div>
      </div>

      {/* Botones de acción, deshabilitados si está cargando */}
      <div className="flex w-full justify-stretch items-center gap-2 mt-auto">
        <Button 
        className='w-full'
           disabled={loading}
           onClick={() => { setTipoMov('egreso'); setShowModalMovimiento(true); }}
         variant='grisOscuro'
        >
          
          Retiro
        </Button>
        <Button 
        className='w-full'
           disabled={loading}
           onClick={() => { setTipoMov('ingreso'); setShowModalMovimiento(true); }}
         variant='green'
        >
          Ingreso
        </Button>
        <Button
        className='w-full'
        variant='cancel'
           disabled={loading}
           onClick={() => setShowModalCierre(true)}
         
        >
          Cerrar
        </Button>
      </div>

      {/* Modales (Mismo código) */}
      {showModalMovimiento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white p-5 rounded-lg w-80 shadow-xl">
             <h4 className="font-bold mb-3 capitalize">Registrar {tipoMov}</h4>
             <Input 
                type="number" 
                placeholder="Monto"
                value={bultoMov}
                onChange={e => setBultoMov(e.target.value)}
                autoFocus
                className="w-full border rounded p-2 mb-2"
             />
             <Input 
                type="text" 
                placeholder="Descripción"
                value={descMov}
                onChange={e => setDescMov(e.target.value)}
                className="w-full border rounded p-2 mb-4 text-sm"
             />
             <div className="flex gap-2 justify-end">
                <Button variant='cancel' onClick={() => setShowModalMovimiento(false)} >Cancelar</Button>
                <Button variant='primary' onClick={handleMovimiento} >Guardar</Button>
             </div>
          </div>
        </div>
      )}

      {showModalCierre && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
             <h4 className="font-bold text-lg mb-2">Cerrar Caja</h4>
             <p className="text-sm text-gray-600 mb-4">Ingresa el total en efectivo real.</p>
             <input 
                type="number" 
                value={montoInput}
                onChange={(e) => setMontoInput(e.target.value)}
                autoFocus
                className="w-full border rounded p-2 mb-4 text-2xl font-mono text-center"
                placeholder="0.00"
             />
             <div className="flex gap-2 justify-end mt-2">
                <button onClick={() => setShowModalCierre(false)} className="px-4 py-2 border rounded hover:bg-gray-50 text-sm">Cancelar</button>
                <button onClick={handleCerrar} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium text-sm">Cerrar Turno</button>
             </div>
          </div>
        </div>
      )}

    </Card>
  );
}
