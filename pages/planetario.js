import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import FloatingButton from '../components/FloatingButton';
import Link from 'next/link';
import { signOut, useSession } from "next-auth/react";
import TWEEN from '@tweenjs/tween.js';

const planetInfo = [
  {
    name: 'Sun',
    description: 'La estrella central de nuestro sistema solar.',
    diameter: '1,391,000 km',
    distanceFromSun: '0 km',
    orbitalPeriod: 'N/A',
    dayLength: '25-35 días terrestres (en el ecuador)'
  },
  {
    name: 'Mercury',
    description: 'El planeta más pequeño y más cercano al Sol.',
    diameter: '4,879 km',
    distanceFromSun: '57.9 millones km',
    orbitalPeriod: '88 días terrestres',
    dayLength: '59 días terrestres'
  },
  {
    name: 'Venus',
    description: 'A menudo llamado el gemelo de la Tierra debido a su tamaño similar.',
    diameter: '12,104 km',
    distanceFromSun: '108.2 millones km',
    orbitalPeriod: '225 días terrestres',
    dayLength: '243 días terrestres'
  },
  {
    name: 'Earth',
    description: 'Nuestro hogar, el único planeta conocido con vida.',
    diameter: '12,742 km',
    distanceFromSun: '149.6 millones km',
    orbitalPeriod: '365.25 días',
    dayLength: '24 horas'
  },
  {
    name: 'Mars',
    description: 'Conocido como el planeta rojo, objetivo de muchas misiones espaciales.',
    diameter: '6,779 km',
    distanceFromSun: '227.9 millones km',
    orbitalPeriod: '687 días terrestres',
    dayLength: '24 horas 37 minutos'
  },
  {
    name: 'Asteroid Belt',
    description: 'Región entre Marte y Júpiter con numerosos asteroides.',
    diameter: 'Varía',
    distanceFromSun: '329-478 millones km',
    orbitalPeriod: 'Varía',
    dayLength: 'Varía'
  },
  {
    name: 'Jupiter',
    description: 'El planeta más grande del sistema solar.',
    diameter: '139,820 km',
    distanceFromSun: '778.5 millones km',
    orbitalPeriod: '11.9 años terrestres',
    dayLength: '9 horas 56 minutos'
  },
  {
    name: 'Saturn',
    description: 'Famoso por sus anillos, compuestos principalmente de hielo y roca.',
    diameter: '116,460 km',
    distanceFromSun: '1.434 billones km',
    orbitalPeriod: '29.5 años terrestres',
    dayLength: '10 horas 42 minutos'
  },
  {
    name: 'Uranus',
    description: 'Un gigante de hielo con un eje de rotación único.',
    diameter: '50,724 km',
    distanceFromSun: '2.871 billones km',
    orbitalPeriod: '84 años terrestres',
    dayLength: '17 horas 14 minutos'
  },
  {
    name: 'Neptune',
    description: 'El planeta más ventoso, con vientos que superan los 2,100 km/h.',
    diameter: '49,244 km',
    distanceFromSun: '4.495 billones km',
    orbitalPeriod: '164.8 años terrestres',
    dayLength: '16 horas 6 minutos'
  }
];

const Planetario = () => {
  const mountRef = useRef(null);
  const { data: session, status } = useSession();
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [detailedView, setDetailedView] = useState(false);
  const [shouldReturnToFullView, setShouldReturnToFullView] = useState(false);

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

    // Crear cinturón de asteroides
    const asteroidBelt = new THREE.Group();
    for (let i = 0; i < 400; i++) {
      const radius = Math.random() * 0.1 + 0.05;
      const geometry = new THREE.SphereGeometry(radius, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x888888,
        shininess: 0,
        specular: 0x000000
      });
      const asteroid = new THREE.Mesh(geometry, material);
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 4 + 18; // Entre Marte y Júpiter
      asteroid.position.set(
        Math.cos(angle) * distance,
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * distance
      );
      asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      asteroidBelt.add(asteroid);
    }
    scene.add(asteroidBelt);

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

    const focusOnPlanet = (planet) => {
      const planetPosition = new THREE.Vector3();
      planet.getWorldPosition(planetPosition);

      const distance = planet.geometry.boundingSphere.radius * 3;
      const targetPosition = new THREE.Vector3(0, 0, distance);

      new TWEEN.Tween(planet.position)
        .to({ x: 0, y: 0, z: 0 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      new TWEEN.Tween(camera.position)
        .to(targetPosition, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      new TWEEN.Tween(controls.target)
        .to({ x: 0, y: 0, z: 0 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      setDetailedView(true);
    };

    // Función de animación
    const animate = () => {
      requestAnimationFrame(animate);

      if (!isPaused) {
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
      }

      TWEEN.update();
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
      if (detailedView) return;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      mouse.x = (event.clientX / currentMount.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / currentMount.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        let planetName = clickedObject.name.replace('Orbit', '');
        if (planetName === 'Asteroid') planetName = 'Asteroid Belt';
        
        const planetData = planetInfo.find(p => p.name === planetName);
        if (planetData) {
          setSelectedPlanet(planetData);
          setShowPopup(true);

          const planet = scene.getObjectByName(planetName);
          if (planet) {
            focusOnPlanet(planet);
          }
        }
      } else {
        setShowPopup(false);
      }
    };

    currentMount.addEventListener('click', handleClick);

    if (shouldReturnToFullView) {
      new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 20, z: 30 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      new TWEEN.Tween(controls.target)
        .to({ x: 0, y: 0, z: 0 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      setDetailedView(false);
      setShowPopup(false);
      setShouldReturnToFullView(false);
    }

    // Limpieza
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('click', handleClick);
      currentMount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [isPaused, shouldReturnToFullView]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const returnToFullView = () => {
    setShouldReturnToFullView(true);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {showPopup && selectedPlanet && (
        <div className="absolute top-20 right-4 bg-[#5D6C8C] bg-opacity-50 p-4 rounded-lg shadow-lg max-w-md text-white">
          <h2 className="text-2xl font-bold mb-2">{selectedPlanet.name}</h2>
          <p className="mb-2">{selectedPlanet.description}</p>
          <p><strong>Diámetro:</strong> {selectedPlanet.diameter}</p>
          <p><strong>Distancia del Sol:</strong> {selectedPlanet.distanceFromSun}</p>
          <p><strong>Período orbital:</strong> {selectedPlanet.orbitalPeriod}</p>
          <p><strong>Duración del día:</strong> {selectedPlanet.dayLength}</p>
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
        >
          {isPaused ? 'Reanudar' : 'Pausar'}
        </button>
        <Link href="/foro">
          <button className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
            Ir al Foro
          </button>
        </Link>
      </div>
      {detailedView && (
        
        <button
          onClick={returnToFullView}
          className="absolute top-4 left-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded z-10">
            <Link href="/noticias" className="text-lg text-white hover:text-blue-400 transition-colors">Volver</Link>
          
        </button>
        
      )}
      <div style={{ position: 'absolute', left: '600px', bottom: '40px' }}>
  <FloatingButton />
    </div>
    </div>
  );
};

export default Planetario;