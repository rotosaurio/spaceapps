import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Hola Mundo</h1>
      <Link href="/login">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Iniciar sesión
        </button>
      </Link>
    </div>
  );
}