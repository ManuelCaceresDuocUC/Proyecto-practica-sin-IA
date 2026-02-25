
import {  Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center p-10' >
      
      <h1 className='text-4xl font-black text-gray-800 mb-8 tracking-tight'>
        Inicio
      </h1>

      <nav className='flex flex-col gap-4 w-full max-w-md'>
        
        <Link to="/ventas">
          <button className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all active:scale-95'> 
            Modulo de ventas
          </button>
        </Link>
        <Link to="/inventario">
          <button className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all active:scale-95'>
            Modulo de Inventario
          </button>
        </Link>
        <Link to="/administracion">
          <button className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all active:scale-95'>
            Modulo de Administracion
          </button>
        </Link>
      </nav>
    
   
  </div>
  )
}
