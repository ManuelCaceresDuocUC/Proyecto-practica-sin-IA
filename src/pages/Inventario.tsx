
import {  Link } from 'react-router-dom';
import { useInventario } from '../hooks/useInventario';
import { useState } from 'react';



export const Inventario = () => {

  const { productos, eliminarProducto, agregarProducto } = useInventario();

  const [form, setForm] = useState({
    id: '',
    descripcion: '',
    stock: '' // Lo manejamos como string inicialmente para el input
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue

    // Validaciones básicas
    if (!form.id || !form.descripcion || !form.stock) return alert("Completa todos los campos");

    // Llamamos a la función del Hook
    agregarProducto({
      id: form.id,
      descripcion: form.descripcion,
      stock: Number(form.stock) // Convertimos a número
    });

    // Limpiamos el formulario
    setForm({ id: '', descripcion: '', stock: '' });
  };


  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center p-10 relative'>
      <Link to="/" className='absolute top-10 left-10'>
        <button className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2'>
          {/* Opcional: un icono de flecha queda muy bien */}
          <span>←</span> Volver al home
        </button>
      </Link>

      <h1 className='text-4xl font-black text-gray-800 mb-8 tracking-tight'>
          Inventario
      </h1>
      
      
        
          
          
        
        
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
                  <th className='px-6 py-3 text-gray-900 font-bold uppercase text-sm tracking-wider'>Cantidad</th>
                  <th className='px-6 py-3'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                
                {productos.map((producto)=>(
                  <tr key={producto.id} className="hover:bg-gray-100 transition-colors">
                    <td className='px-6 py-4 text-gray-800'>{producto.id}</td>
                    <td className='px-6 py-4 text-gray-800 italic'>{producto.descripcion}</td>
                    <td className='px-6 py-4 text-gray-800 font-medium'>{producto.stock}</td>
                    <td>
                      <button onClick={()=> eliminarProducto(producto.id)} className="text-red-500">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                
                
                
              </tbody>
            </table>
          </div>

          <div className='w-full lg:w-80 bg-white p-6 rounded-lg shadow-md border border-gray-200'>
            <h2 className='text-xl font-bold text-gray-700 mb-4'>Nuevo Producto</h2>
            <form className='flex flex-col gap-4 ' onSubmit={handleSubmit}>
                <div>
                  <label className='block '>
                    ID:
                  </label>
                  <input 
                    type="text" 
                    className='w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none' 
                    placeholder='Ej: 0002'
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    />
                </div>
                <div>
                  <label className='block '>
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
                  <label className='block '>
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
                <button 
                  type='submit'
                  className="bg-blue-800 hover:bg-blue-950 tetx-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 shadow-md ">
                        Agregar producto
                </button>

            </form>
          </div>

        

        </div>
      
      
    </div>
  )
}
