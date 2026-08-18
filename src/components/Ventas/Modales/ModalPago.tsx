
interface Props {
  show: boolean;
  onClose: () => void;
  totalBruto: number;
  metodoPago: "EFECTIVO" | "TARJETA" | "CREDITO" | "";
  setMetodoPago: (metodo: "EFECTIVO" | "TARJETA" | "CREDITO" | "") => void;
  proveedorTarjeta: "GETNET" | "MERCADOPAGO" | "TRANSBANK" | null;
  setProveedorTarjeta: (proveedor: "GETNET" | "MERCADOPAGO" | "TRANSBANK" | null) => void;
  clienteId: number | null;
  setClienteId: (id: number | null) => void;
  pagaCon: number;
  setPagaCon: (monto: number) => void;
  onAbrirNuevoCliente: () => void;
  confirmarVentaFinal: () => void;
}

export const ModalPago = ({
  show, onClose, totalBruto, metodoPago, setMetodoPago, proveedorTarjeta, setProveedorTarjeta,
  clienteId, setClienteId, pagaCon, setPagaCon, onAbrirNuevoCliente, confirmarVentaFinal
}: Props) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className='w-full max-w-md bg-white p-6 rounded shadow-lg border border-slate-200 text-sm'>
        <h2 className='text-lg font-semibold mb-4 text-slate-900 border-b border-slate-100 pb-2 text-center'>Procesamiento de Pago</h2>
        <div className="text-center mb-6 bg-slate-50 p-4 rounded border border-slate-200">
          <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Monto Total de Orden</span>
          <span className="text-3xl font-mono font-bold text-slate-900">${totalBruto.toLocaleString()}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button 
            onClick={() => { setMetodoPago('EFECTIVO'); setProveedorTarjeta(null); setClienteId(null); }}
            className={`py-2.5 rounded border font-medium text-xs uppercase tracking-wider transition-all ${metodoPago === 'EFECTIVO' ? 'border-slate-800 bg-slate-800 text-white shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          > Efectivo </button>
          <button 
            onClick={() => { setMetodoPago('TARJETA'); setClienteId(null); }}
            className={`py-2.5 rounded border font-medium text-xs uppercase tracking-wider transition-all ${metodoPago === 'TARJETA' ? 'border-slate-800 bg-slate-800 text-white shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          > Tarjeta </button>
          <button 
            onClick={() => { setMetodoPago('CREDITO'); setProveedorTarjeta(null); }}
            className={`py-2.5 rounded border font-medium text-xs uppercase tracking-wider transition-all ${metodoPago === 'CREDITO' ? 'border-slate-800 bg-slate-800 text-white shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          > Crédito / Vale </button>
        </div>

        {metodoPago === 'TARJETA' && (
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Seleccione Terminal de Pago:</label>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setProveedorTarjeta('GETNET')} className={`py-2 rounded border text-xs font-medium transition-all ${proveedorTarjeta === 'GETNET' ? 'bg-slate-100 border-slate-500 text-slate-900 font-semibold' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>Getnet</button>
              <button onClick={() => setProveedorTarjeta('MERCADOPAGO')} className={`py-2 rounded border text-xs font-medium transition-all ${proveedorTarjeta === 'MERCADOPAGO' ? 'bg-slate-100 border-slate-500 text-slate-900 font-semibold' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>Mercado Pago</button>
              <button onClick={() => setProveedorTarjeta('TRANSBANK')} className={`py-2 rounded border text-xs font-medium transition-all ${proveedorTarjeta === 'TRANSBANK' ? 'bg-slate-100 border-slate-500 text-slate-900 font-semibold' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>Transbank</button>
            </div>
          </div>
        )}

        {metodoPago === 'CREDITO' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">ID de Cliente</label>
              <button type="button" onClick={onAbrirNuevoCliente} className="text-xs font-semibold text-slate-800 hover:text-black underline">+ Crear Nuevo Cliente</button>
            </div>
            <input 
              type="number" placeholder="Ingrese ID del Cliente"
              className="w-full p-2.5 rounded border border-slate-300 focus:border-slate-500 outline-none text-sm font-mono text-slate-800"
              value={clienteId || ''} onChange={(e) => setClienteId(Number(e.target.value) || null)}
            />
          </div>
        )}

        {metodoPago === 'EFECTIVO' && (
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Monto Recibido</label>
            <input 
              type="number" placeholder="0.00"
              className="w-full p-2.5 rounded border border-slate-300 focus:border-slate-500 outline-none text-base font-mono text-slate-800"
              value={pagaCon || ''} onChange={(e) => setPagaCon(Number(e.target.value))}
            />
            {pagaCon >= totalBruto && (
              <div className="mt-3 p-3 bg-slate-100 rounded border border-slate-200 text-center flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Cambio:</span>
                <span className="text-lg font-mono font-bold text-slate-900">${(pagaCon - totalBruto).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={confirmarVentaFinal}
          disabled={!metodoPago || (metodoPago === 'EFECTIVO' && pagaCon < totalBruto) || (metodoPago === 'CREDITO' && !clienteId) || (metodoPago === 'TARJETA' && !proveedorTarjeta)}
          className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium py-2.5 rounded shadow-sm transition-colors text-sm uppercase tracking-wider mb-2"
        > Confirmar Transacción </button>
        <button onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded transition-colors text-xs uppercase tracking-wider">
          Cancelar
        </button>
      </div>
    </div>
  );
};