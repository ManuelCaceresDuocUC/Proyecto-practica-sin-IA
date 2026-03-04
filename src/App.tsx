
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Ventas } from './pages/Ventas';
import { Home } from './pages/Home';
import { Inventario } from './pages/Inventario';
import { Administracion } from './pages/Administracion';
import { Login } from './pages/Login';
import { Recetas } from './pages/Recetas';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Movimientos } from './pages/Movimientos';


function App() {
  

  return (
    <BrowserRouter>
      
      
      
        <Routes>

          <Route path='/login' element={<Login/>}/>

          
          <Route element={<ProtectedRoute />}>
          <Route path='/' element={<Home/>}/>
          <Route path="/ventas" element={<Ventas />}/>
          <Route path="/inventario" element={<Inventario />}/>
          <Route path="/administracion" element={<Administracion />}/>
          <Route path="/recetas" element={<Recetas />}/>
          <Route path='/movimientos' element={<Movimientos/>}/>
          </Route>
        </Routes>
      

      
      
    </BrowserRouter>
  )
}

export default App
