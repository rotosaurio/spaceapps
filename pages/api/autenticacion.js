import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Método ${req.method} no permitido`);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection("usuarios");

    const { action } = req.body;

    if (action === 'login') {
      const { correo, contraseña } = req.body;
      const usuario = await collection.findOne({ correo });

      if (!usuario) {
        return res.status(400).json({ error: "Credenciales inválidas" });
      }

      if (usuario.oauth) {
        return res.status(400).json({ error: "Usuario registrado vía OAuth. Inicia sesión con Google." });
      }

      const passwordMatch = await bcrypt.compare(contraseña, usuario.contraseña);

      if (!passwordMatch) {
        return res.status(400).json({ error: "Credenciales inválidas" });
      }

      const token = jwt.sign(
        { userId: usuario._id, correo: usuario.correo },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({ token, usuario: { id: usuario._id, nombre: usuario.nombre } });
    } else if (action === 'register') {
      const { nombre, correo, contraseña } = req.body;
      const existingUser = await collection.findOne({ correo });

      if (existingUser) {
        return res.status(400).json({ error: "El correo electrónico ya está registrado" });
      }

      const hashedPassword = await bcrypt.hash(contraseña, 10); // Encriptar la contraseña

      await collection.insertOne({
        nombre,
        correo,
        contraseña: hashedPassword,
        oauth: false,
      });

      res.status(201).json({ message: "Usuario registrado exitosamente" });
    } else {
      res.status(400).json({ error: "Acción no válida" });
    }
  } catch (error) {
    console.error("Error en la autenticación:", error);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    await client.close();
  }
}