import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface Producto {
    id: number;
    descripcion: string;
    precio: number;
    stock: number;
    stockCritico: number;
}

export const useInventario = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = "http://localhost:8080/api/productos";

    const cargarProductos = async () => {
        try {
            setLoading(true);
            const respuesta = await fetch(API_URL);
            
            if (!respuesta.ok) {
                throw new Error("No es posible contactar el servidor");
            }
            const datos = await respuesta.json();
            setProductos(datos);
        } catch (err: unknown) {
            // Arreglo para TypeScript: extraemos el mensaje de forma segura
            const mensaje = err instanceof Error ? err.message : "Error desconocido";
            setError(mensaje);
            console.error("Error al cargar inventario", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const eliminarProducto = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if(!res.ok) throw new Error("Error al eliminar en el servidor");

                setProductos(productos.filter(p => p.id !== id));
                Swal.fire('¡Eliminado!', 'El producto ha sido borrado.', 'success');
            } catch (err: unknown) {
                console.error("Error al eliminar:", err);
                Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
            }
        }
    };

    const agregarProducto = async (nuevo: Omit<Producto, 'id'>) => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevo)
            });
            const productoGuardado = await res.json();
            setProductos([...productos, productoGuardado]);
            Swal.fire('Guardado', 'Producto agregado con éxito', 'success');
        } catch (err: unknown) {
            console.error("Error al agregar:", err);
            Swal.fire('Error', 'No se pudo guardar el producto', 'error');
        }
    };

    // Retorno único con todos los estados necesarios
    return {
        productos,
        loading, 
        error,   
        eliminarProducto,
        agregarProducto,
        refrescar: cargarProductos 
    };
};