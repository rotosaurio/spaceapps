import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const database = client.db();
    const foroCollection = database.collection("foro");

    const { method, query } = req;

    if (method === 'POST') {
      const { titulo, contenido, nombre } = req.body;

      if (!titulo || !contenido || !nombre) {
        return res.status(400).json({ error: "El título, contenido y nombre son requeridos." });
      }

      const nuevaPublicacion = {
        nombre,
        titulo,
        contenido,
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
    } else if (method === 'GET') {
      const { nombre } = query;
      let publicaciones;

      if (nombre) {
        publicaciones = await foroCollection.find({
          nombre: { $regex: nombre, $options: 'i' }
        }).sort({ fecha: -1 }).toArray();
      } else {
        publicaciones = await foroCollection.find().sort({ fecha: -1 }).toArray();
      }

      res.status(200).json(publicaciones);
    } else if (method === 'PUT') {
      const { id } = query;
      const { titulo, contenido, nombre } = req.body;

      if (!id || !titulo || !contenido || !nombre) {
        return res.status(400).json({ error: "ID, título, contenido y nombre son requeridos." });
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
        { $set: { titulo, contenido, fecha: new Date() } }
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
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      res.status(405).end(`Método ${method} no permitido`);
    }
  } catch (error) {
    console.error("Error en la API del foro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    await client.close();
  }
}