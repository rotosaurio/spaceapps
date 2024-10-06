import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import FloatingButton from '../components/FloatingButton';
import Link from 'next/link';
import { signOut, useSession } from "next-auth/react";

const Planetario = () => {
  const mountRef = useRef(null);
  const { data: session, status } = useSession();
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

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
    const createPlanet = (radius, texture, position, name) => {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        map: textureLoader.load(texture),
        shininess: 60,
        specular: new THREE.Color(0xaaaaaa),
        emissive: new THREE.Color(0x111111),
        emissiveIntensity: 0.1
      });
      const planet = new THREE.Mesh(geometry, material);
      planet.position.set(position, 0, 0);
      planet.name = name;
      scene.add(planet);

      // Crear órbita
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
      const orbitPoints = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(Math.cos(angle) * position, 0, Math.sin(angle) * position));
      }
      orbitGeometry.setFromPoints(orbitPoints);
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      orbit.name = `${name}Orbit`;
      scene.add(orbit);

      return { planet, orbit };
    };

    // Crear planetas
    const sun = createPlanet(3, '/2k_sun.jpg', 0, 'Sun');
    const mercury = createPlanet(0.2, '/2k_mercury.jpg', 6, 'Mercury');
    const venus = createPlanet(0.3, '/2k_venus_surface.jpg', 8, 'Venus');
    const earth = createPlanet(0.4, '/2k_earth_daymap.jpg', 11, 'Earth');
    const mars = createPlanet(0.25, '/2k_mars.jpg', 14, 'Mars');
    const jupiter = createPlanet(1.2, '/2k_jupiter.jpg', 25, 'Jupiter');
    const saturn = createPlanet(1, '/2k_saturn.jpg', 32, 'Saturn');
    const uranus = createPlanet(0.8, '/2k_uranus.jpg', 38, 'Uranus');
    const neptune = createPlanet(0.7, '/2k_neptune.jpg', 44, 'Neptune');

    // Luz dinámica del sol
    const sunLight = new THREE.PointLight(0xffffff, 8, 100);
    sun.planet.add(sunLight);

    // Luz ambiental más clara
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);

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
      mercury.planet.position.x = Math.cos(time * 0.5) * 6;
      mercury.planet.position.z = Math.sin(time * 0.5) * 6;
      mercury.planet.rotation.y += 0.005;

      venus.planet.position.x = Math.cos(time * 0.3) * 8;
      venus.planet.position.z = Math.sin(time * 0.3) * 8;
      venus.planet.rotation.y += 0.003;

      earth.planet.position.x = Math.cos(time * 0.2) * 11;
      earth.planet.position.z = Math.sin(time * 0.2) * 11;
      earth.planet.rotation.y += 0.01;

      mars.planet.position.x = Math.cos(time * 0.15) * 14;
      mars.planet.position.z = Math.sin(time * 0.15) * 14;
      mars.planet.rotation.y += 0.008;

      jupiter.planet.position.x = Math.cos(time * 0.1) * 25;
      jupiter.planet.position.z = Math.sin(time * 0.1) * 25;
      jupiter.planet.rotation.y += 0.004;

      saturn.planet.position.x = Math.cos(time * 0.08) * 32;
      saturn.planet.position.z = Math.sin(time * 0.08) * 32;
      saturn.planet.rotation.y += 0.0038;

      uranus.planet.position.x = Math.cos(time * 0.06) * 38;
      uranus.planet.position.z = Math.sin(time * 0.06) * 38;
      uranus.planet.rotation.y += 0.003;

      neptune.planet.position.x = Math.cos(time * 0.05) * 44;
      neptune.planet.position.z = Math.sin(time * 0.05) * 44;
      neptune.planet.rotation.y += 0.0028;

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

    // Manejo de clics
    const handleClick = (event) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      mouse.x = (event.clientX / currentMount.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / currentMount.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const planetName = clickedObject.name.replace('Orbit', '');
        setSelectedPlanet(planetName);
        setShowPopup(true);

        // Añadir brillo al planeta
        const planet = scene.getObjectByName(planetName);
        if (planet) {
          const glow = new THREE.PointLight(0xffffff, 1, 10);
          glow.position.copy(planet.position);
          scene.add(glow);

          // Eliminar el brillo después de 2 segundos
          setTimeout(() => {
            scene.remove(glow);
          }, 2000);
        }
      } else {
        setShowPopup(false);
      }
    };

    currentMount.addEventListener('click', handleClick);

    // Limpieza
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('click', handleClick);
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
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {showPopup && (
        <div className="absolute top-20 right-4 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">{selectedPlanet}</h2>
          <p>Información sobre {selectedPlanet}</p>
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Link href="/foro">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Ir al Foro
          </button>
        </Link>
      </div>
      <div style={{ position: 'absolute', right: '20px', bottom: '20px' }}>
        <FloatingButton />
      </div>
    </div>
  );
};

export default Planetario;