
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMovimiento, type Movimiento } from "../hooks/useMovimiento"; 

export const Movimientos = () => {
    const { movimientos, loading, error } = useMovimiento();
    const [ventaSeleccionada, setVentaSeleccionada] = useState<Movimiento | null>(null);

    if (loading) return <div className="p-10 text-center font-bold text-blue-600">Cargando movimientos...</div>;

    if (error) return (
        <div className="p-10 text-center">
            <p className="text-red-500 font-bold underline">Error al cargar datos:</p>
            <p className="text-gray-600">{error}</p>
        </div>
    );

    return (
        <div className="p-8">
            <Link to="/" className="mb-8 inline-block">
                <button className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2'>
                    <span>←</span> Volver al home
                </button>
            </Link>
            
            <h1 className='text-4xl font-black text-gray-800 mb-8 tracking-tight'>Ventas y Análisis</h1>

            <div className='flex flex-col lg:flex-row gap-8 items-start w-full max-w-6xl'>
                <div className="flex-1 overflow-hidden rounded-lg shadow-md border border-gray-200 bg-white">
                    <table className='w-full text-center'>
                        <thead className='bg-gray-200 border-b-2 border-gray-300 font-bold text-gray-700'>
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Método</th>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Productos</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                            {movimientos.map((mov) => (
                                <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                                    <td className='px-6 py-4'>#{mov.id}</td>
                                    <td className='px-6 py-4 font-bold text-green-600'>${mov.total.toLocaleString()}</td>
                                    <td className='px-6 py-4 font-medium'>{mov.metodoPago}</td>
                                    <td className='px-6 py-4 text-gray-500'>
                                        {new Date(mov.fechaHora).toLocaleString()}
                                    </td>
                                    <td className='px-6 py-4'>
                                        <button 
                                            onClick={() => setVentaSeleccionada(mov)}
                                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            Ver detalle {mov.detalles?.length || 0} prod.
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DETALLE  */}
            {ventaSeleccionada && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-800 p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold">Detalle de Venta #{ventaSeleccionada.id}</h3>
                            <button onClick={() => setVentaSeleccionada(null)} className="text-2xl">&times;</button>
                        </div>
                        
                        <div className="p-4">
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {ventaSeleccionada.detalles.map((det) => (
                                    <div key={det.id} className="flex justify-between items-center border-b pb-2">
                                        <div className="text-left">
                                            <p className="font-bold text-gray-800">{det.producto.descripcion}</p>
                                            <p className="text-xs text-gray-500">
                                                {det.cantidad} unid. x ${det.precioUnitario}
                                            </p>
                                        </div>
                                        <p className="font-bold text-blue-600">
                                            ${(det.cantidad * det.precioUnitario).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => setVentaSeleccionada(null)}
                                className="w-full mt-6 bg-gray-800 text-white py-3 rounded-xl font-bold"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};