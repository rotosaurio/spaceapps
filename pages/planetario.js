import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Link from 'next/link';
import { signOut, useSession } from "next-auth/react";

export default function Planetario() {
  const mountRef = useRef(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const currentMount = mountRef.current;

    // Escena
    const scene = new THREE.Scene();

    // Fondo estrellado
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('/2k_stars.jpg');
    scene.background = backgroundTexture;

    // Cámara
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 20, 30);

    // Renderizador
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // Función para crear planetas
    const createPlanet = (radius, texture, position) => {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        map: textureLoader.load(texture),
        shininess: 60,
        specular: new THREE.Color(0xaaaaaa),  // Color especular más claro
        emissive: new THREE.Color(0x111111),  // Reduce la emisividad
        emissiveIntensity: 0.1  // Reduce la intensidad emisiva
      });
      const planet = new THREE.Mesh(geometry, material);
      planet.position.set(position, 0, 0);
      scene.add(planet);
      return planet;
    };

    // Crear planetas
    const sun = createPlanet(3, '/2k_sun.jpg', 0);
    const mercury = createPlanet(0.2, '/2k_mercury.jpg', 6);
    const venus = createPlanet(0.3, '/2k_venus_surface.jpg', 8);
    const earth = createPlanet(0.4, '/2k_earth_daymap.jpg', 11);
    const mars = createPlanet(0.25, '/2k_mars.jpg', 14);

    // Luz dinámica del sol
    const sunLight = new THREE.PointLight(0xffffff, 8, 100);
    sun.add(sunLight);

// Luz ambiental más clara
const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); // Luz blanca y más intensa
scene.add(ambientLight);

    // Crear órbitas
    const createOrbit = (radius) => {
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
      const orbitPoints = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
      }
      orbitGeometry.setFromPoints(orbitPoints);
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbit);
    };

    createOrbit(6);  // Mercurio
    createOrbit(8);  // Venus
    createOrbit(11); // Tierra
    createOrbit(14); // Marte

    // Controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Función de animación
    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Rotación y órbita de los planetas
      mercury.position.x = Math.cos(time * 0.5) * 6;
      mercury.position.z = Math.sin(time * 0.5) * 6;
      mercury.rotation.y += 0.005;

      venus.position.x = Math.cos(time * 0.3) * 8;
      venus.position.z = Math.sin(time * 0.3) * 8;
      venus.rotation.y += 0.003;

      earth.position.x = Math.cos(time * 0.2) * 11;
      earth.position.z = Math.sin(time * 0.2) * 11;
      earth.rotation.y += 0.01;

      mars.position.x = Math.cos(time * 0.15) * 14;
      mars.position.z = Math.sin(time * 0.15) * 14;
      mars.rotation.y += 0.008;

      // Actualizar la intensidad de la luz del sol
      const lightIntensity = 4 + Math.sin(time * 0.5) * 1;
      sunLight.intensity = lightIntensity;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Manejo de redimensionamiento
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Limpieza
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-black py-4 px-4 flex justify-between items-center">
        <div className="w-96 h-24">
          <img src="/Logo cosmoXplora.png" alt="Logo CosmoXplora" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center">
          <span className="text-white mr-4">{session?.user?.name || 'Usuario Anónimo'}</span>
          <button 
            onClick={handleLogout}
            className="text-white bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
      <div ref={mountRef} style={{ width: '100%', height: 'calc(100vh - 8rem)' }} />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Link href="/foro">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Ir al Foro
          </button>
        </Link>
      </div>
    </div>
  );
}