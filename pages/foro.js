import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { signOut, useSession } from "next-auth/react";

const categorias = [
  "We are alone in the universe",
  "How do wormholes work?",
  "The search for extraterrestrial life",
  "Cosmology",
  "Space missions",
  "Telescope imaging",
  "Astrophysics"
];

export default function Foro() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState('');
  const [error, setError] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [publicacionesPorCategoria, setPublicacionesPorCategoria] = useState({});

  const displayName = session?.user?.name || 'Usuario Anónimo';

  useEffect(() => {
    if (status === "unauthenticated") {
      // router.push('/login'); // Eliminar esta línea
    } else {
      cargarPublicaciones();
    }
  }, [status, router]);

  const cargarPublicaciones = async () => {
    try {
      const response = await axios.get('/api/foro');
      setPublicaciones(response.data);
      
      // Contar publicaciones por categoría
      const conteo = categorias.reduce((acc, cat) => {
        acc[cat] = response.data.filter(pub => pub.categoria === cat).length;
        return acc;
      }, {});
      setPublicacionesPorCategoria(conteo);
    } catch (error) {
      console.error("Error al cargar las publicaciones:", error);
    }
  };

  const manejarPublicacion = async (e) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim() || !contenido.trim() || !categoria) {
      setError('El título, contenido y categoría son obligatorios.');
      return;
    }

    try {
      const data = { titulo, contenido, categoria, nombre: displayName };

      if (editando) {
        await axios.put(`/api/foro?id=${editando._id}`, data);
        setPublicaciones(publicaciones.map(pub => 
          pub._id === editando._id ? { ...pub, titulo, contenido, categoria } : pub
        ));
        setEditando(null);
      } else {
        const response = await axios.post('/api/foro', data);
        setPublicaciones([response.data.publicacion, ...publicaciones]);
      }

      setTitulo('');
      setContenido('');
      setCategoria('');
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error al gestionar la publicación:", error);
      setError(error.response?.data?.error || 'Error al gestionar la publicación.');
    }
  };

  const handleEditar = (pub) => {
    setEditando(pub);
    setTitulo(pub.titulo);
    setContenido(pub.contenido);
    setCategoria(pub.categoria);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return;

    try {
      await axios.delete(`/api/foro?id=${id}`);
      setPublicaciones(publicaciones.filter(pub => pub._id !== id));
    } catch (error) {
      console.error("Error al eliminar la publicación:", error);
      setError(error.response?.data?.error || 'Error al eliminar la publicación.');
    }
  };

  const buscarPublicaciones = async () => {
    if (!busqueda.trim() && !categoriaSeleccionada) {
      cargarPublicaciones();
      return;
    }

    try {
      let url = '/api/foro?';
      if (busqueda.trim()) {
        url += `nombre=${busqueda}&`;
      }
      if (categoriaSeleccionada) {
        url += `categoria=${categoriaSeleccionada}`;
      }
      const response = await axios.get(url);
      setPublicaciones(response.data);
    } catch (error) {
      console.error("Error al buscar publicaciones:", error);
      setError('Error al buscar publicaciones.');
    }
  };

  const handleCategoriaClick = (cat) => {
    setCategoriaSeleccionada(cat);
    cargarPublicaciones(cat);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-black py-4 px-4 flex justify-between items-center">
        <div className="w-96 h-24">
          <img src="/Logo cosmoXplora.png" alt="Logo CosmoXplora" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center">
          <span className="text-white mr-4">{displayName}</span>
          <button 
            onClick={toggleDropdown}
            className="text-white focus:outline-none"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-white hover:bg-gray-700"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="h-64 bg-cover bg-center relative" style={{backgroundImage: "url('/bg-foro.jpeg')"}}>
        <div className="h-full bg-black bg-opacity-50 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-white text-center mb-8">Discute los misterios del universo</h1>
          <div className="w-full max-w-4xl flex items-center justify-between px-4">
            <div className="w-2/3 relative">
              <input 
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar temas o miembros"
                className="w-full p-3 bg-gray-800 text-white rounded-lg pr-20"
              />
              <button 
                onClick={buscarPublicaciones}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded"
              >
                Go
              </button>
            </div>
            <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ml-4"
            >
              Nueva publicación
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-3/4">
            {mostrarFormulario && (
              <form onSubmit={manejarPublicacion} className="mb-8 bg-gray-800 bg-opacity-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-4">{editando ? "Editar publicación" : "Nueva publicación"}</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Título de la publicación"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg"
                    required
                  />
                </div>
                <div className="mb-4">
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <textarea
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder="Escribe tu publicación aquí..."
                    className="w-full p-3 bg-gray-700 text-white rounded-lg"
                    rows="4"
                    required
                  />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="flex items-center">
                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mr-4"
                  >
                    {editando ? "Actualizar" : "Publicar"}
                  </button>
                  {editando && (
                    <button 
                      type="button"
                      onClick={() => { setEditando(null); setTitulo(''); setContenido(''); setCategoria(''); setMostrarFormulario(false); }}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            )}
            
            <h2 className="text-2xl font-bold text-white mb-4">Featured</h2>
            {publicaciones.length === 0 ? (
              <p className="text-gray-400">No hay publicaciones para mostrar.</p>
            ) : (
              publicaciones.slice(0, 3).map(pub => (
                <div key={pub._id} className="mb-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-1">{pub.titulo}</h3>
                  <p className="text-gray-400">{pub.contenido.substring(0, 100)}...</p>
                  <p className="text-sm text-gray-500 mt-2">Publicado por: {pub.nombre}</p>
                </div>
              ))
            )}
          </div>

          <div className="md:w-1/4">
            <h2 className="text-2xl font-bold text-white mb-4">Categorías</h2>
            <ul>
              {categorias.map((cat, index) => (
                <li key={index} className="mb-2">
                  <button
                    onClick={() => handleCategoriaClick(cat)}
                    className="w-full text-left p-3 rounded-lg bg-gray-800 bg-opacity-50 text-gray-300 hover:bg-opacity-70 flex items-center"
                  >
                    <span>{cat}</span>
                    <span className="ml-auto text-gray-400">{publicacionesPorCategoria[cat] || 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}