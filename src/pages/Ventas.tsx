
import { Link } from 'react-router-dom';
import { useInventario } from '../hooks/useInventario';
import { useEffect, useRef, useState } from 'react';
import { useVentas } from '../hooks/useVentas';
import Swal from 'sweetalert2';


export const Ventas = () => {
  const buscadorRef = useRef<HTMLDivElement>(null);
  const { productos } = useInventario();
  const [showModalPago, setShowModalPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");
  const [pagaCon, setPagaCon] = useState(0);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const { 
    carrito,
    setCarrito, 
    agregarAlCarrito,  
    actualizarCantidad,
    totalVenta,
    eliminarDelCarrito, 
    
  } = useVentas();
  const totalBruto = totalVenta; 
  const neto = Math.round(totalBruto / 1.19);
  const iva = totalBruto - neto;
  useEffect(() => {
    const handleClickAfuera = (event: MouseEvent) => {
      if (buscadorRef.current && !buscadorRef.current.contains(event.target as Node)){
        setMostrarSugerencias(false);
      }
    }
    document.addEventListener("mousedown", handleClickAfuera);
    return () => document.removeEventListener("mousedown", handleClickAfuera);
  }, []);
  
  

  const sugerencias = busqueda.trim() === '' 
    ? [] 
    : productos.filter(p => 
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.id.toString().includes(busqueda) // Convertimos el ID a string para buscar
      ).slice(0, 5);
  
  const confirmarVentaFinal = async () => {
    if (!metodoPago) return;

    try {
      Swal.fire({
        title: 'Procesando...',
        text: metodoPago === 'tarjeta' ? 'Siga las instrucciones en la maquinita' : 'Registrando venta',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      // --- PASO 1: Si es tarjeta, hablar con el terminal Getnet ---
      if (metodoPago === 'tarjeta') {
        const resPago = await fetch("http://localhost:8080/api/pagos/cobrar", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monto: Math.round(totalVenta) }) // Getnet suele usar enteros
        });

        const resultadoPago = await resPago.json();

        if (!resPago.ok) {
          throw new Error(resultadoPago.message || "Pago rechazado por el terminal");
        }
      }

      // --- PASO 2: Si el pago fue OK (o es efectivo), descontamos el stock ---
      const promesasStock = carrito.map(p => 
        fetch(`http://localhost:8080/api/productos/${p.id}/descontar?cantidad=${p.cantidadSeleccionada}`, {
          method: 'PUT'
        })
      );

      const resultadosStock = await Promise.all(promesasStock);
      
      if (resultadosStock.some(r => !r.ok)) {
        throw new Error("Error crítico: El pago pasó pero no pudimos actualizar el stock.");
      }

      // --- PASO 3: Finalizar ---
      Swal.fire({
        title: '¡Venta Completada!',
        text: `Transacción finalizada con éxito vía ${metodoPago}`,
        icon: 'success',
        timer: 3000
      });

      setCarrito([]);
      setShowModalPago(false);
      setMetodoPago("");

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      Swal.fire('Venta Cancelada', msg, 'error');
    }
  };
  return (
    
    <div className='min-h-screen bg-gray-50 flex flex-col items-center p-10 relative'>
      <Link to="/" className='absolute top-10 left-10'>
        <button className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2'>
          
          <span>←</span> Volver al home
        </button>
      </Link>
      <h1 className='text-4xl font-black text-gray-800 mb-8 tracking-tight'>
          Ventas
      </h1>

      {/**DIV DEL BUSCADOR CON SUGERENCIAS... */}
      <div ref={buscadorRef} className='w-full max-w-4xl mb-6 relative'>
        <input 
          type="text"
          placeholder='Buscar producto por nombre o ID...'
          className='w-full p-4 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all'
          value={busqueda}
          onFocus={()=> setMostrarSugerencias(true)}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setMostrarSugerencias(true);}}
        />
        {mostrarSugerencias && sugerencias.length > 0 && (
          <ul className='absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-xl shadow-2xl overflow-hidden'>
            {sugerencias.map(p => (

              <li 
                key={p.id}
                onClick={() => {
                  agregarAlCarrito(p);
                  setMostrarSugerencias(false);
                  setBusqueda('')
                }}
                className='p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-none'
              >
                <div>
                  <span className='font-bold text-blue-600'>#{p.id}</span>
                  <span className='ml-3 text-gray-700'>{p.descripcion}</span>
                </div>

                <span className='text-xs bg-gray-100 px-2 py-1 rounded text-gray-500'>Stock: {p.stock}</span>
              </li>

            ))}
          </ul>
        )}
      </div>
      
      
        
          
          
        
        {/**DIV DE LA TABLA DE PRODUCTOS */}
      <div className='flex flex-col lg:flex-row gap-8 items-start'>
          
          
        {/**DIV lista   */}
        <div className="flex-1 w-full overflow-hidden rounded-lg shadow-md border border-gray-200 bg-white">
          <h2 className='text-2xl font-semibold text-gray-700 p-4 border-b'>
            Detalle de la Venta
          </h2>
          <table className='w-full table-auto md:table-fixed'>
            <thead className='bg-gray-200 border-b-2 border-gray-300'>
              <tr>
                <th className='px-6 py-3 text-gray-900 font-bold uppercase text-xs text-center w-2/5'>Descripcion</th>
                <th className='px-6 py-3 text-gray-900 font-bold uppercase text-xs text-center'>Precio</th>
                <th className='px-6 py-3 text-gray-900 font-bold uppercase text-xs text-center'>Cantidad</th>
                <th className='px-6 py-3 text-gray-900 font-bold uppercase text-xs text-center'>Subtotal</th>
                <th className='px-6 py-3 w-16'></th>{/**  Columna pequeña para el botón eliminar */}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {carrito.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                  <td className='px-6 py-4 text-gray-800 italic text-center'>{producto.descripcion}</td>
                  <td className='px-6 py-4 text-gray-800 font-medium text-center'>${producto.precio}</td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center justify-center gap-2'>
                      <button 
                        className='bg-blue-600 text-white w-7 h-7 rounded hover:bg-blue-800 font-bold'
                        onClick={() => actualizarCantidad(producto.id, -1)}
                      >-</button>
                      <span className='w-5 text-center font-bold'>{producto.cantidadSeleccionada}</span>
                      <button 
                        className='bg-blue-600 text-white w-7 h-7 rounded hover:bg-blue-800  font-bold'
                        onClick={() => actualizarCantidad(producto.id, 1)}
                      >+</button>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-gray-900 font-bold text-center'>
                    ${producto.precio * producto.cantidadSeleccionada}
                  </td>
                  <td className='px-4 py-4 text-center'>
                    <button 
                      onClick={() => eliminarDelCarrito(producto.id)}
                      className='text-red-400 hover:text-red-600 transition-colors'
                      title="Quitar producto"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {carrito.length === 0 && (
            <div className='p-10 text-center text-gray-400 italic'>
              No hay productos seleccionados
            </div>
          )}
        </div>
        {/**DIV lprecio  */}
        <div className='w-full lg:w-80 bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-600 flex flex-col gap-4'>
          <h2 className='text-gray-500 uppercase text-xs font-bold tracking-widest text-center'>Resumen de Venta</h2>
          
          <div className='flex justify-between items-center pt-2 border-b pb-4'>
            <span className='text-xl font-bold text-gray-800'>Total a Pagar</span>
            <span className='text-3xl font-black text-green-600'>${totalBruto}</span>
          </div>

          <div className='space-y-2 text-sm text-gray-500 italic'>
            <div className='flex justify-between'>
              <span>Neto:</span>
              <span>${neto}</span>
            </div>
            <div className='flex justify-between'>
              <span>IVA (19%):</span>
              <span>${iva}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowModalPago(true)}
            disabled={carrito.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg mt-2 uppercase tracking-wider"
          >
            Finalizar Compra
          </button>
        </div>



      </div>
        {showModalPago && (
        /* Capa de fondo oscura (Overlay) */
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
          
          {/* Contenedor del Modal */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Finalizar Venta
              </h3>
              <p className="text-center text-gray-600 mb-6">
                Total a pagar: <span className="font-bold text-blue-600 text-xl">${totalVenta}</span>
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Opción Efectivo */}
                <button 
                  onClick={() => setMetodoPago('efectivo')}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${metodoPago === 'efectivo' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400'}`}
                >
                  <span className="text-3xl mb-2">💵</span>
                  <span className="font-semibold text-gray-700">Efectivo</span>
                </button>

                {/* Opción Tarjeta */}
                <button 
                  onClick={() => setMetodoPago('tarjeta')}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${metodoPago === 'tarjeta' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
                >
                  <span className="text-3xl mb-2">💳</span>
                  <span className="font-semibold text-gray-700">Tarjeta</span>
                </button>
              </div>
              {metodoPago === 'efectivo' && (
                <div className="mb-6 animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paga con:
                  </label>
                  <input 
                    type="number"
                    placeholder="Ej: 10000"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    onChange={(e) => setPagaCon(Number(e.target.value))}
                  />
                  {pagaCon > (totalVenta * 1.19) && (
                    <p className="mt-2 text-lg font-bold text-green-600">
                      Vuelto: ${Math.round(pagaCon - (totalVenta ))}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmarVentaFinal}
                  disabled={!metodoPago}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                >
                  Confirmar Pago
                </button>
                <button 
                  onClick={() => { setShowModalPago(false); setMetodoPago(""); }}
                  className="w-full text-gray-500 font-medium py-2 hover:underline"
                >
                  Cancelar y volver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    
  )
}
