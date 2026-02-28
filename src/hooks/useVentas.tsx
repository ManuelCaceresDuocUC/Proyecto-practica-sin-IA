import { useState } from "react";



interface Producto {
    id: string;
    descripcion: string;
    precio: number;
    stock: number;
}

interface ProductoCarrito extends Producto {
    cantidadSeleccionada: number;
}

export const useVentas = () => {

    
    

    const [carrito, setCarrito] = useState<ProductoCarrito[]>([])

    const agregarAlCarrito = (producto: Producto) => {
        setCarrito( prev =>{
            const existe = prev.find( p => p.id === producto.id);
            if (existe){
                return prev.map(p => p.id === producto.id ? {...p, cantidadSeleccionada: p.cantidadSeleccionada + 1}:p)
            
            };
            return [...prev,{...producto,cantidadSeleccionada: 1}];
        });
    };
    const eliminarDelCarrito = (id: string) => {
        setCarrito(prev => prev.filter(p => p.id !== id));
    };
    const actualizarCantidad = (id: string, delta: number) => {
        setCarrito(prev => prev.map(p => {
            if (p.id === id) {
            const nuevaCant = p.cantidadSeleccionada + delta;
            // No permitir menos de 1 ni más que el stock
            if (nuevaCant >= 1 && nuevaCant <= p.stock) {
                return { ...p, cantidadSeleccionada: nuevaCant };
            }
            }
            return p;
        }));
    };

    const totalVenta = carrito.reduce((acc, p) => acc + (p.precio * p.cantidadSeleccionada), 0);
    
    
    const vaciarCarrito = () => setCarrito([]);
    return {
        carrito,
        setCarrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        totalVenta,
        vaciarCarrito

    }
}
