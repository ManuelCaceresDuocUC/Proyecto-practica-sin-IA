import React from 'react';
import type { ClienteInfo } from '../../../types/ventas.types'; // Ajusta la ruta a tus types

interface Props {
  show: boolean;
  onClose: () => void;
  terminoBusquedaCliente: string;
  setTerminoBusquedaCliente: (val: string) => void;
  cargandoConsultaCliente: boolean;
  handleBuscarClienteConsulta: (e: React.FormEvent) => void;
  clienteConsultado: ClienteInfo | null;
  setClienteConsultado: (cliente: ClienteInfo | null) => void;
  montoAbono: string;
  setMontoAbono: (val: string) => void;
  handleAbonarDeuda: (e: React.FormEvent) => void;
}

export const ModalConsultaCliente = ({ 
  show, onClose, terminoBusquedaCliente, setTerminoBusquedaCliente, cargandoConsultaCliente, 
  handleBuscarClienteConsulta, clienteConsultado, setClienteConsultado, montoAbono, setMontoAbono, handleAbonarDeuda 
}: Props) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className='w-full max-w-lg bg-white p-6 rounded shadow-lg border border-slate-200 text-sm'>
        <h2 className="text-lg font-semibold mb-4 text-slate-900 border-b border-slate-100 pb-2 flex justify-between items-center">
          <span>Consultar y Abonar Cliente</span>
          <button onClick={() => { onClose(); setClienteConsultado(null); setTerminoBusquedaCliente(''); }} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </h2>

        <form onSubmit={handleBuscarClienteConsulta} className="flex gap-2 mb-6">
          <input 
            type="text" placeholder="Ingrese RUT o ID de cliente..."
            className="flex-1 p-2.5 rounded border border-slate-300 outline-none focus:border-slate-500 font-mono text-sm"
            value={terminoBusquedaCliente} onChange={(e) => setTerminoBusquedaCliente(e.target.value)}
          />
          <button type="submit" disabled={cargandoConsultaCliente} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded font-medium text-xs uppercase tracking-wider">
            {cargandoConsultaCliente ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {clienteConsultado && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{clienteConsultado.nombre}</h3>
                  <p className="text-xs text-slate-500 font-mono">RUT: {clienteConsultado.rut} | ID: {clienteConsultado.id}</p>
                </div>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded font-semibold">Cliente Registrado</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200 text-center font-mono">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="block text-[10px] font-sans font-semibold uppercase text-slate-500">Límite</span>
                  <span className="font-bold text-slate-800">${clienteConsultado.limiteCredito.toLocaleString()}</span>
                </div>
                <div className="bg-red-50 p-2 rounded border border-red-200">
                  <span className="block text-[10px] font-sans font-semibold uppercase text-red-600">Deuda Actual</span>
                  <span className="font-bold text-red-700">${clienteConsultado.deudaActual.toLocaleString()}</span>
                </div>
                <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                  <span className="block text-[10px] font-sans font-semibold uppercase text-emerald-600">Disponible</span>
                  <span className="font-bold text-emerald-700">${(clienteConsultado.limiteCredito - clienteConsultado.deudaActual).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {clienteConsultado.deudaActual > 0 ? (
              <form onSubmit={handleAbonarDeuda} className="space-y-3 bg-white p-4 rounded border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wide">Registrar Abono en Efectivo</h4>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Monto a Abonar ($)</label>
                  <input 
                    type="number" required min="1" max={clienteConsultado.deudaActual} placeholder="Monto a abonar..."
                    className="w-full p-2.5 rounded border border-slate-300 focus:border-slate-500 font-mono outline-none text-base"
                    value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 rounded text-xs uppercase tracking-wider transition-colors">
                  Procesar Abono y Entregar Comprobante
                </button>
              </form>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center rounded text-xs font-semibold">
                El cliente se encuentra al día y no presenta deudas pendientes.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};