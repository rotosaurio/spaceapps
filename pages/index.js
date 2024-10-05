import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Hello World</h1>
      <Link href="/login">
        <button>Iniciar sesión</button>
      </Link>
    </div>
  );
}
