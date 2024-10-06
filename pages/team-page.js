import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

// Datos de los miembros del equipo
const teamMembers = [
  {
    name: "Alejandra Vega",
    role: "Comandante de Misión",
    description: "Líder estratégica con experiencia en exploración espacial",
    imageUrl: "/placeholder.svg",
    icon: "rocket"
  },
  {
    name: "Roberto Núñez",
    role: "Especialista en Comunicaciones",
    description: "Experto en sistemas de comunicación interplanetaria",
    imageUrl: "/placeholder.svg",
    icon: "radio"
  },
  {
    name: "Isabel Moreno",
    role: "Astrobióloga",
    description: "Investigadora de formas de vida extraterrestre",
    imageUrl: "/placeholder.svg",
    icon: "microscope"
  },
  {
    name: "Diego Torres",
    role: "Oficial de Seguridad",
    description: "Encargado de la protección y defensa de la nave",
    imageUrl: "/placeholder.svg",
    icon: "shield"
  },
  {
    name: "Sofía Ramírez",
    role: "Ingeniera de Propulsión",
    description: "Especialista en sistemas de propulsión avanzados",
    imageUrl: "/placeholder.svg",
    icon: "cog"
  },
  {
    name: "Javier Mendoza",
    role: "Médico Espacial",
    description: "Responsable de la salud y bienestar de la tripulación",
    imageUrl: "/placeholder.svg",
    icon: "first-aid"
  }
];

const TeamPage = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Configuración de la escena Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Crear estrellas
    const createStars = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(5000 * 3).map(() => (Math.random() - 0.5) * 20);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const material = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.02,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      return new THREE.Points(geometry, material);
    };

    const stars = createStars();
    scene.add(stars);

    camera.position.z = 5;

    // Función de animación
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.x -= 0.0005;
      stars.rotation.y -= 0.0003;
      renderer.render(scene, camera);
    };

    animate();

    // Manejar el redimensionamiento de la ventana
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Limpieza
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose(); // Asegúrate de liberar recursos
    };
  }, []);

  return (
    <div className="explorers-team">
      <Head>
        <title>Exploradores del Cosmos: Chihuahua 2024</title>
        <meta name="description" content="Conoce a los valientes pioneros que llevarán Space Apps Chihuahua más allá de las estrellas" />
      </Head>

      <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />

      <header>
        <h1>Exploradores del Cosmos: Chihuahua 2024</h1>
        <p>Conoce a los valientes pioneros que llevarán Space Apps Chihuahua más allá de las estrellas</p>
      </header>

      <div className="team-members">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-member">
            <div className="member-window">
              <div className="member-image">
                <Image src={member.imageUrl} alt={member.name} width={300} height={300} />
              </div>
              <div className="member-info">
                <h3>{member.name}</h3>
                <h4>{member.role}</h4>
              </div>
            </div>
            <div className="member-description">
              <p>{member.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="back-button">
        <Link href="/mission-control" id="back-button">
          Regresar al Centro de Control de Misión
        </Link>
      </div>

      <style jsx>{`
        .explorers-team {
          position: relative;
          min-height: 100vh;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          z-index: 1;
          font-family: 'Segoe UI', sans-serif;
          color: white;
        }
        header {
          text-align: center;
          margin-bottom: 3rem;
        }
        h1 {
          font-size: 3rem;
          background: linear-gradient(to right, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .team-members {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }
        .team-member {
          background-color: rgba(30, 41, 59, 0.8);
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 2px solid #4299e1;
          transition: transform 0.3s, box-shadow 0.3s;
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .team-member:hover {
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(66, 153, 225, 0.6);
        }
        .member-window {
          position: relative;
          height: 200px;
          border-radius: 1rem 1rem 0 0;
          overflow: hidden;
        }
        .member-window::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, transparent 60%, rgba(0, 0, 0, 0.5) 100%);
          z-index: 1;
        }
        .member-image {
          width: 100%;
          height: 100%;
        }
        .member-info {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          color: white;
          z-index: 2;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
        }
        .member-info h3 {
          font-size: 1.25rem;
          margin: 0 0 0.25rem;
        }
        .member-info h4 {
          font-size: 1rem;
          color: #60a5fa;
          margin: 0;
        }
        .member-description {
          padding: 1rem;
          background-color: rgba(30, 41, 59, 0.9);
        }
        .member-description p {
          font-size: 0.875rem;
          color: #cbd5e1;
          margin: 0;
        }
        .back-button {
          text-align: center;
          margin-top: 3rem;
        }
        #back-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          color: white;
          text-decoration: none;
          font-weight: bold;
          border-radius: 9999px;
          transition: all 0.3s;
        }
        #back-button:hover {
          background: linear-gradient(to right, #2563eb, #7c3aed);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default TeamPage;