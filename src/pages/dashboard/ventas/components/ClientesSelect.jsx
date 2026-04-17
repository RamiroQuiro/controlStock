import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, Loader2, CreditCard } from 'lucide-react';
import { formateoMoneda } from '../../../../utils/formateoMoneda';

export default function ClientesSelect({ cliente, setCliente, empresaId }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/clientes/buscarCliente?search=${query}`, {
        headers: { 'xx-empresa-id': String(empresaId) }
      });
      const data = await response.json();
      if (data.status === 200) {
        setResults(data.data || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error buscando clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) handleSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const selectCliente = (c) => {
    setCliente(c);
    setSearch('');
    setShowResults(false);
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-primary-textoTitle/60 uppercase ml-1">
          Cliente
        </label>
        
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-100 duration-200">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
          </div>
          
          <input
            type="text"
            className="w-full bg-white border-2 border-gray-100 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:border-primary-100 focus:ring-4 focus:ring-primary-100/10 outline-none transition-all duration-200"
            placeholder="Buscar por Nombre o DNI..."
            value={search || (cliente?.nombre || '')}
            onChange={(e) => {
                setSearch(e.target.value);
                if (!showResults) setShowResults(true);
            }}
            onFocus={() => {
                if (results.length > 0) setShowResults(true);
            }}
          />

          {cliente && cliente.nombre !== 'Consumidor Final' && (
            <button 
              onClick={() => {
                  setSearch('');
                  setResults([]);
                  setCliente({ nombre: 'Consumidor Final', id: '1' }); // Volver al default si se limpia
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Resultados del buscador */}
      {showResults && results.length > 0 && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[300px] overflow-y-auto p-1">
            {results.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCliente(c)}
                className="w-full flex items-center justify-between p-3 hover:bg-primary-50 rounded-lg group transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-100 font-bold group-hover:bg-white duration-200">
                    {c.nombre.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{c.nombre}</h4>
                    <p className="text-xs text-gray-500">DNI: {c.dni || 'S/D'}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  {c.saldoPendiente > 0 && (
                    <div className="flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded-md">
                      <CreditCard className="w-3 h-3" />
                      {formateoMoneda.format(c.saldoPendiente)}
                    </div>
                  )}
                  {c.limiteCredito > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1">Límite: {formateoMoneda.format(c.limiteCredito)}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No se encontraron resultados */}
      {showResults && search.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white p-4 rounded-xl shadow-2xl border border-gray-100 text-center animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-gray-500">No se encontraron clientes con "{search}"</p>
        </div>
      )}
    </div>
  );
}
