"use client"

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'

function Stars({ count = 5000 }) {
  const points = useMemo(() => {
    const p = new Array(count).fill().map(() => (Math.random() - 0.5) * 20)
    return new Float32Array(p)
  }, [count])

  const ref = useRef()
  useFrame((state, delta) => {
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
  useFrame((state) => {
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

function Button({ href, children, variant = "default", onClick }) {
  const baseClasses = "px-4 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-full transition-colors duration-300 shadow-lg"
  const variantClasses = {
    default: "bg-white text-black hover:bg-gray-200",
    outline: "bg-transparent text-white border-2 border-white hover:bg-white hover:text-black"
  }

  if (onClick) {
    return (
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${baseClasses} ${variantClasses[variant]}`}
        onClick={onClick}
      >
        {children}
      </motion.button>
    )
  }

  return (
    <Link href={href} passHref>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${baseClasses} ${variantClasses[variant]}`}
      >
        {children}
      </motion.button>
    </Link>
  )
}

export default function NASAGalaxyPortal() {
  const router = useRouter()

  const handleGuestAccess = () => {
    localStorage.setItem('guestToken', 'true')
    router.push('/foro')
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
      <Canvas className="absolute inset-0">
        <Scene />
      </Canvas>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 sm:px-6 lg:px-8">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white text-center"
        >
          CosmoXplora
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-base sm:text-lg mb-12 text-gray-300"
        >
          Embárcate en un viaje interestelar
        </motion.p>
        <div className="space-y-4 flex flex-col items-center">
          <div className="space-x-6">
            <Button href="/login">
              Iniciar Sesión
            </Button>
            <Button href="/register">
              Registrarse
            </Button>
          </div>
          <Button onClick={() => router.push('/noticias')} variant="outline">
            Acceso de Invitado
          </Button>
          <Button href="/team-page" variant="outline">
            Nuestro Equipo
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-4 left-4 text-gray-500 text-sm"
      >
        © {new Date().getFullYear()} Intolerantes al js
      </motion.div>
    </main>
  )
}