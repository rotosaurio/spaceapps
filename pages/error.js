import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;
  const [errorMessage, setErrorMessage] = useState("Ocurrió un error inesperado. Por favor, intenta nuevamente.");

  // Mapeo de códigos de error a mensajes amigables
  const errorMessages = {
    Configuration: "Error de configuración. Por favor, contacta al administrador.",
    AccessDenied: "Acceso denegado. No tienes permisos para acceder a esta página.",
    Verification: "Error en el proceso de verificación. Por favor, intenta nuevamente.",
    OAuthSignin: "Error al iniciar sesión con OAuth. Por favor, intenta nuevamente.",
    OAuthCallback: "Error en la devolución de llamada de OAuth. Por favor, intenta nuevamente.",
    OAuthCreateAccount: "Error al crear la cuenta OAuth. Por favor, intenta nuevamente.",
    EmailCreateAccount: "Error al crear la cuenta de correo electrónico. Por favor, intenta nuevamente.",
    Callback: "Error en el callback. Por favor, intenta nuevamente.",
    OAuthAccountNotLinked: "Esta cuenta está vinculada a otro proveedor. Por favor, inicia sesión con el proveedor correcto.",
    EmailSignin: "Error al iniciar sesión con correo electrónico. Por favor, verifica tus credenciales.",
    CredentialsSignin: "Credenciales inválidas. Por favor, verifica tu correo electrónico y contraseña.",
    Default: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
  };

  useEffect(() => {
    if (error && errorMessages[error]) {
      setErrorMessage(errorMessages[error]);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Ocurrió un Error
          </h2>
          <p className="mt-2 text-gray-600">{errorMessage}</p>
        </div>
        <div>
          <Link href="/login">
            <button className="mt-4 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Volver a Iniciar Sesión
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}