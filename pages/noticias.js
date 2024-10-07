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

export default function News() {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const [filter, setFilter] = useState('');

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
        console.error("Error verifying session:", error);
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

  const displayName = session?.user?.name || (isGuest ? 'Guest' : 'Anonymous User');

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
        console.error("Error logging out:", error);
      }
    }
  };

  const news = [
    {
      id: 1,
      title: "New discoveries on Mars with Perseverance",
      content: "The Perseverance rover has found evidence of igneous rocks in Mars' Jezero crater, suggesting past volcanic activity. These findings are crucial for understanding the planet's geological history and the possible existence of ancient life.",
      date: "2024-10-15",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-pia24836_perseverance_selfie_at_rochette-rVzigUbWWcCmFrjoj5pObaaqNHMKDt.jpg",
      link: "https://science.nasa.gov/mission/mars-2020-perseverance/"
    },
    {
      id: 2,
      title: "Massive solar eruption on October 3, 2024",
      content: "NASA captured a class X9.0 solar flare, one of the most powerful, which could affect communications and power grids on Earth. This solar activity is being studied to better understand the Sun's behavior.",
      date: "2024-10-03",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SDO_10-03-24_1219UTC_131-171_RedScreen_Band-nkDO7FntBaawwMr9YX8ZZI6fx6aYVY.jpg",
      link: "https://svs.gsfc.nasa.gov/4906"
    },
    {
      id: 3,
      title: "Launch of the Europa Clipper mission",
      content: "NASA is preparing to launch the Europa Clipper mission in 2024, which will explore Jupiter's moon Europa. This mission is expected to study its subsurface ocean and the possibilities of life in its salty waters.",
      date: "2024-09-20",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ksc-20230920-ph-kls01-0126large-L0SB2ZxV7yxIUJIbMVKrowuKxteb6d.jpg",
      link: "https://science.nasa.gov/mission/europa-clipper/"
    },
    {
      id: 4,
      title: "Artemis mission to the Moon continues",
      content: "The Artemis missions are underway to return humans to the Moon this decade. This initiative will help pave the way for human exploration of Mars and other destinations in the solar system.",
      date: "2024-09-10",
      image: "https://images-assets.nasa.gov/image/KSC-20220316-PH-KLS01_0308/KSC-20220316-PH-KLS01_0308~medium.jpg",
      link: "https://www.nasa.gov/humans-in-space/artemis/"
    },
    {
      id: 5,
      title: "James Webb telescope finds complex molecules in exoplanets",
      content: "The James Webb Space Telescope has discovered complex molecules such as methane and carbon dioxide in the atmosphere of exoplanets for the first time, which could be indicative of chemical processes that support life. This image shows the impressive view of the Orion Nebula captured by the telescope, demonstrating its ability to observe celestial objects at different wavelengths.",
      date: "2024-08-25",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/new-a-ch3-mirim-nircam-collage-cc-gbv2-jpg-1LcOgwk4DFrAsPwkN03JNLmD29e8Nd.jpg",
      link: "https://science.nasa.gov/mission/webb/"
    },
    {
      id: 6,
      title: "NASA explores possible causes of mysterious energy loss in Voyager 2",
      content: "The Voyager 2 probe has experienced an unexpected loss of energy. NASA engineers are working to optimize its energy use and continue the mission to study the outer reaches of the solar system.",
      date: "2024-08-15",
      image: "https://photojournal.jpl.nasa.gov/jpegMod/PIA17049_modest.jpg",
      link: "https://science.nasa.gov/mission/voyager"
    }
  ];

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(filter.toLowerCase()) ||
    item.content.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Top navigation */}
      <nav className="bg-gray-900 py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors mb-4 sm:mb-0">
            CosmoXplora
          </Link>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/planetario" className="text-lg text-white hover:text-blue-400 transition-colors">Planetarium</Link>
            <Link href="/foro" className="text-lg text-white hover:text-blue-400 transition-colors">Forum</Link>
            <div className="flex items-center space-x-4">
              <span className="text-white">{displayName}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                {isGuest ? 'Exit' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <Scene />
          </Canvas>
        </div>
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-center text-white">Cosmic News</h1>
            <div className="max-w-md mx-auto mb-8 sm:mb-12">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search news"
                  className="w-full bg-gray-800 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredNews.map((item) => (
                <motion.div 
                  key={item.id} 
                  className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                  <div className="p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-blue-400">{item.title}</h2>
                    <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 line-clamp-3">{item.content}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <CalendarIcon className="mr-2" />
                        <span>{item.date}</span>
                      </div>
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        More information
                      </a>
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