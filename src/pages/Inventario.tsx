import { Link } from 'react-router-dom';
import { useInventario, type Producto } from '../hooks/useInventario';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';



// Interfaz para el manejo local de la receta en el formulario
interface ItemRecetaLocal {
  insumoId: number;
  cantidad: number;
  descripcion?: string;
}

export const Inventario = () => {
  const { productos, eliminarProducto, agregarProducto, editarProducto } = useInventario();
  const productosRef = useRef<Producto[]>([]);

  // Sincronizar ref para el escáner
  useEffect(() => {
    productosRef.current = productos;
  }, [productos]);

  const [showModalProducto, setShowModalProducto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  
  const [form, setForm] = useState({
    codigoBarras: '',
    descripcion: '',
    precio: '',
    stock: '',
    stockCritico: '',
    esInsumo: true,
    unidadMedida: 'UN'
  });

  // --- ESTADOS PARA LA RECETA ---
  const [listaIngredientesSeleccionados, setListaIngredientesSeleccionados] = useState<ItemRecetaLocal[]>([]);
  const [nuevoIngrediente, setNuevoIngrediente] = useState({
    insumoId: 0,
    cantidad: 0,
    descripcion: ''
  });

  // Funciones de Receta
  const agregarIngredienteALista = () => {
    if (nuevoIngrediente.insumoId === 0 || nuevoIngrediente.cantidad <= 0) {
      return Swal.fire("Atención", "Selecciona un insumo y cantidad válida", "warning");
    }
    setListaIngredientesSeleccionados(prev => [...prev, { ...nuevoIngrediente }]);
    setNuevoIngrediente({ insumoId: 0, cantidad: 0, descripcion: '' });
  };

  const quitarIngredienteDeLista = (id: number) => {
    setListaIngredientesSeleccionados(prev => prev.filter(item => item.insumoId !== id));
  };

  const abrirEdicion = (producto: Producto) => {
    setForm({
      codigoBarras: producto.codigoBarras || '',
      descripcion: producto.descripcion,
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
      stockCritico: producto.stockCritico.toString(),
      esInsumo: producto.esInsumo ?? true,
      unidadMedida: producto.unidadMedida
    });
    // Si tiene receta en la DB, la cargamos al estado local
    if (producto.receta) {
      setListaIngredientesSeleccionados(producto.receta.map(r => ({
        insumoId: r.insumo.id,
        cantidad: r.cantidadUsada,
        descripcion: r.insumo.descripcion
      })));
    }
    setEditandoId(producto.id);
    setShowModalProducto(true);
  };

  const cerrarModal = () => {
    setShowModalProducto(false);
    setEditandoId(null);
    setListaIngredientesSeleccionados([]); // Limpiar receta
    setForm({ 
      codigoBarras: '', descripcion: '', precio: '', stock: '', 
      stockCritico: '', esInsumo: true, unidadMedida: 'UN' 
    });
  };

  const generarCodigoProvisional = () => `PROV-${Date.now()}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.descripcion || !form.precio || !form.stockCritico) {
      return Swal.fire("Faltan datos", "Rellena los campos obligatorios", "warning");
    }

    const codigoFinal = form.codigoBarras.trim() === "" ? generarCodigoProvisional() : form.codigoBarras;

    const datosProducto = {
      descripcion: form.descripcion,
      precio: Number(form.precio),
      stock: Number(form.stock),
      stockCritico: Number(form.stockCritico),
      esInsumo: form.esInsumo,
      unidadMedida: form.unidadMedida,
      codigoBarras: codigoFinal,
    };

    if (editandoId) {
      await editarProducto(editandoId, datosProducto);
    } else {
      // Enviamos receta solo si NO es insumo y hay items agregados
      const ingredientesParaEnviar = !form.esInsumo 
        ? listaIngredientesSeleccionados.map(i => ({ insumoId: i.insumoId, cantidad: i.cantidad })) 
        : [];
      await agregarProducto(datosProducto, ingredientesParaEnviar);
    }
    cerrarModal();
  };

  // Lógica de Stock Virtual (Cuello de botella)
  const obtenerStockVisual = (producto: Producto) => {
    if (producto.esInsumo || !producto.receta || producto.receta.length === 0) {
      return producto.stock;
    }
    const limites = producto.receta.map(item => {
      const insumoOriginal = productos.find(p => p.id === item.insumo.id);
      if (!insumoOriginal || insumoOriginal.stock <= 0) return 0;
      return Math.floor(insumoOriginal.stock / item.cantidadUsada);
    });
    return Math.min(...limites);
  };

  const productosFiltrados = productos.filter(p => {
    const b = busqueda.toLowerCase();
    return p.descripcion.toLowerCase().includes(b) || p.codigoBarras?.toLowerCase().includes(b) || p.id.toString().includes(b);
  });

  const manejarEntradaStock = async (producto: Producto) => {
    const { value: cantidad } = await Swal.fire({
      title: `Cargar Stock: ${producto.descripcion}`,
      input: 'number',
      inputLabel: `Cantidad que llegó (Unidad actual: ${producto.unidadMedida})`,
      inputPlaceholder: 'Ej: 10',
      showCancelButton: true,
      confirmButtonText: 'Sumar al stock',
      cancelButtonText: 'Cancelar',
      inputAttributes: {
        min: '0.01',
        step: '0.01'
      },
      inputValidator: (value) => {
        if (!value || Number(value) <= 0) {
          return '¡Debes ingresar una cantidad válida!';
        }
      }
    });

    if (cantidad) {
      try {
        // Calculamos el nuevo stock sumando la entrada al stock actual
        const nuevoStock = producto.stock + Number(cantidad);
        
        // Reutilizamos tu función de editarProducto enviando solo el stock actualizado
        // Nota: editarProducto en tu hook usa Omit<Producto, 'id'>, así que mandamos el objeto completo
        await editarProducto(producto.id, {
          ...producto,
          stock: nuevoStock
        });

        Swal.fire('Actualizado', `Se han sumado ${cantidad} al stock de ${producto.descripcion}`, 'success');
      } catch (error) {
        console.log(error);
        Swal.fire('Error', 'No se pudo actualizar el stock', 'error');
      }
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center p-10 relative'>
      <Link to="/" className='absolute top-10 left-10'>
        <button className='bg-blue-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg'>← Volver</button>
      </Link>

      <h1 className='text-4xl font-black text-gray-800 mb-8'>Inventario</h1>

      <div className='w-full max-w-4xl mb-6'>
        <input 
          type="text"
          placeholder='Buscar producto...'
          className='w-full p-3 rounded-xl border border-gray-300 shadow-sm outline-none'
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      
      <div className='w-full max-w-6xl bg-white rounded-lg shadow-md border overflow-hidden'>
        <div className='p-4 border-b bg-gray-50 flex justify-between items-center'>
          <h2 className='text-2xl font-semibold'>Listado de productos</h2>
          <button onClick={() => setShowModalProducto(true)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg">+ Nuevo Producto</button>
        </div>
        
        <table className='w-full text-left'>
          <thead className='bg-gray-100 uppercase text-xs font-bold text-gray-600'>
            <tr>
              <th className='px-6 py-3'>Id</th>
              <th className='px-6 py-3'>Descripcion</th>
              <th className='px-6 py-3'>Precio</th>
              <th className='px-6 py-3'>Stock (Real/Virtual)</th>
              <th className='px-6 py-3'>Acciones</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {productosFiltrados.map((producto) => {
              const stockVisual = obtenerStockVisual(producto);
              const esCritico = stockVisual <= producto.stockCritico;
              return (
                <tr key={producto.id} className={esCritico ? 'bg-red-50' : ''}>
                  <td className='px-6 py-4'>{producto.id}</td>
                  <td className='px-6 py-4'>
                    {producto.descripcion}
                    {!producto.esInsumo && (producto.receta?.length || 0) > 0 && (
                      <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold">RECETA</span>
                    )}
                  </td>
                  <td className='px-6 py-4 font-bold'>${producto.precio}</td>
                  <td className={`px-6 py-4 font-bold ${esCritico ? 'text-red-600' : ''}`}>
                    {stockVisual} <span className='text-[10px] text-gray-400'>{producto.unidadMedida}</span>
                  </td>
                  <td className='px-6 py-4 flex gap-2'>
                    <button 
                      onClick={() => manejarEntradaStock(producto)} 
                      className="text-green-600 hover:text-green-800 font-bold flex items-center gap-1"
                      title="Cargar Stock"
                    >
                      <span className="text-lg">+</span>📦
                    </button>
                    <button onClick={() => abrirEdicion(producto)} className="text-blue-600 font-bold">Editar</button>
                    <button onClick={() => eliminarProducto(producto.id)} className="text-red-500 font-bold">Eliminar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModalProducto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto'>
            <h2 className='text-2xl font-black mb-4'>{editandoId ? '📝 Editar' : '📦 Nuevo'} Producto</h2>
            
            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
              <div className="flex gap-2 p-2 bg-gray-50 rounded-xl">
                <button type="button" onClick={() => setForm({...form, esInsumo: true})} className={`flex-1 py-2 rounded-lg text-xs font-bold ${form.esInsumo ? 'bg-blue-600 text-white' : 'bg-white'}`}>INSUMO</button>
                <button type="button" onClick={() => setForm({...form, esInsumo: false})} className={`flex-1 py-2 rounded-lg text-xs font-bold ${!form.esInsumo ? 'bg-orange-600 text-white' : 'bg-white'}`}>PRODUCTO VENTA</button>
              </div>

              <input type="text" placeholder="Código de barras" className='p-3 border rounded-xl' value={form.codigoBarras} onChange={(e) => setForm({...form, codigoBarras: e.target.value})} />
              <input type="text" placeholder="Descripción" className='p-3 border rounded-xl' value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} />
              
              <div className='grid grid-cols-2 gap-2'>
                <div className='flex border rounded-xl overflow-hidden'>
                  <input type="number" step="0.01" className='w-full p-3' placeholder="Stock" value={form.stock} onChange={(e)=> setForm({...form, stock: e.target.value})} />
                  <select className='bg-gray-100 px-2 text-xs' value={form.unidadMedida} onChange={(e)=>setForm({...form, unidadMedida: e.target.value})}>
                    <option value="UN">UN</option><option value="KG">KG</option><option value="LT">LT</option>
                  </select>
                </div>
                <input type="number" placeholder="Precio" className='p-3 border rounded-xl' value={form.precio} onChange={(e)=> setForm({...form, precio: e.target.value})} />
              </div>

              <input type="number" placeholder="Stock Crítico" className='p-3 border rounded-xl' value={form.stockCritico} onChange={(e)=> setForm({...form, stockCritico: e.target.value})} />

              {/* SECCIÓN RECETA DINÁMICA */}
              {!form.esInsumo && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-xs font-black text-orange-700 mb-2 uppercase italic">🍎 Ingredientes / Receta</p>
                  <div className="flex flex-col gap-2">
                    <select 
                      className="p-2 text-sm border rounded-lg"
                      value={nuevoIngrediente.insumoId}
                      onChange={(e) => {
                        const insumo = productos.find(p => p.id === Number(e.target.value));
                        setNuevoIngrediente({...nuevoIngrediente, insumoId: Number(e.target.value), descripcion: insumo?.descripcion || ''});
                      }}
                    >
                      <option value={0}>Seleccionar Insumo...</option>
                      {productos.filter(p => p.esInsumo).map(i => <option key={i.id} value={i.id}>{i.descripcion}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <input type="number" step="0.001" placeholder="Cant." className="w-24 p-2 text-sm border rounded-lg" value={nuevoIngrediente.cantidad || ''} onChange={(e)=>setNuevoIngrediente({...nuevoIngrediente, cantidad: Number(e.target.value)})} />
                      <button type="button" onClick={agregarIngredienteALista} className="flex-1 bg-orange-600 text-white rounded-lg font-bold">+</button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {listaIngredientesSeleccionados.map(item => (
                      <div key={item.insumoId} className="flex justify-between bg-white p-2 rounded border text-xs italic">
                        <span>{item.descripcion}</span>
                        <div className="flex gap-2">
                          <span className="font-bold">{item.cantidad}</span>
                          <button type="button" onClick={() => quitarIngredienteDeLista(item.insumoId)} className="text-red-500">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button type='submit' className="bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg">
                {editandoId ? 'Actualizar' : 'Registrar'}
              </button>
              <button type="button" onClick={cerrarModal} className="text-gray-400 text-xs font-bold">CANCELAR</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};