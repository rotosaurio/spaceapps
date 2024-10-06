'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

function StarryBackground() {
  return (
    <Canvas style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </Canvas>
  )
}

function Meteor({ position }) {
  const mesh = useRef()
  useFrame((state, delta) => {
    mesh.current.position.y -= delta * 10
    if (mesh.current.position.y < -10) {
      mesh.current.position.set(
        Math.random() * 20 - 10,
        10,
        Math.random() * 10 - 5
      )
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  )
}

function MeteorShower() {
  return (
    <Canvas style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <Meteor key={i} position={[Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 10 - 5]} />
      ))}
    </Canvas>
  )
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const audio = new Audio('/meteor-sound.mp3')
    audio.loop = true
    audio.volume = 0.1
    audio.play().catch(error => console.log('Audio play failed:', error))
    return () => {
      audio.pause()
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white relative overflow-hidden">
      <StarryBackground />
      <MeteorShower />
      <div className="z-10 text-center">
        <h1 className="text-6xl font-bold mb-4 animate-pulse">¡Hola Mundo!</h1>
        <p className="text-xl mb-8">Acompáñanos a esta aventura</p>
        <div className="space-x-4">
          <Link href="/login">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
              Login
            </button>
          </Link>
          
          <Link href="/register">
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
              Register
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}