'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import Link from 'next/link'
import { motion } from 'framer-motion'

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

function Button({ href, children }) {
  return (
    <Link href={href}>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-3 bg-white text-black text-lg font-semibold rounded-full hover:bg-gray-200 transition-colors duration-300 shadow-lg"
      >
        {children}
      </motion.button>
    </Link>
  )
}

export default function NASAGalaxyPortal() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
      <Canvas className="absolute inset-0">
        <Scene />
      </Canvas>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl font-bold mb-4 text-white"
        >
          CosmoXplora
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-xl mb-12 text-gray-300"
        >
          Embárcate en un viaje interestelar
        </motion.p>
        <div className="space-x-6">
          <Button href="/login">
            Iniciar Sesión
          </Button>
          <Button href="/register">
            Registrarse
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