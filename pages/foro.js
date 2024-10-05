import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export default function Foro() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);
  const [userId, setUserId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [userName, setUserName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    cargarPublicaciones();
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwt.decode(token);
      setUserId(decodedToken.userId);
      setUserName(decodedToken.nombre || 'Usuario'); // Usa 'Usuario' como fallback si no hay nombre
    }
  }, []);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (isDropdownOpen && !e.target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', closeDropdown);

    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  }, [isDropdownOpen]);

  const cargarPublicaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/foro', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPublicaciones(response.data);
      const decodedToken = jwt.decode(token);
      setUserId(decodedToken.userId);
      const userResponse = await axios.get(`/api/usuario/${decodedToken.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserName(userResponse.data.nombre);
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (editando) {
        await axios.put('/api/foro', { id: editando, titulo, contenido }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEditando(null);
      } else {
        await axios.post('/api/foro', { titulo, contenido }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setTitulo('');
      setContenido('');
      setMostrarFormulario(false);
      cargarPublicaciones();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al crear/editar la publicación');
    }
  };

  const handleEditar = (pub) => {
    setEditando(pub._id);
    setTitulo(pub.titulo);
    setContenido(pub.contenido);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/foro', {
        headers: { Authorization: `Bearer ${token}` },
        data: { id }
      });
      cargarPublicaciones();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al eliminar la publicación');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const publicacionesFiltradas = publicaciones.filter(pub =>
    pub.autor.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Foro</h1>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {userName || 'Usuario'}
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <p className="block px-4 py-2 text-sm text-gray-700">Nombre: {userName || 'Usuario'}</p>
                <p className="block px-4 py-2 text-sm text-gray-700">ID: {userId}</p>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {mostrarFormulario && (
          <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título"
              className="w-full mb-4 p-2 border rounded"
              required
            />
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Contenido"
              className="w-full mb-4 p-2 border rounded"
              rows="4"
              required
            />
            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              {editando ? 'Actualizar' : 'Publicar'}
            </button>
          </form>
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre de usuario"
          className="w-full mb-4 p-2 border rounded"
        />

        <div className="space-y-4">
          {publicacionesFiltradas.map((pub) => (
            <div key={pub._id} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <h3 className="font-bold text-xl mb-2">{pub.titulo}</h3>
              <p className="text-gray-700 text-base mb-4">{pub.contenido}</p>
              <div className="flex justify-between items-center">
                <small className="text-gray-500">Autor: {pub.autor}, Fecha: {new Date(pub.fechaCreacion).toLocaleString()}</small>
                {pub.autorId === userId && (
                  <div>
                    <button onClick={() => handleEditar(pub)} className="text-blue-500 hover:text-blue-700 mr-2">Editar</button>
                    <button onClick={() => handleEliminar(pub._id)} className="text-red-500 hover:text-red-700">Eliminar</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}