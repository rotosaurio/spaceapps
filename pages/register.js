import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/autenticacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          nombre,
          correo,
          contraseña
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registro exitoso, redirigir a la página de inicio de sesión o dashboard
        router.push('/login');
      } else {
        // Mostrar error
        setError(data.error || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error en el servidor');
    }
  };

  // Usa una variable de entorno para la ruta del GIF, con una ruta por defecto
  const backgroundGif = process.env.NEXT_PUBLIC_BACKGROUND_GIF || '/star-4773.gif';
  // Usa una variable de entorno para la ruta de tu imagen, con una ruta por defecto
  const rightImage = process.env.NEXT_PUBLIC_RIGHT_IMAGE || '/astro.png';

  return (
    <div 
      className="min-h-screen flex bg-cover bg-center bg-no-repeat"
      style={{backgroundImage: `url('${backgroundGif}')`}}
    >
      <Head>
        <title>Registro</title>
        <meta name="description" content="Página de registro" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-2/3 p-8 pr-24 flex items-center">
        <div className="w-full max-w-2xl">
          <h1 
            className="text-6xl font-bold text-white mb-12 drop-shadow-lg tracking-wider"
            style={{ textIndent: '3em' }}
          >
            Registro
          </h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <input 
                type="text" 
                placeholder="Nombre de usuario" 
                required 
                className="w-full px-3 py-2 bg-transparent border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300 text-white"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div>
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                required 
                className="w-full px-3 py-2 bg-transparent border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300 text-white"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Contraseña" 
                required 
                className="w-full px-3 py-2 bg-transparent border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300 text-white"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
              />
            </div>
            <div className="mt-12">
              <button 
                type="submit" 
                className="w-full bg-[#5D6C8C] text-white py-3 px-16 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-lg font-semibold tracking-wide"
              >
                Registrarse
              </button>
            </div>
          </form>
        </div>
      </main>

      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="relative w-full h-full" style={{ maxWidth: '65%', maxHeight: '90%' , transform: 'rotate(30deg)'}  }>
          <Image
            src={rightImage}
            alt="Imagen de registro"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </div>
    </div>
  );
}