import { useState } from 'react';
import { apiFetch } from '../helpers/apiFetch';
import Swal from 'sweetalert2';
import type { ClienteInfo } from '../types/ventas.types';

export const useClientesPos = (usuarioId: string, setClienteId: (id: number) => void) => {
  const [showModalNuevoCliente, setShowModalNuevoCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '', rut: '', telefono: '', email: '', limiteCredito: 0
  });

  const [showModalConsultaCliente, setShowModalConsultaCliente] = useState(false);
  const [terminoBusquedaCliente, setTerminoBusquedaCliente] = useState('');
  const [clienteConsultado, setClienteConsultado] = useState<ClienteInfo | null>(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [cargandoConsultaCliente, setCargandoConsultaCliente] = useState(false);

  const handleCrearCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const empresaIdLogueada = localStorage.getItem('empresaId') || "1";
      const response = await apiFetch(`${import.meta.env.VITE_API_URL}/clientes`, {
        method: 'POST',
        body: JSON.stringify({ ...nuevoCliente, empresaId: Number(empresaIdLogueada) })
      });

      if (!response.ok) throw new Error(await response.text() || "No se pudo registrar el cliente");

      const clienteCreado = await response.json();
      setClienteId(clienteCreado.id); // Aquí usamos la prop de useVentas
      
      Swal.fire('Cliente Registrado', `Cliente ${clienteCreado.nombre} creado con éxito (ID: ${clienteCreado.id}).`, 'success');
      setNuevoCliente({ nombre: '', rut: '', telefono: '', email: '', limiteCredito: 0 });
      setShowModalNuevoCliente(false);
    } catch (error) {
      Swal.fire('Error', error instanceof Error ? error.message : "Error al registrar cliente", 'error');
    }
  };

  const handleBuscarClienteConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminoBusquedaCliente.trim()) return;

    setCargandoConsultaCliente(true);
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/clientes/buscar?termino=${encodeURIComponent(terminoBusquedaCliente.trim())}`);
      if (!res.ok) throw new Error("Cliente no encontrado");
      
      const data = await res.json();
      setClienteConsultado(data);
    } catch {
      Swal.fire('No encontrado', 'No se encontró ningún cliente vinculado al RUT o ID ingresado.', 'warning');
      setClienteConsultado(null);
    } finally {
      setCargandoConsultaCliente(false);
    }
  };

  const handleAbonarDeuda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteConsultado || !montoAbono) return;

    const monto = Number(montoAbono);
    if (monto <= 0) return;

    if (monto > clienteConsultado.deudaActual) {
      Swal.fire('Monto Excesivo', 'El abono no puede superar la deuda actual del cliente.', 'warning');
      return;
    }

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/clientes/${clienteConsultado.id}/abonar`, {
        method: 'POST',
        body: JSON.stringify({ monto, usuarioId: Number(usuarioId) })
      });

      if (!res.ok) throw new Error(await res.text() || "Fallo al procesar el abono");

      const clienteActualizado = await res.json();

      Swal.fire({
        title: '¡Abono Exitoso!',
        html: `<div style="text-align: left; font-size: 0.9rem;">
            <p style="margin-bottom: 8px;">Se registraron <b>$${monto.toLocaleString()}</b> abonados en caja a nombre de <b>${clienteConsultado.nombre}</b>.</p>
            <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; padding: 10px; border-radius: 6px; margin-top: 10px;">
              <b>⚠️ REQUERIMIENTO OPERATIVO CRÍTICO:</b><br/>
              Recuerda buscar el <b>Vale de Crédito físico firmado</b> original y entregar o romper el documento por este valor para evitar doble cobro a la institución.
            </div>
          </div>`,
        icon: 'success'
      });

      setClienteConsultado(clienteActualizado);
      setMontoAbono('');
    } catch (error) {
      Swal.fire('Error al Abonar', error instanceof Error ? error.message : 'Error desconocido', 'error');
    }
  };

  return {
    showModalNuevoCliente, setShowModalNuevoCliente, nuevoCliente, setNuevoCliente,
    showModalConsultaCliente, setShowModalConsultaCliente, terminoBusquedaCliente, setTerminoBusquedaCliente,
    clienteConsultado, setClienteConsultado, montoAbono, setMontoAbono, cargandoConsultaCliente,
    handleCrearCliente, handleBuscarClienteConsulta, handleAbonarDeuda
  };
};