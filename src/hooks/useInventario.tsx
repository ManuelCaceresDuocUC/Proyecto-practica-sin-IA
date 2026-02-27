import { useState } from "react";
import Swal from "sweetalert2";


interface Producto {
    id: string;
    descripcion: string;
    precio: number;
    stock: number;
    stockCritico: number;

}

export const useInventario = () => {
    const [productos, setProductos] = useState<Producto[]>([
        { id: '0001', descripcion: 'Desodorante Rexona', precio: 2500, stock: 3, stockCritico:5 },
        { id: '0002', descripcion: 'Mani Confitado', precio: 1000, stock: 50, stockCritico:5 },
        { id: '0003', descripcion: 'Bebida 1.5L', precio: 1500, stock: 15, stockCritico:5 },
    ])

    const eliminarProducto = (id: string) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true, // Muestra el botón cancelar
            confirmButtonColor: '#3085d6', // Azul
            cancelButtonColor: '#d33',    // Rojo
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setProductos(productos.filter(p => p.id !== id));
                Swal.fire(
        '¡Eliminado!',
        'El producto ha sido borrado del inventario.',
        'success'
      );
    }
  });
    };

    const agregarProducto = (nuevo: Producto) => {
        setProductos([...productos, nuevo])
    }


    

    return {
        productos,
        eliminarProducto,
        agregarProducto,
    };
};