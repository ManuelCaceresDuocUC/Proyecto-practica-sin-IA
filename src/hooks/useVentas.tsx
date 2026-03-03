import { useState } from "react";
import Swal from "sweetalert2";



interface Producto {
    id: number;
    descripcion: string;
    precio: number;
    stock: number;
}

interface ProductoCarrito extends Producto {
    cantidadSeleccionada: number;
}

export const useVentas = () => {
    const [metodoPago, setMetodoPago] = useState("");
    const [showModalPago, setShowModalPago] = useState(false);
    const [busqueda, setBusqueda] = useState('');

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

    const eliminarDelCarrito = (id: number) => {
        setCarrito(prev => prev.filter(p => p.id !== id));
    };

    const actualizarCantidad = (id: number, delta: number) => {
        setCarrito(prev => prev.map(p => {
            if (p.id === id) {
            const nuevaCant = p.cantidadSeleccionada + delta;
            if (nuevaCant >= 1 && nuevaCant <= p.stock) {
                return { ...p, cantidadSeleccionada: nuevaCant };
            }
            }
            return p;
        }));
    };

    const totalVenta = carrito.reduce((acc, p) => acc + (p.precio * p.cantidadSeleccionada), 0);
    
    
    const vaciarCarrito = () => setCarrito([]);


    const confirmarVentaFinal = async () => {
        if (!metodoPago) return;

        try {
        Swal.fire({
            title: 'Procesando...',
            text: metodoPago === 'tarjeta' ? 'Siga las instrucciones en la maquinita' : 'Registrando venta',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        const datosVenta = {
            monto: Math.round(totalVenta),
            items: carrito.map(p => ({
            productoId: p.id,
            cantidad: p.cantidadSeleccionada
            }))
        };
        const url = metodoPago === 'tarjeta' 
            ? "http://localhost:8080/api/pagos/cobrar" 
            : "http://localhost:8080/api/pagos/efectivo"; 

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosVenta)
        });

        const resultado = await res.json();

        if (!res.ok) {
            throw new Error(resultado.message || "Error en la transacción");
        }
        Swal.fire({
            title: '¡Venta Completada!',
            text: resultado.message,
            icon: 'success',
            timer: 2000
        });

        setCarrito([]);
        setShowModalPago(false);
        setMetodoPago("");
        setBusqueda("");

        } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error inesperado";
        Swal.fire('Venta Cancelada', msg, 'error');
        }
    };
    return {
        carrito,
        setCarrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        totalVenta,
        vaciarCarrito,
        confirmarVentaFinal,
        showModalPago,
        busqueda,
        setBusqueda,
        setShowModalPago,
        metodoPago,
        setMetodoPago
    }
}
