import { useRouter } from 'next/router';
import Link from 'next/link';
import { signOut, useSession } from "next-auth/react";

export default function Noticias() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const noticias = [
    {
      id: 1,
      titulo: "Descubrimiento de exoplaneta potencialmente habitable",
      contenido: "Científicos han descubierto un nuevo exoplaneta en la zona habitable de su estrella, aumentando las posibilidades de encontrar vida extraterrestre.",
      fecha: "2023-05-15"
    },
    {
      id: 2,
      titulo: "Nueva misión a Marte anunciada por la NASA",
      contenido: "La NASA ha anunciado una nueva misión a Marte programada para 2026, con el objetivo de buscar signos de vida antigua en el planeta rojo.",
      fecha: "2023-05-10"
    },
    {
      id: 3,
      titulo: "Avances en la teoría de la gravedad cuántica",
      contenido: "Físicos teóricos reportan avances significativos en la unificación de la mecánica cuántica y la teoría de la relatividad general.",
      fecha: "2023-05-05"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-black py-4 px-4 flex justify-between items-center">
        <div className="w-96 h-24">
          <img src="/Logo cosmoXplora.png" alt="Logo CosmoXplora" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center">
          <span className="text-white mr-4">{session?.user?.name || 'Usuario Anónimo'}</span>
          <button 
            onClick={handleLogout}
            className="text-white bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Noticias del Cosmos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {noticias.map((noticia) => (
            <div key={noticia.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{noticia.titulo}</h2>
                <p className="text-gray-300 mb-4">{noticia.contenido}</p>
                <p className="text-sm text-gray-400">Fecha: {noticia.fecha}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/foro">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Ir al Foro
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}