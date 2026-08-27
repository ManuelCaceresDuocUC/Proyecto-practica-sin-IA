import { useState } from 'react';
import Swal from 'sweetalert2';
import { apiFetch } from '../helpers/apiFetch';
import type { ClienteInfo } from '../types/admin.types';

export const useClientes = (API_URL: string, empresaId: string) => {
  const [mostrarModalClientes, setMostrarModalClientes] = useState(false);
  const [clientes, setClientes] = useState<ClienteInfo[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [cargandoCierreMes, setCargandoCierreMes] = useState(false);

  const abrirModalClientes = async () => {
    setMostrarModalClientes(true);
    setCargandoClientes(true);
    setBusquedaCliente('');
    try {
      const response = await apiFetch(`${API_URL}/clientes?empresaId=${empresaId}`);
      if (response.ok) {
        setClientes(await response.json());
      } else {
        throw new Error('No se pudo obtener la lista de clientes');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo cargar el directorio de clientes.', 'error');
      setMostrarModalClientes(false);
    } finally {
      setCargandoClientes(false);
    }
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) || 
    c.rut.toLowerCase().includes(busquedaCliente.toLowerCase())
  );

  const handleCierreMesCreditos = async () => {
    const confirmacion = await Swal.fire({
      title: '¿Generar Cierre de Créditos?',
      text: 'Se descargará un archivo Excel con las deudas y luego se reiniciarán los créditos a $0. Esta acción no se puede deshacer.',
      icon: 'warning', // Cambié el icono a warning porque es una acción destructiva
      showCancelButton: true,
      confirmButtonColor: '#059669', 
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, generar y reiniciar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    setCargandoCierreMes(true);
    try {
      // 1. Obtener la lista actual de clientes
      const response = await apiFetch(`${API_URL}/clientes?empresaId=${empresaId}`);
      if (!response.ok) throw new Error('Error al obtener clientes');

      const data: ClienteInfo[] = await response.json();
      const deudores = data.filter(cliente => cliente.deudaActual > 0);

      if (deudores.length === 0) {
        Swal.fire('Información', 'No hay clientes con deudas pendientes.', 'info');
        return;
      }

      // 2. Generar y descargar el CSV
      const cabeceras = ['ID Cliente', 'Nombre o Razón Social', 'RUT', 'Teléfono', 'Límite de Crédito', 'Deuda Actual Pendiente'];
      let contenidoCSV = cabeceras.join(';') + '\n';

      deudores.forEach(cliente => {
        const fila = [
          cliente.id,
          `"${cliente.nombre}"`,
          `"${cliente.rut}"`,
          `"${cliente.telefono || 'No registrado'}"`,
          cliente.limiteCredito,
          cliente.deudaActual
        ];
        contenidoCSV += fila.join(';') + '\n';
      });

      const blob = new Blob(['\uFEFF' + contenidoCSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      const fechaActual = new Date().toISOString().split('T')[0];
      
      enlace.href = url;
      enlace.setAttribute('download', `Cierre_Creditos_${fechaActual}.csv`);
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);

      // 3. ✨ LLAMAR AL BACKEND PARA REINICIAR LAS DEUDAS ✨
      const resetResponse = await apiFetch(`${API_URL}/clientes/reiniciar-creditos?empresaId=${empresaId}`, {
        method: 'POST',
      });

      if (!resetResponse.ok) {
        throw new Error('El reporte se descargó, pero hubo un error al reiniciar las deudas en el servidor.');
      }

      // 4. Actualizar la lista de clientes en la interfaz (volver a cargar el modal)
      await abrirModalClientes();

      Swal.fire('Éxito', 'El reporte se generó y las deudas fueron reiniciadas a $0.', 'success');
      
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error instanceof Error ? error.message : 'Hubo un problema al procesar el cierre.', 'error');
    } finally {
      setCargandoCierreMes(false);
    }
  };

  return {
    mostrarModalClientes, setMostrarModalClientes,
    cargandoClientes,
    busquedaCliente, setBusquedaCliente,
    clientesFiltrados,
    cargandoCierreMes,
    abrirModalClientes, handleCierreMesCreditos
  };
};