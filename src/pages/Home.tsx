
import { useEffect, useState } from 'react';
import {  Link, useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();
  const [nombreParaMostrar, setNombreParaMostrar] = useState('');

  useEffect(() => {
    const sesion = localStorage.getItem('user_session');
    if (!sesion) {
      navigate('/login'); 
      return// Si no hay sesión, rebota al login inmediatamente
    }
    try {
      // 1. Parseamos el JSON para obtener solo el nombre
      const usuarioObj = JSON.parse(sesion);
      // Dependiendo de cómo guardes el campo (usuario o nombre)
      setNombreParaMostrar(usuarioObj.usuario || usuarioObj.nombre || 'Usuario');
    } catch (e) {
      console.log(e);
      // Si el localStorage tiene basura o texto plano, manejamos el error
      setNombreParaMostrar(sesion);
    }// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);


  const handleLogout = () => {
    localStorage.removeItem('user_session'); // Limpiamos la sesión
    navigate('/login'); // Redirigimos al usuario 
  };
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center p-10' >
        <nav className='absolute top-5 right-5'>
          <button 
            onClick={handleLogout}
            className='bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2 text-sm'
          >
            <span>Cerrar sesion</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </nav>

      <h1 className='text-4xl font-black text-gray-800 mb-8 tracking-tight'>
        Bienvenido {nombreParaMostrar}
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
        <Link to="/recetas">
          <button className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all active:scale-95'>
            Modulo de Recetas
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
