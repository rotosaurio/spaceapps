'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion';
import { signIn, useSession } from "next-auth/react";

function Stars({ count = 5000 }) {
  const points = useMemo(() => {
    const p = new Array(count).fill().map(() => (Math.random() - 0.5) * 20)
    return new Float32Array(p)
  }, [count])

  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.x -= delta / 20
    ref.current.rotation.y -= delta / 30
  })

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
  )
}

function InvisiblePlanet() {
  const ref = useRef()
  useFrame(() => {
    ref.current.rotation.y += 0.001
  })

  return (
    <mesh ref={ref} position={[3, -2, -5]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#000000" transparent opacity={0} />
    </mesh>
  )
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
  )
}

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Aquí es donde definimos status
  const { data: session, status } = useSession();

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
          action: 'register',
          nombre,
          correo,
          contraseña
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login');
      } else {
        setError(data.error || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error en el servidor');
    }
  };

  const rightImage = process.env.NEXT_PUBLIC_RIGHT_IMAGE || '/rocket.png';

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/noticias');
    }
  }, [status, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/noticias" });
    } catch (error) {
      setError("Error al iniciar sesión con Google");
    }
  };

  return (
    <main className="relative w-full min-h-screen overflow-hidden bg-black text-white font-sans">
      <Canvas className="absolute inset-0">
        <Scene />
      </Canvas>

      <Head>
        <title>Registro</title>
        <meta name="description" content="Página de registro" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="absolute inset-0 flex flex-col md:flex-row z-10">
        <div className="w-full md:w-1/2 p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8 text-center md:text-left">
              Registro
            </h1>
            {error && <p className="text-red-500 mb-4 text-center md:text-left">{error}</p>}
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <input 
                  type="text" 
                  placeholder="Nombre de usuario" 
                  required 
                  className="w-full bg-[#151626] text-white py-2 px-8 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-lg font-semibold tracking-wide"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Correo electrónico" 
                  required 
                  className="w-full bg-[#151626] text-white py-2 px-8 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-lg font-semibold tracking-wide"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  required 
                  className="w-full bg-[#151626] text-white py-2 px-8 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-lg font-semibold tracking-wide"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                />
              </div>
              <div className="mt-8 flex space-x-4">
                <motion.button 
                  type="submit" 
                  className="flex-1 bg-[#5D6C8C] text-white py-2 px-8 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-lg font-semibold tracking-wide"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Registrarse
                </motion.button>
                <motion.button 
                  type="button" 
                  onClick={handleGoogleSignIn}
                  className="flex-1 bg-[#5D6C8C] text-white py-2 px-8 rounded-full hover:bg-[#4A5670] focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] focus:ring-opacity-50 transition duration-300 text-lg font-semibold tracking-wide flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src="/google.png" alt="Google" className="w-14 h-10 mr-2" />
                  Google
                </motion.button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <a href="/login" className="text-white-200 hover:text-blue-300 transition duration-300">
                ¿Ya tienes una cuenta? Inicia sesión
              </a>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center">
          <motion.div 
            className="relative w-full h-full"
            animate={{
              rotate: [0, 10, -10, 0],
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
              alt="Imagen del astronauta"
              layout="fill"
              objectFit="contain"
              className="rounded-3xl"
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}