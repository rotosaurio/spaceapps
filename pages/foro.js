import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { signOut, useSession } from "next-auth/react";

export default function Foro() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    try {
      const response = await axios.get('/api/foro');
      setPublicaciones(response.data);
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
      setError('Error al cargar publicaciones.');
    }
  };

  const manejarPublicacion = async (e) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim() || !contenido.trim()) {
      setError('El título y el contenido no pueden estar vacíos.');
      return;
    }

    const nombreUsuario = session?.user?.name || 'Usuario Anónimo';

    try {
      const data = { titulo, contenido, nombre: nombreUsuario };

      if (editando) {
        await axios.put(`/api/foro?id=${editando._id}`, data);
        setPublicaciones(publicaciones.map(pub => 
          pub._id === editando._id ? { ...pub, titulo, contenido } : pub
        ));
        setEditando(null);
      } else {
        const response = await axios.post('/api/foro', data);
        setPublicaciones([response.data.publicacion, ...publicaciones]);
      }

      setTitulo('');
      setContenido('');
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
    if (!busqueda.trim()) {
      cargarPublicaciones();
      return;
    }

    try {
      const response = await axios.get(`/api/foro?nombre=${busqueda}`);
      setPublicaciones(response.data);
    } catch (error) {
      console.error("Error al buscar publicaciones:", error);
      setError('Error al buscar publicaciones.');
    }
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
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center">
      <div className="w-full max-w-4xl px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Foro</h1>
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {session?.user?.name || 'Usuario Anónimo'}
              <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            {mostrarFormulario ? "Cerrar Formulario" : "Añadir Publicación"}
          </button>
          <div className="flex items-center">
            <input 
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre de usuario"
              className="w-full p-2 border rounded mr-2"
            />
            <button 
              onClick={buscarPublicaciones}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Buscar
            </button>
          </div>
        </div>

        {mostrarFormulario && (
          <form onSubmit={manejarPublicacion} className="mb-6 bg-white p-6 rounded shadow">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titulo">
                Título
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título de la publicación"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contenido">
                Contenido
              </label>
              <textarea
                id="contenido"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Escribe tu publicación aquí..."
                className="w-full p-2 border rounded"
                rows="4"
                required
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex items-center">
              <button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
              >
                {editando ? "Actualizar Publicación" : "Publicar"}
              </button>
              {editando && (
                <button 
                  type="button"
                  onClick={() => { setEditando(null); setTitulo(''); setContenido(''); setMostrarFormulario(false); }}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}

        <div>
          {publicaciones.length === 0 ? (
            <p className="text-gray-700">No hay publicaciones para mostrar.</p>
          ) : (
            publicaciones.map(pub => (
              <div key={pub._id} className="mb-4 p-4 bg-white shadow-md rounded">
                <h2 className="text-2xl font-bold mb-2">{pub.titulo}</h2>
                <p className="text-gray-700 mb-2">{pub.contenido}</p>
                <p className="text-sm text-gray-500">Publicado por: {pub.nombre} el {new Date(pub.fecha).toLocaleString()}</p>
                <div className="flex justify-end mt-2">
                  {pub.nombre === session?.user?.name && (
                    <div>
                      <button 
                        onClick={() => handleEditar(pub)} 
                        className="text-blue-500 hover:text-blue-700 mr-4"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleEliminar(pub._id)} 
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}