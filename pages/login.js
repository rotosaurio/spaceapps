'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { signIn, useSession } from "next-auth/react";
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

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

function InvisiblePlanet() {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y += 0.001;
  });

  return (
    <mesh ref={ref} position={[3, -2, -5]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#000000" transparent opacity={0} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <Stars />
      <InvisiblePlanet />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
    </>
  );
}

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
      const response = await fetch('/api/autenticacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          correo,
          contraseña,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/noticias');
      } else {
        setError(data.error || 'Error en el inicio de sesión');
      }
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

  const rightImage = process.env.NEXT_PUBLIC_RIGHT_IMAGE || '/astro.png';

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black text-white font-sans">
      <Canvas className="absolute inset-0">
        <Scene />
      </Canvas>

      <Head>
        <title>Iniciar Sesión</title>
        <meta name="description" content="Página de inicio de sesión" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="absolute inset-0 flex flex-col lg:flex-row z-10">
        <main className="w-full lg:w-2/3 p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <motion.h1 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-4xl sm:text-5xl font-bold text-white mb-8 text-center lg:text-left"
            >
              Iniciar Sesión
            </motion.h1>
            {error && <p className="text-red-500 mb-4 text-center lg:text-left">{error}</p>}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <input 
                  type="email" 
                  placeholder="Correo electrónico" 
                  required 
                  className="w-full bg-[#151626] text-white py-3 px-4 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-base sm:text-lg"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  required 
                  className="w-full bg-[#151626] text-white py-3 px-4 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-base sm:text-lg"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.button 
                  type="submit" 
                  className="flex-1 bg-[#5D6C8C] text-white py-2 px-4 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-base sm:text-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Iniciar Sesión
                </motion.button>
                <motion.button 
                  type="button" 
                  onClick={handleGoogleSignIn}
                  className="flex-1 bg-[#5D6C8C] text-white py-2 px-4 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-base sm:text-lg font-semibold flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src="/google.png" alt="Google" className="w-6 h-6 mr-2" />
                  Google
                </motion.button>
              </div>
            </form>
          </div>
        </main>

        <div className="hidden lg:flex w-1/2 items-center justify-center p-8">
          <motion.div 
            className="relative w-full h-full"
            style={{ 
              maxWidth: '65%', 
              maxHeight: '90%', 
              transform: `rotate(30deg) translateY(${imagePosition}px)`,
              transition: 'transform 0.5s ease-out'
            }}
            animate={{
              rotate: [30, 35, 25, 30],
              y: [0, -20, 20, 0]
            }}
            transition={{
              duration: 10,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <Image
              src={rightImage}
              alt="Imagen de inicio de sesión"
              layout="fill"
              objectFit="contain"
            />
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-4 left-4 text-gray-500 text-sm z-10"
      >
        © {new Date().getFullYear()} Intolerantes al js
      </motion.div>
    </div>
  );
}