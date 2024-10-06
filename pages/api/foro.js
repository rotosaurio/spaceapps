import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const database = client.db();
    const foroCollection = database.collection("foro");

    const { method, query } = req;

    if (method === 'GET') {
      const { nombre, categoria } = query;
      let filtro = {};

      if (nombre) {
        filtro.nombre = { $regex: nombre, $options: 'i' };
      }

      if (categoria) {
        filtro.categoria = categoria;
      }

      const publicaciones = await foroCollection.find(filtro).sort({ fecha: -1 }).toArray();
      res.status(200).json(publicaciones);
    } else if (method === 'POST') {
      const { titulo, contenido, nombre, categoria } = req.body;

      if (!titulo || !contenido || !nombre || !categoria) {
        return res.status(400).json({ error: "El título, contenido, nombre y categoría son requeridos." });
      }

      const nuevaPublicacion = {
        nombre,
        titulo,
        contenido,
        categoria,
        fecha: new Date(),
      };

      const result = await foroCollection.insertOne(nuevaPublicacion);

      res.status(201).json({ 
        message: "Publicación creada exitosamente", 
        publicacion: { 
          _id: result.insertedId, 
          ...nuevaPublicacion 
        } 
      });
    } else if (method === 'PUT') {
      const { id } = query;
      const { titulo, contenido, nombre, categoria } = req.body;

      if (!id || !titulo || !contenido || !nombre || !categoria) {
        return res.status(400).json({ error: "ID, título, contenido, nombre y categoría son requeridos." });
      }

      const publicacion = await foroCollection.findOne({ _id: new ObjectId(id) });
      if (!publicacion) {
        return res.status(404).json({ error: "Publicación no encontrada." });
      }

      if (publicacion.nombre !== nombre) {
        return res.status(403).json({ error: "No tienes permiso para actualizar esta publicación." });
      }

      await foroCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { titulo, contenido, categoria, fecha: new Date() } }
      );

      res.status(200).json({ message: "Publicación actualizada exitosamente" });
    } else if (method === 'DELETE') {
      const { id } = query;
      const { nombre } = req.body;

      if (!id || !nombre) {
        return res.status(400).json({ error: "ID y nombre son requeridos." });
      }

      const publicacion = await foroCollection.findOne({ _id: new ObjectId(id) });
      if (!publicacion) {
        return res.status(404).json({ error: "Publicación no encontrada." });
      }

      if (publicacion.nombre !== nombre) {
        return res.status(403).json({ error: "No tienes permiso para eliminar esta publicación." });
      }

      await foroCollection.deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ message: "Publicación eliminada exitosamente" });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Método ${method} no permitido`);
    }
  } catch (error) {
    console.error("Error en la API del foro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    await client.close();
  }
}