import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

// Datos de los miembros del equipo
const teamMembers = [
  {
    name: "Edgar Rivera",
    role: "Comandante de Misión",
    description: "Líder estratégica con experiencia en programacion",
    imageUrl: "/Edgar.jpg",
    //icon: "rocket"
  },
  {
    name: "Cristian Cruz",
    role: "Tecnico",
    description: "Programador",
    imageUrl: "/Cristian_Cruz.jpg",
    //icon: "radio"
  },
  {
    name: "Karely Rodriguez",
    role: "Cientifica",
    description: "Investigadora",
    imageUrl: "/yo.jpg",
    //icon: "microscope"
  },
  {
    name: "Angel Sanchez",
    role: "Tecnico",
    description: "Encargado del diseño 3D",
    imageUrl: "/Angel_Sanchez.jpg",
    //icon: "shield"
  },
  {
    name: "Milo Garcia",
    role: "Cientifico",
    description: "Encargado del diseño 3D",
    imageUrl: "/Milo_Garcia.jpg",
    //icon: "cog"
  },
  {
    name: "Hector Murgia",
    role: "Especialista en Comunicaciones",
    description: "Responsable de la administracion",
    imageUrl: "/Hector_Garcia.jpg",
    //icon: "first-aid"
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

      <header className="mb-12">
        <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Exploradores del Cosmos: Chihuahua 2024
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Conoce a los valientes pioneros que llevarán Space Apps Chihuahua más allá de las estrellas
        </p>
        <Link href="/noticias">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
            Ver Noticias
          </button>
        </Link>
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
                <p className="member-description">{member.description}</p>
              </div>
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
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

        .explorers-team {
          position: relative;
          min-height: 100vh;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          z-index: 1;
          font-family: 'Segoe UI', sans-serif;
          color: #F2E0DC;
        }
        header {
          text-align: center;
          margin-bottom: 3rem;
        }
        h1 {
          font-family: 'Orbitron', sans-serif;
          font-size: 3rem;
          color: #F2E0DC;
          text-shadow: 0 0 10px rgba(242, 224, 220, 0.5);
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
          border: 2px solid #F2E0DC;
          transition: transform 0.3s;
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .team-member:hover {
          transform: scale(1.05);
        }
        .member-window {
          position: relative;
          height: 300px;
          border-radius: 1rem;
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        .member-image {
          width: 100%;
          height: 100%;
          transition: transform 0.3s ease;
        }
        .member-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.7);
          color: #F2E0DC;
          padding: 1rem;
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }
        .team-member:hover .member-info {
          transform: translateY(0);
        }
        .team-member:hover .member-image {
          transform: scale(1.1);
        }
        .member-info h3 {
          font-size: 1.25rem;
          margin: 0 0 0.25rem;
          color: #F2E0DC;
        }
        .member-info h4 {
          font-size: 1rem;
          color: #F2E0DC;
          margin: 0 0 0.5rem;
        }
        .member-description {
          font-size: 0.875rem;
          color: #F2E0DC;
          margin: 0;
        }
        .back-button {
          text-align: center;
          margin-top: 3rem;
        }
        #back-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #F2E0DC;
          color: #1E293B;
          text-decoration: none;
          font-weight: bold;
          border-radius: 9999px;
          transition: all 0.3s;
        }
        #back-button:hover {
          background: #E6C8C3;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default TeamPage;