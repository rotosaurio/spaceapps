import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const database = client.db();
    const foroCollection = database.collection("foro");
    const usuariosCollection = database.collection("usuarios");

    // Verificar el token de autenticación
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "No se proporcionó token de autenticación" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: "Token inválido" });
    }

    // Obtener el usuario de la base de datos
    const usuario = await usuariosCollection.findOne({ _id: new ObjectId(decodedToken.userId) });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (req.method === 'POST') {
      const { titulo, contenido } = req.body;
      const nuevaPublicacion = {
        titulo,
        contenido,
        autor: usuario.nombre,
        autorId: usuario._id.toString(),
        fechaCreacion: new Date()
      };
      const result = await foroCollection.insertOne(nuevaPublicacion);
      res.status(201).json({ message: "Publicación creada exitosamente", id: result.insertedId });
    } else if (req.method === 'GET') {
      const publicaciones = await foroCollection.find().toArray();
      res.status(200).json(publicaciones);
    } else if (req.method === 'PUT') {
      const { id, titulo, contenido } = req.body;
      const publicacion = await foroCollection.findOne({ _id: new ObjectId(id) });
      
      if (!publicacion || publicacion.autorId !== usuario._id.toString()) {
        return res.status(403).json({ error: "No tienes permiso para editar esta publicación" });
      }
      
      await foroCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { titulo, contenido } }
      );
      res.status(200).json({ message: "Publicación actualizada exitosamente" });
    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      const publicacion = await foroCollection.findOne({ _id: new ObjectId(id) });
      
      if (!publicacion || publicacion.autorId !== usuario._id.toString()) {
        return res.status(403).json({ error: "No tienes permiso para eliminar esta publicación" });
      }
      
      await foroCollection.deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ message: "Publicación eliminada exitosamente" });
    } else {
      res.status(405).json({ error: "Método no permitido" });
    }
  } catch (error) {
    console.error("Error en la operación del foro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    await client.close();
  }
}
