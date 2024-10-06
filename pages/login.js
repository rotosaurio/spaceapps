import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { signIn, useSession } from "next-auth/react";

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const [imagePosition, setImagePosition] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/noticias');
    }
  }, [status, router]);

  useEffect(() => {
    const animateImage = () => {
      setImagePosition(prev => (prev + 0.05) % 100);
    };

    const imageInterval = setInterval(animateImage, 50);

    return () => clearInterval(imageInterval);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: correo,
        password: contraseña,
      });

      localStorage.setItem('token', response.data.token);
      router.push('/noticias');
    } catch (error) {
      console.error('Error:', error);
      setError('Error en el servidor');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/noticias" });
    } catch (error) {
      setError("Error al iniciar sesión con Google");
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
        <title>Iniciar Sesión</title>
        <meta name="description" content="Página de inicio de sesión" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-2/3 p-8 pr-24 flex items-center">
        <div className="w-full max-w-2xl">
          <h1 
            className="text-6xl font-bold text-white mb-12 drop-shadow-lg tracking-wider"
            style={{ textIndent: '3em' }}
          >
            Iniciar Sesión
          </h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                required 
                className="w-full bg-[#151626] text-white py-3 px-16 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300 text-white"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Contraseña" 
                required 
                className="w-full bg-[#151626] text-white py-3 px-16 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300 text-white"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
              />
            </div>
            <div className="mt-12 space-y-4">
              <button 
                type="submit" 
                className="w-full bg-[#5D6C8C] text-white py-3 px-16 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-lg font-semibold tracking-wide"
              >
                Iniciar Sesión
              </button>
              <button 
                type="button" 
                onClick={handleGoogleSignIn}
                className="w-full bg-[#5D6C8C] text-white py-3 px-16 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-lg font-semibold tracking-wide flex items-center justify-center"
              >
                <img src="/google-icon.png" alt="Google" className="w-6 h-6 mr-2" />
                Iniciar sesión con Google
              </button>
            </div>
          </form>
        </div>
      </main>

      <div className="w-1/2 flex items-center justify-center p-8">
        <div 
          className="relative w-full h-full" 
          style={{ 
            maxWidth: '65%', 
            maxHeight: '90%', 
            transform: `rotate(30deg) translateY(${imagePosition}px)`,
            transition: 'transform 0.5s ease-out'
          }}
        >
          <Image
            src={rightImage}
            alt="Imagen de inicio de sesión"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </div>
    </div>
  );
}