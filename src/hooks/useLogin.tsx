import { useState } from "react";
import { useNavigate } from "react-router-dom";


interface Usuario {
    usuario: string,
    contrasena: string,
}

export const useLogin = () => {

    const navigate = useNavigate();
    
    // Usuarios "quemados" (mock data) para probar el login
    const [usuariosMock] = useState<Usuario[]>([
        { usuario: 'admin', contrasena: '1234' },
        { usuario: 'damian', contrasena: 'duoc2024' }
    ]);


    const [usuarios, setUsuarios] = useState<Usuario[]>([
        
    ])


    const eliminarUsuario = (usuario: string) => {
        setUsuarios(usuarios.filter(p => p.usuario !== usuario));
    };

    const agregarUsuario = (nuevo: Usuario) => {
        setUsuarios([...usuarios, nuevo])
    }

    const logearUsuario = (usuario: Usuario) => {
        const usuarioEncontrado = usuariosMock.find(
            (u) => u.usuario === usuario.usuario && u.contrasena === usuario.contrasena
        );
        if (usuarioEncontrado) {
            alert(`¡Bienvenido ${usuarioEncontrado.usuario}!`);
            // Aquí podrías guardar en localStorage que el usuario entró
            localStorage.setItem('user_session', usuarioEncontrado.usuario);
            
            navigate('/'); // Redirigimos al Home (Inventario)
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    }

    

    return {
        usuarios,
        eliminarUsuario,
        agregarUsuario,
        logearUsuario,
    };
};