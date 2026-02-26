
import { Link } from 'react-router-dom';
import { useInventario } from '../hooks/useInventario';
import { useEffect, useRef, useState } from 'react';
import { useVentas } from '../hooks/useVentas';


export const Ventas = () => {
  const buscadorRef = useRef<HTMLDivElement>(null);
  const { productos } = useInventario();
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const { 
    carrito, 
    agregarAlCarrito,  
    actualizarCantidad, 
    
  } = useVentas();

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
    : productos.filter(
    p => p.descripcion.toLowerCase()
    .includes(busqueda.toLowerCase()) ||
    p.id.includes(busqueda)
  ).slice(0,5)
  

  return (
    //DIV PRINCIPAL
    <div className='min-h-screen bg-gray-50 flex flex-col items-center p-10 relative'>
      <Link to="/" className='absolute top-10 left-10'>
        <button className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2'>
          
          <span>←</span> Volver al home
        </button>
      </Link>
      <h1 className='text-4xl font-black text-gray-800 mb-8 tracking-tight'>
          Ventas
      </h1>

      //DIV DEL BUSCADOR CON SUGERENCIAS...
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
      
      
        
          
          
        
        //DIV DE LA TABLA DE PRODUCTOS
      <div className='flex flex-col lg:flex-row gap-8 items-start'>
          
          
        //DIV INTERIOR TABLA  
        <div className="flex-1 w-full overflow-hidden rounded-lg shadow-md border border-gray-200 bg-white">
            <h2 className='text-2xl font-semibold text-gray-700 mb-4'>
              Detalle de la Venta
            </h2>
            <table className='w-full table-auto md:table-fixed'>
              <thead className='bg-gray-200 border-b-2 border-gray-300'>
                <tr >
                  <th className='px-6 py-3 text-gray-900 font-bold uppercase text-sm tracking-wider'>Descripcion</th>
                  <th className='px-6 py-3 text-gray-900 font-bold uppercase text-sm tracking-wider'>Precio</th>
                  <th className='px-6 py-3 text-gray-900 font-bold uppercase text-sm tracking-wider'>Cantidad</th>
                  <th className='px-6 py-3 text-gray-900 font-bold uppercase text-xs'>Subtotal</th>
                  <th className='px-6 py-3'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                
                {carrito.map((producto)=>(
                  <tr key={producto.id} className="hover:bg-gray-100 transition-colors">
                    <td className='px-6 py-4 text-gray-800 italic'>{producto.descripcion}</td>
                    <td className='px-6 py-4 text-gray-800 font-medium'>{producto.precio}</td>
                    <td className='px-6 py-4 text-gray-800 font-medium'>
                      <button
                      className='bg-gray-200 px-2 rounded hover:bg-gray-300 font-bold' 
                      onClick={() => actualizarCantidad(producto.id, 1)}>
                        +
                      </button>
                      <span>{producto.cantidadSeleccionada}</span>
                      <button
                      className='bg-gray-200 px-2 rounded hover:bg-gray-300 font-bold'
                      onClick={() => actualizarCantidad(producto.id, -1)}>
                        -
                      </button>
                    </td>
                    <td className='px-6 py-4 text-gray-800 font-medium'>{producto.precio*producto.cantidadSeleccionada}</td>
                    
                  </tr>
                ))}
                {sugerencias.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-500">
                    </td>
                  </tr>
                )}
                
                
              </tbody>
            </table>
        </div>




      </div>
    </div>
    
  )
}
