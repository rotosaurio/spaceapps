'use client'

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import FloatingButton from '../components/FloatingButton';

function Stars({ count = 5000 }) {
  const points = useMemo(() => {
    const p = new Array(count).fill().map(() => (Math.random() - 0.5) * 20);
    return new Float32Array(p);
  }, [count]);

  const ref = useRef();
  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 20;
    ref.current.rotation.y -= delta / 30;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function Scene() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.z = 3;
  }, [camera]);

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <Stars />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
    </>
  );
}

const SearchIcon = () => (
  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export default function Noticias() {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data);
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error("Error al verificar la sesión:", error);
        setStatus('unauthenticated');
      }
    };

    const guestToken = localStorage.getItem('guestToken');
    if (guestToken === 'true') {
      setIsGuest(true);
      setStatus('authenticated');
    } else {
      checkSession();
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated' && !isGuest) {
      router.push('/');
    }
  }, [status, isGuest, router]);

  const displayName = session?.user?.name || (isGuest ? 'Invitado' : 'Usuario Anónimo');

  const handleLogout = async () => {
    if (isGuest) {
      localStorage.removeItem('guestToken');
      router.push('/');
    } else {
      try {
        const res = await fetch('/api/auth/signout', { method: 'POST' });
        if (res.ok) {
          localStorage.removeItem('token');
          router.push('/');
        }
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    }
  };

  const noticias = [
    {
      id: 1,
      titulo: "Nuevos descubrimientos en Marte con el Perseverance",
      contenido: "El rover Perseverance ha encontrado evidencias de rocas ígneas en el cráter Jezero de Marte, sugiriendo actividad volcánica pasada. Estos hallazgos son cruciales para entender la historia geológica del planeta y la posible existencia de vida antigua.",
      fecha: "2024-10-15",
      imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-pia24836_perseverance_selfie_at_rochette-rVzigUbWWcCmFrjoj5pObaaqNHMKDt.jpg"
    },
    {
      id: 2,
      titulo: "Erupción solar masiva del 3 de octubre de 2024",
      contenido: "La NASA capturó una erupción solar de clase X9.0, una de las más poderosas, que podría afectar las comunicaciones y redes eléctricas en la Tierra. Esta actividad solar es estudiada para comprender mejor el comportamiento del Sol.",
      fecha: "2024-10-03",
      imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SDO_10-03-24_1219UTC_131-171_RedScreen_Band-nkDO7FntBaawwMr9YX8ZZI6fx6aYVY.jpg"
    },
    {
      id: 3,
      titulo: "Lanzamiento de la misión Europa Clipper",
      contenido: "La NASA se prepara para lanzar la misión Europa Clipper en 2024, que explorará la luna Europa de Júpiter. Se espera que esta misión estudie su océano subterráneo y las posibilidades de vida en sus aguas saladas.",
      fecha: "2024-09-20",
      imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ksc-20230920-ph-kls01-0126large-L0SB2ZxV7yxIUJIbMVKrowuKxteb6d.jpg"
    },
    {
      id: 4,
      titulo: "Continúa la misión Artemis hacia la Luna",
      contenido: "Las misiones Artemis están en marcha para devolver a los humanos a la Luna en esta década. Esta iniciativa ayudará a preparar el camino para la exploración humana de Marte y otros destinos del sistema solar.",
      fecha: "2024-09-10",
      imagen: "/placeholder.svg?height=300&width=400"
    },
    {
      id: 5,
      titulo: "El telescopio James Webb encuentra moléculas complejas en exoplanetas",
      contenido: "El telescopio espacial James Webb ha descubierto por primera vez en la atmósfera de exoplanetas moléculas complejas como el metano y el dióxido de carbono, lo que podría ser indicativo de procesos químicos que apoyen la vida. Esta imagen muestra la impresionante vista de la Nebulosa de Orión capturada por el telescopio, demostrando su capacidad para observar objetos celestes en diferentes longitudes de onda.",
      fecha: "2024-08-25",
      imagen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/new-a-ch3-mirim-nircam-collage-cc-gbv2-jpg-1LcOgwk4DFrAsPwkN03JNLmD29e8Nd.jpg"
    },
    {
      id: 6,
      titulo: "La NASA explora las posibles causas de la misteriosa pérdida de energía en Voyager 2",
      contenido: "La sonda Voyager 2 ha experimentado una pérdida de energía inesperada. Los ingenieros de la NASA están trabajando para optimizar su uso de energía y continuar con la misión de estudiar los confines del sistema solar.",
      fecha: "2024-08-15",
      imagen: "/placeholder.svg?height=300&width=400"
    }
  ];

  const filteredNoticias = noticias.filter(noticia =>
    noticia.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    noticia.contenido.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Navegación superior */}
      <nav className="bg-gray-900 py-4 px-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
          CosmoXplora
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/planetario" className="text-lg text-white hover:text-blue-400 transition-colors">Planetario</Link>
          <Link href="/foro" className="text-lg text-white hover:text-blue-400 transition-colors">Foro</Link>
          <div className="flex items-center space-x-4">
            <span className="text-white">{displayName}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {isGuest ? 'Salir' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <Scene />
          </Canvas>
        </div>
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex-grow container mx-auto px-4 py-8 overflow-y-auto">
            <h1 className="text-5xl font-bold mb-12 text-center text-white">Noticias del Cosmos</h1>
            <div className="max-w-md mx-auto mb-12">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar noticias"
                  className="w-full bg-gray-800 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
                <SearchIcon />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNoticias.map((noticia) => (
                <motion.div 
                  key={noticia.id} 
                  className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <img src={noticia.imagen} alt={noticia.titulo} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-3 text-blue-400">{noticia.titulo}</h2>
                    <p className="text-gray-300 mb-4 line-clamp-3">{noticia.contenido}</p>
                    <div className="flex items-center text-sm text-gray-400">
                      <CalendarIcon />
                      <span>{noticia.fecha}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <FloatingButton />
        </div>
      </div>
    </div>
  );
}