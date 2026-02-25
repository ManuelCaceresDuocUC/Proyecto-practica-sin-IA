
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Ventas } from './pages/Ventas';
import { Home } from './pages/Home';
import { Inventario } from './pages/Inventario';
import { Administracion } from './pages/Administracion';


function App() {
  

  return (
    <BrowserRouter>
      
      
      
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/ventas" element={<Ventas />}/>
          <Route path="/inventario" element={<Inventario />}/>
          <Route path="/administracion" element={<Administracion />}/>
        </Routes>
      

      
      
    </BrowserRouter>
  )
}

export default App
