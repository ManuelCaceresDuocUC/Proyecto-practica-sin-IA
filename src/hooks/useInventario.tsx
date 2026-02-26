import { useState } from "react";


interface Producto {
    id: string;
    descripcion: string;
    precio: number;
    stock: number;
}

export const useInventario = () => {
    const [productos, setProductos] = useState<Producto[]>([
        { id: '0001', descripcion: 'Desodorante Rexona', precio: 2500, stock: 20 },
        { id: '0002', descripcion: 'Mani Confitado', precio: 1000, stock: 50 },
        { id: '0003', descripcion: 'Bebida 1.5L', precio: 1500, stock: 15 },
    ])

    const eliminarProducto = (id: string) => {
        setProductos(productos.filter(p => p.id !== id));
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