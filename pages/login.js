import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { signIn, useSession } from "next-auth/react";
import Image from 'next/image';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarRef = useRef(null);
  const [imagePosition, setImagePosition] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/noticias');
    }
  }, [status, router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const createStars = () => {
      const numberOfStars = 500;
      const stars = [];
      for (let i = 0; i < numberOfStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          speed: Math.random() * 0.1 // Velocidad reducida
        });
      }
      return stars;
    };

    const drawStars = (stars) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
      });
    };

    const moveStars = (stars) => {
      stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });
    };

    const createShootingStar = () => {
      return {
        x: Math.random() * canvas.width,
        y: 0,
        length: Math.random() * 80 + 20,
        speed: Math.random() * 10 + 10,
        angle: Math.PI / 4
      };
    };

    const drawShootingStar = (star) => {
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x - star.length * Math.cos(star.angle), 
                 star.y + star.length * Math.sin(star.angle));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const moveShootingStar = (star) => {
      star.x += star.speed * Math.cos(star.angle);
      star.y += star.speed * Math.sin(star.angle);
    };

    const animateStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      moveStars(starsRef.current);
      drawStars(starsRef.current);

      if (shootingStarRef.current) {
        moveShootingStar(shootingStarRef.current);
        drawShootingStar(shootingStarRef.current);

        if (shootingStarRef.current.y > canvas.height || 
            shootingStarRef.current.x > canvas.width) {
          shootingStarRef.current = null;
        }
      }

      requestAnimationFrame(animateStars);
    };

    starsRef.current = createStars();
    animateStars();

    const shootingStarInterval = setInterval(() => {
      shootingStarRef.current = createShootingStar();
    }, 10000);

    window.addEventListener('resize', () => {
      resizeCanvas();
      starsRef.current = createStars();
    });

    // Animación de la imagen
    const animateImage = () => {
      setImagePosition(prev => (prev + 0.05) % 100); // Movimiento más lento
    };

    const imageInterval = setInterval(animateImage, 50);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(shootingStarInterval);
      clearInterval(imageInterval);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/autenticacion', {
        action: 'login',
        correo,
        contraseña
      });

      localStorage.setItem('token', response.data.token);
      router.push('/noticias');
    } catch (error) {
      setError(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/noticias" });
    } catch (error) {
      setError("Error al iniciar sesión con Google");
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Formulario en el lado izquierdo */}
      <div className="w-1/2 flex items-center justify-center relative z-10">
        <div className="max-w-md w-full space-y-8 p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Iniciar Sesión
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="correo" className="sr-only">
                  Correo Electrónico
                </label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                    border-gray-600 placeholder-gray-400 text-white rounded-t-md focus:outline-none 
                    focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-[#454754]"
                  placeholder="Correo Electrónico"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contraseña" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="contraseña"
                  name="contraseña"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                    border-gray-600 placeholder-gray-400 text-white rounded-b-md focus:outline-none 
                    focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-[#454754]"
                  placeholder="Contraseña"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4"
              >
                Iniciar Sesión
              </button>

              <button 
                type="button" 
                onClick={() => signIn('google')}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 mb-4"
              >
                Iniciar Sesión con Google
              </button>

              <p className="text-center text-white">
                ¿No tienes una cuenta? 
                <Link href="/register" className="text-blue-400 hover:text-blue-300 ml-1">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
          {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
        </div>
      </div>
      
      {/* Imagen en el lado derecho */}
      <div className="w-1/2 relative overflow-hidden flex items-center justify-center">
        <div 
          className="relative w-2/3 h-2/3 mix-blend-screen" 
          style={{
            transform: `translateY(${imagePosition}px) rotate(30deg)`,
            transition: 'transform 0.5s ease-out'
          }}
        >
          <Image
            src="/astro.png"
            alt="Astronauta"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </div>

      <style jsx global>{`
        body, html {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: black;
          color: white;
        }
        canvas {
          display: block;
        }
        .mix-blend-screen {
          mix-blend-mode: screen;
        }
      `}</style>
    </div>
  );
}