
import {  Link } from 'react-router-dom';
import { useInventario } from '../hooks/useInventario';
import { useState } from 'react';
import Swal from 'sweetalert2';



export const Inventario = () => {

  const { productos, eliminarProducto, agregarProducto } = useInventario();
  const [showModalProducto, setShowModalProducto] = useState(false);

  const [busqueda, setBusqueda] = useState('');


  const productosFiltrados = productos.filter(p => {
    const busquedaMinuscula = busqueda.toLowerCase();
    
    return (
      p.descripcion.toLowerCase().includes(busquedaMinuscula) ||
      p.id.toString().includes(busqueda) // Convertimos el número a string
    );
  });

  const [form, setForm] = useState({
    id: '',
    descripcion: '',
    precio: '',
    stock: '',
    stockCritico: '', // Lo manejamos como string inicialmente para el input
  });

  //manejo del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue

    // si no viene alguno de los input retorna la alerta
    
    if (!form.descripcion || !form.precio|| !form.stock || !form.stockCritico) 
      {return Swal.fire({
                              title: `Faltan datos!!`,
                              text: 'por favor rellena todas las celdas' ,
                              icon: 'warning',
                              timer: 2000,
                              showConfirmButton: true,
                              showCancelButton: false, // Muestra el botón cancelar
                              confirmButtonColor: '#3085d6', // Azul
                              confirmButtonText: 'Aceptar',
                              
                          })}


    // Llamamos a la función del Hook y le entregamos los datos 
    agregarProducto({
      
      descripcion: form.descripcion,
      precio: Number(form.precio),
      stock: Number(form.stock), // Convertimos a número
      stockCritico: Number(form.stockCritico)
    });

    // Limpiamos el formulario
    setForm({ id: '', descripcion: '', precio: '', stock: '',stockCritico: '' });
  };


  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center p-10 relative'>
      <Link to="/" className='absolute top-10 left-10'>
        <button className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2'>
          
          <span>←</span> Volver al home
        </button>
      </Link>

      <h1 className='text-4xl font-black text-gray-800 mb-8 tracking-tight'>
          Inventario
      </h1>


      <div className='w-full max-w-4xl mb-6'>
        <input 
          type="text"
          placeholder='Buscar producto'
          className='w-full p-3 rounded-xl border border-gray-300 shadow-sm focus:ring-blue-500 outline-none'
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
      </div>
      
      
        
          
          
        
        
        <div className='flex flex-col lg:flex-row gap-8 items-start'>
          
          
          
          <div className="flex-1 w-full overflow-hidden rounded-lg shadow-md border border-gray-200 bg-white">
            <h2 className='text-2xl font-semibold text-gray-700 mb-4'>
            Listado de productos
            </h2>
            <table className='w-full table-auto md:table-fixed'>
              <thead className='bg-gray-200 border-b-2 border-gray-300'>
                <tr >
                  <th className='px-6 py-3 text-gray-900 font-bold uppercase text-sm tracking-wider'>Id</th>
                  <th className='px-6 py-3 text-gray-900 font-bold uppercase text-sm tracking-wider'>Descripcion</th>
                  <th className='px-6 py-3 text-gray-900 font-bold uppercase text-sm tracking-wider'>Precio</th>
                  <th className='px-6 py-3 text-gray-900 font-bold uppercase text-sm tracking-wider'>Cantidad</th>
                  <th className='px-6 py-3 text-gray-900 font-bold uppercase text-sm tracking-wider'>Stock crítico</th>
                  <th className='px-6 py-3'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                
                {productosFiltrados.map((producto)=>{
                  const condicionCriticos = producto.stock <= producto.stockCritico
                    
                  
                  return(
                  <tr key={producto.id} 
                      className={`transition-colors ${
                      condicionCriticos 
                        ? 'bg-red-100 hover:bg-red-200 text-red-900' // Color si es crítico
                        : 'hover:bg-gray-100'                      // Color normal
                    }`}>
                    <td className='px-6 py-4 text-gray-800'>{producto.id}</td>
                    <td className='px-6 py-4 text-gray-800 italic'>{producto.descripcion}</td>
                    <td className='px-6 py-4 text-gray-800 font-medium'>${producto.precio}</td>
                    <td className='px-6 py-4 text-gray-800 font-medium'>{producto.stock}</td>
                    <td className='px-6 py-4 text-gray-800 font-medium'>{producto.stockCritico}</td>
                    <td>
                      <button onClick={()=> eliminarProducto(producto.id)} className="text-red-500">
                        Eliminar
                      </button>
                    </td>
                  </tr>)
                })}
                {productosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-500">
                      No se encontraron productos que coincidan con "{busqueda}"
                    </td>
                  </tr>
                )}
                
                
              </tbody>
            </table>
          </div>
          {/**FORMULARIO PARA AGREGAR PRODUCTO */}
          <div>
            <button
              onClick={() => setShowModalProducto(true)}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg mt-2 uppercase tracking-wider"
              >
              Agregar producto
            </button>
          </div>
          {showModalProducto && (
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">

          <div className='w-full lg:w-80 bg-white p-6 rounded-lg shadow-md border border-gray-200'>
            <h2 className='text-xl font-bold text-gray-700 mb-4'>Nuevo Producto</h2>
            <form className='flex flex-col gap-4 ' onSubmit={handleSubmit}>
                
                <div>
                  <label className='block font-black'>
                    Descripcion:
                  </label>
                  <input 
                    type="text" 
                    className='w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none' 
                    placeholder='Ej: Coca-cola 1.5 lts'
                    value={form.descripcion}
                    onChange={(e) => setForm({...form, descripcion: e.target.value})}
                    />
                </div>
                <div>
                  <label className='block font-black'>
                    Precio:
                  </label>
                  <input 
                    type="text" 
                    className='w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none' 
                    placeholder='Ej: 20000'
                    value={form.precio}
                    onChange={(e)=> setForm({...form, precio: e.target.value})}
                    />
                </div>
                <div>
                  <label className='block font-black'>
                    Cantidad:
                  </label>
                  <input 
                    type="text" 
                    className='w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none' 
                    placeholder='Ej: 20'
                    value={form.stock}
                    onChange={(e)=> setForm({...form, stock: e.target.value})}
                    />
                </div>
                <div>
                  <label className='block font-black'>
                    Stock crítico:
                  </label>
                  <input 
                    type="text" 
                    className='w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none' 
                    placeholder='Ej: 20'
                    value={form.stockCritico}
                    onChange={(e)=> setForm({...form, stockCritico: e.target.value})}
                    />
                </div>
                <button 
                  type='submit'
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 shadow-md ">
                        Agregar producto
                </button>
                <button 
                  onClick={() => { setShowModalProducto(false);  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 shadow-md"
                >
                  Cancelar y volver
                </button>
            </form>
          </div>
          </div>)}
        </div>
    </div>
  )
}
