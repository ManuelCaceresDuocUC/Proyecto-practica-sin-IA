import { useEffect, useState } from "react";



export interface VentaDetalle {
    id: number;
    cantidad: number;
    precioUnitario: number;
    producto: {
        descripcion: string;
        precio: number;
    };
}

export interface Movimiento { 
    id: number;
    total: number;
    metodoPago: string;
    fechaHora: string;
    detalles: VentaDetalle[];
}

export const useMovimiento = () => {
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = "http://localhost:8080/api/movimientos";

    const cargarMovimientos = async () => {
        try {
            setLoading(true);
            const respuesta = await fetch(API_URL);
            const textoPlano = await respuesta.text(); 
            console.log("Lo que llega del servidor:", textoPlano);

            const datos = JSON.parse(textoPlano);
            setMovimientos(datos);
        } catch (err) {
            console.log(err);
            setError("Error al procesar los datos del servidor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarMovimientos();
    }, []);

    return { cargarMovimientos, movimientos, loading, error,setError, };
}