export default function MetodoDePago({ metodoPago, setMetodoPago, pagaCon, handlePagaCon, vueltoCalculo, comprobantePago, setComprobantePago }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg mb-2">Método de Pago</h3>
      <div className="flex gap-3 mb-4">
        {['efectivo', 'transferencia', 'cheque', 'deposito'].map((metodo) => (
          <button
            key={metodo}
            onClick={() => setMetodoPago(metodo)}
            className={`px-4 py-2 rounded-lg capitalize ${
              metodoPago === metodo 
                ? 'bg-primary-100 text-white' 
                : 'bg-gray-100'
            }`}
          >
            {metodo}
          </button>
        ))}
      </div>

      {/* Renderizar campos según método de pago */}
      {metodoPago === 'efectivo' && (
        <EfectivoPago pagaCon={pagaCon} handlePagaCon={handlePagaCon} vueltoCalculo={vueltoCalculo} />
      )}
      {['transferencia', 'deposito'].includes(metodoPago) && (
        <TransferenciaPago setComprobantePago={setComprobantePago} />
      )}
      {metodoPago === 'cheque' && <ChequePago />}
    </div>
  );
} 