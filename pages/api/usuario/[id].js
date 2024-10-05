import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const database = client.db();
    const usuariosCollection = database.collection("usuarios");

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

    const { id } = req.query;
    if (id !== decodedToken.userId) {
      return res.status(403).json({ error: "No tienes permiso para acceder a esta información" });
    }

    const usuario = await usuariosCollection.findOne({ _id: new ObjectId(id) });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json({ nombre: usuario.nombre });
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    await client.close();
  }
}
