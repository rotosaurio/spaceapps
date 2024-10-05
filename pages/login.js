import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { signIn, useSession } from "next-auth/react";

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/noticias');
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/autenticacion', {
        action: 'login',
        correo,
        contraseña
      });

      // Almacenar el token en el almacenamiento local o cookies según tu preferencia
      localStorage.setItem('token', response.data.token);
      
      // Redirigir al usuario a la página de noticias
      router.push('/noticias');
    } catch (error) {
      setError(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/noticias" });
    } catch (error) {
      setError("Error al iniciar sesión con Google");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="correo" className="sr-only">
                Correo Electrónico
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                  border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none 
                  focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo Electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="contraseña" className="sr-only">
                Contraseña
              </label>
              <input
                id="contraseña"
                name="contraseña"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                  border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none 
                  focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Iniciar Sesión
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Iniciar Sesión con Google
            </button>
          </div>
          <div className="text-sm mt-3">
            <Link href="/register">
              <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                ¿No tienes una cuenta? Regístrate aquí
              </span>
            </Link>
          </div>
        </form>
        {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}