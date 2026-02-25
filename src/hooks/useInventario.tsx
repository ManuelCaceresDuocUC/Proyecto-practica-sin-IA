import { useState } from "react";


interface Producto {
    id: string;
    descripcion: string;
    stock: number;
}

export const useInventario = () => {
    const [productos, setProductos] = useState<Producto[]>([
        {id: '0000', descripcion: 'Producto vacio', stock: 9999}
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