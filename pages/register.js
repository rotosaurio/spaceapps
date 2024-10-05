import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('/api/autenticacion', {
        action: 'register',
        nombre,
        correo,
        contraseña
      });

      router.push('/login');
    } catch (error) {
      setError(error.response?.data?.error || 'Error al registrar usuario');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="nombre" className="sr-only">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="correo" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
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
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Registrarse
            </button>
          </div>
          <div className="text-sm mt-3">
            <Link href="/login">
              <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                ¿Ya tienes una cuenta? Inicia sesión aquí
              </span>
            </Link>
          </div>
        </form>
        {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}