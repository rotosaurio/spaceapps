import { useRouter } from 'next/router';
import Link from 'next/link';
import { signOut, useSession } from "next-auth/react";

export default function Noticias() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    try {
      // Eliminar el token JWT si existe
      localStorage.removeItem('token');
      // Cerrar sesión con NextAuth (OAuth)
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold mb-5">Noticias</h1>
          <p className="mb-4">Aquí irían las noticias...</p>
          <div className="flex justify-between">
            <Link href="/foro">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Ir al Foro
              </button>
            </Link>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}